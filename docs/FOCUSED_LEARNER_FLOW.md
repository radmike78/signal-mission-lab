# Focused learner flow

19 October 2026. The primary troubleshooting path now presents a reported symptom and one evidence check at a time. A learner views the invented result, reads the observation and advances. Explanations, example code, mission context, earlier evidence and source detail are optional disclosures. The final decision follows the checks and reveals a recovery/acceptance plan only when the evidence supports it.

## Interaction and scope

- One current check is visible. Check position is separate from evidence exposure; previous/review navigation preserves the case's collected evidence.
- Explanations and the display-only PowerShell example start collapsed. Moving to another check resets that check's disclosure state.
- A secondary “Review progress or decide early” disclosure allows a formative decision before all evidence. Missing evidence still prevents a supported decision and full server score; “Review checks” resumes at the first missing result.
- Switching/resetting a case or changing assignment clears progress and decision feedback. Primary controls move keyboard focus to the current step heading. The existing busy state prevents controls changing during a save.
- Instructor assignments use the same guided component and retain the existing server validation, scoring and persistence. No new database migration or scoring change is introduced by this UI milestone.
- Older DNS/identity/power incidents remain available under “Other practice incidents.” The mission requirements page retains the visible acceptance criterion and interface uncertainty; its detailed equipment evidence/relationship ledger is available on demand.

This is mission-specific practice, not a requirement to complete a networking course. Further subject lessons remain separately available. The sequence is an authored teaching path, not a recommended live-equipment troubleshooting order. Exercises and results remain fictional and require technical review.

## Validation

Strict TypeScript build, 38 web model tests, 31 catalog/security checks and source publication validation pass locally. Backend suite: 53 tests run, 50 pass and three PostgreSQL-only checks deferred to CI. Rubric and data schemas are unchanged.

Updated browser journeys verify one visible check, hidden decision choices and script detail at entry, optional explanation/code, early-decision evidence gating, return to the first missing check, complete decisions across all cases, reset/case/navigation isolation, mobile width, preserved older incidents, source-ledger disclosure and assigned weak/corrected attempts. CI captures `troubleshooting-focused-start.png`, a script-detail screen, recovery decisions, mobile views and instructor results. Consult the latest workflow result before treating browser/Podman/PostgreSQL checks as validated.

Learning-outcome research, full accessibility review, human technical review and real-host deployment remain pending. No classified/CUI/COMSEC inputs, real plans, device execution, generative model or additional credentials are enabled.
