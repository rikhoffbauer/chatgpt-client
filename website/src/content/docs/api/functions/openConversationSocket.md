---
editUrl: false
next: false
prev: false
title: "openConversationSocket"
---

> **openConversationSocket**(`client`, `options?`): `Promise`\<[`ConversationSocket`](/api/interfaces/conversationsocket/)\>

Defined in: [src/realtime.ts:25](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L25)

Opens the private conversation realtime channel with a finite handshake deadline and bounded queue.

## Parameters

### client

[`ChatGPTClient`](/api/classes/chatgptclient/)

### options?

[`ConversationSocketOptions`](/api/interfaces/conversationsocketoptions/) = `{}`

## Returns

`Promise`\<[`ConversationSocket`](/api/interfaces/conversationsocket/)\>
