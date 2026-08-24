---
editUrl: false
next: false
prev: false
title: "ChatGPTClientOptions"
---

Defined in: [src/client.ts:190](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L190)

Dependencies and finite runtime settings for constructing a [ChatGPTClient](/api/classes/chatgptclient/).

## Properties

### appVersion?

> `optional` **appVersion?**: `string`

Defined in: [src/client.ts:195](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L195)

***

### auth

> **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:191](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L191)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [src/client.ts:192](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L192)

***

### browserFallback?

> `optional` **browserFallback?**: `boolean`

Defined in: [src/client.ts:202](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L202)

Uses an isolated real-Chrome renderer when Cloudflare blocks a same-origin request.

***

### config?

> `optional` **config?**: `Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object`

Defined in: [src/client.ts:198](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L198)

#### Type Declaration

##### limits?

> `optional` **limits?**: `Partial`\<[`RuntimeLimits`](/api/interfaces/runtimelimits/)\>

##### retry?

> `optional` **retry?**: `Partial`\<[`RetryPolicy`](/api/interfaces/retrypolicy/)\>

***

### fetchImpl?

> `optional` **fetchImpl?**: [`Fetch`](/api/type-aliases/fetch/)

Defined in: [src/client.ts:196](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L196)

***

### integrityProvider?

> `optional` **integrityProvider?**: (`prepare`, `options`) => `Promise`\<[`IntegrityResult`](/api/interfaces/integrityresult/)\>

Defined in: [src/client.ts:204](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L204)

#### Parameters

##### prepare

[`PrepareRequirements`](/api/type-aliases/preparerequirements/)

##### options

###### signal?

`AbortSignal`

###### solver

[`IntegritySolver`](/api/type-aliases/integritysolver/)

#### Returns

`Promise`\<[`IntegrityResult`](/api/interfaces/integrityresult/)\>

***

### logger?

> `optional` **logger?**: [`Logger`](/api/interfaces/logger/)

Defined in: [src/client.ts:197](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L197)

***

### modelCacheMs?

> `optional` **modelCacheMs?**: `number`

Defined in: [src/client.ts:203](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L203)

***

### persona?

> `optional` **persona?**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/client.ts:194](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L194)

***

### prepareFailureMode?

> `optional` **prepareFailureMode?**: `"continue"` \| `"throw"`

Defined in: [src/client.ts:200](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L200)

***

### solver?

> `optional` **solver?**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:193](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L193)

***

### strictRouteArgs?

> `optional` **strictRouteArgs?**: `boolean`

Defined in: [src/client.ts:199](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L199)
