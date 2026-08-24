---
editUrl: false
next: false
prev: false
title: "DictationOptions"
---

Defined in: [src/realtime.ts:130](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L130)

Audio rate, callbacks, cancellation, and finite connection timeout for dictation.

## Properties

### connectTimeoutMs?

> `optional` **connectTimeoutMs?**: `number`

Defined in: [src/realtime.ts:135](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L135)

***

### onEvent?

> `optional` **onEvent?**: (`event`) => `void`

Defined in: [src/realtime.ts:133](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L133)

#### Parameters

##### event

`unknown`

#### Returns

`void`

***

### onTranscript?

> `optional` **onTranscript?**: (`text`, `event`) => `void`

Defined in: [src/realtime.ts:132](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L132)

#### Parameters

##### text

`string`

##### event

`unknown`

#### Returns

`void`

***

### sampleRateHz?

> `optional` **sampleRateHz?**: `number`

Defined in: [src/realtime.ts:131](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L131)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/realtime.ts:134](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/realtime.ts#L134)
