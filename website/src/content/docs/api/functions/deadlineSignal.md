---
editUrl: false
next: false
prev: false
title: "deadlineSignal"
---

> **deadlineSignal**(`operation`, `timeoutMs`, `parent?`): [`Deadline`](/api/interfaces/deadline/)

Defined in: [src/abort.ts:10](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/abort.ts#L10)

Creates an abort signal that inherits a parent signal and aborts with [TimeoutError](/api/classes/timeouterror/) after a finite timeout.

## Parameters

### operation

`string`

### timeoutMs

`number`

### parent?

`AbortSignal`

## Returns

[`Deadline`](/api/interfaces/deadline/)
