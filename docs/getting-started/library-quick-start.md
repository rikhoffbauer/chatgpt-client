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

## Public API tiers

- **Primary:** `ChatGPTClient`, `Auth`, `AppServer`, their options, and stable error classes.
- **Advanced:** route catalog/facade, raw HTTP, realtime sockets, and bounded streaming primitives.
- **Protocol compatibility:** browser, integrity, proof-of-work, and Turnstile exports. These are unstable and security-sensitive; isolate their use.

Continue with [conversations and streaming](/guides/conversations-streaming/) and [cancellation and limits](/guides/cancellation-limits/).
