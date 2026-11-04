# Proposed unit-hosted and classified deployment architecture

Status: design proposal, not a security authorization. The current application and disconnected package remain for fictional training material only. No classified/CUI input mode is implemented or enabled.

## Product editions and boundaries

| Edition | Intended future use | Boundary |
| --- | --- | --- |
| Public training | Fictional/public demonstration material within the current training rules | Existing site and training data rules |
| Unit-hosted unclassified | Specific nonpublic/CUI information types approved by the mission owner | A separately assessed and authorized unit environment |
| Enclave installation | The classification, compartments, releasability and user population explicitly authorized for that system | A separate approved enclave; separate identity, storage, logs, backups, browser profiles/endpoints and release process |

Shared source code does not mean shared data or authorization. Do not create a public-site classification toggle, mixed unclassified/classified upload store, automatic cross-domain synchronization or a route from a classified instance to the public site. A classified enclave may process lower-classification inputs subject to its procedures, but resulting files and summaries stay within its handling boundary unless an authorized release/transfer process permits otherwise. An AI summary is not automatic declassification.

An air gap restricts connectivity; it does not establish clearance, need-to-know, approved handling, system authorization, sanitization or protection against malicious documents. Even browser-only processing involves the endpoint, RAM, swap, crash reporting, extensions and downloads. Clearing application state does not securely erase all host artifacts.

## Proposed local processing design

Inside one approved boundary: managed user endpoint -> application -> bounded extraction/OCR -> proposed-requirement analysis -> citation validation -> human review -> controlled worksheet storage/export. The OCR engine, model inference, embeddings/indexes, supporting services, administrative interfaces and update mechanism must all stay within that boundary and its authorization scope. An approved in-enclave inference endpoint could replace local inference only when the complete data path is permitted.

The current rule-based workbench already runs without a model/API. For future semantic analysis, define a structured adapter returning source IDs/quotations, proposed capability, reasoning, missing information and confidence limits. Independently validate citations and bounds. Treat document instructions and retrieved text as untrusted data; do not let a document initiate tools, network requests or privileged actions. Validate output using fictional instructor-reviewed examples before seeking operational use. No GenAI.mil API access or authorization is assumed.

## Engineering and operational requirements to resolve with the system owner

- Complete data-flow and authorization-boundary diagrams, including administrator/support access, endpoint controls, temporary files and failure paths.
- Managed identity, clearance/need-to-know enforcement where applicable, least privilege and role separation; authenticated review and content-free audit events.
- Approved transport/storage protection and key management as applicable to the actual boundary; secret-free software images and installation media.
- Enforced egress restrictions, no external telemetry/CDNs/license checks, and explicit allowlists for any permitted internal services.
- Bounded/sandboxed document parsing and OCR, malicious-file handling, resource quotas and assessed model/document-injection behavior.
- Owner-defined document/output markings, retention, backups, restore, export, printing and media-transfer procedures. Derived drafts retain appropriate handling pending authorized review.
- Release provenance, trusted signatures, SBOM, dependency/vulnerability evidence, configuration baselines, applicable hardening checks, offline patch/model delivery, rollback and repeatable installation tests. Checksums alone are not trusted signatures.
- Security assessment evidence and risk decisions for the entire deployment, including inherited controls and their limits. Existing hosting authorization does not automatically approve a new application/model.

Actual categorization, controls, authorization path and approval are determined with the responsible security organization and authorizing official. There is no app setting that grants permission to process classified information.

## Current disconnected demonstration

After the production build and `python scripts/package_web.py`, run `python scripts/package_disconnected.py`. CI also publishes `disconnected-training-demo` as an artifact. The ZIP contains built public assets, bundled parsers/workers, parser notices, a training-only startup guide and SHA256SUMS. No dependency download or Internet model is required to run the demonstration after approved transfer. It includes no AI or OCR engine and no operational-data capability. Follow START_HERE.txt, verify checksums, and use a loopback HTTP server on the same machine. A real multi-user enclave installation needs a separately engineered and approved hosting configuration.

## Public references checked 2026-11-03

- NIST RMF Authorize Step: https://csrc.nist.gov/Projects/risk-management/about-rmf/authorize-step — page content retrieved. Describes the senior-official risk decision and authorization package; it does not approve this product.
- DoDI 8510.01, Risk Management Framework for DoD Systems: https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/851001p.pdf — official search text retrieved; direct PDF fetch returned 403. Consult the current authoritative copy with the sponsoring security office for applicable requirements.
- DoD Cloud Security Playbook, Volume 1: https://dodcio.defense.gov/Portals/0/Documents/Library/CloudSecurityPlaybookVol1.pdf — official search text retrieved; direct PDF fetch returned 403. Cloud impact levels distinguish information sensitivity: IL4/IL5 for applicable unclassified/CUI cases and IL6 up to SECRET. They describe cloud offerings and are not product certifications for an on-premises appliance or an authorization for all classified information.

The current training package includes an extracted-file verifier and a fresh-origin browser smoke test of the ZIP. This improves release integrity and disconnected reproducibility; trusted release signatures, deployment hardening, authenticated reviewer workflows, OCR/model services and actual-data authorization remain unfinished.

Local English OCR is now bundled in the training build with mandatory human transcription review; see [OCR scope](LOCAL_OCR.md). This closes a technical dependency for scanned-document demonstrations, not the semantic-analysis, deployment-hardening or authorization gaps.
