---
editUrl: false
next: false
prev: false
title: "StartTurnOptions"
---

Defined in: [src/client.ts:160](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L160)

Options for starting or resuming a conversation turn. Pass `signal` to cancel preparation and streaming.

## Extends

- `Omit`\<[`TurnRequestInput`](/api/interfaces/turnrequestinput/), `"messages"` \| `"model"` \| `"parentMessageId"`\>

## Properties

### action?

> `optional` **action?**: `string`

Defined in: [src/client.ts:142](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L142)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`action`](/api/interfaces/turnrequestinput/#action)

***

### attachments?

> `optional` **attachments?**: [`Attachment`](/api/interfaces/attachment/)[]

Defined in: [src/client.ts:168](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L168)

***

### branchingFromConversationId?

> `optional` **branchingFromConversationId?**: `string`

Defined in: [src/client.ts:153](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L153)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`branchingFromConversationId`](/api/interfaces/turnrequestinput/#branchingfromconversationid)

***

### branchingFromMessageId?

> `optional` **branchingFromMessageId?**: `string`

Defined in: [src/client.ts:154](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L154)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`branchingFromMessageId`](/api/interfaces/turnrequestinput/#branchingfrommessageid)

***

### conversationId?

> `optional` **conversationId?**: `string`

Defined in: [src/client.ts:141](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L141)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationId`](/api/interfaces/turnrequestinput/#conversationid)

***

### conversationMode?

> `optional` **conversationMode?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:145](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L145)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationMode`](/api/interfaces/turnrequestinput/#conversationmode)

***

### conversationOrigin?

> `optional` **conversationOrigin?**: `string`

Defined in: [src/client.ts:144](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L144)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationOrigin`](/api/interfaces/turnrequestinput/#conversationorigin)

***

### executionTarget?

> `optional` **executionTarget?**: `string`

Defined in: [src/client.ts:146](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L146)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`executionTarget`](/api/interfaces/turnrequestinput/#executiontarget)

***

### extra?

> `optional` **extra?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:156](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L156)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`extra`](/api/interfaces/turnrequestinput/#extra)

***

### gizmoId?

> `optional` **gizmoId?**: `string`

Defined in: [src/client.ts:143](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L143)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`gizmoId`](/api/interfaces/turnrequestinput/#gizmoid)

***

### hideFromHistory?

> `optional` **hideFromHistory?**: `boolean`

Defined in: [src/client.ts:152](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L152)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`hideFromHistory`](/api/interfaces/turnrequestinput/#hidefromhistory)

***

### historyAndTrainingDisabled?

> `optional` **historyAndTrainingDisabled?**: `boolean`

Defined in: [src/client.ts:151](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L151)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`historyAndTrainingDisabled`](/api/interfaces/turnrequestinput/#historyandtrainingdisabled)

***

### integrity?

> `optional` **integrity?**: [`IntegrityResult`](/api/interfaces/integrityresult/)

Defined in: [src/client.ts:167](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L167)

***

### localFunctionSignatures?

> `optional` **localFunctionSignatures?**: [`JsonValue`](/api/type-aliases/jsonvalue/)

Defined in: [src/client.ts:150](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L150)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`localFunctionSignatures`](/api/interfaces/turnrequestinput/#localfunctionsignatures)

***

### message?

> `optional` **message?**: [`ConversationMessage`](/api/interfaces/conversationmessage/)

Defined in: [src/client.ts:162](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L162)

***

### messages?

> `optional` **messages?**: [`ConversationMessage`](/api/interfaces/conversationmessage/)[]

Defined in: [src/client.ts:163](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L163)

***

### metadata?

> `optional` **metadata?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:169](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L169)

***

### model?

> `optional` **model?**: `string`

Defined in: [src/client.ts:164](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L164)

***

### parentMessageId?

> `optional` **parentMessageId?**: `string`

Defined in: [src/client.ts:165](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L165)

***

### serviceTier?

> `optional` **serviceTier?**: `string`

Defined in: [src/client.ts:149](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L149)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`serviceTier`](/api/interfaces/turnrequestinput/#servicetier)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/client.ts:166](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L166)

***

### supportedEncodings?

> `optional` **supportedEncodings?**: `string`[]

Defined in: [src/client.ts:155](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L155)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`supportedEncodings`](/api/interfaces/turnrequestinput/#supportedencodings)

***

### systemHints?

> `optional` **systemHints?**: [`JsonValue`](/api/type-aliases/jsonvalue/)

Defined in: [src/client.ts:147](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L147)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`systemHints`](/api/interfaces/turnrequestinput/#systemhints)

***

### text?

> `optional` **text?**: `string`

Defined in: [src/client.ts:161](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L161)

***

### thinkingEffort?

> `optional` **thinkingEffort?**: `string`

Defined in: [src/client.ts:148](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L148)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`thinkingEffort`](/api/interfaces/turnrequestinput/#thinkingeffort)
