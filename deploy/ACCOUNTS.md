# Persistent synthetic learning

## Database and credential boundary

The service supports PostgreSQL for deployment. SQLite is an explicitly test-only adapter. Production PostgreSQL URLs must specify `sslmode=verify-full` with a trusted server certificate. Connection, statement and lock timeouts are configured. Inject connection URLs through your secret manager; do not paste them into chat or commit them.

Use a separate schema-owner/administrative credential to run `python -m backend.manage migrate`. Migrations are explicit and repeatable; the API does not create or alter tables. Version 1 creates the original schema. Version 2 additively creates recovery assignment/attempt extensions; it preserves legacy records. Reapply runtime grants after migrating. See `docs/CONNECTED_RECOVERY.md` for deployment and rollback constraints.

Create a `sml_runtime` database login through approved administrative tooling, then apply `deploy/runtime-grants.sql`. Use that runtime identity for the API. The API can read account roles, lock account rows, delete accounts, manage learning rows and append audit events. It cannot provision accounts, create/revoke access tokens, modify schema or delete audits. Runtime database grants protect against schema modification; API owner/membership checks protect cohort-level data. PostgreSQL row-level security is not implemented.

## Provisioning and sign-in

Administrators provision a synthetic learner or instructor with `python -m backend.manage provision learner` or `python -m backend.manage provision instructor`, using the administrative DB identity. Default validity is one day; `--days` accepts one through seven. The command outputs a generated UUID and a one-time 256-bit access credential. Distribute it using an approved secret channel. Do not record terminal output in CI logs, tickets or source control.

The database stores only SHA-256 hashes of these high-entropy credentials. There is no self-registration or API role selection. Revoke all credentials for an account with `python -m backend.manage revoke ACCOUNT_UUID`. Expired and revoked credentials fail every subsequent API authentication check. Already authenticated in-flight requests may finish.

In the browser, open My training → Accounts and cohorts and connect with the lab credential. It remains in component memory, is omitted from cookies/browser storage/URLs and clears on reload, disconnect or 401. Instructor credentials and learner credentials produce different server-authorized views. These are administrator-managed lab credentials, not organizational SSO/MFA. OIDC, recovery and MFA remain deployment-stage work.

## Learning workflow and retention

1. Instructor creates a fictional Alpha/Bravo/Charlie/Delta cohort.
2. Learner shares only their generated account UUID; instructor enrolls that UUID.
3. Instructor assigns a supplied assessment or synthetic diagnostic exercise.
4. Learner submits structured choices through the same-origin API. The service validates and scores them, storing only activity references, synthetic IDs, numeric scores and timestamps.
5. Instructor reviews owned cohort results; learners can read only their own attempts.

Limits: 100 cohorts per instructor, 100 members and assignments per cohort, 20 attempts per learner/assignment. Lists return at most 100 records; cohort progress returns the latest 500 attempts. The latest-result cohort summary is independent of the 500-row history window. Pagination and long-running course analytics are not implemented. All activities are formative, with public practice questions; this is not examination or qualification software.

Removing a learner deletes their attempts for that cohort. Deleting a cohort removes its memberships, assignments and attempts. The learner can explicitly delete their own account; instructor deletion also cascades through owned cohorts. Minimal audit events retain generated IDs, action names and timestamps without credentials or exercise text. Set organizational retention requirements before live deployment; automatic audit aging is not implemented.

## Same-origin deployment

Set `SML_SERVE_WEB=1` to serve the packaged React app and API together. Specify `SML_ALLOWED_HOSTS` as a comma-separated explicit hostname allowlist; defaults accept loopback and test hosts only. The normal account service requires HTTPS. The `SML_ENV=local` exception is for loopback development only; `SML_ENV=test` also allows test SQLite.

TLS termination must set the ASGI scheme only through a trusted proxy. The image defaults to ignoring all proxy headers. If terminating TLS upstream, explicitly override the startup command with `--proxy-headers --forwarded-allow-ips` restricted to the actual proxy IPs. Never use a wildcard proxy trust setting. Restrict origin-network access to that proxy. Validate this arrangement on the chosen host before public access.

Use read-only filesystem, UID 10001, dropped capabilities, no-new-privileges, resource limits and private database networking. Expose only HTTPS; set distributed edge request/body/header/time/rate limits. The application rate limiter is bounded but per-process, not distributed. No CORS is enabled and the browser cannot select an external API base URL. Request validation errors omit submitted values. Access logging is disabled in the supplied startup command.

## Verification

SQLite tests exercise API ownership, membership, role boundaries, credentials, quotas, deletion and persistence locally. CI repeats the suite against PostgreSQL, checks relational constraints and a restricted DB role, and runs a synthetic pg_dump/restore drill into another database. CI also builds the application container and checks it under constrained runtime settings. These synthetic checks do not replace encrypted off-site backups or a real-host restore exercise.

No real users, operational data or paid services are provisioned by this code. Before a public release: choose identity/hosting providers, configure durable secrets and TLS, verify production DB grants and backups, add monitoring and incident response, complete broader security/accessibility testing, and verify the documentation corpus.

## File-mounted database credentials

Podman deployment can set `SML_DATABASE_URL_FILE` to a mounted secret path rather than exposing the URL in the environment. The reader limits content to 4,096 characters, rejects empty/multiline values and fails if both URL settings are supplied. Existing PostgreSQL TLS and least-privilege policies still apply. See [PODMAN.md](PODMAN.md) for rootless deployment and separate administrator/runtime secret handling.
