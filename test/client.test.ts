import assert from 'node:assert/strict'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { Auth } from '../src/auth.js'
import { ChatGPTClient, type StartTurnOptions } from '../src/client.js'
import { ProtocolError } from '../src/errors.js'
import type { Fetch } from '../src/types.js'

function jwt(): string {
  const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1_000) + 3_600, 'https://api.openai.com/auth': { chatgpt_account_id: 'acct' } })}.`
}

function createClient(fetchImpl: Fetch): ChatGPTClient {
  return new ChatGPTClient({
    auth: new Auth({ accessToken: jwt() }),
    fetchImpl,
    config: { statePath: join(tmpdir(), `chatgpt-client-test-${crypto.randomUUID()}.json`) },
    integrityProvider: async () => ({ headers: {}, requirements: {}, requirementsKey: 'test' }),
  })
}

test('client decomposes path, query, and body arguments', async () => {
  const requests: Array<{ url: string; method: string; body: string }> = []
  const client = createClient(async (input, init) => {
    requests.push({ url: String(input), method: init?.method ?? 'GET', body: String(init?.body ?? '') })
    return Response.json({ ok: true })
  })
  await client.call('patchConversation', { conversation_id: 'a/b', is_starred: true })
  assert.equal(requests[0]?.url.endsWith('/conversation/a%2Fb'), true)
  assert.equal(requests[0]?.method, 'PATCH')
  assert.deepEqual(JSON.parse(requests[0]?.body ?? '{}'), { is_starred: true })
})

test('typed route facade delegates to the route catalog', async () => {
  const client = createClient(async () => Response.json({ models: [] }))
  assert.deepEqual(await client.routes.getModels({ history_and_training_disabled: false }), { models: [] })
})

test('strict route mode rejects unused arguments', async () => {
  const client = createClient(async () => Response.json({}))
  await assert.rejects(
    client.call('getConversation', { conversation_id: 'id', typo: true }),
    (error: unknown) => error instanceof ProtocolError && error.code === 'UNUSED_ROUTE_ARGUMENT',
  )
})

test('send decodes classic and compact stream events', async () => {
  const sse = [
    'data: {"conversation_id":"c1","message":{"author":{"role":"assistant"},"content":{"content_type":"text","parts":["Hello"]}}}\n\n',
    'data: {"message":{"author":{"role":"assistant"},"content":{"content_type":"text","parts":["Hello world"]}}}\n\n',
    'data: {"p":"/message/content/parts/0","v":"!"}\n\n',
    'data: [DONE]\n\n',
  ].join('')
  class TestClient extends ChatGPTClient {
    override async startTurn(_options: StartTurnOptions = {}): Promise<Response> {
      return new Response(sse, { headers: { 'content-type': 'text/event-stream' } })
    }
  }
  const client = new TestClient({
    auth: new Auth({ accessToken: jwt() }),
    fetchImpl: async () => Response.json({}),
    config: { statePath: join(tmpdir(), `chatgpt-client-test-${crypto.randomUUID()}.json`) },
    integrityProvider: async () => ({ headers: {}, requirements: {}, requirementsKey: 'test' }),
  })
  const events = []
  for await (const event of client.send({ text: 'test' })) events.push(event)
  assert.deepEqual(events, [
    { type: 'meta', conversationId: 'c1', messageId: null },
    { type: 'delta', text: 'Hello' },
    { type: 'delta', text: ' world' },
    { type: 'delta', text: '!' },
    { type: 'done', conversationId: 'c1' },
  ])
})

test('blob upload never forwards ChatGPT credentials', async () => {
  const captures: Array<{ url: string; headers: Headers; method: string }> = []
  const client = createClient(async (input, init) => {
    const url = String(input)
    captures.push({ url, headers: new Headers(init?.headers), method: init?.method ?? 'GET' })
    if (url.endsWith('/files')) return Response.json({ file_id: 'file-1', upload_url: 'https://blob.example.test/container?sig=secret' })
    if (url.includes('blob.example.test')) return new Response(null, { status: 201 })
    if (url.endsWith('/files/file-1/uploaded')) return Response.json({ asset_pointer: 'file-service://file-1' })
    return new Response('not found', { status: 404 })
  })
  const result = await client.uploadFile({ bytes: new TextEncoder().encode('hello'), fileName: 'hello.txt', contentType: 'text/plain' })
  assert.equal(result.file_id, 'file-1')
  const blobRequest = captures.find((request) => request.url.includes('blob.example.test'))
  assert.equal(blobRequest?.method, 'PUT')
  assert.equal(blobRequest?.headers.get('authorization'), null)
  assert.equal(blobRequest?.headers.get('chatgpt-account-id'), null)
})

test('messageChain detects corrupt cycles', () => {
  assert.throws(
    () => ChatGPTClient.messageChain({ current_node: 'a', mapping: { a: { parent: 'a', message: { id: 'm' } } } }),
    (error: unknown) => error instanceof ProtocolError && error.code === 'CONVERSATION_CYCLE',
  )
})
