# OWASP security review and release gaps

19 October 2026 UTC. Scope: current draft branch, React and legacy clients, FastAPI training/accounts API, PostgreSQL design and CI/container scaffolding. This is a code/control review with automated adversarial regression tests, not a complete penetration test, ASVS verification or deployment authorization.

Reference: [OWASP Top 10:2025](https://top10.owasp.org/2025/) and [LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

| OWASP 2025 risk | Implemented evidence | Material remaining work |
|---|---|---|
| A01 Broken Access Control | Cohort-owner/member checks, cross-account isolation tests, server-computed grades, restricted DB role | Organizational identity and deployed authorization review |
| A02 Security Misconfiguration | Explicit trusted hosts, restrictive headers, no permissive CORS, non-root constrained container | Live TLS/edge/proxy/header checks; production configuration validation |
| A03 Software Supply Chain Failures | Lockfiles, pinned application requirements, npm audit/pip-audit, Bandit, least-privilege workflow permissions | Pin CI actions and base images to reviewed immutable versions, SBOM/image/secret scanning and update process |
| A04 Cryptographic Failures | High-entropy token secrets, hashed tokens, HTTPS account guard, PostgreSQL verify-full TLS requirement | Production key/secret custody, rotation, backup encryption and actual TLS validation |
| A05 Injection | Parameterized SQL, strict request fields, React text output, CSP, no arbitrary execution/fetch | Independent DAST and broader malicious-input coverage |
| A06 Insecure Design | Fictional-only bounded intake, no uploads/model tools, equipment uncertainty, quotas and acceptance gates | Abuse/availability exercises and human review of training/source integrity |
| A07 Authentication Failures | Expiring/revocable admin-issued tokens, memory-only browser credentials, authentication/rate-limit tests | OIDC/MFA, complete lifecycle and organizational access policies |
| A08 Software or Data Integrity Failures | Source locators/status, pending-source exclusion, publication/page binding, duplicate/URL validation | Human releasability/content review, approved ingestion pipeline and integrity/signature governance |
| A09 Security Logging and Alerting Failures | Minimal structured audit events; tests exclude credentials | Deployed alerting, log access/retention, detection and incident-response exercises |
| A10 Mishandling of Exceptional Conditions | Bounded streamed bodies, generic validation/DB errors, rejected malformed data, rate limits | Load/chaos testing, comprehensive failure handling and deployed resource/time limits |

## Changes in this milestone

The public APIs lacked application-level rate limits; only account endpoints previously enforced them. Public API requests now have a separate bounded per-process limiter (120 per direct client per 60 seconds). Account limits remain separate. Health and static routes are excluded; the edge must constrain those. Tests rotate spoofed X-Forwarded-For values and verify that they do not reset the limit. This does not provide distributed DDoS protection and clients behind the same proxy share an application-level limit unless a trusted deployment design addresses that.

The API now returns Cross-Origin-Opener-Policy and Cross-Origin-Resource-Policy same-origin, limits additional browser capabilities, and sets HSTS only when HTTPS is actually observed. Forwarded proto headers do not independently trigger HSTS. Reject/limit responses retain tested security headers. Static-host policy still depends on the actual host enforcing `_headers`.

`python scripts/validate_sources.py` is a build-time publication gate for the existing curated JSON corpus. It checks provenance structure and links without network access or document ingestion. It never turns a restricted document into approved content, verifies a classification, establishes citation entailment, checks every redirect or certifies technical interoperability. Source statements still require human review. Metadata-only automated checks are a foundation for a future isolated public-document review workflow, not an implemented PDF/RAG ingestion service.

## Prompt injection boundary

There is no generative model or agent in the deployed code. The mentor performs deterministic closed-corpus retrieval; mission interpretation uses local rules. User/source text cannot invoke tools, execute code, choose a server URL or grant access. Browser screening catches some instruction overrides, but is not a general prompt-injection defense. Any future LLM/RAG feature requires separate untrusted-context handling, source-poisoning/citation evaluations, abstention tests, output validation, cost limits and least-privilege tool restrictions before enablement.

## Validation

Local corpus gate, 23 catalog/security/provenance tests and 39 backend tests passed; two PostgreSQL-specific tests require the CI service. Existing CI also runs 20 web tests, browser journeys, dependency/SAST checks, PostgreSQL isolation/recovery and container constraints. Consult PR checks for the final result. No live penetration test, external deployment, restricted-manual ingestion or security certification was performed.
