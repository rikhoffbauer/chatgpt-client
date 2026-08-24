# Starlight Documentation Website Design

**Date:** 2026-08-21
**Status:** Approved for implementation planning

## Objective

Create an informative documentation website for the `chatgpt-client` npm package using Astro Starlight. Deploy the static site to GitHub Pages with support for both the default project URL and a configured custom domain. Keep all authored project documentation under the repository's root `docs/` directory while keeping the Starlight application itself under `website/`.

## Goals

- Give new users a clear path from installation to working library and CLI examples.
- Publish manually written Markdown and MDX documentation from root `docs/`.
- Generate API reference documentation from the package's public TypeScript exports and their JSDoc/TSDoc comments.
- Prevent internal plans, agent artifacts, and verification records from appearing on the public website.
- Deploy reproducibly through GitHub Actions to GitHub Pages.
- Allow the same configuration to work with a default `<owner>.github.io/<repository>/` URL or a Pages custom domain.
- Provide local development, validation, production-build, and preview commands from the root package.

## Non-goals

- Publishing every file under `docs/`.
- Publishing historical plans, agent notes, or internal verification records.
- Adding versioned documentation, changelog pages, heading badges, icon packs, or page-action integrations in the first version.
- Hand-maintaining generated API pages.
- Changing the package runtime or adding runtime dependencies.

## Repository layout

The Starlight application and the authored documentation have separate roots:

```text
<repo root>/
├── website/                         # Starlight application and tooling
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── public/
│   └── dist/                        # Generated and ignored by Git
├── docs/                            # Every authored project document
│   ├── index.mdx                    # Public landing page
│   ├── getting-started/             # Public
│   ├── guides/                      # Public
│   ├── reference/                   # Public manual reference
│   ├── project/                     # Public project information
│   ├── superpowers/                 # Internal; never published
│   ├── implementation-plan.md       # Internal; never published
│   └── verification.md              # Internal; never published
├── src/                             # Package sources and API comments
├── AGENTS.md
└── .github/workflows/docs.yml
```

All authored documentation belongs under root `docs/`. Starlight configuration, integration code, presentation components, static assets, and documentation-only package metadata belong under `website/`. The GitHub Actions workflow remains under `.github/workflows/`, as required by GitHub.

## Publication boundary

Publication uses an explicit allowlist. The website may consume only:

- `docs/index.mdx`
- `docs/getting-started/**`
- `docs/guides/**`
- `docs/reference/**`
- `docs/project/**`

Everything else under `docs/` is private to the repository unless deliberately moved into an allowlisted section. In particular, the website excludes:

- `docs/superpowers/**`
- design specifications and implementation plans
- verification records
- research notes and agent-oriented material
- any newly created directory not explicitly added to the public-content allowlist

The Starlight content integration will load or expose the allowlisted files from root `docs/` without relocating or duplicating them. A build-time check will verify the publication boundary so a future configuration change cannot silently include internal documents.

## Information architecture

### Home

The landing page explains what the package does, highlights its dependency-free runtime and bounded operations, links to the quickest successful setup paths, and prominently states that this is an unofficial client for private protocol surfaces that may change.

### Getting started

- Installation and requirements
- Library quick start
- CLI quick start

### Guides

- Authentication and configuration
- Conversations and streaming
- File upload and download
- Local Codex app-server
- Cancellation, deadlines, and resource limits

### Reference

- Generated TypeScript API reference
- CLI command reference
- Environment variables and defaults

### Project

- Architecture
- Security and operational boundaries
- Development and verification guidance relevant to contributors

The sidebar separates manually curated guides from generated API pages. Internal project process documents are not linked or copied into public pages.

## Manual documentation

Manual pages are maintained as Markdown or MDX under the allowlisted root `docs/` sections. Existing useful content from `README.md`, `docs/architecture.md`, `SECURITY.md`, and `.env.example` will seed these pages, but pages will be reorganized for end-user tasks rather than mechanically mirrored.

A fact should have one authoritative documentation home whenever practical. The README remains a concise package overview and points to the website for complete guidance. Public website pages must not depend on private credentials, live account access, or network calls to render.

## API reference generation

`starlight-typedoc` uses root `src/index.ts` as the public package entry point. The generated reference includes public exports reachable through that entry point and excludes private implementation details.

The implementation will add concise JSDoc/TSDoc to public classes, functions, interfaces, properties, type aliases, and important exported constants where comments are missing. Comments should explain purpose, important constraints, parameters, return values, lifecycle requirements, cancellation behavior, finite limits, and relevant errors. They must not promise stability for undocumented backend payloads.

Generated API pages are build artifacts. Contributors edit TypeScript declarations and comments, never generated output.

## Starlight plugins

The first version uses only plugins with a direct requirement or usability benefit:

- `starlight-typedoc` for TypeScript/JSDoc API generation.
- `starlight-llms-txt` for an LLM-readable documentation index and content output.
- `starlight-dot-md` for Markdown representations of published documentation pages.
- `starlight-copy-button` for copying code examples.
- `starlight-links-validator` for build-time link validation.

The first version excludes `starlight-plugin-icons`, `starlight-heading-badges`, `starlight-page-actions`, `starlight-changelogs`, and `starlight-versions`. These can be reconsidered only for a concrete documented need.

## Package and dependency boundaries

`website/package.json` contains Astro, Starlight, TypeDoc, and plugin dependencies. Documentation dependencies do not become runtime dependencies of `chatgpt-client`. The website has its own committed lockfile for deterministic CI installation.

Root `package.json` exposes a stable interface by delegating to `website/`:

- `docs:dev`: start Starlight development mode.
- `docs:check`: validate Astro content, TypeDoc generation inputs, the publication allowlist, and links.
- `docs:build`: generate the API reference and build the production static site.
- `docs:serve`: locally preview the production output.

The existing package build and verification commands remain responsible for the runtime package. Documentation checks are added without weakening the existing `verify` process.

## GitHub Pages URL handling

Astro receives its canonical `site` and deployment `base` from environment variables. Local commands default to a localhost origin and `/` base path.

The GitHub workflow derives values from GitHub Pages configuration instead of hard-coding the repository owner, repository name, or custom domain:

- A normal project Pages site builds for `https://<owner>.github.io/<repository>/`.
- A user or organization Pages repository builds at `/`.
- A configured custom domain uses its custom origin and `/`.

The workflow uses GitHub's Pages configuration action and passes its resolved public URL/base information to the build. Custom-domain ownership and DNS remain repository Pages settings. A `CNAME` file is added only if the configured Pages setup requires a committed one; no particular domain is embedded in source configuration.

Every generated canonical URL, asset URL, navigation link, `llms.txt` reference, and Markdown-page link must honor the resolved base path.

## Deployment workflow

`.github/workflows/docs.yml` will:

1. Trigger on pushes to the repository's default branch and on manual dispatch.
2. Use least-privilege permissions required for Pages deployment.
3. Serialize deployments through the `github-pages` environment/concurrency settings.
4. Check out the repository.
5. Configure GitHub Pages and derive canonical deployment values.
6. Install website dependencies from the committed lockfile.
7. run documentation validation and a production build.
8. Upload `website/dist/` with the official Pages artifact action.
9. Deploy the artifact with the official Pages deployment action.

A failed content check, TypeDoc generation, publication-boundary check, link validation, or static build prevents deployment.

## Validation and testing

Implementation follows a red-green cycle for repository-specific behavior. Before configuration is added, an offline test will assert the intended documentation contract and fail because the site does not yet exist. The completed checks cover:

- required root documentation scripts;
- the separation between `website/` and root `docs/`;
- the explicit public-content allowlist;
- exclusion of `docs/superpowers/**` and other internal files;
- `src/index.ts` as the TypeDoc entry point;
- presence of the five approved plugins;
- valid GitHub Pages workflow structure;
- successful Astro/Starlight content validation;
- successful TypeDoc and production site generation;
- valid internal links;
- expected `llms.txt` and Markdown outputs;
- correct default-project and custom-domain URL/base handling;
- a local `docs:serve` smoke check with a finite startup deadline;
- existing package verification through `npm run verify`.

Before completion, run:

```sh
npm config get registry
npm run docs:check
npm run docs:build
npm run verify
```

The local preview smoke test must start and stop the process deterministically rather than leaving a background server running.

## Documentation maintenance policy

`AGENTS.md` gains a concise Documentation section with these behavioral requirements:

1. Put every authored project document under root `docs/`.
2. Put Starlight application code and configuration under `website/`, not `docs/`.
3. Put end-user pages only in explicitly public sections of `docs/`; keep plans, specs, agent notes, research, and verification records outside those sections.
4. Update the relevant manual page whenever installation, CLI behavior, configuration, architecture, security boundaries, or development procedures change.
5. Add or update JSDoc/TSDoc whenever a public export changes; `src/index.ts` defines the API-reference boundary.
6. Treat generated API pages, Markdown mirrors, `llms.txt`, and `website/dist/` as generated output rather than hand-edited documentation.
7. Run `npm run docs:check` and `npm run docs:build` after documentation, navigation, or public API changes.
8. Ensure new or moved public pages are reachable through navigation and contain valid internal links.

## Security and operational constraints

- Documentation examples never contain access tokens, refresh tokens, account identifiers, signed URLs, or copied private account data.
- Examples reinforce cancellation and finite deadlines for network or process operations.
- Examples do not imply that private routes are stable or universally authorized.
- GitHub Actions uses pinned major official actions and minimal permissions; it does not require repository secrets for ordinary Pages deployment.
- The documentation build must not make authenticated calls to ChatGPT or start the local Codex app-server.

## Acceptance criteria

The design is complete when implementation can demonstrate all of the following:

- `npm run docs:build` creates a complete static site in `website/dist/`.
- `npm run docs:serve` serves that production build locally.
- Manual pages are sourced from allowlisted locations under root `docs/`.
- Internal documents remain absent from generated output and navigation.
- API pages are generated from `src/index.ts` and display source JSDoc/TSDoc.
- The five approved plugins produce their intended build or UI behavior.
- Internal links validate successfully.
- Both default GitHub project-path and custom-domain configurations produce correct URLs.
- The GitHub Pages workflow builds, uploads, and deploys the site.
- `AGENTS.md` contains the documentation maintenance rules.
- Existing runtime checks still pass.
