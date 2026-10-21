# Deployment overview

For current persistent-account setup, use [ACCOUNTS.md](ACCOUNTS.md). That runbook covers database migrations, separate administrative/runtime identities, credential provisioning, quotas, deletion, TLS and same-origin hosting. The notes below describe the initial static milestone and are retained as historical context; the service now has optional accounts and persistence.

# Deployment boundary

The React application is a self-contained static training build. It does not send learner inputs to the API. Build with `npm ci --prefix web --ignore-scripts && npm run build --prefix web && python scripts/package_web.py`. Publish only `web/dist` to a static host that enforces `_headers`. The original application remains under `/legacy/`.

The optional FastAPI service is separately testable; it is not connected to the browser and has no accounts or persistence. Run locally with `python -m uvicorn backend.app:app --host 127.0.0.1 --port 8080 --no-access-log`. Its request bodies only accept bounded enumerations and numeric answers. No upload or free-text endpoints.

Container definition: `docker build -f deploy/Dockerfile.api -t sml-api .`. Runtime requirements: read-only filesystem, drop all capabilities, no-new-privileges, non-root UID 10001, constrained CPU/memory/PIDs, no Internet egress, internal network only. This container has not been built in the implementation environment; Docker is unavailable.

Before exposing any API: enforce HTTPS at a trusted reverse proxy; set the actual hostname allowlist; apply connection, body, header and request-time limits; enforce rate limits; verify returned security headers; disable request-body logging; configure a private vulnerability reporting channel. Do not expose development servers.

Future learner/instructor service: select an OIDC provider, implement server-validated roles and cohort ownership checks, use PostgreSQL on a private network with TLS and a separate migration role. Do not deploy persistent learning records until authorization, isolation, deletion, backup and restore tests pass. The current session review is not an authenticated instructor dashboard.

No deployment credentials are required for local validation. Live hosting needs the owner's chosen account/project, domain and deployment identity. Any generative mentor needs a provider decision, secret configuration, budgets, a reviewed corpus and prompt-injection evaluations. Do not put secrets into source control or chat.

## Current Podman deployment path

Use [PODMAN.md](PODMAN.md) for the current rootless OCI/Quadlet workflow. It supersedes historical Docker-only and no-runtime-validation notes above. The image includes UI/API/legacy content; persistent PostgreSQL is separate. A dedicated Podman CI job builds and exercises the constrained image; actual host deployment is not performed by this repository change.
