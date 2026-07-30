// @ts-nocheck
// Headless-Chrome fallback for the Turnstile (dx) challenge.
//
// The Node port in turnstile.js runs the VM against a shim. When the challenge
// program probes something the shim does not model well enough — or the server
// starts rejecting shim-produced tokens — solve it in a real browser instead:
// launch headless Chrome over the DevTools Protocol, load a chatgpt.com document
// so the program sees a genuine origin/DOM, and run the original VM there.
//
// Zero dependencies: CDP is spoken over Node 22's built-in WebSocket.

import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

function chromeBinary() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!found) throw new Error(`No Chrome/Chromium found. Set CHROME_PATH. Looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}`)
  return found
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDevTools(port, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* not up yet */
    }
    await sleep(120)
  }
  throw new Error('Chrome DevTools endpoint never came up')
}

// Minimal CDP client: send(method, params, sessionId) -> Promise<result>
function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl)
  const pending = new Map()
  let nextId = 1
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve())
    ws.addEventListener('error', (e) => reject(new Error(`CDP socket error: ${e.message ?? 'unknown'}`)))
  })
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(`${msg.error.message} (${msg.method ?? ''})`)) : resolve(msg.result)
    }
  })
  return {
    ready,
    close: () => ws.close(),
    send(method, params = {}, sessionId) {
      const id = nextId++
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }))
      })
    },
  }
}

// The original VM, verbatim in structure, evaluated inside the page.
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

let browser = null

async function launch({ url, headless }) {
  const port = 9222 + Math.floor(Math.random() * 1000)
  const userDataDir = await mkdtemp(join(tmpdir(), 'chatgpt-poc-chrome-'))
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-features=Translate,MediaRouter',
    '--window-size=1512,856',
    'about:blank',
  ]
  if (headless) args.unshift('--headless=new')

  const proc = spawn(chromeBinary(), args, { stdio: 'ignore', detached: false })
  const version = await waitForDevTools(port)
  const cdp = connectCdp(version.webSocketDebuggerUrl)
  await cdp.ready

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })

  await cdp.send('Page.enable', {}, sessionId)
  await cdp.send('Runtime.enable', {}, sessionId)
  await cdp.send('Emulation.setUserAgentOverride', { userAgent: UA, acceptLanguage: 'en-US,en;q=0.9', platform: 'MacIntel' }, sessionId)

  // Load a real chatgpt.com document so the challenge sees the right origin/DOM.
  await cdp.send('Page.navigate', { url }, sessionId)
  await Promise.race([
    new Promise((resolve) => {
      const poll = setInterval(async () => {
        const { result } = await cdp.send(
          'Runtime.evaluate',
          { expression: 'document.readyState', returnByValue: true },
          sessionId,
        )
        if (result.value === 'complete') {
          clearInterval(poll)
          resolve()
        }
      }, 200)
    }),
    sleep(15_000),
  ])

  const install = await cdp.send('Runtime.evaluate', { expression: PAGE_SOLVER, returnByValue: true }, sessionId)
  if (install.exceptionDetails) throw new Error(`Solver install failed: ${install.exceptionDetails.text}`)

  return {
    cdp,
    sessionId,
    async close() {
      try {
        cdp.close()
      } catch {}
      try {
        proc.kill()
      } catch {}
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {})
    },
  }
}

export async function solveInChrome(dx, key, { url = 'https://chatgpt.com/', headless = process.env.POC_HEADFUL !== '1', keepAlive = true } = {}) {
  browser ??= await launch({ url, headless })
  const { result, exceptionDetails } = await browser.cdp.send(
    'Runtime.evaluate',
    {
      expression: `window.__sentinelSolveTurnstile(${JSON.stringify(dx)}, ${JSON.stringify(key)})`,
      awaitPromise: true,
      returnByValue: true,
    },
    browser.sessionId,
  )
  if (exceptionDetails) throw new Error(`Turnstile VM threw in page: ${exceptionDetails.text}`)
  if (!keepAlive) await closeChrome()
  return result.value
}

export async function closeChrome() {
  if (!browser) return
  const b = browser
  browser = null
  await b.close()
}
