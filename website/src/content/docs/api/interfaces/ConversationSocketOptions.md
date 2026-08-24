---
editUrl: false
next: false
prev: false
title: "ConversationSocketOptions"
---

Defined in: [src/realtime.ts:8](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L8)

Callback, cancellation, finite connection timeout, and bounded message queue options.

## Properties

### connectTimeoutMs?

> `optional` **connectTimeoutMs?**: `number`

Defined in: [src/realtime.ts:13](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L13)

***

### onClose?

> `optional` **onClose?**: (`event`) => `void`

Defined in: [src/realtime.ts:11](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L11)

#### Parameters

##### event

`CloseEvent`

#### Returns

`void`

***

### onError?

> `optional` **onError?**: (`error`) => `void`

Defined in: [src/realtime.ts:10](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L10)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### onMessage?

> `optional` **onMessage?**: (`message`) => `void`

Defined in: [src/realtime.ts:9](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L9)

#### Parameters

##### message

`unknown`

#### Returns

`void`

***

### queueSize?

> `optional` **queueSize?**: `number`

Defined in: [src/realtime.ts:14](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L14)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/realtime.ts:12](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L12)
