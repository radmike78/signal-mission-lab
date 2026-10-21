# Persistent learning milestone — 18 October 2026

This extends the prior React training milestone on the existing private repository's development branch. It does not change or promote doctrine/equipment claims. Current manuals and human SME review remain pending. Not production-ready.

## Added

- PostgreSQL-backed accounts, hashed expiring credentials, cohorts, memberships, assigned activities, attempts and minimal audit events. SQLite is restricted to tests.
- Explicit, repeatable schema version 1 migration and a separate owner-only provisioning/revocation CLI. Production database connections require certificate/hostname verification. API identity receives restricted grants and no ability to issue credentials or change roles/schema.
- Server-side instructor ownership and learner-membership authorization on resource access. Credential role is loaded from the database, never taken from a client field.
- Structured assignment submissions scored on the server. Browser-supplied scores and extra fields are rejected. Membership foreign keys prevent orphan attempts; deletion cascades erase cohort learning records.
- Bounded quotas and per-process rate limiting, actual body-size limits, host allowlisting, default HTTPS requirement for account endpoints, sanitized validation errors and parameterized SQL.
- Connected instructor/learner interface in the Instructor area: enroll synthetic IDs, assign activities, review saved results, disconnect, refresh and delete one's synthetic account. Credentials remain in memory only and clear on reload/disconnect/401.
- Same-origin static/API packaging, a multistage non-root image, deployment grants/runbook and PostgreSQL backup/restore CI checks.

## Validation evidence

Local checks: 11 preserved prototype tests; 31 backend/domain/learning tests pass, with two PostgreSQL-specific tests skipped locally because no PostgreSQL server is available. Strict TypeScript/Vite build passes. npm audit, pip-audit and Bandit pass. Browser checks cover all prior training screens and a real same-origin FastAPI/persistent-store journey for instructor enrollment, assignment, learner submission, server scoring, saved progress, credential clearing, removal and cross-instructor isolation.

The PostgreSQL CI run repeats the backend suite against PostgreSQL 17, including relational constraints and restricted-role checks. CI also performs a synthetic pg_dump/restore drill and builds/runs the application container read-only, without capabilities or external networking. Consult PR checks for the result on the latest commit; this report does not assume an unobserved run passed.

Screenshots: `docs/screenshots/connected-instructor.png` and `connected-learner.png` show synthetic fixtures. No real people, credentials or operational data are shown. The existing training-screen screenshots remain available.

## Limits and remaining gates

This is administrator-managed lab authentication. It does not provide organizational OIDC/SSO, MFA, password recovery or public registration. Credential delivery and administrative DB access require secure owner procedures. In-flight authenticated requests may complete after revocation. Production hosting, TLS/proxy trust, runtime DB grants, secret injection and off-site backups still require real-environment validation.

Rate limits are per process and must be paired with distributed edge limits. Audit aging, pagination, comprehensive course analytics, custom instructor authoring, PostgreSQL row-level security, full dependency locks/hashes, pinned image/action digests, a broader accessibility audit, DAST and incident-response/monitoring integration remain open. Formative questions and answers remain public practice content; server scoring does not turn these into secure examinations.

The connected workflow saves assigned assessment/diagnostic results. Other training areas continue to work offline and retain their original session-only practice summaries. There is no synchronization of free-text worksheets, real mission plans or uploads. The source-grounded mentor remains deterministic retrieval pending reviewed source coverage and generative-model security evaluation.

See `deploy/ACCOUNTS.md` for provisioning, ownership, quotas, deletion semantics, runtime grants and HTTPS setup. No production accounts, infrastructure, paid services or real learner records have been created.
