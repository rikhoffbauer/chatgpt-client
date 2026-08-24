---
editUrl: false
next: false
prev: false
title: "ConversationSocket"
---

Defined in: [src/realtime.ts:18](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L18)

Owned conversation WebSocket and bounded async message iterator; call `close()` when finished.

## Properties

### socket

> **socket**: `WebSocket`

Defined in: [src/realtime.ts:19](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L19)

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Defined in: [src/realtime.ts:20](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L20)

#### Parameters

##### code?

`number`

##### reason?

`string`

#### Returns

`void`

***

### messages()

> **messages**(): `AsyncIterable`\<`unknown`\>

Defined in: [src/realtime.ts:21](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L21)

#### Returns

`AsyncIterable`\<`unknown`\>
