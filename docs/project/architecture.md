---
title: Architecture
description: Understand the client layers, supported public boundary, and explicit ownership of resources.
---

The project is a dependency-free runtime client organized around narrow boundaries:

1. **Authentication** loads and refreshes local OAuth credentials.
2. **HTTP transport** applies auth, deadlines, bounded retries, redacted errors, and response limits.
3. **Route catalog and facade** map private endpoint metadata into typed methods.
4. **High-level client** composes conversations, streaming, files, and convenience operations.
5. **Realtime** owns bounded WebSocket iteration for conversations and dictation.
6. **App-server** owns a Codex child process and bounded JSON-RPC state.
7. **Protocol adapters** isolate unstable browser and integrity compatibility behavior.

`src/index.ts` is the package API boundary and the TypeDoc entry point. Primary APIs are `ChatGPTClient`, `Auth`, and `AppServer`. Raw HTTP, route, realtime, and stream exports are advanced building blocks. Browser/integrity exports are explicitly unstable protocol compatibility surfaces.

## Resource ownership

Creators own what they start: close `ChatGPTClient` to stop heartbeats, close realtime sockets/iterators, dispose composed deadlines, and await `AppServer.close()` for deterministic child-process shutdown. Bounded queues and parsers fail rather than grow without limit.
