# ChatGPT Desktop Client

An unofficial, strict-TypeScript client and CLI for the protocol surfaces used by the ChatGPT desktop application and its local Codex `app-server` process.

This repository turns the original exploratory client into a bounded, testable implementation with explicit lifecycle management. It is not an OpenAI-supported SDK. Private backend routes can change without notice and may require account features that are not enabled for every user.

## What is implemented

- Typed `ChatGPTClient` with 151 catalogued backend routes.
- Higher-level conversation send/stream, upload, download, sharing, and history helpers.
- OAuth token loading and refresh with concurrent-refresh deduplication.
- Deadlines, cancellation, bounded retries, response-size limits, and redacted errors.
- Bounded SSE, NDJSON, line, WebSocket, and JSON-RPC queues.
- Local Codex `app-server` client with request timeouts and deterministic process shutdown.
- Node and Chrome integrity adapters isolated under `src/protocol/`.
- Dependency-free runtime; TypeScript and Node type declarations are development-only.
- Offline tests for transport, streaming, client routing, CLI behavior, and app-server lifecycle.

## Requirements

- macOS for the default ChatGPT/Codex desktop integration.
- Node.js 22 or newer for the verified build.
- Bun 1.3 or newer for the preferred development workflow.
- A signed-in ChatGPT or Codex installation providing `~/.codex/auth.json`.

## Install

The project has no runtime dependencies.

```sh
npm config get registry
./scripts/fix-bun-npm-registry.sh --install
bun install
bun run verify
```

The registry helper adds a missing trailing slash to the effective npm registry in the environment before invoking npm/Bun. This matters for nested Artifactory npm registry paths.

Node-only verification is also supported:

```sh
npm install
npm run verify
```

## CLI

Build and link the executable:

```sh
bun run build
bun link
chatgpt-client --help
```

Run from source while developing:

```sh
bun run src/bin.ts routes
bun run src/bin.ts whoami --json
bun run src/bin.ts list --limit 10
bun run src/bin.ts send --json-stream "Explain bounded queues"
```

Common operations:

```sh
chatgpt-client models
chatgpt-client read <conversation-id>
chatgpt-client send -c <conversation-id> -m <model> "Continue"
chatgpt-client send --attach ./notes.md "Summarize the attachment"
chatgpt-client upload ./document.pdf
chatgpt-client download <file-id> --out ./document.pdf
chatgpt-client routes wham
chatgpt-client api getConversation --conversation_id=<id> --json
chatgpt-client agent methods
chatgpt-client agent threads --limit 20
```

The CLI refuses to overwrite exported or downloaded files. `--json` emits structured output and structured errors. `--json-stream` emits one JSON object per streamed event and avoids buffering the full answer.

## Library usage

```ts
import { ChatGPTClient } from 'chatgpt-client'

const client = await ChatGPTClient.create()

try {
  const models = await client.routes.getModels({
    history_and_training_disabled: false,
  })

  for await (const event of client.send({
    text: 'Give me three concrete uses for AbortSignal.',
  })) {
    if (event.type === 'delta') process.stdout.write(event.text)
  }

  console.log(models)
} finally {
  client.close()
}
```

Path parameters are inferred as required by the route facade:

```ts
await client.routes.getConversation({ conversation_id: 'conversation-id' })
await client.routes.patchConversation({
  conversation_id: 'conversation-id',
  is_starred: true,
})
```

The generic `call` API remains available for protocol exploration while retaining runtime validation:

```ts
const result = await client.call('whamListTasks', {
  limit: 20,
  status: 'active',
})
```

Unknown route names and unused arguments fail explicitly.

## Cancellation and deadlines

Every network, stream, WebSocket, and app-server operation accepts an `AbortSignal` where applicable.

```ts
const controller = new AbortController()
const timer = setTimeout(() => controller.abort(new Error('cancelled')), 10_000)

try {
  for await (const event of client.send({
    text: 'Long request',
    signal: controller.signal,
  })) {
    // consume events
  }
} finally {
  clearTimeout(timer)
}
```

Default limits are deliberately finite. Override them through `ChatGPTClient` configuration or environment variables.

## Configuration

| Variable | Default | Purpose |
|---|---:|---|
| `CODEX_AUTH_PATH` | `~/.codex/auth.json` | Auth token store |
| `CODEX_API_BASE_URL` | `https://chatgpt.com/backend-api` | Explicit backend base URL |
| `CODEX_API_ENDPOINT=localhost` | unset | Use `http://localhost:8000/api` |
| `CODEX_BIN` | ChatGPT app bundle, then `PATH` | Local Codex executable |
| `CHATGPT_DESKTOP_CLIENT_STATE_PATH` | XDG config path | Persistent device ID |
| `CHATGPT_CLIENT_REQUEST_TIMEOUT_MS` | `60000` | Per-request deadline |
| `CHATGPT_CLIENT_CONNECT_TIMEOUT_MS` | `15000` | Realtime connection deadline |
| `CHATGPT_CLIENT_RETRY_ATTEMPTS` | `3` | Idempotent request attempts |
| `CHATGPT_CLIENT_RETRY_BASE_MS` | `250` | Initial retry delay |
| `CHATGPT_CLIENT_RETRY_MAX_MS` | `5000` | Maximum retry delay |
| `CHATGPT_CLIENT_RESPONSE_BYTES` | `8388608` | Buffered response limit |
| `CHATGPT_CLIENT_STREAM_LINE_BYTES` | `2097152` | Stream line limit |
| `CHATGPT_CLIENT_STREAM_EVENT_BYTES` | `8388608` | SSE event limit |
| `CHATGPT_CLIENT_QUEUE_SIZE` | `1024` | Async queue limit |
| `CHATGPT_CLIENT_UPLOAD_BYTES` | `536870912` | Upload limit |
| `CHATGPT_CLIENT_DOWNLOAD_BYTES` | `536870912` | Download limit |

See [`.env.example`](.env.example) for copyable values.

## Local app-server

```ts
import { AppServer } from 'chatgpt-client'

const server = await AppServer.start()

server.onRequest(async (method) => {
  // Approval-like requests are denied unless the embedding application
  // implements an explicit policy.
  return { decision: 'decline', method }
})

try {
  const threads = await server.request('thread/list', { pageSize: 20 })
  console.log(threads)
} finally {
  await server.close()
}
```

Pending requests fail when the child process exits. Output lines, pending requests, notification queues, and shutdown time are bounded.

## Development

```sh
bun run check
bun test
bun run build
bun run verify
```

The repository also carries a Node-based test path used for portability and CI-equivalent verification:

```sh
npm run test:node
```

Project layout:

```text
src/
  auth.ts             token loading and refresh
  http.ts             bounded HTTP transport
  client.ts           high-level client
  routes.ts           declarative route catalog
  route-api.ts        typed route facade
  realtime.ts         conversation and dictation sockets
  appserver.ts        local JSON-RPC process client
  streaming/          bounded line, SSE, NDJSON, and queue primitives
  protocol/           isolated integrity/browser compatibility adapters
  cli.ts              CLI commands and argument validation
test/                  offline integration and unit tests
docs/                  architecture and implementation criteria
```

## Operational boundaries

- Do not commit `~/.codex/auth.json`, access tokens, refresh tokens, signed upload URLs, or exported account data.
- External signed blob URLs are requested with `sendAuth: false`; ChatGPT bearer/account headers are not forwarded.
- Only idempotent HTTP methods retry by default. Callers must explicitly opt in to retry other operations.
- Integrity adapters exist only to preserve compatibility with the protocol already represented by this project. They are isolated because they are unstable and security-sensitive.
- Route coverage does not imply account authorization or API stability.

See [SECURITY.md](SECURITY.md), the [published architecture guide](docs/project/architecture.md), [docs/implementation-plan.md](docs/implementation-plan.md), and [docs/verification.md](docs/verification.md).

## License

MIT. See [LICENSE](LICENSE).
