"""Offline checks for introductory IT lessons; vendor evidence is not Army adoption."""
from .provenance import validate_url
VENDOR_HOSTS=frozenset({'learn.microsoft.com','www.cisco.com','docs.paloaltonetworks.com',
                        'docs.netapp.com','www.redhat.com','knowledge.broadcom.com','defense-solutions.curtisswright.com',
                        'www.broadcom.com','support.riverbed.com','docs.redhat.com','www.paloaltonetworks.com',
                        'www.palantir.com','www.dell.com','education.dell.com','www.netapp.com',
                        'gdmissionsystems.com','www.juniper.net','comptiacdn.azureedge.net'})
ARMY_CONTEXT_HOSTS=frozenset({'www.army.mil','www.financialfrontline.army.mil'})

def validate_technology(content, catalog):
    if content['review_status'] != 'human_review_pending':
        raise ValueError('Human curriculum review remains pending')
    sources=content['sources'];source_ids={s['id'] for s in sources}
    if len(source_ids)!=len(sources):raise ValueError('Duplicate IT source')
    for source in sources:
        hosts=ARMY_CONTEXT_HOSTS if source['kind']=='Army context' else {'csrc.nist.gov'} if source['kind']=='Standards education' else VENDOR_HOSTS if source['kind']=='Vendor education' else set()
        validate_url(source['url'],hosts)
        if source['status'] not in {'content_checked','metadata_checked'} or source['human_review']!='pending':
            raise ValueError('Invalid source review state')
        for field in ['title','edition','locator','scope','retrieved']:
            if not isinstance(source[field],str) or not 0<len(source[field])<=2000:
                raise ValueError('Invalid source metadata')
    equipment={r['id'] for r in catalog['equipment']}
    for group in ['vendors','lessons']:
        rows=content[group]
        if len({r['id'] for r in rows})!=len(rows):raise ValueError('Duplicate curriculum record')
        for row in rows:
            if not row['source_ids'] or not set(row['source_ids'])<=source_ids:
                raise ValueError('Unresolved IT source')
    lesson_ids={lesson['id'] for lesson in content['lessons']}
    vendor_sources={source['id'] for source in sources if source['kind']=='Vendor education'}
    for vendor in content['vendors']:
        practice=vendor.get('lesson_ids',[])
        if not isinstance(practice,list) or len(practice)!=len(set(practice)) or not set(practice)<=lesson_ids:
            raise ValueError('Invalid vendor practice link')
        if 'training' in vendor:
            training=vendor['training']
            if (not isinstance(training,dict) or set(training)!={'label','source_id'}
                or not isinstance(training['label'],str) or not 0<len(training['label'])<=150
                or training['source_id'] not in vendor_sources or training['source_id'] not in vendor['source_ids']):
                raise ValueError('Invalid vendor training reference')
    for lesson in content['lessons']:
        if not set(lesson['system_ids'])<=equipment:raise ValueError('Unknown study system')
        if (not 2<=len(lesson['options'])<=5 or len(lesson['feedback'])!=len(lesson['options'])
            or type(lesson['answer']) is not int or not 0<=lesson['answer']<len(lesson['options'])):
            raise ValueError('Invalid formative exercise')
        if not lesson['terms'] or not lesson['explanation']:raise ValueError('Missing lesson explanation')
    return {'lessons':len(content['lessons']),'vendor_groups':len(content['vendors']),
            'technology_sources':len(sources),'army_equipment_mapping':'not_inferred'}
