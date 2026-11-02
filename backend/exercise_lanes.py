"""Validate fictional exercise definitions; no claim of Army equipment behavior."""
def validate_exercise_lanes(content):
    if type(content['schema_version']) is not int or content['schema_version'] != 1 or content['review_status'] != 'human_review_pending':
        raise ValueError('Unsupported exercise lane review state')
    if not isinstance(content['scope'], str) or not 100 <= len(content['scope']) <= 2000:
        raise ValueError('Missing fictional model scope')
    modes = content['modes']
    if len(modes) != 3 or {m['id'] for m in modes} != {'commex','staffex','wfx'}:
        raise ValueError('Invalid exercise environments')
    for mode in modes:
        if mode['title'] != mode['id'].upper() or not isinstance(mode['task'],str) or not 30 <= len(mode['task']) <= 1200:
            raise ValueError('Invalid exercise task')
    lanes = content['lanes']
    if len(lanes) != 3 or {l['id'] for l in lanes} != {'lane-01','lane-02','lane-03'}:
        raise ValueError('Invalid repeatable lane set')
    states = set()
    for lane in lanes:
        if type(lane['handoff']) is not bool or type(lane['sync']) is not bool or lane['handoff'] and lane['sync']:
            raise ValueError('Expected a bounded fault state')
        states.add((lane['handoff'],lane['sync']))
        if not isinstance(lane['title'],str) or not 3 <= len(lane['title']) <= 40 or not isinstance(lane['instructor_fault'],str) or not 40 <= len(lane['instructor_fault']) <= 1200:
            raise ValueError('Missing instructor explanation')
    if len(states) != 3:
        raise ValueError('Lanes must cover distinct dependency failures')
    return {'stateful_exercise_lanes':len(lanes),'stateful_exercise_review':'human_review_pending'}
