---
editUrl: false
next: false
prev: false
title: "sleep"
---

> **sleep**(`ms`, `signal?`): `Promise`\<`void`\>

Defined in: [src/abort.ts:35](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/abort.ts#L35)

Waits for the requested delay, rejecting immediately or during the wait when `signal` aborts.

## Parameters

### ms

`number`

### signal?

`AbortSignal`

## Returns

`Promise`\<`void`\>
