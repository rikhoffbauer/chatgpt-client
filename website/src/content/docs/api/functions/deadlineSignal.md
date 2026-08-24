---
editUrl: false
next: false
prev: false
title: "deadlineSignal"
---

> **deadlineSignal**(`operation`, `timeoutMs`, `parent?`): [`Deadline`](/api/interfaces/deadline/)

Defined in: [src/abort.ts:10](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/abort.ts#L10)

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
