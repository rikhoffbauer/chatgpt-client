import { homedir } from 'node:os'
import { join } from 'node:path'
import { ConfigurationError } from './errors.js'
import type { IntegritySolver, Persona } from './types.js'

export const PROD_API_BASE = 'https://chatgpt.com/backend-api'
export const DEV_API_BASE = 'http://localhost:8000/api'

/** Bounded retry policy used for idempotent transport operations. */
export interface RetryPolicy {
  maxAttempts: number
  baseDelayMs: number
  maxDelayMs: number
  retryStatuses: ReadonlySet<number>
}

/** Finite deadlines and byte/queue caps applied by the runtime client. */
export interface RuntimeLimits {
  requestTimeoutMs: number
  connectTimeoutMs: number
  responseBodyBytes: number
  streamLineBytes: number
  streamEventBytes: number
  queueSize: number
  uploadBytes: number
  downloadBytes: number
}

/** Fully resolved client configuration after overrides, environment, and defaults. */
export interface ClientConfig {
  baseUrl: string
  authPath: string
  statePath: string
  persona: Persona
  solver: IntegritySolver
  appVersion: string
  retry: RetryPolicy
  limits: RuntimeLimits
}

const DEFAULT_RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])

function envInteger(name: string, fallback: number, minimum = 1): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new ConfigurationError(`${name} must be an integer >= ${minimum}; received ${JSON.stringify(raw)}`)
  }
  return value
}

export function resolveApiBase(override?: string): string {
  const explicit = override ?? process.env.CODEX_API_BASE_URL
  if (explicit?.trim()) {
    try {
      return new URL(explicit).toString().replace(/\/+$/, '')
    } catch (error) {
      throw new ConfigurationError(`Invalid API base URL: ${explicit}`, { cause: error })
    }
  }
  return (process.env.CODEX_API_ENDPOINT ?? '').toLowerCase() === 'localhost' ? DEV_API_BASE : PROD_API_BASE
}

/** Resolves configuration with programmatic overrides taking precedence over environment variables. */
export function defaultConfig(overrides: Partial<Omit<ClientConfig, 'retry' | 'limits'>> & {
  retry?: Partial<RetryPolicy>
  limits?: Partial<RuntimeLimits>
} = {}): ClientConfig {
  const configDir = process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config')
  return {
    baseUrl: resolveApiBase(overrides.baseUrl),
    authPath: overrides.authPath ?? process.env.CODEX_AUTH_PATH ?? join(homedir(), '.codex', 'auth.json'),
    statePath:
      overrides.statePath ??
      process.env.CHATGPT_DESKTOP_CLIENT_STATE_PATH ??
      join(configDir, 'chatgpt-client', 'state.json'),
    persona: overrides.persona ?? 'browser',
    solver: overrides.solver ?? 'node',
    appVersion: overrides.appVersion ?? '1.0.0',
    retry: {
      maxAttempts: overrides.retry?.maxAttempts ?? envInteger('CHATGPT_CLIENT_RETRY_ATTEMPTS', 3),
      baseDelayMs: overrides.retry?.baseDelayMs ?? envInteger('CHATGPT_CLIENT_RETRY_BASE_MS', 250),
      maxDelayMs: overrides.retry?.maxDelayMs ?? envInteger('CHATGPT_CLIENT_RETRY_MAX_MS', 5_000),
      retryStatuses: overrides.retry?.retryStatuses ?? DEFAULT_RETRY_STATUSES,
    },
    limits: {
      requestTimeoutMs: overrides.limits?.requestTimeoutMs ?? envInteger('CHATGPT_CLIENT_REQUEST_TIMEOUT_MS', 2 * 60_000),
      connectTimeoutMs: overrides.limits?.connectTimeoutMs ?? envInteger('CHATGPT_CLIENT_CONNECT_TIMEOUT_MS', 2 * 60_000),
      responseBodyBytes: overrides.limits?.responseBodyBytes ?? envInteger('CHATGPT_CLIENT_RESPONSE_BYTES', 8 * 1024 * 1024),
      streamLineBytes: overrides.limits?.streamLineBytes ?? envInteger('CHATGPT_CLIENT_STREAM_LINE_BYTES', 2 * 1024 * 1024),
      streamEventBytes: overrides.limits?.streamEventBytes ?? envInteger('CHATGPT_CLIENT_STREAM_EVENT_BYTES', 8 * 1024 * 1024),
      queueSize: overrides.limits?.queueSize ?? envInteger('CHATGPT_CLIENT_QUEUE_SIZE', 1_024),
      uploadBytes: overrides.limits?.uploadBytes ?? envInteger('CHATGPT_CLIENT_UPLOAD_BYTES', 512 * 1024 * 1024),
      downloadBytes: overrides.limits?.downloadBytes ?? envInteger('CHATGPT_CLIENT_DOWNLOAD_BYTES', 512 * 1024 * 1024),
    },
  }
}
