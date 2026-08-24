---
editUrl: false
next: false
prev: false
title: "StreamOptions"
---

Defined in: [src/http.ts:35](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L35)

Advanced request controls. `sendAuth: false` is required for external signed URLs; retries default to idempotent methods only.

## Extends

- [`RequestOptions`](/api/interfaces/requestoptions/)

## Properties

### body?

> `optional` **body?**: `unknown`

Defined in: [src/http.ts:25](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L25)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`body`](/api/interfaces/requestoptions/#body)

***

### format?

> `optional` **format?**: [`StreamFormat`](/api/type-aliases/streamformat/)

Defined in: [src/http.ts:36](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L36)

***

### headers?

> `optional` **headers?**: [`HeaderInput`](/api/type-aliases/headerinput/)

Defined in: [src/http.ts:26](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L26)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`headers`](/api/interfaces/requestoptions/#headers)

***

### query?

> `optional` **query?**: [`Query`](/api/type-aliases/query/)

Defined in: [src/http.ts:24](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L24)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`query`](/api/interfaces/requestoptions/#query)

***

### rawBody?

> `optional` **rawBody?**: `boolean`

Defined in: [src/http.ts:28](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L28)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`rawBody`](/api/interfaces/requestoptions/#rawbody)

***

### retry?

> `optional` **retry?**: `boolean`

Defined in: [src/http.ts:29](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L29)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`retry`](/api/interfaces/requestoptions/#retry)

***

### retryOn401?

> `optional` **retryOn401?**: `boolean`

Defined in: [src/http.ts:30](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L30)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`retryOn401`](/api/interfaces/requestoptions/#retryon401)

***

### sendAuth?

> `optional` **sendAuth?**: `boolean`

Defined in: [src/http.ts:31](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L31)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`sendAuth`](/api/interfaces/requestoptions/#sendauth)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/http.ts:27](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L27)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`signal`](/api/interfaces/requestoptions/#signal)

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [src/http.ts:32](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L32)

#### Inherited from

[`RequestOptions`](/api/interfaces/requestoptions/).[`timeoutMs`](/api/interfaces/requestoptions/#timeoutms)
