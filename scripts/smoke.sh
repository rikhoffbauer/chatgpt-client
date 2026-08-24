#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

npm run verify
node dist/bin.js --version
node dist/bin.js routes conversation | head -n 5 >/dev/null
node -e "import('./dist/index.js').then(m => { if (typeof m.ChatGPTClient !== 'function') process.exit(1) })"
