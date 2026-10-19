# Connected recovery learning

19 October 2026. Instructors can assign the builder, routing and satellite recovery cases to existing cohorts. Learners use the same case content as offline practice and explicitly submit evidence identifiers and a recovery decision. The service derives the case from the owned/membership-checked assignment and calculates the score. Clients cannot supply a score, choose a different case, or mix legacy assessment/diagnosis inputs into a recovery submission.

## Rubric and instructor coverage

Each case has four required evidence cards and one recovery decision: one point for each reported evidence exposure plus one for a supported decision, out of five. Complete support requires all evidence and the supported decision. A correct guess without evidence earns only 1/5. This is formative practice; exposed answers and self-reported evidence do not demonstrate comprehension, repair performance or qualification.

Instructor summaries use the latest result for each current learner/assignment pair. Unattempted pairs remain visible, repeated attempts do not increase attempted coverage, and an old weak attempt does not conceal a later corrected result. Recovery gap counts separately identify missing evidence and an unsupported decision; both can apply to one attempt. Existing legacy full-score results count toward the common formative-completion metric, not recovery-specific gaps.

The history table remains bounded to 500 recent attempts. Coverage is calculated separately from the latest result for every current learner/assignment, so older assignments outside that history window are not silently counted as unattempted. Current limits bound a cohort to 100 learners, 100 assignments and 20 attempts per learner/assignment; SQL window selection limits summary input to at most 10,000 latest results. Query/lock timeouts and authenticated request limits remain in force. Load testing at those maximums remains outstanding.

## Data and migration

`data/recovery-exercises.json` is now the shared editorial definition for offline and server grading. It remains human-review pending. The offline publication gate checks the case set, four-evidence rubric, answer/source links and primary reference origins without fetching or executing content.

Schema version 2 adds `recovery_assignments` and `recovery_attempts`; it does not rewrite existing assignment or attempt rows. Existing constrained assignment activities remain unchanged internally: the new assignment extension identifies the recovery case, and API reads resolve that extension into the displayed activity. Recovery attempts retain only case ID, evidence count and decision-supported indicator alongside the existing score/time/account references. No scripts, raw descriptions, real configuration or free-text explanation are stored. Foreign-key cascades remove extension rows with the parent assignment/attempt and existing account/membership deletion.

Run `python -m backend.manage migrate` with the migration role before deploying this revision. Reapply `deploy/runtime-grants.sql` to grant the runtime role SELECT/INSERT/DELETE on the two new tables. It receives no schema rights or extra account privileges. The migration role owns schema changes; runtime startup does not migrate. Existing backups remain valid, and the CI restore drill now verifies schema versions 1 and 2. Stop the old app during schema/permission update and follow the existing backup/rollback procedure. Rolling the application back leaves the extension tables intact; an old application would label recovery assignments as assessments, so block access to those assignments or restore the matching database backup before rolling back.

## Security and verification

Assignment creation and reads use instructor ownership/current membership checks. Submission uses the existing learner lock, membership gate, 20-attempt limit, parameterized SQL, strict request schema and server grading. Unknown/duplicate evidence, another case's choice, forged scores and mixed payloads are rejected. No new endpoint, upload, remote fetch, generative model or tool execution is introduced. External links and source scope remain visible; vendor concepts do not establish Army equipment applicability.

Local strict TypeScript build, 38 web model tests and 31 catalog/security tests pass. Backend tests run with the pinned local dependencies: 53 tests including three PostgreSQL-only checks deferred to CI. Tests cover grading, latest-result summaries, invalid inputs, authorization, deletion, additive/idempotent migration and source-gate rejection. Connected CI browser checks exercise weak/corrected saved attempts, dashboard gaps, mobile layout, refresh/reload, legacy assessments and credential clearing. Consult the latest PR workflow results for full PostgreSQL, backup/restore, browser, security and rootless Podman validation.

Remaining: custom instructor authoring, performance-based assessment, fine-grained saved answer feedback, wider troubleshooting content, organizational OIDC/MFA, technical/learning review and real-host deployment validation. No production-readiness claim.
