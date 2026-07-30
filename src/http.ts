// @ts-nocheck
// HTTP transport.
//
// Collapses two of the app's layers into one place:
//   - renderer (app-initial-*.js, class Yf): route template + `X-OpenAI-Attach-*` markers
//   - main process (.vite/build/window-all-closed-*.js: FN/JV/XV/ZV/QV/$V): base URL,
//     Authorization, ChatGPT-Account-Id, User-Agent, originator, and the SSE/NDJSON readers
//
// Since we have the token in-process, we set the final headers directly instead of
// emitting markers for someone else to swap.

import { deviceId } from './auth.js'

export const PROD_API_BASE = 'https://chatgpt.com/backend-api'
export const DEV_API_BASE = 'http://localhost:8000/api'

export const CHROME_VERSION = '140.0.0.0'
export const CHROME_UA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`
export const DESKTOP_UA = (version = '1.0.0') => `Codex Desktop/${version} (Mac OS; arm64)`

export function resolveApiBase(override) {
  const explicit = override ?? process.env.CODEX_API_BASE_URL
  if (explicit && explicit.trim()) return explicit.replace(/\/+$/, '')
  return (process.env.CODEX_API_ENDPOINT ?? '').toLowerCase() === 'localhost' ? DEV_API_BASE : PROD_API_BASE
}

export class HttpError extends Error {
  constructor(method, path, status, body) {
    super(`${method} ${path} -> ${status}\n${String(body).slice(0, 1200)}`)
    this.name = 'HttpError'
    this.status = status
    this.method = method
    this.path = path
    this.body = body
  }
}

/** Expand `/conversation/{conversation_id}` against a params object. */
export function expandPath(template, params = {}) {
  const missing = []
  const path = template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key]
    if (value == null) missing.push(key)
    return encodeURIComponent(String(value))
  })
  if (missing.length) throw new Error(`Missing path parameter(s) for ${template}: ${missing.join(', ')}`)
  return path
}

export function buildQuery(query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, typeof item === 'object' ? JSON.stringify(item) : String(item))
    } else {
      params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    }
  }
  return params.toString()
}

export class Http {
  /**
   * @param {object} opts
   * @param {import('./auth.js').Auth} opts.auth
   * @param {string} [opts.baseUrl]
   * @param {'browser'|'desktop'} [opts.persona] which of the app's two client identities to present
   */
  constructor({ auth, baseUrl, persona = 'browser', appVersion = '1.0.0', fetchImpl = fetch } = {}) {
    this.auth = auth
    this.baseUrl = resolveApiBase(baseUrl)
    this.persona = persona
    this.appVersion = appVersion
    this.fetch = fetchImpl
    this.deviceId = null
  }

  url(path, query) {
    const absolute = /^https?:\/\//i.test(path)
    const base = absolute ? path : `${this.baseUrl}/${path.replace(/^\/+/, '')}`
    const qs = buildQuery(query)
    if (!qs) return base
    return base.includes('?') ? `${base}&${qs}` : `${base}?${qs}`
  }

  // app-initial-*.js : Sya()/wya()/Tya() — the header set the renderer asks for, already
  // resolved to real credentials the way the main process would have.
  async headers(extra = {}) {
    this.deviceId ??= await deviceId()
    const major = CHROME_VERSION.split('.')[0]
    const persona =
      this.persona === 'desktop'
        ? { originator: 'Codex Desktop', 'User-Agent': DESKTOP_UA(this.appVersion) }
        : {
            originator: 'Codex Browser',
            'User-Agent': CHROME_UA,
            'sec-ch-ua': `"Chromium";v="${major}", "Google Chrome";v="${major}", "Not=A?Brand";v="24"`,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
          }
    const headers = {
      Authorization: `Bearer ${this.auth.accessToken}`,
      'OAI-Language': 'en',
      'oai-did': this.deviceId,
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://chatgpt.com/',
      Origin: 'https://chatgpt.com',
      ...persona,
    }
    if (this.auth.accountId) headers['ChatGPT-Account-Id'] = this.auth.accountId
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined) delete headers[key]
      else headers[key] = value
    }
    return headers
  }

  /** Raw request. Refreshes the token and replays exactly once on 401, like the main process. */
  async request(method, path, { query, body, headers = {}, signal, raw = false, retryOn401 = true } = {}) {
    const init = { method, headers: await this.headers(headers), signal }
    if (body !== undefined && body !== null) {
      if (raw || typeof body === 'string' || body instanceof Uint8Array || body instanceof ArrayBuffer) {
        init.body = body
      } else {
        init.body = JSON.stringify(body)
        init.headers['Content-Type'] ??= 'application/json'
      }
    }
    const res = await this.fetch(this.url(path, query), init)
    if (res.status === 401 && retryOn401) {
      await this.auth.refresh()
      return this.request(method, path, { query, body, headers, signal, raw, retryOn401: false })
    }
    return res
  }

  /** Request expecting JSON; throws HttpError on a non-2xx. */
  async json(method, path, opts = {}) {
    const res = await this.request(method, path, opts)
    const text = await res.text()
    if (!res.ok) throw new HttpError(method, path, res.status, text)
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  get(path, query, opts) {
    return this.json('GET', path, { ...opts, query })
  }

  post(path, body, opts) {
    return this.json('POST', path, { ...opts, body: body ?? {} })
  }

  put(path, body, opts) {
    return this.json('PUT', path, { ...opts, body })
  }

  patch(path, body, opts) {
    return this.json('PATCH', path, { ...opts, body: body ?? {} })
  }

  delete(path, opts) {
    return this.json('DELETE', path, opts)
  }

  /** Streaming request; returns the Response so the caller can pick a decoder. */
  async stream(method, path, opts = {}) {
    const accept = opts.format === 'ndjson' ? 'application/x-ndjson' : 'text/event-stream'
    const res = await this.request(method, path, { ...opts, headers: { Accept: accept, ...opts.headers } })
    if (!res.ok) throw new HttpError(method, path, res.status, await res.text())
    return res
  }
}

/** Split a byte stream into lines without buffering the whole body. */
export async function* lines(res) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buf.indexOf('\n')) !== -1) {
      yield buf.slice(0, idx).replace(/\r$/, '')
      buf = buf.slice(idx + 1)
    }
  }
  if (buf) yield buf
}

/** SSE reader — mirrors the $b parser in the main process. */
export async function* sseEvents(res) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const chunk = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      let event = null
      const data = []
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).trim())
      }
      if (data.length) yield { event, data: data.join('\n') }
    }
  }
}

/** NDJSON reader — mirrors Qb in the main process (used by the file-upload stream). */
export async function* ndjson(res) {
  for await (const line of lines(res)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      yield JSON.parse(trimmed)
    } catch {
      yield { raw: trimmed }
    }
  }
}
