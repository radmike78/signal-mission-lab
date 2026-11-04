# Document-to-Signal requirements starter

Open **Document planner** from More learning tools, or **Translate a fictional document into Signal requirements** on the Mission homepage. The built-in fictional memorandum provides a repeatable demonstration without uploading a file.

## What this version demonstrates

1. Confirm fictional, non-sensitive training content; select Mission, COMMEX, VALEX, STAFFEX or WFX as the worksheet context.
2. Read UTF-8 TXT/MD, clean DOCX or a text-based PDF locally. Review all extracted passages and their location references.
3. Review candidate task matches and manually select source passages. Any passage can be added when the matcher misses it.
4. Build editable proposed requirements. Record the capability, reasoning, sender, recipient, information exchange, timing, authorized method, owner, alternate, receiving-user acceptance and mission impact.
5. Label each proposal Derived, Assumption or Unresolved. Exact source quotations stay unchanged. Missing answers remain visibly unresolved.
6. Acknowledge the review per row and export a draft Markdown or JSON worksheet with citations, original-input SHA-256, analysis method and gaps. Editing a field invalidates its review acknowledgement.

The original quoted passage is a source task selected by the learner. Proposed capability fields are not automatically promoted to directed requirements. The prototype does not infer equipment allocations, bandwidth, radio parameters, protection settings or approved architectures. Exercise context is a worksheet label; it does not silently impose a different doctrine or approval standard.

## Extraction and privacy

No AI model, upload endpoint, analytics event, database record or local history write is used. Uploaded files, extracted passages and worksheet edits stay in the active component's memory. Navigation within the app retains the work; Clear session cancels active work and clears it, while reload also removes it. Export is an explicit local download containing selected quotations and edits. File names are not retained in the worksheet.

The size limits are 5 MB input, 30 PDF pages, 60,000 text characters, 300 source passages and 40 selected requirements. Each worksheet field is bounded to 1,200 characters. A content screen rejects certain controlled markings, obvious operational detail, control characters and instruction overrides. It is not a classification, sanitization or data-loss-prevention capability. The current environment remains for fictional material only.

PDF.js extracts text using a bundled same-origin worker. PDF scripts, links, attachments and XFA are not executed. No document URL is fetched. Empty-text pages, including scanned or blank pages, reject the import rather than silently omit content; OCR is not implemented. Tables, multi-column text and images may carry information that text extraction cannot preserve. Review the original. A PDF timeout destroys its task and worker.

DOCX text parts are decompressed in a disposable worker with a timeout and per-part/aggregate bounds. Only the main document, headers, footers, footnotes and endnotes are selected. XML declarations of external entities/DTDs and tracked revisions are rejected. Only Word paragraph text is rendered, never imported HTML. Comments, images, embedded attachments and text boxes are not relied upon; their omission is disclosed. Paragraph identifiers refer to XML parts, not Word's rendered pagination. PDF references use page plus extracted paragraph; text references use nonempty line order.

Uploaded text is untrusted evidence. It cannot change application instructions, trigger tool calls or execute code. React renders text; the Markdown export escapes markup. This rule-based first phase does not establish general prompt-injection resistance for a future AI integration.

## Evaluation before an Army-facing pilot

Use fictional directives with instructor-reviewed expected requirements. Track missed and false candidate tasks, correct quotation/location references, unanswered dependencies, reviewer corrections, time to produce a usable worksheet, and the Soldier's ability to explain the mission consequence. Include negated tasks, conflicting instructions, missing annexes, scanned pages and multi-column documents. Do not treat a polished worksheet or a checked review box as proof of correct analysis.

The next stages are verified OCR, better table/layout handling, a structured analysis adapter to a separately approved service, reconciliation of conflicting tasks, and authenticated reviewer workflows. Actual unit documents require a separately established permitted handling/processing environment. Nothing in this starter establishes approval to process them or integration access to GenAI.mil. Procurement, accreditation and production suitability remain outside this implementation.

## Technical references and validation

- PDF.js API: https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html — local byte input, text extraction and worker/task APIs.
- PDF.js distribution: https://mozilla.github.io/pdf.js/getting_started/ — bundled display and worker modules.
- fflate: https://github.com/101arrowz/fflate — filtered ZIP extraction and original-size metadata. Pinned version 0.8.3 is used in a terminated-on-timeout worker.

Node tests cover source linkage, explicit gaps, negative requirements, invalid evidence, content limits, escaping and Word text-part limits. Browser checks cover offline TXT/PDF/DOCX import, review/edit/export, retained session state, rejected formats and sensitive markers, empty-text PDF, XML entities, reset/reload, no application writes and desktop/mobile accessibility. Existing PR checks cover the rest of the application, dependencies, containers and native builds. These tests do not establish semantic accuracy across arbitrary orders.

For separate unclassified/CUI and classified editions, see [proposed deployment boundaries](CONTROLLED_ENVIRONMENT_ARCHITECTURE.md). The current build remains training-only.

## Source-backed suggestions and opposing wording

The second iteration recognizes only a simple explicit sender-will/shall/must-send/submit/provide/transmit-information-to-recipient pattern with optional supported timing wording. It abstains on conditional, negative or compound/ambiguous patterns. Suggestions remain opt-in, fill only empty answers and never infer application, equipment, support owner or protection settings. Each applied field keeps its exact quote and source reference. Manual field editing removes that citation and invalidates the review acknowledgement. Narrow grammar matching is not general semantic analysis.

A separate check pairs matching directive wording with opposite negation for human review. It does not resolve precedence, different scopes or every contradiction. Worksheet schema version 2 exports field-level provenance and paired passages in JSON; Markdown includes retained field citations and the opposing passages. Earlier version-1 consumers need to accommodate these additive fields and version change.

The disconnected package now includes an integrity verifier, which rejects changed, missing, extra or symlinked files before startup. It does not establish authenticity, trusted origin or authorization. CI extracts the actual ZIP, verifies it and runs the document browser journey from a fresh local origin, including offline parser workers, CSP, explicit exports and no external app requests. Browser/OS traffic outside the application remains a separate host concern.

## Local OCR update

Optional local English OCR now supports bounded image/scanned-PDF import with mandatory page-by-page correction and review. The earlier text-only/scanned-page rejection behavior still applies when OCR is not selected. See [current OCR behavior and tests](LOCAL_OCR.md); all other content/handling boundaries remain in force.
