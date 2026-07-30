// @ts-nocheck
// CLI over the full client. Every catalogued route is reachable through `api <name>`;
// the named commands are just ergonomic wrappers with formatted output.

import { readFile, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { Auth, decodeJwtPayload } from './auth.js'
import { ChatGPTClient } from './client.js'
import { ROUTES } from './routes.js'
import { AppServer, APP_SERVER_METHODS } from './appserver.js'
import { openConversationSocket } from './realtime.js'

const HELP = `chatgpt — a complete client for the ChatGPT desktop app's backend

conversations
  list [--limit N] [--offset N] [--archived] [--starred] [--project ID]
  read <id> [--json]
  search <query>
  send [-c ID] [-m MODEL] [--project ID] [--gizmo ID] [--effort E] [--temporary]
       [--attach FILE]... [--raw] [--json] <text>
  rename <id> <title>
  archive <id> [--undo] | star <id> [--undo] | delete <id>
  branch <id> <message_id>
  share <id> [--v1]
  files <id>
  export <id> [--out FILE]

account & config
  whoami | models | settings | usage | pins

files
  upload <file> [--use-case codex] | download <file_id> [--out FILE]

realtime
  watch                       stream the /celsius/ws/user push channel

app-server (local codex agent, JSON-RPC over stdio)
  agent methods               list every RPC method
  agent call <method> [json]  one request
  agent threads               thread/list

generic
  api <route> [--key value|--key=value]...   call any catalogued endpoint
  routes [filter]                            list the endpoint catalog

global flags: --solver node|chrome   --base-url URL   --json   --persona browser|desktop`

function parseArgs(argv) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split(/=(.*)/s)
      if (inline !== undefined) flags[key] = inline
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[key] = argv[++i]
      else flags[key] = true
    } else if (arg.startsWith('-') && arg.length === 2) {
      flags[arg.slice(1)] = argv[++i]
    } else {
      positional.push(arg)
    }
  }
  return { flags, positional }
}

const coerce = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value !== '' && !Number.isNaN(Number(value)) && typeof value === 'string') return Number(value)
  if (typeof value === 'string' && /^[[{]/.test(value)) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

const out = (value) => console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2))

async function cmdSend(client, flags, positional) {
  const attachPaths = [].concat(flags.attach ?? [])
  const attachments = []
  for (const path of attachPaths.filter((p) => typeof p === 'string')) {
    const bytes = await readFile(path)
    const uploaded = await client.uploadFile({ bytes, fileName: basename(path) })
    attachments.push({ ...uploaded, name: basename(path), size_bytes: bytes.byteLength })
    console.error(`[uploaded ${basename(path)} -> ${uploaded.file_id}]`)
  }

  const opts = {
    text: positional.join(' '),
    conversationId: flags.c ?? flags.conversation,
    model: flags.m ?? flags.model,
    gizmoId: flags.gizmo ?? flags.project,
    thinkingEffort: flags.effort,
    historyAndTrainingDisabled: flags.temporary ? true : undefined,
    attachments,
  }
  if (!opts.text && !attachments.length) throw new Error('nothing to send')

  if (flags.raw) {
    const res = await client.startTurn(opts)
    for await (const { event, data } of client.streamEvents(res)) out({ event, data })
    return
  }

  let conversationId = null
  const chunks = []
  for await (const item of client.send(opts)) {
    if (item.type === 'delta') {
      chunks.push(item.text)
      if (!flags.json) process.stdout.write(item.text)
    } else if (item.type === 'meta' || item.type === 'done') {
      conversationId = item.conversationId ?? conversationId
    }
  }
  if (flags.json) out({ conversationId, text: chunks.join('') })
  else {
    process.stdout.write('\n')
    if (conversationId) console.error(`[conversation: ${conversationId}]`)
  }
}

async function cmdRead(client, flags, positional) {
  const convo = await client.getConversation({ conversation_id: positional[0] })
  if (flags.json) return out(convo)
  console.log(`# ${convo.title}\n`)
  for (const msg of ChatGPTClient.messageChain(convo)) {
    if (!['user', 'assistant'].includes(msg.author?.role)) continue
    const text = ChatGPTClient.renderParts(msg.content?.parts)
    if (text.trim()) console.log(`[${msg.author.role}] ${text}\n`)
  }
}

async function cmdAgent(flags, positional) {
  const [sub, ...rest] = positional
  if (sub === 'methods') return out(APP_SERVER_METHODS)

  const server = await AppServer.start()
  server.onRequest(async (method) => {
    console.error(`[app-server request: ${method} — auto-declining]`)
    return { decision: 'decline' }
  })
  try {
    if (sub === 'threads') return out(await server.request('thread/list', { pageSize: Number(flags.limit ?? 20) }))
    if (sub === 'call') {
      const [method, json] = rest
      if (!method) throw new Error('agent call <method> [json params]')
      return out(await server.request(method, json ? JSON.parse(json) : {}))
    }
    out(await server.request('account/read'))
  } finally {
    await server.close()
  }
}

export async function main(argv = process.argv.slice(2)) {
  const { flags, positional } = parseArgs(argv)
  const cmd = positional.shift()
  if (!cmd || cmd === 'help' || flags.help) return console.log(HELP)

  if (cmd === 'routes') {
    const filter = positional[0]
    for (const [name, route] of Object.entries(ROUTES)) {
      if (filter && !name.toLowerCase().includes(filter.toLowerCase()) && !route.path.includes(filter)) continue
      console.log(`${name.padEnd(34)} ${route.method.padEnd(6)} ${route.path}${route.stream ? `  [${route.stream}]` : ''}`)
    }
    return
  }
  if (cmd === 'agent') return cmdAgent(flags, positional)

  const auth = await Auth.load()
  const client = new ChatGPTClient({
    auth,
    baseUrl: flags['base-url'],
    solver: flags.solver ?? process.env.POC_SOLVER ?? 'node',
    persona: flags.persona ?? 'browser',
  })

  switch (cmd) {
    case 'whoami': {
      const payload = decodeJwtPayload(auth.accessToken)
      const claims = auth.claims
      const check = await client.accountsCheck({ version: 'v4-2023-04-27' }).catch(() => null)
      if (flags.json) return out({ claims, accountsCheck: check })
      const account = check?.accounts?.[auth.accountId]
      return out({
        apiBase: client.baseUrl,
        accountId: auth.accountId,
        userId: claims.user_id,
        plan: claims.chatgpt_plan_type,
        tokenExpires: payload?.exp ? new Date(payload.exp * 1000).toISOString() : null,
        subscription: account?.entitlement?.subscription_plan ?? null,
        renewsAt: account?.entitlement?.renews_at ?? null,
        features: account?.features?.length ?? 0,
        workMode: account?.features?.includes('wham') ?? false,
      })
    }
    case 'models': {
      const models = await client.getModels({ history_and_training_disabled: false })
      if (flags.json) return out(models)
      for (const m of models.models ?? []) console.log(`${(m.slug ?? '').padEnd(24)} ${m.title ?? ''}`)
      return
    }
    case 'settings':
      return out(await client.getUserSettings())
    case 'usage':
      return out(await client.getMonthlySpend({ account_id: auth.accountId }))
    case 'pins':
      return out(await client.listPins())
    case 'list': {
      const res = await client.listConversations({
        limit: Number(flags.limit ?? flags.n ?? 20),
        offset: Number(flags.offset ?? 0),
        order: flags.order ?? 'updated',
        is_archived: flags.archived ? true : undefined,
        is_starred: flags.starred ? true : undefined,
        gizmo_id: flags.project,
      })
      if (flags.json) return out(res)
      console.log(`total ${res.total}`)
      for (const c of res.items ?? []) console.log(`${c.id}  ${c.update_time}  ${c.title}`)
      return
    }
    case 'search': {
      const res = await client.searchConversations({ query: positional.join(' ') })
      if (flags.json) return out(res)
      for (const item of res.items ?? []) console.log(`${item.conversation_id ?? item.id}  ${item.title}`)
      return
    }
    case 'read':
      return cmdRead(client, flags, positional)
    case 'send':
      return cmdSend(client, flags, positional)
    case 'rename':
      return out(await client.renameConversation({ conversation_id: positional[0], title: positional.slice(1).join(' ') }))
    case 'archive':
      return out(await client.setConversationArchived(positional[0], !flags.undo))
    case 'star':
      return out(await client.setConversationStarred(positional[0], !flags.undo))
    case 'delete':
      return out(await client.deleteConversation({ conversation_id: positional[0] }))
    case 'branch':
      return out(await client.branchConversation({ conversation_id: positional[0], message_id: positional[1] }))
    case 'share':
      return out(await client.share(positional[0], { v2: !flags.v1 }))
    case 'files':
      return out(await client.getConversationFiles({ conversation_id: positional[0] }))
    case 'export': {
      const convo = await client.getConversation({ conversation_id: positional[0] })
      const path = flags.out ?? `${positional[0]}.json`
      await writeFile(path, JSON.stringify(convo, null, 2))
      return console.log(path)
    }
    case 'upload': {
      const bytes = await readFile(positional[0])
      return out(await client.uploadFile({ bytes, fileName: basename(positional[0]), useCase: flags['use-case'] ?? 'codex' }))
    }
    case 'download': {
      const { info, bytes } = await client.downloadFile(positional[0])
      const path = flags.out ?? info?.file_name ?? positional[0]
      await writeFile(path, bytes)
      return console.log(`${path} (${bytes.byteLength} bytes)`)
    }
    case 'watch': {
      const socket = await openConversationSocket(client)
      console.error('[connected to /celsius/ws/user — ctrl-c to stop]')
      for await (const msg of socket.messages()) out(msg)
      return
    }
    case 'api': {
      const name = positional.shift()
      if (!ROUTES[name]) throw new Error(`Unknown route "${name}". Try: routes ${name ?? ''}`)
      const args = Object.fromEntries(
        Object.entries(flags)
          .filter(([k]) => !['solver', 'base-url', 'persona', 'json'].includes(k))
          .map(([k, v]) => [k, coerce(v)]),
      )
      const result = await client.call(name, args)
      if (ROUTES[name].stream) {
        for await (const evt of client.streamEvents(result)) out(evt)
        return
      }
      return out(result)
    }
    default:
      console.log(HELP)
      process.exitCode = 1
  }
}

export async function run(argv: string[] = process.argv.slice(2)) {
  try {
    await main(argv)
  } catch (err) {
    console.error(err.message)
    process.exitCode = 1
  } finally {
    const chrome = await import('./chrome-solver.js').catch(() => null)
    await chrome?.closeChrome()
  }
}
