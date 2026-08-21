import { ProtocolError } from '../errors.js'
import { readLines } from './lines.js'

export interface SseEvent {
  event: string | null
  data: string
  id: string | null
  retry: number | null
}

export interface SseOptions {
  maxLineBytes?: number
  maxEventBytes?: number
  signal?: AbortSignal
}

export async function* sseEvents(response: Response, options: SseOptions = {}): AsyncGenerator<SseEvent> {
  const maxEventBytes = options.maxEventBytes ?? 8 * 1024 * 1024
  let event: string | null = null
  let id: string | null = null
  let retry: number | null = null
  let data: string[] = []
  let bytes = 0

  const reset = (): void => {
    event = null
    retry = null
    data = []
    bytes = 0
  }

  for await (const line of readLines(response, options)) {
    if (line === '') {
      if (data.length > 0) yield { event, data: data.join('\n'), id, retry }
      reset()
      continue
    }
    if (line.startsWith(':')) continue

    const colon = line.indexOf(':')
    const field = colon === -1 ? line : line.slice(0, colon)
    let value = colon === -1 ? '' : line.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)

    bytes += Buffer.byteLength(line, 'utf8')
    if (bytes > maxEventBytes) {
      throw new ProtocolError(`SSE event exceeded ${maxEventBytes} bytes`, {
        code: 'SSE_EVENT_TOO_LARGE',
        details: { maxEventBytes },
      })
    }

    switch (field) {
      case 'event':
        event = value
        break
      case 'data':
        data.push(value)
        break
      case 'id':
        if (!value.includes('\0')) id = value
        break
      case 'retry': {
        const parsed = Number(value)
        if (Number.isSafeInteger(parsed) && parsed >= 0) retry = parsed
        break
      }
      default:
        break
    }
  }

  if (data.length > 0) yield { event, data: data.join('\n'), id, retry }
}
