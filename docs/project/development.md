---
title: Development and verification
description: Build, test, document, and verify the project with its supported Node and Bun workflows.
---

## Runtime checks

```sh
npm config get registry
npm run verify
```

`verify` performs strict type checking, a clean build, and the offline Node test suite. Bun is the preferred development workflow, while Node.js 22 is the portability baseline.

## Documentation checks

Authored end-user pages live under the public sections of root `docs/`; the Starlight app and dependencies live under `website/`.

```sh
npm run docs:dev
npm run docs:check
npm run docs:build
npm run docs:serve
```

The build generates TypeDoc pages from `src/index.ts`, Markdown mirrors, `llms.txt`, and the static site under `website/dist/`. Edit authored sources and JSDoc instead of generated output.

Before committing documentation changes, run `npm run docs:check`, `npm run docs:build`, and `npm run verify`. GitHub Pages deployment derives its base path or custom-domain root from Pages configuration.
