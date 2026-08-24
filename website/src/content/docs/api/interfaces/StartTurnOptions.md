---
editUrl: false
next: false
prev: false
title: "StartTurnOptions"
---

Defined in: [src/client.ts:172](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L172)

Options for starting or resuming a conversation turn. Pass `signal` to cancel preparation and streaming.

## Extends

- `Omit`\<[`TurnRequestInput`](/api/interfaces/turnrequestinput/), `"messages"` \| `"model"` \| `"parentMessageId"`\>

## Properties

### action?

> `optional` **action?**: `string`

Defined in: [src/client.ts:154](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L154)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`action`](/api/interfaces/turnrequestinput/#action)

***

### attachments?

> `optional` **attachments?**: [`Attachment`](/api/interfaces/attachment/)[]

Defined in: [src/client.ts:180](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L180)

***

### branchingFromConversationId?

> `optional` **branchingFromConversationId?**: `string`

Defined in: [src/client.ts:165](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L165)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`branchingFromConversationId`](/api/interfaces/turnrequestinput/#branchingfromconversationid)

***

### branchingFromMessageId?

> `optional` **branchingFromMessageId?**: `string`

Defined in: [src/client.ts:166](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L166)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`branchingFromMessageId`](/api/interfaces/turnrequestinput/#branchingfrommessageid)

***

### conversationId?

> `optional` **conversationId?**: `string`

Defined in: [src/client.ts:153](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L153)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationId`](/api/interfaces/turnrequestinput/#conversationid)

***

### conversationMode?

> `optional` **conversationMode?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:157](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L157)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationMode`](/api/interfaces/turnrequestinput/#conversationmode)

***

### conversationOrigin?

> `optional` **conversationOrigin?**: `string`

Defined in: [src/client.ts:156](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L156)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`conversationOrigin`](/api/interfaces/turnrequestinput/#conversationorigin)

***

### executionTarget?

> `optional` **executionTarget?**: `string`

Defined in: [src/client.ts:158](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L158)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`executionTarget`](/api/interfaces/turnrequestinput/#executiontarget)

***

### extra?

> `optional` **extra?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:168](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L168)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`extra`](/api/interfaces/turnrequestinput/#extra)

***

### gizmoId?

> `optional` **gizmoId?**: `string`

Defined in: [src/client.ts:155](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L155)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`gizmoId`](/api/interfaces/turnrequestinput/#gizmoid)

***

### hideFromHistory?

> `optional` **hideFromHistory?**: `boolean`

Defined in: [src/client.ts:164](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L164)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`hideFromHistory`](/api/interfaces/turnrequestinput/#hidefromhistory)

***

### historyAndTrainingDisabled?

> `optional` **historyAndTrainingDisabled?**: `boolean`

Defined in: [src/client.ts:163](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L163)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`historyAndTrainingDisabled`](/api/interfaces/turnrequestinput/#historyandtrainingdisabled)

***

### integrity?

> `optional` **integrity?**: [`IntegrityResult`](/api/interfaces/integrityresult/)

Defined in: [src/client.ts:179](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L179)

***

### localFunctionSignatures?

> `optional` **localFunctionSignatures?**: [`JsonValue`](/api/type-aliases/jsonvalue/)

Defined in: [src/client.ts:162](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L162)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`localFunctionSignatures`](/api/interfaces/turnrequestinput/#localfunctionsignatures)

***

### message?

> `optional` **message?**: [`ConversationMessage`](/api/interfaces/conversationmessage/)

Defined in: [src/client.ts:174](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L174)

***

### messages?

> `optional` **messages?**: [`ConversationMessage`](/api/interfaces/conversationmessage/)[]

Defined in: [src/client.ts:175](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L175)

***

### metadata?

> `optional` **metadata?**: [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:181](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L181)

***

### model?

> `optional` **model?**: `string`

Defined in: [src/client.ts:176](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L176)

***

### parentMessageId?

> `optional` **parentMessageId?**: `string`

Defined in: [src/client.ts:177](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L177)

***

### serviceTier?

> `optional` **serviceTier?**: `string`

Defined in: [src/client.ts:161](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L161)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`serviceTier`](/api/interfaces/turnrequestinput/#servicetier)

***

### signal?

> `optional` **signal?**: `AbortSignal`

Defined in: [src/client.ts:178](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L178)

***

### supportedEncodings?

> `optional` **supportedEncodings?**: `string`[]

Defined in: [src/client.ts:167](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L167)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`supportedEncodings`](/api/interfaces/turnrequestinput/#supportedencodings)

***

### systemHints?

> `optional` **systemHints?**: [`JsonValue`](/api/type-aliases/jsonvalue/)

Defined in: [src/client.ts:159](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L159)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`systemHints`](/api/interfaces/turnrequestinput/#systemhints)

***

### text?

> `optional` **text?**: `string`

Defined in: [src/client.ts:173](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L173)

***

### thinkingEffort?

> `optional` **thinkingEffort?**: `string`

Defined in: [src/client.ts:160](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L160)

#### Inherited from

[`TurnRequestInput`](/api/interfaces/turnrequestinput/).[`thinkingEffort`](/api/interfaces/turnrequestinput/#thinkingeffort)
