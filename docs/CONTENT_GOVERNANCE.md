# Content governance and source verification

The starter catalog contains illustrative **unverified overviews**. It is not a source of equipment compatibility, interface specifications, or operational procedures.

## Proposed reviewable record
- id, official designation, aliases, branch/domain
- purpose, training capabilities, service categories and support responsibilities
- variant/version, lifecycle status and applicable echelon (only when source-supported)
- source title, official URL, document version/date, releasability classification, page/section
- reviewer, reviewed_at, confidence and review_status (draft/reviewed/deprecated)
- relationship type (supports, depends_on, operated_by, documented_interface) and per-edge evidence
- limitations and explicitly unknown details

## Publication rules
1. Reject unreviewed compatibility claims.
2. Keep unknown interfaces as unknown; never infer them from IP networking alone.
3. Show source/version and last review for every technical claim.
4. Separate doctrinal statements from editorial teaching examples.
5. Use synthetic and sanitized exercises only.
6. Review updates before publishing; preserve a change history.

## Catalog coverage metadata

`equipment-coverage.json` tracks one scope record per catalog entry. `source_checked` denotes retrieved public-purpose evidence with human review pending; `retrieval_pending` denotes a blocked discovery and must not be promoted into a source claim; `overview_only` denotes an editorial category or legacy overview. `complete` remains false. Upper/lower TI tags are editorial navigation aids, not documented interface edges. Programs, families, software, services and individual hardware must remain distinguishable. New system inclusion never establishes current fielding or equipment interoperability.
