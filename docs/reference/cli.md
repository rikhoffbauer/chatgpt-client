---
title: CLI command reference
description: Command groups, global options, structured output, and safety behavior for chatgpt-client.
---

Run `chatgpt-client --help` for the exact commands in the installed revision.

## Conversations

| Command | Purpose |
|---|---|
| `list [--limit N] [--offset N] [--archived] [--starred]` | List conversation summaries. |
| `read <conversation-id> [--json]` | Read one conversation. |
| `search <query>` | Search history. |
| `send [-c ID] [-m MODEL] [--attach FILE]... <text>` | Start or continue a conversation. |
| `rename`, `branch`, `archive`, `star`, `delete`, `share` | Mutate a selected conversation. |
| `files`, `export` | Inspect or export conversation content. |

## Account, files, realtime, and routes

| Command | Purpose |
|---|---|
| `whoami`, `models`, `settings`, `usage`, `pins` | Inspect account state. |
| `memories` | Retrieve saved memory entries and token accounting. |
| `memory-summary` | Retrieve the generated About You summary and follow-up prompts. |
| `upload <file>`, `download <file-id>` | Transfer bounded files. |
| `watch` | Print realtime conversation events. |
| `agent methods|call|threads` | Use the local Codex app-server. |
| `routes [filter]` | List catalogued route names. |
| `api <route> [--key value]` | Call a route with runtime argument validation. |

## Global options

- `--base-url URL`
- `--solver node|chrome`
- `--persona browser|desktop`
- `--timeout MS`
- `--json` or `--json-stream`
- `--verbose` or `--quiet`

Use `--json` with either memory command to emit the complete endpoint response:

```sh
chatgpt-client memories --json
chatgpt-client memory-summary --json
```

Without `--json`, `memories` prints one entry per line and `memory-summary` prints readable sections. Both commands use the normal request deadline, cancellation handling, and automatic real-Chrome fallback when Cloudflare challenges the same-origin request.

Structured failures include stable error codes. Output files are created without overwriting existing paths.
