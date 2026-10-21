# Offline/mobile preparation validation

Scope: public educational app, version 0.3.0, preparation for store testing. No store upload, device signing, accreditation or production-readiness determination.

## Completed local checks

- Production TypeScript/Vite build and versioned offline asset generation pass.
- 42 TypeScript tests pass, including malformed/oversized history, field stripping, 50-result bounds, concurrent writes/erase and recovery after storage failure.
- 36 content/source tests pass. Source validator reports 87 equipment entries; 8 equipment sources and broader human review remain pending. No new interoperability claims were added.
- 53 backend tests run: 50 pass; 3 PostgreSQL-only tests skip locally and are exercised by existing PostgreSQL CI.
- Browser journeys pass for mission intake/clarifications, sensitive-input rejection, focused troubleshooting, formative scoring, connected instructor flows, credential clearing and ownership isolation.
- Offline browser journey passes at mobile size: online install, network disabled, cold reload, previously unvisited lazy Signal products, all learning areas, result persistence over reload, erase without deleting unrelated settings, and no cached/replayed private API response.
- Screenshot inspection confirms readable mobile offline screen and collapsed secondary information. These are browser screenshots, not store-ready native screenshots.
- npm audit reports zero vulnerabilities after a scoped `xcode` → `uuid` 11.1.1 override. Native generators and CI iOS compilation validate compatibility; retain that override until upstream removes the vulnerable dependency.

Local browser execution used an npm-distributed Chromium binary because the standard Playwright browser download was unavailable in this environment. CI uses standard Playwright Chromium. No disabled web-security flags were used. Local server and browser ran in the same network namespace.

## CI and artifact evidence

The Mobile preparation workflow compiles an Android debug APK and unsigned release AAB, and a separate unsigned iOS simulator app. It inspects compiled privacy/configuration resources and merged Android release permissions before uploading test artifacts. Platform, security and rootless Podman workflows remain required. Refer to the latest checks on PR #3 for exact commit status and artifact availability; older failed attempts are retained for traceability.

Initial CI exposed missing Python/build-script dependencies in the OCI build stage and the Android setup action's retired `tools` package default. Both build definitions were corrected. The iOS simulator build and rootless Podman rerun passed before this report; final commit checks must also pass before merge.

## Remaining acceptance and release risks

Physical Android/iPhone/iPad testing, native accessibility/text scaling, OS storage errors/eviction, suspend/relaunch, upgrades and optional external links have not been verified on hardware. Native compilation is not proof of those behaviors. The iOS simulator artifact is unsigned and cannot be submitted to the store or installed on a phone.

Web offline support needs a successful first visit over HTTPS/localhost. Browser eviction can remove its saved copy. External source PDFs are not bundled; their offline availability and redistribution rights are not established. Instructor services remain web-only. The mentor remains deterministic; there is no offline generative model or remote AI. Device preferences are not a secret store and iOS backups may retain results. Offline content updates arrive with an applied web update or a native store update.

Owner must confirm identifiers, rights/artwork, developer identity/accounts, support/privacy URLs, signing arrangements and final store disclosures. Review `OFFLINE_MOBILE.md` and `mobile/store/` for the concrete submission checklist. Do not paste signing keys into chat. This package does not authorize classified/CUI processing or classified-network installation.
