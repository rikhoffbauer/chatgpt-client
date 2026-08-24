---
editUrl: false
next: false
prev: false
title: "SendEvent"
---

> **SendEvent** = \{ `text`: `string`; `type`: `"delta"`; \} \| \{ `image`: [`GeneratedImage`](/api/interfaces/generatedimage/); `type`: `"image"`; \} \| \{ `conversationId`: `string`; `messageId`: `string` \| `null`; `type`: `"meta"`; \} \| \{ `data`: `unknown`; `event`: `string` \| `null`; `type`: `"event"`; \} \| \{ `conversationId`: `string` \| `null`; `type`: `"done"`; \}

Defined in: [src/client.ts:185](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L185)

Events emitted by [ChatGPTClient.send](/api/classes/chatgptclient/#send): text deltas, generated images, identifiers, raw protocol events, and terminal completion.
