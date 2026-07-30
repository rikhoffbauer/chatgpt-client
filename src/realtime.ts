// @ts-nocheck
// WebSocket surfaces: the conversation push channel and the dictation stream.
// Uses Node 22's global WebSocket, so there are still no dependencies.

/**
 * Conversation push channel.
 *
 * GET /celsius/ws/user returns a pre-signed `websocket_url`. The app opens it and receives
 * the same turn events it would otherwise get over SSE, which is how a turn started on one
 * device keeps streaming on another. Messages arrive as `{type, body}` where `body` is a
 * base64-encoded SSE payload for conversation traffic.
 */
export async function openConversationSocket(client, { onMessage, onError, onClose } = {}) {
  const { websocket_url: url } = await client.getConversationWebSocketUrl()
  if (!url) throw new Error('No websocket_url returned by /celsius/ws/user')

  const ws = new WebSocket(url)
  const queue = []
  let resolveNext = null
  let closed = false

  const push = (value) => {
    if (resolveNext) {
      resolveNext(value)
      resolveNext = null
    } else {
      queue.push(value)
    }
  }

  ws.addEventListener('message', (ev) => {
    let payload = ev.data
    try {
      payload = JSON.parse(ev.data)
    } catch {
      /* keep as text */
    }
    // conversation frames wrap a base64 SSE body
    if (payload && typeof payload === 'object' && typeof payload.body === 'string') {
      try {
        payload = { ...payload, decoded: Buffer.from(payload.body, 'base64').toString('utf8') }
      } catch {
        /* not base64 */
      }
    }
    onMessage?.(payload)
    push(payload)
  })
  ws.addEventListener('error', (ev) => onError?.(ev))
  ws.addEventListener('close', () => {
    closed = true
    onClose?.()
    push(null)
  })

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  return {
    socket: ws,
    close: () => ws.close(),
    async *messages() {
      while (!closed || queue.length) {
        const next = queue.length ? queue.shift() : await new Promise((r) => (resolveNext = r))
        if (next === null) return
        yield next
      }
    },
  }
}

// app-initial-*.js : the dictation session bootstrap
export const DICTATION_SESSION_CONFIG = (sampleRateHz = 24000) => ({
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

/**
 * Dictation (speech-to-text) stream.
 *
 * POST /codex/dictation-stream-connect-info returns the socket URL; the app authenticates with
 * the `openai-bearer.<token>` subprotocol rather than a header, because browsers cannot set
 * headers on a WebSocket handshake. Feed it raw PCM16 frames with `sendAudio`.
 */
export async function openDictationStream(client, { sampleRateHz = 24000, onTranscript, onEvent } = {}) {
  const info = await client.getDictationConnectInfo()
  const url = info?.url ?? info?.websocket_url ?? info?.connect_url
  if (!url) throw new Error(`No dictation url in /codex/dictation-stream-connect-info response: ${JSON.stringify(info)}`)

  const protocols = ['chatgpt-dictation', `openai-bearer.${client.auth.accessToken}`]
  const ws = new WebSocket(url, protocols)

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  ws.addEventListener('message', (ev) => {
    let payload = ev.data
    try {
      payload = JSON.parse(ev.data)
    } catch {
      /* binary or text */
    }
    onEvent?.(payload)
    const text = payload?.transcript ?? payload?.text
    if (text && onTranscript) onTranscript(text, payload)
  })

  ws.send(JSON.stringify(DICTATION_SESSION_CONFIG(sampleRateHz)))

  return {
    socket: ws,
    /** @param {Uint8Array} pcm16 little-endian mono samples at `sampleRateHz` */
    sendAudio: (pcm16) => ws.send(pcm16),
    commit: () => ws.send(JSON.stringify({ type: 'session.commit' })),
    stop: () => {
      try {
        ws.send(JSON.stringify({ type: 'session.stop' }))
      } finally {
        ws.close()
      }
    },
  }
}
