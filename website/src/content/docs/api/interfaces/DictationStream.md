---
editUrl: false
next: false
prev: false
title: "DictationStream"
---

Defined in: [src/realtime.ts:139](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L139)

Owned PCM16 dictation stream; call `stop()` to end the session and close its socket.

## Properties

### socket

> **socket**: `WebSocket`

Defined in: [src/realtime.ts:140](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L140)

## Methods

### commit()

> **commit**(): `void`

Defined in: [src/realtime.ts:142](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L142)

#### Returns

`void`

***

### sendAudio()

> **sendAudio**(`pcm16`): `void`

Defined in: [src/realtime.ts:141](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L141)

#### Parameters

##### pcm16

`Uint8Array`

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [src/realtime.ts:143](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/realtime.ts#L143)

#### Returns

`void`
