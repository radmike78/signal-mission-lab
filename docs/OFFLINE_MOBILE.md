# Offline and mobile preparation

The first mobile edition bundles public training in Capacitor 8.5.3. The React interface and large typography are retained. FastAPI/PostgreSQL remain the connected web service; no local PostgreSQL, backend or generative AI is required on a phone. No classified-environment authorization is implied.

## Build from this repository

Use Node 24, Python 3.12+, and `npm ci --prefix web --ignore-scripts`. Run:

```
python scripts/prepare_mobile.py android
python scripts/prepare_mobile.py ios
```

Android requires Java 21 and Android SDK 36. iOS requires macOS/Xcode 26+ and iOS 15+. Android minimum SDK is 24. Generated `web/android` and `web/ios` are disposable and ignored; the pinned CLI, `web/capacitor.config.json` and overlay script are the source of truth. Do not edit generated projects without moving changes back into the overlay. Do not run `cap sync` alone for a release; always rerun the preparation script so security overlays and privacy resources are applied. Build version/code are centrally set in that script; increment before each store upload. The current identifier is provisional and must be confirmed before registering store records.

Android: `cd web/android && ./gradlew :app:assembleDebug :app:bundleRelease`. Debug APK is test-only; the release AAB is unsigned. iOS: open `web/ios/App/App.xcodeproj`, select the owner's team, test physical devices, then archive a Release device build. Unsigned simulator CI output cannot be installed on a physical iPhone or uploaded as an IPA. CI does not publish or use signing secrets.

## Offline boundary

Native: public lessons, catalog, guided mission analysis, diagrams, synthetic troubleshooting, assessments, deterministic mentor and Signal products are bundled at install. Instructor/account UI is hidden; its API rejects calls in native mode. Android INTERNET permission is removed; iOS has restrictive ATS, self-only content policy and no remote server URL. Explicit public HTTPS source links open a separate browser; they are not offline manuals. No downloadable restricted/manual corpus, telemetry, ads, remote AI, background sync or push notifications are added.

Web: production builds create a versioned service worker that precaches only exact public HTML, manifest, hashed assets (including lazy modules) and icons. First visit needs HTTPS or localhost plus a connection; wait for Offline & privacy to say ready. API paths, authorization-bearing requests, non-GETs, query URLs, external sources and legacy prototype are excluded. A failed precache never activates a partial version. Updates wait for an explicit apply action; cached content reflects that build's source-review status and may become stale. Browser eviction remains possible. Serve `sw.js` with `Cache-Control: no-cache` and do not rewrite missing assets/API routes to HTML. Existing Podman deployment can serve this same dist; it must be reachable before the web app can first install. Static cache is not an instructor database backup.

Practice history is bounded to 50 entries with activity/score/total/time, validated on read/write and serialized to avoid lost concurrent writes. Web uses localStorage, native uses Preferences (SharedPreferences/UserDefaults). Erase only this app's history from My training. It is local formative evidence, not a gradebook or secure vault. No mission text or access tokens are added to persistent history. OS backup rules differ: Android disables/excludes backup; iOS preferences may be in user-controlled backups. The iOS UserDefaults privacy reason is CA92.1 and the privacy manifest is explicitly included as a build resource.

## Security and validation

No unrestricted remote WebView navigation, cleartext traffic, mixed content or release WebView debugging is configured. Scripts and rendering remain CSP-restricted; React escapes learner text. Native external links require a user click and HTTPS. No signing secrets belong in git. Device preferences are not encrypted secret storage. Dependencies remain pinned and CI audits them; changes to plugins require a privacy/permission review.

CI runs existing source, backend, authorization, browser and container checks, new bounded-storage tests and a real offline browser journey. The mobile workflow generates both projects and compiles Android debug APK/unsigned release AAB and an unsigned iOS simulator app. These are build checks, not physical-device acceptance or app-store approval.

Before release, record pass/fail on Android and iPhone/iPad for first launch in airplane mode, force-close/reopen offline, mission flow, lazy Signal products, every recovery case, assessment/history/erase, text scaling/VoiceOver/TalkBack, safe areas/orientation, Android back, low-storage/error handling, optional source links, and upgrade without loss of practice. The AndroidX internal dynamic-receiver permission is allowed only with app-signature protection; internet and sensitive permissions are rejected by the build check. Inspect the merged Android manifest and final iOS app resources/privacy report; verify no unexpected network traffic or sensitive permissions. Run Play pre-launch checks and TestFlight testing. Use store-console testing requirements applicable to the owner's account at submission time.

## Publication gates

1. Owner confirms permanent identifiers, legal identity, public content redistribution rights, artwork, support contact and public privacy/support URLs. Drafts are in `mobile/store`.
2. Owner enrolls/verifies Apple Developer and Google Play accounts and accepts their agreements/fees.
3. Configure Android Play App Signing/upload keystore and Apple team/certificates/provisioning securely. Never paste private keys into chat. CI publishing, if later requested, needs protected environments and least-privilege release credentials.
4. Complete actual native device testing, final binary/privacy/security review, screenshots and age/export/data-safety declarations; resolve defects.
5. Owner authorizes submission; submit signed AAB/archived iOS app to internal testing/TestFlight before production review. Store approval is not guaranteed; the interactive offline mission/recovery tools should be demonstrated to reviewers.

Do not distribute this public-store package into a classified environment as an accredited solution. A separate approved offline distribution, content boundary and organization authorization are still needed.

## Primary references checked 2026-10-21

- https://capacitorjs.com/docs/updating/8-0
- https://capacitorjs.com/docs/config
- https://capacitorjs.com/docs/apis/preferences
- https://capacitorjs.com/docs/ios/privacy-manifest
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://google.play/business/pre-launchreports/
