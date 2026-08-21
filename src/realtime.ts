import { deadlineSignal } from './abort.js'
import type { ChatGPTClient } from './client.js'
import { ProtocolError } from './errors.js'
import { AsyncQueue } from './streaming/async-queue.js'
import type { JsonValue, UnknownRecord } from './types.js'

/** Callback, cancellation, finite connection timeout, and bounded message queue options. */
export interface ConversationSocketOptions {
  onMessage?: (message: unknown) => void
  onError?: (error: unknown) => void
  onClose?: (event: CloseEvent) => void
  signal?: AbortSignal
  connectTimeoutMs?: number
  queueSize?: number
}

/** Owned conversation WebSocket and bounded async message iterator; call `close()` when finished. */
export interface ConversationSocket {
  socket: WebSocket
  close(code?: number, reason?: string): void
  messages(): AsyncIterable<unknown>
}

/** Opens the private conversation realtime channel with a finite handshake deadline and bounded queue. */
export async function openConversationSocket(
  client: ChatGPTClient,
  options: ConversationSocketOptions = {},
): Promise<ConversationSocket> {
  const value = await client.call('getConversationWebSocketUrl', {}, { signal: options.signal })
  const url = isRecord(value) && typeof value.websocket_url === 'string' ? value.websocket_url : null
  if (url === null) throw new ProtocolError('No websocket_url returned by /celsius/ws/user', { code: 'WEBSOCKET_URL_MISSING' })

  const socket = new WebSocket(url)
  const queue = new AsyncQueue<unknown>({
    name: 'conversation WebSocket messages',
    maxSize: options.queueSize ?? client.http.config.limits.queueSize,
  })
  const deadline = deadlineSignal('Conversation WebSocket connection', options.connectTimeoutMs ?? client.http.config.limits.connectTimeoutMs, options.signal)

  const onMessage = (event: MessageEvent): void => {
    void decodeWebSocketData(event.data).then((raw) => {
      let payload: unknown = raw
      if (typeof raw === 'string') {
        try {
          payload = JSON.parse(raw) as unknown
        } catch {
          payload = raw
        }
      }
      if (isRecord(payload) && typeof payload.body === 'string') {
        try {
          payload = { ...payload, decoded: Buffer.from(payload.body, 'base64').toString('utf8') }
        } catch {
          // Keep the original payload when the body is not valid base64.
        }
      }
      options.onMessage?.(payload)
      queue.push(payload)
    }).catch((error: unknown) => queue.fail(error))
  }
  const onError = (): void => {
    const error = new ProtocolError('Conversation WebSocket error', { code: 'WEBSOCKET_ERROR' })
    options.onError?.(error)
    queue.fail(error)
  }
  const onClose = (event: CloseEvent): void => {
    options.onClose?.(event)
    queue.close()
  }
  const onAbort = (): void => {
    queue.fail(options.signal?.reason)
    socket.close(1_000, 'aborted')
  }

  socket.addEventListener('message', onMessage)
  socket.addEventListener('error', onError)
  socket.addEventListener('close', onClose)
  options.signal?.addEventListener('abort', onAbort, { once: true })

  try {
    await new Promise<void>((resolve, reject) => {
      const open = (): void => resolve()
      const error = (): void => reject(new ProtocolError('Conversation WebSocket failed to open', { code: 'WEBSOCKET_CONNECT_FAILED' }))
      const abort = (): void => reject(deadline.signal.reason)
      socket.addEventListener('open', open, { once: true })
      socket.addEventListener('error', error, { once: true })
      deadline.signal.addEventListener('abort', abort, { once: true })
    })
  } catch (error) {
    socket.close()
    queue.fail(error)
    throw error
  } finally {
    deadline.cleanup()
  }

  return {
    socket,
    close(code, reason): void {
      socket.removeEventListener('message', onMessage)
      socket.removeEventListener('error', onError)
      socket.removeEventListener('close', onClose)
      options.signal?.removeEventListener('abort', onAbort)
      queue.close()
      socket.close(code, reason)
    },
    messages(): AsyncIterable<unknown> {
      return queue
    },
  }
}

/** Builds the finite-buffer, finite-duration PCM16 dictation session configuration. */
export const DICTATION_SESSION_CONFIG = (sampleRateHz = 24_000): UnknownRecord => ({
  type: 'session.start',
  config: {
    input_audio_format: 'pcm16',
    sample_rate_hz: sampleRateHz,
    num_channels: 1,
    max_buffer_size_bytes: 4 * 1024 * 1024,
    max_utterance_duration_ms: 30_000,
    session_ttl_ms: 300_000,
    provider_mode: 'streaming_sse',
    transcript_delivery_mode: 'final_only',
    vad: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 },
  },
})

/** Audio rate, callbacks, cancellation, and finite connection timeout for dictation. */
export interface DictationOptions {
  sampleRateHz?: number
  onTranscript?: (text: string, event: unknown) => void
  onEvent?: (event: unknown) => void
  signal?: AbortSignal
  connectTimeoutMs?: number
}

/** Owned PCM16 dictation stream; call `stop()` to end the session and close its socket. */
export interface DictationStream {
  socket: WebSocket
  sendAudio(pcm16: Uint8Array): void
  commit(): void
  stop(): void
}

/** Opens a dictation WebSocket, validates sample rate, and applies a finite handshake deadline. */
export async function openDictationStream(client: ChatGPTClient, options: DictationOptions = {}): Promise<DictationStream> {
  const sampleRateHz = options.sampleRateHz ?? 24_000
  if (!Number.isSafeInteger(sampleRateHz) || sampleRateHz < 8_000 || sampleRateHz > 96_000) {
    throw new RangeError('sampleRateHz must be an integer between 8000 and 96000')
  }
  const info = await client.call('getDictationConnectInfo', {}, { signal: options.signal })
  const url = isRecord(info)
    ? [info.url, info.websocket_url, info.connect_url].find((candidate): candidate is string => typeof candidate === 'string' && candidate !== '')
    : undefined
  if (url === undefined) throw new ProtocolError('Dictation connect response did not contain a WebSocket URL', { code: 'DICTATION_URL_MISSING' })

  const protocols = ['chatgpt-dictation', `openai-bearer.${client.auth.accessToken}`]
  const socket = new WebSocket(url, protocols)
  const deadline = deadlineSignal('Dictation WebSocket connection', options.connectTimeoutMs ?? client.http.config.limits.connectTimeoutMs, options.signal)
  const onAbort = (): void => socket.close(1_000, 'aborted')
  options.signal?.addEventListener('abort', onAbort, { once: true })

  try {
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true })
      socket.addEventListener('error', () => reject(new ProtocolError('Dictation WebSocket failed to open', { code: 'DICTATION_CONNECT_FAILED' })), { once: true })
      deadline.signal.addEventListener('abort', () => reject(deadline.signal.reason), { once: true })
    })
  } catch (error) {
    socket.close()
    throw error
  } finally {
    deadline.cleanup()
  }

  socket.addEventListener('message', (event) => {
    void decodeWebSocketData(event.data).then((raw) => {
      let payload: unknown = raw
      if (typeof raw === 'string') {
        try {
          payload = JSON.parse(raw) as JsonValue
        } catch {
          payload = raw
        }
      }
      options.onEvent?.(payload)
      if (isRecord(payload)) {
        const text = typeof payload.transcript === 'string' ? payload.transcript : typeof payload.text === 'string' ? payload.text : null
        if (text !== null) options.onTranscript?.(text, payload)
      }
    }).catch(() => undefined)
  })
  socket.send(JSON.stringify(DICTATION_SESSION_CONFIG(sampleRateHz)))

  return {
    socket,
    sendAudio(pcm16): void {
      if (socket.readyState !== WebSocket.OPEN) throw new ProtocolError('Dictation WebSocket is not open', { code: 'DICTATION_NOT_OPEN' })
      socket.send(pcm16)
    },
    commit(): void {
      socket.send(JSON.stringify({ type: 'session.commit' }))
    },
    stop(): void {
      options.signal?.removeEventListener('abort', onAbort)
      try {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'session.stop' }))
      } finally {
        socket.close()
      }
    },
  }
}

async function decodeWebSocketData(data: unknown): Promise<string | ArrayBuffer> {
  if (typeof data === 'string' || data instanceof ArrayBuffer) return data
  if (data instanceof Blob) return data.arrayBuffer()
  if (ArrayBuffer.isView(data)) return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  return String(data)
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
