import { TimeoutError } from './errors.js'

export interface Deadline {
  signal: AbortSignal
  cleanup(): void
}

export function deadlineSignal(operation: string, timeoutMs: number, parent?: AbortSignal): Deadline {
  const controller = new AbortController()
  let timer: NodeJS.Timeout | undefined
  let abortListener: (() => void) | undefined

  if (parent?.aborted === true) controller.abort(parent.reason)
  else if (parent !== undefined) {
    abortListener = () => controller.abort(parent.reason)
    parent.addEventListener('abort', abortListener, { once: true })
  }

  if (!controller.signal.aborted && timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(new TimeoutError(operation, timeoutMs)), timeoutMs)
  }

  return {
    signal: controller.signal,
    cleanup(): void {
      if (timer !== undefined) clearTimeout(timer)
      if (abortListener !== undefined) parent?.removeEventListener('abort', abortListener)
    },
  }
}

export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return
  signal?.throwIfAborted()
  await new Promise<void>((resolve, reject) => {
    const onAbort = (): void => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(signal?.reason)
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
