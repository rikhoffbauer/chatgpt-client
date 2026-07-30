// @ts-nocheck
// The client itself: every route in routes.js becomes a method, plus the composite flows
// the app builds by hand (chat turns, file uploads, share links, message trees).

import { randomUUID } from 'node:crypto'
import { Auth } from './auth.js'
import { Http, HttpError, expandPath, sseEvents, ndjson, resolveApiBase } from './http.js'
import { prepareIntegrity, SENTINEL_HEADERS } from './sentinel.js'
import { ROUTES, routePathParams } from './routes.js'

export { HttpError, SENTINEL_HEADERS }

const HEARTBEAT_MS = 60_000 // app-initial-*.js : NSSu

export class ChatGPTClient {
  /**
   * @param {object} opts
   * @param {import('./auth.js').Auth} opts.auth
   * @param {string} [opts.baseUrl]
   * @param {'node'|'chrome'} [opts.solver] how to answer a turnstile challenge
   * @param {'browser'|'desktop'} [opts.persona]
   */
  constructor({ auth, baseUrl, solver = 'node', persona = 'browser' } = {}) {
    this.auth = auth
    this.solver = solver
    this.http = new Http({ auth, baseUrl, persona })
    this._heartbeat = null
  }

  static async create(opts = {}) {
    const auth = opts.auth ?? (await Auth.load())
    return new ChatGPTClient({ ...opts, auth })
  }

  get baseUrl() {
    return this.http.baseUrl
  }

  // -------------------------------------------------------------------------
  // generic route invocation (also what the generated methods below go through)
  // -------------------------------------------------------------------------

  /** Call any route by catalog name: `client.call('getConversation', {conversation_id})`. */
  async call(name, args = {}, opts = {}) {
    const route = ROUTES[name]
    if (!route) throw new Error(`Unknown route: ${name}`)

    const rest = { ...args }
    const pathParams = {}
    for (const key of routePathParams(route.path)) {
      pathParams[key] = rest[key]
      delete rest[key]
    }
    const query = {}
    for (const key of route.query ?? []) {
      if (key in rest) {
        query[key] = rest[key]
        delete rest[key]
      }
    }

    let body
    if (Array.isArray(route.body)) {
      body = {}
      for (const key of route.body) {
        if (key in rest) {
          body[key] = rest[key]
          delete rest[key]
        }
      }
    } else if (route.body === true) {
      body = rest
    } else if (route.method !== 'GET' && route.method !== 'DELETE') {
      body = {} // POST/PATCH with no declared body still sends `{}`, as the renderer does
    }

    const path = expandPath(route.path, pathParams)
    const headers = { ...route.headers, ...opts.headers }
    const request = { query, body, headers, signal: opts.signal }

    if (route.stream) return this.http.stream(route.method, path, { ...request, format: route.stream })
    return this.http.json(route.method, path, request)
  }

  /** Escape hatch for a route not in the catalog. */
  raw(method, path, opts = {}) {
    return this.http.json(method, path, opts)
  }

  // -------------------------------------------------------------------------
  // integrity
  // -------------------------------------------------------------------------

  /** Run the sentinel handshake and return the headers a turn needs. */
  prepareIntegrity({ solver = this.solver } = {}) {
    return prepareIntegrity((body) => this.prepareChatRequirements(body), { solver })
  }

  /** The app pings /sentinel/heartbeat every 60 s while a window is focused. */
  startHeartbeat(intervalMs = HEARTBEAT_MS) {
    this.stopHeartbeat()
    this._heartbeat = setInterval(() => {
      this.sentinelHeartbeat().catch(() => {})
    }, intervalMs)
    this._heartbeat.unref?.()
    return this
  }

  stopHeartbeat() {
    if (this._heartbeat) clearInterval(this._heartbeat)
    this._heartbeat = null
    return this
  }

  // -------------------------------------------------------------------------
  // chat turns
  // -------------------------------------------------------------------------

  /** Hka(): a user message node. `attachments` are asset pointers from uploadFile(). */
  userMessage(text, { attachments = [], metadata = {} } = {}) {
    const content = attachments.length
      ? {
          content_type: 'multimodal_text',
          parts: [
            ...attachments.map((a) => ({
              asset_pointer: a.asset_pointer ?? `file-service://${a.file_id}`,
              content_type: a.content_type ?? 'image_asset_pointer',
              size_bytes: a.size_bytes,
              width: a.width,
              height: a.height,
            })),
            text,
          ],
        }
      : { content_type: 'text', parts: [text] }

    return {
      author: { metadata: {}, name: null, role: 'user' },
      channel: null,
      content,
      create_time: Date.now() / 1000,
      end_turn: null,
      id: randomUUID(),
      metadata: {
        selected_all_github_repos: false,
        serialization_metadata: { custom_symbol_offsets: [] },
        ...(attachments.length ? { attachments: attachments.map((a) => ({ id: a.file_id, name: a.name, size: a.size_bytes, mime_type: a.mime_type })) } : {}),
        ...metadata,
      },
      recipient: 'all',
      status: 'finished_successfully',
      update_time: null,
      weight: 1,
    }
  }

  /** zka(): the /f/conversation request body. */
  turnRequest({
    messages,
    model,
    parentMessageId,
    conversationId,
    action = 'next',
    gizmoId,
    conversationOrigin,
    conversationMode,
    executionTarget,
    systemHints,
    thinkingEffort,
    serviceTier,
    localFunctionSignatures,
    historyAndTrainingDisabled,
    hideFromHistory,
    branchingFromConversationId,
    branchingFromMessageId,
    supportedEncodings = ['v1'],
    extra = {},
  }) {
    return {
      action,
      ...(conversationId ? { conversation_id: conversationId } : {}),
      ...(branchingFromConversationId ? { branching_from_conversation_id: branchingFromConversationId } : {}),
      ...(branchingFromMessageId ? { branching_from_message_id: branchingFromMessageId } : {}),
      ...(conversationOrigin ? { conversation_origin: conversationOrigin } : {}),
      ...(gizmoId ? { gizmo_id: gizmoId, conversation_mode: conversationMode ?? { kind: 'gizmo_interaction', gizmo_id: gizmoId } } : {}),
      ...(conversationMode && !gizmoId ? { conversation_mode: conversationMode } : {}),
      ...(executionTarget ? { conversation_execution_target: executionTarget } : {}),
      ...(systemHints ? { system_hints: systemHints } : {}),
      ...(thinkingEffort ? { thinking_effort: thinkingEffort } : {}),
      ...(serviceTier ? { service_tier: serviceTier } : {}),
      ...(localFunctionSignatures ? { local_function_signatures: localFunctionSignatures } : {}),
      ...(historyAndTrainingDisabled != null ? { history_and_training_disabled: historyAndTrainingDisabled } : {}),
      ...(hideFromHistory != null ? { hide_from_history: hideFromHistory } : {}),
      consumer_lockdown_mode_disabled: true,
      messages,
      model,
      parent_message_id: parentMessageId,
      supported_encodings: supportedEncodings,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset_min: new Date().getTimezoneOffset(),
      ...extra,
    }
  }

  /** dka(): the warm-up call. Non-fatal by design — failure only flips client_prepare_state. */
  async prepareConversationStream(body, { conduitToken = 'no-token' } = {}) {
    try {
      const res = await this.prepareConversationStreamRaw(
        { ...body, client_prepare_state: 'sent' },
        { headers: { 'x-conduit-token': conduitToken } },
      )
      return res?.conduit_token ?? null
    } catch (err) {
      if (process.env.POC_DEBUG) console.error('prepare failed (non-fatal):', err.message)
      return null
    }
  }

  /**
   * Full turn: sentinel -> prepare -> stream. Returns the raw SSE Response.
   * Everything the app can set on a turn is forwarded through `turnRequest`.
   */
  async startTurn({ text, message, messages, conversationId, model, parentMessageId, signal, integrity, ...rest } = {}) {
    let parent = parentMessageId
    if (!parent && conversationId) {
      const convo = await this.getConversation({ conversation_id: conversationId })
      parent = convo?.current_node
    }
    parent ??= randomUUID()

    const msgs = messages ?? [message ?? this.userMessage(text, rest)]
    const chosenModel = model ?? (await this.defaultModel())
    const body = this.turnRequest({ ...rest, messages: msgs, model: chosenModel, parentMessageId: parent, conversationId })

    const sentinel = integrity ?? (await this.prepareIntegrity())
    const conduitToken = await this.prepareConversationStream(body)

    const res = await this.conversationStream(
      { ...body, client_prepare_state: conduitToken ? 'success' : 'failure' },
      {
        headers: {
          ...sentinel.headers,
          ...(conduitToken ? { 'x-conduit-token': conduitToken } : {}),
        },
        signal,
      },
    )
    return res
  }

  /** Reconnect to an in-flight turn (POST /f/conversation/resume). */
  resumeTurn(body, { conduitToken, signal } = {}) {
    return this.resumeConversationStream(body, {
      headers: conduitToken ? { 'x-conduit-token': conduitToken } : {},
      signal,
    })
  }

  /** Decoded turn events: `{event, data}` with `data` parsed when it is JSON. */
  async *streamEvents(res) {
    for await (const { event, data } of sseEvents(res)) {
      if (data === '[DONE]') return
      let parsed
      try {
        parsed = JSON.parse(data)
      } catch {
        parsed = data
      }
      yield { event, data: parsed }
    }
  }

  /**
   * Highest-level send: yields `{type}` records.
   *   {type:'delta', text}      assistant text as it arrives
   *   {type:'meta', conversationId, messageId}
   *   {type:'event', event, data} everything else, for callers that want it
   * Handles both the classic full-message encoding and the compact v1 patch encoding.
   */
  async *send(opts) {
    const res = await this.startTurn(opts)
    let printed = ''
    let lastPath = ''
    let conversationId = opts.conversationId ?? null

    const emitPatch = function* (path, value) {
      if (typeof value !== 'string') return
      if (path === '' || /\/parts\/\d+$/.test(path)) yield { type: 'delta', text: value }
    }

    for await (const { event, data: obj } of this.streamEvents(res)) {
      if (typeof obj !== 'object' || obj === null) {
        yield { type: 'event', event, data: obj }
        continue
      }
      const cid = obj.conversation_id ?? obj.v?.conversation_id
      if (cid && cid !== conversationId) {
        conversationId = cid
        yield { type: 'meta', conversationId, messageId: obj.message_id ?? obj.v?.message?.id ?? null }
      }

      // classic encoding: a whole message object per tick
      const msg = obj.message ?? obj.v?.message
      if (msg?.author?.role === 'assistant' && msg.content?.content_type === 'text') {
        const full = (msg.content.parts ?? []).join('')
        if (full.startsWith(printed)) {
          const delta = full.slice(printed.length)
          printed = full
          if (delta) yield { type: 'delta', text: delta }
        }
        continue
      }

      // v1 delta encoding: {p, o, v}, an omitted `p` repeating the previous path
      if (typeof obj.p === 'string') lastPath = obj.p
      const path = typeof obj.p === 'string' ? obj.p : lastPath
      if (typeof obj.v === 'string') {
        yield* emitPatch(path, obj.v)
      } else if (Array.isArray(obj.v)) {
        for (const patch of obj.v) yield* emitPatch(patch?.p ?? path, patch?.v)
      } else {
        yield { type: 'event', event, data: obj }
      }
    }
    yield { type: 'done', conversationId }
  }

  // -------------------------------------------------------------------------
  // files
  // -------------------------------------------------------------------------

  /**
   * The app's three-step upload (app-initial-*.js: Vbs / uploadFileBytes / finalizeFileUpload):
   *   1. POST /files                      -> {file_id, upload_url}
   *   2. PUT the bytes to upload_url      (Azure blob, or one of two Estuary variants)
   *   3. POST /files/{file_id}/uploaded   -> the asset the message can reference
   */
  async uploadFile({ bytes, fileName, contentType = 'application/octet-stream', useCase = 'codex', resetRateLimits = false }) {
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
    const created = await this.createFile({
      file_name: fileName,
      file_size: data.byteLength,
      use_case: useCase,
      timezone_offset_min: new Date().getTimezoneOffset(),
      reset_rate_limits: resetRateLimits,
    })
    await this.uploadFileBytes({ uploadUrl: created.upload_url, bytes: data, contentType, fileName })
    const finalized = await this.finalizeFileUpload({ file_id: created.file_id })
    return { file_id: created.file_id, ...finalized }
  }

  /** Step 2 on its own — the URL shape decides which of the three transports is used. */
  async uploadFileBytes({ uploadUrl, bytes, contentType, fileName = 'upload.bin' }) {
    const url = new URL(uploadUrl, 'https://chatgpt.com')

    // Estuary multipart variant
    if (url.pathname.endsWith('/estuary/upload_content_bytes')) {
      const boundary = `----codex-estuary-${randomUUID()}`
      const head = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
          `Content-Type: ${contentType}\r\n\r\n`,
        'utf8',
      )
      const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
      const res = await this.http.request('POST', uploadUrl, {
        body: Buffer.concat([head, Buffer.from(bytes), tail]),
        raw: true,
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      })
      if (!res.ok) throw new HttpError('POST', uploadUrl, res.status, await res.text())
      return
    }

    // _ya(): the finalize variant carries the real destination in ?upload_url=
    let target = uploadUrl
    if (url.pathname.endsWith('/estuary/upload_content_and_finalize')) {
      const inner = url.searchParams.get('upload_url')
      if (inner == null) throw new Error('ChatGPT Estuary upload URL is missing upload_url')
      target = inner
    } else if (url.pathname.includes('/estuary/')) {
      throw new Error(`Unsupported ChatGPT Estuary upload URL: ${url.pathname}`)
    }

    // Azure blob PUT. The app base64s the body because it crosses the IPC bridge and sets
    // x-codex-base64; in-process we can send the bytes directly.
    const res = await this.http.request('PUT', target, {
      body: Buffer.from(bytes),
      raw: true,
      headers: {
        'Content-Type': contentType,
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-version': '2020-04-08',
        ...(contentType ? { 'x-ms-blob-content-type': contentType } : {}),
        // the blob endpoint rejects our auth headers
        Authorization: undefined,
        'ChatGPT-Account-Id': undefined,
        Origin: undefined,
        Referer: undefined,
      },
    })
    if (!res.ok) throw new HttpError('PUT', target, res.status, await res.text())
  }

  /** NDJSON progress stream used when a file has to be processed after upload. */
  async *processUpload(body) {
    const res = await this.processFileUploadStream(body)
    for await (const record of ndjson(res)) yield record
  }

  /** Fetch an uploaded/generated file's bytes. */
  async downloadFile(fileId) {
    const info = await this.getFileDownloadUrl({ file_id: fileId })
    const url = info?.download_url ?? info?.url
    if (!url) throw new Error(`No download url for ${fileId}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`)
    return { info, bytes: new Uint8Array(await res.arrayBuffer()) }
  }

  // -------------------------------------------------------------------------
  // conveniences over the raw routes
  // -------------------------------------------------------------------------

  async defaultModel() {
    const models = await this.getModels({ history_and_training_disabled: false })
    const list = models?.models ?? []
    return list.find((m) => m.slug?.startsWith('gpt-5'))?.slug ?? list[0]?.slug ?? 'gpt-5'
  }

  setConversationArchived(conversationId, isArchived = true) {
    return this.patchConversation({ conversation_id: conversationId, is_archived: isArchived })
  }

  setConversationStarred(conversationId, isStarred = true) {
    return this.patchConversation({ conversation_id: conversationId, is_starred: isStarred })
  }

  setConversationVisible(conversationId, visible) {
    return this.patchConversation({ conversation_id: conversationId, is_visible: visible })
  }

  setPinnedItem(itemType, itemId, pinned = true) {
    return pinned ? this.addPin({ item_type: itemType, item_id: itemId }) : this.removePin({ item_type: itemType, item_id: itemId })
  }

  setAccountVoice(voice) {
    return this.patchAccountUserSetting({ feature: 'voice_name', value: voice })
  }

  setUltraEffortEnabled(enabled) {
    return this.patchAccountUserSetting({ feature: 'model_picker_persists_ultra_effort', value: enabled })
  }

  optOutOfTrustedContactPrompts() {
    return this.patchAccountUserSetting({ feature: 'trusted_contacts_opted_out_at', value: true })
  }

  share(conversationId, { v2 = true, ...rest } = {}) {
    const body = { conversation_id: conversationId, is_anonymous: true, ...rest }
    return v2 ? this.createShareLinkV2(body) : this.createShareLink(body)
  }

  /**
   * `/wham/apps` is an MCP host behind one endpoint: the body is a JSON-RPC envelope
   * rather than a plain payload, so both calls are wrapped here.
   */
  async listAppTools(params = {}) {
    return this.whamApps({ id: 1, jsonrpc: '2.0', method: 'tools/list', params })
  }

  async callAppTool(name, args = {}, { id = 1 } = {}) {
    return this.whamApps({ id, jsonrpc: '2.0', method: 'tools/call', params: { name, arguments: args } })
  }

  /** The other MCP host — connectors reachable from a normal (non-work) chat. */
  async callConnectorMcp(body) {
    return this.ecosystemCallMcp(body)
  }

  /** Walk a conversation's message tree from current_node back to the root. */
  static messageChain(conversation, { from } = {}) {
    const chain = []
    const mapping = conversation?.mapping ?? {}
    for (let node = from ?? conversation?.current_node; node; node = mapping[node]?.parent) {
      const msg = mapping[node]?.message
      if (msg) chain.unshift(msg)
    }
    return chain
  }

  static renderParts(parts) {
    return (parts ?? [])
      .map((p) => (typeof p === 'string' ? p : `<${p.content_type ?? 'asset'}: ${p.asset_pointer ?? ''}>`))
      .join('')
  }

  /** Every conversation, paging until the server stops returning items. */
  async *iterateConversations({ pageSize = 50, ...filters } = {}) {
    for (let offset = 0; ; offset += pageSize) {
      const page = await this.listConversations({ limit: pageSize, offset, order: 'updated', ...filters })
      const items = page?.items ?? []
      for (const item of items) yield item
      if (items.length < pageSize) return
    }
  }
}

// Attach one method per catalogued route.
for (const name of Object.keys(ROUTES)) {
  if (name in ChatGPTClient.prototype) throw new Error(`Route name collides with a client method: ${name}`)
  ChatGPTClient.prototype[name] = function (args, opts) {
    return this.call(name, args, opts)
  }
}

export { resolveApiBase, ROUTES }
