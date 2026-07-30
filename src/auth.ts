// @ts-nocheck
// Token store + account identity.
//
// In the real app this lives in the Rust `Resources/codex` binary, which owns
// ~/.codex/auth.json and hands tokens to the Electron main process over JSON-RPC
// (account/chatgptAuthTokens, account/chatgptAuthTokens/refresh). We read the same
// store directly. Tokens stay in memory and are never written back, so the app's own
// auth state is left intact.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

export const OAUTH_TOKEN_URL = 'https://auth.openai.com/oauth/token'
export const OAUTH_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'

export const AUTH_PATH = process.env.CODEX_AUTH_PATH || join(homedir(), '.codex', 'auth.json')
export const STATE_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '.poc-state.json')

export function decodeJwtPayload(token) {
  const part = String(token ?? '').split('.')[1]
  if (!part) return null
  try {
    return JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
  } catch {
    return null
  }
}

// window-all-closed-*.js : QV — the account id is a claim inside the access token
export function accountIdFromToken(token) {
  return decodeJwtPayload(token)?.['https://api.openai.com/auth']?.chatgpt_account_id ?? null
}

export function authClaims(token) {
  return decodeJwtPayload(token)?.['https://api.openai.com/auth'] ?? {}
}

async function readAuthFile() {
  try {
    return JSON.parse(await readFile(AUTH_PATH, 'utf8'))
  } catch (err) {
    throw new Error(`Cannot read ${AUTH_PATH} — sign in with the ChatGPT/Codex app first. (${err.message})`)
  }
}

async function refreshToken(refresh) {
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: OAUTH_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refresh,
      scope: 'openid profile email',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

/**
 * Auth holder shared by every transport in this client.
 * `accessToken` is refreshed in place; nothing is persisted.
 */
export class Auth {
  constructor({ accessToken, refreshToken: refresh, accountId, idToken }) {
    this.accessToken = accessToken
    this.refreshToken = refresh
    this.idToken = idToken
    this.accountId = accountId ?? accountIdFromToken(accessToken)
  }

  static async load({ forceRefresh = false } = {}) {
    const raw = await readAuthFile()
    const tokens = raw?.tokens
    if (!tokens?.access_token) throw new Error(`No access_token in ${AUTH_PATH}`)
    const auth = new Auth({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      accountId: tokens.account_id,
    })
    if (forceRefresh || auth.isExpiring()) await auth.refresh()
    return auth
  }

  isExpiring(skewMs = 60_000) {
    const exp = decodeJwtPayload(this.accessToken)?.exp ?? 0
    return exp * 1000 - Date.now() < skewMs
  }

  async refresh() {
    if (!this.refreshToken) throw new Error('Access token expired and no refresh_token available.')
    const body = await refreshToken(this.refreshToken)
    if (body.access_token) this.accessToken = body.access_token
    if (body.refresh_token) this.refreshToken = body.refresh_token
    if (body.id_token) this.idToken = body.id_token
    this.accountId = this.accountId ?? accountIdFromToken(this.accessToken)
    return this
  }

  get claims() {
    return authClaims(this.accessToken)
  }
}

// app-initial-*.js : lva()/uva() — a stable per-install id sent as `oai-did`
export async function deviceId() {
  let state = {}
  try {
    state = JSON.parse(await readFile(STATE_PATH, 'utf8'))
  } catch {
    /* first run */
  }
  if (state.deviceId) return state.deviceId
  state.deviceId = randomUUID()
  await mkdir(dirname(STATE_PATH), { recursive: true })
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2))
  return state.deviceId
}
