---
title: Authentication and configuration
description: Load local OAuth credentials, refresh them safely, and configure the client without leaking secrets.
---

## Load the desktop auth store

`ChatGPTClient.create()` calls `Auth.load()` unless an `Auth` instance is supplied:

```ts
import { Auth, ChatGPTClient } from 'chatgpt-client'

const auth = await Auth.load({ path: '/private/path/auth.json' })
const client = new ChatGPTClient({ auth })
```

The default path is `CODEX_AUTH_PATH`, then `~/.codex/auth.json`. The file is expected to use the token layout written by ChatGPT/Codex desktop tooling.

`Auth.ensureFresh()` refreshes only when the access token is expiring and a refresh token exists. Concurrent refresh calls share one in-flight request. Refreshes have a finite deadline and update the auth store atomically when loaded from disk.

## Configuration precedence

Constructor overrides take precedence over environment variables, which take precedence over finite defaults. Override only the bounds your application can safely support:

```ts
const client = await ChatGPTClient.create({
  baseUrl: 'https://chatgpt.com/backend-api',
  config: {
    limits: {
      requestTimeoutMs: 30_000,
      responseBodyBytes: 4 * 1024 * 1024,
      queueSize: 256,
    },
  },
})
```

Use [environment variables and defaults](../reference/environment/) for the full list.

:::danger[Protect credentials]
Never log or commit access tokens, refresh tokens, ID tokens, account IDs, auth files, or signed blob URLs. Use `serializeError()` for structured output; HTTP URLs redact credential-like query parameters.
:::
