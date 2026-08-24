---
editUrl: false
next: false
prev: false
title: "ChatGPTClientOptions"
---

Defined in: [src/client.ts:203](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L203)

Dependencies and finite runtime settings for constructing a [ChatGPTClient](/api/classes/chatgptclient/).

## Properties

### appVersion?

> `optional` **appVersion?**: `string`

Defined in: [src/client.ts:208](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L208)

***

### auth

> **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:204](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L204)

***

### baseUrl?

> `optional` **baseUrl?**: `string`

Defined in: [src/client.ts:205](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L205)

***

### browserFallback?

> `optional` **browserFallback?**: `boolean`

Defined in: [src/client.ts:215](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L215)

Uses an isolated real-Chrome renderer when Cloudflare blocks a same-origin request.

***

### config?

> `optional` **config?**: `Partial`\<`Omit`\<[`ClientConfig`](/api/interfaces/clientconfig/), `"retry"` \| `"limits"`\>\> & `object`

Defined in: [src/client.ts:211](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L211)

#### Type Declaration

##### limits?

> `optional` **limits?**: `Partial`\<[`RuntimeLimits`](/api/interfaces/runtimelimits/)\>

##### retry?

> `optional` **retry?**: `Partial`\<[`RetryPolicy`](/api/interfaces/retrypolicy/)\>

***

### fetchImpl?

> `optional` **fetchImpl?**: [`Fetch`](/api/type-aliases/fetch/)

Defined in: [src/client.ts:209](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L209)

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

***

### logger?

> `optional` **logger?**: [`Logger`](/api/interfaces/logger/)

Defined in: [src/client.ts:210](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L210)

***

### modelCacheMs?

> `optional` **modelCacheMs?**: `number`

Defined in: [src/client.ts:216](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L216)

***

### persona?

> `optional` **persona?**: [`Persona`](/api/type-aliases/persona/)

Defined in: [src/client.ts:207](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L207)

***

### prepareFailureMode?

> `optional` **prepareFailureMode?**: `"continue"` \| `"throw"`

Defined in: [src/client.ts:213](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L213)

***

### solver?

> `optional` **solver?**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:206](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L206)

***

### strictRouteArgs?

> `optional` **strictRouteArgs?**: `boolean`

Defined in: [src/client.ts:212](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L212)
