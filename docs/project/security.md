---
title: Security and operational boundaries
description: Protect credentials and data while using unofficial private protocol surfaces.
---

## Credential boundary

- Keep `~/.codex/auth.json`, access/refresh/ID tokens, account IDs, signed URLs, and exported account data private.
- External signed blob URLs are called without ChatGPT bearer or account headers.
- Error URLs redact query keys resembling tokens, keys, signatures, auth values, credentials, or codes.
- Use least-privilege filesystem permissions for auth and exported files.

## Protocol boundary

This project is unofficial. Private routes can change, disappear, or require unavailable account features. Catalog coverage is not an authorization signal. Validate unknown response shapes before using them.

Integrity, browser, proof-of-work, and Turnstile helpers are isolated under `src/protocol/` because they are unstable and security-sensitive. Prefer primary APIs and review protocol changes carefully.

## Operational policy

Retry idempotent work only unless an endpoint offers explicit idempotency semantics. Set finite deadlines and resource limits. App-server approval-like requests require an explicit embedding policy; deny by default when no policy exists.

Report vulnerabilities according to the repository's `SECURITY.md` rather than opening a public issue containing secrets.
