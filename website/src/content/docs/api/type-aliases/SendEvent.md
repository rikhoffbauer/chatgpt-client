---
editUrl: false
next: false
prev: false
title: "SendEvent"
---

> **SendEvent** = \{ `text`: `string`; `type`: `"delta"`; \} \| \{ `conversationId`: `string`; `messageId`: `string` \| `null`; `type`: `"meta"`; \} \| \{ `data`: `unknown`; `event`: `string` \| `null`; `type`: `"event"`; \} \| \{ `conversationId`: `string` \| `null`; `type`: `"done"`; \}

Defined in: [src/client.ts:173](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L173)

Events emitted by [ChatGPTClient.send](/api/classes/chatgptclient/#send): text deltas, identifiers, raw protocol events, and terminal completion.
