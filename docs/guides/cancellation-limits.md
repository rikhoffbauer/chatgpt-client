---
title: Cancellation, deadlines, and resource limits
description: Bound client work with AbortSignal, finite deadlines, retries, parser caps, and transfer limits.
---

## Cancel an operation

```ts
const controller = new AbortController()
const timer = setTimeout(
  () => controller.abort(new Error('operation cancelled')),
  10_000,
)

try {
  for await (const event of client.send({
    text: 'Perform a long task.',
    signal: controller.signal,
  })) {
    if (event.type === 'delta') process.stdout.write(event.text)
  }
} finally {
  clearTimeout(timer)
}
```

You can also use `deadlineSignal(operation, timeoutMs, parentSignal)` when composing lower-level operations. Dispose its deadline when finished so its timer is released.

## Default bounds

The client provides finite defaults for request and connection timeouts, response bodies, stream lines/events, async queues, uploads, and downloads. Configure them through `ChatGPTClient` or the variables in [environment reference](../reference/environment/).

Automatic HTTP retries are bounded and enabled only for idempotent methods by default. A non-idempotent operation must explicitly opt in only when its endpoint provides suitable idempotency semantics.

## Failure behavior

Limit violations fail with typed errors such as `TimeoutError`, `QueueOverflowError`, or `ProtocolError`; they do not silently truncate data. Use `serializeError()` for safe structured CLI or service output.
