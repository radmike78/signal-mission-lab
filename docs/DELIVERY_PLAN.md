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

## Tactical equipment coverage expansion (19 October 2026 UTC)

Expanded public catalog coverage across upper/lower TI, WIN-T, ITN, SATCOM, radios, mounted systems and modernization. Added network-area/type filters, coverage metadata in the graph API and explicit mission catalog selections. See `EQUIPMENT_COVERAGE.md`. Exhaustive variant inventory, current fielding and interface validation remain open; blocked discoveries stay pending.

## Security and source-publication gate (19 October 2026 UTC)

Added public-API throttling, additional response-header protections and adversarial checks. Added a no-network build-time provenance gate for the curated corpus. See `OWASP_SECURITY_REVIEW.md` for the 2025 risk mapping, validation and open release gates. Approved public-document parsing/search remains a future milestone; no upload/RAG service is enabled.

## Rootless Podman packaging (19 October 2026)

Added OCI Containerfile, loopback-only systemd Quadlet, optional file-mounted runtime database secret and dedicated rootless Podman CI. See `deploy/PODMAN.md`. Real-host TLS/proxy, secret/DB configuration, SELinux/boot behavior and deployment acceptance remain open.

## IT foundations curriculum (19 October 2026)

Added nine introductory lessons, vendor/reference directory, knowledge checks and a synthetic dependency lab. Public technology references are validated separately from Army equipment claims. See `IT_FOUNDATIONS_AND_MANUAL_GAPS.md` for the explicit absence of an equipment-TM implementation corpus, required public references and remaining review/depth gaps.

## Mission troubleshooting workbench (19 October 2026)

Added evidence-gated synthetic builder, routing and satellite-dependency cases to the existing Troubleshoot area. Learners interpret observations, select a supported recovery, identify acceptance checks and explain mission impact. No actual equipment operation or recovery is simulated. See `TROUBLESHOOTING_WORKBENCH.md` and `RESEARCH_ACQUISITION_REPORT.md` for source boundaries, validation and missing manuals. Deep comprehension assessment, SME review, instructor persistence for these cases and real equipment procedures remain outstanding.

## GAIT and vendor coverage (19 October 2026)

Added a source-scoped GAIT purpose record and overview-only PacStar/IQ-Core study entries, with vendor NCM provenance in IT foundations. Catalog now has 86 entries; equipment variants, vendor integrations and interoperability remain incomplete and unverified. See `GAIT_AND_VENDOR_COVERAGE.md`.

## Pre-site preparation brief (19 October 2026)

Added a mission-scoped, fixed-choice preparation checklist covering intent, parts/prerequisites, architecture evidence, external coordination, build/recovery rehearsal and end-to-end acceptance. Unassigned owners and blocked/unreviewed items remain visible. A downloadable plain-text training brief includes responsibilities, expected evidence, risks and remaining boundaries; it never establishes equipment readiness. The state is local and clears with the mission. Strict build and 38 web model tests pass locally. Browser CI validates export contents, state changes and reset. Real parts lists, operational plans, external approvals and equipment-specific procedures remain outside this feature.

## Connected recovery assignments (19 October 2026)

Instructors can assign all three recovery cases, learners submit bounded choices for server scoring, and owned-cohort summaries show latest-result coverage and evidence/decision gaps. Schema version 2 additively preserves existing data; update runtime grants before deployment. Offline and connected practice share the same editorial content. See `CONNECTED_RECOVERY.md` for rubric, migration, validation and limitations.

## Focused learner flow (19 October 2026)

Troubleshooting now presents one symptom and one check at a time, with optional explanations/code and a final evidence-backed recovery decision. Older incidents and detailed mission evidence are collapsed on entry. Connected scoring and saved results are preserved. See `FOCUSED_LEARNER_FLOW.md` for interaction, validation and limitations.
