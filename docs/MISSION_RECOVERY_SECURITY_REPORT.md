# Mission preparation and recovery milestone report

19 October 2026. This report covers the preparation, recovery and coverage additions on draft PR #1. It is not a declaration that the entire platform is complete or production ready. Nothing was merged or deployed during this milestone.

## Functionality delivered

| Area | Result | Practical boundary |
|---|---|---|
| Builder reasoning | Evidence cards, display-only toy PowerShell, partial-state analysis, recovery-contract interpretation and mission-impact brief | No Army builder obtained, inspected or executed; no actual system changes |
| JNN/CPN-related networking concepts | Separate underlay/tunnel, OSPF adjacency, learned-route and application checkpoints | Authored point-to-point area-mismatch case; not a verified JNN/CPN design or command guide |
| Satellite critical path | Acquisition versus two-way acceptance, service-owner handoff and dependent-test blockers | Invented states; no STT alignment/transmit/RHN operating procedure or thresholds |
| Pre-site preparation | Six checkpoints for intent, parts/prerequisites, architecture evidence, coordination, build/recovery and acceptance | Fixed fictional owner/status choices; exact parts, quantities and configurations are not inferred |
| Training brief | Local plain-text download with choices, expected evidence, risks and unresolved items | Self-report, not an operational plan or verified readiness certificate |
| Requested coverage | GAIT purpose claim; overview-only PacStar/IQ-Core entries; vendor NCM reference and mission-name recognition | No supported-device matrix, node integration, current fielding or interoperability claim |
| Preserved features | Existing mission intake, original incidents, MDMP, graph, IT lessons, assessments and connected learning | New workbenches are not server-scored assignments or persisted instructor results |

Catalog: 86 entries, including families, software and categories; 60 source-checked purpose records, 18 overview entries, eight pending discoveries. Source-checked does not mean human-reviewed, configuration-verified or compatible. There are 68 Army claim records, six doctrine publication records with mixed retrieval states, nine IT lessons, nine vendor groups and thirteen technology references. The catalog remains incomplete.

## Security analysis of the additions

The new workbenches accept supplied identifiers and choices only. They add no free-text field, upload, API request, model/tool invocation or remote device control. Model validation rejects unknown/duplicate evidence, unknown cases/decisions and forged preparation rows/owners/states. A correct diagnosis cannot bypass missing evidence. Browser state resets when switching/resetting cases or leaving the area. Preparation state is keyed to the mission result.

All exercise content and code examples render as React text, without HTML insertion or evaluation. The display-only PowerShell example changes no files, services or network state and is never executed by the app. Downloads use a text Blob, fixed filename and bounded validated values; the raw mission description is excluded. Generated object URLs are revoked. External curriculum URLs are fixed and new tabs use isolation attributes.

The Curtiss-Wright host was added only to the separate vendor-curriculum origin allowlist. Army equipment claim origins were not broadened. Neither research URLs nor external page content can cause runtime fetching or tool execution. Generic vendor documentation and fictional observations remain explicitly distinct from Army equipment evidence. The app still has no generative model or RAG ingestion, so a generative prompt-injection defense has not been evaluated or claimed.

Existing backend authorization, parameterized SQL, credential hashing/expiry/revocation, input/request bounds, per-process throttling, security headers and constrained container architecture remain in place. CI checks are evidence for their tested scope, not a penetration test, OWASP certification or deployed security assurance. See `OWASP_SECURITY_REVIEW.md`, `CONTENT_GOVERNANCE.md`, `SECURITY.md` and `deploy/PODMAN.md`.

## Validation record

- Local strict TypeScript production build: passed.
- Local web model tests: 38 passed, covering the existing mission/requirements/foundations models and new recovery/preparation behavior.
- Local catalog/security/provenance/curriculum/container tests: 31 passed; source gate passed.
- Full local backend suite: unavailable because FastAPI is not installed in this editing environment. CI installs the pinned requirements and runs backend/PostgreSQL tests.
- Browser regression found an exact-label association problem in the first workbench revision. Explicit labels corrected the defect; subsequent CI browser and connected-learning journeys passed on revision `3b3d349a3af8d014aaab20759ccd10ee956d8f47`.
- CI on that revision passed PostgreSQL authorization, backup/restore, dependency audit, SAST and web/model checks before its image-validation steps. Final revision adds the toy code display and wrapping style; consult final revision checks and screenshot artifacts before treating it as validated.

Screenshots are captured by CI as the `screen-evidence` artifact: the existing major application areas plus builder, routing, satellite and mobile workbench screens. `mission-recommendation.png` captures the mission worksheet/preparation section. Images show training content, not live Army systems. The current workflow run is authoritative for artifact availability and results.

## Remaining work and external dependencies

| Gate | What remains | Needed from outside the code change |
|---|---|---|
| Equipment accuracy | Applicable manuals, variants, versioned task/recovery procedures, parts and interfaces; full catalog inventory | Approved public references and qualified Signal/vendor reviewers; see the manual checklist and `RESEARCH_ACQUISITION_REPORT.md` |
| Learning validation | Human review of authored scenarios, stronger comprehension/performance rubrics, equipment-specific cases | Instructor/SME feedback and approved reference corpus |
| Instructor depth | Authoring, richer analytics and server-scored versions of the new workbenches | Defined grading/retention/access policy; implementation remains open |
| Identity | Organizational OIDC/MFA and full lifecycle integration | Chosen identity provider, tenant/client configuration and deployment policy; current tokens are administrator-provisioned lab credentials |
| Generative mentor | Reviewed corpus, citation/abstention/source-poisoning evaluations, bounded provider adapter and cost controls | Public-content approval, provider/local-model choice and securely provisioned credentials if applicable; no paid calls enabled |
| Live Podman deployment | Host boot/linger, SELinux, TLS/proxy trust, database connectivity/secrets, backups, monitoring and rollback drills | Host access, domain/TLS design, database and secret configuration, operator ownership |
| Release assurance | Accessibility audit, live security assessment, load/failure testing and incident-response rehearsal | Target environment and authorized reviewers/test scope |

Credentials are not needed to continue offline synthetic development. Do not send credentials in chat. Provision deployment secrets through the documented host secret mechanism when the environment is chosen. Restricted Army service access does not authorize transferring restricted manuals into this project. No classified information, CUI, COMSEC, real operational configurations or plans are accepted.
