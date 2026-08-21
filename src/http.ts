import { randomUUID } from 'node:crypto'
import { deadlineSignal, sleep } from './abort.js'
import { deviceId, type Auth } from './auth.js'
import { defaultConfig, type ClientConfig, type RetryPolicy, resolveApiBase } from './config.js'
import { HttpError, ProtocolError, TimeoutError, errorMessage } from './errors.js'
import type { Logger } from './logger.js'
import { noopLogger } from './logger.js'
import type { Fetch, HeaderInput, HttpMethod, JsonValue, Persona, StreamFormat, UnknownRecord } from './types.js'

export { HttpError, resolveApiBase }
export { ndjson } from './streaming/ndjson.js'
export { readLines as lines } from './streaming/lines.js'
export { sseEvents } from './streaming/sse.js'

export const CHROME_VERSION = '140.0.0.0'
export const CHROME_UA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36`
export const DESKTOP_UA = (version = '1.0.0'): string => `Codex Desktop/${version} (Mac OS; arm64)`

export type QueryValue = string | number | boolean | null | JsonValue[] | UnknownRecord | undefined
export type Query = Record<string, QueryValue>

/** Advanced request controls. `sendAuth: false` is required for external signed URLs; retries default to idempotent methods only. */
export interface RequestOptions {
  query?: Query
  body?: unknown
  headers?: HeaderInput
  signal?: AbortSignal
  rawBody?: boolean
  retry?: boolean
  retryOn401?: boolean
  sendAuth?: boolean
  timeoutMs?: number
}

export interface StreamOptions extends RequestOptions {
  format?: StreamFormat
}

/** Finite cancellation, deadline, and byte-bound options for consuming a response body. */
export interface ResponseReadOptions {
  maxBytes?: number
  operation?: string
  signal?: AbortSignal
  timeoutMs?: number
}

/** Dependencies, authentication, persona, and finite runtime settings for {@link Http}. */
export interface HttpOptions {
  auth: Auth
  baseUrl?: string
  persona?: Persona
  appVersion?: string
  fetchImpl?: Fetch
  logger?: Logger
  config?: Partial<Omit<ClientConfig, 'retry' | 'limits'>> & {
    retry?: Partial<RetryPolicy>
    limits?: Partial<ClientConfig['limits']>
  }
  deviceIdProvider?: () => Promise<string>
}

/** Expand `/conversation/{conversation_id}` against a params object. */
export function expandPath(template: string, params: Record<string, unknown> = {}): string {
  const missing: string[] = []
  const path = template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key]
    if (value === null || value === undefined) {
      missing.push(key)
      return ''
    }
    return encodeURIComponent(String(value))
  })
  if (missing.length > 0) throw new ProtocolError(`Missing path parameter(s) for ${template}: ${missing.join(', ')}`, { code: 'MISSING_PATH_PARAMETER' })
  return path
}

/** Encodes scalar, repeated, and JSON query values while omitting nullish entries. */
export function buildQuery(query: Query | undefined): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, typeof item === 'object' ? JSON.stringify(item) : String(item))
    } else {
      params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    }
  }
  return params.toString()
}

/**
 * Low-level authenticated transport with token refresh, finite deadlines, bounded bodies, and idempotent retries.
 * Use `sendAuth: false` whenever a request targets an external signed URL.
 */
export class Http {
  readonly auth: Auth
  readonly baseUrl: string
  readonly persona: Persona
  readonly appVersion: string
  readonly config: ClientConfig

  private readonly fetchImpl: Fetch
  private readonly logger: Logger
  private readonly deviceIdProvider: () => Promise<string>
  private cachedDeviceId?: string

  constructor(options: HttpOptions) {
    this.auth = options.auth
    this.config = defaultConfig({
      ...options.config,
      ...(options.baseUrl === undefined ? {} : { baseUrl: options.baseUrl }),
      ...(options.persona === undefined ? {} : { persona: options.persona }),
      ...(options.appVersion === undefined ? {} : { appVersion: options.appVersion }),
    })
    this.baseUrl = this.config.baseUrl
    this.persona = this.config.persona
    this.appVersion = this.config.appVersion
    this.fetchImpl = options.fetchImpl ?? fetch
    this.logger = options.logger ?? noopLogger
    this.deviceIdProvider = options.deviceIdProvider ?? (() => deviceId(this.config.statePath))
  }

  url(path: string, query?: Query): string {
    const absolute = /^https?:\/\//i.test(path)
    const base = absolute ? path : `${this.baseUrl}/${path.replace(/^\/+/, '')}`
    const queryString = buildQuery(query)
    if (queryString === '') return base
    return base.includes('?') ? `${base}&${queryString}` : `${base}?${queryString}`
  }

  async headers(extra: HeaderInput = {}, options: { sendAuth?: boolean } = {}): Promise<Headers> {
    const sendAuth = options.sendAuth ?? true
    const headers = new Headers()
    if (sendAuth) {
      await this.auth.ensureFresh()
      this.cachedDeviceId ??= await this.deviceIdProvider()
      headers.set('Authorization', `Bearer ${this.auth.accessToken}`)
      if (this.auth.accountId !== null) headers.set('ChatGPT-Account-Id', this.auth.accountId)
      headers.set('OAI-Language', 'en')
      headers.set('oai-did', this.cachedDeviceId)
      headers.set('Accept-Language', 'en-US,en;q=0.9')
      headers.set('Referer', 'https://chatgpt.com/')
      headers.set('Origin', 'https://chatgpt.com')
      const major = CHROME_VERSION.split('.')[0] ?? '140'
      if (this.persona === 'desktop') {
        headers.set('originator', 'Codex Desktop')
        headers.set('User-Agent', DESKTOP_UA(this.appVersion))
      } else {
        headers.set('originator', 'Codex Browser')
        headers.set('User-Agent', CHROME_UA)
        headers.set('sec-ch-ua', `"Chromium";v="${major}", "Google Chrome";v="${major}", "Not=A?Brand";v="24"`)
        headers.set('sec-ch-ua-mobile', '?0')
        headers.set('sec-ch-ua-platform', '"macOS"')
      }
    }
    headers.set('Accept', '*/*')
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined) headers.delete(key)
      else headers.set(key, value)
    }
    return headers
  }

  /** Sends one request, refreshing auth once on 401 and retrying only when allowed by the bounded policy. */
  async request(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<Response> {
    const url = this.url(path, options.query)
    const retryPolicy = this.config.retry
    const retryAllowed = options.retry ?? isIdempotent(method)
    const maxAttempts = retryAllowed ? retryPolicy.maxAttempts : 1
    let refreshed = false
    let lastError: unknown

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const deadline = deadlineSignal(`${method} ${url}`, options.timeoutMs ?? this.config.limits.requestTimeoutMs, options.signal)
      try {
        const headers = await this.headers(options.headers, { sendAuth: options.sendAuth })
        const init: RequestInit = { method, headers, signal: deadline.signal }
        const body = toRequestBody(options.body, options.rawBody ?? false, headers)
        if (body !== undefined) init.body = body

        const requestId = randomUUID()
        this.logger.debug('HTTP request', { requestId, method, url, attempt, maxAttempts })
        const response = await this.fetchImpl(url, init)
        this.logger.debug('HTTP response', { requestId, method, url, status: response.status, attempt })

        if (response.status === 401 && (options.retryOn401 ?? true) && !refreshed && options.sendAuth !== false) {
          refreshed = true
          await response.body?.cancel().catch(() => undefined)
          await this.auth.refresh()
          attempt -= 1
          continue
        }

        if (attempt < maxAttempts && retryPolicy.retryStatuses.has(response.status)) {
          const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'))
          await response.body?.cancel().catch(() => undefined)
          await sleep(retryDelay(attempt, retryPolicy, retryAfterMs), options.signal)
          continue
        }
        return response
      } catch (error) {
        lastError = error
        if (deadline.signal.aborted) {
          const reason = deadline.signal.reason
          if (reason instanceof TimeoutError && attempt < maxAttempts) {
            await sleep(retryDelay(attempt, retryPolicy), options.signal)
            continue
          }
          throw reason ?? error
        }
        if (attempt >= maxAttempts) throw error
        await sleep(retryDelay(attempt, retryPolicy), options.signal)
      } finally {
        deadline.cleanup()
      }
    }
    throw lastError ?? new Error('HTTP request failed without an error')
  }

  /** Reads a bounded response body, throws {@link HttpError} for non-success status, and decodes JSON when possible. */
  async json<T = unknown>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const response = await this.request(method, path, options)
    const text = await this.readText(response, {
      operation: `${method} ${this.url(path, options.query)} response body`,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
      ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    })
    if (!response.ok) throw httpError(method, this.url(path, options.query), response, text)
    if (text === '') return null as T
    try {
      return JSON.parse(text) as T
    } catch {
      return text as T
    }
  }

  get<T = unknown>(path: string, query?: Query, options: Omit<RequestOptions, 'query'> = {}): Promise<T> {
    return this.json<T>('GET', path, { ...options, query })
  }

  post<T = unknown>(path: string, body: unknown = {}, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.json<T>('POST', path, { ...options, body })
  }

  put<T = unknown>(path: string, body: unknown, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.json<T>('PUT', path, { ...options, body })
  }

  patch<T = unknown>(path: string, body: unknown = {}, options: Omit<RequestOptions, 'body'> = {}): Promise<T> {
    return this.json<T>('PATCH', path, { ...options, body })
  }

  delete<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.json<T>('DELETE', path, options)
  }

  /** Reads response bytes with a finite deadline and configured or explicit maximum size. */
  async readBytes(response: Response, options: ResponseReadOptions = {}): Promise<Uint8Array> {
    const timeoutMs = options.timeoutMs ?? this.config.limits.requestTimeoutMs
    const deadline = deadlineSignal(options.operation ?? 'HTTP response body', timeoutMs, options.signal)
    try {
      return await readResponseBytes(response, options.maxBytes ?? this.config.limits.responseBodyBytes, deadline.signal)
    } catch (error) {
      if (deadline.signal.aborted) throw deadline.signal.reason ?? error
      throw error
    } finally {
      deadline.cleanup()
    }
  }

  async readText(response: Response, options: ResponseReadOptions = {}): Promise<string> {
    const bytes = await this.readBytes(response, options)
    return new TextDecoder().decode(bytes)
  }

  async stream(method: HttpMethod, path: string, options: StreamOptions = {}): Promise<Response> {
    const accept = options.format === 'ndjson' ? 'application/x-ndjson' : 'text/event-stream'
    const response = await this.request(method, path, {
      ...options,
      headers: { Accept: accept, ...options.headers },
    })
    if (!response.ok) {
      const text = await this.readText(response, {
        operation: `${method} ${this.url(path, options.query)} error body`,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
      })
      throw httpError(method, this.url(path, options.query), response, text)
    }
    if (response.body === null) throw new ProtocolError('Streaming response had no body', { code: 'MISSING_RESPONSE_BODY' })
    return response
  }
}

export async function readResponseBytes(response: Response, maxBytes: number, signal?: AbortSignal): Promise<Uint8Array> {
  if (response.body === null) return new Uint8Array()
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  let completed = false
  const onAbort = (): void => {
    void reader.cancel(signal?.reason).catch(() => undefined)
  }
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    while (true) {
      signal?.throwIfAborted()
      const { done, value } = await reader.read()
      signal?.throwIfAborted()
      if (done) {
        completed = true
        break
      }
      total += value.byteLength
      if (total > maxBytes) {
        throw new ProtocolError(`Response body exceeded ${maxBytes} bytes`, {
          code: 'RESPONSE_BODY_TOO_LARGE',
          details: { maxBytes },
        })
      }
      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel(error).catch(() => undefined)
    throw error
  } finally {
    signal?.removeEventListener('abort', onAbort)
    if (!completed) await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }

  const result = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export async function readResponseText(response: Response, maxBytes: number, signal?: AbortSignal): Promise<string> {
  return new TextDecoder().decode(await readResponseBytes(response, maxBytes, signal))
}

function toRequestBody(body: unknown, rawBody: boolean, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined
  if (
    rawBody ||
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  ) {
    return body as BodyInit
  }
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  return JSON.stringify(body)
}

function isIdempotent(method: HttpMethod): boolean {
  return method === 'GET' || method === 'HEAD' || method === 'PUT' || method === 'DELETE'
}

function retryDelay(attempt: number, policy: RetryPolicy, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) return Math.min(retryAfterMs, policy.maxDelayMs)
  const exponential = Math.min(policy.baseDelayMs * 2 ** Math.max(0, attempt - 1), policy.maxDelayMs)
  return Math.round(exponential * (0.75 + Math.random() * 0.5))
}

function parseRetryAfter(value: string | null): number | undefined {
  if (value === null) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1_000)
  const date = Date.parse(value)
  if (Number.isNaN(date)) return undefined
  return Math.max(0, date - Date.now())
}

function httpError(method: HttpMethod, url: string, response: Response, text: string): HttpError {
  return new HttpError({
    method,
    url,
    status: response.status,
    bodyPreview: text.slice(0, 1_200),
    ...(parseRetryAfter(response.headers.get('retry-after')) === undefined
      ? {}
      : { retryAfterMs: parseRetryAfter(response.headers.get('retry-after')) as number }),
  })
}

export function describeFetchFailure(error: unknown): string {
  return errorMessage(error)
}
