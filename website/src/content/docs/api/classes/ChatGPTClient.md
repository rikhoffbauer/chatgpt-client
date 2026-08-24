---
editUrl: false
next: false
prev: false
title: "ChatGPTClient"
---

Defined in: [src/client.ts:219](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L219)

High-level client for conversations, catalogued private routes, streams, and file transfers.

This is an unofficial protocol client. Call [ChatGPTClient.close](/api/classes/chatgptclient/#close) when finished to stop
owned timers, and use `AbortSignal` on operations that may outlive the caller.

## Constructors

### Constructor

> **new ChatGPTClient**(`options`): `ChatGPTClient`

Defined in: [src/client.ts:234](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L234)

#### Parameters

##### options

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/)

#### Returns

`ChatGPTClient`

## Properties

### auth

> `readonly` **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:220](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L220)

***

### http

> `readonly` **http**: [`Http`](/api/classes/http/)

Defined in: [src/client.ts:221](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L221)

***

### routes

> `readonly` **routes**: [`RouteApi`](/api/type-aliases/routeapi/)

Defined in: [src/client.ts:222](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L222)

***

### solver

> `readonly` **solver**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:223](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L223)

## Accessors

### baseUrl

#### Get Signature

> **get** **baseUrl**(): `string`

Defined in: [src/client.ts:281](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L281)

##### Returns

`string`

## Methods

### call()

> **call**\<`Name`\>(`name`, `args?`, `options?`): `Promise`\<[`RouteResult`](/api/type-aliases/routeresult/)\<`Name`\>\>

Defined in: [src/client.ts:286](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L286)

Calls a catalogued private route, validating path and unused arguments before transport.

#### Type Parameters

##### Name

`Name` *extends* `"listConversations"` \| `"searchConversations"` \| `"globalSearch"` \| `"getConversationsBatch"` \| `"getConversation"` \| `"patchConversation"` \| `"renameConversation"` \| `"deleteConversation"` \| `"rateConversation"` \| `"branchConversation"` \| `"getConversationFiles"` \| `"getConversationAttachment"` \| `"getConversationAttachmentDownload"` \| `"persistDilViewState"` \| `"refreshGenUiWidget"` \| `"updateWritingBlock"` \| `"magicEditWritingBlock"` \| `"getConversationWebSocketUrl"` \| `"prepareConversationStreamRaw"` \| `"conversationStream"` \| `"resumeConversationStream"` \| `"sidebarConversationStream"` \| `"codexResponses"` \| `"prepareChatRequirements"` \| `"sentinelHeartbeat"` \| `"attestationChallenge"` \| `"getModels"` \| `"getModelsConfig"` \| `"getModelSlugs"` \| `"getTppModels"` \| `"getSystemHints"` \| `"getAgentSystemHint"` \| `"getSubagentThreadTurns"` \| `"createFile"` \| `"finalizeFileUpload"` \| `"getFileDownloadUrl"` \| `"processFileUploadStream"` \| `"createLibraryFile"` \| `"createLibraryDirectory"` \| `"getLibraryDirectoryPath"` \| `"updateLibraryFile"` \| `"deleteLibraryFile"` \| `"getLibraryFileThumbnail"` \| `"listLibraryNodes"` \| `"gizmosBootstrap"` \| `"gizmosSidebar"` \| `"getGizmo"` \| `"deleteGizmo"` \| `"getGizmoConversations"` \| `"createProject"` \| `"updateProject"` \| `"getProjectConnectorScopes"` \| `"addProjectFile"` \| `"deleteProjectFile"` \| `"getProjectSaves"` \| `"createShareLink"` \| `"createShareLinkV2"` \| `"updateShareLink"` \| `"listPins"` \| `"addPin"` \| `"removePin"` \| `"getUserSettings"` \| `"getUserMemories"` \| `"getUserMemorySummary"` \| `"getVoices"` \| `"patchAccountUserSetting"` \| `"accountsCheck"` \| `"getAccountSettings"` \| `"getMfaInfo"` \| `"listWorkspaceAdminRequests"` \| `"createWorkspaceAdminRequest"` \| `"updateWorkspaceAdminRequest"` \| `"sendAddCreditsNudgeEmail"` \| `"getMonthlySpend"` \| `"getMe"` \| `"getPaymentMethods"` \| `"previewSubscriptionUpdate"` \| `"updateSubscription"` \| `"cancelPendingSubscriptionUpdate"` \| `"getAutoTopUpSettings"` \| `"enableAutoTopUp"` \| `"updateAutoTopUp"` \| `"disableAutoTopUp"` \| `"getCreditsDiscountOffer"` \| `"getCheckoutPricingConfig"` \| `"getReferralEligibility"` \| `"getReferralTracking"` \| `"createReferralInvite"` \| `"sendReferralInviteEmail"` \| `"getConnector"` \| `"getConnectorLink"` \| `"acceptConnectorTos"` \| `"createNoAuthConnectorLink"` \| `"createOAuthConnectorLink"` \| `"reauthOAuthConnectorLink"` \| `"completeOAuthConnectorLink"` \| `"listAccessibleConnectorLinks"` \| `"sendConnectorEmail"` \| `"getConnectorEmailStatus"` \| `"unsendConnectorEmail"` \| `"searchGoogleContacts"` \| `"ecosystemBootstrap"` \| `"ecosystemAutoInstall"` \| `"ecosystemCallMcp"` \| `"ecosystemGetWidget"` \| `"ecosystemLaunchWidget"` \| `"ecosystemUrlSafe"` \| `"getDictationConnectInfo"` \| `"remoteControlClient"` \| `"remoteControlEnrollStart"` \| `"remoteControlEnrollFinish"` \| `"remoteControlRefreshStart"` \| `"remoteControlRefreshFinish"` \| `"whamAccountsCheck"` \| `"whamSettingsUser"` \| `"whamGetProfile"` \| `"whamUpdateProfile"` \| `"whamUploadProfilePhoto"` \| `"whamGetUsage"` \| `"whamQueryThreadUsage"` \| `"whamFinanceEligibility"` \| `"whamRateLimitResetCredits"` \| `"whamConsumeRateLimitResetCredit"` \| `"whamWorkspaceMessages"` \| `"whamSitesAccess"` \| `"whamStatsigBootstrap"` \| `"whamOnboardingContext"` \| `"whamDesktopOnboardingState"` \| `"whamCompleteDesktopOnboarding"` \| `"whamListTasks"` \| `"whamCreateTask"` \| `"whamGetTask"` \| `"whamArchiveTask"` \| `"whamCancelTask"` \| `"whamMarkTaskRead"` \| `"whamRecoverTask"` \| `"whamListTaskTurns"` \| `"whamGetTaskTurn"` \| `"whamGetTaskTurnLogs"` \| `"whamCreatePullRequest"` \| `"whamListEnvironments"` \| `"whamGetEnvironmentsByRepo"` \| `"whamSearchBranches"` \| `"whamWorktreeSnapshotUploadUrl"` \| `"whamWorktreeSnapshotFinishUpload"` \| `"whamPairRemoteControlClient"` \| `"whamListRemoteControlClients"` \| `"whamDeleteRemoteControlClient"` \| `"whamGetRemoteControlMfaRequirement"` \| `"whamSetRemoteControlMfaRequirement"` \| `"whamApps"` \| `"whamGoogleDriveUpload"` \| `"whamAnalyticsEvents"`

#### Parameters

##### name

`Name`

##### args?

[`RouteArguments`](/api/type-aliases/routearguments/) = `{}`

##### options?

[`RouteCallOptions`](/api/interfaces/routecalloptions/) = `{}`

#### Returns

`Promise`\<[`RouteResult`](/api/type-aliases/routeresult/)\<`Name`\>\>

***

### callAppTool()

> **callAppTool**(`name`, `args?`, `options?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:797](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L797)

#### Parameters

##### name

`string`

##### args?

[`UnknownRecord`](/api/type-aliases/unknownrecord/) = `{}`

##### options?

###### id?

`string` \| `number`

#### Returns

`Promise`\<`unknown`\>

***

### callConnectorMcp()

> **callConnectorMcp**(`body`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:806](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L806)

#### Parameters

##### body

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`Promise`\<`unknown`\>

***

### close()

> **close**(): `void`

Defined in: [src/client.ts:379](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L379)

Stops the optional heartbeat owned by this client.

#### Returns

`void`

***

### defaultModel()

> **defaultModel**(`options?`): `Promise`\<`string`\>

Defined in: [src/client.ts:703](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L703)

#### Parameters

##### options?

###### refresh?

`boolean`

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`string`\>

***

### downloadFile()

> **downloadFile**(`fileId`, `options?`): `Promise`\<\{ `bytes`: `Uint8Array`; `info`: [`UnknownRecord`](/api/type-aliases/unknownrecord/); \}\>

Defined in: [src/client.ts:681](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L681)

Downloads a file into memory up to the configured download byte limit.

#### Parameters

##### fileId

`string`

##### options?

###### signal?

`AbortSignal`

#### Returns

`Promise`\<\{ `bytes`: `Uint8Array`; `info`: [`UnknownRecord`](/api/type-aliases/unknownrecord/); \}\>

***

### getUserMemories()

> **getUserMemories**(`options?`): `Promise`\<[`UserMemoriesResponse`](/api/interfaces/usermemoriesresponse/)\>

Defined in: [src/client.ts:716](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L716)

Gets memory entries and token accounting for the current user.

#### Parameters

##### options?

###### signal?

`AbortSignal`

#### Returns

`Promise`\<[`UserMemoriesResponse`](/api/interfaces/usermemoriesresponse/)\>

***

### getUserMemorySummary()

> **getUserMemorySummary**(`options?`): `Promise`\<[`UserMemorySummaryResponse`](/api/interfaces/usermemorysummaryresponse/)\>

Defined in: [src/client.ts:736](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L736)

Generates ChatGPT's sectioned About You summary for the current user.

#### Parameters

##### options?

###### signal?

`AbortSignal`

#### Returns

`Promise`\<[`UserMemorySummaryResponse`](/api/interfaces/usermemorysummaryresponse/)\>

***

### iterateConversations()

> **iterateConversations**(`options?`): `AsyncGenerator`\<[`UnknownRecord`](/api/type-aliases/unknownrecord/)\>

Defined in: [src/client.ts:838](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L838)

Paginates conversation summaries lazily with a page size from 1 through 100.

#### Parameters

##### options?

`object` & [`UnknownRecord`](/api/type-aliases/unknownrecord/) = `{}`

#### Returns

`AsyncGenerator`\<[`UnknownRecord`](/api/type-aliases/unknownrecord/)\>

***

### listAppTools()

> **listAppTools**(`params?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:793](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L793)

#### Parameters

##### params?

[`UnknownRecord`](/api/type-aliases/unknownrecord/) = `{}`

#### Returns

`Promise`\<`unknown`\>

***

### optOutOfTrustedContactPrompts()

> **optOutOfTrustedContactPrompts**(): `Promise`\<`unknown`\>

Defined in: [src/client.ts:783](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L783)

#### Returns

`Promise`\<`unknown`\>

***

### prepareConversationStream()

> **prepareConversationStream**(`body`, `options?`): `Promise`\<`string` \| `null`\>

Defined in: [src/client.ts:463](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L463)

#### Parameters

##### body

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

##### options?

###### conduitToken?

`string`

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`string` \| `null`\>

***

### prepareIntegrity()

> **prepareIntegrity**(`options?`): `Promise`\<[`IntegrityResult`](/api/interfaces/integrityresult/)\>

Defined in: [src/client.ts:354](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L354)

#### Parameters

##### options?

###### signal?

`AbortSignal`

###### solver?

[`IntegritySolver`](/api/type-aliases/integritysolver/)

#### Returns

`Promise`\<[`IntegrityResult`](/api/interfaces/integrityresult/)\>

***

### processUpload()

> **processUpload**(`body`, `options?`): `AsyncGenerator`\<[`NdjsonRecord`](/api/type-aliases/ndjsonrecord/)\>

Defined in: [src/client.ts:672](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L672)

#### Parameters

##### body

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

##### options?

###### signal?

`AbortSignal`

#### Returns

`AsyncGenerator`\<[`NdjsonRecord`](/api/type-aliases/ndjsonrecord/)\>

***

### raw()

> **raw**\<`T`\>(`method`, `path`, `options?`): `Promise`\<`T`\>

Defined in: [src/client.ts:350](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L350)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### method

[`HttpMethod`](/api/type-aliases/httpmethod/)

##### path

`string`

##### options?

[`RequestOptions`](/api/interfaces/requestoptions/) \| `undefined`

#### Returns

`Promise`\<`T`\>

***

### resumeTurn()

> **resumeTurn**(`body`, `options?`): `Promise`\<`Response`\>

Defined in: [src/client.ts:507](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L507)

#### Parameters

##### body

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

##### options?

###### conduitToken?

`string`

###### signal?

`AbortSignal`

#### Returns

`Promise`\<`Response`\>

***

### send()

> **send**(`options?`): `AsyncGenerator`\<[`SendEvent`](/api/type-aliases/sendevent/)\>

Defined in: [src/client.ts:530](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L530)

Starts a turn and yields bounded decoded events until completion or cancellation.

#### Parameters

##### options?

[`StartTurnOptions`](/api/interfaces/startturnoptions/) = `{}`

#### Returns

`AsyncGenerator`\<[`SendEvent`](/api/type-aliases/sendevent/)\>

***

### setAccountVoice()

> **setAccountVoice**(`voice`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:775](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L775)

#### Parameters

##### voice

`string`

#### Returns

`Promise`\<`unknown`\>

***

### setConversationArchived()

> **setConversationArchived**(`conversationId`, `isArchived?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:757](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L757)

#### Parameters

##### conversationId

`string`

##### isArchived?

`boolean` = `true`

#### Returns

`Promise`\<`unknown`\>

***

### setConversationStarred()

> **setConversationStarred**(`conversationId`, `isStarred?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:761](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L761)

#### Parameters

##### conversationId

`string`

##### isStarred?

`boolean` = `true`

#### Returns

`Promise`\<`unknown`\>

***

### setConversationVisible()

> **setConversationVisible**(`conversationId`, `visible`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:765](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L765)

#### Parameters

##### conversationId

`string`

##### visible

`boolean`

#### Returns

`Promise`\<`unknown`\>

***

### setPinnedItem()

> **setPinnedItem**(`itemType`, `itemId`, `pinned?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:769](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L769)

#### Parameters

##### itemType

`string`

##### itemId

`string`

##### pinned?

`boolean` = `true`

#### Returns

`Promise`\<`unknown`\>

***

### setUltraEffortEnabled()

> **setUltraEffortEnabled**(`enabled`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:779](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L779)

#### Parameters

##### enabled

`boolean`

#### Returns

`Promise`\<`unknown`\>

***

### share()

> **share**(`conversationId`, `options?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:787](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L787)

#### Parameters

##### conversationId

`string`

##### options?

[`UnknownRecord`](/api/type-aliases/unknownrecord/) & `object` = `{}`

#### Returns

`Promise`\<`unknown`\>

***

### startHeartbeat()

> **startHeartbeat**(`intervalMs?`): `this`

Defined in: [src/client.ts:362](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L362)

#### Parameters

##### intervalMs?

`number` = `HEARTBEAT_MS`

#### Returns

`this`

***

### startTurn()

> **startTurn**(`options?`): `Promise`\<`Response`\>

Defined in: [src/client.ts:478](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L478)

#### Parameters

##### options?

[`StartTurnOptions`](/api/interfaces/startturnoptions/) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### stopHeartbeat()

> **stopHeartbeat**(): `this`

Defined in: [src/client.ts:372](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L372)

#### Returns

`this`

***

### streamEvents()

> **streamEvents**(`response`, `options?`): `AsyncGenerator`\<\{ `data`: `unknown`; `event`: `string` \| `null`; \}\>

Defined in: [src/client.ts:514](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L514)

#### Parameters

##### response

`Response`

##### options?

###### signal?

`AbortSignal`

#### Returns

`AsyncGenerator`\<\{ `data`: `unknown`; `event`: `string` \| `null`; \}\>

***

### turnRequest()

> **turnRequest**(`input`): [`UnknownRecord`](/api/type-aliases/unknownrecord/)

Defined in: [src/client.ts:431](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L431)

#### Parameters

##### input

[`TurnRequestInput`](/api/interfaces/turnrequestinput/)

#### Returns

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

***

### uploadFile()

> **uploadFile**(`options`): `Promise`\<[`Attachment`](/api/interfaces/attachment/)\>

Defined in: [src/client.ts:589](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L589)

Uploads bytes and finalizes an attachment without forwarding account headers to signed URLs.

#### Parameters

##### options

[`UploadFileOptions`](/api/interfaces/uploadfileoptions/)

#### Returns

`Promise`\<[`Attachment`](/api/interfaces/attachment/)\>

***

### uploadFileBytes()

> **uploadFileBytes**(`options`): `Promise`\<`void`\>

Defined in: [src/client.ts:621](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L621)

#### Parameters

##### options

###### bytes

`Uint8Array`

###### contentType

`string`

###### fileName?

`string`

###### signal?

`AbortSignal`

###### uploadUrl

`string`

#### Returns

`Promise`\<`void`\>

***

### userMessage()

> **userMessage**(`text`, `options?`): [`ConversationMessage`](/api/interfaces/conversationmessage/)

Defined in: [src/client.ts:384](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L384)

#### Parameters

##### text

`string`

##### options?

[`UserMessageOptions`](/api/interfaces/usermessageoptions/) = `{}`

#### Returns

[`ConversationMessage`](/api/interfaces/conversationmessage/)

***

### create()

> `static` **create**(`options?`): `Promise`\<`ChatGPTClient`\>

Defined in: [src/client.ts:272](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L272)

Loads desktop authentication when needed and creates a configured client.

#### Parameters

##### options?

[`CreateClientOptions`](/api/interfaces/createclientoptions/) = `{}`

#### Returns

`Promise`\<`ChatGPTClient`\>

***

### messageChain()

> `static` **messageChain**(`conversation`, `options?`): [`ConversationMessage`](/api/interfaces/conversationmessage/)[]

Defined in: [src/client.ts:811](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L811)

Returns the active message chain and rejects cyclic conversation mappings.

#### Parameters

##### conversation

[`Conversation`](/api/interfaces/conversation/)

##### options?

###### from?

`string`

#### Returns

[`ConversationMessage`](/api/interfaces/conversationmessage/)[]

***

### renderParts()

> `static` **renderParts**(`parts`): `string`

Defined in: [src/client.ts:827](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/client.ts#L827)

#### Parameters

##### parts

`unknown`[] \| `undefined`

#### Returns

`string`
