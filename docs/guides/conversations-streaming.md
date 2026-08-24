---
title: Conversations and streaming
description: Send turns, consume bounded stream events, call typed routes, and traverse conversation history.
---

## Send and consume events

`send()` yields a discriminated `SendEvent` stream:

```ts
let conversationId: string | undefined

for await (const event of client.send({ text: 'Write a haiku about queues.' })) {
  switch (event.type) {
    case 'delta':
      process.stdout.write(event.text)
      break
    case 'image':
      console.error('generated image', event.image.file_id, event.image.mime_type)
      break
    case 'meta':
      conversationId = event.conversationId
      break
    case 'event':
      console.error(event.event, event.data)
      break
    case 'done':
      console.error('done', event.conversationId)
      break
  }
}
```

Consume the iterator promptly. Incoming lines, SSE events, and queues have finite limits and fail explicitly if a producer outruns the consumer.

Generated images are emitted as `image` events containing the image asset pointer, file ID, dimensions, and available metadata. `send()` does not download image bytes automatically; use the existing bounded download helper when you need them:

```ts
for await (const event of client.send({ text: 'Generate a square landscape.' })) {
  if (event.type !== 'image') continue
  const { bytes, info } = await client.downloadFile(event.image.file_id)
  // Persist `bytes` using your application’s output policy; `info` has server metadata.
}
```

Image events are reserved for ChatGPT image-generation tool results. Input attachments and unrelated tool media remain raw protocol events.

## Typed routes and generic calls

The `routes` facade infers required path parameters and rejects unused arguments by default:

```ts
const conversation = await client.routes.getConversation({
  conversation_id: conversationId,
})

const tasks = await client.call('whamListTasks', {
  limit: 20,
  status: 'active',
})
```

Private route names, arguments, and response shapes may change. Unknown result shapes remain `unknown`; validate them at your application boundary.

## Read history incrementally

Use `iterateConversations()` to avoid buffering every history page. For one conversation, `ChatGPTClient.messageChain()` follows its active node chain and detects corrupt cycles; `renderParts()` extracts readable text from message parts.
