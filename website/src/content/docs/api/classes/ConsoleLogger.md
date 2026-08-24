---
editUrl: false
next: false
prev: false
title: "ConsoleLogger"
---

Defined in: [src/logger.ts:46](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L46)

Stderr logger that filters by level and redacts credential-like fields and URL query values.

## Implements

- [`Logger`](/api/interfaces/logger/)

## Constructors

### Constructor

> **new ConsoleLogger**(`options?`): `ConsoleLogger`

Defined in: [src/logger.ts:50](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L50)

#### Parameters

##### options?

###### json?

`boolean`

###### level?

[`LogLevel`](/api/type-aliases/loglevel/)

#### Returns

`ConsoleLogger`

## Properties

### json

> `readonly` **json**: `boolean`

Defined in: [src/logger.ts:48](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L48)

***

### level

> `readonly` **level**: [`LogLevel`](/api/type-aliases/loglevel/)

Defined in: [src/logger.ts:47](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L47)

## Methods

### debug()

> **debug**(`message`, `fields?`): `void`

Defined in: [src/logger.ts:55](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L55)

#### Parameters

##### message

`string`

##### fields?

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`void`

#### Implementation of

[`Logger`](/api/interfaces/logger/).[`debug`](/api/interfaces/logger/#debug)

***

### error()

> **error**(`message`, `fields?`): `void`

Defined in: [src/logger.ts:67](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L67)

#### Parameters

##### message

`string`

##### fields?

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`void`

#### Implementation of

[`Logger`](/api/interfaces/logger/).[`error`](/api/interfaces/logger/#error)

***

### info()

> **info**(`message`, `fields?`): `void`

Defined in: [src/logger.ts:59](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L59)

#### Parameters

##### message

`string`

##### fields?

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`void`

#### Implementation of

[`Logger`](/api/interfaces/logger/).[`info`](/api/interfaces/logger/#info)

***

### warn()

> **warn**(`message`, `fields?`): `void`

Defined in: [src/logger.ts:63](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/logger.ts#L63)

#### Parameters

##### message

`string`

##### fields?

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`void`

#### Implementation of

[`Logger`](/api/interfaces/logger/).[`warn`](/api/interfaces/logger/#warn)
