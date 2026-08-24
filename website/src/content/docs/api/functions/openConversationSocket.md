---
editUrl: false
next: false
prev: false
title: "openConversationSocket"
---

> **openConversationSocket**(`client`, `options?`): `Promise`\<[`ConversationSocket`](/api/interfaces/conversationsocket/)\>

Defined in: [src/realtime.ts:25](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L25)

Opens the private conversation realtime channel with a finite handshake deadline and bounded queue.

## Parameters

### client

[`ChatGPTClient`](/api/classes/chatgptclient/)

### options?

[`ConversationSocketOptions`](/api/interfaces/conversationsocketoptions/) = `{}`

## Returns

`Promise`\<[`ConversationSocket`](/api/interfaces/conversationsocket/)\>
