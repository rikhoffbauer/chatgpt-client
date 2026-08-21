import assert from 'node:assert/strict'
import test from 'node:test'
import { AppServer } from '../src/appserver.js'
import { ProcessExitedError } from '../src/errors.js'

const fixture = String.raw`
const readline = require('node:readline');
const rl = readline.createInterface({ input: process.stdin });
const send = (value) => process.stdout.write(JSON.stringify(value) + '\n');
rl.on('line', (line) => {
  const message = JSON.parse(line);
  if (message.method === 'initialize') send({ jsonrpc: '2.0', id: message.id, result: { server: 'fake' } });
  else if (message.method === 'echo') send({ jsonrpc: '2.0', id: message.id, result: message.params });
  else if (message.method === 'turn/start') {
    send({ jsonrpc: '2.0', id: message.id, result: { turn: { id: 'turn-1' } } });
    send({ jsonrpc: '2.0', method: 'turn/started', params: { turnId: 'turn-1' } });
    send({ jsonrpc: '2.0', method: 'turn/completed', params: { turnId: 'turn-1' } });
  } else if (message.method === 'die') setTimeout(() => process.exit(7), 5);
});
`

test('AppServer performs JSON-RPC handshake and requests', async () => {
  const server = await AppServer.start({ binary: process.execPath, args: ['-e', fixture] })
  try {
    assert.deepEqual(server.serverInfo, { server: 'fake' })
    assert.deepEqual(await server.request('echo', { value: 42 }), { value: 42 })
    const messages = []
    for await (const message of server.runTurn({ input: 'hello' })) messages.push(message)
    assert.deepEqual(messages, [
      { method: 'turn/start', result: { turn: { id: 'turn-1' } } },
      { jsonrpc: '2.0', method: 'turn/started', params: { turnId: 'turn-1' } },
      { jsonrpc: '2.0', method: 'turn/completed', params: { turnId: 'turn-1' } },
    ])
  } finally {
    await server.close()
  }
})

test('AppServer rejects pending requests when the process exits', async () => {
  const server = await AppServer.start({ binary: process.execPath, args: ['-e', fixture] })
  await assert.rejects(
    server.request('die'),
    (error: unknown) => error instanceof ProcessExitedError && error.details !== undefined,
  )
})
