---
title: Environment variables and defaults
description: Configure authentication, endpoints, deadlines, retries, buffers, queues, uploads, and downloads.
---

All byte and time limits must be positive safe integers. Invalid values fail configuration rather than falling back silently.

| Variable | Default | Purpose |
|---|---:|---|
| `CODEX_AUTH_PATH` | `~/.codex/auth.json` | OAuth token store. |
| `CODEX_API_BASE_URL` | production backend | Explicit backend URL. |
| `CODEX_API_ENDPOINT=localhost` | unset | Select `http://localhost:8000/api`. |
| `CODEX_BIN` | app bundle, then `PATH` | Codex executable for app-server. |
| `CHATGPT_DESKTOP_CLIENT_STATE_PATH` | XDG config path | Persistent device identity. |
| `CHATGPT_CLIENT_REQUEST_TIMEOUT_MS` | `60000` | Per-request deadline. |
| `CHATGPT_CLIENT_CONNECT_TIMEOUT_MS` | `15000` | Realtime connection deadline. |
| `CHATGPT_CLIENT_RETRY_ATTEMPTS` | `3` | Maximum idempotent attempts. |
| `CHATGPT_CLIENT_RETRY_BASE_MS` | `250` | Initial retry delay. |
| `CHATGPT_CLIENT_RETRY_MAX_MS` | `5000` | Maximum retry delay. |
| `CHATGPT_CLIENT_RESPONSE_BYTES` | `8388608` | Buffered response limit. |
| `CHATGPT_CLIENT_STREAM_LINE_BYTES` | `2097152` | Stream line limit. |
| `CHATGPT_CLIENT_STREAM_EVENT_BYTES` | `8388608` | SSE event limit. |
| `CHATGPT_CLIENT_QUEUE_SIZE` | `1024` | Async queue limit. |
| `CHATGPT_CLIENT_UPLOAD_BYTES` | `536870912` | Upload limit. |
| `CHATGPT_CLIENT_DOWNLOAD_BYTES` | `536870912` | Download limit. |

Programmatic overrides passed to constructors take precedence. Keep defaults finite in every environment, including tests and local endpoints.
