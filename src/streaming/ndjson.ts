import { ProtocolError } from '../errors.js'
import type { JsonValue } from '../types.js'
import { readLines, type LineReaderOptions } from './lines.js'

export interface NdjsonOptions extends LineReaderOptions {
  strict?: boolean
}

export type NdjsonRecord = JsonValue | { raw: string }

export async function* ndjson(response: Response, options: NdjsonOptions = {}): AsyncGenerator<NdjsonRecord> {
  for await (const line of readLines(response, options)) {
    const trimmed = line.trim()
    if (trimmed === '') continue
    try {
      yield JSON.parse(trimmed) as JsonValue
    } catch (error) {
      if (options.strict === true) {
        throw new ProtocolError('Invalid NDJSON record', {
          code: 'INVALID_NDJSON',
          cause: error,
          details: { preview: trimmed.slice(0, 256) },
        })
      }
      yield { raw: trimmed }
    }
  }
}
