# Mission troubleshooting workbench

19 October 2026. The Troubleshoot area now includes three editorial synthetic cases alongside the existing incidents. No original incident, account assignment or score behavior was changed.

## Learning behavior

- **Failed builder:** translate automation into manual operations, correlate an error with partial state, inspect an explicit rerun/recovery contract, then identify a scoped recovery and user-task acceptance plan.
- **Tunnel versus routing:** distinguish underlay/tunnel evidence from OSPF adjacency, required learned routes and application reachability. The fictional fault is an area mismatch on an explicitly defined exercise link. It is not a JNN/CPN baseline.
- **Satellite dependency:** distinguish an acquisition indication from approved two-way transport acceptance and subsequent mission-service validation. Track the service owner and blocked downstream tasks. No alignment, transmit, frequency, power or RHN operating steps are provided.

Each case has four evidence cards, three recovery choices, explanations of unsupported decisions, a required-evidence gate, a recovery/acceptance plan and a mission-impact handoff. A correct guess without the required evidence does not produce a supported decision. Opening cards is only evidence exposure, not proof of comprehension or task performance. The workbench does not execute recovery actions or claim that a repair occurred. It has no grade, instructor persistence or certification meaning.

Switching case, reset and leaving the area clear local practice state. There is no free-text input, upload, command execution, model call, added credential, API mutation or browser-storage write. React renders authored content as text. Source links use HTTPS and new-tab isolation. Generic vendor references do not imply exact Army applicability or interoperability.

## Provenance and limitations

Public Cisco troubleshooting guidance and Microsoft PowerShell 5.1 documentation support general concepts. The Army SATCOM article supports historical training context only. All observations, wrapper behavior, recovery contracts, model state and answers are invented. Sources and their scope are expandable in the UI. These references are editorial curriculum sources, not additions to the machine-validated equipment claim registry. Technical/SME review remains pending, and actual builder runtime and equipment baselines are unknown. See `RESEARCH_ACQUISITION_REPORT.md` for manual access gaps.

## Validation

Strict TypeScript production build, 34 web model tests and 31 catalog/security tests pass locally. The model tests verify missing-evidence and wrong-decision rejection, valid complete decisions, invalid/duplicate evidence rejection and resolvable source references. Existing source validation passes without changing claim counts.

A dedicated browser journey is included in Platform validation CI for evidence gating, all three cases, reset, navigation state clearing, mobile overflow, preserved original incident selection and screenshot capture. Local browser installation failed because the download was truncated; CI browser results and screenshots must be checked before claiming browser validation. Other required CI jobs include PostgreSQL authorization, backup/restore, security and rootless Podman checks. Real-host deployment, generative mentor, reviewed equipment procedures, comprehensive instructor analytics and accessibility review remain open.
