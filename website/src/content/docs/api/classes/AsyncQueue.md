---
editUrl: false
next: false
prev: false
title: "AsyncQueue"
---

Defined in: [src/streaming/async-queue.ts:12](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L12)

Bounded async iterator queue. Overflow fails the queue with [QueueOverflowError](/api/classes/queueoverflowerror/);
`close()` drains buffered values, while `fail()` discards them and rejects consumers.

## Type Parameters

### T

`T`

## Implements

- `AsyncIterable`\<`T`\>
- `AsyncIterator`\<`T`\>

## Constructors

### Constructor

> **new AsyncQueue**\<`T`\>(`options?`): `AsyncQueue`\<`T`\>

Defined in: [src/streaming/async-queue.ts:20](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L20)

#### Parameters

##### options?

###### maxSize?

`number`

###### name?

`string`

#### Returns

`AsyncQueue`\<`T`\>

## Properties

### maxSize

> `readonly` **maxSize**: `number`

Defined in: [src/streaming/async-queue.ts:14](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L14)

***

### name

> `readonly` **name**: `string`

Defined in: [src/streaming/async-queue.ts:13](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L13)

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/streaming/async-queue.ts:26](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L26)

##### Returns

`number`

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<`T`\>

Defined in: [src/streaming/async-queue.ts:70](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L70)

#### Returns

`AsyncIterator`\<`T`\>

#### Implementation of

`AsyncIterable.[asyncIterator]`

***

### close()

> **close**(): `void`

Defined in: [src/streaming/async-queue.ts:44](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L44)

#### Returns

`void`

***

### fail()

> **fail**(`error`): `void`

Defined in: [src/streaming/async-queue.ts:50](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L50)

#### Parameters

##### error

`unknown`

#### Returns

`void`

***

### next()

> **next**(): `Promise`\<`IteratorResult`\<`T`, `any`\>\>

Defined in: [src/streaming/async-queue.ts:58](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L58)

#### Returns

`Promise`\<`IteratorResult`\<`T`, `any`\>\>

#### Implementation of

`AsyncIterator.next`

***

### push()

> **push**(`value`): `void`

Defined in: [src/streaming/async-queue.ts:30](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L30)

#### Parameters

##### value

`T`

#### Returns

`void`

***

### return()

> **return**(): `Promise`\<`IteratorResult`\<`T`, `any`\>\>

Defined in: [src/streaming/async-queue.ts:65](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/streaming/async-queue.ts#L65)

#### Returns

`Promise`\<`IteratorResult`\<`T`, `any`\>\>

#### Implementation of

`AsyncIterator.return`
