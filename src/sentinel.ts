// @ts-nocheck
// OpenAI's anti-abuse "sentinel" system — this is what the app calls Turnstile, and it is
// OpenAI's own, not Cloudflare's.
//
// app-initial-*.js : tya/nya/iya/aya/oya/cya/lya/uya/mya
//
// POST /sentinel/chat-requirements/prepare {p: <fingerprint key>} answers with up to three
// requirements; each satisfied one becomes a header on /f/conversation:
//   requirements token -> OpenAI-Sentinel-Chat-Requirements-Token (or ...-Prepare-Token)
//   proof of work      -> OpenAI-Sentinel-Proof-Token
//   turnstile          -> OpenAI-Sentinel-Turnstile-Token
//
// On a signed build with Apple DeviceCheck the app skips all of this and sends an App Attest
// assertion from GET /ios/attestation_challenge instead. That path needs the app's signing
// identity, so this client uses the app's own fallback persona (Codex Browser).

import { randomUUID } from 'node:crypto'
import { CHROME_UA } from './http.js'

export const SENTINEL_HEADERS = {
  chatRequirementsPrepareToken: 'OpenAI-Sentinel-Chat-Requirements-Prepare-Token',
  chatRequirementsToken: 'OpenAI-Sentinel-Chat-Requirements-Token',
  proofToken: 'OpenAI-Sentinel-Proof-Token',
  turnstileToken: 'OpenAI-Sentinel-Turnstile-Token',
}

const b64 = (value) => Buffer.from(JSON.stringify(value), 'utf8').toString('base64')
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// lya(): FNV-1a 32-bit plus a murmur3 finalizer, printed as 8 hex chars
export function powHash(input) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 2246822507) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 3266489909) >>> 0
  h ^= h >>> 16
  return (h >>> 0).toString(16).padStart(8, '0')
}

// uya(): the fingerprint array. Slots 3 and 9 are placeholders the proof-of-work solver
// overwrites with the iteration counter and elapsed milliseconds.
export function fingerprint() {
  return [
    3600, // screen.width + screen.height
    String(new Date()),
    4294705152, // performance.memory.jsHeapSizeLimit
    Math.random(), // [3] <- counter
    CHROME_UA,
    'https://chatgpt.com/assets/root-index.js',
    'https://chatgpt.com/c/1234567890/_',
    'en-US',
    'en-US,en',
    Math.random(), // [9] <- elapsed ms
    'vendor−Google Inc.',
    pick(['location', 'cookie', 'referrer', 'title', 'body', 'head']),
    pick(['window', 'document', 'location', 'navigator', 'chrome', 'screen']),
    performance.now(),
    randomUUID(),
    '',
    8, // navigator.hardwareConcurrency
    performance.timeOrigin,
    0, // 'ai' in window
    0, // 'createPRNG' in window
    0, // 'cache' in window
    0, // 'data' in window
    0, // 'solana' in window
    0, // 'dump' in window
    0, // 'InstallTrigger' in window
  ]
}

// oya(): the `p` value posted to /sentinel/chat-requirements/prepare
export function requirementsKey() {
  const start = performance.now()
  const cfg = fingerprint()
  cfg[3] = 1
  cfg[9] = performance.now() - start
  return `gAAAAAC${b64(cfg)}`
}

// cya()/aya(): brute force the proof token against the server's seed + difficulty
export function solveProofOfWork(seed, difficulty) {
  const start = performance.now()
  const cfg = fingerprint()
  for (let i = 0; i < 500_000; i++) {
    cfg[3] = i
    cfg[9] = Math.round(performance.now() - start)
    const answer = b64(cfg)
    if (powHash(`${seed}${answer}`).substring(0, difficulty.length) <= difficulty) {
      return `gAAAAAB${answer}~S`
    }
  }
  return `gAAAAABwQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D${b64('e')}`
}

// iya(): the turnstile requirement carries a `dx` program XOR-encrypted with the same key we
// just sent. Run it either against the local BOM shim or inside a real headless Chrome.
export async function solveTurnstile(dx, key, solver = 'node') {
  if (solver === 'chrome') {
    const { solveInChrome } = await import('./chrome-solver.js')
    return solveInChrome(dx, key)
  }
  const { createTurnstileSolver } = await import('./turnstile.js')
  const { createWindow } = await import('./browser-env.js')
  return createTurnstileSolver({ window: createWindow() })(dx, key)
}

/**
 * tya(): run the whole integrity handshake and return the headers to attach to a turn.
 * `prepare` is any `(body) => Promise<requirements>` — normally the client's POST helper.
 */
export async function prepareIntegrity(prepare, { solver = 'node' } = {}) {
  const key = requirementsKey()
  const requirements = await prepare({ p: key })
  const headers = {}

  if (requirements?.turnstile?.required) {
    if (!requirements.turnstile.dx) throw new Error('Chat requirements requested legacy Turnstile without a VM payload.')
    headers[SENTINEL_HEADERS.turnstileToken] = await solveTurnstile(requirements.turnstile.dx, key, solver)
  }
  if (requirements?.token) headers[SENTINEL_HEADERS.chatRequirementsToken] = requirements.token
  else if (requirements?.prepare_token) headers[SENTINEL_HEADERS.chatRequirementsPrepareToken] = requirements.prepare_token

  const pow = requirements?.proofofwork
  if (pow?.required) {
    if (!pow.seed || !pow.difficulty) throw new Error('Proof of work required without seed/difficulty.')
    headers[SENTINEL_HEADERS.proofToken] = solveProofOfWork(pow.seed, pow.difficulty)
  }

  return { headers, requirements, requirementsKey: key }
}
