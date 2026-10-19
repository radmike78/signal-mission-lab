# Delivery stages

## Validated milestone (18 October 2026)

Preserved root prototype; added React/TypeScript static client, mission requirements matrix, guided MDMP practice, provenance-aware equipment exploration, interactive service graph, diagnostic scoring, shared formative questions, session review and deterministic citation retrieval. Added separately tested FastAPI endpoints, CI validation/artifact packaging and a non-root API container definition. See `IMPLEMENTATION_REPORT.md` for exact evidence and screenshots.

## Remaining stages

1. Expand typed content schemas and public-source coverage; obtain human doctrine/equipment review. No compatibility claim can be promoted by inference.
2. Implement OIDC identity, server-enforced learner/instructor/cohort authorization and PostgreSQL persistence, with ownership/isolation tests, migrations, deletion and backup/restore drills.
3. Connect UI to authenticated persistence; add instructor authoring and analytics. Current session review is a preview only.
4. Implement a generative mentor only after reviewed corpus, prompt-injection/source-poisoning evaluations, citation entailment checks, abstention tests, budgets and secure credential setup.
5. Complete secure live deployment, accessibility review, image scans, secret scanning/SAST/DAST, monitoring and incident-response rehearsals.

Every stage must pass functional, security, source-provenance and learning-outcome acceptance criteria. Current work is not production readiness.

## Persistent learning milestone (18 October 2026)

Added PostgreSQL persistence, administrator-provisioned synthetic accounts with hashed/expiring/revocable tokens, instructor-owned cohorts, memberships, assignments, server-scored attempts, deletion and minimal audit events. Connected learner/instructor UI uses the same-origin API while offline training is preserved. Added authorization/isolation tests, PostgreSQL integration and backup/restore CI, plus a constrained container check. See `PERSISTENCE_REPORT.md` and `deploy/ACCOUNTS.md`.

The earlier remaining-stage list is historical: basic persistence/cohort authorization is now implemented. Organizational OIDC/MFA, custom instructor authoring, expanded analytics, reviewed sources, generative mentor evaluation and live deployment/security/accessibility review remain incomplete.

## Requirements and evidence worksheet milestone (19 October 2026 UTC)

Mission briefs now include observable user-outcome criteria, self-reported synthetic observations, equipment dependency/coordination prompts, scoped source claims and conceptual relationships with missing interface evidence. See `REQUIREMENTS_REPORT.md`. This closes part of the requirements-analysis gap; multiple exchange modeling, authoritative interface coverage and human review remain outstanding.
