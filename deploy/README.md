# Deployment overview

Signal Mission Lab bundles a React public-training interface with an optional same-origin FastAPI instructor service. PostgreSQL stores bounded assigned-activity records when accounts are configured. The offline mobile edition omits account services; the web edition also supports local device practice without an account. The mentor is deterministic source retrieval, not a generative AI service.

Build the web edition with:

```
npm ci --prefix web --ignore-scripts
npm run build --prefix web
python scripts/package_web.py
```

Publish only `web/dist` to a static host that enforces `_headers`, or use the rootless [Podman deployment](PODMAN.md) to serve the UI and API together. The original prototype is retained under `/legacy/`; it is outside the offline-cache allowlist.

Use [ACCOUNTS.md](ACCOUNTS.md) for PostgreSQL TLS, separate migration/runtime identities, ephemeral lab credentials, authorization, retention and trusted-proxy setup. The default container binds to loopback and ignores proxy headers. Public account access requires validated HTTPS and restricted origin-network access. `SML_ENV=local` permits HTTP only for numeric loopback peers and loopback URL hosts. Never use `SML_ENV=test` for real-user hosting.

The container runs as UID 10001 with a read-only filesystem, dropped capabilities, no-new-privileges and resource limits. It is exercised in rootless Podman CI. Private database networking, distributed edge limits, real-host backups/restores, monitoring, retention, identity-provider choices and production security review remain deployment responsibilities. The Quadlet networking setting alone does not prohibit Internet egress.

No real users, operational data or restricted publications should be provisioned. Do not submit classified information, CUI, COMSEC or actual plans. Client-side text screening is a best-effort guard, not classification or DLP enforcement. See [learning review follow-up](../docs/LEARNING_REVIEW_FOLLOWUP.md) for current rubric and implementation limits, and [offline/mobile instructions](../docs/OFFLINE_MOBILE.md) for store-preparation gates.

Live hosting and signed store releases require the owner's hosting/domain and developer-account decisions. Keep credentials in approved secret handling, never source control or chat. A future generative mentor requires a separate reviewed design, source/permission boundaries, prompt-injection evaluations and budget controls before connection.
