---
title: Installation and requirements
description: Prepare a supported local environment and install ChatGPT Client from its source checkout.
---

## Requirements

- **Node.js 22 or newer** for the portable build and test path.
- **macOS** for the default ChatGPT/Codex desktop integration and bundled Codex binary lookup.
- **Bun 1.3 or newer** only when using the preferred contributor workflow.
- A signed-in ChatGPT or Codex desktop installation with an auth store at `~/.codex/auth.json` (or a configured alternative).

## Run or install from GitHub

Run the CLI without adding it to a project:

```sh
npx --yes github:rikhoffbauer/chatgpt-client --help
bunx --package https://github.com/rikhoffbauer/chatgpt-client chatgpt-client --help
```

Bun 1.4.x requires the explicit `--package` form with the HTTPS GitHub URL because it does not infer
the executable from `bunx github:rikhoffbauer/chatgpt-client`.

Install it as a project dependency when you want to use the CLI and library together:

```sh
npm install github:rikhoffbauer/chatgpt-client
bun add github:rikhoffbauer/chatgpt-client
```

The package's executable is then available as `chatgpt-client`.

## Install from source

For contributor work or local changes, clone or use a workspace checkout, then install and build it:

```sh
npm install
npm run build
```

In a monorepo, reference the checkout as a workspace/file dependency. During development, Bun is also supported:

```sh
npm config get registry
./scripts/fix-bun-npm-registry.sh --install -- install
./scripts/fix-bun-npm-registry.sh -- run verify
```

The registry helper is required only when the effective npm registry is a nested URL missing its trailing slash.

## Confirm the setup

```sh
node dist/bin.js --version
node dist/bin.js models
```

The second command reads local authentication and contacts the private ChatGPT backend. Keep auth stores, tokens, signed URLs, and exported account data out of source control.

Next, choose the [library quick start](./library-quick-start/) or [CLI quick start](./cli-quick-start/).
