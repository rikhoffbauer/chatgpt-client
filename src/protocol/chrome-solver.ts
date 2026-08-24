import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { deadlineSignal, sleep } from '../abort.js'
import { ProtocolError, TimeoutError, errorMessage } from '../errors.js'
import type { UnknownRecord } from '../types.js'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter((value): value is string => typeof value === 'string' && value !== '')

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'

export interface CdpClient {
  readonly ready: Promise<void>
  send<T extends UnknownRecord = UnknownRecord>(method: string, params?: UnknownRecord, sessionId?: string): Promise<T>
  close(): void
}

export interface ChromeSession {
  cdp: CdpClient
  sessionId: string
  evaluate<T = unknown>(expression: string, awaitPromise?: boolean): Promise<T>
  navigate(url: string): Promise<void>
  close(): Promise<void>
}

interface ChromeSolveOptions {
  url?: string
  headless?: boolean
  keepAlive?: boolean
  signal?: AbortSignal
}

function chromeBinary(): string {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (found === undefined) {
    throw new ProtocolError(`No Chrome/Chromium found. Set CHROME_PATH. Looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}`, {
      code: 'CHROME_NOT_FOUND',
    })
  }
  return found
}

async function waitForDevTools(port: number, timeoutMs = 20_000, signal?: AbortSignal): Promise<{ webSocketDebuggerUrl: string }> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    signal?.throwIfAborted()
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal })
      if (response.ok) {
        const value: unknown = await response.json()
        if (isRecord(value) && typeof value.webSocketDebuggerUrl === 'string') return { webSocketDebuggerUrl: value.webSocketDebuggerUrl }
      }
    } catch (error) {
      if (signal?.aborted === true) throw signal.reason ?? error
    }
    await sleep(120, signal)
  }
  throw new TimeoutError('Chrome DevTools startup', timeoutMs)
}

function connectCdp(webSocketUrl: string, options: { requestTimeoutMs?: number; maxPending?: number } = {}): CdpClient {
  const requestTimeoutMs = options.requestTimeoutMs ?? 15_000
  const maxPending = options.maxPending ?? 128
  const socket = new WebSocket(webSocketUrl)
  const pending = new Map<number, { resolve(value: UnknownRecord): void; reject(error: unknown): void; timer: NodeJS.Timeout }>()
  let nextId = 1
  let closed = false

  const rejectAll = (error: unknown): void => {
    for (const entry of pending.values()) {
      clearTimeout(entry.timer)
      entry.reject(error)
    }
    pending.clear()
  }

  const ready = new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true })
    socket.addEventListener('error', () => reject(new ProtocolError('CDP WebSocket failed before opening', { code: 'CDP_CONNECT_FAILED' })), { once: true })
  })

  socket.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return
    let message: unknown
    try {
      message = JSON.parse(event.data)
    } catch {
      return
    }
    if (!isRecord(message) || typeof message.id !== 'number') return
    const entry = pending.get(message.id)
    if (entry === undefined) return
    pending.delete(message.id)
    clearTimeout(entry.timer)
    if (isRecord(message.error)) entry.reject(new ProtocolError(String(message.error.message ?? 'CDP request failed'), { code: 'CDP_REQUEST_FAILED' }))
    else entry.resolve(isRecord(message.result) ? message.result : {})
  })
  socket.addEventListener('close', () => {
    closed = true
    rejectAll(new ProtocolError('CDP WebSocket closed', { code: 'CDP_CLOSED' }))
  })
  socket.addEventListener('error', () => rejectAll(new ProtocolError('CDP WebSocket error', { code: 'CDP_SOCKET_ERROR' })))

  return {
    ready,
    close(): void {
      if (!closed) socket.close()
      rejectAll(new ProtocolError('CDP client closed', { code: 'CDP_CLOSED' }))
    },
    async send<T extends UnknownRecord = UnknownRecord>(method: string, params: UnknownRecord = {}, sessionId?: string): Promise<T> {
      await ready
      if (closed) throw new ProtocolError('CDP client is closed', { code: 'CDP_CLOSED' })
      if (pending.size >= maxPending) throw new ProtocolError(`CDP has ${pending.size} pending requests`, { code: 'CDP_PENDING_LIMIT' })
      const id = nextId++
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id)
          reject(new TimeoutError(`CDP ${method}`, requestTimeoutMs))
        }, requestTimeoutMs)
        pending.set(id, { resolve: (value) => resolve(value as T), reject, timer })
        socket.send(JSON.stringify(sessionId === undefined ? { id, method, params } : { id, method, params, sessionId }))
      })
    },
  }
}

const PAGE_SOLVER = String.raw`
(function(){
  const R = new Map();
  let steps = 0;
  const xor = (t, k) => { let o=''; for (let i=0;i<t.length;i++) o += String.fromCharCode(t.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return o; };
  async function drain(){
    while ((R.get(9)||[]).length > 0) {
      const [op, ...args] = R.get(9).shift() ?? [];
      const fn = R.get(op);
      const out = typeof fn === 'function' ? fn(...args) : undefined;
      if (out && typeof out.then === 'function') await Promise.resolve(out);
      steps++;
    }
  }
  function install(solve){
    R.clear();
    R.set(0,  e => solve(e, String(R.get(16))));
    R.set(1,  (e,t) => R.set(e, xor(String(R.get(e)), String(R.get(t)))));
    R.set(2,  (e,t) => R.set(e, t));
    R.set(5,  (e,t) => { const c = R.get(e); if (Array.isArray(c)) { c.push(R.get(t)); return; } R.set(e, c + R.get(t)); });
    R.set(27, (e,t) => { const c = R.get(e); if (Array.isArray(c)) { c.splice(c.indexOf(R.get(t)),1); return; } R.set(e, c - R.get(t)); });
    R.set(29, (e,t,n) => R.set(e, Number(R.get(t)) < Number(R.get(n))));
    R.set(33, (e,t,n) => R.set(e, Number(R.get(t)) * Number(R.get(n))));
    R.set(35, (e,t,n) => { const d = Number(R.get(n)); R.set(e, d === 0 ? 0 : Number(R.get(t)) / d); });
    R.set(6,  (e,t,n) => { const o = R.get(t); R.set(e, o[String(R.get(n))]); });
    R.set(7,  (e,...t) => R.get(e)(...t.map(x => R.get(x))));
    R.set(17, (e,t,...n) => { try { const r = R.get(t)(...n.map(x => R.get(x)));
        if (r && typeof r.then === 'function') return r.then(v => { R.set(e, v); }).catch(v => { R.set(e, String(v)); });
        R.set(e, r); } catch (err) { R.set(e, String(err)); } });
    R.set(13, (e,t,...n) => { try { R.get(t)(...n); } catch (err) { R.set(e, String(err)); } });
    R.set(8,  (e,t) => R.set(e, R.get(t)));
    R.set(10, window);
    R.set(11, (e,t) => R.set(e, (Array.from(document.scripts||[]).map(s => s?.src?.match(String(R.get(t)))).filter(m => m?.length)[0] ?? [])[0] ?? null));
    R.set(12, e => R.set(e, R));
    R.set(14, (e,t) => R.set(e, JSON.parse(String(R.get(t)))));
    R.set(15, (e,t) => R.set(e, JSON.stringify(R.get(t))));
    R.set(18, e => R.set(e, atob(String(R.get(e)))));
    R.set(19, e => R.set(e, btoa(String(R.get(e)))));
    R.set(20, (e,t,n,...r) => R.get(e) === R.get(t) ? R.get(n)(...r) : null);
    R.set(21, (e,t,n,r,...i) => Math.abs(Number(R.get(e)) - Number(R.get(t))) > Number(R.get(n)) ? R.get(r)(...i) : null);
    R.set(23, (e,t,...n) => R.get(e) === undefined ? null : R.get(t)(...n));
    R.set(24, (e,t,n) => { const o = R.get(t); R.set(e, o[String(R.get(n))].bind(o)); });
    R.set(34, (e,t) => Promise.resolve(R.get(t)).then(v => { R.set(e, v); }));
    R.set(22, (e,t) => { const saved = [...R.get(9)]; R.set(9, [...t]);
      return drain().catch(err => { R.set(e, String(err)); }).finally(() => R.set(9, saved)); });
    R.set(28, () => undefined); R.set(26, () => undefined); R.set(25, () => undefined);
  }
  function solve(dx, key){
    return new Promise((resolve, reject) => {
      install(solve); steps = 0; R.set(16, key);
      let settled = false;
      setTimeout(() => { if (!settled) { settled = true; resolve(String(steps)); } }, 500);
      R.set(3, v => { if (!settled) { settled = true; resolve(btoa(String(v))); } });
      R.set(4, v => { if (!settled) { settled = true; reject(btoa(String(v))); } });
      R.set(30, (slot, resultReg, argRegs, program) => {
        const hasArgs = Array.isArray(program);
        const params = hasArgs ? argRegs : [];
        const body = (hasArgs ? program : argRegs) ?? [];
        R.set(slot, (...callArgs) => {
          if (settled) return;
          const saved = [...R.get(9)];
          if (hasArgs) for (let i = 0; i < params.length; i++) R.set(params[i], callArgs[i]);
          R.set(9, [...body]);
          return drain().then(() => R.get(resultReg)).catch(err => String(err)).finally(() => R.set(9, saved));
        });
      });
      try {
        R.set(9, JSON.parse(xor(atob(dx), String(R.get(16)))));
        drain().catch(err => { if (!settled) { settled = true; resolve(btoa(steps + ': ' + String(err))); } });
      } catch (err) { if (!settled) { settled = true; resolve(btoa(steps + ': ' + String(err))); } }
    });
  }
  window.__sentinelSolveTurnstile = solve;
  return 'ready';
})()
`


let browserPromise: Promise<ChromeSession> | undefined

async function launch(options: { url: string; headless: boolean; installSolver: boolean; signal?: AbortSignal }): Promise<ChromeSession> {
  const port = 9_222 + Math.floor(Math.random() * 1_000)
  const userDataDir = await mkdtemp(join(tmpdir(), 'chatgpt-client-chrome-'))
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-features=Translate,MediaRouter',
    '--window-size=1512,856',
    ...(options.headless ? [] : ['--start-minimized']),
    'about:blank',
  ]
  if (options.headless) args.unshift('--headless=new')

  let process: ChildProcess | undefined
  let cdp: CdpClient | undefined
  try {
    process = spawn(chromeBinary(), args, { stdio: 'ignore', detached: false })
    const version = await waitForDevTools(port, 20_000, options.signal)
    cdp = connectCdp(version.webSocketDebuggerUrl)
    await cdp.ready

    const target = await cdp.send<{ targetId?: unknown }>('Target.createTarget', { url: 'about:blank' })
    if (typeof target.targetId !== 'string') throw new ProtocolError('CDP did not return targetId', { code: 'CDP_INVALID_RESPONSE' })
    const attached = await cdp.send<{ sessionId?: unknown }>('Target.attachToTarget', { targetId: target.targetId, flatten: true })
    if (typeof attached.sessionId !== 'string') throw new ProtocolError('CDP did not return sessionId', { code: 'CDP_INVALID_RESPONSE' })
    const sessionId = attached.sessionId

    await cdp.send('Page.enable', {}, sessionId)
    await cdp.send('Runtime.enable', {}, sessionId)
    await cdp.send('Emulation.setUserAgentOverride', { userAgent: USER_AGENT, acceptLanguage: 'en-US,en;q=0.9', platform: 'MacIntel' }, sessionId)
    await cdp.send('Page.navigate', { url: options.url }, sessionId)

    const deadline = deadlineSignal('ChatGPT page load', 15_000, options.signal)
    try {
      while (true) {
        deadline.signal.throwIfAborted()
        const evaluation = await cdp.send<{ result?: unknown }>('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true }, sessionId)
        const result = isRecord(evaluation.result) ? evaluation.result : undefined
        if (result?.value === 'complete') break
        await sleep(200, deadline.signal)
      }
    } finally {
      deadline.cleanup()
    }

    if (options.installSolver) {
      const installed = await cdp.send<{ exceptionDetails?: unknown }>('Runtime.evaluate', { expression: PAGE_SOLVER, returnByValue: true }, sessionId)
      if (installed.exceptionDetails !== undefined) throw new ProtocolError('Turnstile solver installation failed in Chrome', { code: 'CHROME_SOLVER_INSTALL_FAILED' })
    }

    const connectedCdp = cdp
    if (connectedCdp === undefined) throw new ProtocolError('Chrome CDP connection was lost during launch', { code: 'CDP_CONNECT_FAILED' })
    return {
      cdp: connectedCdp,
      sessionId,
      async evaluate<T = unknown>(expression: string, awaitPromise = false): Promise<T> {
        const evaluation = await connectedCdp.send<{ result?: unknown; exceptionDetails?: unknown }>('Runtime.evaluate', {
          expression,
          awaitPromise,
          returnByValue: true,
        }, sessionId)
        if (evaluation.exceptionDetails !== undefined) throw new ProtocolError('Chrome runtime evaluation failed', { code: 'CHROME_RUNTIME_EVALUATION_FAILED' })
        const result = isRecord(evaluation.result) ? evaluation.result.value : undefined
        return result as T
      },
      async navigate(url: string): Promise<void> {
        await connectedCdp.send('Page.navigate', { url }, sessionId)
      },
      async close(): Promise<void> {
        cdp?.close()
        process?.kill()
        await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined)
      },
    }
  } catch (error) {
    cdp?.close()
    process?.kill()
    await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined)
    throw new ProtocolError(`Unable to launch Chrome solver: ${errorMessage(error)}`, { code: 'CHROME_SOLVER_LAUNCH_FAILED', cause: error })
  }
}

/** Launches an isolated real Chrome renderer for browser-backed HTTP requests. */
export async function createChromeSession(options: { url?: string; headless?: boolean; signal?: AbortSignal } = {}): Promise<ChromeSession> {
  return launch({
    url: options.url ?? 'https://chatgpt.com/',
    headless: options.headless ?? process.env.CHATGPT_CLIENT_HEADFUL !== '1',
    installSolver: false,
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  })
}

export async function solveInChrome(dx: string, key: string, options: ChromeSolveOptions = {}): Promise<string> {
  const url = options.url ?? 'https://chatgpt.com/'
  const headless = options.headless ?? process.env.CHATGPT_CLIENT_HEADFUL !== '1'
  browserPromise ??= launch({ url, headless, installSolver: true, ...(options.signal === undefined ? {} : { signal: options.signal }) }).catch((error) => {
    browserPromise = undefined
    throw error
  })
  const browser = await browserPromise
  const response = await browser.cdp.send<{ result?: unknown; exceptionDetails?: unknown }>(
    'Runtime.evaluate',
    {
      expression: `window.__sentinelSolveTurnstile(${JSON.stringify(dx)}, ${JSON.stringify(key)})`,
      awaitPromise: true,
      returnByValue: true,
    },
    browser.sessionId,
  )
  if (response.exceptionDetails !== undefined) throw new ProtocolError('Turnstile VM threw in Chrome', { code: 'CHROME_SOLVER_FAILED' })
  const result = isRecord(response.result) ? response.result.value : undefined
  if (typeof result !== 'string') throw new ProtocolError('Chrome solver returned a non-string result', { code: 'CHROME_SOLVER_INVALID_RESULT' })
  if (options.keepAlive === false) await closeChrome()
  return result
}

export async function closeChrome(): Promise<void> {
  if (browserPromise === undefined) return
  const pending = browserPromise
  browserPromise = undefined
  const browser = await pending.catch(() => undefined)
  await browser?.close()
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
