import { randomUUID } from 'node:crypto'
import type { Auth } from './auth.js'
import { Auth as AuthClass } from './auth.js'
import { defaultConfig, resolveApiBase } from './config.js'
import { HttpError, ProtocolError } from './errors.js'
import { Http, expandPath, type HttpOptions, type Query } from './http.js'
import { createBrowserFetch, type BrowserFetch } from './protocol/browser-fetch.js'
import type { Logger } from './logger.js'
import { noopLogger } from './logger.js'
import { createRouteApi, type RouteApi, type RouteArguments, type RouteCallOptions, type RouteResult } from './route-api.js'
import { ROUTES, routePathParams, type RouteName } from './routes.js'
import { ndjson, type NdjsonRecord } from './streaming/ndjson.js'
import { sseEvents } from './streaming/sse.js'
import type { IntegritySolver, JsonValue, Persona, UnknownRecord } from './types.js'
import {
  prepareIntegrity as defaultPrepareIntegrity,
  SENTINEL_HEADERS,
  type IntegrityResult,
  type PrepareRequirements,
} from './protocol/sentinel.js'

export { HttpError, SENTINEL_HEADERS, ROUTES, resolveApiBase }

const HEARTBEAT_MS = 60_000
const DEFAULT_MODEL_CACHE_MS = 5 * 60_000

export interface Attachment {
  file_id: string
  asset_pointer?: string
  content_type?: string
  size_bytes?: number
  width?: number
  height?: number
  name?: string
  mime_type?: string
  [key: string]: unknown
}

export interface MessageContent {
  content_type: string
  parts?: unknown[]
  [key: string]: unknown
}

export interface ConversationMessage {
  id?: string
  author?: { role?: string; name?: string | null; metadata?: UnknownRecord }
  content?: MessageContent
  metadata?: UnknownRecord
  [key: string]: unknown
}

export interface ConversationNode {
  parent?: string | null
  message?: ConversationMessage | null
  [key: string]: unknown
}

export interface Conversation {
  id?: string
  title?: string
  current_node?: string
  mapping?: Record<string, ConversationNode>
  [key: string]: unknown
}

export interface ModelInfo {
  slug?: string
  title?: string
  [key: string]: unknown
}

export interface ModelsResponse {
  models?: ModelInfo[]
  [key: string]: unknown
}

export interface ConversationListResponse {
  total?: number
  items?: Array<UnknownRecord & { id?: string; title?: string; update_time?: string }>
  [key: string]: unknown
}

/** One memory saved by ChatGPT for the current user. */
export interface UserMemory {
  id: string
  content: string
  updated_at: string
  gizmo_id: string | null
  status: string
  conversation_id: string | null
  created_timestamp: number | null
  last_updated: UnknownRecord | null
  labels: unknown[] | null
  [key: string]: unknown
}

/** The current user's saved ChatGPT memories and server-side token accounting. */
export interface UserMemoriesResponse {
  memories: UserMemory[]
  memory_max_tokens: number
  memory_num_tokens: number
  [key: string]: unknown
}

/** A suggested prompt shown alongside an About You summary section. */
export interface UserMemorySummaryFollowUp {
  preview: string
  prompt: string
  action: string
  [key: string]: unknown
}

/** One section in ChatGPT's generated About You summary. */
export interface UserMemorySummarySection {
  id: string
  title: string
  description: string
  followUps?: UserMemorySummaryFollowUp[]
  [key: string]: unknown
}

/** ChatGPT's generated About You summary for the current user. */
export interface UserMemorySummaryResponse {
  sections: UserMemorySummarySection[]
  generatedAtIso: string
  emptyStateMessage: string
  sourceChecksum: string
  [key: string]: unknown
}

export interface UserMessageOptions {
  attachments?: Attachment[]
  metadata?: UnknownRecord
}

export interface TurnRequestInput {
  messages: ConversationMessage[]
  model: string
  parentMessageId: string
  conversationId?: string
  action?: string
  gizmoId?: string
  conversationOrigin?: string
  conversationMode?: UnknownRecord
  executionTarget?: string
  systemHints?: JsonValue
  thinkingEffort?: string
  serviceTier?: string
  localFunctionSignatures?: JsonValue
  historyAndTrainingDisabled?: boolean
  hideFromHistory?: boolean
  branchingFromConversationId?: string
  branchingFromMessageId?: string
  supportedEncodings?: string[]
  extra?: UnknownRecord
}

/** Options for starting or resuming a conversation turn. Pass `signal` to cancel preparation and streaming. */
export interface StartTurnOptions extends Omit<TurnRequestInput, 'messages' | 'model' | 'parentMessageId'> {
  text?: string
  message?: ConversationMessage
  messages?: ConversationMessage[]
  model?: string
  parentMessageId?: string
  signal?: AbortSignal
  integrity?: IntegrityResult
  attachments?: Attachment[]
  metadata?: UnknownRecord
}

/** Events emitted by {@link ChatGPTClient.send}: text deltas, identifiers, raw protocol events, and terminal completion. */
export type SendEvent =
  | { type: 'delta'; text: string }
  | { type: 'meta'; conversationId: string; messageId: string | null }
  | { type: 'event'; event: string | null; data: unknown }
  | { type: 'done'; conversationId: string | null }

/** In-memory upload content and metadata, bounded by the configured upload byte limit. */
export interface UploadFileOptions {
  bytes: Uint8Array | ArrayBuffer
  fileName: string
  contentType?: string
  useCase?: string
  resetRateLimits?: boolean
  signal?: AbortSignal
}

/** Dependencies and finite runtime settings for constructing a {@link ChatGPTClient}. */
export interface ChatGPTClientOptions {
  auth: Auth
  baseUrl?: string
  solver?: IntegritySolver
  persona?: Persona
  appVersion?: string
  fetchImpl?: HttpOptions['fetchImpl']
  logger?: Logger
  config?: HttpOptions['config']
  strictRouteArgs?: boolean
  prepareFailureMode?: 'continue' | 'throw'
  /** Uses an isolated real-Chrome renderer when Cloudflare blocks a same-origin request. */
  browserFallback?: boolean
  modelCacheMs?: number
  integrityProvider?: (prepare: PrepareRequirements, options: { solver: IntegritySolver; signal?: AbortSignal }) => Promise<IntegrityResult>
}

/** Client options that may load authentication from the desktop auth store. */
export interface CreateClientOptions extends Omit<ChatGPTClientOptions, 'auth'> {
  auth?: Auth
  authPath?: string
}

/**
 * High-level client for conversations, catalogued private routes, streams, and file transfers.
 *
 * This is an unofficial protocol client. Call {@link ChatGPTClient.close} when finished to stop
 * owned timers, and use `AbortSignal` on operations that may outlive the caller.
 */
export class ChatGPTClient {
  readonly auth: Auth
  readonly http: Http
  readonly routes: RouteApi
  readonly solver: IntegritySolver

  private readonly logger: Logger
  private readonly strictRouteArgs: boolean
  private readonly prepareFailureMode: 'continue' | 'throw'
  private readonly modelCacheMs: number
  private readonly integrityProvider: NonNullable<ChatGPTClientOptions['integrityProvider']>
  private readonly browserFetch?: BrowserFetch
  private heartbeat?: NodeJS.Timeout
  private modelCache?: { value: string; expiresAt: number }

  constructor(options: ChatGPTClientOptions) {
    this.auth = options.auth
    this.logger = options.logger ?? noopLogger
    const config = defaultConfig({
      ...options.config,
      ...(options.baseUrl === undefined ? {} : { baseUrl: options.baseUrl }),
      ...(options.solver === undefined ? {} : { solver: options.solver }),
      ...(options.persona === undefined ? {} : { persona: options.persona }),
      ...(options.appVersion === undefined ? {} : { appVersion: options.appVersion }),
    })
    this.solver = config.solver
    this.browserFetch = options.browserFallback === false
      ? undefined
      : createBrowserFetch({ maxResponseBytes: config.limits.responseBodyBytes })
    this.http = new Http({
      auth: options.auth,
      baseUrl: config.baseUrl,
      persona: config.persona,
      appVersion: config.appVersion,
      ...(options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl }),
      logger: this.logger,
      browserFetch: this.browserFetch,
      config: {
        ...options.config,
        statePath: config.statePath,
        authPath: config.authPath,
        retry: config.retry,
        limits: config.limits,
      },
    })
    this.strictRouteArgs = options.strictRouteArgs ?? true
    this.prepareFailureMode = options.prepareFailureMode ?? 'continue'
    this.modelCacheMs = options.modelCacheMs ?? DEFAULT_MODEL_CACHE_MS
    this.integrityProvider = options.integrityProvider ?? defaultPrepareIntegrity
    this.routes = createRouteApi((name, args, callOptions) => this.call(name, args, callOptions))
  }

  /** Loads desktop authentication when needed and creates a configured client. */
  static async create(options: CreateClientOptions = {}): Promise<ChatGPTClient> {
    const auth = options.auth ?? (await AuthClass.load({
      ...(options.authPath === undefined ? {} : { path: options.authPath }),
      ...(options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl }),
      ...(options.logger === undefined ? {} : { logger: options.logger }),
    }))
    return new ChatGPTClient({ ...options, auth })
  }

  get baseUrl(): string {
    return this.http.baseUrl
  }

  /** Calls a catalogued private route, validating path and unused arguments before transport. */
  async call<Name extends RouteName>(
    name: Name,
    args: RouteArguments = {},
    options: RouteCallOptions = {},
  ): Promise<RouteResult<Name>> {
    const route = ROUTES[name]
    const rest: UnknownRecord = { ...args }
    const pathParams: Record<string, unknown> = {}
    for (const key of routePathParams(route.path)) {
      pathParams[key] = rest[key]
      delete rest[key]
    }

    const query: Query = {}
    if ('query' in route) {
      for (const key of route.query) {
        if (key in rest) {
          query[key] = rest[key] as Query[string]
          delete rest[key]
        }
      }
    }

    let body: unknown
    if ('body' in route && Array.isArray(route.body)) {
      const selected: UnknownRecord = {}
      for (const key of route.body) {
        if (key in rest) {
          selected[key] = rest[key]
          delete rest[key]
        }
      }
      body = selected
    } else if ('body' in route && route.body === true) {
      body = { ...rest }
      for (const key of Object.keys(rest)) delete rest[key]
    } else if (route.method !== 'GET' && route.method !== 'DELETE') {
      body = {}
    }

    const unused = Object.keys(rest)
    if (this.strictRouteArgs && unused.length > 0) {
      throw new ProtocolError(`Unused argument(s) for route ${name}: ${unused.join(', ')}`, {
        code: 'UNUSED_ROUTE_ARGUMENT',
        details: { route: name, unused },
      })
    }

    const path = expandPath(route.path, pathParams)
    const headers = { ...('headers' in route ? route.headers : {}), ...options.headers }
    const request = {
      query,
      body,
      headers,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
      ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    }

    if ('stream' in route) {
      return (await this.http.stream(route.method, path, { ...request, format: route.stream })) as RouteResult<Name>
    }
    return (await this.http.json(route.method, path, request)) as RouteResult<Name>
  }

  raw<T = unknown>(method: Parameters<Http['json']>[0], path: string, options: Parameters<Http['json']>[2] = {}): Promise<T> {
    return this.http.json<T>(method, path, options)
  }

  async prepareIntegrity(options: { solver?: IntegritySolver; signal?: AbortSignal } = {}): Promise<IntegrityResult> {
    const prepare: PrepareRequirements = async (body) => this.call('prepareChatRequirements', body, { signal: options.signal })
    return this.integrityProvider(prepare, {
      solver: options.solver ?? this.solver,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
  }

  startHeartbeat(intervalMs = HEARTBEAT_MS): this {
    if (!Number.isSafeInteger(intervalMs) || intervalMs < 1_000) throw new RangeError('Heartbeat interval must be at least 1000 ms')
    this.stopHeartbeat()
    this.heartbeat = setInterval(() => {
      void this.call('sentinelHeartbeat').catch((error: unknown) => this.logger.warn('Sentinel heartbeat failed', { error }))
    }, intervalMs)
    this.heartbeat.unref()
    return this
  }

  stopHeartbeat(): this {
    if (this.heartbeat !== undefined) clearInterval(this.heartbeat)
    this.heartbeat = undefined
    return this
  }

  /** Stops the optional heartbeat owned by this client. */
  close(): void {
    this.stopHeartbeat()
    void this.browserFetch?.close().catch(() => undefined)
  }

  userMessage(text: string, options: UserMessageOptions = {}): ConversationMessage {
    const attachments = options.attachments ?? []
    const content: MessageContent = attachments.length > 0
      ? {
          content_type: 'multimodal_text',
          parts: [
            ...attachments.map((attachment) => ({
              asset_pointer: attachment.asset_pointer ?? `file-service://${attachment.file_id}`,
              content_type: attachment.content_type ?? 'image_asset_pointer',
              ...(attachment.size_bytes === undefined ? {} : { size_bytes: attachment.size_bytes }),
              ...(attachment.width === undefined ? {} : { width: attachment.width }),
              ...(attachment.height === undefined ? {} : { height: attachment.height }),
            })),
            text,
          ],
        }
      : { content_type: 'text', parts: [text] }

    return {
      author: { metadata: {}, name: null, role: 'user' },
      channel: null,
      content,
      create_time: Date.now() / 1_000,
      end_turn: null,
      id: randomUUID(),
      metadata: {
        selected_all_github_repos: false,
        serialization_metadata: { custom_symbol_offsets: [] },
        ...(attachments.length === 0
          ? {}
          : {
              attachments: attachments.map((attachment) => ({
                id: attachment.file_id,
                name: attachment.name,
                size: attachment.size_bytes,
                mime_type: attachment.mime_type,
              })),
            }),
        ...options.metadata,
      },
      recipient: 'all',
      status: 'finished_successfully',
      update_time: null,
      weight: 1,
    }
  }

  turnRequest(input: TurnRequestInput): UnknownRecord {
    return {
      action: input.action ?? 'next',
      ...(input.conversationId === undefined ? {} : { conversation_id: input.conversationId }),
      ...(input.branchingFromConversationId === undefined ? {} : { branching_from_conversation_id: input.branchingFromConversationId }),
      ...(input.branchingFromMessageId === undefined ? {} : { branching_from_message_id: input.branchingFromMessageId }),
      ...(input.conversationOrigin === undefined ? {} : { conversation_origin: input.conversationOrigin }),
      ...(input.gizmoId === undefined
        ? {}
        : {
            gizmo_id: input.gizmoId,
            conversation_mode: input.conversationMode ?? { kind: 'gizmo_interaction', gizmo_id: input.gizmoId },
          }),
      ...(input.conversationMode === undefined || input.gizmoId !== undefined ? {} : { conversation_mode: input.conversationMode }),
      ...(input.executionTarget === undefined ? {} : { conversation_execution_target: input.executionTarget }),
      ...(input.systemHints === undefined ? {} : { system_hints: input.systemHints }),
      ...(input.thinkingEffort === undefined ? {} : { thinking_effort: input.thinkingEffort }),
      ...(input.serviceTier === undefined ? {} : { service_tier: input.serviceTier }),
      ...(input.localFunctionSignatures === undefined ? {} : { local_function_signatures: input.localFunctionSignatures }),
      ...(input.historyAndTrainingDisabled === undefined ? {} : { history_and_training_disabled: input.historyAndTrainingDisabled }),
      ...(input.hideFromHistory === undefined ? {} : { hide_from_history: input.hideFromHistory }),
      consumer_lockdown_mode_disabled: true,
      messages: input.messages,
      model: input.model,
      parent_message_id: input.parentMessageId,
      supported_encodings: input.supportedEncodings ?? ['v1'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset_min: new Date().getTimezoneOffset(),
      ...input.extra,
    }
  }

  async prepareConversationStream(body: UnknownRecord, options: { conduitToken?: string; signal?: AbortSignal } = {}): Promise<string | null> {
    try {
      const response = await this.call('prepareConversationStreamRaw', { ...body, client_prepare_state: 'sent' }, {
        headers: { 'x-conduit-token': options.conduitToken ?? 'no-token' },
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      const token = isRecord(response) ? response.conduit_token : undefined
      return typeof token === 'string' && token !== '' ? token : null
    } catch (error) {
      if (this.prepareFailureMode === 'throw') throw error
      this.logger.warn('Conversation prepare request failed; continuing with client_prepare_state=failure', { error })
      return null
    }
  }

  async startTurn(options: StartTurnOptions = {}): Promise<Response> {
    options.signal?.throwIfAborted()
    let parentMessageId = options.parentMessageId
    if (parentMessageId === undefined && options.conversationId !== undefined) {
      const conversation = await this.call('getConversation', { conversation_id: options.conversationId }, { signal: options.signal })
      const currentNode = isRecord(conversation) ? conversation.current_node : undefined
      if (typeof currentNode === 'string') parentMessageId = currentNode
    }
    parentMessageId ??= randomUUID()

    const messages = options.messages ?? [options.message ?? this.userMessage(options.text ?? '', {
      attachments: options.attachments,
      metadata: options.metadata,
    })]
    if (messages.length === 0) throw new ProtocolError('A turn must contain at least one message', { code: 'EMPTY_TURN' })
    const model = options.model ?? (await this.defaultModel({ signal: options.signal }))
    const body = this.turnRequest({ ...options, messages, model, parentMessageId })
    const integrity = options.integrity ?? (await this.prepareIntegrity({ signal: options.signal }))
    const conduitToken = await this.prepareConversationStream(body, { signal: options.signal })

    return this.call('conversationStream', { ...body, client_prepare_state: conduitToken === null ? 'failure' : 'success' }, {
      headers: {
        ...integrity.headers,
        ...(conduitToken === null ? {} : { 'x-conduit-token': conduitToken }),
      },
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
  }

  resumeTurn(body: UnknownRecord, options: { conduitToken?: string; signal?: AbortSignal } = {}): Promise<Response> {
    return this.call('resumeConversationStream', body, {
      headers: options.conduitToken === undefined ? {} : { 'x-conduit-token': options.conduitToken },
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
  }

  async *streamEvents(response: Response, options: { signal?: AbortSignal } = {}): AsyncGenerator<{ event: string | null; data: unknown }> {
    for await (const item of sseEvents(response, {
      maxLineBytes: this.http.config.limits.streamLineBytes,
      maxEventBytes: this.http.config.limits.streamEventBytes,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })) {
      if (item.data === '[DONE]') return
      try {
        yield { event: item.event, data: JSON.parse(item.data) as unknown }
      } catch {
        yield { event: item.event, data: item.data }
      }
    }
  }

  /** Starts a turn and yields bounded decoded events until completion or cancellation. */
  async *send(options: StartTurnOptions = {}): AsyncGenerator<SendEvent> {
    const response = await this.startTurn(options)
    let previousFullText = ''
    let lastPath = ''
    let conversationId = options.conversationId ?? null

    for await (const { event, data } of this.streamEvents(response, { signal: options.signal })) {
      if (!isRecord(data)) {
        yield { type: 'event', event, data }
        continue
      }

      const nested = isRecord(data.v) ? data.v : undefined
      const candidateConversationId = data.conversation_id ?? nested?.conversation_id
      if (typeof candidateConversationId === 'string' && candidateConversationId !== conversationId) {
        conversationId = candidateConversationId
        const nestedMessage = isRecord(nested?.message) ? nested.message : undefined
        const messageId = typeof data.message_id === 'string'
          ? data.message_id
          : typeof nestedMessage?.id === 'string'
            ? nestedMessage.id
            : null
        yield { type: 'meta', conversationId, messageId }
      }

      const messageValue = isRecord(data.message) ? data.message : isRecord(nested?.message) ? nested.message : undefined
      if (messageValue !== undefined && isRecord(messageValue.author) && messageValue.author.role === 'assistant' && isRecord(messageValue.content)) {
        const parts = messageValue.content.parts
        if (messageValue.content.content_type === 'text' && Array.isArray(parts)) {
          const full = parts.filter((part): part is string => typeof part === 'string').join('')
          if (full.startsWith(previousFullText)) {
            const delta = full.slice(previousFullText.length)
            previousFullText = full
            if (delta !== '') yield { type: 'delta', text: delta }
          } else {
            previousFullText = full
          }
          continue
        }
      }

      if (typeof data.p === 'string') lastPath = data.p
      const path = typeof data.p === 'string' ? data.p : lastPath
      if (typeof data.v === 'string') {
        if (isTextPatch(path)) yield { type: 'delta', text: data.v }
      } else if (Array.isArray(data.v)) {
        for (const patch of data.v) {
          if (!isRecord(patch) || typeof patch.v !== 'string') continue
          const patchPath = typeof patch.p === 'string' ? patch.p : path
          if (isTextPatch(patchPath)) yield { type: 'delta', text: patch.v }
        }
      } else {
        yield { type: 'event', event, data }
      }
    }
    yield { type: 'done', conversationId }
  }

  /** Uploads bytes and finalizes an attachment without forwarding account headers to signed URLs. */
  async uploadFile(options: UploadFileOptions): Promise<Attachment> {
    const bytes = options.bytes instanceof Uint8Array ? options.bytes : new Uint8Array(options.bytes)
    if (bytes.byteLength > this.http.config.limits.uploadBytes) {
      throw new ProtocolError(`Upload exceeds ${this.http.config.limits.uploadBytes} bytes`, {
        code: 'UPLOAD_TOO_LARGE',
        details: { bytes: bytes.byteLength, maxBytes: this.http.config.limits.uploadBytes },
      })
    }
    if (options.fileName.trim() === '') throw new ProtocolError('fileName cannot be empty', { code: 'INVALID_FILE_NAME' })

    const created = await this.call('createFile', {
      file_name: options.fileName,
      file_size: bytes.byteLength,
      use_case: options.useCase ?? 'codex',
      timezone_offset_min: new Date().getTimezoneOffset(),
      reset_rate_limits: options.resetRateLimits ?? false,
    }, { signal: options.signal })
    if (!isRecord(created) || typeof created.file_id !== 'string' || typeof created.upload_url !== 'string') {
      throw new ProtocolError('File creation response omitted file_id or upload_url', { code: 'INVALID_FILE_CREATE_RESPONSE' })
    }

    await this.uploadFileBytes({
      uploadUrl: created.upload_url,
      bytes,
      contentType: options.contentType ?? 'application/octet-stream',
      fileName: options.fileName,
      signal: options.signal,
    })
    const finalized = await this.call('finalizeFileUpload', { file_id: created.file_id }, { signal: options.signal })
    return { file_id: created.file_id, ...(isRecord(finalized) ? finalized : {}) }
  }

  async uploadFileBytes(options: {
    uploadUrl: string
    bytes: Uint8Array
    contentType: string
    fileName?: string
    signal?: AbortSignal
  }): Promise<void> {
    const url = new URL(options.uploadUrl, 'https://chatgpt.com')
    if (url.pathname.endsWith('/estuary/upload_content_bytes')) {
      const form = new FormData()
      form.append('file', new Blob([options.bytes], { type: options.contentType }), options.fileName ?? 'upload.bin')
      const response = await this.http.request('POST', options.uploadUrl, {
        body: form,
        rawBody: true,
        retry: false,
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      })
      if (!response.ok) {
        const text = await this.http.readText(response, { operation: 'file upload error body', ...(options.signal === undefined ? {} : { signal: options.signal }) })
        throw new HttpError({ method: 'POST', url: options.uploadUrl, status: response.status, bodyPreview: text.slice(0, 1_200) })
      }
      return
    }

    let target = options.uploadUrl
    if (url.pathname.endsWith('/estuary/upload_content_and_finalize')) {
      const inner = url.searchParams.get('upload_url')
      if (inner === null) throw new ProtocolError('Estuary upload URL is missing upload_url', { code: 'INVALID_UPLOAD_URL' })
      target = inner
    } else if (url.pathname.includes('/estuary/')) {
      throw new ProtocolError(`Unsupported Estuary upload URL: ${url.pathname}`, { code: 'UNSUPPORTED_UPLOAD_URL' })
    }

    const response = await this.http.request('PUT', target, {
      body: options.bytes,
      rawBody: true,
      sendAuth: false,
      headers: {
        'Content-Type': options.contentType,
        'x-ms-blob-type': 'BlockBlob',
        'x-ms-version': '2020-04-08',
        'x-ms-blob-content-type': options.contentType,
      },
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    if (!response.ok) {
      const text = await this.http.readText(response, { operation: 'file upload error body', ...(options.signal === undefined ? {} : { signal: options.signal }) })
      throw new HttpError({ method: 'PUT', url: target, status: response.status, bodyPreview: text.slice(0, 1_200) })
    }
  }

  async *processUpload(body: UnknownRecord, options: { signal?: AbortSignal } = {}): AsyncGenerator<NdjsonRecord> {
    const response = await this.call('processFileUploadStream', body, { signal: options.signal })
    for await (const record of ndjson(response, {
      maxLineBytes: this.http.config.limits.streamLineBytes,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })) yield record
  }

  /** Downloads a file into memory up to the configured download byte limit. */
  async downloadFile(fileId: string, options: { signal?: AbortSignal } = {}): Promise<{ info: UnknownRecord; bytes: Uint8Array }> {
    const infoValue = await this.call('getFileDownloadUrl', { file_id: fileId }, { signal: options.signal })
    if (!isRecord(infoValue)) throw new ProtocolError(`Invalid download metadata for ${fileId}`, { code: 'INVALID_DOWNLOAD_RESPONSE' })
    const url = typeof infoValue.download_url === 'string' ? infoValue.download_url : typeof infoValue.url === 'string' ? infoValue.url : null
    if (url === null) throw new ProtocolError(`No download URL for ${fileId}`, { code: 'DOWNLOAD_URL_MISSING' })
    const response = await this.http.request('GET', url, {
      sendAuth: false,
      retry: true,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    if (!response.ok) {
      const text = await this.http.readText(response, { operation: 'file download error body', ...(options.signal === undefined ? {} : { signal: options.signal }) })
      throw new HttpError({ method: 'GET', url, status: response.status, bodyPreview: text.slice(0, 1_200) })
    }
    const bytes = await this.http.readBytes(response, {
      maxBytes: this.http.config.limits.downloadBytes,
      operation: `download ${fileId}`,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    return { info: infoValue, bytes }
  }

  async defaultModel(options: { signal?: AbortSignal; refresh?: boolean } = {}): Promise<string> {
    if (options.refresh !== true && this.modelCache !== undefined && this.modelCache.expiresAt > Date.now()) return this.modelCache.value
    const response = await this.call('getModels', { history_and_training_disabled: false }, { signal: options.signal })
    const models = isRecord(response) && Array.isArray(response.models) ? response.models : []
    const entries = models.filter(isRecord)
    const preferred = entries.find((model) => typeof model.slug === 'string' && model.slug.startsWith('gpt-5'))
    const fallback = entries.find((model) => typeof model.slug === 'string')
    const value = typeof preferred?.slug === 'string' ? preferred.slug : typeof fallback?.slug === 'string' ? fallback.slug : 'gpt-5'
    this.modelCache = { value, expiresAt: Date.now() + this.modelCacheMs }
    return value
  }

  /** Gets memory entries and token accounting for the current user. */
  async getUserMemories(options: { signal?: AbortSignal } = {}): Promise<UserMemoriesResponse> {
    const response = await this.call('getUserMemories', { include_memory_entries: true }, { signal: options.signal })
    if (
      !isRecord(response) ||
      !Array.isArray(response.memories) ||
      typeof response.memory_max_tokens !== 'number' ||
      typeof response.memory_num_tokens !== 'number'
    ) {
      throw new ProtocolError('User memories response is invalid', { code: 'INVALID_MEMORIES_RESPONSE' })
    }
    const memories = response.memories.map((memory, index): UserMemory => parseUserMemory(memory, index))
    return {
      ...response,
      memories,
      memory_max_tokens: response.memory_max_tokens,
      memory_num_tokens: response.memory_num_tokens,
    }
  }

  /** Generates ChatGPT's sectioned About You summary for the current user. */
  async getUserMemorySummary(options: { signal?: AbortSignal } = {}): Promise<UserMemorySummaryResponse> {
    const response = await this.call('getUserMemorySummary', {}, { signal: options.signal })
    if (
      !isRecord(response) ||
      !Array.isArray(response.sections) ||
      typeof response.generatedAtIso !== 'string' ||
      typeof response.emptyStateMessage !== 'string' ||
      typeof response.sourceChecksum !== 'string'
    ) {
      throw new ProtocolError('User memory summary response is invalid', { code: 'INVALID_MEMORY_SUMMARY_RESPONSE' })
    }
    const sections = response.sections.map((section, index): UserMemorySummarySection => parseMemorySummarySection(section, index))
    return {
      ...response,
      sections,
      generatedAtIso: response.generatedAtIso,
      emptyStateMessage: response.emptyStateMessage,
      sourceChecksum: response.sourceChecksum,
    }
  }

  setConversationArchived(conversationId: string, isArchived = true): Promise<unknown> {
    return this.call('patchConversation', { conversation_id: conversationId, is_archived: isArchived })
  }

  setConversationStarred(conversationId: string, isStarred = true): Promise<unknown> {
    return this.call('patchConversation', { conversation_id: conversationId, is_starred: isStarred })
  }

  setConversationVisible(conversationId: string, visible: boolean): Promise<unknown> {
    return this.call('patchConversation', { conversation_id: conversationId, is_visible: visible })
  }

  setPinnedItem(itemType: string, itemId: string, pinned = true): Promise<unknown> {
    return pinned
      ? this.call('addPin', { item_type: itemType, item_id: itemId })
      : this.call('removePin', { item_type: itemType, item_id: itemId })
  }

  setAccountVoice(voice: string): Promise<unknown> {
    return this.call('patchAccountUserSetting', { feature: 'voice_name', value: voice })
  }

  setUltraEffortEnabled(enabled: boolean): Promise<unknown> {
    return this.call('patchAccountUserSetting', { feature: 'model_picker_persists_ultra_effort', value: enabled })
  }

  optOutOfTrustedContactPrompts(): Promise<unknown> {
    return this.call('patchAccountUserSetting', { feature: 'trusted_contacts_opted_out_at', value: true })
  }

  share(conversationId: string, options: UnknownRecord & { v2?: boolean } = {}): Promise<unknown> {
    const { v2 = true, ...rest } = options
    const body = { conversation_id: conversationId, is_anonymous: true, ...rest }
    return v2 ? this.call('createShareLinkV2', body) : this.call('createShareLink', body)
  }

  listAppTools(params: UnknownRecord = {}): Promise<unknown> {
    return this.call('whamApps', { id: 1, jsonrpc: '2.0', method: 'tools/list', params })
  }

  callAppTool(name: string, args: UnknownRecord = {}, options: { id?: number | string } = {}): Promise<unknown> {
    return this.call('whamApps', {
      id: options.id ?? 1,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name, arguments: args },
    })
  }

  callConnectorMcp(body: UnknownRecord): Promise<unknown> {
    return this.call('ecosystemCallMcp', body)
  }

  /** Returns the active message chain and rejects cyclic conversation mappings. */
  static messageChain(conversation: Conversation, options: { from?: string } = {}): ConversationMessage[] {
    const chain: ConversationMessage[] = []
    const mapping = conversation.mapping ?? {}
    const seen = new Set<string>()
    let node = options.from ?? conversation.current_node
    while (node !== undefined && node !== null && node !== '') {
      if (seen.has(node)) throw new ProtocolError(`Conversation mapping contains a cycle at ${node}`, { code: 'CONVERSATION_CYCLE' })
      seen.add(node)
      const current = mapping[node]
      if (current === undefined) break
      if (current.message !== undefined && current.message !== null) chain.unshift(current.message)
      node = current.parent ?? undefined
    }
    return chain
  }

  static renderParts(parts: unknown[] | undefined): string {
    return (parts ?? []).map((part) => {
      if (typeof part === 'string') return part
      if (!isRecord(part)) return '<asset>'
      const contentType = typeof part.content_type === 'string' ? part.content_type : 'asset'
      const pointer = typeof part.asset_pointer === 'string' ? part.asset_pointer : ''
      return `<${contentType}: ${pointer}>`
    }).join('')
  }

  /** Paginates conversation summaries lazily with a page size from 1 through 100. */
  async *iterateConversations(options: { pageSize?: number; signal?: AbortSignal } & UnknownRecord = {}): AsyncGenerator<UnknownRecord> {
    const { pageSize = 50, signal, ...filters } = options
    if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new RangeError('pageSize must be an integer between 1 and 100')
    for (let offset = 0; ; offset += pageSize) {
      signal?.throwIfAborted()
      const response = await this.call('listConversations', { limit: pageSize, offset, order: 'updated', ...filters }, { signal })
      const items = isRecord(response) && Array.isArray(response.items) ? response.items.filter(isRecord) : []
      for (const item of items) yield item
      if (items.length < pageSize) return
    }
  }
}

function parseUserMemory(value: unknown, index: number): UserMemory {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.updated_at !== 'string' ||
    !(typeof value.gizmo_id === 'string' || value.gizmo_id === null) ||
    typeof value.status !== 'string' ||
    !(typeof value.conversation_id === 'string' || value.conversation_id === null) ||
    !(typeof value.created_timestamp === 'number' || value.created_timestamp === null) ||
    !(isRecord(value.last_updated) || value.last_updated === null) ||
    !(Array.isArray(value.labels) || value.labels === null)
  ) {
    throw new ProtocolError(`User memory at index ${index} is invalid`, { code: 'INVALID_MEMORY', details: { index } })
  }
  return {
    ...value,
    id: value.id,
    content: value.content,
    updated_at: value.updated_at,
    gizmo_id: value.gizmo_id,
    status: value.status,
    conversation_id: value.conversation_id,
    created_timestamp: value.created_timestamp,
    last_updated: value.last_updated,
    labels: value.labels,
  }
}

function parseMemorySummarySection(value: unknown, index: number): UserMemorySummarySection {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.description !== 'string') {
    throw new ProtocolError(`User memory summary section at index ${index} is invalid`, {
      code: 'INVALID_MEMORY_SUMMARY_SECTION',
      details: { index },
    })
  }
  if (value.followUps !== undefined && !Array.isArray(value.followUps)) {
    throw new ProtocolError(`User memory summary follow-ups at section ${index} are invalid`, {
      code: 'INVALID_MEMORY_SUMMARY_FOLLOW_UPS',
      details: { index },
    })
  }
  const followUps = value.followUps?.map((followUp, followUpIndex): UserMemorySummaryFollowUp => {
    if (
      !isRecord(followUp) ||
      typeof followUp.preview !== 'string' ||
      typeof followUp.prompt !== 'string' ||
      typeof followUp.action !== 'string'
    ) {
      throw new ProtocolError(`User memory summary follow-up ${followUpIndex} at section ${index} is invalid`, {
        code: 'INVALID_MEMORY_SUMMARY_FOLLOW_UP',
        details: { index, followUpIndex },
      })
    }
    return { ...followUp, preview: followUp.preview, prompt: followUp.prompt, action: followUp.action }
  })
  return {
    ...value,
    id: value.id,
    title: value.title,
    description: value.description,
    ...(followUps === undefined ? {} : { followUps }),
  }
}

function isTextPatch(path: string): boolean {
  return path === '' || /\/parts\/\d+$/.test(path)
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
