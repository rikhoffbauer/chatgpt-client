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

## Documentation

- Author documentation under root `docs/`. Public end-user pages belong only in `docs/index.mdx`, `docs/getting-started/`, `docs/guides/`, `docs/reference/`, or `docs/project/`; keep internal plans, specs, research, and verification outside those public sections.
- Keep Starlight configuration, assets, scripts, and dependencies under `website/`.
- Update the relevant manual pages whenever behavior, configuration, commands, security boundaries, or supported workflows change.
- Treat `src/index.ts` as the public API boundary. Add useful JSDoc/TSDoc when adding or changing a public export.
- Regenerate TypeDoc API pages, Markdown mirrors, `llms.txt`, and `website/dist/`; edit their authored Markdown/MDX or TypeScript sources instead of generated output.
- Run `npm run docs:check` and `npm run docs:build` for documentation, navigation, plugin, or public API changes.
