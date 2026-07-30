// @ts-nocheck
// Bridge to the Rust `codex app-server` — the half of the app that the HTTP client cannot
// reach: local agent threads, turns with tool calls, sandboxed exec, config, account state.
//
// The Electron main process spawns exactly this:
//   codex -c features.code_mode_host=true app-server --analytics-default-enabled
// and speaks newline-delimited JSON-RPC 2.0 over stdio (no Content-Length framing).
// Handshake is `initialize` -> `initialized` notification, then any method below.

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { EventEmitter } from 'node:events'
import { createInterface } from 'node:readline'

export const DEFAULT_CODEX_BIN = '/Applications/ChatGPT.app/Contents/Resources/codex'
export const APP_SERVER_ARGS = ['-c', 'features.code_mode_host=true', 'app-server', '--analytics-default-enabled']

/** Method names the binary exports, grouped as they appear in its dispatch table. */
export const APP_SERVER_METHODS = {
  account: [
    'account/read',
    'account/login/start',
    'account/login/completed',
    'account/login/cancel',
    'account/logout',
    'account/chatgptAuthTokens',
    'account/chatgptAuthTokens/refresh',
    'account/rateLimits/read',
    'account/rateLimitResetCredit/consume',
    'account/usage/read',
    'account/workspaceMessages/read',
    'account/sendAddCreditsNudgeEmail',
  ],
  thread: [
    'thread/start',
    'thread/resume',
    'thread/read',
    'thread/list',
    'thread/loaded/list',
    'thread/items/list',
    'thread/turns/list',
    'thread/search',
    'thread/searchOccurrences',
    'thread/fork',
    'thread/rollback',
    'thread/archive',
    'thread/unarchive',
    'thread/delete',
    'thread/unsubscribe',
    'thread/name/set',
    'thread/goal/set',
    'thread/goal/get',
    'thread/goal/clear',
    'thread/metadata/update',
    'thread/settings/update',
    'thread/memoryMode/set',
    'thread/compact/start',
    'thread/shellCommand',
    'thread/approveGuardianDeniedAction',
    'thread/backgroundTerminals/list',
    'thread/backgroundTerminals/clean',
    'thread/backgroundTerminals/terminate',
    'thread/realtime/start',
    'thread/realtime/stop',
    'thread/realtime/sdp',
    'thread/realtime/appendText',
    'thread/realtime/appendAudio',
    'thread/realtime/appendSpeech',
    'thread/realtime/listVoices',
  ],
  turn: ['turn/start', 'turn/steer', 'turn/interrupt'],
  model: ['model/list', 'model/verification'],
  config: ['config/read', 'config/value/write', 'config/batchWrite', 'config/mcpServer/reload'],
  app: ['app/list', 'app/read', 'app/installed'],
  misc: ['feedback/upload', 'fuzzyFileSearch', 'command/exec', 'command/exec/write', 'command/exec/terminate', 'command/exec/resize'],
}

/** Notifications the server pushes; subscribe with `on(method, handler)` or `on('notification')`. */
export const APP_SERVER_NOTIFICATIONS = [
  'thread/started',
  'thread/closed',
  'thread/archived',
  'thread/unarchived',
  'thread/deleted',
  'thread/compacted',
  'thread/status/changed',
  'thread/tokenUsage/updated',
  'thread/name/updated',
  'thread/goal/updated',
  'thread/settings/updated',
  'thread/environment/connected',
  'thread/environment/disconnected',
  'thread/realtime/started',
  'thread/realtime/closed',
  'thread/realtime/error',
  'thread/realtime/itemAdded',
  'thread/realtime/transcript/delta',
  'thread/realtime/transcript/done',
  'thread/realtime/outputAudio/delta',
  'turn/started',
  'turn/completed',
  'turn/plan/updated',
  'turn/diff/updated',
  'turn/moderationMetadata',
  'account/updated',
  'account/rateLimits/updated',
  'model/rerouted',
  'model/safetyBuffering/updated',
  'app/list/updated',
  'remoteControl/status/changed',
]

function resolveBinary(explicit) {
  const candidates = [explicit, process.env.CODEX_BIN, DEFAULT_CODEX_BIN].filter(Boolean)
  for (const candidate of candidates) if (existsSync(candidate)) return candidate
  throw new Error(`codex binary not found; set CODEX_BIN (tried: ${candidates.join(', ')})`)
}

/**
 * A running app-server. Requests are promises; server-initiated notifications are events.
 * Server->client *requests* (approval prompts, elicitations) are answered by a handler you
 * register with `onRequest`; without one they are rejected with "method not found".
 */
export class AppServer extends EventEmitter {
  constructor({ binary, args = APP_SERVER_ARGS, env = process.env, cwd } = {}) {
    super()
    this.binary = resolveBinary(binary)
    this.args = args
    this.env = env
    this.cwd = cwd
    this.child = null
    this.nextId = 1
    this.pending = new Map()
    this.requestHandler = null
    this.serverInfo = null
  }

  static async start(opts = {}) {
    const server = new AppServer(opts)
    await server.start(opts.clientInfo)
    return server
  }

  async start(clientInfo = { name: 'chatgpt-poc', title: 'ChatGPT PoC client', version: '0.1.0' }) {
    this.child = spawn(this.binary, this.args, { stdio: ['pipe', 'pipe', 'pipe'], env: this.env, cwd: this.cwd })
    this.child.on('exit', (code, signal) => {
      for (const { reject } of this.pending.values()) reject(new Error(`app-server exited (${code ?? signal})`))
      this.pending.clear()
      this.emit('exit', code, signal)
    })

    createInterface({ input: this.child.stdout }).on('line', (line) => this._onLine(line))
    this.child.stderr.on('data', (chunk) => this.emit('stderr', chunk.toString()))

    this.serverInfo = await this.request('initialize', { clientInfo })
    this.notify('initialized', {})
    return this.serverInfo
  }

  _onLine(line) {
    const text = line.trim()
    if (!text) return
    let msg
    try {
      msg = JSON.parse(text)
    } catch {
      this.emit('stderr', `unparsed: ${text}\n`)
      return
    }

    if (msg.id !== undefined && msg.method) {
      // server -> client request
      this._handleServerRequest(msg)
      return
    }
    if (msg.id !== undefined) {
      const entry = this.pending.get(msg.id)
      if (!entry) return
      this.pending.delete(msg.id)
      if (msg.error) entry.reject(Object.assign(new Error(msg.error.message ?? 'app-server error'), { data: msg.error }))
      else entry.resolve(msg.result)
      return
    }
    if (msg.method) {
      this.emit('notification', msg)
      this.emit(msg.method, msg.params, msg)
    }
  }

  async _handleServerRequest(msg) {
    if (!this.requestHandler) {
      this._write({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: `No handler for ${msg.method}` } })
      return
    }
    try {
      const result = await this.requestHandler(msg.method, msg.params, msg)
      this._write({ jsonrpc: '2.0', id: msg.id, result: result ?? {} })
    } catch (err) {
      this._write({ jsonrpc: '2.0', id: msg.id, error: { code: -32000, message: err.message } })
    }
  }

  /** Handle approval prompts / elicitations: `(method, params) => result`. */
  onRequest(handler) {
    this.requestHandler = handler
    return this
  }

  _write(msg) {
    this.child.stdin.write(`${JSON.stringify(msg)}\n`)
  }

  request(method, params = {}, { timeoutMs = 120_000 } = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
      timer.unref?.()
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer)
          resolve(value)
        },
        reject: (err) => {
          clearTimeout(timer)
          reject(err)
        },
      })
      this._write({ jsonrpc: '2.0', id, method, params })
    })
  }

  notify(method, params = {}) {
    this._write({ jsonrpc: '2.0', method, params })
  }

  /**
   * Start a turn and stream its notifications until `turn/completed`.
   * Yields every notification the server emits for that turn.
   */
  async *runTurn(params, { startMethod = 'turn/start' } = {}) {
    const queue = []
    let resolveNext = null
    let finished = false

    const push = (value) => {
      if (resolveNext) {
        resolveNext(value)
        resolveNext = null
      } else queue.push(value)
    }
    const onNotification = (msg) => {
      push(msg)
      if (msg.method === 'turn/completed' || msg.method === 'turn/failed') {
        finished = true
        push(null)
      }
    }
    this.on('notification', onNotification)
    try {
      const started = await this.request(startMethod, params)
      yield { method: startMethod, result: started }
      while (!finished || queue.length) {
        const next = queue.length ? queue.shift() : await new Promise((r) => (resolveNext = r))
        if (next === null) return
        yield next
      }
    } finally {
      this.off('notification', onNotification)
    }
  }

  async close() {
    if (!this.child) return
    this.child.stdin.end()
    this.child.kill()
    this.child = null
  }
}
