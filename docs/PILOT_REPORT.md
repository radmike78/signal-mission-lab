# Aggregate cohort report

In the web edition, an instructor opens an owned cohort in My training and selects **Download aggregate cohort report**. The same-origin `GET /api/learning/cohorts/{cohort_id}/report` endpoint requires the existing instructor credential and cohort ownership checks. The JSON contains a generation timestamp, fictional callsign, learner and assignment counts, current coverage and recovery gaps. It omits account IDs, credentials, individual attempts and document text. The browser downloads the report only after an explicit click.

The endpoint reuses the full latest-result query used by cohort progress. Its summary does not depend on the 500-record history window. It measures the latest formative result per currently enrolled learner/assignment. Repeated attempts affect this measure. A learning-gain claim requires separately administered baseline and unseen transfer assessments, with matched participants, missing-data disclosure and instructor observation. Small-cohort aggregates can still be identifying.

The added API and browser tests exercise owner isolation, learner denial, anonymous denial, omitted identities, empty/unattempted counts and correspondence with the current dashboard. Existing tests cover summaries beyond the history window.
