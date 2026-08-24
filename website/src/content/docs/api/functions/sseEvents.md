---
editUrl: false
next: false
prev: false
title: "sseEvents"
---

> **sseEvents**(`response`, `options?`): `AsyncGenerator`\<[`SseEvent`](/api/interfaces/sseevent/)\>

Defined in: [src/streaming/sse.ts:19](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/sse.ts#L19)

Parses a bounded Server-Sent Events response, preserving event ID and retry metadata.

## Parameters

### response

`Response`

### options?

[`SseOptions`](/api/interfaces/sseoptions/) = `{}`

## Returns

`AsyncGenerator`\<[`SseEvent`](/api/interfaces/sseevent/)\>
