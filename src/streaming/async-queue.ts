import { QueueOverflowError } from '../errors.js'

interface Waiter<T> {
  resolve: (result: IteratorResult<T>) => void
  reject: (error: unknown) => void
}

export class AsyncQueue<T> implements AsyncIterable<T>, AsyncIterator<T> {
  readonly name: string
  readonly maxSize: number
  private readonly values: T[] = []
  private readonly waiters: Waiter<T>[] = []
  private closed = false
  private failure: unknown

  constructor(options: { name?: string; maxSize?: number } = {}) {
    this.name = options.name ?? 'async queue'
    this.maxSize = options.maxSize ?? 1_024
    if (!Number.isSafeInteger(this.maxSize) || this.maxSize < 1) throw new RangeError('maxSize must be a positive integer')
  }

  get size(): number {
    return this.values.length
  }

  push(value: T): void {
    if (this.closed) return
    const waiter = this.waiters.shift()
    if (waiter !== undefined) {
      waiter.resolve({ value, done: false })
      return
    }
    if (this.values.length >= this.maxSize) {
      this.fail(new QueueOverflowError(this.name, this.maxSize))
      return
    }
    this.values.push(value)
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    while (this.waiters.length > 0) this.waiters.shift()?.resolve({ value: undefined, done: true })
  }

  fail(error: unknown): void {
    if (this.closed) return
    this.failure = error
    this.closed = true
    this.values.length = 0
    while (this.waiters.length > 0) this.waiters.shift()?.reject(error)
  }

  next(): Promise<IteratorResult<T>> {
    if (this.values.length > 0) return Promise.resolve({ value: this.values.shift() as T, done: false })
    if (this.failure !== undefined) return Promise.reject(this.failure)
    if (this.closed) return Promise.resolve({ value: undefined, done: true })
    return new Promise<IteratorResult<T>>((resolve, reject) => this.waiters.push({ resolve, reject }))
  }

  return(): Promise<IteratorResult<T>> {
    this.close()
    return Promise.resolve({ value: undefined, done: true })
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this
  }
}
