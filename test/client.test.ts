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

test('getUserMemories requests and validates full memory entries', async () => {
  const requests: string[] = []
  const memory = {
    id: 'memory-1',
    content: 'Prefers concise answers',
    updated_at: '2026-08-21',
    gizmo_id: null,
    status: 'warm',
    conversation_id: 'conversation-1',
    created_timestamp: 1_786_954_922.389472,
    last_updated: null,
    labels: [],
  }
  const client = createClient(async (input) => {
    requests.push(String(input))
    return Response.json({ memories: [memory], memory_max_tokens: 5_000_000, memory_num_tokens: 100 })
  })
  const result = await client.getUserMemories()
  assert.equal(requests[0]?.endsWith('/memories?include_memory_entries=true'), true)
  assert.deepEqual(result, { memories: [memory], memory_max_tokens: 5_000_000, memory_num_tokens: 100 })
})

test('getUserMemories rejects malformed responses', async () => {
  const client = createClient(async () => Response.json({ memories: [{ id: 'memory-1' }], memory_max_tokens: 5_000_000, memory_num_tokens: 1 }))
  await assert.rejects(
    client.getUserMemories(),
    (error: unknown) => error instanceof ProtocolError && error.code === 'INVALID_MEMORY',
  )
})

test('getUserMemorySummary posts and validates the About You summary', async () => {
  const requests: Array<{ url: string; method: string }> = []
  const response = {
    sections: [
      { id: 'overview', title: 'Overview', description: 'A concise overview.' },
      {
        id: 'dive-deeper',
        title: 'Dive Deeper',
        description: '',
        followUps: [{ preview: 'Explore preferences.', prompt: 'What are my preferences?', action: 'fill_composer' }],
      },
    ],
    generatedAtIso: '2026-08-21T12:08:46.870213+00:00',
    emptyStateMessage: 'ChatGPT does not know much about you yet.',
    sourceChecksum: 'checksum',
  }
  const client = createClient(async (input, init) => {
    requests.push({ url: String(input), method: init?.method ?? 'GET' })
    return Response.json(response)
  })
  assert.deepEqual(await client.getUserMemorySummary(), response)
  assert.equal(requests[0]?.url.endsWith('/memories/about_you/summary'), true)
  assert.equal(requests[0]?.method, 'POST')
})

test('getUserMemorySummary rejects malformed sections', async () => {
  const client = createClient(async () => Response.json({
    sections: [{ id: 'overview', title: 'Overview' }],
    generatedAtIso: '2026-08-21T12:08:46Z',
    emptyStateMessage: '',
    sourceChecksum: 'checksum',
  }))
  await assert.rejects(
    client.getUserMemorySummary(),
    (error: unknown) => error instanceof ProtocolError && error.code === 'INVALID_MEMORY_SUMMARY_SECTION',
  )
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

test('send emits generated image assets from image-generation tool messages', async () => {
  const sse = [
    'data: {"conversation_id":"c1","v":{"message":{"id":"tool-1","author":{"role":"tool"},"content":{"content_type":"multimodal_text","parts":[{"content_type":"image_asset_pointer","asset_pointer":"sediment://file_generated_1","mime_type":"image/png","size_bytes":1234,"width":1024,"height":1024,"metadata":{"generation":{"orientation":"square"}}},{"asset_pointer":"file-service://file_generated_2","mime_type":"image/webp","width":768,"height":1024}]},"metadata":{"async_task_type":"image_gen"}}}}\n\n',
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
  for await (const event of client.send({ text: 'generate an image' })) events.push(event)

  assert.deepEqual(events, [
    { type: 'meta', conversationId: 'c1', messageId: 'tool-1' },
    {
      type: 'image',
      image: {
        file_id: 'file_generated_1',
        asset_pointer: 'sediment://file_generated_1',
        content_type: 'image_asset_pointer',
        mime_type: 'image/png',
        size_bytes: 1234,
        width: 1024,
        height: 1024,
        metadata: { generation: { orientation: 'square' } },
      },
    },
    {
      type: 'image',
      image: {
        file_id: 'file_generated_2',
        asset_pointer: 'file-service://file_generated_2',
        content_type: 'image_asset_pointer',
        mime_type: 'image/webp',
        width: 768,
        height: 1024,
      },
    },
    { type: 'done', conversationId: 'c1' },
  ])
})

test('send does not classify unrelated tool image pointers as generated output', async () => {
  const sse = [
    'data: {"conversation_id":"c1","v":{"message":{"author":{"role":"tool"},"content":{"content_type":"multimodal_text","parts":[{"content_type":"image_asset_pointer","asset_pointer":"sediment://file_search_result"}]},"metadata":{"async_task_type":"file_search"}}}}\n\n',
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
  for await (const event of client.send({ text: 'search for an image' })) events.push(event)

  assert.equal(events.some((event) => event.type === 'image'), false)
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
