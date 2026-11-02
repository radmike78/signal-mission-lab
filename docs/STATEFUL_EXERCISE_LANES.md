# Stateful exercise lanes

Signal Mission Lab complements AI explanations with a repeatable fictional exercise that changes state as the learner acts. Open **Exercise lane** from More learning tools, the mission homepage, or **Run an exercise lane** in Troubleshoot.

## Delivered behavior

Three fixed lane codes cover an unavailable network handoff, unavailable application synchronization, and both faults together. COMMEX, STAFFEX and WFX select different staff-task prompts; they do not change the grading standard or claim to prescribe exercise doctrine.

Learners choose checks and modeled changes. Observations depend on the current state. Restoring the handoff can expose a second fault rather than finish the exercise. Every change invalidates previous sender, recipient and freshness proof. The observed-service picture shows only recorded checks, not the hidden fault state.

Four formative criteria assess supported diagnostic changes, a bounded initial mission-impact report, end-to-end acceptance after the last change, and a final leader handoff. Viewing results earns no correctness credit. The first initial-impact choice counts. Unsupported or unnecessary changes remain visible even if service is accidentally restored. An early handoff can finish with gaps. Up to 40 actions are allowed; the last slot is reserved in the UI for handoff.

The exercise records action sequence and invented action costs. Modeled minutes are not elapsed time or a validated speed standard. Instructor setup explains the fault and discussion prompts; the exercise is transparent practice, not a protected examination.

## Instructor use

Assign the same lane code and environment for a repeatable starting condition. Have learners work, then discuss the observations and four-part rubric. Another lane supplies a different dependency failure. The instructor can discuss AI-assisted learning and subsequent independent practice, but the app does not monitor external AI use, establish a controlled comparison or prove retention from one attempt.

Web users can explicitly download a JSON debrief with lane/environment, action trail, observations, rubric, modeled time and export timestamp. It is editable and self-reported. It is not an authenticated instructor submission and does not automatically appear in connected cohort reports. Native users retain an on-screen debrief; no filesystem or external-service permissions are added.

## Privacy and offline behavior

The lane accepts only supplied selections. No names, mission text, credentials, addresses or live settings are requested. The active run remains in React memory while browsing other tools; reset/reload clears it. Only activity, score, total and time enter the existing bounded 50-result device history. Action trails persist only if explicitly exported. There is no GenAI.mil API integration, external AI service, server-side grading endpoint, database migration or operational-system connection.

The lane is a separate lazy-loaded chunk included in the offline allowlist and native bundle. Offline checks exercise cold loading and the complete lane journey.

## Evidence boundaries and validation

The state model, dependencies, results, costs and exercises are editorial inventions with technical review pending. No exact equipment configuration, interoperability, accreditation or readiness claim is made. Applicable equipment manuals and human review are still needed for future system-specific emulation.

Model tests cover all nine lane/environment combinations, partial recovery of independent faults, missing acceptance evidence, wrong first impact statements, unnecessary changes, receipt requirements, invalid logs and post-completion actions. Browser checks cover offline loading, all three fault cases, repeatability, cross-tab continuity, exports, summary-only storage, reset/reload, keyboard focus and mobile accessibility. Source publication checks enforce bounded editorial definitions. Existing browser, connected-learning, accessibility, security, database, container and mobile CI remain required.
