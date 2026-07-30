#!/usr/bin/env node
// Entry point for the ChatGPT desktop-app protocol client.
//
// The implementation lives in src/:
//   auth.js       ~/.codex/auth.json token store, refresh, account id
//   http.js       request core, header personas, SSE + NDJSON decoders
//   sentinel.js   proof-of-work + turnstile ("integrity") handshake
//   turnstile.js  the dx challenge VM, ported from the app bundle
//   routes.js     declarative catalog of every backend-api endpoint
//   client.js     generated methods plus the composite flows (turns, uploads)
//   realtime.js   /celsius/ws/user push channel and the dictation stream
//   appserver.js  JSON-RPC bridge to the local `codex app-server` binary
//   cli.js        this command line
//
// Credentials are read from the local codex auth store and are never printed.

import { run } from './src/cli.js'

run()
