import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { deadlineSignal } from './abort.js'
import { defaultConfig } from './config.js'
import { AuthError, errorMessage } from './errors.js'
import type { Logger } from './logger.js'
import { noopLogger } from './logger.js'
import type { Fetch, UnknownRecord } from './types.js'

export const OAUTH_TOKEN_URL = 'https://auth.openai.com/oauth/token'
// public openai codex cli client id, see https://github.com/openai/codex/blob/2aaefa32b0762491d1340675a6082fad26bbb57f/codex-rs/login/src/auth/manager.rs#L1678
export const OAUTH_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'

const REFRESH_TIMEOUT = 60_000;

export interface JwtPayload extends UnknownRecord {
  exp?: number
  sub?: string
}

export interface ChatGptAuthClaims extends UnknownRecord {
  chatgpt_account_id?: string
  chatgpt_plan_type?: string
  user_id?: string
}

interface AuthFileTokens {
  access_token?: unknown
  refresh_token?: unknown
  id_token?: unknown
  account_id?: unknown
}

interface AuthFile {
  tokens?: AuthFileTokens
}

interface RefreshResponse {
  access_token?: unknown
  refresh_token?: unknown
  id_token?: unknown
}

/** Explicit OAuth credentials and refresh dependencies for constructing {@link Auth}. */
export interface AuthOptions {
  accessToken: string
  refreshToken?: string
  idToken?: string
  accountId?: string | null
  fetchImpl?: Fetch
  refreshTimeoutMs?: number
  logger?: Logger
}

/** Options for loading the desktop auth store and optionally refreshing it. */
export interface LoadAuthOptions {
  path?: string
  forceRefresh?: boolean
  fetchImpl?: Fetch
  refreshTimeoutMs?: number
  logger?: Logger
}

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  const part = token?.split('.')[1]
  if (part === undefined || part === '') return null
  try {
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const value: unknown = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
    return isRecord(value) ? (value as JwtPayload) : null
  } catch {
    return null
  }
}

export function authClaims(token: string | null | undefined): ChatGptAuthClaims {
  const claims = decodeJwtPayload(token)?.['https://api.openai.com/auth']
  return isRecord(claims) ? (claims as ChatGptAuthClaims) : {}
}

export function accountIdFromToken(token: string | null | undefined): string | null {
  const value = authClaims(token).chatgpt_account_id
  return typeof value === 'string' && value !== '' ? value : null
}

/**
 * Mutable OAuth credential holder with finite refresh deadlines and concurrent-refresh deduplication.
 * Loaded tokens are sensitive and must not be logged or committed.
 */
export class Auth {
  accessToken: string
  refreshToken?: string
  idToken?: string
  accountId: string | null

  private readonly fetchImpl: Fetch
  private readonly refreshTimeoutMs: number
  private readonly logger: Logger
  private refreshPromise?: Promise<void>

  constructor(options: AuthOptions) {
    if (options.accessToken.trim() === '') throw new AuthError('accessToken cannot be empty', { code: 'INVALID_ACCESS_TOKEN' })
    this.accessToken = options.accessToken
    if (options.refreshToken !== undefined) this.refreshToken = options.refreshToken
    if (options.idToken !== undefined) this.idToken = options.idToken
    this.accountId = options.accountId ?? accountIdFromToken(options.accessToken)
    this.fetchImpl = options.fetchImpl ?? fetch
    this.refreshTimeoutMs = options.refreshTimeoutMs ?? REFRESH_TIMEOUT
    this.logger = options.logger ?? noopLogger
  }

  /** Loads the Codex auth store, validates its token fields, and refreshes expiring credentials. */
  static async load(options: LoadAuthOptions = {}): Promise<Auth> {
    const config = defaultConfig()
    const path = options.path ?? config.authPath
    let raw: AuthFile
    try {
      const parsed: unknown = JSON.parse(await readFile(path, 'utf8'))
      if (!isRecord(parsed)) throw new Error('root value is not an object')
      raw = parsed as AuthFile
    } catch (error) {
      throw new AuthError(`Cannot read auth store at ${path}; sign in with the ChatGPT/Codex app first`, {
        code: 'AUTH_STORE_UNREADABLE',
        cause: error,
      })
    }

    const tokens = raw.tokens
    const accessToken = asNonEmptyString(tokens?.access_token)
    if (accessToken === null) throw new AuthError(`No access_token in auth store at ${path}`, { code: 'ACCESS_TOKEN_MISSING' })

    const auth = new Auth({
      accessToken,
      ...(asNonEmptyString(tokens?.refresh_token) === null ? {} : { refreshToken: asNonEmptyString(tokens?.refresh_token) as string }),
      ...(asNonEmptyString(tokens?.id_token) === null ? {} : { idToken: asNonEmptyString(tokens?.id_token) as string }),
      accountId: asNonEmptyString(tokens?.account_id),
      ...(options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl }),
      ...(options.refreshTimeoutMs === undefined ? {} : { refreshTimeoutMs: options.refreshTimeoutMs }),
      ...(options.logger === undefined ? {} : { logger: options.logger }),
    })
    if (options.forceRefresh === true || auth.isExpiring()) await auth.refresh()
    return auth
  }

  get claims(): ChatGptAuthClaims {
    return authClaims(this.accessToken)
  }

  isExpiring(skewMs = 60_000): boolean {
    const exp = decodeJwtPayload(this.accessToken)?.exp
    return typeof exp !== 'number' || exp * 1_000 - Date.now() < skewMs
  }

  /** Refreshes an expiring access token when a refresh token is available. */
  async ensureFresh(): Promise<void> {
    if (this.isExpiring() && this.refreshToken !== undefined) await this.refresh()
  }

  /** Refreshes tokens once; concurrent callers share the same in-flight operation. */
  async refresh(): Promise<void> {
    if (this.refreshPromise !== undefined) return this.refreshPromise
    this.refreshPromise = this.performRefresh().finally(() => {
      this.refreshPromise = undefined
    })
    return this.refreshPromise
  }

  private async performRefresh(): Promise<void> {
    if (this.refreshToken === undefined || this.refreshToken === '') {
      throw new AuthError('Access token cannot be refreshed because no refresh_token is available', {
        code: 'REFRESH_TOKEN_MISSING',
      })
    }

    const deadline = deadlineSignal('OAuth token refresh', this.refreshTimeoutMs)
    try {
      const response = await this.fetchImpl(OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: OAUTH_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          scope: 'openid profile email',
        }),
        signal: deadline.signal,
      })
      const text = await response.text()
      if (!response.ok) {
        throw new AuthError(`OAuth token refresh returned HTTP ${response.status}: ${text.slice(0, 512)}`, {
          code: 'TOKEN_REFRESH_FAILED',
          details: { status: response.status },
        })
      }
      let body: RefreshResponse
      try {
        const parsed: unknown = JSON.parse(text)
        if (!isRecord(parsed)) throw new Error('response is not an object')
        body = parsed as RefreshResponse
      } catch (error) {
        throw new AuthError('OAuth token refresh returned invalid JSON', {
          code: 'INVALID_REFRESH_RESPONSE',
          cause: error,
        })
      }

      const accessToken = asNonEmptyString(body.access_token)
      if (accessToken === null) throw new AuthError('OAuth token refresh response omitted access_token', { code: 'ACCESS_TOKEN_MISSING' })
      this.accessToken = accessToken
      const refreshToken = asNonEmptyString(body.refresh_token)
      const idToken = asNonEmptyString(body.id_token)
      if (refreshToken !== null) this.refreshToken = refreshToken
      if (idToken !== null) this.idToken = idToken
      this.accountId = accountIdFromToken(this.accessToken) ?? this.accountId
      this.logger.debug('OAuth token refreshed', { accountId: this.accountId })
    } catch (error) {
      if (deadline.signal.aborted && deadline.signal.reason !== undefined) throw deadline.signal.reason
      if (error instanceof AuthError) throw error
      throw new AuthError(`OAuth token refresh failed: ${errorMessage(error)}`, { code: 'TOKEN_REFRESH_FAILED', cause: error })
    } finally {
      deadline.cleanup()
    }
  }
}

interface StateFile {
  deviceId?: unknown
}

export async function deviceId(statePath = defaultConfig().statePath): Promise<string> {
  let state: StateFile = {}
  try {
    const value: unknown = JSON.parse(await readFile(statePath, 'utf8'))
    if (isRecord(value)) state = value as StateFile
  } catch (error) {
    const code = isRecord(error) ? error.code : undefined
    if (code !== 'ENOENT') throw new AuthError(`Cannot read client state at ${statePath}`, { code: 'STATE_READ_FAILED', cause: error })
  }

  const existing = asNonEmptyString(state.deviceId)
  if (existing !== null) return existing

  const id = randomUUID()
  const directory = dirname(statePath)
  const temporary = `${statePath}.${process.pid}.${randomUUID()}.tmp`
  await mkdir(directory, { recursive: true, mode: 0o700 })
  await writeFile(temporary, `${JSON.stringify({ deviceId: id }, null, 2)}\n`, { mode: 0o600 })
  await chmod(temporary, 0o600)
  await rename(temporary, statePath)
  return id
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
