---
editUrl: false
next: false
prev: false
title: "ROUTES"
---

> `const` **ROUTES**: `object`

Defined in: [src/routes.ts:31](https://github.com/rikhoffbauer/chatgpt-client/blob/7e976a90857ff571c9dbcd87ad60810f4399bff8/src/routes.ts#L31)

## Type Declaration

### acceptConnectorTos

> `readonly` **acceptConnectorTos**: `object`

#### acceptConnectorTos.body

> `readonly` **body**: `true` = `true`

#### acceptConnectorTos.method

> `readonly` **method**: `"POST"` = `'POST'`

#### acceptConnectorTos.path

> `readonly` **path**: `"/aip/connectors/{connector_id}/tos"` = `'/aip/connectors/{connector_id}/tos'`

### accountsCheck

> `readonly` **accountsCheck**: `object`

#### accountsCheck.method

> `readonly` **method**: `"GET"` = `'GET'`

#### accountsCheck.path

> `readonly` **path**: `"/accounts/check/{version}"` = `'/accounts/check/{version}'`

### addPin

> `readonly` **addPin**: `object`

#### addPin.method

> `readonly` **method**: `"POST"` = `'POST'`

#### addPin.path

> `readonly` **path**: `"/pins/{item_type}/{item_id}"` = `'/pins/{item_type}/{item_id}'`

### addProjectFile

> `readonly` **addProjectFile**: `object`

#### addProjectFile.body

> `readonly` **body**: `true` = `true`

#### addProjectFile.method

> `readonly` **method**: `"POST"` = `'POST'`

#### addProjectFile.path

> `readonly` **path**: `"/projects/{project_id}/files"` = `'/projects/{project_id}/files'`

### attestationChallenge

> `readonly` **attestationChallenge**: `object`

#### attestationChallenge.headers

> `readonly` **headers**: `object`

#### attestationChallenge.headers.X-OpenAI-Attach-DeviceCheck-Token

> `readonly` **X-OpenAI-Attach-DeviceCheck-Token**: `"1"` = `'1'`

#### attestationChallenge.method

> `readonly` **method**: `"GET"` = `'GET'`

#### attestationChallenge.path

> `readonly` **path**: `"/ios/attestation_challenge"` = `'/ios/attestation_challenge'`

### branchConversation

> `readonly` **branchConversation**: `object`

#### branchConversation.body

> `readonly` **body**: `true` = `true`

#### branchConversation.method

> `readonly` **method**: `"POST"` = `'POST'`

#### branchConversation.path

> `readonly` **path**: `"/conversation/new_branch"` = `'/conversation/new_branch'`

### cancelPendingSubscriptionUpdate

> `readonly` **cancelPendingSubscriptionUpdate**: `object`

#### cancelPendingSubscriptionUpdate.body

> `readonly` **body**: `true` = `true`

#### cancelPendingSubscriptionUpdate.method

> `readonly` **method**: `"POST"` = `'POST'`

#### cancelPendingSubscriptionUpdate.path

> `readonly` **path**: `"/subscriptions/update/cancel_pending"` = `'/subscriptions/update/cancel_pending'`

### codexResponses

> `readonly` **codexResponses**: `object`

#### codexResponses.body

> `readonly` **body**: `true` = `true`

#### codexResponses.method

> `readonly` **method**: `"POST"` = `'POST'`

#### codexResponses.path

> `readonly` **path**: `"/codex/responses"` = `'/codex/responses'`

#### codexResponses.stream

> `readonly` **stream**: `"sse"` = `'sse'`

### completeOAuthConnectorLink

> `readonly` **completeOAuthConnectorLink**: `object`

#### completeOAuthConnectorLink.body

> `readonly` **body**: `true` = `true`

#### completeOAuthConnectorLink.method

> `readonly` **method**: `"POST"` = `'POST'`

#### completeOAuthConnectorLink.path

> `readonly` **path**: `"/aip/connectors/links/oauth/callback"` = `'/aip/connectors/links/oauth/callback'`

### conversationStream

> `readonly` **conversationStream**: `object`

#### conversationStream.body

> `readonly` **body**: `true` = `true`

#### conversationStream.method

> `readonly` **method**: `"POST"` = `'POST'`

#### conversationStream.path

> `readonly` **path**: `"/f/conversation"` = `'/f/conversation'`

#### conversationStream.stream

> `readonly` **stream**: `"sse"` = `'sse'`

### createFile

> `readonly` **createFile**: `object`

#### createFile.body

> `readonly` **body**: `true` = `true`

#### createFile.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createFile.path

> `readonly` **path**: `"/files"` = `'/files'`

### createLibraryDirectory

> `readonly` **createLibraryDirectory**: `object`

#### createLibraryDirectory.body

> `readonly` **body**: `true` = `true`

#### createLibraryDirectory.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createLibraryDirectory.path

> `readonly` **path**: `"/files/library/directories"` = `'/files/library/directories'`

### createLibraryFile

> `readonly` **createLibraryFile**: `object`

#### createLibraryFile.body

> `readonly` **body**: `true` = `true`

#### createLibraryFile.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createLibraryFile.path

> `readonly` **path**: `"/files/library"` = `'/files/library'`

### createNoAuthConnectorLink

> `readonly` **createNoAuthConnectorLink**: `object`

#### createNoAuthConnectorLink.body

> `readonly` **body**: `true` = `true`

#### createNoAuthConnectorLink.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createNoAuthConnectorLink.path

> `readonly` **path**: `"/aip/connectors/links/noauth"` = `'/aip/connectors/links/noauth'`

### createOAuthConnectorLink

> `readonly` **createOAuthConnectorLink**: `object`

#### createOAuthConnectorLink.body

> `readonly` **body**: `true` = `true`

#### createOAuthConnectorLink.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createOAuthConnectorLink.path

> `readonly` **path**: `"/aip/connectors/links/oauth"` = `'/aip/connectors/links/oauth'`

### createProject

> `readonly` **createProject**: `object`

#### createProject.body

> `readonly` **body**: `true` = `true`

#### createProject.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createProject.path

> `readonly` **path**: `"/projects"` = `'/projects'`

### createReferralInvite

> `readonly` **createReferralInvite**: `object`

#### createReferralInvite.body

> `readonly` **body**: `true` = `true`

#### createReferralInvite.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createReferralInvite.path

> `readonly` **path**: `"/referrals/invite"` = `'/referrals/invite'`

### createShareLink

> `readonly` **createShareLink**: `object`

#### createShareLink.body

> `readonly` **body**: `true` = `true`

#### createShareLink.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createShareLink.path

> `readonly` **path**: `"/share/create"` = `'/share/create'`

### createShareLinkV2

> `readonly` **createShareLinkV2**: `object`

#### createShareLinkV2.body

> `readonly` **body**: `true` = `true`

#### createShareLinkV2.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createShareLinkV2.path

> `readonly` **path**: `"/share/v2/create"` = `'/share/v2/create'`

### createWorkspaceAdminRequest

> `readonly` **createWorkspaceAdminRequest**: `object`

#### createWorkspaceAdminRequest.body

> `readonly` **body**: `true` = `true`

#### createWorkspaceAdminRequest.method

> `readonly` **method**: `"POST"` = `'POST'`

#### createWorkspaceAdminRequest.path

> `readonly` **path**: `"/accounts/{account_id}/workspace_admin_requests"` = `'/accounts/{account_id}/workspace_admin_requests'`

### deleteConversation

> `readonly` **deleteConversation**: `object`

#### deleteConversation.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### deleteConversation.path

> `readonly` **path**: `"/conversation/id/{conversation_id}"` = `'/conversation/id/{conversation_id}'`

### deleteGizmo

> `readonly` **deleteGizmo**: `object`

#### deleteGizmo.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### deleteGizmo.path

> `readonly` **path**: `"/gizmos/{gizmo_id}"` = `'/gizmos/{gizmo_id}'`

### deleteLibraryFile

> `readonly` **deleteLibraryFile**: `object`

#### deleteLibraryFile.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### deleteLibraryFile.path

> `readonly` **path**: `"/files/library/files/{library_file_id}"` = `'/files/library/files/{library_file_id}'`

### deleteProjectFile

> `readonly` **deleteProjectFile**: `object`

#### deleteProjectFile.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### deleteProjectFile.path

> `readonly` **path**: `"/projects/{project_id}/files/{file_id}"` = `'/projects/{project_id}/files/{file_id}'`

### disableAutoTopUp

> `readonly` **disableAutoTopUp**: `object`

#### disableAutoTopUp.body

> `readonly` **body**: `true` = `true`

#### disableAutoTopUp.method

> `readonly` **method**: `"POST"` = `'POST'`

#### disableAutoTopUp.path

> `readonly` **path**: `"/subscriptions/auto_top_up/disable"` = `'/subscriptions/auto_top_up/disable'`

### ecosystemAutoInstall

> `readonly` **ecosystemAutoInstall**: `object`

#### ecosystemAutoInstall.body

> `readonly` **body**: `true` = `true`

#### ecosystemAutoInstall.method

> `readonly` **method**: `"POST"` = `'POST'`

#### ecosystemAutoInstall.path

> `readonly` **path**: `"/ecosystem/launcher/auto_install"` = `'/ecosystem/launcher/auto_install'`

### ecosystemBootstrap

> `readonly` **ecosystemBootstrap**: `object`

#### ecosystemBootstrap.method

> `readonly` **method**: `"GET"` = `'GET'`

#### ecosystemBootstrap.path

> `readonly` **path**: `"/ecosystem/launcher/bootstrap"` = `'/ecosystem/launcher/bootstrap'`

### ecosystemCallMcp

> `readonly` **ecosystemCallMcp**: `object`

#### ecosystemCallMcp.body

> `readonly` **body**: `true` = `true`

#### ecosystemCallMcp.method

> `readonly` **method**: `"POST"` = `'POST'`

#### ecosystemCallMcp.path

> `readonly` **path**: `"/ecosystem/call_mcp"` = `'/ecosystem/call_mcp'`

### ecosystemGetWidget

> `readonly` **ecosystemGetWidget**: `object`

#### ecosystemGetWidget.method

> `readonly` **method**: `"GET"` = `'GET'`

#### ecosystemGetWidget.path

> `readonly` **path**: `"/ecosystem/widget"` = `'/ecosystem/widget'`

#### ecosystemGetWidget.query

> `readonly` **query**: readonly \[`"widget_id"`, `"conversation_id"`\]

### ecosystemLaunchWidget

> `readonly` **ecosystemLaunchWidget**: `object`

#### ecosystemLaunchWidget.body

> `readonly` **body**: `true` = `true`

#### ecosystemLaunchWidget.method

> `readonly` **method**: `"POST"` = `'POST'`

#### ecosystemLaunchWidget.path

> `readonly` **path**: `"/ecosystem/launch_widget"` = `'/ecosystem/launch_widget'`

### ecosystemUrlSafe

> `readonly` **ecosystemUrlSafe**: `object`

#### ecosystemUrlSafe.body

> `readonly` **body**: `true` = `true`

#### ecosystemUrlSafe.method

> `readonly` **method**: `"POST"` = `'POST'`

#### ecosystemUrlSafe.path

> `readonly` **path**: `"/ecosystem/url_safe"` = `'/ecosystem/url_safe'`

### enableAutoTopUp

> `readonly` **enableAutoTopUp**: `object`

#### enableAutoTopUp.body

> `readonly` **body**: `true` = `true`

#### enableAutoTopUp.method

> `readonly` **method**: `"POST"` = `'POST'`

#### enableAutoTopUp.path

> `readonly` **path**: `"/subscriptions/auto_top_up/enable"` = `'/subscriptions/auto_top_up/enable'`

### finalizeFileUpload

> `readonly` **finalizeFileUpload**: `object`

#### finalizeFileUpload.body

> `readonly` **body**: `true` = `true`

#### finalizeFileUpload.method

> `readonly` **method**: `"POST"` = `'POST'`

#### finalizeFileUpload.path

> `readonly` **path**: `"/files/{file_id}/uploaded"` = `'/files/{file_id}/uploaded'`

### getAccountSettings

> `readonly` **getAccountSettings**: `object`

#### getAccountSettings.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getAccountSettings.path

> `readonly` **path**: `"/accounts/{account_id}/settings"` = `'/accounts/{account_id}/settings'`

### getAgentSystemHint

> `readonly` **getAgentSystemHint**: `object`

#### getAgentSystemHint.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getAgentSystemHint.path

> `readonly` **path**: `"/hermes/agent/{agent_id}/system-hint"` = `'/hermes/agent/{agent_id}/system-hint'`

### getAutoTopUpSettings

> `readonly` **getAutoTopUpSettings**: `object`

#### getAutoTopUpSettings.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getAutoTopUpSettings.path

> `readonly` **path**: `"/subscriptions/auto_top_up/settings"` = `'/subscriptions/auto_top_up/settings'`

### getCheckoutPricingConfig

> `readonly` **getCheckoutPricingConfig**: `object`

#### getCheckoutPricingConfig.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getCheckoutPricingConfig.path

> `readonly` **path**: `"/checkout_pricing_config/configs/{country_code}"` = `'/checkout_pricing_config/configs/{country_code}'`

### getConnector

> `readonly` **getConnector**: `object`

#### getConnector.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConnector.path

> `readonly` **path**: `"/aip/connectors/{connector_id}"` = `'/aip/connectors/{connector_id}'`

### getConnectorEmailStatus

> `readonly` **getConnectorEmailStatus**: `object`

#### getConnectorEmailStatus.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConnectorEmailStatus.path

> `readonly` **path**: `"/aip/connectors/email/send_email_status"` = `'/aip/connectors/email/send_email_status'`

#### getConnectorEmailStatus.query

> `readonly` **query**: readonly \[`"email_id"`\]

### getConnectorLink

> `readonly` **getConnectorLink**: `object`

#### getConnectorLink.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConnectorLink.path

> `readonly` **path**: `"/aip/connectors/{connector_id}/link"` = `'/aip/connectors/{connector_id}/link'`

### getConversation

> `readonly` **getConversation**: `object`

#### getConversation.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConversation.path

> `readonly` **path**: `"/conversation/{conversation_id}"` = `'/conversation/{conversation_id}'`

### getConversationAttachment

> `readonly` **getConversationAttachment**: `object`

#### getConversationAttachment.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConversationAttachment.path

> `readonly` **path**: `"/conversation/{id}/attachment/{file_id}"` = `'/conversation/{id}/attachment/{file_id}'`

### getConversationAttachmentDownload

> `readonly` **getConversationAttachmentDownload**: `object`

#### getConversationAttachmentDownload.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConversationAttachmentDownload.path

> `readonly` **path**: `"/conversation/{id}/attachment/{file_id}/download"` = `'/conversation/{id}/attachment/{file_id}/download'`

### getConversationFiles

> `readonly` **getConversationFiles**: `object`

#### getConversationFiles.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConversationFiles.path

> `readonly` **path**: `"/conversations/{conversation_id}/files"` = `'/conversations/{conversation_id}/files'`

### getConversationsBatch

> `readonly` **getConversationsBatch**: `object`

#### getConversationsBatch.body

> `readonly` **body**: readonly \[`"conversation_ids"`\]

#### getConversationsBatch.method

> `readonly` **method**: `"POST"` = `'POST'`

#### getConversationsBatch.path

> `readonly` **path**: `"/conversations/batch"` = `'/conversations/batch'`

### getConversationWebSocketUrl

> `readonly` **getConversationWebSocketUrl**: `object`

#### getConversationWebSocketUrl.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getConversationWebSocketUrl.path

> `readonly` **path**: `"/celsius/ws/user"` = `'/celsius/ws/user'`

### getCreditsDiscountOffer

> `readonly` **getCreditsDiscountOffer**: `object`

#### getCreditsDiscountOffer.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getCreditsDiscountOffer.path

> `readonly` **path**: `"/subscriptions/credits/discount-offer"` = `'/subscriptions/credits/discount-offer'`

### getDictationConnectInfo

> `readonly` **getDictationConnectInfo**: `object`

#### getDictationConnectInfo.method

> `readonly` **method**: `"POST"` = `'POST'`

#### getDictationConnectInfo.path

> `readonly` **path**: `"/codex/dictation-stream-connect-info"` = `'/codex/dictation-stream-connect-info'`

### getFileDownloadUrl

> `readonly` **getFileDownloadUrl**: `object`

#### getFileDownloadUrl.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getFileDownloadUrl.path

> `readonly` **path**: `"/files/download/{file_id}"` = `'/files/download/{file_id}'`

### getGizmo

> `readonly` **getGizmo**: `object`

#### getGizmo.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getGizmo.path

> `readonly` **path**: `"/gizmos/{gizmo_id_or_short_url}"` = `'/gizmos/{gizmo_id_or_short_url}'`

### getGizmoConversations

> `readonly` **getGizmoConversations**: `object`

#### getGizmoConversations.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getGizmoConversations.path

> `readonly` **path**: `"/gizmos/{gizmo_id}/conversations"` = `'/gizmos/{gizmo_id}/conversations'`

#### getGizmoConversations.query

> `readonly` **query**: readonly \[`"limit"`, `"cursor"`\]

### getLibraryDirectoryPath

> `readonly` **getLibraryDirectoryPath**: `object`

#### getLibraryDirectoryPath.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getLibraryDirectoryPath.path

> `readonly` **path**: `"/files/library/directories/path"` = `'/files/library/directories/path'`

#### getLibraryDirectoryPath.query

> `readonly` **query**: readonly \[`"directory_id"`\]

### getLibraryFileThumbnail

> `readonly` **getLibraryFileThumbnail**: `object`

#### getLibraryFileThumbnail.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getLibraryFileThumbnail.path

> `readonly` **path**: `"/files/library/files/{library_file_id}/thumbnail"` = `'/files/library/files/{library_file_id}/thumbnail'`

### getMe

> `readonly` **getMe**: `object`

#### getMe.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getMe.path

> `readonly` **path**: `"/me"` = `'/me'`

### getMfaInfo

> `readonly` **getMfaInfo**: `object`

#### getMfaInfo.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getMfaInfo.path

> `readonly` **path**: `"/accounts/mfa_info"` = `'/accounts/mfa_info'`

### getModels

> `readonly` **getModels**: `object`

#### getModels.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getModels.path

> `readonly` **path**: `"/models"` = `'/models'`

#### getModels.query

> `readonly` **query**: readonly \[`"history_and_training_disabled"`\]

### getModelsConfig

> `readonly` **getModelsConfig**: `object`

#### getModelsConfig.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getModelsConfig.path

> `readonly` **path**: `"/models/config"` = `'/models/config'`

#### getModelsConfig.query

> `readonly` **query**: readonly \[`"slug"`\]

### getModelSlugs

> `readonly` **getModelSlugs**: `object`

#### getModelSlugs.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getModelSlugs.path

> `readonly` **path**: `"/models/slugs"` = `'/models/slugs'`

### getMonthlySpend

> `readonly` **getMonthlySpend**: `object`

#### getMonthlySpend.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getMonthlySpend.path

> `readonly` **path**: `"/accounts/{account_id}/spend-controls/current-user/monthly-usage"` = `'/accounts/{account_id}/spend-controls/current-user/monthly-usage'`

### getPaymentMethods

> `readonly` **getPaymentMethods**: `object`

#### getPaymentMethods.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getPaymentMethods.path

> `readonly` **path**: `"/payments/payment_methods"` = `'/payments/payment_methods'`

### getProjectConnectorScopes

> `readonly` **getProjectConnectorScopes**: `object`

#### getProjectConnectorScopes.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getProjectConnectorScopes.path

> `readonly` **path**: `"/projects/{project_id}/connector_scopes"` = `'/projects/{project_id}/connector_scopes'`

### getProjectSaves

> `readonly` **getProjectSaves**: `object`

#### getProjectSaves.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getProjectSaves.path

> `readonly` **path**: `"/projects/{project_id}/saves"` = `'/projects/{project_id}/saves'`

#### getProjectSaves.query

> `readonly` **query**: readonly \[`"limit"`, `"cursor"`\]

### getReferralEligibility

> `readonly` **getReferralEligibility**: `object`

#### getReferralEligibility.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getReferralEligibility.path

> `readonly` **path**: `"/referrals/invite/eligibility"` = `'/referrals/invite/eligibility'`

### getReferralTracking

> `readonly` **getReferralTracking**: `object`

#### getReferralTracking.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getReferralTracking.path

> `readonly` **path**: `"/referrals/invite/tracking"` = `'/referrals/invite/tracking'`

### getSubagentThreadTurns

> `readonly` **getSubagentThreadTurns**: `object`

#### getSubagentThreadTurns.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getSubagentThreadTurns.path

> `readonly` **path**: `"/flora/subagent/thread/turns"` = `'/flora/subagent/thread/turns'`

#### getSubagentThreadTurns.query

> `readonly` **query**: readonly \[`"conversationId"`, `"threadId"`, `"limit"`\]

### getSystemHints

> `readonly` **getSystemHints**: `object`

#### getSystemHints.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getSystemHints.path

> `readonly` **path**: `"/system_hints"` = `'/system_hints'`

#### getSystemHints.query

> `readonly` **query**: readonly \[`"mode"`, `"exclude_logo"`\]

### getTppModels

> `readonly` **getTppModels**: `object`

#### getTppModels.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getTppModels.path

> `readonly` **path**: `"/tpp/models/"` = `'/tpp/models/'`

### getUserMemories

> `readonly` **getUserMemories**: `object`

#### getUserMemories.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getUserMemories.path

> `readonly` **path**: `"/memories"` = `'/memories'`

#### getUserMemories.query

> `readonly` **query**: readonly \[`"include_memory_entries"`\]

### getUserMemorySummary

> `readonly` **getUserMemorySummary**: `object`

#### getUserMemorySummary.method

> `readonly` **method**: `"POST"` = `'POST'`

#### getUserMemorySummary.path

> `readonly` **path**: `"/memories/about_you/summary"` = `'/memories/about_you/summary'`

### getUserSettings

> `readonly` **getUserSettings**: `object`

#### getUserSettings.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getUserSettings.path

> `readonly` **path**: `"/settings/user"` = `'/settings/user'`

### getVoices

> `readonly` **getVoices**: `object`

#### getVoices.method

> `readonly` **method**: `"GET"` = `'GET'`

#### getVoices.path

> `readonly` **path**: `"/settings/voices"` = `'/settings/voices'`

### gizmosBootstrap

> `readonly` **gizmosBootstrap**: `object`

#### gizmosBootstrap.method

> `readonly` **method**: `"GET"` = `'GET'`

#### gizmosBootstrap.path

> `readonly` **path**: `"/gizmos/bootstrap"` = `'/gizmos/bootstrap'`

### gizmosSidebar

> `readonly` **gizmosSidebar**: `object`

#### gizmosSidebar.method

> `readonly` **method**: `"GET"` = `'GET'`

#### gizmosSidebar.path

> `readonly` **path**: `"/gizmos/snorlax/sidebar"` = `'/gizmos/snorlax/sidebar'`

#### gizmosSidebar.query

> `readonly` **query**: readonly \[`"limit"`, `"cursor"`\]

### globalSearch

> `readonly` **globalSearch**: `object`

#### globalSearch.method

> `readonly` **method**: `"GET"` = `'GET'`

#### globalSearch.path

> `readonly` **path**: `"/global/search"` = `'/global/search'`

#### globalSearch.query

> `readonly` **query**: readonly \[`"query"`, `"cursor"`, `"limit"`, `"sources"`\]

### listAccessibleConnectorLinks

> `readonly` **listAccessibleConnectorLinks**: `object`

#### listAccessibleConnectorLinks.method

> `readonly` **method**: `"GET"` = `'GET'`

#### listAccessibleConnectorLinks.path

> `readonly` **path**: `"/aip/connectors/links/list_accessible"` = `'/aip/connectors/links/list_accessible'`

### listConversations

> `readonly` **listConversations**: `object`

#### listConversations.method

> `readonly` **method**: `"GET"` = `'GET'`

#### listConversations.path

> `readonly` **path**: `"/conversations"` = `'/conversations'`

#### listConversations.query

> `readonly` **query**: readonly \[`"conversation_origin"`, `"exclude_conversation_origin"`, `"expand"`, `"hide_snorlax"`, `"is_archived"`, `"is_starred"`, `"limit"`, `"order"`, `"offset"`\]

### listLibraryNodes

> `readonly` **listLibraryNodes**: `object`

#### listLibraryNodes.method

> `readonly` **method**: `"GET"` = `'GET'`

#### listLibraryNodes.path

> `readonly` **path**: `"/files/library/nodes"` = `'/files/library/nodes'`

#### listLibraryNodes.query

> `readonly` **query**: readonly \[`"directory_id"`, `"cursor"`, `"limit"`\]

### listPins

> `readonly` **listPins**: `object`

#### listPins.method

> `readonly` **method**: `"GET"` = `'GET'`

#### listPins.path

> `readonly` **path**: `"/pins"` = `'/pins'`

### listWorkspaceAdminRequests

> `readonly` **listWorkspaceAdminRequests**: `object`

#### listWorkspaceAdminRequests.method

> `readonly` **method**: `"GET"` = `'GET'`

#### listWorkspaceAdminRequests.path

> `readonly` **path**: `"/accounts/{account_id}/workspace_admin_requests"` = `'/accounts/{account_id}/workspace_admin_requests'`

### magicEditWritingBlock

> `readonly` **magicEditWritingBlock**: `object`

#### magicEditWritingBlock.body

> `readonly` **body**: `true` = `true`

#### magicEditWritingBlock.method

> `readonly` **method**: `"POST"` = `'POST'`

#### magicEditWritingBlock.path

> `readonly` **path**: `"/conversation/message/writing-blocks/magic-edit"` = `'/conversation/message/writing-blocks/magic-edit'`

### patchAccountUserSetting

> `readonly` **patchAccountUserSetting**: `object`

#### patchAccountUserSetting.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### patchAccountUserSetting.path

> `readonly` **path**: `"/settings/account_user_setting"` = `'/settings/account_user_setting'`

#### patchAccountUserSetting.query

> `readonly` **query**: readonly \[`"feature"`, `"value"`\]

### patchConversation

> `readonly` **patchConversation**: `object`

#### patchConversation.body

> `readonly` **body**: `true` = `true`

#### patchConversation.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### patchConversation.path

> `readonly` **path**: `"/conversation/{conversation_id}"` = `'/conversation/{conversation_id}'`

### persistDilViewState

> `readonly` **persistDilViewState**: `object`

#### persistDilViewState.body

> `readonly` **body**: `true` = `true`

#### persistDilViewState.method

> `readonly` **method**: `"POST"` = `'POST'`

#### persistDilViewState.path

> `readonly` **path**: `"/conversation/{conversation_id}/message/{message_id}/dil/view_state"` = `'/conversation/{conversation_id}/message/{message_id}/dil/view_state'`

### prepareChatRequirements

> `readonly` **prepareChatRequirements**: `object`

#### prepareChatRequirements.body

> `readonly` **body**: readonly \[`"p"`\]

#### prepareChatRequirements.method

> `readonly` **method**: `"POST"` = `'POST'`

#### prepareChatRequirements.path

> `readonly` **path**: `"/sentinel/chat-requirements/prepare"` = `'/sentinel/chat-requirements/prepare'`

### prepareConversationStreamRaw

> `readonly` **prepareConversationStreamRaw**: `object`

#### prepareConversationStreamRaw.body

> `readonly` **body**: `true` = `true`

#### prepareConversationStreamRaw.method

> `readonly` **method**: `"POST"` = `'POST'`

#### prepareConversationStreamRaw.path

> `readonly` **path**: `"/f/conversation/prepare"` = `'/f/conversation/prepare'`

### previewSubscriptionUpdate

> `readonly` **previewSubscriptionUpdate**: `object`

#### previewSubscriptionUpdate.body

> `readonly` **body**: `true` = `true`

#### previewSubscriptionUpdate.method

> `readonly` **method**: `"POST"` = `'POST'`

#### previewSubscriptionUpdate.path

> `readonly` **path**: `"/subscriptions/update/preview"` = `'/subscriptions/update/preview'`

### processFileUploadStream

> `readonly` **processFileUploadStream**: `object`

#### processFileUploadStream.body

> `readonly` **body**: `true` = `true`

#### processFileUploadStream.method

> `readonly` **method**: `"POST"` = `'POST'`

#### processFileUploadStream.path

> `readonly` **path**: `"/files/process_upload_stream"` = `'/files/process_upload_stream'`

#### processFileUploadStream.stream

> `readonly` **stream**: `"ndjson"` = `'ndjson'`

### rateConversation

> `readonly` **rateConversation**: `object`

#### rateConversation.body

> `readonly` **body**: `true` = `true`

#### rateConversation.method

> `readonly` **method**: `"POST"` = `'POST'`

#### rateConversation.path

> `readonly` **path**: `"/conversation/{conversation_id}/rating"` = `'/conversation/{conversation_id}/rating'`

### reauthOAuthConnectorLink

> `readonly` **reauthOAuthConnectorLink**: `object`

#### reauthOAuthConnectorLink.body

> `readonly` **body**: `true` = `true`

#### reauthOAuthConnectorLink.method

> `readonly` **method**: `"POST"` = `'POST'`

#### reauthOAuthConnectorLink.path

> `readonly` **path**: `"/aip/connectors/links/oauth/reauth"` = `'/aip/connectors/links/oauth/reauth'`

### refreshGenUiWidget

> `readonly` **refreshGenUiWidget**: `object`

#### refreshGenUiWidget.body

> `readonly` **body**: `true` = `true`

#### refreshGenUiWidget.method

> `readonly` **method**: `"POST"` = `'POST'`

#### refreshGenUiWidget.path

> `readonly` **path**: `"/conversation/{conversation_id}/message/{message_id}/genui/refresh_widget"` = `'/conversation/{conversation_id}/message/{message_id}/genui/refresh_widget'`

### remoteControlClient

> `readonly` **remoteControlClient**: `object`

#### remoteControlClient.method

> `readonly` **method**: `"GET"` = `'GET'`

#### remoteControlClient.path

> `readonly` **path**: `"/codex/remote/control/client"` = `'/codex/remote/control/client'`

### remoteControlEnrollFinish

> `readonly` **remoteControlEnrollFinish**: `object`

#### remoteControlEnrollFinish.body

> `readonly` **body**: `true` = `true`

#### remoteControlEnrollFinish.method

> `readonly` **method**: `"POST"` = `'POST'`

#### remoteControlEnrollFinish.path

> `readonly` **path**: `"/codex/remote/control/client/enroll/finish"` = `'/codex/remote/control/client/enroll/finish'`

### remoteControlEnrollStart

> `readonly` **remoteControlEnrollStart**: `object`

#### remoteControlEnrollStart.body

> `readonly` **body**: `true` = `true`

#### remoteControlEnrollStart.method

> `readonly` **method**: `"POST"` = `'POST'`

#### remoteControlEnrollStart.path

> `readonly` **path**: `"/codex/remote/control/client/enroll/start"` = `'/codex/remote/control/client/enroll/start'`

### remoteControlRefreshFinish

> `readonly` **remoteControlRefreshFinish**: `object`

#### remoteControlRefreshFinish.body

> `readonly` **body**: `true` = `true`

#### remoteControlRefreshFinish.method

> `readonly` **method**: `"POST"` = `'POST'`

#### remoteControlRefreshFinish.path

> `readonly` **path**: `"/codex/remote/control/client/refresh/finish"` = `'/codex/remote/control/client/refresh/finish'`

### remoteControlRefreshStart

> `readonly` **remoteControlRefreshStart**: `object`

#### remoteControlRefreshStart.body

> `readonly` **body**: `true` = `true`

#### remoteControlRefreshStart.method

> `readonly` **method**: `"POST"` = `'POST'`

#### remoteControlRefreshStart.path

> `readonly` **path**: `"/codex/remote/control/client/refresh/start"` = `'/codex/remote/control/client/refresh/start'`

### removePin

> `readonly` **removePin**: `object`

#### removePin.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### removePin.path

> `readonly` **path**: `"/pins/{item_type}/{item_id}"` = `'/pins/{item_type}/{item_id}'`

### renameConversation

> `readonly` **renameConversation**: `object`

#### renameConversation.body

> `readonly` **body**: readonly \[`"title"`\]

#### renameConversation.method

> `readonly` **method**: `"POST"` = `'POST'`

#### renameConversation.path

> `readonly` **path**: `"/conversation/id/{conversation_id}/rename"` = `'/conversation/id/{conversation_id}/rename'`

### resumeConversationStream

> `readonly` **resumeConversationStream**: `object`

#### resumeConversationStream.body

> `readonly` **body**: `true` = `true`

#### resumeConversationStream.method

> `readonly` **method**: `"POST"` = `'POST'`

#### resumeConversationStream.path

> `readonly` **path**: `"/f/conversation/resume"` = `'/f/conversation/resume'`

#### resumeConversationStream.stream

> `readonly` **stream**: `"sse"` = `'sse'`

### searchConversations

> `readonly` **searchConversations**: `object`

#### searchConversations.method

> `readonly` **method**: `"GET"` = `'GET'`

#### searchConversations.path

> `readonly` **path**: `"/conversations/search"` = `'/conversations/search'`

#### searchConversations.query

> `readonly` **query**: readonly \[`"query"`, `"cursor"`\]

### searchGoogleContacts

> `readonly` **searchGoogleContacts**: `object`

#### searchGoogleContacts.body

> `readonly` **body**: `true` = `true`

#### searchGoogleContacts.method

> `readonly` **method**: `"POST"` = `'POST'`

#### searchGoogleContacts.path

> `readonly` **path**: `"/aip/connectors/google_contacts/search_contacts"` = `'/aip/connectors/google_contacts/search_contacts'`

### sendAddCreditsNudgeEmail

> `readonly` **sendAddCreditsNudgeEmail**: `object`

#### sendAddCreditsNudgeEmail.body

> `readonly` **body**: `true` = `true`

#### sendAddCreditsNudgeEmail.method

> `readonly` **method**: `"POST"` = `'POST'`

#### sendAddCreditsNudgeEmail.path

> `readonly` **path**: `"/accounts/send_add_credits_nudge_email"` = `'/accounts/send_add_credits_nudge_email'`

### sendConnectorEmail

> `readonly` **sendConnectorEmail**: `object`

#### sendConnectorEmail.body

> `readonly` **body**: `true` = `true`

#### sendConnectorEmail.method

> `readonly` **method**: `"POST"` = `'POST'`

#### sendConnectorEmail.path

> `readonly` **path**: `"/aip/connectors/email/send_email"` = `'/aip/connectors/email/send_email'`

### sendReferralInviteEmail

> `readonly` **sendReferralInviteEmail**: `object`

#### sendReferralInviteEmail.body

> `readonly` **body**: `true` = `true`

#### sendReferralInviteEmail.method

> `readonly` **method**: `"POST"` = `'POST'`

#### sendReferralInviteEmail.path

> `readonly` **path**: `"/referrals/invite/{referral_id}/send-email"` = `'/referrals/invite/{referral_id}/send-email'`

### sentinelHeartbeat

> `readonly` **sentinelHeartbeat**: `object`

#### sentinelHeartbeat.method

> `readonly` **method**: `"POST"` = `'POST'`

#### sentinelHeartbeat.path

> `readonly` **path**: `"/sentinel/heartbeat"` = `'/sentinel/heartbeat'`

### sidebarConversationStream

> `readonly` **sidebarConversationStream**: `object`

#### sidebarConversationStream.body

> `readonly` **body**: `true` = `true`

#### sidebarConversationStream.method

> `readonly` **method**: `"POST"` = `'POST'`

#### sidebarConversationStream.path

> `readonly` **path**: `"/sidebar/conversation"` = `'/sidebar/conversation'`

#### sidebarConversationStream.stream

> `readonly` **stream**: `"sse"` = `'sse'`

### unsendConnectorEmail

> `readonly` **unsendConnectorEmail**: `object`

#### unsendConnectorEmail.body

> `readonly` **body**: `true` = `true`

#### unsendConnectorEmail.method

> `readonly` **method**: `"POST"` = `'POST'`

#### unsendConnectorEmail.path

> `readonly` **path**: `"/aip/connectors/email/unsend_email"` = `'/aip/connectors/email/unsend_email'`

### updateAutoTopUp

> `readonly` **updateAutoTopUp**: `object`

#### updateAutoTopUp.body

> `readonly` **body**: `true` = `true`

#### updateAutoTopUp.method

> `readonly` **method**: `"POST"` = `'POST'`

#### updateAutoTopUp.path

> `readonly` **path**: `"/subscriptions/auto_top_up/update"` = `'/subscriptions/auto_top_up/update'`

### updateLibraryFile

> `readonly` **updateLibraryFile**: `object`

#### updateLibraryFile.body

> `readonly` **body**: `true` = `true`

#### updateLibraryFile.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### updateLibraryFile.path

> `readonly` **path**: `"/files/library/files/{library_file_id}"` = `'/files/library/files/{library_file_id}'`

### updateProject

> `readonly` **updateProject**: `object`

#### updateProject.body

> `readonly` **body**: `true` = `true`

#### updateProject.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### updateProject.path

> `readonly` **path**: `"/projects/{project_id}"` = `'/projects/{project_id}'`

### updateShareLink

> `readonly` **updateShareLink**: `object`

#### updateShareLink.body

> `readonly` **body**: `true` = `true`

#### updateShareLink.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### updateShareLink.path

> `readonly` **path**: `"/share/{shared_conversation_id}"` = `'/share/{shared_conversation_id}'`

### updateSubscription

> `readonly` **updateSubscription**: `object`

#### updateSubscription.body

> `readonly` **body**: `true` = `true`

#### updateSubscription.method

> `readonly` **method**: `"POST"` = `'POST'`

#### updateSubscription.path

> `readonly` **path**: `"/subscriptions/update"` = `'/subscriptions/update'`

### updateWorkspaceAdminRequest

> `readonly` **updateWorkspaceAdminRequest**: `object`

#### updateWorkspaceAdminRequest.body

> `readonly` **body**: `true` = `true`

#### updateWorkspaceAdminRequest.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### updateWorkspaceAdminRequest.path

> `readonly` **path**: `"/accounts/{account_id}/workspace_admin_requests/{request_id}"` = `'/accounts/{account_id}/workspace_admin_requests/{request_id}'`

### updateWritingBlock

> `readonly` **updateWritingBlock**: `object`

#### updateWritingBlock.body

> `readonly` **body**: `true` = `true`

#### updateWritingBlock.method

> `readonly` **method**: `"POST"` = `'POST'`

#### updateWritingBlock.path

> `readonly` **path**: `"/conversation/message/writing-blocks"` = `'/conversation/message/writing-blocks'`

### whamAccountsCheck

> `readonly` **whamAccountsCheck**: `object`

#### whamAccountsCheck.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamAccountsCheck.path

> `readonly` **path**: `"/wham/accounts/check"` = `'/wham/accounts/check'`

### whamAnalyticsEvents

> `readonly` **whamAnalyticsEvents**: `object`

#### whamAnalyticsEvents.body

> `readonly` **body**: `true` = `true`

#### whamAnalyticsEvents.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamAnalyticsEvents.path

> `readonly` **path**: `"/wham/analytics-events/events"` = `'/wham/analytics-events/events'`

### whamApps

> `readonly` **whamApps**: `object`

#### whamApps.body

> `readonly` **body**: `true` = `true`

#### whamApps.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamApps.path

> `readonly` **path**: `"/wham/apps"` = `'/wham/apps'`

### whamArchiveTask

> `readonly` **whamArchiveTask**: `object`

#### whamArchiveTask.body

> `readonly` **body**: `true` = `true`

#### whamArchiveTask.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamArchiveTask.path

> `readonly` **path**: `"/wham/tasks/{task_id}/archive"` = `'/wham/tasks/{task_id}/archive'`

### whamCancelTask

> `readonly` **whamCancelTask**: `object`

#### whamCancelTask.body

> `readonly` **body**: `true` = `true`

#### whamCancelTask.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamCancelTask.path

> `readonly` **path**: `"/wham/tasks/{task_id}/cancel"` = `'/wham/tasks/{task_id}/cancel'`

### whamCompleteDesktopOnboarding

> `readonly` **whamCompleteDesktopOnboarding**: `object`

#### whamCompleteDesktopOnboarding.body

> `readonly` **body**: `true` = `true`

#### whamCompleteDesktopOnboarding.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamCompleteDesktopOnboarding.path

> `readonly` **path**: `"/wham/onboarding/desktop/complete"` = `'/wham/onboarding/desktop/complete'`

### whamConsumeRateLimitResetCredit

> `readonly` **whamConsumeRateLimitResetCredit**: `object`

#### whamConsumeRateLimitResetCredit.body

> `readonly` **body**: `true` = `true`

#### whamConsumeRateLimitResetCredit.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamConsumeRateLimitResetCredit.path

> `readonly` **path**: `"/wham/rate-limit-reset-credits/consume"` = `'/wham/rate-limit-reset-credits/consume'`

### whamCreatePullRequest

> `readonly` **whamCreatePullRequest**: `object`

#### whamCreatePullRequest.body

> `readonly` **body**: `true` = `true`

#### whamCreatePullRequest.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamCreatePullRequest.path

> `readonly` **path**: `"/wham/tasks/{task_id}/turns/{task_turn_id}/pr"` = `'/wham/tasks/{task_id}/turns/{task_turn_id}/pr'`

### whamCreateTask

> `readonly` **whamCreateTask**: `object`

#### whamCreateTask.body

> `readonly` **body**: `true` = `true`

#### whamCreateTask.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamCreateTask.path

> `readonly` **path**: `"/wham/tasks"` = `'/wham/tasks'`

### whamDeleteRemoteControlClient

> `readonly` **whamDeleteRemoteControlClient**: `object`

#### whamDeleteRemoteControlClient.method

> `readonly` **method**: `"DELETE"` = `'DELETE'`

#### whamDeleteRemoteControlClient.path

> `readonly` **path**: `"/wham/remote/control/clients/{client_id}"` = `'/wham/remote/control/clients/{client_id}'`

### whamDesktopOnboardingState

> `readonly` **whamDesktopOnboardingState**: `object`

#### whamDesktopOnboardingState.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamDesktopOnboardingState.path

> `readonly` **path**: `"/wham/onboarding/desktop/complete"` = `'/wham/onboarding/desktop/complete'`

### whamFinanceEligibility

> `readonly` **whamFinanceEligibility**: `object`

#### whamFinanceEligibility.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamFinanceEligibility.path

> `readonly` **path**: `"/wham/finance/eligibility"` = `'/wham/finance/eligibility'`

### whamGetEnvironmentsByRepo

> `readonly` **whamGetEnvironmentsByRepo**: `object`

#### whamGetEnvironmentsByRepo.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetEnvironmentsByRepo.path

> `readonly` **path**: `"/wham/environments/by-repo/{provider}/{repo_owner}/{repo_name}"` = `'/wham/environments/by-repo/{provider}/{repo_owner}/{repo_name}'`

### whamGetProfile

> `readonly` **whamGetProfile**: `object`

#### whamGetProfile.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetProfile.path

> `readonly` **path**: `"/wham/profiles/me"` = `'/wham/profiles/me'`

### whamGetRemoteControlMfaRequirement

> `readonly` **whamGetRemoteControlMfaRequirement**: `object`

#### whamGetRemoteControlMfaRequirement.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetRemoteControlMfaRequirement.path

> `readonly` **path**: `"/wham/remote/control/mfa_requirement"` = `'/wham/remote/control/mfa_requirement'`

### whamGetTask

> `readonly` **whamGetTask**: `object`

#### whamGetTask.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetTask.path

> `readonly` **path**: `"/wham/tasks/{task_id}"` = `'/wham/tasks/{task_id}'`

### whamGetTaskTurn

> `readonly` **whamGetTaskTurn**: `object`

#### whamGetTaskTurn.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetTaskTurn.path

> `readonly` **path**: `"/wham/tasks/{task_id}/turns/{task_turn_id}"` = `'/wham/tasks/{task_id}/turns/{task_turn_id}'`

### whamGetTaskTurnLogs

> `readonly` **whamGetTaskTurnLogs**: `object`

#### whamGetTaskTurnLogs.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetTaskTurnLogs.path

> `readonly` **path**: `"/wham/tasks/{task_id}/turns/{task_turn_id}/logs"` = `'/wham/tasks/{task_id}/turns/{task_turn_id}/logs'`

### whamGetUsage

> `readonly` **whamGetUsage**: `object`

#### whamGetUsage.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamGetUsage.path

> `readonly` **path**: `"/wham/usage"` = `'/wham/usage'`

### whamGoogleDriveUpload

> `readonly` **whamGoogleDriveUpload**: `object`

#### whamGoogleDriveUpload.body

> `readonly` **body**: `true` = `true`

#### whamGoogleDriveUpload.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamGoogleDriveUpload.path

> `readonly` **path**: `"/wham/apps/google_drive/upload"` = `'/wham/apps/google_drive/upload'`

### whamListEnvironments

> `readonly` **whamListEnvironments**: `object`

#### whamListEnvironments.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamListEnvironments.path

> `readonly` **path**: `"/wham/environments"` = `'/wham/environments'`

### whamListRemoteControlClients

> `readonly` **whamListRemoteControlClients**: `object`

#### whamListRemoteControlClients.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamListRemoteControlClients.path

> `readonly` **path**: `"/wham/remote/control/clients"` = `'/wham/remote/control/clients'`

### whamListTasks

> `readonly` **whamListTasks**: `object`

#### whamListTasks.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamListTasks.path

> `readonly` **path**: `"/wham/tasks/list"` = `'/wham/tasks/list'`

#### whamListTasks.query

> `readonly` **query**: readonly \[`"limit"`, `"cursor"`, `"environment_id"`, `"status"`\]

### whamListTaskTurns

> `readonly` **whamListTaskTurns**: `object`

#### whamListTaskTurns.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamListTaskTurns.path

> `readonly` **path**: `"/wham/tasks/{task_id}/turns"` = `'/wham/tasks/{task_id}/turns'`

### whamMarkTaskRead

> `readonly` **whamMarkTaskRead**: `object`

#### whamMarkTaskRead.body

> `readonly` **body**: `true` = `true`

#### whamMarkTaskRead.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamMarkTaskRead.path

> `readonly` **path**: `"/wham/tasks/{task_id}/mark_read"` = `'/wham/tasks/{task_id}/mark_read'`

### whamOnboardingContext

> `readonly` **whamOnboardingContext**: `object`

#### whamOnboardingContext.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamOnboardingContext.path

> `readonly` **path**: `"/wham/onboarding/context"` = `'/wham/onboarding/context'`

### whamPairRemoteControlClient

> `readonly` **whamPairRemoteControlClient**: `object`

#### whamPairRemoteControlClient.body

> `readonly` **body**: `true` = `true`

#### whamPairRemoteControlClient.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamPairRemoteControlClient.path

> `readonly` **path**: `"/wham/remote/control/client/pair"` = `'/wham/remote/control/client/pair'`

### whamQueryThreadUsage

> `readonly` **whamQueryThreadUsage**: `object`

#### whamQueryThreadUsage.body

> `readonly` **body**: `true` = `true`

#### whamQueryThreadUsage.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamQueryThreadUsage.path

> `readonly` **path**: `"/wham/usage/thread_usage/query"` = `'/wham/usage/thread_usage/query'`

### whamRateLimitResetCredits

> `readonly` **whamRateLimitResetCredits**: `object`

#### whamRateLimitResetCredits.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamRateLimitResetCredits.path

> `readonly` **path**: `"/wham/rate-limit-reset-credits"` = `'/wham/rate-limit-reset-credits'`

### whamRecoverTask

> `readonly` **whamRecoverTask**: `object`

#### whamRecoverTask.body

> `readonly` **body**: `true` = `true`

#### whamRecoverTask.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamRecoverTask.path

> `readonly` **path**: `"/wham/tasks/{task_id}/recover"` = `'/wham/tasks/{task_id}/recover'`

### whamSearchBranches

> `readonly` **whamSearchBranches**: `object`

#### whamSearchBranches.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamSearchBranches.path

> `readonly` **path**: `"/wham/github/branches/{repo_id}/search"` = `'/wham/github/branches/{repo_id}/search'`

#### whamSearchBranches.query

> `readonly` **query**: readonly \[`"query"`, `"limit"`\]

### whamSetRemoteControlMfaRequirement

> `readonly` **whamSetRemoteControlMfaRequirement**: `object`

#### whamSetRemoteControlMfaRequirement.body

> `readonly` **body**: `true` = `true`

#### whamSetRemoteControlMfaRequirement.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamSetRemoteControlMfaRequirement.path

> `readonly` **path**: `"/wham/remote/control/mfa_requirement"` = `'/wham/remote/control/mfa_requirement'`

### whamSettingsUser

> `readonly` **whamSettingsUser**: `object`

#### whamSettingsUser.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamSettingsUser.path

> `readonly` **path**: `"/wham/settings/user"` = `'/wham/settings/user'`

### whamSitesAccess

> `readonly` **whamSitesAccess**: `object`

#### whamSitesAccess.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamSitesAccess.path

> `readonly` **path**: `"/wham/sites/access"` = `'/wham/sites/access'`

### whamStatsigBootstrap

> `readonly` **whamStatsigBootstrap**: `object`

#### whamStatsigBootstrap.body

> `readonly` **body**: `true` = `true`

#### whamStatsigBootstrap.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamStatsigBootstrap.path

> `readonly` **path**: `"/wham/statsig/bootstrap"` = `'/wham/statsig/bootstrap'`

### whamUpdateProfile

> `readonly` **whamUpdateProfile**: `object`

#### whamUpdateProfile.body

> `readonly` **body**: `true` = `true`

#### whamUpdateProfile.method

> `readonly` **method**: `"PATCH"` = `'PATCH'`

#### whamUpdateProfile.path

> `readonly` **path**: `"/wham/profiles/me"` = `'/wham/profiles/me'`

### whamUploadProfilePhoto

> `readonly` **whamUploadProfilePhoto**: `object`

#### whamUploadProfilePhoto.body

> `readonly` **body**: `true` = `true`

#### whamUploadProfilePhoto.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamUploadProfilePhoto.path

> `readonly` **path**: `"/wham/profiles/me/photo"` = `'/wham/profiles/me/photo'`

### whamWorkspaceMessages

> `readonly` **whamWorkspaceMessages**: `object`

#### whamWorkspaceMessages.method

> `readonly` **method**: `"GET"` = `'GET'`

#### whamWorkspaceMessages.path

> `readonly` **path**: `"/wham/workspace-messages"` = `'/wham/workspace-messages'`

### whamWorktreeSnapshotFinishUpload

> `readonly` **whamWorktreeSnapshotFinishUpload**: `object`

#### whamWorktreeSnapshotFinishUpload.body

> `readonly` **body**: `true` = `true`

#### whamWorktreeSnapshotFinishUpload.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamWorktreeSnapshotFinishUpload.path

> `readonly` **path**: `"/wham/worktree_snapshots/finish_upload"` = `'/wham/worktree_snapshots/finish_upload'`

### whamWorktreeSnapshotUploadUrl

> `readonly` **whamWorktreeSnapshotUploadUrl**: `object`

#### whamWorktreeSnapshotUploadUrl.body

> `readonly` **body**: `true` = `true`

#### whamWorktreeSnapshotUploadUrl.method

> `readonly` **method**: `"POST"` = `'POST'`

#### whamWorktreeSnapshotUploadUrl.path

> `readonly` **path**: `"/wham/worktree_snapshots/upload_url"` = `'/wham/worktree_snapshots/upload_url'`
