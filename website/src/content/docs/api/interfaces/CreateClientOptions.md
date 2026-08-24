---
editUrl: false
next: false
prev: false
title: "CreateClientOptions"
---

Defined in: [src/client.ts:208](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L208)

Client options that may load authentication from the desktop auth store.

## Extends

- `Omit`\<[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/), `"auth"`\>

## Properties

### appVersion?

> `optional` **appVersion?**: `string`

Defined in: [src/client.ts:195](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L195)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`appVersion`](/api/interfaces/chatgptclientoptions/#appversion)

***

### auth?

> `optional` **auth?**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:209](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L209)

***

### authPath?

> `optional` **authPath?**: `string`

Defined in: [src/client.ts:210](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L210)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [src/client.ts:192](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L192)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`baseUrl`](/api/interfaces/chatgptclientoptions/#baseurl)

***

### browserFallback?

> `optional` **browserFallback?**: `boolean`

Defined in: [src/client.ts:202](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L202)

Uses an isolated real-Chrome renderer when Cloudflare blocks a same-origin request.

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`browserFallback`](/api/interfaces/chatgptclientoptions/#browserfallback)

***

### config?

> `optional` **config?**: `Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object`

Defined in: [src/client.ts:198](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L198)

#### Type Declaration

##### limits?

> `optional` **limits?**: `Partial`\<[`RuntimeLimits`](/api/interfaces/runtimelimits/)\>

##### retry?

> `optional` **retry?**: `Partial`\<[`RetryPolicy`](/api/interfaces/retrypolicy/)\>

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`config`](/api/interfaces/chatgptclientoptions/#config)

***

### fetchImpl?

> `optional` **fetchImpl?**: [`Fetch`](/api/type-aliases/fetch/)

Defined in: [src/client.ts:196](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L196)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`fetchImpl`](/api/interfaces/chatgptclientoptions/#fetchimpl)

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

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`integrityProvider`](/api/interfaces/chatgptclientoptions/#integrityprovider)

***

### logger?

> `optional` **logger?**: [`Logger`](/api/interfaces/logger/)

Defined in: [src/client.ts:197](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L197)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`logger`](/api/interfaces/chatgptclientoptions/#logger)

***

### modelCacheMs?

> `optional` **modelCacheMs?**: `number`

Defined in: [src/client.ts:203](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L203)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`modelCacheMs`](/api/interfaces/chatgptclientoptions/#modelcachems)

***

### persona?

> `optional` **persona?**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/client.ts:194](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L194)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`persona`](/api/interfaces/chatgptclientoptions/#persona)

***

### prepareFailureMode?

> `optional` **prepareFailureMode?**: `"continue"` \| `"throw"`

Defined in: [src/client.ts:200](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L200)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`prepareFailureMode`](/api/interfaces/chatgptclientoptions/#preparefailuremode)

***

### solver?

> `optional` **solver?**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:193](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L193)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`solver`](/api/interfaces/chatgptclientoptions/#solver)

***

### strictRouteArgs?

> `optional` **strictRouteArgs?**: `boolean`

Defined in: [src/client.ts:199](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L199)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`strictRouteArgs`](/api/interfaces/chatgptclientoptions/#strictrouteargs)
