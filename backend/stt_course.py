"""Bounded course publication gate; structural checks do not approve technical facts."""
from datetime import date
from .provenance import validate_url

def validate_stt_course(content, lanes):
    if type(content['schema_version']) is not int or content['schema_version'] != 1 or content['id'] != 'stt-node-foundations' or content['review_status'] != 'human_review_pending' or content['configuration_authority'] is not False:
        raise ValueError('Unsupported course review or authority state')
    def text(value,minimum=10,maximum=2500):
        if not isinstance(value,str) or not minimum <= len(value.strip()) <= maximum:
            raise ValueError('Missing or unbounded course content')
    for key in ('title','scope','goal'):text(content[key])
    sources=content['sources'];source_ids={s['id'] for s in sources}
    if not sources or len(source_ids)!=len(sources):raise ValueError('Invalid course source set')
    for source in sources:
        hosts={'www.army.mil','cpec2in.army.mil'} if source['kind']=='Army purpose/context' else {'learn.microsoft.com'} if source['kind']=='Vendor concept education' else set()
        validate_url(source['url'],hosts)
        if source['status'] not in {'page_content_checked','direct_access_403_search_excerpt_checked'}:raise ValueError('Unsupported course retrieval state')
        date.fromisoformat(source['retrieved'])
        for field in ('title','published','locator','claim','scope'):text(source[field],3)
    modules=content['modules'];ids={m['id'] for m in modules}
    if len(modules)!=6 or ids!={'mission','transport','network','access','application','handoff'}:raise ValueError('Incomplete course path')
    for module in modules:
        for field in ('title','outcome','explain','why','failure','scenario','discussion'):text(module[field])
        if not 2<=len(module['checks'])<=5:raise ValueError('Missing dependency checks')
        for check in module['checks']:text(check)
        if len(set(module['sources']))!=len(module['sources']) or not set(module['sources'])<=source_ids:raise ValueError('Broken course source reference')
        q=module['checkpoint'];text(q['question'])
        if len(q['options'])!=3 or len({o['label'] for o in q['options']})!=3 or type(q['answer']) is not int or not 0<=q['answer']<3:raise ValueError('Invalid course checkpoint')
        for option in q['options']:
            text(option['label']);text(option['feedback'])
    capstones=content['capstones'];lane_ids={l['id'] for l in lanes['lanes']}
    if len(capstones)!=3 or len({c['lane_id'] for c in capstones})!=3 or not {c['lane_id'] for c in capstones}<=lane_ids:raise ValueError('Broken course capstone reference')
    for capstone in capstones:text(capstone['title']);text(capstone['task'])
    for field in ('manual_gaps','instructor_criteria'):
        if not 3<=len(content[field])<=10:raise ValueError('Missing instructor/evidence guidance')
        for value in content[field]:text(value)
    return {'stt_node_course_modules':len(modules),'stt_node_course_review':'human_review_pending'}
