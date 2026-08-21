import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { existsSync } from 'node:fs'
import { delimiter } from 'node:path'
import { AsyncQueue } from './streaming/async-queue.js'
import { ProcessExitedError, ProtocolError, TimeoutError, errorMessage } from './errors.js'
import type { Logger } from './logger.js'
import { noopLogger } from './logger.js'
import type { JsonValue, UnknownRecord } from './types.js'

export const DEFAULT_CODEX_BIN = '/Applications/ChatGPT.app/Contents/Resources/codex'
export const APP_SERVER_ARGS = ['-c', 'features.code_mode_host=true', 'app-server', '--analytics-default-enabled'] as const

export const APP_SERVER_METHODS = {
  account: [
    'account/read', 'account/login/start', 'account/login/completed', 'account/login/cancel', 'account/logout',
    'account/chatgptAuthTokens', 'account/chatgptAuthTokens/refresh', 'account/rateLimits/read',
    'account/rateLimitResetCredit/consume', 'account/usage/read', 'account/workspaceMessages/read',
    'account/sendAddCreditsNudgeEmail',
  ],
  thread: [
    'thread/start', 'thread/resume', 'thread/read', 'thread/list', 'thread/loaded/list', 'thread/items/list',
    'thread/turns/list', 'thread/search', 'thread/searchOccurrences', 'thread/fork', 'thread/rollback',
    'thread/archive', 'thread/unarchive', 'thread/delete', 'thread/unsubscribe', 'thread/name/set',
    'thread/goal/set', 'thread/goal/get', 'thread/goal/clear', 'thread/metadata/update', 'thread/settings/update',
    'thread/memoryMode/set', 'thread/compact/start', 'thread/shellCommand', 'thread/approveGuardianDeniedAction',
    'thread/backgroundTerminals/list', 'thread/backgroundTerminals/clean', 'thread/backgroundTerminals/terminate',
    'thread/realtime/start', 'thread/realtime/stop', 'thread/realtime/sdp', 'thread/realtime/appendText',
    'thread/realtime/appendAudio', 'thread/realtime/appendSpeech', 'thread/realtime/listVoices',
  ],
  turn: ['turn/start', 'turn/steer', 'turn/interrupt'],
  model: ['model/list', 'model/verification'],
  config: ['config/read', 'config/value/write', 'config/batchWrite', 'config/mcpServer/reload'],
  app: ['app/list', 'app/read', 'app/installed'],
  misc: ['feedback/upload', 'fuzzyFileSearch', 'command/exec', 'command/exec/write', 'command/exec/terminate', 'command/exec/resize'],
} as const

export const APP_SERVER_NOTIFICATIONS = [
  'thread/started', 'thread/closed', 'thread/archived', 'thread/unarchived', 'thread/deleted', 'thread/compacted',
  'thread/status/changed', 'thread/tokenUsage/updated', 'thread/name/updated', 'thread/goal/updated',
  'thread/settings/updated', 'thread/environment/connected', 'thread/environment/disconnected',
  'thread/realtime/started', 'thread/realtime/closed', 'thread/realtime/error', 'thread/realtime/itemAdded',
  'thread/realtime/transcript/delta', 'thread/realtime/transcript/done', 'thread/realtime/outputAudio/delta',
  'turn/started', 'turn/completed', 'turn/failed', 'turn/plan/updated', 'turn/diff/updated',
  'turn/moderationMetadata', 'account/updated', 'account/rateLimits/updated', 'model/rerouted',
  'model/safetyBuffering/updated', 'app/list/updated', 'remoteControl/status/changed',
] as const

export interface JsonRpcRequest extends UnknownRecord {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: unknown
}

export interface JsonRpcNotification extends UnknownRecord {
  jsonrpc?: '2.0'
  method: string
  params?: unknown
}

interface JsonRpcResponse extends UnknownRecord {
  id: number | string
  result?: unknown
  error?: unknown
}

interface PendingRequest {
  method: string
  resolve(value: unknown): void
  reject(error: unknown): void
  timer: NodeJS.Timeout
  abortSignal?: AbortSignal
  abortListener?: () => void
}

export type ServerRequestHandler = (method: string, params: unknown, request: JsonRpcRequest) => unknown | Promise<unknown>

export interface AppServerOptions {
  binary?: string
  args?: readonly string[]
  env?: NodeJS.ProcessEnv
  cwd?: string
  logger?: Logger
  requestTimeoutMs?: number
  startupTimeoutMs?: number
  closeTimeoutMs?: number
  maxPendingRequests?: number
  maxLineBytes?: number
  notificationQueueSize?: number
}

export interface RequestOptions {
  timeoutMs?: number
  signal?: AbortSignal
}

export interface ClientInfo {
  name: string
  title: string
  version: string
}

export class AppServer extends EventEmitter {
  readonly binary: string
  readonly args: readonly string[]
  readonly env: NodeJS.ProcessEnv
  readonly cwd?: string

  private readonly logger: Logger
  private readonly requestTimeoutMs: number
  private readonly startupTimeoutMs: number
  private readonly closeTimeoutMs: number
  private readonly maxPendingRequests: number
  private readonly maxLineBytes: number
  private readonly notificationQueueSize: number
  private child?: ChildProcessWithoutNullStreams
  private nextId = 1
  private readonly pending = new Map<number, PendingRequest>()
  private requestHandler?: ServerRequestHandler
  private stdoutBuffer = ''
  private started = false
  private closing = false
  serverInfo: unknown

  constructor(options: AppServerOptions = {}) {
    super()
    this.binary = resolveBinary(options.binary)
    this.args = options.args ?? APP_SERVER_ARGS
    this.env = options.env ?? process.env
    if (options.cwd !== undefined) this.cwd = options.cwd
    this.logger = options.logger ?? noopLogger
    this.requestTimeoutMs = options.requestTimeoutMs ?? 120_000
    this.startupTimeoutMs = options.startupTimeoutMs ?? 30_000
    this.closeTimeoutMs = options.closeTimeoutMs ?? 5_000
    this.maxPendingRequests = options.maxPendingRequests ?? 256
    this.maxLineBytes = options.maxLineBytes ?? 8 * 1024 * 1024
    this.notificationQueueSize = options.notificationQueueSize ?? 2_048
  }

  static async start(options: AppServerOptions & { clientInfo?: ClientInfo } = {}): Promise<AppServer> {
    const server = new AppServer(options)
    await server.start(options.clientInfo)
    return server
  }

  async start(clientInfo: ClientInfo = { name: 'chatgpt-client', title: 'ChatGPT client', version: '1.0.0' }): Promise<unknown> {
    if (this.started) throw new ProtocolError('app-server is already started', { code: 'APP_SERVER_ALREADY_STARTED' })
    this.started = true
    this.child = spawn(this.binary, [...this.args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: this.env,
      ...(this.cwd === undefined ? {} : { cwd: this.cwd }),
    })
    this.attachChild(this.child)

    try {
      this.serverInfo = await this.request('initialize', { clientInfo }, { timeoutMs: this.startupTimeoutMs })
      await this.notify('initialized', {})
      return this.serverInfo
    } catch (error) {
      await this.close().catch(() => undefined)
      throw error
    }
  }

  onRequest(handler: ServerRequestHandler): this {
    this.requestHandler = handler
    return this
  }

  async request<T = unknown>(method: string, params: unknown = {}, options: RequestOptions = {}): Promise<T> {
    const child = this.requireChild()
    if (this.pending.size >= this.maxPendingRequests) {
      throw new ProtocolError(`app-server has ${this.pending.size} pending requests`, {
        code: 'APP_SERVER_PENDING_LIMIT',
        details: { maxPendingRequests: this.maxPendingRequests },
      })
    }
    options.signal?.throwIfAborted()
    const id = this.nextId++
    const timeoutMs = options.timeoutMs ?? this.requestTimeoutMs

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removePending(id)
        reject(new TimeoutError(`app-server ${method}`, timeoutMs))
      }, timeoutMs)

      const pending: PendingRequest = {
        method,
        resolve: (value) => resolve(value as T),
        reject,
        timer,
        ...(options.signal === undefined ? {} : { abortSignal: options.signal }),
      }
      if (options.signal !== undefined) {
        pending.abortListener = () => {
          this.removePending(id)
          reject(options.signal?.reason)
        }
        options.signal.addEventListener('abort', pending.abortListener, { once: true })
      }
      this.pending.set(id, pending)
      void this.write({ jsonrpc: '2.0', id, method, params }, child).catch((error) => {
        this.removePending(id)
        reject(error)
      })
    })
  }

  async notify(method: string, params: unknown = {}): Promise<void> {
    await this.write({ jsonrpc: '2.0', method, params }, this.requireChild())
  }

  async *runTurn(
    params: unknown,
    options: { startMethod?: string; signal?: AbortSignal; matches?: (message: JsonRpcNotification, startResult: unknown) => boolean } = {},
  ): AsyncGenerator<JsonRpcNotification | { method: string; result: unknown }> {
    const startMethod = options.startMethod ?? 'turn/start'
    const queue = new AsyncQueue<JsonRpcNotification>({ name: 'app-server turn notifications', maxSize: this.notificationQueueSize })
    let startResult: unknown
    const onNotification = (message: JsonRpcNotification): void => {
      const matches = options.matches?.(message, startResult) ?? notificationMatchesTurn(message, startResult)
      if (!matches) return
      queue.push(message)
      if (message.method === 'turn/completed' || message.method === 'turn/failed') queue.close()
    }
    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => queue.fail(new ProcessExitedError(this.binary, code, signal))
    const onAbort = (): void => queue.fail(options.signal?.reason)
    this.on('notification', onNotification)
    this.on('exit', onExit)
    options.signal?.addEventListener('abort', onAbort, { once: true })

    try {
      startResult = await this.request(startMethod, params, { signal: options.signal })
      yield { method: startMethod, result: startResult }
      for await (const message of queue) yield message
    } finally {
      queue.close()
      this.off('notification', onNotification)
      this.off('exit', onExit)
      options.signal?.removeEventListener('abort', onAbort)
    }
  }

  async close(): Promise<void> {
    if (this.child === undefined || this.closing) return
    this.closing = true
    const child = this.child
    this.child = undefined
    this.failPending(new ProtocolError('app-server is closing', { code: 'APP_SERVER_CLOSED' }))

    child.stdin.end()
    child.kill('SIGTERM')
    const exited = await waitForChildExit(child, this.closeTimeoutMs)
    if (!exited && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL')
      await waitForChildExit(child, this.closeTimeoutMs)
    }
    this.started = false
    this.closing = false
  }

  private attachChild(child: ChildProcessWithoutNullStreams): void {
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => this.onStdout(chunk))
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk: string) => this.emit('stderr', chunk))
    child.on('error', (error) => {
      this.failPending(error)
      if (this.listenerCount('error') > 0) this.emit('error', error)
      else this.logger.error('app-server process error', { error })
    })
    child.on('exit', (code, signal) => {
      const error = new ProcessExitedError(this.binary, code, signal)
      this.failPending(error)
      this.child = undefined
      this.started = false
      this.emit('exit', code, signal)
    })
  }

  private onStdout(chunk: string): void {
    this.stdoutBuffer += chunk
    if (Buffer.byteLength(this.stdoutBuffer, 'utf8') > this.maxLineBytes && !this.stdoutBuffer.includes('\n')) {
      const error = new ProtocolError(`app-server output line exceeded ${this.maxLineBytes} bytes`, {
        code: 'APP_SERVER_LINE_TOO_LARGE',
        details: { maxLineBytes: this.maxLineBytes },
      })
      this.failPending(error)
      void this.close()
      return
    }
    let index = this.stdoutBuffer.indexOf('\n')
    while (index !== -1) {
      const line = this.stdoutBuffer.slice(0, index).replace(/\r$/, '')
      this.stdoutBuffer = this.stdoutBuffer.slice(index + 1)
      this.onLine(line)
      index = this.stdoutBuffer.indexOf('\n')
    }
  }

  private onLine(line: string): void {
    const text = line.trim()
    if (text === '') return
    if (Buffer.byteLength(text, 'utf8') > this.maxLineBytes) {
      this.emit('stderr', `discarded oversized JSON-RPC line (${Buffer.byteLength(text, 'utf8')} bytes)\n`)
      return
    }
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      this.emit('stderr', `unparsed: ${text.slice(0, 1_024)}\n`)
      return
    }
    if (!isRecord(value)) return

    if (value.id !== undefined && typeof value.method === 'string') {
      void this.handleServerRequest(value as JsonRpcRequest)
      return
    }
    if (value.id !== undefined) {
      this.handleResponse(value as JsonRpcResponse)
      return
    }
    if (typeof value.method === 'string') {
      const notification = value as JsonRpcNotification
      this.emit('notification', notification)
      this.emit(notification.method, notification.params, notification)
    }
  }

  private handleResponse(message: JsonRpcResponse): void {
    if (typeof message.id !== 'number') return
    const pending = this.pending.get(message.id)
    if (pending === undefined) return
    this.removePending(message.id)
    if (message.error !== undefined) {
      const errorRecord = isRecord(message.error) ? message.error : {}
      pending.reject(new ProtocolError(String(errorRecord.message ?? 'app-server error'), {
        code: 'APP_SERVER_RPC_ERROR',
        details: { method: pending.method, error: toJsonSafe(message.error) },
      }))
    } else {
      pending.resolve(message.result)
    }
  }

  private async handleServerRequest(message: JsonRpcRequest): Promise<void> {
    if (this.requestHandler === undefined) {
      await this.write({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: `No handler for ${message.method}` } }, this.requireChild())
      return
    }
    try {
      const result = await this.requestHandler(message.method, message.params, message)
      await this.write({ jsonrpc: '2.0', id: message.id, result: result ?? {} }, this.requireChild())
    } catch (error) {
      await this.write({ jsonrpc: '2.0', id: message.id, error: { code: -32000, message: errorMessage(error) } }, this.requireChild())
    }
  }

  private async write(message: UnknownRecord, child: ChildProcessWithoutNullStreams): Promise<void> {
    if (child.stdin.destroyed || !child.stdin.writable) throw new ProtocolError('app-server stdin is not writable', { code: 'APP_SERVER_NOT_WRITABLE' })
    const line = `${JSON.stringify(message)}\n`
    await new Promise<void>((resolve, reject) => {
      child.stdin.write(line, (error) => error === null || error === undefined ? resolve() : reject(error))
    })
  }

  private removePending(id: number): PendingRequest | undefined {
    const pending = this.pending.get(id)
    if (pending === undefined) return undefined
    this.pending.delete(id)
    clearTimeout(pending.timer)
    if (pending.abortListener !== undefined) pending.abortSignal?.removeEventListener('abort', pending.abortListener)
    return pending
  }

  private failPending(error: unknown): void {
    for (const id of [...this.pending.keys()]) this.removePending(id)?.reject(error)
  }

  private requireChild(): ChildProcessWithoutNullStreams {
    if (this.child === undefined) throw new ProtocolError('app-server is not running', { code: 'APP_SERVER_NOT_RUNNING' })
    return this.child
  }
}

function resolveBinary(explicit?: string): string {
  const candidates = [explicit, process.env.CODEX_BIN, DEFAULT_CODEX_BIN, ...pathExecutables('codex')]
    .filter((value): value is string => typeof value === 'string' && value !== '')
  const found = candidates.find((candidate) => existsSync(candidate))
  if (found === undefined) throw new ProtocolError(`codex binary not found; set CODEX_BIN (tried: ${candidates.join(', ')})`, { code: 'CODEX_BINARY_NOT_FOUND' })
  return found
}

function pathExecutables(name: string): string[] {
  return (process.env.PATH ?? '').split(delimiter).filter(Boolean).map((directory) => `${directory}/${name}`)
}

function notificationMatchesTurn(message: JsonRpcNotification, startResult: unknown): boolean {
  const turnId = findId(startResult, ['turnId', 'turn_id', 'id'])
  if (turnId === null) return true
  const messageId = findId(message.params, ['turnId', 'turn_id', 'id'])
  return messageId === null || messageId === turnId
}

function findId(value: unknown, keys: readonly string[]): string | null {
  if (!isRecord(value)) return null
  for (const key of keys) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate !== '') return candidate
  }
  const turn = value.turn
  if (isRecord(turn)) return findId(turn, keys)
  return null
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toJsonSafe(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map(toJsonSafe)
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toJsonSafe(child)])) as Record<string, JsonValue>
  return String(value)
}


async function waitForChildExit(child: ChildProcessWithoutNullStreams, timeoutMs: number): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return true
  return new Promise<boolean>((resolve) => {
    let timer: NodeJS.Timeout | undefined
    let settled = false
    const finish = (exited: boolean): void => {
      if (settled) return
      settled = true
      if (timer !== undefined) clearTimeout(timer)
      child.removeListener('exit', onExit)
      resolve(exited)
    }
    const onExit = (): void => finish(true)
    child.once('exit', onExit)
    if (child.exitCode !== null || child.signalCode !== null) {
      finish(true)
      return
    }
    timer = setTimeout(() => finish(false), timeoutMs)
  })
}
