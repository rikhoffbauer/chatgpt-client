# Architecture

## Dependency direction

```text
CLI ───────────────┐
                   v
route facade -> ChatGPTClient -> Http -> Auth
                   |             |
                   |             +-> bounded streaming parsers
                   +-> protocol integrity boundary
                   +-> realtime WebSockets

CLI/library -> AppServer -> bounded JSON-RPC child process
```

Lower layers do not import the CLI or high-level client.

## Configuration

`defaultConfig` resolves environment variables once per constructed client and supplies finite defaults for retries, deadlines, parser sizes, queue sizes, and transfer sizes. Callers can override specific values without rebuilding the whole configuration object.

## Authentication

`Auth` loads the existing Codex auth store, parses JWT claims without treating them as verification, refreshes expiring access tokens, and deduplicates concurrent refresh attempts. The generated device ID is written atomically with mode `0600` under the XDG configuration directory by default.

## HTTP transport

`Http` owns authenticated header construction and the retry/deadline policy.

- A fresh deadline is created for each attempt.
- `401` triggers at most one forced token refresh and replay.
- Retry status codes apply only to idempotent methods unless explicitly enabled.
- `Retry-After` is honored up to the configured maximum delay.
- Response bodies are read through byte limits and a separate body-consumption deadline.
- URL query secrets are redacted in errors and logs.
- `sendAuth: false` produces a minimal header set for external URLs.

## Route catalog and facade

`ROUTES` is data, not generated executable code. `createRouteApi` exposes catalog names as methods. Type-level parsing makes path placeholders required in the method argument type. Runtime decomposition removes path/query fields and places the remaining fields into the configured body. Strict mode rejects unused keys.

The generic route result remains `unknown` unless a higher-level API supplies a stable shape. This is intentional: undocumented backend payloads drift, and pretending every route has a stable response type would be less safe than forcing callers to validate it.

## Streaming

The streaming layer contains four reusable primitives:

- `readLines`: bounded UTF-8 line framing;
- `sseEvents`: bounded Server-Sent Event framing;
- `ndjson`: strict or lenient NDJSON parsing;
- `AsyncQueue`: bounded producer/consumer coordination that fails on overflow.

Cancellation propagates through readers. A consumer that stops early releases its stream lock.

## High-level client

`ChatGPTClient` composes auth, transport, routes, integrity preparation, and stream decoding. It exposes dedicated methods for common workflows so protocol validation is centralized:

- conversation turns and text deltas;
- file upload/finalization and download;
- conversation chain reconstruction;
- sharing and connector helpers;
- heartbeat lifecycle.

The client never retries side-effecting conversation sends automatically.

## Realtime

Realtime sockets have a connection deadline and bounded inbound queue. Close, error, cancellation, and queue overflow terminate iteration deterministically.

## Local app-server

`AppServer` owns a single child process and a JSON-RPC request map.

- Pending calls are bounded and timed out.
- Each completed call removes its timer and abort listener.
- Process exit rejects all pending calls.
- Oversized output lines fail the session.
- Turn notifications use a bounded queue.
- Shutdown escalates from stdin close and `SIGTERM` to `SIGKILL` after a finite wait.
- Server-originated requests require an embedding-provided handler.

## Protocol boundary

`src/protocol/` contains browser compatibility and integrity adapters. They have explicit step, payload, pending-request, and execution-time limits. No other module depends on their internals.

## Error model

Expected failures use `ClientError` subclasses with stable `code` values and JSON-safe details. The CLI can serialize these errors with `--json`. Unexpected errors are reported as `UNEXPECTED_ERROR` without fabricating structured details.
