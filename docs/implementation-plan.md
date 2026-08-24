# Productionization plan

## Status

Completed and verified on 2026-07-30.

## Success criteria

1. No `@ts-nocheck`, implicit `any`, or unbounded public inputs.
2. HTTP requests have cancellation, deadlines, bounded retries, safe error previews, and auth-refresh deduplication.
3. SSE, NDJSON, WebSocket, and JSON-RPC streams have explicit size/queue limits and deterministic shutdown.
4. The complete route catalog remains callable through a typed route façade; common workflows have concrete types.
5. The CLI validates arguments, handles signals, supports machine-readable errors, and never prints credentials.
6. Unit and integration tests run without a ChatGPT account or external network access.
7. Documentation describes architecture, unsupported protocol risks, and operational boundaries.

## Execution

1. Establish strict project and error/config primitives.
2. Replace transport and stream parsing with bounded implementations.
3. Refactor authentication and lifecycle management.
4. Refactor route/client/realtime/app-server APIs.
5. Isolate and type protocol-specific integrity code without extending it.
6. Add CLI, tests, docs, build verification, and release archive.
