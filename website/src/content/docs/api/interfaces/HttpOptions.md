---
editUrl: false
next: false
prev: false
title: "HttpOptions"
---

Defined in: [src/http.ts:48](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L48)

Dependencies, authentication, persona, and finite runtime settings for [Http](/api/classes/http/).

## Properties

### appVersion?

> `optional` **appVersion?**: `string`

Defined in: [src/http.ts:52](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L52)

***

### auth

> **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/http.ts:49](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L49)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [src/http.ts:50](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L50)

***

### browserFetch?

> `optional` **browserFetch?**: [`Fetch`](/api/type-aliases/fetch/)

Defined in: [src/http.ts:61](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L61)

Optional same-origin browser fallback for Cloudflare challenge responses.

***

### config?

> `optional` **config?**: `Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object`

Defined in: [src/http.ts:55](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L55)

#### Type Declaration

##### limits?

> `optional` **limits?**: `Partial`\<[`RuntimeLimits`](/api/interfaces/runtimelimits/)\>

##### retry?

> `optional` **retry?**: `Partial`\<[`RetryPolicy`](/api/interfaces/retrypolicy/)\>

***

### deviceIdProvider?

> `optional` **deviceIdProvider?**: () => `Promise`\<`string`\>

Defined in: [src/http.ts:59](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L59)

#### Returns

`Promise`\<`string`\>

***

### fetchImpl?

> `optional` **fetchImpl?**: [`Fetch`](/api/type-aliases/fetch/)

Defined in: [src/http.ts:53](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L53)

***

### logger?

> `optional` **logger?**: [`Logger`](/api/interfaces/logger/)

Defined in: [src/http.ts:54](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L54)

***

### persona?

> `optional` **persona?**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/http.ts:51](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L51)
