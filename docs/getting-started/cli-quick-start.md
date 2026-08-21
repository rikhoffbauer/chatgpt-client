---
title: CLI quick start
description: Build and use the command-line client for conversations, files, routes, and local Codex.
---

Build the executable and inspect its help:

```sh
npm run build
node dist/bin.js --help
```

When linked as `chatgpt-client`, common commands are:

```sh
chatgpt-client whoami --json
chatgpt-client models
chatgpt-client list --limit 10
chatgpt-client send --json-stream "Give two uses for AbortSignal"
chatgpt-client read <conversation-id> --json
```

Use `--json` for one structured result and `--json-stream` for one JSON object per streamed event. The streaming form avoids buffering the complete answer.

## Files and generic routes

```sh
chatgpt-client upload ./notes.md
chatgpt-client send --attach ./notes.md "Summarize this file"
chatgpt-client download <file-id> --out ./download.bin
chatgpt-client routes wham
chatgpt-client api getConversation --conversation_id=<id> --json
```

The CLI refuses to overwrite exported or downloaded files. See the complete [CLI command reference](/reference/cli/).
