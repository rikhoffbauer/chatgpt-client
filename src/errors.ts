import type { HttpMethod, JsonValue } from './types.js'

/** JSON-safe error shape for structured CLI and service output. */
export interface SerializedError {
  name: string
  code: string
  message: string
  details?: JsonValue
}

/** Base error with a stable machine-readable code and optional JSON details. */
export class ClientError extends Error {
  readonly code: string
  readonly details?: JsonValue

  constructor(message: string, options: { code?: string; cause?: unknown; details?: JsonValue } = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause })
    this.name = new.target.name
    this.code = options.code ?? 'CLIENT_ERROR'
    if (options.details !== undefined) this.details = options.details
  }
}

export class ConfigurationError extends ClientError {
  constructor(message: string, options: { cause?: unknown; details?: JsonValue } = {}) {
    super(message, { ...options, code: 'CONFIGURATION_ERROR' })
  }
}

export class AuthError extends ClientError {
  constructor(message: string, options: { cause?: unknown; details?: JsonValue; code?: string } = {}) {
    super(message, { ...options, code: options.code ?? 'AUTH_ERROR' })
  }
}

export class ProtocolError extends ClientError {
  constructor(message: string, options: { cause?: unknown; details?: JsonValue; code?: string } = {}) {
    super(message, { ...options, code: options.code ?? 'PROTOCOL_ERROR' })
  }
}

export class TimeoutError extends ClientError {
  readonly timeoutMs: number

  constructor(operation: string, timeoutMs: number, options: { cause?: unknown } = {}) {
    super(`${operation} timed out after ${timeoutMs} ms`, {
      ...options,
      code: 'TIMEOUT',
      details: { operation, timeoutMs },
    })
    this.timeoutMs = timeoutMs
  }
}

export class QueueOverflowError extends ClientError {
  constructor(name: string, maxSize: number) {
    super(`${name} exceeded its maximum queue size of ${maxSize}`, {
      code: 'QUEUE_OVERFLOW',
      details: { name, maxSize },
    })
  }
}

export class ProcessExitedError extends ClientError {
  constructor(command: string, code: number | null, signal: NodeJS.Signals | null) {
    super(`${command} exited before completing pending requests`, {
      code: 'PROCESS_EXITED',
      details: { command, code, signal },
    })
  }
}

export class HttpError extends ClientError {
  readonly method: HttpMethod
  readonly url: string
  readonly status: number
  readonly bodyPreview: string
  readonly retryAfterMs?: number

  constructor(options: {
    method: HttpMethod
    url: string
    status: number
    bodyPreview?: string
    retryAfterMs?: number
    cause?: unknown
  }) {
    const bodyPreview = options.bodyPreview ?? ''
    super(`${options.method} ${redactUrl(options.url)} returned HTTP ${options.status}${bodyPreview ? `: ${bodyPreview}` : ''}`, {
      code: 'HTTP_ERROR',
      cause: options.cause,
      details: {
        method: options.method,
        url: redactUrl(options.url),
        status: options.status,
        ...(options.retryAfterMs === undefined ? {} : { retryAfterMs: options.retryAfterMs }),
      },
    })
    this.method = options.method
    this.url = redactUrl(options.url)
    this.status = options.status
    this.bodyPreview = bodyPreview
    if (options.retryAfterMs !== undefined) this.retryAfterMs = options.retryAfterMs
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

/** Converts any thrown value into a stable JSON-safe error without exposing its cause chain. */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof ClientError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    }
  }
  if (error instanceof Error) return { name: error.name, code: 'UNEXPECTED_ERROR', message: error.message }
  return { name: 'Error', code: 'UNEXPECTED_ERROR', message: errorMessage(error) }
}

/** Redacts credential-like query parameter values from a URL or URL-like string. */
export function redactUrl(value: string): string {
  try {
    const url = new URL(value)
    for (const key of url.searchParams.keys()) {
      if (/token|key|sig|auth|credential|code/i.test(key)) url.searchParams.set(key, '[REDACTED]')
    }
    return url.toString()
  } catch {
    return value.replace(/([?&](?:token|key|sig|auth|credential|code)=)[^&\s]+/gi, '$1[REDACTED]')
  }
}
