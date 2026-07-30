import { errorMessage, redactUrl } from './errors.js'
import type { JsonValue, UnknownRecord } from './types.js'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface Logger {
  debug(message: string, fields?: UnknownRecord): void
  info(message: string, fields?: UnknownRecord): void
  warn(message: string, fields?: UnknownRecord): void
  error(message: string, fields?: UnknownRecord): void
}

export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
}

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: Number.POSITIVE_INFINITY,
}

function sanitize(value: unknown, key = ''): JsonValue {
  if (/authorization|token|secret|password|cookie|credential/i.test(key)) return '[REDACTED]'
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return typeof value === 'string' && /url$/i.test(key) ? redactUrl(value) : value
  }
  if (value instanceof Error) return { name: value.name, message: value.message }
  if (Array.isArray(value)) return value.map((item) => sanitize(item))
  if (typeof value === 'object') {
    const result: Record<string, JsonValue> = {}
    for (const [childKey, childValue] of Object.entries(value)) result[childKey] = sanitize(childValue, childKey)
    return result
  }
  return String(value)
}

export class ConsoleLogger implements Logger {
  readonly level: LogLevel
  readonly json: boolean

  constructor(options: { level?: LogLevel; json?: boolean } = {}) {
    this.level = options.level ?? 'info'
    this.json = options.json ?? false
  }

  debug(message: string, fields?: UnknownRecord): void {
    this.write('debug', message, fields)
  }

  info(message: string, fields?: UnknownRecord): void {
    this.write('info', message, fields)
  }

  warn(message: string, fields?: UnknownRecord): void {
    this.write('warn', message, fields)
  }

  error(message: string, fields?: UnknownRecord): void {
    this.write('error', message, fields)
  }

  private write(level: Exclude<LogLevel, 'silent'>, message: string, fields?: UnknownRecord): void {
    if (LEVELS[level] < LEVELS[this.level]) return
    const sanitized = fields === undefined ? undefined : sanitize(fields)
    if (this.json) {
      process.stderr.write(`${JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...(sanitized === undefined ? {} : { fields: sanitized }) })}\n`)
      return
    }
    const suffix = sanitized === undefined ? '' : ` ${JSON.stringify(sanitized)}`
    process.stderr.write(`[${level}] ${message}${suffix}\n`)
  }
}

export function logError(logger: Logger, message: string, error: unknown, fields: UnknownRecord = {}): void {
  logger.error(message, { ...fields, error: errorMessage(error) })
}
