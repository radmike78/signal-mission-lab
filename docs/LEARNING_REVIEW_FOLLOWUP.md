# Learning review follow-up: first implementation milestone

This milestone acts on the 31 October 2026 content/learning/usability/security review. It preserves public synthetic training and large fonts. It does not establish operational readiness, complete equipment coverage, verified Army interfaces or faster learning outcomes.

## Changed behavior

- Recovery rubric v2 awards 0/1 for decision correctness supported by all required exercise evidence. Reading cards earns no correctness points. Evidence count and decision gaps remain separate in the instructor summary. Existing database rows and local 0..5 results are preserved and labeled `Legacy combined rubric`; no migration or historical score rewrite occurs. The local average excludes recovery and independent practice, avoiding a misleading mixed mastery percentage.
- Six follow-up cases (two each for build failures, routing and transport acceptance) ask for a discriminating check, a scoped action and acceptance evidence. The first choice locks before feedback. A later part explicitly assumes the approved modeled correction, even if the learner's previous choice was wrong; no unsafe action is executed or implied successful. These are fixed, editorial cases requiring technical review, not actual Army procedures or an adaptive simulator. Independent practice is local only; existing assigned recovery workflows remain server-scored.
- My training offers a device-only revisit schedule computed from existing bounded activity/score/time history. A failed attempt suggests one day; consecutive full first-choice results on distinct UTC practice days suggest 1, 3, 7 then 21 days. This is a testable initial schedule, not an empirically optimized interval. The 50-record history bound means old streaks can expire. No notifications, telemetry, account upload, mission text or free-text responses are added.
- The mission result initially focuses on the required user outcome. Systems/dependencies, preparation and planning questions are expandable. It explicitly states that echelon frames discussion and does not determine the shortlist. No unverified echelon-specific allocation is invented.
- Active troubleshooting stays mounted across navigation. Reloading or resetting clears the active case; completed results remain in device history. Starting practice from My training intentionally opens a new case. Route changes focus their heading and a skip link targets the main region. Narrow controls wrap at 320 pixels.
- Foundation distractors now use plausible neighboring dependencies instead of obviously irrelevant examples. Correct concepts remain unchanged; feedback identifies the mismatch with the observed symptom.

## Security and dependencies

Local-mode HTTP account access now requires both a numeric loopback peer and a loopback URL host. Forwarded headers and a `localhost` peer string do not bypass that check. Production still requires HTTPS; test mode is strictly for isolated fixture infrastructure. Hosting must never set `SML_ENV=test` for real users. Trusted proxy configuration, private origin access and edge limits remain deployment responsibilities.

The vulnerable build-tool chain is addressed with a scoped `rimraf` override to `glob` 14.0.3, resolving `minimatch` 11.0.3. The existing xcode/uuid override remains. Capacitor runtime/CLI versions are unchanged. Audit, native project generation and Android/iOS compilation are required to check compatibility; do not use a forced major downgrade suggested by npm audit.

Browser sensitive-text screening remains a best-effort guard, not DLP. No public app can infer classification reliably from arbitrary prose. Keep fictional input, no uploads or real-order workflow, local-only interpretation and the deterministic mentor. No generative model is introduced.

## Validation and residual work

New tests cover wrong decisions with all evidence reviewed, missing-evidence guesses, bounded transfer scoring, alternate cases, review scheduling and loopback/TLS enforcement. Browser checks cover focused results, keyboard destination focus, 320-pixel layout, navigation continuity, offline lazy-loaded follow-up cases, locked first choices, history retention and review prompts. Existing browser, authorization, PostgreSQL/restore, Podman and native CI checks remain required. Final status is recorded on the pull request.

Remaining work: public doctrine edition reconciliation; qualified review of all new/old lessons; fuller mission constraints and source-verified version/interface models; a richer fault-state simulator with rollback and observed acceptance; a larger unseen case bank; role handoff/teach-back rubrics; real Soldier usability and delayed-retention pilots; screen-reader and native-device acceptance; SSO/retention/monitoring/restore decisions; and store signing/publication. The six cases and revisit schedule have not been validated to improve speed or field performance.

Primary learning sources used in the review: Dunlosky et al., 2013 (https://doi.org/10.1177/1529100612453266); Agarwal et al., 2021 (https://doi.org/10.1007/s10648-021-09595-9); Renkl, 2014 (https://doi.org/10.1111/cogs.12086). Vendor references remain in data/recovery-exercises.json. They establish general concepts, not Army equipment configuration authority.
