---
editUrl: false
next: false
prev: false
title: "Auth"
---

Defined in: [src/auth.ts:92](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L92)

Mutable OAuth credential holder with finite refresh deadlines and concurrent-refresh deduplication.
Loaded tokens are sensitive and must not be logged or committed.

## Constructors

### Constructor

> **new Auth**(`options`): `Auth`

Defined in: [src/auth.ts:103](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L103)

#### Parameters

##### options

[`AuthOptions`](/api/interfaces/authoptions/)

#### Returns

`Auth`

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [src/auth.ts:93](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L93)

***

### accountId

> **accountId**: `string` \| `null`

Defined in: [src/auth.ts:96](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L96)

***

### idToken?

> `optional` **idToken?**: `string`

Defined in: [src/auth.ts:95](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L95)

***

### refreshToken?

> `optional` **refreshToken?**: `string`

Defined in: [src/auth.ts:94](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L94)

## Accessors

### claims

#### Get Signature

> **get** **claims**(): [`ChatGptAuthClaims`](/api/interfaces/chatgptauthclaims/)

Defined in: [src/auth.ts:147](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L147)

##### Returns

[`ChatGptAuthClaims`](/api/interfaces/chatgptauthclaims/)

## Methods

### ensureFresh()

> **ensureFresh**(): `Promise`\<`void`\>

Defined in: [src/auth.ts:157](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L157)

Refreshes an expiring access token when a refresh token is available.

#### Returns

`Promise`\<`void`\>

***

### isExpiring()

> **isExpiring**(`skewMs?`): `boolean`

Defined in: [src/auth.ts:151](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L151)

#### Parameters

##### skewMs?

`number` = `60_000`

#### Returns

`boolean`

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: [src/auth.ts:162](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L162)

Refreshes tokens once; concurrent callers share the same in-flight operation.

#### Returns

`Promise`\<`void`\>

***

### load()

> `static` **load**(`options?`): `Promise`\<`Auth`\>

Defined in: [src/auth.ts:115](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/auth.ts#L115)

Loads the Codex auth store, validates its token fields, and refreshes expiring credentials.

#### Parameters

##### options?

[`LoadAuthOptions`](/api/interfaces/loadauthoptions/) = `{}`

#### Returns

`Promise`\<`Auth`\>
