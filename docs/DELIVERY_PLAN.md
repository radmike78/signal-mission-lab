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
