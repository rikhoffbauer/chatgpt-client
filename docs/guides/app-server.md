---
title: Local Codex app-server
description: Start the bundled Codex JSON-RPC process, handle requests explicitly, stream turns, and shut down deterministically.
---

`AppServer` owns a local child process and communicates over line-delimited JSON-RPC:

```ts
import { AppServer } from 'chatgpt-client'

const server = await AppServer.start()
server.onRequest(async (method) => {
  // Embedders must define their own approval policy.
  return { decision: 'decline', method }
})

try {
  const threads = await server.request('thread/list', { pageSize: 20 })
  console.log(threads)
} finally {
  await server.close()
}
```

## Stream one turn

`runTurn()` yields the start result followed by matching notifications until `turn/completed` or `turn/failed`:

```ts
const controller = new AbortController()
for await (const notification of server.runTurn(
  { threadId, input: [{ type: 'text', text: 'Inspect this project.' }] },
  { signal: controller.signal },
)) {
  console.log(notification)
}
```

Requests have deadlines and cancellation; pending requests, output line size, and notification queues are bounded. If graceful shutdown exceeds the close deadline, the child is terminated forcibly. Always call `close()` in a `finally` block.

Server-initiated requests may represent approvals or other policy decisions. Register `onRequest()`; do not silently accept actions your embedding application has not authorized.
