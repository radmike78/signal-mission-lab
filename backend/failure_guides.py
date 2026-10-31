"""Validate editorial coverage and provenance; this does not approve technical facts."""
from urllib.parse import urlsplit


def validate_failure_guides(content, catalog):
    if content['schema_version'] != 1 or content['review_status'] != 'human_review_pending':
        raise ValueError('Unsupported guide review state')
    sources = content['sources']
    source_ids = {s['id'] for s in sources}
    if len(source_ids) != len(sources):
        raise ValueError('Duplicate source')
    for source in sources:
        url = urlsplit(source['url'])
        if url.scheme != 'https' or url.hostname not in {'www.cisco.com', 'gdmissionsystems.com', 'cpec2in.army.mil'} or url.username or url.password or url.port or url.query or url.fragment:
            raise ValueError('Unapproved source URL')
        if source['status'] not in {'public_page_retrieved', 'search_excerpt_only', 'direct_access_403_search_excerpt_only'}:
            raise ValueError('Missing retrieval limitation')
        for field in ('title', 'locator', 'retrieved'):
            if not isinstance(source[field], str) or not source[field].strip():
                raise ValueError('Missing source metadata')
    issues = content['issues']
    issue_ids = {i['id'] for i in issues}
    if len(issue_ids) != len(issues):
        raise ValueError('Duplicate issue')
    for issue in issues:
        for field in ('title', 'purpose', 'why', 'check', 'action', 'verify', 'scope'):
            if not isinstance(issue[field], str) or not 10 <= len(issue[field]) <= 1200:
                raise ValueError('Incomplete reasoning')
        if not issue['sources'] or not set(issue['sources']) <= source_ids:
            raise ValueError('Missing issue source')
    records = content['records']
    if len({r['id'] for r in records}) != len(records) or {r['id'] for r in records} != {e['id'] for e in catalog['equipment']}:
        raise ValueError('Incomplete catalog accounting')
    for record in records:
        if len(set(record['topics'])) != len(record['topics']) or not set(record['topics']) <= issue_ids or not record['applicability'] or not record['manual_needed']:
            raise ValueError('Invalid applicability or gap')
    return {'failure_issues': len(issues), 'failure_coverage_records': len(records), 'failure_guides_pending': sum(not r['topics'] for r in records)}
