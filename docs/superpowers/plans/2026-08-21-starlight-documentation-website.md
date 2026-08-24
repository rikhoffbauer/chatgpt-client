# Starlight Documentation Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Starlight documentation site whose authored content lives under root `docs/`, whose application lives under `website/`, and whose API reference is generated from public TypeScript declarations and JSDoc/TSDoc.

**Architecture:** A standalone Astro/Starlight app in `website/` uses Astro's glob content loader with an explicit allowlist rooted at `../docs`. Starlight plugins generate TypeDoc API pages, LLM text, Markdown mirrors, copy buttons, and link validation. Pure Node helpers enforce the publication boundary and resolve GitHub Pages URLs so both default project sites and custom domains build correctly.

**Tech Stack:** Node.js 22, npm, TypeScript 5.8, Astro, Starlight, TypeDoc, Node's built-in test runner, GitHub Actions, GitHub Pages.

## Global Constraints

- Keep every authored project document under root `docs/`.
- Keep Starlight application code, configuration, and dependencies under root `website/`.
- Publish only `docs/index.mdx`, `docs/getting-started/**`, `docs/guides/**`, `docs/reference/**`, and `docs/project/**`.
- Exclude `docs/superpowers/**` and every non-allowlisted document by default.
- Generate API reference pages from root `src/index.ts` and source JSDoc/TSDoc.
- Use exactly the approved plugins: `starlight-typedoc`, `starlight-llms-txt`, `starlight-dot-md`, `starlight-copy-button`, and `starlight-links-validator`.
- Preserve the dependency-free runtime package; documentation dependencies belong to `website/package.json` only.
- Support Node.js 22 and ESM.
- Preserve strict TypeScript and do not add suppression directives or implicit `any`.
- Documentation builds must be offline with respect to ChatGPT/Codex services and must not access credentials.
- Do not modify the user's pre-existing uncommitted `package.json` and `bun.lock` changes except for the narrowly required root documentation scripts; inspect and preserve their intent.

---

## File map

### Website application

- `website/package.json`: documentation dependencies and local Astro commands.
- `website/package-lock.json`: reproducible documentation dependency installation.
- `website/astro.config.mjs`: Starlight, plugins, sidebar, site/base URL configuration.
- `website/tsconfig.json`: Astro strict TypeScript configuration.
- `website/src/content.config.ts`: explicit allowlisted loader for root `docs/`.
- `website/src/lib/public-docs.mjs`: one source of truth for public documentation patterns and boundary validation.
- `website/src/lib/pages-url.mjs`: pure canonical site/base resolver.
- `website/scripts/check-public-docs.mjs`: CLI boundary check used by `docs:check`.
- `website/test/public-docs.test.mjs`: boundary tests.
- `website/test/pages-url.test.mjs`: default/custom GitHub Pages URL tests.
- `website/public/`: static assets only; no authored documentation.

### Authored public documentation

- `docs/index.mdx`: landing page.
- `docs/getting-started/installation.md`: requirements and installation.
- `docs/getting-started/library-quick-start.md`: first library request.
- `docs/getting-started/cli-quick-start.md`: first CLI operations.
- `docs/guides/authentication-configuration.md`: auth store and configuration.
- `docs/guides/conversations-streaming.md`: sending and consuming events.
- `docs/guides/files.md`: bounded upload/download workflows.
- `docs/guides/app-server.md`: local Codex JSON-RPC lifecycle.
- `docs/guides/cancellation-limits.md`: signals, deadlines, retry policy, and limits.
- `docs/reference/cli.md`: command reference.
- `docs/reference/environment.md`: environment variables and defaults.
- `docs/project/architecture.md`: end-user/contributor architecture.
- `docs/project/security.md`: security and operational boundaries.
- `docs/project/development.md`: contributor commands and verification.

### Package/API documentation

- `src/abort.ts`, `src/appserver.ts`, `src/auth.ts`, `src/client.ts`, `src/config.ts`: primary public API comments.
- `src/errors.ts`, `src/http.ts`, `src/logger.ts`, `src/realtime.ts`, `src/route-api.ts`, `src/routes.ts`: transport and facade API comments.
- `src/streaming/*.ts`, `src/protocol/*.ts`, `src/types.ts`: low-level public API comments.

### Repository integration

- `test/docs-site.test.ts`: offline repository contract test.
- `package.json`: root `docs:*` delegation scripts.
- `.gitignore`: generated website outputs and caches.
- `.github/workflows/docs.yml`: GitHub Pages build and deployment.
- `AGENTS.md`: documentation maintenance instructions.
- `README.md`: concise link to the documentation site/deployment.

---

### Task 1: Lock down the documentation boundary and URL contract

**Files:**
- Create: `website/src/lib/public-docs.mjs`
- Create: `website/src/lib/pages-url.mjs`
- Create: `website/scripts/check-public-docs.mjs`
- Create: `website/test/public-docs.test.mjs`
- Create: `website/test/pages-url.test.mjs`
- Create: `test/docs-site.test.ts`

**Interfaces:**
- Produces: `PUBLIC_DOC_PATTERNS: readonly string[]` with the exact five approved patterns.
- Produces: `isPublicDoc(relativePath: string): boolean` using POSIX-style relative paths.
- Produces: `assertPublicDocsBoundary(repoRoot: string): Promise<void>` that rejects on symlinks escaping `docs/`, missing public entry content, or an internal path admitted by the allowlist.
- Produces: `resolvePagesUrl(publicUrl?: string): { site: string; base: string }`.
- Consumes: only Node built-ins; no Astro dependency.

- [ ] **Step 1: Write boundary tests before the helper exists**

Create `website/test/public-docs.test.mjs` with Node tests that import the wished-for API and assert:

```js
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { PUBLIC_DOC_PATTERNS, assertPublicDocsBoundary, isPublicDoc } from '../src/lib/public-docs.mjs'

test('publishes only explicitly approved documentation sections', () => {
  assert.deepEqual(PUBLIC_DOC_PATTERNS, [
    'index.mdx',
    'getting-started/**/*.{md,mdx}',
    'guides/**/*.{md,mdx}',
    'reference/**/*.{md,mdx}',
    'project/**/*.{md,mdx}',
  ])
  assert.equal(isPublicDoc('index.mdx'), true)
  assert.equal(isPublicDoc('guides/files.md'), true)
  assert.equal(isPublicDoc('superpowers/plans/internal.md'), false)
  assert.equal(isPublicDoc('verification.md'), false)
})

test('rejects a public document symlink that escapes docs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'chatgpt-docs-'))
  await mkdir(join(root, 'docs', 'guides'), { recursive: true })
  await writeFile(join(root, 'outside.md'), '# secret')
  await symlink(join(root, 'outside.md'), join(root, 'docs', 'guides', 'escape.md'))
  await assert.rejects(assertPublicDocsBoundary(root), /escapes docs/)
})
```

- [ ] **Step 2: Write URL resolution tests before the helper exists**

Create `website/test/pages-url.test.mjs` with these exact cases:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePagesUrl } from '../src/lib/pages-url.mjs'

test('uses localhost defaults for local builds', () => {
  assert.deepEqual(resolvePagesUrl(), { site: 'http://localhost', base: '/' })
})

test('splits a default project Pages URL into origin and base', () => {
  assert.deepEqual(resolvePagesUrl('https://owner.github.io/chatgpt-client/'), {
    site: 'https://owner.github.io',
    base: '/chatgpt-client/',
  })
})

test('uses root base for a custom domain', () => {
  assert.deepEqual(resolvePagesUrl('https://docs.example.com/'), {
    site: 'https://docs.example.com',
    base: '/',
  })
})

test('rejects non-http deployment URLs', () => {
  assert.throws(() => resolvePagesUrl('file:///tmp/site'), /http/)
})
```

- [ ] **Step 3: Write the root repository contract test**

Create `test/docs-site.test.ts` using `node:test`, `node:assert/strict`, and `node:fs/promises`. Assert that:

- root `package.json` defines `docs:dev`, `docs:check`, `docs:build`, and `docs:serve` delegated with `npm --prefix website run ...`;
- `website/package.json` lists exactly the five approved Starlight plugins among its dev dependencies;
- `website/src/content.config.ts` imports `PUBLIC_DOC_PATTERNS` and uses `base: '../docs'`;
- `website/astro.config.mjs` references `../src/index.ts` for TypeDoc;
- `.github/workflows/docs.yml` contains `configure-pages`, `upload-pages-artifact`, and `deploy-pages`;
- internal marker text from `docs/superpowers/specs/2026-08-21-starlight-documentation-website-design.md` is absent from `website/dist` after a build, when that directory exists.

Keep the test behavioral: parse JSON for package assertions and use exact path/config markers only where no public parser is available.

- [ ] **Step 4: Run the new tests and verify RED**

Run:

```sh
node --test website/test/*.test.mjs
npm run test:node
```

Expected: the website tests fail with `ERR_MODULE_NOT_FOUND`, and the root test fails because the documentation scripts/configuration do not exist. Confirm failures are due to the missing feature, not syntax errors.

- [ ] **Step 5: Implement the pure helpers and CLI**

Implement `public-docs.mjs` with a frozen pattern array, normalized slash handling, exact top-level admission, recursive file enumeration with `lstat`/`realpath`, and a check that every admitted file resolves inside `<repo>/docs`. The helper must reject rather than silently skip an escaping symlink. Implement `check-public-docs.mjs` to resolve the repository root from `import.meta.url`, await the assertion, print one success line, and set a nonzero exit code on error.

Implement `pages-url.mjs` by parsing `PUBLIC_SITE_URL` as `URL`, allowing only HTTP(S), stripping query/hash, normalizing the pathname to a leading and trailing slash, and returning the origin separately from the base path.

- [ ] **Step 6: Run helper tests and verify GREEN**

Run: `node --test website/test/*.test.mjs`

Expected: all boundary and URL tests pass. The root repository test remains red until site scaffolding is added.

- [ ] **Step 7: Commit the contract slice**

```sh
git add website/src/lib website/scripts website/test test/docs-site.test.ts
git commit -m "test: define documentation site contract"
```

---

### Task 2: Scaffold Starlight with the approved plugins

**Files:**
- Create: `website/package.json`
- Create: `website/package-lock.json`
- Create: `website/astro.config.mjs`
- Create: `website/tsconfig.json`
- Create: `website/src/content.config.ts`
- Create: `website/public/.gitkeep`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `PUBLIC_DOC_PATTERNS` and `resolvePagesUrl` from Task 1.
- Produces: root commands `docs:dev`, `docs:check`, `docs:build`, and `docs:serve`.
- Produces: Astro `docs` content collection loaded from root `docs/`.
- Produces: static output at `website/dist/`.

- [ ] **Step 1: Inspect and preserve existing uncommitted package changes**

Run `git diff -- package.json bun.lock` and record which lines predate this implementation. Add only the four `docs:*` scripts to root `package.json`; do not remove the existing `serve` dependency or rewrite `bun.lock` as part of documentation dependency installation.

- [ ] **Step 2: Create the documentation package and install exact resolved dependencies**

Create `website/package.json` as a private ESM package with scripts:

```json
{
  "name": "chatgpt-client-website",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "check:boundary": "node scripts/check-public-docs.mjs",
    "check": "npm run check:boundary && astro check && astro build",
    "build": "npm run check:boundary && astro build",
    "serve": "astro preview"
  }
}
```

From `website/`, install and save the current mutually compatible releases:

```sh
npm install --save-dev astro @astrojs/starlight @astrojs/check typescript typedoc   starlight-typedoc starlight-llms-txt starlight-dot-md   starlight-copy-button starlight-links-validator
```

Commit the generated `website/package-lock.json`. If npm reports a peer conflict, inspect package peer ranges and choose the newest common supported Astro/Starlight major rather than forcing installation.

- [ ] **Step 3: Configure the external allowlisted content collection**

Create `website/src/content.config.ts` using `defineCollection`, Astro's glob loader, Starlight's `docsSchema`, and `PUBLIC_DOC_PATTERNS`. Configure the loader with `base: '../docs'` relative to `website/`. Do not use a broad `**/*` glob or a denylist.

- [ ] **Step 4: Configure Starlight and all five plugins**

Create `website/astro.config.mjs` that:

- calls `resolvePagesUrl(process.env.PUBLIC_SITE_URL)`;
- sets Astro `site` and `base` from the result;
- uses the title `ChatGPT Client` and description from root `package.json`;
- configures edit links against the repository URL when `GITHUB_REPOSITORY` is available;
- configures an explicit sidebar matching the approved information architecture;
- registers `starlight-typedoc` with `entryPoints: ['../src/index.ts']` and root TypeScript configuration;
- registers `starlight-llms-txt`, `starlight-dot-md`, `starlight-copy-button`, and `starlight-links-validator` once each;
- emits static output only.

Use the actual exported function names and option keys from each installed package's type declarations. Do not guess through type errors; inspect `node_modules/<plugin>` declarations after installation.

- [ ] **Step 5: Add root delegation and ignores**

Add these root scripts without changing existing script semantics:

```json
"docs:dev": "npm --prefix website run dev",
"docs:check": "npm --prefix website run check",
"docs:build": "npm --prefix website run build",
"docs:serve": "npm --prefix website run serve"
```

Add `website/dist/`, `website/.astro/`, and `website/node_modules/` to `.gitignore` even though generic entries already catch some generated paths; the explicit entries document the website boundary.

- [ ] **Step 6: Run contract and helper tests**

Run:

```sh
node --test website/test/*.test.mjs
npm run test:node
```

Expected: helper tests pass; repository contract assertions for package/config pass; workflow assertions remain red until Task 7. If the contract test is intentionally staged, use a separate test case and verify only that expected workflow case remains red.

- [ ] **Step 7: Commit the Starlight scaffold**

```sh
git add website package.json .gitignore
git commit -m "feat(docs): scaffold starlight website"
```

---

### Task 3: Author the reader journey under root docs

**Files:**
- Create: all public pages listed in the File map.
- Move/replace: `docs/architecture.md` into `docs/project/architecture.md` while preserving useful content.
- Modify: `README.md`.

**Interfaces:**
- Consumes: public routes and sidebar slugs from Task 2.
- Produces: complete manual content for all end-user navigation entries.
- Produces: stable cross-links to `/api/`, guides, project pages, and repository files.

- [ ] **Step 1: Add a failing content-completeness assertion**

Extend `test/docs-site.test.ts` with an exact list of required public source files and assert each exists, has Starlight frontmatter with a non-empty `title` and `description`, and contains no token-like test fixture strings. Assert that the old `docs/architecture.md` path is absent so architecture has one authored home.

- [ ] **Step 2: Run the root test and verify RED**

Run: `npm run test:node`

Expected: failure lists the first missing public page.

- [ ] **Step 3: Write landing and getting-started pages**

Write `docs/index.mdx` with Starlight hero metadata, unofficial API warning, package capabilities, and links to installation, library, CLI, and API reference. Write the three getting-started pages with copyable commands and examples based on current `README.md`. Every network example must use lifecycle cleanup and show a finite deadline or explain the package default.

- [ ] **Step 4: Write task-oriented guides**

Write the five guides from current source behavior and tests. Cover auth-file discovery without exposing secrets, stream event discrimination, non-overwriting file behavior, app-server shutdown in `finally`, and bounded configuration. State private-protocol instability near features that depend on it.

- [ ] **Step 5: Write manual reference pages**

Write CLI reference from the actual parser/help implementation in `src/cli.ts`, not from memory. Write the environment reference from `.env.example` and `src/config.ts`; include exact defaults and units and link to the cancellation/limits guide.

- [ ] **Step 6: Move and refresh project documentation**

Move useful architecture content into `docs/project/architecture.md`, write `security.md` from `SECURITY.md` and operational boundaries, and write `development.md` with current checks. Leave internal `docs/implementation-plan.md`, `docs/verification.md`, and `docs/superpowers/**` in place and unpublished.

- [ ] **Step 7: Reduce README duplication and link to docs**

Keep the README's package synopsis and minimal quick start. Add a Documentation section linking to the GitHub Pages site in a repository-relative/default-safe way and to `docs/` for source browsing. Do not hard-code a custom domain.

- [ ] **Step 8: Verify content tests and boundary**

Run:

```sh
npm run test:node
npm --prefix website run check:boundary
```

Expected: content completeness and publication boundary pass.

- [ ] **Step 9: Commit manual documentation**

```sh
git add docs README.md test/docs-site.test.ts
git commit -m "docs: add end-user documentation guides"
```

---

### Task 4: Document the primary public API with JSDoc/TSDoc

**Files:**
- Modify: `src/abort.ts`
- Modify: `src/appserver.ts`
- Modify: `src/auth.ts`
- Modify: `src/client.ts`
- Modify: `src/config.ts`
- Modify: `test/docs-site.test.ts`

**Interfaces:**
- Consumes: `src/index.ts` public exports.
- Produces: TypeDoc descriptions for core lifecycle, auth, client, and configuration APIs.
- Does not change runtime signatures or behavior.

- [ ] **Step 1: Add a failing public-comment coverage test**

Extend `test/docs-site.test.ts` to invoke the TypeScript compiler API from the root development dependency, enumerate declarations exported by `src/index.ts`, and assert each exported class, interface, type alias, function, and non-alias constant has a documentation comment. Report fully qualified missing names. Allow re-export declarations in `index.ts` to inherit comments from their source declaration.

- [ ] **Step 2: Run the coverage test and verify RED**

Run: `npm run test:node`

Expected: failure names undocumented exports beginning in the primary API files.

- [ ] **Step 3: Add comments to cancellation and configuration APIs**

Document `Deadline`, `deadlineSignal`, `sleep`, `RetryPolicy`, `RuntimeLimits`, `ClientConfig`, `resolveApiBase`, `defaultConfig`, and exported base URL constants. Include timeout semantics, parent-signal propagation, units, and finite-default intent.

- [ ] **Step 4: Add comments to authentication APIs**

Document exported JWT shapes and explicitly state decoding is not verification. Document `Auth` construction/loading/refresh lifecycle, concurrent refresh deduplication, device ID persistence, OAuth constants, and errors. Never include or solicit credentials in examples.

- [ ] **Step 5: Add comments to ChatGPTClient APIs**

Document every public type and public member of `ChatGPTClient`, including `create`, route access, generic calls, conversation methods, streaming events, files, sharing, heartbeat, and `close`. Use `@param`, `@returns`, and `@throws` where they add contract information. Mark unstable payload shapes honestly.

- [ ] **Step 6: Add comments to AppServer APIs**

Document process ownership, start/initialize behavior, request deadlines, notifications, server-originated request policy, close escalation, queue/pending limits, constants, and all exported request/option types.

- [ ] **Step 7: Run type checks and inspect generated core reference**

Run:

```sh
npm run check
npm run docs:build
```

Expected: strict compilation passes; TypeDoc emits pages for `ChatGPTClient`, `Auth`, `AppServer`, cancellation, and configuration with descriptions and no undocumented-warning failure for this slice.

- [ ] **Step 8: Commit core API comments**

```sh
git add src/abort.ts src/appserver.ts src/auth.ts src/client.ts src/config.ts test/docs-site.test.ts
git commit -m "docs(api): document core public interfaces"
```

---

### Task 5: Document transport, facade, errors, and realtime APIs

**Files:**
- Modify: `src/errors.ts`
- Modify: `src/http.ts`
- Modify: `src/logger.ts`
- Modify: `src/realtime.ts`
- Modify: `src/route-api.ts`
- Modify: `src/routes.ts`

**Interfaces:**
- Produces: complete TypeDoc contracts for exported transport, error, logging, realtime, and route APIs.
- Consumes: comment coverage test introduced in Task 4.

- [ ] **Step 1: Run comment coverage and capture this slice's RED list**

Run the focused docs-site test and confirm it names undocumented declarations in these six files. Do not weaken the test to accommodate missing comments.

- [ ] **Step 2: Document errors and logging**

Document stable error codes, serialized error safety, URL redaction, logger levels, no-op logger, and console logger behavior. Explain which details are safe for structured output.

- [ ] **Step 3: Document HTTP APIs**

Document auth-header behavior, `sendAuth: false`, retries, deadlines, bounded body reads, query/path helpers, user-agent constants, and all option types. Explicitly state automatic retries are for idempotent operations unless opted in.

- [ ] **Step 4: Document route catalog and facade**

Document declarative route metadata, path parameter inference, strict unused-argument rejection, unknown result shapes, stream result behavior, and `createRouteApi`. Avoid claiming the private route catalog is stable or authorized for every account.

- [ ] **Step 5: Document realtime APIs**

Document socket connection deadlines, bounded inbound queues, async iteration termination, close behavior, dictation sample-rate configuration, and cancellation.

- [ ] **Step 6: Verify this documentation slice**

Run:

```sh
npm run check
npm run test:node
npm run docs:build
```

Expected: these exports disappear from the missing-comment report and generated pages contain their descriptions.

- [ ] **Step 7: Commit transport API comments**

```sh
git add src/errors.ts src/http.ts src/logger.ts src/realtime.ts src/route-api.ts src/routes.ts
git commit -m "docs(api): document transport and route interfaces"
```

---

### Task 6: Document streaming, protocol-boundary, and common types

**Files:**
- Modify: `src/streaming/async-queue.ts`
- Modify: `src/streaming/lines.ts`
- Modify: `src/streaming/ndjson.ts`
- Modify: `src/streaming/sse.ts`
- Modify: `src/protocol/browser-env.ts`
- Modify: `src/protocol/chrome-solver.ts`
- Modify: `src/protocol/sentinel.ts`
- Modify: `src/protocol/turnstile.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Produces: complete comments for every remaining declaration exported by `src/index.ts`.
- Consumes: comment coverage test from Task 4.

- [ ] **Step 1: Run coverage and verify remaining RED declarations**

Run `npm run test:node` and confirm every remaining missing public comment belongs to this planned file set. If another source file appears, add it explicitly to this task rather than excluding it.

- [ ] **Step 2: Document bounded streaming primitives**

Document queue capacity and overflow failure, reader lock release, line/event byte limits, strict versus lenient NDJSON, SSE framing, cancellation, and iterator completion semantics.

- [ ] **Step 3: Document protocol-boundary exports**

Document browser-environment compatibility, Chrome solver lifecycle, integrity preparation and proof-of-work limits, Turnstile solver interfaces, and instability/security boundaries. Describe finite payload, pending-request, step, and execution limits where applicable.

- [ ] **Step 4: Document common exported types**

Add concise descriptions for JSON value shapes, fetch abstraction, headers, personas, stream formats, disposal, and integrity solver contracts. Avoid comments that merely restate the TypeScript spelling; explain intended use and constraints.

- [ ] **Step 5: Verify complete API documentation**

Run:

```sh
npm run check
npm run test:node
npm run docs:build
```

Expected: the public-comment coverage test passes with no exclusions for exported declarations; TypeDoc completes without undocumented public symbols.

- [ ] **Step 6: Commit remaining API comments**

```sh
git add src/streaming src/protocol src/types.ts
git commit -m "docs(api): document low-level public interfaces"
```

---

### Task 7: Add GitHub Pages deployment for default and custom domains

**Files:**
- Create: `.github/workflows/docs.yml`
- Modify: `test/docs-site.test.ts`

**Interfaces:**
- Consumes: root `docs:check`/`docs:build` scripts and `PUBLIC_SITE_URL`.
- Produces: Pages artifact from `website/dist/` and deployment URL.
- Uses: `actions/configure-pages` output `base_url` as the canonical public URL input.

- [ ] **Step 1: Strengthen workflow contract tests before creating the workflow**

Extend `test/docs-site.test.ts` to assert the workflow:

- triggers on `push` to the repository's actual default branch and `workflow_dispatch`;
- declares only `contents: read`, `pages: write`, and `id-token: write` permissions;
- uses a `github-pages` concurrency group and environment;
- passes `steps.pages.outputs.base_url` as `PUBLIC_SITE_URL` to build;
- installs with `npm ci --prefix website`;
- uploads exactly `website/dist`;
- does not reference secrets or a hard-coded domain.

- [ ] **Step 2: Run the workflow test and verify RED**

Run: `npm run test:node`

Expected: workflow-specific assertions fail because `.github/workflows/docs.yml` is missing.

- [ ] **Step 3: Implement the Pages workflow**

Create two jobs or one build plus one deploy job following the official Pages pattern. Pin current supported major releases of checkout, setup-node, configure-pages, upload-pages-artifact, and deploy-pages. Use Node 22, npm cache keyed to `website/package-lock.json`, `npm ci --prefix website`, then `npm run docs:check` and `npm run docs:build` with:

```yaml
env:
  PUBLIC_SITE_URL: ${{ steps.pages.outputs.base_url }}
  GITHUB_REPOSITORY: ${{ github.repository }}
```

Configure the protected `github-pages` environment and expose the deployment URL from the deploy action. Do not commit a `CNAME` because the domain is intentionally repository-configurable.

- [ ] **Step 4: Verify URL behavior and workflow contract**

Run:

```sh
node --test website/test/pages-url.test.mjs
npm run test:node
PUBLIC_SITE_URL=https://owner.github.io/chatgpt-client/ npm run docs:build
PUBLIC_SITE_URL=https://docs.example.com/ npm run docs:build
```

Expected: all tests pass; both builds complete; generated canonical/asset URLs use `/chatgpt-client/` for the first build and `/` for the second.

- [ ] **Step 5: Commit deployment automation**

```sh
git add .github/workflows/docs.yml test/docs-site.test.ts
git commit -m "ci(docs): deploy starlight site to pages"
```

---

### Task 8: Add maintenance instructions and verify generated deliverables

**Files:**
- Modify: `AGENTS.md`
- Modify: `test/docs-site.test.ts` if an output assertion needs correction based on actual plugin filenames.

**Interfaces:**
- Consumes: all implemented documentation commands and publication rules.
- Produces: durable contributor guidance and final verified site artifacts.

- [ ] **Step 1: Add a failing AGENTS maintenance assertion**

Extend `test/docs-site.test.ts` to require a `## Documentation` heading and exact behavioral markers for `docs/`, `website/`, `src/index.ts`, `docs:check`, `docs:build`, and generated output. Run `npm run test:node` and verify it fails because the section is missing.

- [ ] **Step 2: Write the AGENTS documentation section**

Add concise positive instructions:

- all authored documents go under root `docs/`;
- public end-user documents go only in the five allowlisted sections;
- internal plans/specs/research/verification stay outside public sections;
- Starlight configuration/assets/dependencies go under `website/`;
- behavior changes update relevant manual pages;
- public export changes update JSDoc/TSDoc, with `src/index.ts` as the API boundary;
- generated API pages, Markdown mirrors, `llms.txt`, and `website/dist/` are regenerated rather than edited;
- documentation/navigation/API changes require `npm run docs:check` and `npm run docs:build`.

Do not duplicate discoverable plugin versions or sidebar entries in `AGENTS.md`.

- [ ] **Step 3: Build and inspect plugin outputs**

Run `npm run docs:build` and verify under `website/dist/`:

- the landing page and every manual route exist;
- API reference pages exist and include known JSDoc text for `ChatGPTClient`, `Auth`, and `AppServer`;
- `llms.txt` (and any configured full-content companion) exists;
- Markdown representations from `starlight-dot-md` exist at the plugin's documented routes;
- code blocks include copy-button behavior/assets;
- internal marker text and paths from `docs/superpowers/**`, `docs/implementation-plan.md`, and `docs/verification.md` are absent.

If actual plugin output filenames differ from assumptions, update only the output assertion to the package's documented behavior; do not remove the assertion.

- [ ] **Step 4: Run a finite local preview smoke test**

Start `npm run docs:serve -- --host 127.0.0.1` as a managed background job. Wait only until the server announces its URL or a 30-second deadline expires. Request the landing page, one manual guide, one API page, `llms.txt`, and one Markdown representation; require HTTP 200 and expected page markers. Kill and collect the job in all success/failure paths.

- [ ] **Step 5: Run repository-required final verification**

Run in this order and inspect every exit code:

```sh
npm config get registry
npm run docs:check
npm run docs:build
npm run verify
git diff --check
git status --short
```

Expected: all commands exit 0. Confirm only intended implementation files and the user's preserved pre-existing changes remain.

- [ ] **Step 6: Commit maintenance guidance**

```sh
git add AGENTS.md test/docs-site.test.ts
git commit -m "docs: require documentation maintenance"
```

- [ ] **Step 7: Request final code review**

Invoke the requesting-code-review skill. Review the complete range from commit `7250480` through HEAD against the design spec. Fix any standards or spec gaps, rerun the final verification commands, and report the deployed-workflow readiness without claiming a live GitHub Pages deployment until the workflow has run on GitHub.
