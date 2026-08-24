import { randomUUID } from 'node:crypto'
import { ProtocolError } from '../errors.js'
import { CHROME_UA } from '../http.js'
import type { HeaderInput, IntegritySolver, UnknownRecord } from '../types.js'

export const SENTINEL_HEADERS = {
  chatRequirementsPrepareToken: 'OpenAI-Sentinel-Chat-Requirements-Prepare-Token',
  chatRequirementsToken: 'OpenAI-Sentinel-Chat-Requirements-Token',
  proofToken: 'OpenAI-Sentinel-Proof-Token',
  turnstileToken: 'OpenAI-Sentinel-Turnstile-Token',
} as const

export interface ProofOfWorkRequirement {
  required?: boolean
  seed?: string
  difficulty?: string
}

export interface TurnstileRequirement {
  required?: boolean
  dx?: string
}

export interface ChatRequirements extends UnknownRecord {
  token?: string
  prepare_token?: string
  proofofwork?: ProofOfWorkRequirement
  turnstile?: TurnstileRequirement
}

export type PrepareRequirements = (body: { p: string }) => Promise<unknown>

export interface IntegrityResult {
  headers: HeaderInput
  requirements: ChatRequirements
  requirementsKey: string
}

export interface PrepareIntegrityOptions {
  solver?: IntegritySolver
  signal?: AbortSignal
  maxProofIterations?: number
}

const encodeJsonBase64 = (value: unknown): string => Buffer.from(JSON.stringify(value), 'utf8').toString('base64')

export function powHash(input: string): string {
  let hash = 2_166_136_261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619) >>> 0
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 2_246_822_507) >>> 0
  hash ^= hash >>> 13
  hash = Math.imul(hash, 3_266_489_909) >>> 0
  hash ^= hash >>> 16
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function fingerprint(): unknown[] {
  return [
    3_600,
    String(new Date()),
    4_294_705_152,
    Math.random(),
    CHROME_UA,
    'https://chatgpt.com/assets/root-index.js',
    'https://chatgpt.com/c/1234567890/_',
    'en-US',
    'en-US,en',
    Math.random(),
    'vendor−Google Inc.',
    pick(['location', 'cookie', 'referrer', 'title', 'body', 'head']),
    pick(['window', 'document', 'location', 'navigator', 'chrome', 'screen']),
    performance.now(),
    randomUUID(),
    '',
    8,
    performance.timeOrigin,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]
}

export function requirementsKey(): string {
  const start = performance.now()
  const config = fingerprint()
  config[3] = 1
  config[9] = performance.now() - start
  return `gAAAAAC${encodeJsonBase64(config)}`
}

export function solveProofOfWork(
  seed: string,
  difficulty: string,
  options: { maxIterations?: number; signal?: AbortSignal } = {},
): string {
  if (seed === '' || difficulty === '') throw new ProtocolError('Proof-of-work seed and difficulty cannot be empty', { code: 'INVALID_PROOF_OF_WORK' })
  const maxIterations = options.maxIterations ?? 500_000
  const start = performance.now()
  const config = fingerprint()
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    if ((iteration & 1_023) === 0) options.signal?.throwIfAborted()
    config[3] = iteration
    config[9] = Math.round(performance.now() - start)
    const answer = encodeJsonBase64(config)
    if (powHash(`${seed}${answer}`).slice(0, difficulty.length) <= difficulty) return `gAAAAAB${answer}~S`
  }
  throw new ProtocolError(`Proof-of-work solution was not found within ${maxIterations} iterations`, {
    code: 'PROOF_OF_WORK_EXHAUSTED',
    details: { maxIterations },
  })
}

export async function solveTurnstile(
  dx: string,
  key: string,
  solver: IntegritySolver = 'node',
  options: { signal?: AbortSignal } = {},
): Promise<string> {
  options.signal?.throwIfAborted()
  if (solver === 'chrome') {
    const { solveInChrome } = await import('./chrome-solver.js')
    return solveInChrome(dx, key, options)
  }
  const [{ createTurnstileSolver }, { createWindow }] = await Promise.all([
    import('./turnstile.js'),
    import('./browser-env.js'),
  ])
  return createTurnstileSolver({ window: createWindow() })(dx, key)
}

export async function prepareIntegrity(
  prepare: PrepareRequirements,
  options: PrepareIntegrityOptions = {},
): Promise<IntegrityResult> {
  options.signal?.throwIfAborted()
  const key = requirementsKey()
  const value = await prepare({ p: key })
  const requirements = normalizeRequirements(value)
  const headers: HeaderInput = {}

  if (requirements.turnstile?.required === true) {
    if (typeof requirements.turnstile.dx !== 'string' || requirements.turnstile.dx === '') {
      throw new ProtocolError('Chat requirements requested Turnstile without a VM payload', { code: 'TURNSTILE_PAYLOAD_MISSING' })
    }
    headers[SENTINEL_HEADERS.turnstileToken] = await solveTurnstile(
      requirements.turnstile.dx,
      key,
      options.solver ?? 'node',
      options.signal === undefined ? {} : { signal: options.signal },
    )
  }

  if (typeof requirements.token === 'string' && requirements.token !== '') {
    headers[SENTINEL_HEADERS.chatRequirementsToken] = requirements.token
  } else if (typeof requirements.prepare_token === 'string' && requirements.prepare_token !== '') {
    headers[SENTINEL_HEADERS.chatRequirementsPrepareToken] = requirements.prepare_token
  }

  if (requirements.proofofwork?.required === true) {
    const { seed, difficulty } = requirements.proofofwork
    if (typeof seed !== 'string' || seed === '' || typeof difficulty !== 'string' || difficulty === '') {
      throw new ProtocolError('Proof of work was required without seed/difficulty', { code: 'PROOF_OF_WORK_PARAMETERS_MISSING' })
    }
    headers[SENTINEL_HEADERS.proofToken] = solveProofOfWork(seed, difficulty, {
      maxIterations: options.maxProofIterations,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
  }

  return { headers, requirements, requirementsKey: key }
}

function normalizeRequirements(value: unknown): ChatRequirements {
  if (!isRecord(value)) throw new ProtocolError('Chat requirements response is not an object', { code: 'INVALID_REQUIREMENTS_RESPONSE' })
  return value as ChatRequirements
}

function pick<T>(values: readonly T[]): T {
  const value = values[Math.floor(Math.random() * values.length)]
  if (value === undefined) throw new RangeError('Cannot pick from an empty array')
  return value
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
