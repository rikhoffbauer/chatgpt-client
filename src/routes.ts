// @ts-nocheck
// Declarative catalog of every backend-api route the app's renderer can call.
//
// Extracted from webview/assets/app-initial-*.js (the `safeGet/safePost/safePatch/safeDelete/
// streamPost` call sites of the generated OpenAPI client) plus the literal-path sweep for the
// handful of endpoints that are built by hand (estuary uploads, dictation, codex responses).
//
// Shape of an entry:
//   method  HTTP verb
//   path    route template; `{name}` placeholders are filled from the argument object
//   query   argument keys that become query-string parameters
//   body    true  -> every remaining argument becomes the JSON body
//           [..]  -> only these keys become the body
//           false -> no body (default for GET/DELETE)
//   stream  'sse' | 'ndjson' — returns a Response instead of parsed JSON
//   headers extra static headers
//
// client.js turns each entry into a method of the same name, so anything listed here is
// callable as `client.<name>({...})` and from the CLI as `api <name> --key=value`.

export const ROUTES = {
  // ---------------------------------------------------------------------------
  // conversations
  // ---------------------------------------------------------------------------
  listConversations: {
    method: 'GET',
    path: '/conversations',
    query: [
      'conversation_origin',
      'exclude_conversation_origin',
      'expand',
      'hide_snorlax',
      'is_archived',
      'is_starred',
      'limit',
      'order',
      'offset',
    ],
  },
  searchConversations: { method: 'GET', path: '/conversations/search', query: ['query', 'cursor'] },
  globalSearch: { method: 'GET', path: '/global/search', query: ['query', 'cursor', 'limit', 'sources'] },
  getConversationsBatch: { method: 'POST', path: '/conversations/batch', body: ['conversation_ids'] },
  getConversation: { method: 'GET', path: '/conversation/{conversation_id}' },
  patchConversation: { method: 'PATCH', path: '/conversation/{conversation_id}', body: true },
  renameConversation: { method: 'POST', path: '/conversation/id/{conversation_id}/rename', body: ['title'] },
  deleteConversation: { method: 'DELETE', path: '/conversation/id/{conversation_id}' },
  rateConversation: { method: 'POST', path: '/conversation/{conversation_id}/rating', body: true },
  branchConversation: { method: 'POST', path: '/conversation/new_branch', body: true },
  getConversationFiles: { method: 'GET', path: '/conversations/{conversation_id}/files' },
  getConversationAttachment: { method: 'GET', path: '/conversation/{id}/attachment/{file_id}' },
  getConversationAttachmentDownload: { method: 'GET', path: '/conversation/{id}/attachment/{file_id}/download' },
  persistDilViewState: {
    method: 'POST',
    path: '/conversation/{conversation_id}/message/{message_id}/dil/view_state',
    body: true,
  },
  refreshGenUiWidget: {
    method: 'POST',
    path: '/conversation/{conversation_id}/message/{message_id}/genui/refresh_widget',
    body: true,
  },
  updateWritingBlock: { method: 'POST', path: '/conversation/message/writing-blocks', body: true },
  magicEditWritingBlock: { method: 'POST', path: '/conversation/message/writing-blocks/magic-edit', body: true },
  getConversationWebSocketUrl: { method: 'GET', path: '/celsius/ws/user' },

  // ---------------------------------------------------------------------------
  // messaging / streaming — the actual chat turn
  // ---------------------------------------------------------------------------
  prepareConversationStreamRaw: { method: 'POST', path: '/f/conversation/prepare', body: true },
  conversationStream: { method: 'POST', path: '/f/conversation', body: true, stream: 'sse' },
  resumeConversationStream: { method: 'POST', path: '/f/conversation/resume', body: true, stream: 'sse' },
  sidebarConversationStream: { method: 'POST', path: '/sidebar/conversation', body: true, stream: 'sse' },
  codexResponses: { method: 'POST', path: '/codex/responses', body: true, stream: 'sse' },

  // ---------------------------------------------------------------------------
  // sentinel / integrity
  // ---------------------------------------------------------------------------
  prepareChatRequirements: { method: 'POST', path: '/sentinel/chat-requirements/prepare', body: ['p'] },
  sentinelHeartbeat: { method: 'POST', path: '/sentinel/heartbeat' },
  attestationChallenge: {
    method: 'GET',
    path: '/ios/attestation_challenge',
    headers: { 'X-OpenAI-Attach-DeviceCheck-Token': '1' },
  },

  // ---------------------------------------------------------------------------
  // models & hints
  // ---------------------------------------------------------------------------
  getModels: { method: 'GET', path: '/models', query: ['history_and_training_disabled'] },
  getModelsConfig: { method: 'GET', path: '/models/config', query: ['slug'] },
  getModelSlugs: { method: 'GET', path: '/models/slugs' },
  getTppModels: { method: 'GET', path: '/tpp/models/' },
  getSystemHints: { method: 'GET', path: '/system_hints', query: ['mode', 'exclude_logo'] },
  getAgentSystemHint: { method: 'GET', path: '/hermes/agent/{agent_id}/system-hint' },
  getSubagentThreadTurns: {
    method: 'GET',
    path: '/flora/subagent/thread/turns',
    query: ['conversationId', 'threadId', 'limit'],
  },

  // ---------------------------------------------------------------------------
  // files & library
  // ---------------------------------------------------------------------------
  createFile: { method: 'POST', path: '/files', body: true },
  finalizeFileUpload: { method: 'POST', path: '/files/{file_id}/uploaded', body: true },
  getFileDownloadUrl: { method: 'GET', path: '/files/download/{file_id}' },
  processFileUploadStream: { method: 'POST', path: '/files/process_upload_stream', body: true, stream: 'ndjson' },
  createLibraryFile: { method: 'POST', path: '/files/library', body: true },
  createLibraryDirectory: { method: 'POST', path: '/files/library/directories', body: true },
  getLibraryDirectoryPath: { method: 'GET', path: '/files/library/directories/path', query: ['directory_id'] },
  updateLibraryFile: { method: 'PATCH', path: '/files/library/files/{library_file_id}', body: true },
  deleteLibraryFile: { method: 'DELETE', path: '/files/library/files/{library_file_id}' },
  getLibraryFileThumbnail: { method: 'GET', path: '/files/library/files/{library_file_id}/thumbnail' },
  listLibraryNodes: { method: 'GET', path: '/files/library/nodes', query: ['directory_id', 'cursor', 'limit'] },

  // ---------------------------------------------------------------------------
  // projects & gizmos
  // ---------------------------------------------------------------------------
  gizmosBootstrap: { method: 'GET', path: '/gizmos/bootstrap' },
  gizmosSidebar: { method: 'GET', path: '/gizmos/snorlax/sidebar', query: ['limit', 'cursor'] },
  getGizmo: { method: 'GET', path: '/gizmos/{gizmo_id_or_short_url}' },
  deleteGizmo: { method: 'DELETE', path: '/gizmos/{gizmo_id}' },
  getGizmoConversations: { method: 'GET', path: '/gizmos/{gizmo_id}/conversations', query: ['limit', 'cursor'] },
  createProject: { method: 'POST', path: '/projects', body: true },
  updateProject: { method: 'PATCH', path: '/projects/{project_id}', body: true },
  getProjectConnectorScopes: { method: 'GET', path: '/projects/{project_id}/connector_scopes' },
  addProjectFile: { method: 'POST', path: '/projects/{project_id}/files', body: true },
  deleteProjectFile: { method: 'DELETE', path: '/projects/{project_id}/files/{file_id}' },
  getProjectSaves: { method: 'GET', path: '/projects/{project_id}/saves', query: ['limit', 'cursor'] },

  // ---------------------------------------------------------------------------
  // sharing & pins
  // ---------------------------------------------------------------------------
  createShareLink: { method: 'POST', path: '/share/create', body: true },
  createShareLinkV2: { method: 'POST', path: '/share/v2/create', body: true },
  updateShareLink: { method: 'PATCH', path: '/share/{shared_conversation_id}', body: true },
  listPins: { method: 'GET', path: '/pins' },
  addPin: { method: 'POST', path: '/pins/{item_type}/{item_id}' },
  removePin: { method: 'DELETE', path: '/pins/{item_type}/{item_id}' },

  // ---------------------------------------------------------------------------
  // settings & account
  // ---------------------------------------------------------------------------
  getUserSettings: { method: 'GET', path: '/settings/user' },
  getVoices: { method: 'GET', path: '/settings/voices' },
  patchAccountUserSetting: { method: 'PATCH', path: '/settings/account_user_setting', query: ['feature', 'value'] },
  accountsCheck: { method: 'GET', path: '/accounts/check/{version}' },
  getAccountSettings: { method: 'GET', path: '/accounts/{account_id}/settings' },
  getMfaInfo: { method: 'GET', path: '/accounts/mfa_info' },
  listWorkspaceAdminRequests: { method: 'GET', path: '/accounts/{account_id}/workspace_admin_requests' },
  createWorkspaceAdminRequest: { method: 'POST', path: '/accounts/{account_id}/workspace_admin_requests', body: true },
  updateWorkspaceAdminRequest: {
    method: 'PATCH',
    path: '/accounts/{account_id}/workspace_admin_requests/{request_id}',
    body: true,
  },
  sendAddCreditsNudgeEmail: { method: 'POST', path: '/accounts/send_add_credits_nudge_email', body: true },
  getMonthlySpend: { method: 'GET', path: '/accounts/{account_id}/spend-controls/current-user/monthly-usage' },
  getMe: { method: 'GET', path: '/me' },

  // ---------------------------------------------------------------------------
  // billing
  // ---------------------------------------------------------------------------
  getPaymentMethods: { method: 'GET', path: '/payments/payment_methods' },
  previewSubscriptionUpdate: { method: 'POST', path: '/subscriptions/update/preview', body: true },
  updateSubscription: { method: 'POST', path: '/subscriptions/update', body: true },
  cancelPendingSubscriptionUpdate: { method: 'POST', path: '/subscriptions/update/cancel_pending', body: true },
  getAutoTopUpSettings: { method: 'GET', path: '/subscriptions/auto_top_up/settings' },
  enableAutoTopUp: { method: 'POST', path: '/subscriptions/auto_top_up/enable', body: true },
  updateAutoTopUp: { method: 'POST', path: '/subscriptions/auto_top_up/update', body: true },
  disableAutoTopUp: { method: 'POST', path: '/subscriptions/auto_top_up/disable', body: true },
  getCreditsDiscountOffer: { method: 'GET', path: '/subscriptions/credits/discount-offer' },
  getCheckoutPricingConfig: { method: 'GET', path: '/checkout_pricing_config/configs/{country_code}' },

  // ---------------------------------------------------------------------------
  // referrals
  // ---------------------------------------------------------------------------
  getReferralEligibility: { method: 'GET', path: '/referrals/invite/eligibility' },
  getReferralTracking: { method: 'GET', path: '/referrals/invite/tracking' },
  createReferralInvite: { method: 'POST', path: '/referrals/invite', body: true },
  sendReferralInviteEmail: { method: 'POST', path: '/referrals/invite/{referral_id}/send-email', body: true },

  // ---------------------------------------------------------------------------
  // connectors (aip)
  // ---------------------------------------------------------------------------
  getConnector: { method: 'GET', path: '/aip/connectors/{connector_id}' },
  getConnectorLink: { method: 'GET', path: '/aip/connectors/{connector_id}/link' },
  acceptConnectorTos: { method: 'POST', path: '/aip/connectors/{connector_id}/tos', body: true },
  createNoAuthConnectorLink: { method: 'POST', path: '/aip/connectors/links/noauth', body: true },
  createOAuthConnectorLink: { method: 'POST', path: '/aip/connectors/links/oauth', body: true },
  reauthOAuthConnectorLink: { method: 'POST', path: '/aip/connectors/links/oauth/reauth', body: true },
  completeOAuthConnectorLink: { method: 'POST', path: '/aip/connectors/links/oauth/callback', body: true },
  listAccessibleConnectorLinks: { method: 'GET', path: '/aip/connectors/links/list_accessible' },
  sendConnectorEmail: { method: 'POST', path: '/aip/connectors/email/send_email', body: true },
  getConnectorEmailStatus: { method: 'GET', path: '/aip/connectors/email/send_email_status', query: ['email_id'] },
  unsendConnectorEmail: { method: 'POST', path: '/aip/connectors/email/unsend_email', body: true },
  searchGoogleContacts: { method: 'POST', path: '/aip/connectors/google_contacts/search_contacts', body: true },

  // ---------------------------------------------------------------------------
  // ecosystem / MCP apps & widgets
  // ---------------------------------------------------------------------------
  ecosystemBootstrap: { method: 'GET', path: '/ecosystem/launcher/bootstrap' },
  ecosystemAutoInstall: { method: 'POST', path: '/ecosystem/launcher/auto_install', body: true },
  ecosystemCallMcp: { method: 'POST', path: '/ecosystem/call_mcp', body: true },
  ecosystemGetWidget: { method: 'GET', path: '/ecosystem/widget', query: ['widget_id', 'conversation_id'] },
  ecosystemLaunchWidget: { method: 'POST', path: '/ecosystem/launch_widget', body: true },
  ecosystemUrlSafe: { method: 'POST', path: '/ecosystem/url_safe', body: true },

  // ---------------------------------------------------------------------------
  // codex desktop surfaces
  // ---------------------------------------------------------------------------
  getDictationConnectInfo: { method: 'POST', path: '/codex/dictation-stream-connect-info' },
  remoteControlClient: { method: 'GET', path: '/codex/remote/control/client' },
  remoteControlEnrollStart: { method: 'POST', path: '/codex/remote/control/client/enroll/start', body: true },
  remoteControlEnrollFinish: { method: 'POST', path: '/codex/remote/control/client/enroll/finish', body: true },
  remoteControlRefreshStart: { method: 'POST', path: '/codex/remote/control/client/refresh/start', body: true },
  remoteControlRefreshFinish: { method: 'POST', path: '/codex/remote/control/client/refresh/finish', body: true },

  // ---------------------------------------------------------------------------
  // /wham/* — the Codex cloud ("work mode") surface
  // ---------------------------------------------------------------------------
  whamAccountsCheck: { method: 'GET', path: '/wham/accounts/check' },
  whamSettingsUser: { method: 'GET', path: '/wham/settings/user' },
  whamGetProfile: { method: 'GET', path: '/wham/profiles/me' },
  whamUpdateProfile: { method: 'PATCH', path: '/wham/profiles/me', body: true },
  whamUploadProfilePhoto: { method: 'POST', path: '/wham/profiles/me/photo', body: true },
  whamGetUsage: { method: 'GET', path: '/wham/usage' },
  whamQueryThreadUsage: { method: 'POST', path: '/wham/usage/thread_usage/query', body: true },
  whamFinanceEligibility: { method: 'GET', path: '/wham/finance/eligibility' },
  whamRateLimitResetCredits: { method: 'GET', path: '/wham/rate-limit-reset-credits' },
  whamConsumeRateLimitResetCredit: { method: 'POST', path: '/wham/rate-limit-reset-credits/consume', body: true },
  whamWorkspaceMessages: { method: 'GET', path: '/wham/workspace-messages' },
  whamSitesAccess: { method: 'GET', path: '/wham/sites/access' },
  whamStatsigBootstrap: { method: 'POST', path: '/wham/statsig/bootstrap', body: true },
  whamOnboardingContext: { method: 'GET', path: '/wham/onboarding/context' },
  whamDesktopOnboardingState: { method: 'GET', path: '/wham/onboarding/desktop/complete' },
  whamCompleteDesktopOnboarding: { method: 'POST', path: '/wham/onboarding/desktop/complete', body: true },

  // tasks & turns
  whamListTasks: { method: 'GET', path: '/wham/tasks/list', query: ['limit', 'cursor', 'environment_id', 'status'] },
  whamCreateTask: { method: 'POST', path: '/wham/tasks', body: true },
  whamGetTask: { method: 'GET', path: '/wham/tasks/{task_id}' },
  whamArchiveTask: { method: 'POST', path: '/wham/tasks/{task_id}/archive', body: true },
  whamCancelTask: { method: 'POST', path: '/wham/tasks/{task_id}/cancel', body: true },
  whamMarkTaskRead: { method: 'POST', path: '/wham/tasks/{task_id}/mark_read', body: true },
  whamRecoverTask: { method: 'POST', path: '/wham/tasks/{task_id}/recover', body: true },
  whamListTaskTurns: { method: 'GET', path: '/wham/tasks/{task_id}/turns' },
  whamGetTaskTurn: { method: 'GET', path: '/wham/tasks/{task_id}/turns/{task_turn_id}' },
  whamGetTaskTurnLogs: { method: 'GET', path: '/wham/tasks/{task_id}/turns/{task_turn_id}/logs' },
  whamCreatePullRequest: { method: 'POST', path: '/wham/tasks/{task_id}/turns/{task_turn_id}/pr', body: true },

  // environments, repos, snapshots
  whamListEnvironments: { method: 'GET', path: '/wham/environments' },
  whamGetEnvironmentsByRepo: {
    method: 'GET',
    path: '/wham/environments/by-repo/{provider}/{repo_owner}/{repo_name}',
  },
  whamSearchBranches: { method: 'GET', path: '/wham/github/branches/{repo_id}/search', query: ['query', 'limit'] },
  whamWorktreeSnapshotUploadUrl: { method: 'POST', path: '/wham/worktree_snapshots/upload_url', body: true },
  whamWorktreeSnapshotFinishUpload: { method: 'POST', path: '/wham/worktree_snapshots/finish_upload', body: true },

  // remote control (drive this machine's Codex from elsewhere)
  whamPairRemoteControlClient: { method: 'POST', path: '/wham/remote/control/client/pair', body: true },
  whamListRemoteControlClients: { method: 'GET', path: '/wham/remote/control/clients' },
  whamDeleteRemoteControlClient: { method: 'DELETE', path: '/wham/remote/control/clients/{client_id}' },
  whamGetRemoteControlMfaRequirement: { method: 'GET', path: '/wham/remote/control/mfa_requirement' },
  whamSetRemoteControlMfaRequirement: { method: 'POST', path: '/wham/remote/control/mfa_requirement', body: true },

  // MCP app host: a JSON-RPC envelope (tools/list, tools/call) posted to one endpoint
  whamApps: { method: 'POST', path: '/wham/apps', body: true },
  whamGoogleDriveUpload: { method: 'POST', path: '/wham/apps/google_drive/upload', body: true },
  whamAnalyticsEvents: { method: 'POST', path: '/wham/analytics-events/events', body: true },
}

/** Route names grouped for `--help` output, in catalog order. */
export const ROUTE_NAMES = Object.keys(ROUTES)

export function routePathParams(template) {
  return [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1])
}
