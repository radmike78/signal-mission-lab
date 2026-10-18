# Security policy

## Reporting vulnerabilities
Do not disclose exploit details in public issues. Use the repository's private security advisory reporting if enabled, or contact the repository owner privately.

## Security baseline
- Public educational application only; never enter operational Army information, CUI, COMSEC, credentials, real IP plans, targeting data, or real OPORDs.
- Static client-side prototype: no user accounts, cookies, server-side processing, analytics, external JavaScript or LLM calls.
- DOM output must use textContent/createTextNode. Do not use innerHTML or dynamic code evaluation.
- Restrictive CSP and security headers are supplied in `_headers` for compatible Cloudflare Pages deployment. Confirm effective response headers after deployment.
- All future backend endpoints require explicit authorization, input validation, output encoding, rate limits, logging hygiene, request size limits, CSRF defenses when cookies are used, and secure secrets management.
- Use dependency pinning, scanning, secret scanning, code review, least-privilege CI permissions and tests before publishing.
- Use reviewed and releasable doctrine and equipment sources; AI output is never authoritative for operational integration.

## Threat model (initial)
Assets: integrity of doctrine/equipment content; learners' locally entered synthetic scenarios; future accounts and learning records.
Threats: XSS through catalog or scenario text, malicious dependency changes, supply-chain compromise, source poisoning, prompt injection in future RAG, unauthorized data ingestion, disclosure of sensitive operational content, excessive API cost, and misleading technical recommendations.
Mitigations: text-only rendering, CSP, provenance and review states, schema validation, non-sensitive data policy, explicit separation of untrusted retrieved text from instructions, no production AI until human review, least privilege, and CI gates.

## OWASP review gates
Track OWASP Top 10 risks in code review: access control, misconfiguration, supply chain, cryptography, injection, insecure design, authentication, integrity, logging and monitoring, and error handling. For LLM features also review prompt injection, insecure output handling, sensitive information disclosure, data/model poisoning, excessive agency, and unbounded consumption.

## Deployment verification checklist
- HTTPS enforced and headers checked in browser/network inspector.
- No externally loaded scripts or unexpected outbound requests.
- Run CI, static analysis and a dependency/secret scan.
- Verify accessibility and functional tests.
- Confirm no real operational data in seed content or example screenshots.
