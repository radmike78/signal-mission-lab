# Supplied doctrine source update — 18 October 2026

Three owner-supplied Army Publishing links are now registered in `data/publications.json`.

## FM 6-0 — ARN35404

Retrieved the official 224-page PDF through document retrieval. Visually inspected the title page and the cited pages. Confirmed edition: 16 May 2022; public-release notice present. This verifies that edition's identity, not its current/superseding status. Human doctrine review remains pending.

Added three short paraphrased claims with printed and PDF page references:

- G-6/S-6 staff role: paragraph 2-67, printed 2-14, PDF 34.
- Annex H responsibility: paragraph 2-68, printed 2-14, PDF 34.
- Running-estimate analysis and recommendations: paragraphs 2-12 to 2-13, printed 2-3, PDF 23.

The MDMP area displays these sources and the publication register. The bounded mentor supports Signal staff and running-estimate topics through the same claim records. No equipment interfaces, allocations or interoperability claims were added. The MDMP seven-step prompts still require FM 5-0 content validation.

## FM 5-0 — ARN42404

The supplied official URL repeatedly timed out in document retrieval. Direct download returned HTTP 502. An official Army article references the same URL as a November 2024 FM 5-0, but the primary PDF title page and contents were not retrieved. Its register entry is `retrieval_pending`; no claims are sourced to the inaccessible PDF and its latest-edition status is not established. A public-release PDF upload would enable direct review.

## ADP 5-0 — ARN18126

Retrieved the official 105-page PDF and visually checked its title and cited page. Edition: 31 July 2019; public-release notice present. Added a short operations-process claim with paragraph 1-15, printed 1-4, PDF 14, available in the planning area and mentor. Current-edition and human review remain pending.

## Provenance limits

No local manual binaries are committed, so no binary checksums are claimed. FM 6-0 and ADP 5-0 claims are grounded in the official PDF retrieval and page-image checks. Publication edition, retrieval status, human review and technical compatibility are deliberately separate fields.

Validation adds tests that pending publications cannot back checked claims and that the new mentor topics return edition-specific citations. Existing synthetic exercises, authentication and saved learning behavior are preserved. See PR checks for build and regression results.

## APD catalog search results

Searched APD's FM, ADP and ATP collections and followed individual record links. FM 5-0's active record lists Change 1 dated 11 August 2025 and links ARN44590, replacing reliance on the supplied base-file link. The 15,351,895-byte PDF exceeded document-retrieval size limits and direct download returned 502; its contents remain pending.

Confirmed active catalog records for FM 6-0, ADP 5-0 and FM 6-02. Retrieved FM 6-02 (13 September 2019) and added a narrow planning-participation claim at paragraph 1-95, PDF 26. Retrieved the active ADP 6-0 (7 July 2026), titled Command and Control, and corrected the catalog's older title. Added a preface-level scope claim. Its cover states that it supersedes the 31 July 2019 ADP 6-0.

Active catalog metadata is recorded with a check date and is separate from claim-level checks and human review. ATP collection records were surveyed for future lesson priorities; no restricted publications or technical interfaces were ingested.
