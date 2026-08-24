---
editUrl: false
next: false
prev: false
title: "ndjson"
---

> **ndjson**(`response`, `options?`): `AsyncGenerator`\<[`NdjsonRecord`](/api/type-aliases/ndjsonrecord/)\>

Defined in: [src/streaming/ndjson.ts:14](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/streaming/ndjson.ts#L14)

Parses bounded NDJSON records and throws `INVALID_NDJSON` in strict mode.

## Parameters

### response

`Response`

### options?

[`NdjsonOptions`](/api/interfaces/ndjsonoptions/) = `{}`

## Returns

`AsyncGenerator`\<[`NdjsonRecord`](/api/type-aliases/ndjsonrecord/)\>
