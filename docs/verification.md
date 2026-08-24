# Verification record

Date: 2026-07-30

## Environment

- Node.js: `v22.16.0`
- TypeScript: `5.8.3`
- Runtime dependencies: none
- Effective npm registry: nested internal Artifactory registry

## Completed checks

```sh
npm run check
npm run build
npm run test:node
./scripts/smoke.sh
npm pack --dry-run --json --ignore-scripts
git diff --check
```

Results:

- strict TypeScript compilation passed;
- declaration and source-map build passed;
- 26 offline tests passed with zero failures, cancellations, or skips;
- CLI version, route listing, piped-output/EPIPE handling, and package import smoke tests passed;
- package dry-run contained the executable, declarations, documentation, security policy, and registry helper;
- source scan found no TypeScript suppression directives or embedded token/private-key patterns.

## Bugs caught by verification

1. A body route reused and then emptied the same argument object, sending `{}` instead of the intended payload.
2. Unreferenced retry/deadline timers allowed Node to exit while promises were still pending.
3. App-server shutdown left a losing timeout alive after the process exited, delaying test completion by five seconds.
4. Piping route output into `head` caused an unhandled `EPIPE`.
5. Response-body reads were not covered by a deadline after headers arrived.
6. Aborting during a pending stream `reader.read()` did not actively cancel the reader.

Regression tests cover these behaviors where practical.

## Verification limitations

Bun was not available in the execution environment. Installing it through the effective npm registry was attempted after normalizing the required trailing slash, but that registry returned HTTP 404 for the `bun` package. Bun-specific execution therefore remains unverified here; the source uses standard ESM/Web APIs compatible with Bun, and dedicated Bun scripts are included.

No live ChatGPT account, private backend, WebSocket, Chrome DevTools, or installed ChatGPT `codex` binary was used. Network-facing protocol compatibility can still drift independently of the offline implementation tests.
