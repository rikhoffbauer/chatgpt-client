import assert from 'node:assert/strict'
import test from 'node:test'
import { QueueOverflowError, ProtocolError } from '../src/errors.js'
import { AsyncQueue } from '../src/streaming/async-queue.js'
import { ndjson } from '../src/streaming/ndjson.js'
import { readLines } from '../src/streaming/lines.js'
import { sseEvents } from '../src/streaming/sse.js'

const encoder = new TextEncoder()

function responseFromChunks(chunks: string[]): Response {
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  }))
}

test('AsyncQueue delivers values and closes deterministically', async () => {
  const queue = new AsyncQueue<number>({ maxSize: 2 })
  queue.push(1)
  queue.push(2)
  queue.close()
  const values: number[] = []
  for await (const value of queue) values.push(value)
  assert.deepEqual(values, [1, 2])
})

test('AsyncQueue fails instead of growing past its bound', async () => {
  const queue = new AsyncQueue<number>({ name: 'test queue', maxSize: 1 })
  queue.push(1)
  queue.push(2)
  await assert.rejects(queue.next(), QueueOverflowError)
})

test('readLines handles chunk boundaries and CRLF', async () => {
  const lines: string[] = []
  for await (const line of readLines(responseFromChunks(['a\r', '\nb', '\nlast']))) lines.push(line)
  assert.deepEqual(lines, ['a', 'b', 'last'])
})

test('readLines enforces line size limits', async () => {
  const consume = async (): Promise<void> => {
    for await (const _line of readLines(responseFromChunks(['12345']), { maxLineBytes: 4 })) {
      // consume
    }
  }
  await assert.rejects(consume(), (error: unknown) => error instanceof ProtocolError && error.code === 'STREAM_LINE_TOO_LARGE')
})

test('SSE parser handles multiline data and final unterminated event', async () => {
  const response = responseFromChunks([
    'event: delta\ndata: {"a":',
    '1}\ndata: tail\n\n',
    'data: final',
  ])
  const events = []
  for await (const event of sseEvents(response)) events.push(event)
  assert.deepEqual(events, [
    { event: 'delta', data: '{"a":1}\ntail', id: null, retry: null },
    { event: null, data: 'final', id: null, retry: null },
  ])
})

test('NDJSON supports lenient and strict modes', async () => {
  const lenient = []
  for await (const record of ndjson(responseFromChunks(['{"ok":true}\nnot-json\n']))) lenient.push(record)
  assert.deepEqual(lenient, [{ ok: true }, { raw: 'not-json' }])

  const consumeStrict = async (): Promise<void> => {
    for await (const _record of ndjson(responseFromChunks(['not-json\n']), { strict: true })) {
      // consume
    }
  }
  await assert.rejects(consumeStrict(), (error: unknown) => error instanceof ProtocolError && error.code === 'INVALID_NDJSON')
})

test('readLines aborts a pending read and cancels the source', async () => {
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull: () => new Promise<void>(() => undefined),
    cancel: () => {
      cancelled = true
    },
  })
  const controller = new AbortController()
  const next = readLines(stream, { signal: controller.signal }).next()
  setTimeout(() => controller.abort(new Error('stop reading')), 5)
  await assert.rejects(next, /stop reading/)
  assert.equal(cancelled, true)
})
