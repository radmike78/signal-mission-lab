"""Publication gate for editorial equipment lessons; does not certify technical facts."""
from datetime import date
from .provenance import validate_url

HOSTS = frozenset({'www.army.mil', 'cpec2in.army.mil', 'www.trngcmd.marines.mil'})
STAGES = frozenset({'COMMEX', 'STAFFEX', 'WFX', 'Mission rehearsal'})


def validate_equipment_mission(content, catalog):
    if content['schema_version'] != 1 or content['review_status'] != 'human_review_pending':
        raise ValueError('Unsupported equipment lesson review state')
    date.fromisoformat(content['reviewed'])
    if not isinstance(content['scope'], str) or not content['scope'].strip():
        raise ValueError('Missing lesson scope')
    sources = content['sources']
    source_ids = {s['id'] for s in sources}
    if not sources or len(source_ids) != len(sources):
        raise ValueError('Missing or duplicate equipment lesson source')
    for source in sources:
        validate_url(source['url'], HOSTS)
        if not isinstance(source['title'], str) or not source['title'].strip():
            raise ValueError('Missing equipment lesson source title')
    records = content['records']
    ids = {r['id'] for r in records}
    if not records or len(ids) != len(records) or not ids <= {e['id'] for e in catalog['equipment']}:
        raise ValueError('Invalid equipment lesson identifiers')
    for record in records:
        for field in ('name', 'purpose', 'mission', 'path', 'why', 'impact', 'consequence',
                      'remaining', 'proof', 'scenario', 'lesson', 'brief_example'):
            value = record[field]
            if not isinstance(value, str) or not (2 if field == 'name' else 5) <= len(value.strip()) <= 1500:
                raise ValueError('Incomplete equipment lesson')
        if record['source'] not in source_ids or set(record['exercises']) != STAGES:
            raise ValueError('Invalid equipment lesson references or stages')
        if any(not isinstance(v, str) or not 20 <= len(v.strip()) <= 2000
               for v in record['exercises'].values()):
            raise ValueError('Missing exercise task')
    return {'equipment_mission_lessons': len(records), 'equipment_mission_review': content['review_status']}
