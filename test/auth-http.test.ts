import assert from 'node:assert/strict'
import test from 'node:test'
import { Auth } from '../src/auth.js'
import { ProtocolError, TimeoutError } from '../src/errors.js'
import { Http, buildQuery, expandPath } from '../src/http.js'
import type { Fetch } from '../src/types.js'

function jwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'none' })}.${encode(payload)}.`
}

const futureToken = (accountId = 'acct-1'): string => jwt({
  exp: Math.floor(Date.now() / 1_000) + 3_600,
  'https://api.openai.com/auth': { chatgpt_account_id: accountId, user_id: 'user-1' },
})

test('path and query builders encode structured values', () => {
  assert.equal(expandPath('/conversation/{id}', { id: 'a/b' }), '/conversation/a%2Fb')
  assert.throws(() => expandPath('/conversation/{id}', {}), /Missing path parameter/)
  assert.equal(buildQuery({ a: 1, b: ['x', 'y'], c: { nested: true }, ignored: undefined }), 'a=1&b=x&b=y&c=%7B%22nested%22%3Atrue%7D')
})

test('Auth deduplicates concurrent refreshes', async () => {
  let refreshCalls = 0
  const refreshed = futureToken('acct-2')
  const fetchImpl: Fetch = async () => {
    refreshCalls += 1
    await new Promise((resolve) => setTimeout(resolve, 5))
    return Response.json({ access_token: refreshed, refresh_token: 'refresh-2' })
  }
  const auth = new Auth({ accessToken: futureToken(), refreshToken: 'refresh-1', fetchImpl })
  await Promise.all([auth.refresh(), auth.refresh(), auth.refresh()])
  assert.equal(refreshCalls, 1)
  assert.equal(auth.accessToken, refreshed)
  assert.equal(auth.accountId, 'acct-2')
})

test('Http omits account credentials for external requests', async () => {
  let captured: Headers | undefined
  const fetchImpl: Fetch = async (_input, init) => {
    captured = new Headers(init?.headers)
    return new Response('ok')
  }
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    fetchImpl,
    deviceIdProvider: async () => 'device-1',
  })
  await http.request('GET', 'https://example.test/file?sig=secret', { sendAuth: false })
  assert.equal(captured?.get('authorization'), null)
  assert.equal(captured?.get('chatgpt-account-id'), null)
  assert.equal(captured?.get('origin'), null)
})

test('Http retries a same-origin Cloudflare challenge through browser fetch', async () => {
  let browserCalls = 0
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    deviceIdProvider: async () => 'device-1',
    fetchImpl: async () => new Response('challenge', { status: 403, headers: { server: 'cloudflare', 'cf-mitigated': 'challenge' } }),
    browserFetch: async (input) => {
      browserCalls += 1
      assert.equal(String(input), 'https://chatgpt.com/backend-api/me')
      return Response.json({ ok: true })
    },
  })
  assert.deepEqual(await http.json('GET', '/me'), { ok: true })
  assert.equal(browserCalls, 1)
})

test('Http refreshes once on 401 and replays with the new token', async () => {
  let apiCalls = 0
  let refreshCalls = 0
  const oldToken = futureToken('acct-old')
  const newToken = futureToken('acct-new')
  const auth = new Auth({
    accessToken: oldToken,
    refreshToken: 'refresh',
    fetchImpl: async () => {
      refreshCalls += 1
      return Response.json({ access_token: newToken })
    },
  })
  const seenAuth: string[] = []
  const http = new Http({
    auth,
    deviceIdProvider: async () => 'device-1',
    fetchImpl: async (_input, init) => {
      apiCalls += 1
      seenAuth.push(new Headers(init?.headers).get('authorization') ?? '')
      return apiCalls === 1 ? new Response('unauthorized', { status: 401 }) : Response.json({ ok: true })
    },
  })
  assert.deepEqual(await http.json('GET', '/me'), { ok: true })
  assert.equal(refreshCalls, 1)
  assert.equal(apiCalls, 2)
  assert.deepEqual(seenAuth, [`Bearer ${oldToken}`, `Bearer ${newToken}`])
})

test('Http retries transient idempotent failures but not forever', async () => {
  let calls = 0
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    deviceIdProvider: async () => 'device-1',
    config: { retry: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 1 } },
    fetchImpl: async () => {
      calls += 1
      return calls < 3 ? new Response('busy', { status: 503 }) : Response.json({ ok: true })
    },
  })
  assert.deepEqual(await http.json('GET', '/models'), { ok: true })
  assert.equal(calls, 3)
})

test('Http enforces request timeouts', async () => {
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    deviceIdProvider: async () => 'device-1',
    fetchImpl: async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
    }),
  })
  await assert.rejects(
    http.request('GET', '/slow', { timeoutMs: 10, retry: false }),
    (error: unknown) => error instanceof TimeoutError,
  )
})

test('Http enforces response body limits', async () => {
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    deviceIdProvider: async () => 'device-1',
    config: { limits: { responseBodyBytes: 4 } },
    fetchImpl: async () => new Response('12345'),
  })
  await assert.rejects(
    http.json('GET', '/large'),
    (error: unknown) => error instanceof ProtocolError && error.code === 'RESPONSE_BODY_TOO_LARGE',
  )
})

test('Http times out a stalled response body after headers arrive', async () => {
  let cancelled = false
  const body = new ReadableStream<Uint8Array>({
    pull: () => new Promise<void>(() => undefined),
    cancel: () => {
      cancelled = true
    },
  })
  const http = new Http({
    auth: new Auth({ accessToken: futureToken() }),
    deviceIdProvider: async () => 'device-1',
    fetchImpl: async () => new Response(body),
  })
  await assert.rejects(
    http.json('GET', '/stalled-body', { timeoutMs: 10, retry: false }),
    (error: unknown) => error instanceof TimeoutError,
  )
  assert.equal(cancelled, true)
})
