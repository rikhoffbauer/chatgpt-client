# Security policy

## Sensitive material

The client reads the local Codex/ChatGPT auth store. Treat the following as secrets:

- access, refresh, and ID tokens;
- account and device identifiers;
- signed upload/download URLs;
- exported conversations and files;
- app-server request and notification payloads.

Never commit these values or include them in issue reports. The logger redacts common secret-bearing URL query names, but callers must still avoid logging arbitrary headers and payloads.

## Transport rules

Authenticated headers are attached only when `sendAuth` is enabled. Uploads and downloads against external signed URLs explicitly disable ChatGPT credentials. New code handling third-party URLs must do the same.

Retries are enabled by default only for idempotent methods. Do not enable automatic retries for side-effecting requests unless the endpoint provides an idempotency guarantee.

All buffered responses, input lines, stream events, queues, uploads, downloads, pending JSON-RPC calls, and protocol VM execution are bounded. Do not replace bounded primitives with unbounded arrays or queues.

## Local process integration

The `AppServer` can invoke powerful local capabilities. Embedding applications must implement an explicit approval policy for server-originated requests. The bundled CLI declines them by default.

Do not run an untrusted `CODEX_BIN`. Binary resolution checks an explicit option, `CODEX_BIN`, the ChatGPT application bundle, and then `PATH`.

## Integrity adapters

The code under `src/protocol/` is an isolated compatibility boundary for unstable protocol requirements. Changes should preserve existing interoperability and tests. Do not broaden it into a generalized challenge-bypass framework.

## Reporting

Report vulnerabilities privately to the repository owner. Include the affected version, a minimal reproduction without secrets, impact, and a proposed mitigation when available.
