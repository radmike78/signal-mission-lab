"""Offline publication checks for the bounded public system introductions."""
from datetime import date
from urllib.parse import urlsplit


def validate_applications(data):
    sources = data['sources']
    source_ids = {s['id'] for s in sources}
    if len(source_ids) != len(sources):
        raise ValueError('Duplicate sources')
    for source in sources:
        url = urlsplit(source['url'])
        if url.scheme != 'https' or url.netloc != 'www.army.mil' or url.query or url.fragment:
            raise ValueError('Unapproved source URL')
        date.fromisoformat(source['published'])
    apps = data['applications']
    if len({a['id'] for a in apps}) != len(apps):
        raise ValueError('Duplicate systems')
    for app in apps:
        if not set(app['source_ids']) <= source_ids:
            raise ValueError('Unknown source')
        if app['status'] == 'identification_pending':
            if app['purpose'] or app['source_ids']:
                raise ValueError('Unidentified product cannot carry purpose claims')
        elif app['status'] == 'public_context':
            if not app['source_ids']:
                raise ValueError('Missing evidence')
            for field in ('purpose', 'users', 'example', 'failure_impact', 'baseline', 'signal_role', 'access', 'owner'):
                if not isinstance(app[field], str) or not 1 <= len(app[field]) <= 1000:
                    raise ValueError('Missing or oversized introduction')
        else:
            raise ValueError('Unknown publication status')
    if {c['id'] for c in data['checks']} != {'launch', 'login', 'data'} or len(data['checks']) != 3:
        raise ValueError('Unexpected support checks')
    return {'system_introductions': sum(a['status']=='public_context' for a in apps),
            'unidentified_applications': sum(a['status']=='identification_pending' for a in apps)}
