# Signal Mission Lab

An unofficial mission-first Army Signal education platform using fictional scenarios and generic service dependencies. **Validated training milestone; not production-ready.** Never enter classified information, CUI, COMSEC, real OPORDs, credentials or operational network plans.

## New React/TypeScript application

Requires Node 24 and Python 3.12:

```bash
npm ci --prefix web --ignore-scripts
npm run build --prefix web
python scripts/package_web.py
python -m http.server 8000 --directory web/dist
```

Open `http://localhost:8000`. Mission requirements, guided MDMP exercises, equipment/provenance exploration, interactive synthetic dependencies, troubleshooting, assessments, session review and deterministic citation retrieval work without accounts or external services. The original prototype is preserved at `/legacy/` in the packaged build. To run it directly, serve the repository root as before.

## FastAPI and persistent learning

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8080 --no-access-log
```

The public training areas remain usable offline. The Instructor area can connect to a same-origin account API for cohorts, assignments and server-scored saved results. PostgreSQL is supported for deployment; SQLite is test-only. Read [account setup and deployment](deploy/ACCOUNTS.md) before enabling persistence. There is no public registration or organizational SSO yet. Never deploy the administrative DB identity with the API.

## Validation

```bash
python -m unittest discover -s tests -v
python -m unittest discover -s tests_backend -v
npm run build --prefix web
npm audit --prefix web
python -m pip_audit -r backend/requirements.txt
```

For browser tests, build/package, start the static server on port 8070, run `npx --prefix web playwright install chromium`, then `NODE_PATH="$PWD/web/node_modules" node scripts/browser-check.cjs`. The CI workflow also captures screenshots.

## Evidence and limitations

See the current [persistent learning/security report](docs/PERSISTENCE_REPORT.md), the earlier [training milestone report](docs/IMPLEMENTATION_REPORT.md), [delivery plan](docs/DELIVERY_PLAN.md), [source governance](docs/CONTENT_GOVERNANCE.md) and [security policy](SECURITY.md). Equipment associations remain conceptual and unverified. The [publication register and source review](docs/DOCTRINE_SOURCE_UPDATE.md) distinguish retrieved public passages, active APD metadata and pending documents; human review remains pending. The mentor is deterministic retrieval, not generative AI; the connected instructor area enforces cohort ownership and supports PostgreSQL-backed learning records with administrator-issued credentials. Organizational OIDC/MFA, reviewed doctrine coverage and verified production deployment remain future stages.

Screenshots: [mission](docs/screenshots/mission.png), [MDMP](docs/screenshots/mdmp.png), [graph](docs/screenshots/knowledge-graph.png), [architecture](docs/screenshots/architecture.png), [troubleshooting](docs/screenshots/troubleshoot.png), [assessment](docs/screenshots/assessment.png), [session review](docs/screenshots/instructor.png), [mentor](docs/screenshots/mentor.png), [mobile](docs/screenshots/mobile-mission.png).

Connected screenshots: [instructor cohort](docs/screenshots/connected-instructor.png) and [learner results](docs/screenshots/connected-learner.png).

## Mission-first guided workspace

The homepage asks **What is your mission?** Users enter a fictional training description; a local rule-based interpreter asks for missing or ambiguous details before producing an explained equipment research shortlist, conceptual architecture and validation questions. See [UI and mission-flow details](docs/UI_MISSION_FLOW.md). Raw text stays local and is discarded after analysis. Users can review and correct the recognized fields; sensitive-content screening is heuristic, not a classification guarantee. Equipment interfaces and suitability are never inferred.

[New homepage](docs/screenshots/mission-home.png) · [Guided questions](docs/screenshots/mission-questions.png) · [Mission brief](docs/screenshots/mission-recommendation.png) · [Mobile](docs/screenshots/mission-home-mobile.png)

Mission briefs also include a [requirements and evidence worksheet](docs/REQUIREMENTS_REPORT.md): choose a synthetic user outcome, review acceptance criteria and inspect the equipment evidence ledger. Simulation observations never establish equipment interoperability.

## Upper/lower tactical internet and modernization catalog

The equipment explorer now covers public WIN-T node/terminal families, tactical radios, ITN, mounted/dismounted systems, modern transport and enabling study categories. Browse by network area or capability type, inspect provenance, and select catalog entries during mission clarification. Read the [equipment coverage register](docs/EQUIPMENT_COVERAGE.md) for the exact included entries, blocked references and remaining gaps. This is not an exhaustive Army inventory or a verified interoperability database.

Run `python scripts/validate_sources.py` to validate curated source metadata before publication. See the [OWASP control review and release gaps](docs/OWASP_SECURITY_REVIEW.md). The command does not ingest documents or determine releasability.

## Podman container deployment

Build the OCI image with `podman build --format oci -f deploy/Containerfile -t localhost/signal-mission-lab:reviewed .`. Rootless systemd Quadlet configuration, file-mounted PostgreSQL secrets, smoke checks and operational instructions are in [the Podman runbook](deploy/PODMAN.md). The default listener is loopback only. Live TLS, database/identity setup and host acceptance remain required.
