"""Structural publication gate; does not certify technical accuracy or operator competence."""
from datetime import date
from .provenance import validate_url


def validate_technical_labs(content):
    if type(content['schema_version']) is not int or content['schema_version'] != 1 or content['id'] != 'it-professional-labs' or content['review_status'] != 'human_review_pending' or content['configuration_authority'] is not False:
        raise ValueError('Invalid technical lab authority state')

    def text(value, minimum=3, maximum=3000):
        if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
            raise ValueError('Missing or unbounded technical content')

    def strings(value, minimum, maximum):
        if not isinstance(value, list) or not minimum <= len(value) <= maximum:
            raise ValueError('Invalid technical content list')
        for item in value:
            text(item, 1)

    text(content['title'])
    text(content['scope'])
    sources = content['sources']
    if not isinstance(sources, list) or not 1 <= len(sources) <= 25:
        raise ValueError('Invalid technical source list')
    source_ids = set()
    for source in sources:
        text(source['id'], 1)
        if source['id'] in source_ids or source['status'] != 'page_content_checked':
            raise ValueError('Duplicate or unchecked technical source')
        source_ids.add(source['id'])
        validate_url(source['url'], {'learn.microsoft.com', 'www.cisco.com', 'www.freedesktop.org', 'man7.org'})
        date.fromisoformat(source['retrieved'])
        text(source['title'])
        text(source['scope'])
    labs = content['labs']
    if not isinstance(labs, list) or len(labs) != 8 or {lab['id'] for lab in labs} != {'subnet', 'vlan', 'dns', 'ospf', 'dmvpn', 'time', 'storage', 'listener'}:
        raise ValueError('Incomplete technical path')
    for lab in labs:
        for field in ('title', 'platform', 'bridge', 'objective', 'scenario', 'baseline', 'observed', 'recovery', 'impact', 'practical'):
            text(lab[field])
        strings(lab['topology'], 4, 4)
        if len(set(lab['topology'])) != 4:
            raise ValueError('Ambiguous technical topology')
        strings(lab['concepts'], 3, 5)
        strings(lab['sources'], 1, 5)
        if len(set(lab['sources'])) != len(lab['sources']) or not set(lab['sources']) <= source_ids:
            raise ValueError('Unresolved technical source')
        evidence = lab['evidence']
        if not isinstance(evidence, list) or len(evidence) != 3 or len({item['id'] for item in evidence}) != 3:
            raise ValueError('Incomplete technical evidence')
        for item in evidence:
            for field in ('id', 'title', 'command', 'output', 'meaning'):
                text(item[field])
        if not isinstance(lab['required_evidence'], list) or len(lab['required_evidence']) != 3 or set(lab['required_evidence']) != {item['id'] for item in evidence}:
            raise ValueError('Invalid required evidence')
        decisions = lab['decisions']
        if not isinstance(decisions, list) or len(decisions) != 3:
            raise ValueError('Missing diagnosis, correction or verification')
        for decision in decisions:
            text(decision['question'])
            options = decision['options']
            if not isinstance(options, list) or len(options) != 3 or len({option['label'] for option in options}) != 3 or type(decision['answer']) is not int or not 0 <= decision['answer'] < 3:
                raise ValueError('Invalid technical decision')
            for option in options:
                text(option['label'])
                text(option['feedback'])
    return {'it_technical_labs': len(labs), 'it_technical_review': 'human_review_pending'}
