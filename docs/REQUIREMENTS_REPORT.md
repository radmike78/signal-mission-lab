# Mission requirement and evidence worksheet

19 October 2026 UTC. This milestone adds a bounded worksheet to the existing mission brief. It preserves the fictional-only intake and existing recommendation flow.

## Behavior

Learners select a user outcome (synthetic product exchange, application access, simulated voice, or recovery). Each produces an observable acceptance criterion and a coordination prompt. They can record an unverified, self-reported simulation observation. Changing the outcome clears the previous observation. This worksheet does not execute a simulator, save a grade, assign an equipment owner, or certify an interface.

The evidence ledger shows all study candidates, their catalog dependency/role prompts, and any registered equipment-purpose claims with source locator, review status and scope. Related candidate pairs show their existing conceptual graph edges and explicitly missing interface evidence. No new factual equipment or doctrine claims are introduced; no source is promoted to human-reviewed status. A passing synthetic observation cannot change interface confidence. The absence of a relationship is not evidence of compatibility or incompatibility.

## Security and limitations

Only allowlisted controls are accepted by the worksheet model. React escapes rendered content; registered links are static source records. No new text input, network request, persistence, secrets or execution capability is introduced. State is held in the mounted mission workspace and resets with a changed mission scope or Start over. Existing source review and sensitive-content screening limitations remain applicable.

The outcome rubric is editorial training content, not a doctrinally complete requirements analysis. It does not yet capture multiple information exchanges, quantities, throughput, latency, actual endpoints, operational locations, version-specific interfaces or implementation procedures. Equipment overview dependencies and participants remain unverified. Production authentication, reviewed corpus and deployment acceptance remain outstanding.

## Validation

TypeScript build and 17 web model tests passed locally. Browser regression checks cover outcome changes clearing stale observations, source gaps, retained interface uncertainty, mission flow and mobile overflow. CI also runs the existing backend, PostgreSQL, dependency/security, browser and constrained-container checks. Consult the PR checks for their final result.
