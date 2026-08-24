---
editUrl: false
next: false
prev: false
title: "ChatGPTClient"
---

Defined in: [src/client.ts:232](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L232)

High-level client for conversations, catalogued private routes, streams, and file transfers.

This is an unofficial protocol client. Call [ChatGPTClient.close](/api/classes/chatgptclient/#close) when finished to stop
owned timers, and use `AbortSignal` on operations that may outlive the caller.

## Constructors

### Constructor

> **new ChatGPTClient**(`options`): `ChatGPTClient`

Defined in: [src/client.ts:247](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L247)

#### Parameters

##### options

[`ChatGPTClientOptions`](/api/interfaces/chatgptclientoptions/)

#### Returns

`ChatGPTClient`

## Properties

### auth

> `readonly` **auth**: [`Auth`](/api/classes/auth/)

Defined in: [src/client.ts:233](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L233)

***

### http

> `readonly` **http**: [`Http`](/api/classes/http/)

Defined in: [src/client.ts:234](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L234)

***

### routes

> `readonly` **routes**: [`RouteApi`](/api/type-aliases/routeapi/)

Defined in: [src/client.ts:235](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L235)

***

### solver

> `readonly` **solver**: [`IntegritySolver`](/api/type-aliases/integritysolver/)

Defined in: [src/client.ts:236](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L236)

## Accessors

### baseUrl

#### Get Signature

> **get** **baseUrl**(): `string`

Defined in: [src/client.ts:294](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L294)

##### Returns

`string`

## Methods

### call()

> **call**\<`Name`\>(`name`, `args?`, `options?`): `Promise`\<[`RouteResult`](/api/type-aliases/routeresult/)\<`Name`\>\>

Defined in: [src/client.ts:299](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L299)

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

Defined in: [src/client.ts:827](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L827)

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

Defined in: [src/client.ts:836](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L836)

#### Parameters

##### body

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

#### Returns

`Promise`\<`unknown`\>

***

### close()

> **close**(): `void`

Defined in: [src/client.ts:392](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L392)

Stops the optional heartbeat owned by this client.

#### Returns

`void`

***

### defaultModel()

> **defaultModel**(`options?`): `Promise`\<`string`\>

Defined in: [src/client.ts:733](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L733)

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

Defined in: [src/client.ts:711](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L711)

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

Defined in: [src/client.ts:746](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L746)

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

Defined in: [src/client.ts:766](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L766)

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

Defined in: [src/client.ts:868](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L868)

Paginates conversation summaries lazily with a page size from 1 through 100.

#### Parameters

##### options?

`object` & [`UnknownRecord`](/api/type-aliases/unknownrecord/) = `{}`

#### Returns

`AsyncGenerator`\<[`UnknownRecord`](/api/type-aliases/unknownrecord/)\>

***

### listAppTools()

> **listAppTools**(`params?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:823](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L823)

#### Parameters

##### params?

[`UnknownRecord`](/api/type-aliases/unknownrecord/) = `{}`

#### Returns

`Promise`\<`unknown`\>

***

### optOutOfTrustedContactPrompts()

> **optOutOfTrustedContactPrompts**(): `Promise`\<`unknown`\>

Defined in: [src/client.ts:813](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L813)

#### Returns

`Promise`\<`unknown`\>

***

### prepareConversationStream()

> **prepareConversationStream**(`body`, `options?`): `Promise`\<`string` \| `null`\>

Defined in: [src/client.ts:476](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L476)

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

Defined in: [src/client.ts:367](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L367)

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

Defined in: [src/client.ts:702](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L702)

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

Defined in: [src/client.ts:363](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L363)

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

Defined in: [src/client.ts:520](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L520)

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

Defined in: [src/client.ts:543](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L543)

Starts a turn and yields bounded decoded events until completion or cancellation.

#### Parameters

##### options?

[`StartTurnOptions`](/api/interfaces/startturnoptions/) = `{}`

#### Returns

`AsyncGenerator`\<[`SendEvent`](/api/type-aliases/sendevent/)\>

***

### setAccountVoice()

> **setAccountVoice**(`voice`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:805](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L805)

#### Parameters

##### voice

`string`

#### Returns

`Promise`\<`unknown`\>

***

### setConversationArchived()

> **setConversationArchived**(`conversationId`, `isArchived?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:787](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L787)

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

Defined in: [src/client.ts:791](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L791)

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

Defined in: [src/client.ts:795](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L795)

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

Defined in: [src/client.ts:799](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L799)

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

Defined in: [src/client.ts:809](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L809)

#### Parameters

##### enabled

`boolean`

#### Returns

`Promise`\<`unknown`\>

***

### share()

> **share**(`conversationId`, `options?`): `Promise`\<`unknown`\>

Defined in: [src/client.ts:817](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L817)

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

Defined in: [src/client.ts:375](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L375)

#### Parameters

##### intervalMs?

`number` = `HEARTBEAT_MS`

#### Returns

`this`

***

### startTurn()

> **startTurn**(`options?`): `Promise`\<`Response`\>

Defined in: [src/client.ts:491](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L491)

#### Parameters

##### options?

[`StartTurnOptions`](/api/interfaces/startturnoptions/) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### stopHeartbeat()

> **stopHeartbeat**(): `this`

Defined in: [src/client.ts:385](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L385)

#### Returns

`this`

***

### streamEvents()

> **streamEvents**(`response`, `options?`): `AsyncGenerator`\<\{ `data`: `unknown`; `event`: `string` \| `null`; \}\>

Defined in: [src/client.ts:527](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L527)

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

Defined in: [src/client.ts:444](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L444)

#### Parameters

##### input

[`TurnRequestInput`](/api/interfaces/turnrequestinput/)

#### Returns

[`UnknownRecord`](/api/type-aliases/unknownrecord/)

***

### uploadFile()

> **uploadFile**(`options`): `Promise`\<[`Attachment`](/api/interfaces/attachment/)\>

Defined in: [src/client.ts:619](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L619)

Uploads bytes and finalizes an attachment without forwarding account headers to signed URLs.

#### Parameters

##### options

[`UploadFileOptions`](/api/interfaces/uploadfileoptions/)

#### Returns

`Promise`\<[`Attachment`](/api/interfaces/attachment/)\>

***

### uploadFileBytes()

> **uploadFileBytes**(`options`): `Promise`\<`void`\>

Defined in: [src/client.ts:651](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L651)

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

Defined in: [src/client.ts:397](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L397)

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

Defined in: [src/client.ts:285](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L285)

Loads desktop authentication when needed and creates a configured client.

#### Parameters

##### options?

[`CreateClientOptions`](/api/interfaces/createclientoptions/) = `{}`

#### Returns

`Promise`\<`ChatGPTClient`\>

***

### messageChain()

> `static` **messageChain**(`conversation`, `options?`): [`ConversationMessage`](/api/interfaces/conversationmessage/)[]

Defined in: [src/client.ts:841](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L841)

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

Defined in: [src/client.ts:857](https://github.com/rikhoffbauer/chatgpt-client/blob/3345b64ae497343b57b5bd851c982f3d42980012/src/client.ts#L857)

#### Parameters

##### parts

`unknown`[] \| `undefined`

#### Returns

`string`
