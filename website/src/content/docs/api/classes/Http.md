---
editUrl: false
next: false
prev: false
title: "Http"
---

Defined in: [src/http.ts:97](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L97)

Low-level authenticated transport with token refresh, finite deadlines, bounded bodies, and idempotent retries.
Use `sendAuth: false` whenever a request targets an external signed URL.

## Constructors

### Constructor

> **new Http**(`options`): `Http`

Defined in: [src/http.ts:110](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L110)

#### Parameters

##### options

[`HttpOptions`](/api/interfaces/httpoptions/)

#### Returns

`Http`

## Properties

### appVersion

> `readonly` **appVersion**: `string`

Defined in: [src/http.ts:101](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L101)

***

### auth

> `readonly` **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/http.ts:98](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L98)

***

### baseUrl

> `readonly` **baseUrl**: `string`

Defined in: [src/http.ts:99](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L99)

***

### config

> `readonly` **config**: [`ClientConfig`](/api/interfaces/clientconfig/)

Defined in: [src/http.ts:102](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L102)

***

### persona

> `readonly` **persona**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/http.ts:100](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L100)

## Methods

### delete()

> **delete**\<`T`\>(`path`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:261](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L261)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### options?

[`RequestOptions`](/api/interfaces/requestoptions/) = `{}`

#### Returns

`Promise`\<`T`\>

***

### get()

> **get**\<`T`\>(`path`, `query?`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:245](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L245)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### query?

[`Query`](/api/type-aliases/query/)

##### options?

`Omit`\<[`RequestOptions`](/api/interfaces/requestoptions/), `"query"`\> = `{}`

#### Returns

`Promise`\<`T`\>

***

### headers()

> **headers**(`extra?`, `options?`): `Promise`\<`Headers`\>

Defined in: [src/http.ts:135](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L135)

#### Parameters

##### extra?

[`HeaderInput`](/api/type-aliases/headerinput/) = `{}`

##### options?

###### sendAuth?

`boolean`

#### Returns

`Promise`\<`Headers`\>

***

### json()

> **json**\<`T`\>(`method`, `path`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:229](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L229)

Reads a bounded response body, throws [HttpError](/api/classes/httperror/) for non-success status, and decodes JSON when possible.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### method

[`HttpMethod`](/api/type-aliases/httpmethod/)

##### path

`string`

##### options?

[`RequestOptions`](/api/interfaces/requestoptions/) = `{}`

#### Returns

`Promise`\<`T`\>

***

### patch()

> **patch**\<`T`\>(`path`, `body?`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:257](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L257)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### body?

`unknown` = `{}`

##### options?

`Omit`\<[`RequestOptions`](/api/interfaces/requestoptions/), `"body"`\> = `{}`

#### Returns

`Promise`\<`T`\>

***

### post()

> **post**\<`T`\>(`path`, `body?`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:249](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L249)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### body?

`unknown` = `{}`

##### options?

`Omit`\<[`RequestOptions`](/api/interfaces/requestoptions/), `"body"`\> = `{}`

#### Returns

`Promise`\<`T`\>

***

### put()

> **put**\<`T`\>(`path`, `body`, `options?`): `Promise`\<`T`\>

Defined in: [src/http.ts:253](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L253)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### path

`string`

##### body

`unknown`

##### options?

`Omit`\<[`RequestOptions`](/api/interfaces/requestoptions/), `"body"`\> = `{}`

#### Returns

`Promise`\<`T`\>

***

### readBytes()

> **readBytes**(`response`, `options?`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [src/http.ts:266](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L266)

Reads response bytes with a finite deadline and configured or explicit maximum size.

#### Parameters

##### response

`Response`

##### options?

[`ResponseReadOptions`](/api/interfaces/responsereadoptions/) = `{}`

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### readText()

> **readText**(`response`, `options?`): `Promise`\<`string`\>

Defined in: [src/http.ts:279](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L279)

#### Parameters

##### response

`Response`

##### options?

[`ResponseReadOptions`](/api/interfaces/responsereadoptions/) = `{}`

#### Returns

`Promise`\<`string`\>

***

### request()

> **request**(`method`, `path`, `options?`): `Promise`\<`Response`\>

Defined in: [src/http.ts:169](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L169)

Sends one request, refreshing auth once on 401 and retrying only when allowed by the bounded policy.

#### Parameters

##### method

[`HttpMethod`](/api/type-aliases/httpmethod/)

##### path

`string`

##### options?

[`RequestOptions`](/api/interfaces/requestoptions/) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### stream()

> **stream**(`method`, `path`, `options?`): `Promise`\<`Response`\>

Defined in: [src/http.ts:284](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L284)

#### Parameters

##### method

[`HttpMethod`](/api/type-aliases/httpmethod/)

##### path

`string`

##### options?

[`StreamOptions`](/api/interfaces/streamoptions/) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### url()

> **url**(`path`, `query?`): `string`

Defined in: [src/http.ts:127](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/http.ts#L127)

#### Parameters

##### path

`string`

##### query?

[`Query`](/api/type-aliases/query/)

#### Returns

`string`
