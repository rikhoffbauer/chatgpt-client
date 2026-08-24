import { ProtocolError } from '../errors.js'
import { createChromeSession, type ChromeSession } from './chrome-solver.js'
import type { Fetch, HeaderInput } from '../types.js'

/** Options for the isolated real-Chrome fetch bridge. */
export interface BrowserFetchOptions {
  maxResponseBytes?: number
}

/** A fetch function with an explicit lifecycle for its Chrome helper. */
export interface BrowserFetch extends Fetch {
  close(): Promise<void>
}

interface BrowserFetchResult {
  status?: unknown
  statusText?: unknown
  headers?: unknown
  body?: unknown
  tooLarge?: unknown
}

const DEFAULT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024
const CHATGPT_ORIGIN = 'https://chatgpt.com'

/** Creates a lazy fetch that executes same-origin requests in real Chrome. */
export function createBrowserFetch(options: BrowserFetchOptions = {}): BrowserFetch {
  const maxResponseBytes = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES
  let sessionPromise: Promise<ChromeSession> | undefined
  let closed = false

  const fetchInBrowser = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    if (closed) throw new ProtocolError('Browser fetch is closed', { code: 'BROWSER_FETCH_CLOSED' })
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    if (url.origin !== CHATGPT_ORIGIN) {
      throw new ProtocolError('Browser fetch refuses cross-origin URL: ' + url.origin, { code: 'BROWSER_FETCH_CROSS_ORIGIN' })
    }
    const method = init.method ?? (input instanceof Request ? input.method : 'GET')
    const headers = Object.fromEntries(new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined)))
    const body = encodeBody(init.body)
    const signal = init.signal
    signal?.throwIfAborted()

    sessionPromise ??= createChromeSession({
      url: CHATGPT_ORIGIN + '/',
      headless: true,
      ...(signal === undefined || signal === null ? {} : { signal }),
    }).catch((error) => {
      sessionPromise = undefined
      throw error
    })
    const session = await sessionPromise
    const result = await abortable(evaluateFetch(session, {
      url: url.href,
      method,
      headers,
      ...(body === undefined ? {} : { body }),
      maxResponseBytes,
    }), signal)
    if (result.tooLarge === true) {
      throw new ProtocolError('Browser response exceeded ' + maxResponseBytes + ' bytes', {
        code: 'RESPONSE_BODY_TOO_LARGE',
        details: { maxBytes: maxResponseBytes },
      })
    }
    if (typeof result.status !== 'number' || !Number.isInteger(result.status) || result.status < 100 || result.status > 599) {
      throw new ProtocolError('Browser fetch returned an invalid status', { code: 'BROWSER_FETCH_INVALID_RESPONSE' })
    }
    if (typeof result.body !== 'string') throw new ProtocolError('Browser fetch returned no response body', { code: 'BROWSER_FETCH_INVALID_RESPONSE' })
    const responseHeaders = new Headers()
    if (Array.isArray(result.headers)) {
      for (const pair of result.headers) {
        if (Array.isArray(pair) && pair.length === 2 && typeof pair[0] === 'string' && typeof pair[1] === 'string') responseHeaders.append(pair[0], pair[1])
      }
    }
    return new Response(Buffer.from(result.body, 'base64'), {
      status: result.status,
      statusText: typeof result.statusText === 'string' ? result.statusText : undefined,
      headers: responseHeaders,
    })
  }

  fetchInBrowser.close = async (): Promise<void> => {
    closed = true
    const session = await sessionPromise?.catch(() => undefined)
    await session?.close()
    sessionPromise = undefined
  }

  return fetchInBrowser
}

async function evaluateFetch(session: ChromeSession, request: {
  url: string
  method: string
  headers: HeaderInput
  body?: string
  maxResponseBytes: number
}): Promise<BrowserFetchResult> {
  const expression = [
    '(async () => {',
    '  const request = ' + JSON.stringify(request) + ';',
    "  const init = { method: request.method, headers: request.headers, credentials: 'include', redirect: 'manual' };",
    "  if (request.body !== undefined) init.body = Uint8Array.from(atob(request.body), character => character.charCodeAt(0));",
    '  const response = await fetch(request.url, init);',
    '  const reader = response.body?.getReader();',
    "  if (reader === undefined) return { status: response.status, statusText: response.statusText, headers: Array.from(response.headers.entries()), body: '' };",
    '  const chunks = []; let total = 0;',
    '  while (true) { const next = await reader.read(); if (next.done) break; total += next.value.byteLength; if (total > request.maxResponseBytes) { await reader.cancel(); return { tooLarge: true }; } chunks.push(next.value); }',
    '  const bytes = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }',
    "  let binary = ''; const chunkSize = 0x8000;",
    "  for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)));",
    "  return { status: response.status, statusText: response.statusText, headers: Array.from(response.headers.entries()), body: btoa(binary) };",
    '})()',
  ].join('\n')
  return session.evaluate<BrowserFetchResult>(expression, true)
}

function encodeBody(body: BodyInit | null | undefined): string | undefined {
  if (body === undefined || body === null) return undefined
  if (typeof body === 'string') return Buffer.from(body, 'utf8').toString('base64')
  if (body instanceof ArrayBuffer) return Buffer.from(body).toString('base64')
  if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength).toString('base64')
  throw new ProtocolError('Browser fetch only supports string and byte-array request bodies', { code: 'BROWSER_FETCH_UNSUPPORTED_BODY' })
}

async function abortable<T>(promise: Promise<T>, signal: AbortSignal | null | undefined): Promise<T> {
  if (signal === undefined || signal === null) return promise
  if (signal.aborted) {
    await promise.catch(() => undefined)
    throw signal.reason ?? new Error('The operation was aborted')
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => reject(signal.reason ?? new Error('The operation was aborted'))
    signal.addEventListener('abort', onAbort, { once: true })
    void promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}
