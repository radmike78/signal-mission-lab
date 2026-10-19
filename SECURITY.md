# Security policy

Signal Mission Lab is an unofficial public-education application. Security controls and regression tests are implemented, but this is **not a security certification, completed penetration test, or production-readiness claim**. See [current OWASP review](docs/OWASP_SECURITY_REVIEW.md).

## Data boundary

Never submit classified information, CUI, COMSEC material, credentials, real OPORDs or operational network plans. The mission form requires fictional non-sensitive training, limits text to 1,200 characters, keeps it in browser memory, and clears raw text after analysis/rejection. Screening is heuristic; it is not DLP or a classification determination. There is no file-upload, remote-fetch, RAG or generative-model endpoint.

Only approved public-release source material belongs in the repository. Public hosting and an approved URL origin do not independently prove document releasability. A private server does not authorize restricted manuals. Do not use this app to assess or ingest restricted documents.

## Implemented controls

- React escaped text and legacy textContent rendering; restrictive CSP, anti-framing, no-referrer and capability restrictions. API adds cross-origin isolation headers and HSTS on observed HTTPS. Static hosting must enforce `_headers`.
- Strict bounded API models, rejected unknown fields, 2,048-byte actual body limits, generic validation/database errors and no credential echo. No request-time shell tools, arbitrary URLs or model calls.
- Administrator-issued high-entropy expiring/revocable tokens, hashed at rest, retained only in browser memory. Server-enforced cohort ownership/membership; parameterized SQL and restricted PostgreSQL runtime grants. OIDC/MFA is not yet implemented.
- Bounded per-process account and public-API rate limiting using the direct client address. Forwarding headers are not trusted. Trusted edge connection/time/body limits and distributed rate limiting remain required.
- Offline corpus publication checks reject unapproved claim URL origins, URL credentials, unsupported ports, duplicate/unknown claims, pending-source claims, and invalid publication/page bindings. No documents are downloaded or accepted by this command; human source/releasability review remains required.
- CI runs functional/authorization/provenance tests, TypeScript/browser checks, Bandit, dependency audits, PostgreSQL isolation/backup-restore and constrained non-root container checks. No protection is inferred solely from a green CI result.

## Deployment requirements

Use HTTPS and configured hosts, private PostgreSQL with verify-full TLS, separate migration/runtime identities, secret management, no request-body/token logging, and read-only non-root containers with restricted egress/resources. Validate effective edge headers, trusted proxy configuration, distributed limits, alerting, backup recovery, authentication and incident response before exposure. Do not deploy a development server.

## Reporting

Do not disclose exploit details or sensitive content in public issues. Use GitHub private vulnerability reporting if enabled, or a private channel already agreed with the repository owner. No reporting destination or production configuration is assumed.
