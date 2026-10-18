# Signal Mission Lab

An **unofficial, educational** Army Signal learning prototype. Learn technical fundamentals, study publicly releasable equipment concepts, and practice translating **fictional** exercise objectives into communications requirements.

## Start
Run `python3 -m http.server 8000` from the repository directory, then open `http://localhost:8000`. The browser loads the local JSON catalog via HTTP. No account, API key, or external service required.

## Current prototype
- Fictional COMMEX / CPX / WFX scenario intake
- Echelon and training-objective selection
- Rule-based educational requirements outline
- Doctrine and equipment learning-library outline
- Browser-only processing: no uploads, backend, or AI service

## Roadmap
1. Reviewed doctrine and equipment records with source provenance and version tracking.
2. Synthetic mission requirements matrix and conceptual capability comparisons.
3. Interactive dependency diagrams with editable synthetic architectures.
4. Network troubleshooting simulations with fault isolation and after-action feedback.
5. Instructor review and progress tracking.

## Scope and safeguards
Do **not** upload actual OPORDs, sensitive unit information, network configurations, COMSEC material, frequencies, credentials, or CUI. The public prototype is not an operational planning tool and must not generate actual equipment allocations or operational connectivity instructions. Only publish equipment details supported by approved public sources. Human subject-matter review is required for system-specific claims.

## Architecture direction
Initial static web prototype. Proposed next stage: React/TypeScript UI, FastAPI service, PostgreSQL equipment knowledge graph, citation-backed retrieval, and a deterministic synthetic simulation engine. Keep any future authorized operational environment isolated from the public educational product.
