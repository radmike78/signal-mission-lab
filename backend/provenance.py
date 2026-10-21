"""Offline corpus publication checks. Never fetch URLs or ingest document bytes."""
from urllib.parse import urlsplit

PRIMARY_HOSTS = frozenset({'www.army.mil', 'armypubs.army.mil', 'asc.army.mil', 'www.dvidshub.net'})
DOCTRINE_SUBJECTS = frozenset({'Command and control', 'MDMP', 'Operations process',
                              'Running estimates', 'Signal planning', 'Signal staff'})

def validate_url(value, hosts=PRIMARY_HOSTS):
    if not isinstance(value, str) or not value or len(value) > 2048:
        raise ValueError('Invalid source URL')
    if any(c.isspace() or ord(c) < 32 for c in value) or '\\' in value:
        raise ValueError('Invalid source URL')
    try:
        url = urlsplit(value)
        allowed = (url.scheme == 'https' and url.hostname in hosts
                   and url.username is None and url.password is None
                   and url.port in {None, 443})
    except ValueError as error:
        raise ValueError('Invalid source URL') from error
    if not allowed:
        raise ValueError('Source origin is not approved')

def validate_corpus(catalog, sources, publications, coverage):
    """Return counts, not corpus content. Human releasability/review remains required."""
    equipment = {e['id'] for e in catalog['equipment']}
    records = coverage['records']
    if len(equipment) != len(catalog['equipment']):
        raise ValueError('Duplicate equipment identifier')
    if len({r['id'] for r in records}) != len(records) or {r['id'] for r in records} != equipment:
        raise ValueError('Equipment coverage mismatch')
    if coverage['complete'] is not False:
        raise ValueError('Exhaustive coverage has not been established')
    pending = set()
    for record in records:
        if record['review_status'] not in {'source_checked', 'overview_only', 'retrieval_pending'}:
            raise ValueError('Unsupported equipment review state')
        if record['source_url']:
            # Pending program-office links are discovery references, not claim origins.
            hosts = PRIMARY_HOSTS
            if record['review_status'] == 'retrieval_pending':
                hosts = hosts | {'cpec2in.army.mil', 'www.lineofdeparture.army.mil'}
            validate_url(record['source_url'], hosts)
        if record['review_status'] == 'retrieval_pending':
            pending.add(record['id'])
    pubs = publications['publications']
    by_id = {p['id']: p for p in pubs}
    if len(by_id) != len(pubs):
        raise ValueError('Duplicate publication identifier')
    for publication in pubs:
        validate_url(publication['url'])
    claims = sources['claims']
    if len({c['id'] for c in claims}) != len(claims):
        raise ValueError('Duplicate claim identifier')
    for claim in claims:
        validate_url(claim['url'])
        if claim['status'] != 'source_checked' or claim['subject'] in pending:
            raise ValueError('Claim lacks retrieved-source evidence')
        if claim['subject'] not in equipment | DOCTRINE_SUBJECTS:
            raise ValueError('Unknown claim subject')
        for key, maximum in [('statement', 2000), ('source_title', 1000), ('locator', 2000),
                             ('scope', 2000), ('reviewer', 1000), ('retrieved', 100), ('published', 100)]:
            value = claim[key]
            if not isinstance(value, str) or not value.strip() or len(value) > maximum:
                raise ValueError('Invalid claim provenance field')
        if 'publication_id' in claim:
            publication = by_id.get(claim['publication_id'])
            page = claim.get('pdf_page')
            if (not publication or publication['status'] != 'content_retrieved'
                or publication['url'] != claim['url'] or type(page) is not int
                or not 1 <= page <= publication['page_count']):
                raise ValueError('Claim publication or page is not substantiated')
    return {'equipment': len(equipment), 'claims': len(claims), 'publications': len(pubs),
            'pending_equipment_sources': len(pending), 'human_review': 'required'}
