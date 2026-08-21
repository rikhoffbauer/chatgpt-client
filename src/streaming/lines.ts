import { ProtocolError } from '../errors.js'

/** Cancellation and per-line UTF-8 byte limit for {@link readLines}. */
export interface LineReaderOptions {
  maxLineBytes?: number
  signal?: AbortSignal
}

/** Iterates CRLF/LF text lines, cancels the reader on abort or failure, and rejects oversized lines. */
export async function* readLines(
  source: Response | ReadableStream<Uint8Array>,
  options: LineReaderOptions = {},
): AsyncGenerator<string> {
  const stream = source instanceof Response ? source.body : source
  if (stream === null) throw new ProtocolError('Response has no readable body', { code: 'MISSING_RESPONSE_BODY' })
  const maxLineBytes = options.maxLineBytes ?? 2 * 1024 * 1024
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false
  const onAbort = (): void => {
    void reader.cancel(options.signal?.reason).catch(() => undefined)
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })

  const assertWithinLimit = (): void => {
    if (Buffer.byteLength(buffer, 'utf8') > maxLineBytes) {
      throw new ProtocolError(`Stream line exceeded ${maxLineBytes} bytes`, {
        code: 'STREAM_LINE_TOO_LARGE',
        details: { maxLineBytes },
      })
    }
  }

  try {
    while (true) {
      options.signal?.throwIfAborted()
      const { done, value } = await reader.read()
      options.signal?.throwIfAborted()
      if (done) {
        completed = true
        break
      }
      buffer += decoder.decode(value, { stream: true })
      assertWithinLimit()
      let index = buffer.indexOf('\n')
      while (index !== -1) {
        const line = buffer.slice(0, index).replace(/\r$/, '')
        buffer = buffer.slice(index + 1)
        if (Buffer.byteLength(line, 'utf8') > maxLineBytes) {
          throw new ProtocolError(`Stream line exceeded ${maxLineBytes} bytes`, {
            code: 'STREAM_LINE_TOO_LARGE',
            details: { maxLineBytes },
          })
        }
        yield line
        index = buffer.indexOf('\n')
      }
    }
    buffer += decoder.decode()
    if (buffer.length > 0) {
      assertWithinLimit()
      yield buffer.replace(/\r$/, '')
    }
  } catch (error) {
    await reader.cancel(error).catch(() => undefined)
    throw error
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
    if (!completed) await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}
