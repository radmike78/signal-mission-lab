"""Closed synthetic recovery rubric shared with offline practice. No script execution."""
from .core import load
CONTENT = load('recovery-exercises.json')
CASES = {c['id']: c for c in CONTENT['cases']}

def grade(case_id, evidence, decision):
    case = CASES.get(case_id)
    if not case or not isinstance(evidence, list) or len(evidence)>4:
        raise ValueError('Use supplied exercise choices')
    known = {e['id'] for e in case['evidence']}
    if any(not isinstance(e, str) or e not in known for e in evidence) or len(set(evidence)) != len(evidence):
        raise ValueError('Use distinct supplied evidence checks')
    choice = next((c for c in case['choices'] if c['id']==decision), None)
    if not choice:
        raise ValueError('Use a supplied recovery decision')
    missing = [e for e in case['required'] if e not in evidence]
    decision_supported = decision == case['answer']
    # v2: exposure is reported separately and earns no correctness credit.
    # Historical 0..5 attempts remain unchanged and are labeled legacy in the UI.
    return {'score':int(not missing and decision_supported), 'total':1,
            'supported':not missing and decision_supported, 'missing':missing,
            'evidence_count':len(evidence), 'decision_supported':decision_supported,
            'feedback':choice['feedback'],
            'boundary':'Evidence reviewed is separate from correctness. A supported decision requires all supplied evidence and the correct choice; no equipment performance is certified.'}

def summarize(members, assignments, attempts):
    """Latest attempt per enrolled learner/assignment from the complete authorized cohort set."""
    pairs = {(m['learner_id'], a['id']) for m in members for a in assignments}
    latest = {}
    for row in sorted(attempts, key=lambda r:(r['created_at'],r['id'])):
        pair=(row['learner_id'],row['assignment_id'])
        if pair in pairs: latest[pair]=row
    gaps={case_id:{'attempted':0,'evidence_gap':0,'decision_gap':0} for case_id in CASES}
    for row in latest.values():
        if row.get('case_id') in gaps:
            gap=gaps[row['case_id']];gap['attempted']+=1
            gap['evidence_gap']+=int(row['evidence_count']<len(CASES[row['case_id']]['required']))
            gap['decision_gap']+=int(not row['decision_supported'])
    return {'assigned_pairs':len(pairs),'attempted_pairs':len(latest),'unattempted_pairs':len(pairs)-len(latest),
            'latest_complete_pairs':sum(r['score']==r['total'] for r in latest.values()),
            'recovery_gaps':gaps,
            'scope':'Latest result per current learner and assignment; completed means full formative rubric, not equipment qualification.'}

def validate_content(content):
    from .provenance import validate_url
    if content['schema_version']!=1 or content['review_status']!='human_review_pending':
        raise ValueError('Recovery content requires review')
    sources=content['sources'];ids={s['id'] for s in sources}
    if len(ids)!=len(sources):raise ValueError('Duplicate recovery source')
    for source in sources:
        validate_url(source['url'],{'learn.microsoft.com','www.cisco.com','asc.army.mil'})
    cases=content['cases']
    if {c['id'] for c in cases}!={'builder','routing','satellite'} or len(cases)!=3:
        raise ValueError('Unsupported recovery case set')
    for case in cases:
        evidence=[e['id'] for e in case['evidence']];choices=[c['id'] for c in case['choices']]
        if len(evidence)!=4 or len(set(evidence))!=4 or len(case['required'])!=4 or set(case['required'])!=set(evidence):
            raise ValueError('Invalid evidence rubric')
        if len(choices)!=3 or len(set(choices))!=3 or case['answer'] not in choices or not case['sourceIds'] or not set(case['sourceIds'])<=ids:
            raise ValueError('Invalid recovery choice or source')
    return {'recovery_cases':len(cases),'recovery_review':'human_review_pending'}

def validate_transfer(content):
    """Build-time checks for bounded editorial reasoning cases, not fact approval."""
    import re
    if content.get('schema_version') != 1 or content.get('review_status') != 'human_review_pending':
        raise ValueError('Transfer content requires technical review')
    cases=content.get('cases',[])
    if len(cases)!=6 or len({c['id'] for c in cases})!=6:
        raise ValueError('Expected six distinct transfer cases')
    for skill in CASES:
        if sum(c.get('skill')==skill for c in cases)!=2:raise ValueError('Each skill needs two cases')
    for case in cases:
        if not re.fullmatch('[a-z-]{1,40}',case['id']) or case.get('skill') not in CASES:
            raise ValueError('Invalid transfer case')
        steps=case.get('steps',[])
        if len(steps)!=3:raise ValueError('Expected check, recovery and acceptance decisions')
        for step in steps:
            options=step.get('options',[]);answer=step.get('answer')
            if len(options)!=3 or len(set(options))!=3 or type(answer) is not int or not 0<=answer<len(options):
                raise ValueError('Invalid transfer answers')
            for text in [step.get('prompt'),step.get('feedback'),*options]:
                if not isinstance(text,str) or not 1<=len(text)<=1000:raise ValueError('Unbounded transfer text')
    return {'transfer_cases':len(cases),'transfer_review':'human_review_pending'}
