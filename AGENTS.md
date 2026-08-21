# Agent instructions

## Goal

Maintain a small, dependency-free runtime client with strict TypeScript and explicit resource bounds.

## Required checks

Run before committing:

```sh
npm config get registry
npm run verify
```

Use `./scripts/fix-bun-npm-registry.sh -- <bun arguments>` when the effective npm registry is a nested URL without a trailing slash.

## Invariants

1. No `@ts-ignore`, `@ts-nocheck`, implicit `any`, or silent catch-and-continue fallbacks.
2. Every network/process operation has cancellation or a finite deadline.
3. Every queue, parser, buffered response, upload, and download has a finite limit.
4. Never forward ChatGPT auth/account headers to external signed URLs.
5. Retry only idempotent operations unless an endpoint has explicit idempotency semantics.
6. Keep unstable integrity/browser code isolated under `src/protocol/`.
7. Add an offline regression test for every corrected bug.

## Style

- Bun + TypeScript is the preferred development workflow.
- Node.js 22 is the portability baseline.
- Use ESM and `.js` import specifiers in TypeScript source.
- Prefer narrow typed errors with stable error codes.
- Use conventional commits.
