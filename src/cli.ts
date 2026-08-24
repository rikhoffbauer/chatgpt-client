import { basename, extname } from 'node:path'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { AppServer, APP_SERVER_METHODS } from './appserver.js'
import { Auth, decodeJwtPayload } from './auth.js'
import { ChatGPTClient, type Conversation } from './client.js'
import { defaultConfig } from './config.js'
import { ProtocolError, serializeError } from './errors.js'
import { ConsoleLogger, type LogLevel } from './logger.js'
import { closeChrome } from './protocol/chrome-solver.js'
import { openConversationSocket } from './realtime.js'
import { ROUTES, type RouteName } from './routes.js'
import type { IntegritySolver, Persona, UnknownRecord } from './types.js'

export const VERSION = '1.0.0'

const HELP = `chatgpt-client ${VERSION}

Usage:
  chatgpt-client <command> [options]

Conversations:
  list [--limit N] [--offset N] [--archived] [--starred]
  read <conversation-id> [--json]
  search <query>
  send [-c ID] [-m MODEL] [--project ID] [--effort LEVEL]
       [--temporary] [--attach FILE]... [--raw] [--json|--json-stream] <text>
  rename <conversation-id> <title>
  branch <conversation-id> <message-id>
  archive|star <conversation-id> [--undo]
  delete <conversation-id>
  share <conversation-id> [--v1]
  files <conversation-id>
  export <conversation-id> [--out FILE]

Account and files:
  whoami | models | settings | memories | memory-summary | usage | pins
  upload <file> [--use-case codex]
  download <file-id> [--out FILE]

Realtime and local app-server:
  watch
  agent methods
  agent call <method> [json]
  agent threads [--limit N]

Generic:
  routes [filter]
  api <route> [--key value|--key=value]...

Global options:
  --base-url URL
  --solver node|chrome
  --persona browser|desktop
  --timeout MS
  --json
  --verbose | --quiet
  --help | --version
`

const BOOLEAN_FLAGS = new Set([
  'help', 'version', 'json', 'json-stream', 'raw', 'temporary', 'archived', 'starred', 'undo', 'v1',
  'verbose', 'quiet',
])

interface ParsedArguments {
  flags: Map<string, Array<string | boolean>>
  positional: string[]
}

class CliFlags {
  constructor(private readonly values: Map<string, Array<string | boolean>>) {}

  has(name: string): boolean {
    return this.values.has(name)
  }

  boolean(name: string): boolean {
    const value = this.last(name)
    if (value === undefined) return false
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
    throw new ProtocolError(`--${name} expects a boolean`, { code: 'INVALID_CLI_ARGUMENT' })
  }

  string(name: string): string | undefined {
    const value = this.last(name)
    if (value === undefined) return undefined
    if (typeof value !== 'string') throw new ProtocolError(`--${name} expects a value`, { code: 'INVALID_CLI_ARGUMENT' })
    return value
  }

  strings(name: string): string[] {
    return (this.values.get(name) ?? []).map((value) => {
      if (typeof value !== 'string') throw new ProtocolError(`--${name} expects a value`, { code: 'INVALID_CLI_ARGUMENT' })
      return value
    })
  }

  number(name: string, fallback?: number): number | undefined {
    const raw = this.string(name)
    if (raw === undefined) return fallback
    const value = Number(raw)
    if (!Number.isFinite(value)) throw new ProtocolError(`--${name} must be a number`, { code: 'INVALID_CLI_ARGUMENT' })
    return value
  }

  entries(): IterableIterator<[string, Array<string | boolean>]> {
    return this.values.entries()
  }

  private last(name: string): string | boolean | undefined {
    return this.values.get(name)?.at(-1)
  }
}

interface CommandContext {
  flags: CliFlags
  positional: string[]
  signal: AbortSignal
  json: boolean
  output(value: unknown): void
  error(message: string): void
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const parsed = parseArguments(argv)
  const flags = new CliFlags(parsed.flags)
  const command = parsed.positional.shift()
  if (flags.boolean('version')) {
    process.stdout.write(`${VERSION}\n`)
    return 0
  }
  if (command === undefined || command === 'help' || flags.boolean('help')) {
    process.stdout.write(HELP)
    return 0
  }

  const controller = new AbortController()
  const abort = (signal: NodeJS.Signals): void => controller.abort(new Error(`Interrupted by ${signal}`))
  const onSigint = (): void => abort('SIGINT')
  const onSigterm = (): void => abort('SIGTERM')
  process.once('SIGINT', onSigint)
  process.once('SIGTERM', onSigterm)

  const json = flags.boolean('json')
  const context: CommandContext = {
    flags,
    positional: parsed.positional,
    signal: controller.signal,
    json,
    output(value): void {
      process.stdout.write(`${typeof value === 'string' && !json ? value : JSON.stringify(value, null, json ? 2 : 2)}\n`)
    },
    error(message): void {
      process.stderr.write(`${message}\n`)
    },
  }

  try {
    if (command === 'routes') return commandRoutes(context)
    if (command === 'agent') return await commandAgent(context)

    const logLevel: LogLevel = flags.boolean('quiet') ? 'silent' : flags.boolean('verbose') ? 'debug' : 'warn'
    const logger = new ConsoleLogger({ level: logLevel, json })
    const timeoutMs = flags.number('timeout')
    const config = defaultConfig({
      ...(flags.string('base-url') === undefined ? {} : { baseUrl: flags.string('base-url') as string }),
      ...(timeoutMs === undefined ? {} : { limits: { requestTimeoutMs: timeoutMs } }),
    })
    const auth = await Auth.load({ path: config.authPath, logger })
    const client = new ChatGPTClient({
      auth,
      baseUrl: config.baseUrl,
      solver: parseSolver(flags.string('solver')),
      persona: parsePersona(flags.string('persona')),
      logger,
      config: { retry: config.retry, limits: config.limits, statePath: config.statePath, authPath: config.authPath },
    })

    try {
      return await executeClientCommand(command, client, context)
    } finally {
      client.close()
    }
  } finally {
    process.removeListener('SIGINT', onSigint)
    process.removeListener('SIGTERM', onSigterm)
  }
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  let json = argv.includes('--json')
  try {
    process.exitCode = await main(argv)
  } catch (error) {
    json ||= argv.includes('--json')
    if (json) process.stderr.write(`${JSON.stringify({ error: serializeError(error) })}\n`)
    else process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  } finally {
    await closeChrome().catch(() => undefined)
  }
}

async function executeClientCommand(command: string, client: ChatGPTClient, context: CommandContext): Promise<number> {
  const { flags, positional, signal, output, error } = context
  switch (command) {
    case 'whoami': {
      const payload = decodeJwtPayload(client.auth.accessToken)
      const claims = client.auth.claims
      const check = await client.call('accountsCheck', { version: 'v4-2023-04-27' }, { signal }).catch(() => null)
      if (context.json) {
        output({ claims, accountsCheck: check })
        return 0
      }
      const account = isRecord(check) && isRecord(check.accounts) && client.auth.accountId !== null
        ? check.accounts[client.auth.accountId]
        : undefined
      const entitlement = isRecord(account) && isRecord(account.entitlement) ? account.entitlement : undefined
      const features = isRecord(account) && Array.isArray(account.features) ? account.features : []
      output({
        apiBase: client.baseUrl,
        accountId: client.auth.accountId,
        userId: claims.user_id,
        plan: claims.chatgpt_plan_type,
        tokenExpires: typeof payload?.exp === 'number' ? new Date(payload.exp * 1_000).toISOString() : null,
        subscription: entitlement?.subscription_plan ?? null,
        renewsAt: entitlement?.renews_at ?? null,
        features: features.length,
        workMode: features.includes('wham'),
      })
      return 0
    }
    case 'models': {
      const response = await client.call('getModels', { history_and_training_disabled: false }, { signal })
      if (context.json) output(response)
      else if (isRecord(response) && Array.isArray(response.models)) {
        for (const model of response.models) {
          if (!isRecord(model)) continue
          process.stdout.write(`${String(model.slug ?? '').padEnd(24)} ${String(model.title ?? '')}\n`)
        }
      }
      return 0
    }
    case 'settings':
      output(await client.call('getUserSettings', {}, { signal }))
      return 0
    case 'memories': {
      const response = await client.getUserMemories({ signal })
      if (context.json) {
        output(response)
      } else {
        process.stdout.write(`memory tokens: ${response.memory_num_tokens}/${response.memory_max_tokens}\n`)
        for (const memory of response.memories) {
          process.stdout.write(`${memory.id}  ${memory.updated_at}  ${memory.content}\n`)
        }
      }
      return 0
    }
    case 'memory-summary': {
      const response = await client.getUserMemorySummary({ signal })
      if (context.json) {
        output(response)
      } else {
        for (const section of response.sections) {
          process.stdout.write(`# ${section.title}\n${section.description}\n`)
          for (const followUp of section.followUps ?? []) process.stdout.write(`  - ${followUp.preview}\n`)
          process.stdout.write('\n')
        }
      }
      return 0
    }
    case 'usage':
      output(await client.call('getMonthlySpend', { account_id: requireValue(client.auth.accountId, 'account id') }, { signal }))
      return 0
    case 'pins':
      output(await client.call('listPins', {}, { signal }))
      return 0
    case 'list': {
      const response = await client.call('listConversations', {
        limit: integerFlag(flags, 'limit', integerFlag(flags, 'n', 20)),
        offset: integerFlag(flags, 'offset', 0),
        order: flags.string('order') ?? 'updated',
        ...(flags.boolean('archived') ? { is_archived: true } : {}),
        ...(flags.boolean('starred') ? { is_starred: true } : {}),
        ...(flags.string('project') === undefined ? {} : { gizmo_id: flags.string('project') as string }),
      }, { signal })
      if (context.json) output(response)
      else if (isRecord(response)) {
        process.stdout.write(`total ${String(response.total ?? 0)}\n`)
        if (Array.isArray(response.items)) {
          for (const item of response.items) {
            if (isRecord(item)) process.stdout.write(`${String(item.id ?? '')}  ${String(item.update_time ?? '')}  ${String(item.title ?? '')}\n`)
          }
        }
      }
      return 0
    }
    case 'search': {
      const query = positional.join(' ').trim()
      if (query === '') throw usage('search requires a query')
      const response = await client.call('searchConversations', { query }, { signal })
      if (context.json) output(response)
      else if (isRecord(response) && Array.isArray(response.items)) {
        for (const item of response.items) {
          if (isRecord(item)) process.stdout.write(`${String(item.conversation_id ?? item.id ?? '')}  ${String(item.title ?? '')}\n`)
        }
      }
      return 0
    }
    case 'read': {
      const conversationId = requiredPositional(positional, 0, 'conversation id')
      const value = await client.call('getConversation', { conversation_id: conversationId }, { signal })
      if (context.json) output(value)
      else {
        if (!isRecord(value)) throw new ProtocolError('Conversation response is not an object', { code: 'INVALID_CONVERSATION_RESPONSE' })
        process.stdout.write(`# ${String(value.title ?? '')}\n\n`)
        for (const message of ChatGPTClient.messageChain(value as Conversation)) {
          const role = message.author?.role
          if (role !== 'user' && role !== 'assistant') continue
          const text = ChatGPTClient.renderParts(message.content?.parts)
          if (text.trim() !== '') process.stdout.write(`[${role}] ${text}\n\n`)
        }
      }
      return 0
    }
    case 'send':
      return commandSend(client, context)
    case 'rename': {
      const conversationId = requiredPositional(positional, 0, 'conversation id')
      const title = positional.slice(1).join(' ').trim()
      if (title === '') throw usage('rename requires a title')
      output(await client.call('renameConversation', { conversation_id: conversationId, title }, { signal }))
      return 0
    }
    case 'archive':
      output(await client.call('patchConversation', { conversation_id: requiredPositional(positional, 0, 'conversation id'), is_archived: !flags.boolean('undo') }, { signal }))
      return 0
    case 'star':
      output(await client.call('patchConversation', { conversation_id: requiredPositional(positional, 0, 'conversation id'), is_starred: !flags.boolean('undo') }, { signal }))
      return 0
    case 'delete':
      output(await client.call('deleteConversation', { conversation_id: requiredPositional(positional, 0, 'conversation id') }, { signal }))
      return 0
    case 'branch':
      output(await client.call('branchConversation', {
        conversation_id: requiredPositional(positional, 0, 'conversation id'),
        message_id: requiredPositional(positional, 1, 'message id'),
      }, { signal }))
      return 0
    case 'share':
      output(await client.share(requiredPositional(positional, 0, 'conversation id'), { v2: !flags.boolean('v1') }))
      return 0
    case 'files':
      output(await client.call('getConversationFiles', { conversation_id: requiredPositional(positional, 0, 'conversation id') }, { signal }))
      return 0
    case 'export': {
      const conversationId = requiredPositional(positional, 0, 'conversation id')
      const value = await client.call('getConversation', { conversation_id: conversationId }, { signal })
      const path = flags.string('out') ?? `${conversationId}.json`
      await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' }).catch(async (writeError: unknown) => {
        if (isNodeError(writeError) && writeError.code === 'EEXIST') throw new ProtocolError(`Refusing to overwrite ${path}`, { code: 'OUTPUT_EXISTS' })
        throw writeError
      })
      process.stdout.write(`${path}\n`)
      return 0
    }
    case 'upload': {
      const path = requiredPositional(positional, 0, 'file path')
      const fileStat = await stat(path)
      if (fileStat.size > client.http.config.limits.uploadBytes) throw new ProtocolError(`File exceeds upload limit: ${path}`, { code: 'UPLOAD_TOO_LARGE' })
      const bytes = await readFile(path)
      output(await client.uploadFile({
        bytes,
        fileName: basename(path),
        contentType: contentTypeFor(path),
        useCase: flags.string('use-case') ?? 'codex',
        signal,
      }))
      return 0
    }
    case 'download': {
      const fileId = requiredPositional(positional, 0, 'file id')
      const { info, bytes } = await client.downloadFile(fileId, { signal })
      const suggested = typeof info.file_name === 'string' ? basename(info.file_name) : fileId
      const path = flags.string('out') ?? suggested
      await writeFile(path, bytes, { flag: 'wx' }).catch((writeError: unknown) => {
        if (isNodeError(writeError) && writeError.code === 'EEXIST') throw new ProtocolError(`Refusing to overwrite ${path}`, { code: 'OUTPUT_EXISTS' })
        throw writeError
      })
      process.stdout.write(`${path} (${bytes.byteLength} bytes)\n`)
      return 0
    }
    case 'watch': {
      const stream = await openConversationSocket(client, { signal })
      error('[connected to /celsius/ws/user — Ctrl-C to stop]')
      try {
        for await (const message of stream.messages()) output(message)
      } finally {
        stream.close()
      }
      return 0
    }
    case 'api': {
      const name = requiredPositional(positional, 0, 'route name')
      if (!(name in ROUTES)) throw new ProtocolError(`Unknown route ${name}`, { code: 'UNKNOWN_ROUTE' })
      const args: UnknownRecord = {}
      for (const [key, values] of flags.entries()) {
        if (['solver', 'base-url', 'persona', 'json', 'verbose', 'quiet', 'timeout'].includes(key)) continue
        const coerced = values.map(coerce)
        args[key] = coerced.length === 1 ? coerced[0] : coerced
      }
      const routeName = name as RouteName
      const result = await client.call(routeName, args, { signal })
      if ('stream' in ROUTES[routeName]) {
        for await (const event of client.streamEvents(result as Response, { signal })) output(event)
      } else output(result)
      return 0
    }
    default:
      throw usage(`Unknown command: ${command}`)
  }
}

async function commandSend(client: ChatGPTClient, context: CommandContext): Promise<number> {
  const { flags, positional, signal, output, error } = context
  const attachments = []
  for (const path of flags.strings('attach')) {
    const fileStat = await stat(path)
    if (fileStat.size > client.http.config.limits.uploadBytes) throw new ProtocolError(`File exceeds upload limit: ${path}`, { code: 'UPLOAD_TOO_LARGE' })
    const bytes = await readFile(path)
    const uploaded = await client.uploadFile({ bytes, fileName: basename(path), contentType: contentTypeFor(path), signal })
    attachments.push({ ...uploaded, name: basename(path), size_bytes: bytes.byteLength, mime_type: contentTypeFor(path) })
    error(`[uploaded ${basename(path)} -> ${uploaded.file_id}]`)
  }
  const text = positional.join(' ')
  if (text === '' && attachments.length === 0) throw usage('send requires text or at least one --attach')
  const options = {
    text,
    conversationId: flags.string('c') ?? flags.string('conversation'),
    model: flags.string('m') ?? flags.string('model'),
    gizmoId: flags.string('gizmo') ?? flags.string('project'),
    thinkingEffort: flags.string('effort'),
    ...(flags.boolean('temporary') ? { historyAndTrainingDisabled: true } : {}),
    attachments,
    signal,
  }

  if (flags.boolean('raw')) {
    const response = await client.startTurn(options)
    for await (const event of client.streamEvents(response, { signal })) output(event)
    return 0
  }

  if (flags.boolean('json-stream')) {
    for await (const event of client.send(options)) process.stdout.write(`${JSON.stringify(event)}\n`)
    return 0
  }

  let conversationId: string | null = null
  const chunks: string[] = []
  let totalBytes = 0
  for await (const event of client.send(options)) {
    if (event.type === 'delta') {
      if (context.json) {
        totalBytes += Buffer.byteLength(event.text, 'utf8')
        if (totalBytes > client.http.config.limits.responseBodyBytes) {
          throw new ProtocolError('JSON output exceeded the configured response limit; use --json-stream', { code: 'OUTPUT_TOO_LARGE' })
        }
        chunks.push(event.text)
      } else process.stdout.write(event.text)
    } else if (event.type === 'meta' || event.type === 'done') conversationId = event.conversationId ?? conversationId
  }
  if (context.json) output({ conversationId, text: chunks.join('') })
  else {
    process.stdout.write('\n')
    if (conversationId !== null) error(`[conversation: ${conversationId}]`)
  }
  return 0
}

function commandRoutes(context: CommandContext): number {
  const filter = context.positional[0]?.toLowerCase()
  for (const [name, route] of Object.entries(ROUTES)) {
    if (filter !== undefined && !name.toLowerCase().includes(filter) && !route.path.toLowerCase().includes(filter)) continue
    process.stdout.write(`${name.padEnd(34)} ${route.method.padEnd(6)} ${route.path}${'stream' in route ? `  [${route.stream}]` : ''}\n`)
  }
  return 0
}

async function commandAgent(context: CommandContext): Promise<number> {
  const [subcommand, ...rest] = context.positional
  if (subcommand === 'methods') {
    context.output(APP_SERVER_METHODS)
    return 0
  }
  const server = await AppServer.start()
  server.onRequest(async (method) => {
    context.error(`[app-server request: ${method} — declined]`)
    return { decision: 'decline' }
  })
  try {
    if (subcommand === 'threads') {
      context.output(await server.request('thread/list', { pageSize: integerFlag(context.flags, 'limit', 20) }, { signal: context.signal }))
      return 0
    }
    if (subcommand === 'call') {
      const method = rest[0]
      if (method === undefined) throw usage('agent call requires a method')
      const params = rest[1] === undefined ? {} : parseJsonObject(rest[1], 'agent parameters')
      context.output(await server.request(method, params, { signal: context.signal }))
      return 0
    }
    context.output(await server.request('account/read', {}, { signal: context.signal }))
    return 0
  } finally {
    await server.close()
  }
}

export function parseArguments(argv: string[]): ParsedArguments {
  const flags = new Map<string, Array<string | boolean>>()
  const positional: string[] = []
  let parseFlags = true
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === undefined) continue
    if (parseFlags && argument === '--') {
      parseFlags = false
      continue
    }
    if (parseFlags && argument.startsWith('--')) {
      const body = argument.slice(2)
      const equals = body.indexOf('=')
      const name = equals === -1 ? body : body.slice(0, equals)
      if (name === '') throw usage('Empty option name')
      let value: string | boolean
      if (equals !== -1) value = body.slice(equals + 1)
      else if (BOOLEAN_FLAGS.has(name)) value = true
      else {
        const next = argv[index + 1]
        if (next === undefined || next === '--') throw usage(`--${name} requires a value`)
        value = next
        index += 1
      }
      appendFlag(flags, name, value)
      continue
    }
    if (parseFlags && /^-[A-Za-z]$/.test(argument)) {
      const name = argument.slice(1)
      const next = argv[index + 1]
      if (next === undefined || next === '--') throw usage(`-${name} requires a value`)
      appendFlag(flags, name, next)
      index += 1
      continue
    }
    positional.push(argument)
  }
  return { flags, positional }
}

function appendFlag(flags: Map<string, Array<string | boolean>>, name: string, value: string | boolean): void {
  const values = flags.get(name) ?? []
  values.push(value)
  flags.set(name, values)
}

function coerce(value: string | boolean): unknown {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  if (value !== '' && Number.isFinite(Number(value))) return Number(value)
  if (/^[\[{]/.test(value)) {
    try {
      return JSON.parse(value) as unknown
    } catch {
      return value
    }
  }
  return value
}

function integerFlag(flags: CliFlags, name: string, fallback: number): number {
  const value = flags.number(name, fallback)
  if (value === undefined || !Number.isSafeInteger(value)) throw usage(`--${name} must be an integer`)
  return value
}

function requiredPositional(values: string[], index: number, label: string): string {
  const value = values[index]
  if (value === undefined || value === '') throw usage(`Missing ${label}`)
  return value
}

function requireValue<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) throw new ProtocolError(`Missing ${label}`, { code: 'MISSING_VALUE' })
  return value
}

function parseSolver(value: string | undefined): IntegritySolver {
  if (value === undefined) return 'node'
  if (value === 'node' || value === 'chrome') return value
  throw usage('--solver must be node or chrome')
}

function parsePersona(value: string | undefined): Persona {
  if (value === undefined) return 'browser'
  if (value === 'browser' || value === 'desktop') return value
  throw usage('--persona must be browser or desktop')
}

function parseJsonObject(value: string, label: string): UnknownRecord {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch (error) {
    throw new ProtocolError(`Invalid JSON for ${label}`, { code: 'INVALID_JSON', cause: error })
  }
  if (!isRecord(parsed)) throw usage(`${label} must be a JSON object`)
  return parsed
}

function usage(message: string): ProtocolError {
  return new ProtocolError(`${message}\n\n${HELP}`, { code: 'USAGE_ERROR' })
}

function contentTypeFor(path: string): string {
  return ({
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.csv': 'text/csv',
    '.zip': 'application/zip',
  } as Record<string, string>)[extname(path).toLowerCase()] ?? 'application/octet-stream'
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && 'code' in value
}
