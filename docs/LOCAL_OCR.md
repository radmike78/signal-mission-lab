# Local English OCR and mandatory transcription review

Open Document planner, confirm fictional training material, then select **Use local English OCR for a scanned PDF or image** before choosing a file. English PNG/JPEG images up to 5 MB, three megapixels and 4,000 pixels per side are supported. OCR PDFs are limited to three pages, rendered within the same pixel/side bounds. The ordinary text-PDF path remains limited to 30 pages. OCR never silently substitutes for text extraction unless selected.

## Review workflow

The app recognizes each page locally, shows a JPEG preview alongside editable text and reports engine confidence. Every page must be checked against the original, corrected and acknowledged before the source/task selector appears. Editing the transcription clears that page's acknowledgement. Confidence is not measured accuracy and does not remove the review requirement. Compare negation, names, numbers, timing, tables and markings especially carefully. The scrollable image preview supports inspection on a narrow screen; use the original for independent comparison.

After confirmation, citations explicitly say **reviewed transcription**. The source fingerprint remains the SHA-256 of the original input bytes. JSON exports include the OCR source format, per-page engine confidence and the self-reported transcription review; Markdown discloses OCR provenance. Images and complete page records are not embedded in exports, only selected quotations and worksheet edits. Model validation prevents unreviewed OCR from entering candidate selection, requirement creation, suggestions or export, and rejects detached text/page records. Review is a local acknowledgement, not authenticated approval or a factual-accuracy guarantee.

## Packaging and processing

Pinned dependencies: tesseract.js 7.0.0, tesseract.js-core 7.0.0 and @tesseract.js-data/eng 1.0.0. Build-time copying bundles the classic worker, fixed non-SIMD LSTM core/WASM and English integer-trained data into the same-origin assets directory. The build checks package versions and emits hashes and notices. Assets are included in the service-worker allowlist, native public bundle and disconnected ZIP. No CDN or external language fetch is configured. Dependency installation occurs at build time; runtime language downloads from the Internet are unnecessary.

The worker has explicit local asset paths, no blob worker and no IndexedDB language caching. Uploaded content is passed as local pixels, not as a URL or server upload. Recognition runs in a worker with a two-minute document limit, and active recognition is terminated on cancellation/completion. The app owns the native worker from startup and terminates it during initialization as well as recognition; no document pixels are submitted before initialization completes. A narrow adapter follows the pinned version-7 worker message protocol, with a build-time version gate and real integration tests guarding updates. PDF rendering has a separate bounded deadline. Clear/reload removes app references, not guaranteed secure erasure of host RAM, swap, browser caches or downloads.

PNG/JPEG headers are checked before browser decode; decoded images and PDF rendering are bounded again. These guards reduce resource exposure but are not a complete hostile-file sandbox. Blank/unreadable pages, excessive dimensions, too many pages, sensitive-content screen matches and unsupported files fail import rather than becoming assumed requirements. Handwriting, poor scans, rotated/complex layouts, embedded annotations and non-English text may be wrong or unsupported. The current environment remains fictional-training only; OCR is not a classification detector or authorization for actual documents.

The CSP adds `wasm-unsafe-eval` for WebAssembly compilation and restricts workers to self. JavaScript `unsafe-eval`, external scripts and blob workers remain disallowed. Static and API-hosted headers use the same policy. OCR tests use response headers on worker/core assets as well as the page, rather than relying on a permissive development origin.

## Tests and remaining work

Model tests exercise unreviewed-source rejection, per-page confirmation, edited/negative text, original fingerprint retention, detached provenance rejection and pre-decode image limits. Browser tests recognize actual rendered English text in PNG and an image-only PDF while offline under CSP, enforce correction/acknowledgement, test cancellation and blank/over-limit rejection, inspect exports, and check no external requests, IndexedDB or practice-history writes. Desktop/mobile layout and automated accessibility are checked. The extracted disconnected ZIP repeats the OCR journey from a fresh origin. These are synthetic functional fixtures, not an accuracy benchmark across unit documents or device acceptance on native hardware.

Next: representative instructor-reviewed OCR/layout accuracy evaluation, larger-document job handling if justified by performance tests, structured semantic-analysis evaluation and an approved local/in-enclave model adapter. No generative model, provider credential, new inference endpoint or permission to process controlled documents is added.

## Public implementation references

- Tesseract.js API and local installation: https://github.com/naptha/tesseract.js/blob/master/docs/api.md and https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md
- Pinned installed package source was inspected for fixed-file core loading, worker creation, cache settings, recognition and termination behavior.
- English data provenance: https://github.com/naptha/tessdata ; its upstream Apache license is retained alongside the package's declared metadata and the OCR engine/core licenses. No build-time network fetch is used for notices.
