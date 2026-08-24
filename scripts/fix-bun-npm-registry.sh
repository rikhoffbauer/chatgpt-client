#!/usr/bin/env bash
set -euo pipefail

registry="$(npm config get registry)"
if [[ -z "$registry" || "$registry" == "undefined" || "$registry" == "null" ]]; then
  echo "npm did not report an effective registry" >&2
  exit 1
fi

normalized="${registry%/}/"
export NPM_CONFIG_REGISTRY="$normalized"
export npm_config_registry="$normalized"

if [[ "$registry" != "$normalized" ]]; then
  echo "Using normalized npm registry: $normalized" >&2
else
  echo "Using npm registry: $normalized" >&2
fi

if [[ "${1:-}" == "--install" ]]; then
  shift
  if ! command -v bun >/dev/null 2>&1; then
    npm i -g bun
  fi
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

if (( $# > 0 )); then
  if ! command -v bun >/dev/null 2>&1; then
    echo "bun is not installed; run $0 --install" >&2
    exit 1
  fi
  exec bun "$@"
fi
