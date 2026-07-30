# chatgpt-poc

A complete client for the protocol behind `/Applications/ChatGPT.app` (the Electron app formerly
shipped as Codex). It speaks to `https://chatgpt.com/backend-api` exactly the way the app does:
same credentials, same header persona, same anti-abuse handshake, same streaming formats — plus a
bridge to the local `codex app-server` binary for the half of the app that never touches HTTP.

Bun 1.3+ or Node.js 22+, zero runtime dependencies. The source is TypeScript and compiles to Node-compatible ESM. Everything below is built on `fetch`, `WebSocket`, `node:crypto`,
`node:child_process` and `node:readline`.

## Credentials

Tokens are read from `~/.codex/auth.json`, the store the app itself writes after OAuth login. The
client reads it programmatically, keeps the tokens in memory, never prints them, and never writes
the file back — so the app's own session stays intact. If the access token is within 60s of expiry
(or a request comes back 401), it refreshes against `https://auth.openai.com/oauth/token` in memory
and replays the request once.

`ChatGPT-Account-Id` is not stored anywhere; it comes from the access token's own JWT claim
`["https://api.openai.com/auth"].chatgpt_account_id`.

## Quick start

```sh
bun run chatgpt-poc.ts whoami
bun run chatgpt-poc.ts list --limit 10
bun run chatgpt-poc.ts send "what is the capital of Sweden"
bun run chatgpt-poc.ts send -c <conversation-id> -m gpt-5-5-thinking "and Norway?"
```

## Architecture

The app is three layers deep, and this client collapses them into one process:

```
React webview (zero network I/O)
      │  Electron IPC
main process fetch wrapper  ── strips marker headers, injects real credentials
      │  HTTPS
https://chatgpt.com/backend-api

Rust `codex` binary ── owns OAuth tokens, serves app-server JSON-RPC over stdio
```

The renderer never holds a token. It sets marker headers (`X-OpenAI-Attach-Auth: 1`,
`X-OpenAI-Attach-DeviceCheck-Token: 1`, …) and the main process swaps them for
`Authorization: Bearer …`, `ChatGPT-Account-Id`, and the User-Agent before the request leaves.

### Modules

| file | what it owns |
| --- | --- |
| `src/auth.js` | `~/.codex/auth.json`, refresh, JWT claims, account id, device id |
| `src/http.js` | request core, header personas, query building, SSE + NDJSON decoders |
| `src/sentinel.js` | the integrity handshake: fingerprint, proof-of-work, turnstile dispatch |
| `src/turnstile.js` | the `dx` challenge VM, ported from the app bundle |
| `src/browser-env.js` | the minimal fake `window` the VM runs against |
| `src/chrome-solver.js` | headless-Chrome fallback solver |
| `src/routes.js` | declarative catalog of all 151 backend-api endpoints |
| `src/client.js` | generated per-route methods plus the composite flows |
| `src/realtime.js` | `/celsius/ws/user` push channel, dictation stream |
| `src/appserver.js` | JSON-RPC bridge to the local `codex app-server` |
| `src/cli.js` | the command line |
| `src/index.js` | barrel export for library use |

### Base URL

`CODEX_API_BASE_URL` wins if set. Otherwise `CODEX_API_ENDPOINT=localhost` selects
`http://localhost:8000/api`; the default is `https://chatgpt.com/backend-api`. `--base-url` overrides
all of it.

### Personas

Two header identities, matching the two the app uses:

- **browser** (default, `--persona browser`) — `originator: Codex Browser`, a Chrome 140 UA and the
  matching `sec-ch-ua` set. This persona must solve sentinel challenges.
- **desktop** (`--persona desktop`) — `originator: Codex Desktop`. The real app pairs this with an
  Apple DeviceCheck attestation, which bypasses sentinel entirely. Without a signed binary you
  cannot mint that token, so this persona is here for completeness rather than for use.

## The anti-abuse handshake

Despite the name people use for it, "turnstile" here is **not** Cloudflare — it is OpenAI's own
`sentinel` system. A chat turn is gated on it:

1. Build a 25-slot browser fingerprint array (`p`), base64 it behind the `gAAAAAC` prefix.
2. `POST /sentinel/chat-requirements/prepare` with that `p`.
3. The response asks for a proof-of-work (FNV-1a + murmur3 over a seed until the hash clears a
   difficulty prefix) and often a `dx` payload — an XOR-encrypted program for a small register
   machine that must run against a browser-shaped `window` and return a token.
4. `POST /f/conversation/prepare` with the answers, receive a `conduit_token`.
5. `POST /f/conversation` with that token and `client_prepare_state: 'success'`.

`src/turnstile.js` interprets the VM in-process against the synthetic window in
`src/browser-env.js`. When a challenge reaches for something that fake window doesn't have, pass
`--solver chrome` and the whole thing is evaluated in a real headless Chrome instead.

## Streaming

Turn responses are SSE. The app requests `supported_encodings: ['v1']`, which switches deltas to
compact JSON patches — `{p, o, v}` where `p` is a JSON-pointer path, `o` the operation, `v` the
value, and an omitted `p` means "same path as last time". `client.send()` decodes that into a plain
stream of `{type: 'delta' | 'meta' | 'event' | 'done'}`. `client.streamEvents(res)` gives you the
raw events instead, and `send --raw` prints them.

File-processing responses are NDJSON rather than SSE; `client.processUpload()` handles those.

## Commands

```
conversations
  list [--limit N] [--offset N] [--archived] [--starred] [--project ID]
  read <id> [--json]              search <query>
  send [-c ID] [-m MODEL] [--project ID] [--effort E] [--temporary]
       [--attach FILE]... [--raw] [--json] <text>
  rename <id> <title>             branch <id> <message_id>
  archive <id> [--undo]           star <id> [--undo]           delete <id>
  share <id> [--v1]               files <id>                   export <id> [--out FILE]

account & config
  whoami | models | settings | usage | pins

files
  upload <file> [--use-case codex]        download <file_id> [--out FILE]

realtime
  watch                          stream the /celsius/ws/user push channel

app-server (local codex agent, JSON-RPC over stdio)
  agent methods                  list every RPC method
  agent call <method> [json]     one request
  agent threads                  thread/list

generic
  api <route> [--key value|--key=value]...   call any catalogued endpoint
  routes [filter]                            list the endpoint catalog

global flags: --solver node|chrome   --base-url URL   --json   --persona browser|desktop
```

## The route catalog

`src/routes.js` lists every endpoint the renderer can reach — 151 of them, covering conversations,
streaming, models, files and library, projects and gizmos, sharing and pins, account and billing,
connectors, the ecosystem/MCP surface, the Codex desktop surfaces, and the whole `/wham/*` cloud
("work mode") surface: tasks, turns, environments, PRs, remote control, profiles, usage.

Every path in the catalog was verified to appear verbatim in the shipped bundles
(`webview/assets/app-initial-*.js` and `.vite/build/*.js`) — nothing here is guessed. Verbs come from
the `safeGet` / `safePost` / `safePatch` / `safeDelete` / `streamPost` call site of each one.

Each entry becomes a client method of the same name and a CLI subcommand:

```sh
bun run chatgpt-poc.ts routes wham          # filter the catalog
bun run chatgpt-poc.ts api getUserSettings
bun run chatgpt-poc.ts api whamListTasks --limit=5
bun run chatgpt-poc.ts api getConversation --conversation_id=<id>
```

Path `{placeholders}` are filled from the argument object, declared `query` keys become the query
string, and everything left over becomes the JSON body.

Two endpoints are MCP hosts rather than plain REST — `/wham/apps` and `/ecosystem/call_mcp` take a
JSON-RPC envelope. `client.listAppTools()` and `client.callAppTool(name, args)` wrap the first.

## Uploads

`client.uploadFile({bytes, fileName})` runs the full three-step dance: `POST /files` to register,
then a body upload, then `POST /files/{id}/uploaded` to finalize. The middle step has three shapes
depending on what the server hands back — an Azure Blob `PUT` with `x-ms-blob-type: BlockBlob` (auth
headers suppressed, since the SAS URL carries its own), or one of two OpenAI "Estuary" variants
(multipart `upload_content_bytes`, or `upload_content_and_finalize`). `send --attach FILE` uploads
and attaches in one step.

## Realtime

- `openConversationSocket(client)` — `GET /celsius/ws/user` returns a `websocket_url`; the socket
  then pushes base64-wrapped frames which the helper decodes. This is how the app learns about
  conversations changing in other clients. `watch` prints the stream.
- `openDictationStream(client)` — the voice-input socket, opened with the subprotocols
  `['chatgpt-dictation', 'openai-bearer.<token>']`.

## The local app-server

Not everything the app does is HTTP. Local agent work — threads, turns with tool calls, sandboxed
exec, config, MCP app hosting — goes to the Rust binary the app spawns:

```
codex -c features.code_mode_host=true app-server --analytics-default-enabled
```

It speaks newline-delimited JSON-RPC 2.0 over stdio (**not** Content-Length framed, despite looking
like LSP), handshaking `initialize` → `initialized`. `src/appserver.js` wraps it:

```js
const server = await AppServer.start()
server.onRequest(async (method) => ({ decision: 'decline' }))   // approval prompts
for await (const msg of server.runTurn({ threadId, input })) console.log(msg.method)
await server.close()
```

`APP_SERVER_METHODS` lists the RPCs it exports and `APP_SERVER_NOTIFICATIONS` the ones it pushes.
Set `CODEX_BIN` to point at a different binary.

## Library use

```js
import { Auth, ChatGPTClient } from './src/index.ts'

const client = new ChatGPTClient({ auth: await Auth.load(), solver: 'node' })
for await (const chunk of client.send({ text: 'hello' })) {
  if (chunk.type === 'delta') process.stdout.write(chunk.text)
}
```

## Scope

This is a reverse-engineering exercise against the user's own account and their own installed app.
It reads local credentials that already exist on the machine; it does not obtain, store, or transmit
new ones. The sentinel work exists to make a legitimate first-party client interoperable, and every
request it makes is one the installed app would make with the same account.


## TypeScript development

```sh
bun install
bun run check
bun run build
bun run chatgpt-poc.ts routes
```

The generated `dist/` tree is Node.js-compatible ESM. Dynamic protocol payloads and the reverse-engineered challenge VM intentionally retain permissive internal typing; public module boundaries compile to declarations.
