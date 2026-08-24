---
editUrl: false
next: false
prev: false
title: "RequestOptions"
---

Defined in: [src/http.ts:23](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L23)

Advanced request controls. `sendAuth: false` is required for external signed URLs; retries default to idempotent methods only.

## Extended by

- [`StreamOptions`](/api/interfaces/streamoptions/)

## Properties

### body?

> `optional` **body?**: `unknown`

Defined in: [src/http.ts:25](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L25)

***

### headers?

> `optional` **headers?**: [`HeaderInput`](/api/type-aliases/headerinput/)

Defined in: [src/http.ts:26](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L26)

***

### query?

> `optional` **query?**: [`Query`](/api/type-aliases/query/)

Defined in: [src/http.ts:24](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L24)

***

### rawBody?

> `optional` **rawBody?**: `boolean`

Defined in: [src/http.ts:28](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L28)

***

### retry?

> `optional` **retry?**: `boolean`

Defined in: [src/http.ts:29](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L29)

***

### retryOn401?

> `optional` **retryOn401?**: `boolean`

Defined in: [src/http.ts:30](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L30)

***

### sendAuth?

> `optional` **sendAuth?**: `boolean`

Defined in: [src/http.ts:31](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L31)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/http.ts:27](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L27)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [src/http.ts:32](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L32)
