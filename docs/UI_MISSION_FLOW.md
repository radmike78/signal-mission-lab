# Text-first mission flow — 18 October 2026

The charcoal/olive homepage asks **What is your mission?** and accepts a short fictional training description. Users confirm that it contains only fictional, non-sensitive information. Examples fill the text box without automatically submitting it.

## Interpretation and clarification

A local, deterministic interpreter recognizes supported mission categories, echelons, system names, environment descriptions and learning priorities. Clear information is reused. Missing or conflicting fields trigger targeted follow-up questions; a sufficiently complete description goes directly to recommendations. The readback shows the interpreted fields and lets users correct any of them.

This is a bounded rule-based feature, not general-purpose natural-language understanding or a generative model. Unrecognized requests need clarification and may be mapped only to the supported training categories. Mixed fires/intelligence descriptions retain their named systems while asking for a primary focus. Negated system names are excluded where the rule can recognize the negation. Complex language, indirect references and unfamiliar synonyms can still be misunderstood; users must review the readback.

Users who do not know the systems can request a suggested study starting point. This proposes a catalog research candidate, not an operational allocation. Results explain equipment candidates, service-dependency layers and validation questions. Interface, version, quantity and real-world suitability remain unverified. Radar is not drawn as an established application connection.

## Privacy and safeguards

Raw descriptions stay in component memory in the current browser tab. They are cleared after analysis, rejection or reset and are never sent to the API, placed in URLs, saved to browser storage or included in saved learning records. The retained brief contains only bounded, recognized categories. Reload clears it. In-page navigation preserves the bounded brief.

The text box is limited to 1,200 characters. Screening rejects common classification/control markers, credentials, IP addresses, coordinates, frequencies, operational-plan indicators, hidden controls, external URLs and common instruction-override patterns. Rejected text is cleared without being echoed. Rendering uses React text nodes, not raw HTML, and the interpreter executes no instructions or external calls.

Screening is heuristic and cannot identify every sensitive item or real operational plan. It is not a DLP or classification system. The user confirmation and explicit fictional-training boundary remain required; do not enter classified information, CUI, COMSEC, actual unit identifiers or real network plans.

## Validation

Unit tests cover full descriptions, skipped questions, missing/ambiguous information, mixed systems, negations, numeric false positives, rejected sensitive examples and instruction overrides, plus the existing recommendation rules. Browser tests cover direct recommendations, targeted follow-ups, corrections/navigation, rejection/clearing, absence of raw-text persistence, beginner guidance and mobile overflow. Existing learning and connected-account journeys remain in CI.

Screenshots in `docs/screenshots/mission-home.png`, `mission-questions.png`, `mission-recommendation.png`, `mission-home-mobile.png` and `mission-result-mobile.png` use synthetic descriptions. Latest CI results are available in PR #1.
