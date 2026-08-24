---
editUrl: false
next: false
prev: false
title: "readLines"
---

> **readLines**(`source`, `options?`): `AsyncGenerator`\<`string`\>

Defined in: [src/streaming/lines.ts:10](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/lines.ts#L10)

Iterates CRLF/LF text lines, cancels the reader on abort or failure, and rejects oversized lines.

## Parameters

### source

`Response` \| `ReadableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\>

### options?

[`LineReaderOptions`](/api/interfaces/linereaderoptions/) = `{}`

## Returns

`AsyncGenerator`\<`string`\>
