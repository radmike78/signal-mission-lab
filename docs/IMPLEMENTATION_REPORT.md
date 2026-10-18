# Implementation and security report — 18 October 2026

Status: validated engineering milestone, not production-ready. Based on repository main commit `907242991aee36517c224139383eeb9e8e5e8e8f`. Existing root application and data remain intact; the new static package includes the original app at `/legacy/`.

## Working in this milestone

| Area | Implemented behavior | Limit |
| --- | --- | --- |
| React/TypeScript | Responsive eight-area learning application, strict TypeScript build | Independent static client; not API-connected |
| Mission requirements | Three supplied fictional missions, research links, ownership and acceptance matrix | Editorial general matrix; no real planning intake |
| MDMP | Seven guided stages and existing branching decision exercises | Teaching prompts, not current-edition doctrine validation |
| Knowledge graph | Seven equipment nodes, five conceptual associations, searchable profiles and per-claim provenance | Two source-checked claims only; all technical relationships remain unverified |
| Architecture | Accessible controls, SVG service dependency model and outage propagation | Fixed conceptual model, not a topology editor or equipment diagram |
| Troubleshooting | Three synthetic incidents, selectable checks, diagnosis and feedback | Simple diagnosis/coverage rubric, no device emulation |
| Assessments | Shared question dataset, feedback, repeat attempts | Formative; answers ship to browser; not certification |
| Instructor area | Session attempt history, average score, clearing and reload retention | Local preview only; no roles, learners or cohorts |
| Mentor | Topic-based retrieval with citations and explicit abstention | Deterministic, not generative AI |
| FastAPI | Catalog, graph, requirements, assessment and diagnosis endpoints | Tested separately; no database or identity |
| Delivery | CI build/test/audit/browser/artifact workflow, static packaging and non-root API image definition | No live deployment or container build verified |

## Validation performed

- Original Python regression suite: 11 tests passed; original JavaScript syntax check passed.
- Backend and domain suite: 14 tests passed, covering invalid identifiers, bounded input, extra-field rejection, body-size rejection, answer validation, scoring, provenance references, mentor abstention and response headers.
- Strict TypeScript check and Vite static production build passed.
- npm audit: zero known vulnerabilities after updating Vite to 7.3.7.
- pip-audit of backend requirements: zero known vulnerabilities after updating FastAPI/Starlette. These results are time-specific vulnerability database checks, not security certification.
- Chromium browser journeys passed across all eight areas and the preserved legacy mission journey. Included search markup handling, outage state, diagnostic scoring, assessment score, session reload, mentor refusal/citation and a 390px viewport overflow check. Nine screenshots captured in `docs/screenshots/`.
- Browser runner used a locally supplied Chromium binary because the standard Playwright download returned invalid archives in this environment. CI installs its own standard Chromium; remote CI results must be inspected separately.
- No Docker or PostgreSQL executable available. Container build, database integration, deployment headers over public HTTPS, full accessibility audit and penetration testing have not been performed.

## Security findings and controls

The new client accepts supplied scenarios, bounded search text and enumerated choices. Search remains in memory. Only numeric scores, activity labels and timestamps are stored in browser session storage, with a 50-attempt cap. No learner text, credentials, uploads, analytics or model requests are transmitted. React renders text; no raw HTML or dynamic code evaluation is used. Source links come from the checked-in corpus. Source changes require code review.

The optional API is stateless and accepts only bounded structured selections and numeric assessment answers. Unknown fields and identifiers fail validation. Actual ASGI body bytes are limited before JSON parsing. It has no URL fetch, shell execution, query construction, file upload or database access. Security headers and no-store responses are applied. The container disables access logs, runs non-root and documents private-network and resource limits.

The initial dependency audit found Vite and transitive Starlette advisories. Updated versions pass the repeated audits. No ignored advisories were introduced.

Unresolved release gates: edge rate limiting and request timeouts; verified HTTPS/header configuration; OIDC authentication and server-enforced authorization for any instructor/persistent records; PostgreSQL migration and isolation tests; reproducible fully transitive backend lock with hashes; pinned container base digest and image scan; CI action SHA pinning; secret scanning/SAST/DAST; backup/restore drills; logging/monitoring and incident response. The current security checks are a baseline, not a comprehensive OWASP audit.

The legacy worksheet remains local-only and uses a keyword warning heuristic. That heuristic cannot detect or sanitize sensitive content reliably. The new interface deliberately avoids free-text mission intake; the legacy worksheet must be reviewed before broader release.

## Source and publication gaps

Two historical Army articles were directly retrieved on 18 October 2026 and support only their narrow paraphrased claims. They do not validate current equipment configurations. Reviewer metadata explicitly says human review pending.

Still needed from official publicly releasable sources:

1. Current official FM 5-0, including applicable changes, with edition and paragraph/page references for MDMP inputs, outputs and mission-analysis requirements.
2. Current FM 6-0 and FM 6-02 for staff responsibilities, running estimates and Signal support boundaries.
3. Current ADP 5-0 and ADP 6-0 for planning and command-and-control foundations.
4. Public-release program references for CPCE, DCGS-A, AFATDS, AN/TPQ-53, JNN/WIN-T and CPN, with variant and lifecycle applicability. No interface manuals or interoperability specifications have been verified.
5. Named doctrine and equipment SMEs to approve claims before assigning a human-reviewed status.

Do not supply classified, CUI, COMSEC or access-restricted manuals. If the appropriate reference is not public, keep the claim unknown and teach coordination responsibilities instead.

## Next stages and required owner decisions

The remaining requested platform is not complete. Next: split UI into typed modules; introduce shared schemas and more scenario-level acceptance criteria; expand reviewed source coverage; implement OIDC-backed learner/instructor/cohort authorization and PostgreSQL persistence; add migration/restore tests; connect the UI to those authenticated services; then evaluate a source-grounded generative mentor with adversarial prompt-injection tests, cost limits and source poisoning controls.

No credentials are needed for the current local static app or API tests. Live deployment requires the owner's chosen hosting project/domain and deployment identity. Persistent accounts require an identity-provider choice and private PostgreSQL provisioning. A generative mentor requires a model-provider choice and securely configured API credentials. No production deployment, account creation, paid service or secret configuration has been performed.
