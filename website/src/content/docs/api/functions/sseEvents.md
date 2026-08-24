---
editUrl: false
next: false
prev: false
title: "sseEvents"
---

> **sseEvents**(`response`, `options?`): `AsyncGenerator`\<[`SseEvent`](/api/interfaces/sseevent/)\>

Defined in: [src/streaming/sse.ts:19](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/streaming/sse.ts#L19)

Parses a bounded Server-Sent Events response, preserving event ID and retry metadata.

## Parameters

### response

`Response`

### options?

[`SseOptions`](/api/interfaces/sseoptions/) = `{}`

## Returns

`AsyncGenerator`\<[`SseEvent`](/api/interfaces/sseevent/)\>
