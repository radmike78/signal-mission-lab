"""Offline publication gate for a static, public Signal-products learning reference."""
from datetime import date
from urllib.parse import urlsplit


def validate_signal_products(data):
    if data['schema_version'] != 1:
        raise ValueError('Unknown products schema')
    date.fromisoformat(data['reviewed'])
    sources = data['sources']
    by_id = {s['id']: s for s in sources}
    if len(by_id) != len(sources):
        raise ValueError('Duplicate source')
    for source in sources:
        url = urlsplit(source['url'])
        if (url.scheme != 'https' or url.netloc not in {'www.army.mil', 'api.army.mil', 'armypubs.army.mil'}
                or url.query or url.fragment or not url.path.startswith(('/article/', '/e2/c/downloads/', '/epubs/'))):
            raise ValueError('Unapproved public source')
        if source['status'] not in {'content_reviewed', 'retrieval_pending'}:
            raise ValueError('Unknown source status')
    products = data['products']
    if len({p['id'] for p in products}) != len(products):
        raise ValueError('Duplicate product')
    for product in products:
        if product['kind'] not in {'doctrine_context', 'lessons_context', 'editorial_aid'}:
            raise ValueError('Unsupported evidence label')
        if product['audience'] not in {'Both', 'S6/G6 staff', 'Signal units'}:
            raise ValueError('Unsupported audience')
        if not product['source_ids'] or any(s not in by_id or by_id[s]['status'] != 'content_reviewed' for s in product['source_ids']):
            raise ValueError('Product needs reviewed context')
        for field in ('id', 'name', 'stage', 'purpose', 'owner', 'users', 'when', 'example', 'pitfall', 'locator'):
            if not isinstance(product[field], str) or not 1 <= len(product[field]) <= 1000:
                raise ValueError('Invalid teaching text')
        if not isinstance(product['contents'], list) or not 1 <= len(product['contents']) <= 12:
            raise ValueError('Invalid review prompts')
        if any(not isinstance(c, str) or not 1 <= len(c) <= 250 for c in product['contents']):
            raise ValueError('Invalid review prompt')
    return {'signal_products': len(products), 'signal_products_human_review': 'pending'}
