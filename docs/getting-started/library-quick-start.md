---
title: Library quick start
description: Create a client, stream a response, and close resources correctly.
---

Import from the package root; `src/index.ts` is the supported public boundary.

```ts
import { ChatGPTClient } from 'chatgpt-client'

const client = await ChatGPTClient.create()

try {
  const models = await client.routes.getModels({
    history_and_training_disabled: false,
  })
  console.log(models.models?.map((model) => model.slug))

  for await (const event of client.send({
    text: 'Explain why bounded queues matter.',
  })) {
    if (event.type === 'delta') process.stdout.write(event.text)
    if (event.type === 'meta') console.error('conversation:', event.conversationId)
  }
} finally {
  client.close()
}
```

`ChatGPTClient.create()` loads the Codex auth store by default. Supply `authPath` or an explicit `Auth` object when embedding the client elsewhere.

## Read saved user memories

Use the high-level method to retrieve the complete memory entries ChatGPT has saved for the current user:

```ts
const result = await client.getUserMemories()

for (const memory of result.memories) {
  console.log(memory.id, memory.content, memory.status)
}
console.log(`${result.memory_num_tokens}/${result.memory_max_tokens} memory tokens`)
```

`getUserMemories()` sends `GET /memories?include_memory_entries=true`. Memory entries include their dates, status, source conversation, labels, and related metadata.

The generated **About You** summary is available separately:

```ts
const summary = await client.getUserMemorySummary()

for (const section of summary.sections) {
  console.log(section.title, section.description)
}
```

`getUserMemorySummary()` sends `POST /memories/about_you/summary`. It returns sectioned descriptions, generation metadata, and optional follow-up prompts.

## Cloudflare-protected deployments

The client makes the regular Node request first. If ChatGPT returns a same-origin Cloudflare challenge, the default `browserFallback` starts a temporary, headless real-Chrome helper and repeats that request inside the browser renderer. This is the only supported way to preserve the browser's actual network fingerprint; changing headers or copying cookies into Node is not equivalent.

Disable this behavior when a pure-Node transport is required:

```ts
const client = await ChatGPTClient.create({ browserFallback: false })
```

The helper is lazy, restricted to `chatgpt.com`, bounded by the normal response limit, and closed by `client.close()`. Both memory operations accept `{ signal }` for cancellation, use the client's finite request deadline and response-size limit, and reject malformed protocol responses with a `ProtocolError`. Because these are private backend routes, availability and response fields may change without notice.

The endpoints are also available through the advanced route facade as `client.routes.getUserMemories({ include_memory_entries: true })` and `client.routes.getUserMemorySummary()`, whose raw response types remain `unknown`.

## Public API tiers

- **Primary:** `ChatGPTClient`, `Auth`, `AppServer`, their options, and stable error classes.
- **Advanced:** route catalog/facade, raw HTTP, realtime sockets, and bounded streaming primitives.
- **Protocol compatibility:** browser, integrity, proof-of-work, and Turnstile exports. These are unstable and security-sensitive; isolate their use.

Continue with [conversations and streaming](/guides/conversations-streaming/) and [cancellation and limits](/guides/cancellation-limits/).
