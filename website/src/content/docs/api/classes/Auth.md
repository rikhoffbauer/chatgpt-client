---
editUrl: false
next: false
prev: false
title: "Auth"
---

Defined in: [src/auth.ts:90](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L90)

Mutable OAuth credential holder with finite refresh deadlines and concurrent-refresh deduplication.
Loaded tokens are sensitive and must not be logged or committed.

## Constructors

### Constructor

> **new Auth**(`options`): `Auth`

Defined in: [src/auth.ts:101](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L101)

#### Parameters

##### options

[`AuthOptions`](/api/interfaces/authoptions/)

#### Returns

`Auth`

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [src/auth.ts:91](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L91)

***

### accountId

> **accountId**: `string` \| `null`

Defined in: [src/auth.ts:94](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L94)

***

### idToken?

> `optional` **idToken?**: `string`

Defined in: [src/auth.ts:93](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L93)

***

### refreshToken?

> `optional` **refreshToken?**: `string`

Defined in: [src/auth.ts:92](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L92)

## Accessors

### claims

#### Get Signature

> **get** **claims**(): [`ChatGptAuthClaims`](/api/interfaces/chatgptauthclaims/)

Defined in: [src/auth.ts:145](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L145)

##### Returns

[`ChatGptAuthClaims`](/api/interfaces/chatgptauthclaims/)

## Methods

### ensureFresh()

> **ensureFresh**(): `Promise`\<`void`\>

Defined in: [src/auth.ts:155](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L155)

Refreshes an expiring access token when a refresh token is available.

#### Returns

`Promise`\<`void`\>

***

### isExpiring()

> **isExpiring**(`skewMs?`): `boolean`

Defined in: [src/auth.ts:149](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L149)

#### Parameters

##### skewMs?

`number` = `60_000`

#### Returns

`boolean`

***

### refresh()

> **refresh**(): `Promise`\<`void`\>

Defined in: [src/auth.ts:160](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L160)

Refreshes tokens once; concurrent callers share the same in-flight operation.

#### Returns

`Promise`\<`void`\>

***

### load()

> `static` **load**(`options?`): `Promise`\<`Auth`\>

Defined in: [src/auth.ts:113](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/auth.ts#L113)

Loads the Codex auth store, validates its token fields, and refreshes expiring credentials.

#### Parameters

##### options?

[`LoadAuthOptions`](/api/interfaces/loadauthoptions/) = `{}`

#### Returns

`Promise`\<`Auth`\>
