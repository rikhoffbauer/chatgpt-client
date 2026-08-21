import { TimeoutError } from './errors.js'

/** A composed timeout/parent signal. Always call {@link Deadline.cleanup} when the operation finishes. */
export interface Deadline {
  signal: AbortSignal
  cleanup(): void
}

/** Creates an abort signal that inherits a parent signal and aborts with {@link TimeoutError} after a finite timeout. */
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

/** Waits for the requested delay, rejecting immediately or during the wait when `signal` aborts. */
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
