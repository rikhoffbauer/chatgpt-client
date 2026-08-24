---
editUrl: false
next: false
prev: false
title: "CreateClientOptions"
---

Defined in: [src/client.ts:221](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L221)

Client options that may load authentication from the desktop auth store.

## Extends

- `Omit`\<[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/), `"auth"`\>

## Properties

### appVersion?

> `optional` **appVersion?**: `string`

Defined in: [src/client.ts:208](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L208)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`appVersion`](/api/interfaces/chatgptclientoptions/#appversion)

***

### auth?

> `optional` **auth?**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:222](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L222)

***

### authPath?

> `optional` **authPath?**: `string`

Defined in: [src/client.ts:223](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L223)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [src/client.ts:205](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L205)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`baseUrl`](/api/interfaces/chatgptclientoptions/#baseurl)

***

### browserFallback?

> `optional` **browserFallback?**: `boolean`

Defined in: [src/client.ts:215](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L215)

Uses an isolated real-Chrome renderer when Cloudflare blocks a same-origin request.

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`browserFallback`](/api/interfaces/chatgptclientoptions/#browserfallback)

***

### config?

> `optional` **config?**: `Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object`

Defined in: [src/client.ts:211](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L211)

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

Defined in: [src/client.ts:209](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L209)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`fetchImpl`](/api/interfaces/chatgptclientoptions/#fetchimpl)

***

### integrityProvider?

> `optional` **integrityProvider?**: (`prepare`, `options`) => `Promise`\<[`IntegrityResult`](/api/interfaces/integrityresult/)\>

Defined in: [src/client.ts:217](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L217)

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

Defined in: [src/client.ts:210](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L210)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`logger`](/api/interfaces/chatgptclientoptions/#logger)

***

### modelCacheMs?

> `optional` **modelCacheMs?**: `number`

Defined in: [src/client.ts:216](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L216)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`modelCacheMs`](/api/interfaces/chatgptclientoptions/#modelcachems)

***

### persona?

> `optional` **persona?**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/client.ts:207](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L207)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`persona`](/api/interfaces/chatgptclientoptions/#persona)

***

### prepareFailureMode?

> `optional` **prepareFailureMode?**: `"continue"` \| `"throw"`

Defined in: [src/client.ts:213](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L213)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`prepareFailureMode`](/api/interfaces/chatgptclientoptions/#preparefailuremode)

***

### solver?

> `optional` **solver?**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:206](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L206)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`solver`](/api/interfaces/chatgptclientoptions/#solver)

***

### strictRouteArgs?

> `optional` **strictRouteArgs?**: `boolean`

Defined in: [src/client.ts:212](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L212)

#### Inherited from

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/).[`strictRouteArgs`](/api/interfaces/chatgptclientoptions/#strictrouteargs)
