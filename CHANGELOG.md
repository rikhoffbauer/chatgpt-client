# Changelog

## 1.0.0 - 2026-07-30

- Replaced file-level TypeScript suppression with strict, declaration-emitting TypeScript.
- Added a typed route facade over the complete route catalog.
- Added deadlines, cancellation, bounded idempotent retries, and refresh deduplication.
- Added bounded SSE, NDJSON, line, WebSocket, JSON-RPC, upload, and download handling.
- Prevented ChatGPT credentials from being forwarded to external signed blob URLs.
- Added deterministic app-server process lifecycle and pending-request failure handling.
- Added strict CLI parsing, structured errors, output overwrite protection, and EPIPE handling.
- Added 24 offline tests and architecture/security documentation.
