---
editUrl: false
next: false
prev: false
title: "DictationStream"
---

Defined in: [src/realtime.ts:139](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L139)

Owned PCM16 dictation stream; call `stop()` to end the session and close its socket.

## Properties

### socket

> **socket**: `WebSocket`

Defined in: [src/realtime.ts:140](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L140)

## Methods

### commit()

> **commit**(): `void`

Defined in: [src/realtime.ts:142](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L142)

#### Returns

`void`

***

### sendAudio()

> **sendAudio**(`pcm16`): `void`

Defined in: [src/realtime.ts:141](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L141)

#### Parameters

##### pcm16

`Uint8Array`

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [src/realtime.ts:143](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L143)

#### Returns

`void`
