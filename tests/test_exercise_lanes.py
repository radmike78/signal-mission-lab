import copy
import json
from pathlib import Path
import unittest
from backend.exercise_lanes import validate_exercise_lanes
ROOT = Path(__file__).resolve().parents[1]
class ExerciseLaneTests(unittest.TestCase):
    def test_distinct_states_and_editorial_scope_are_explicit(self):
        content=json.loads((ROOT/'data/exercise-lanes.json').read_text())
        self.assertEqual(validate_exercise_lanes(content)['stateful_exercise_lanes'],3)
    def test_forged_states_missing_context_and_duplicate_lanes_are_rejected(self):
        content=json.loads((ROOT/'data/exercise-lanes.json').read_text())
        for mutate in [lambda d:d.update(review_status='verified'),
                       lambda d:d.update(schema_version=True),
                       lambda d:d.update(scope=''),
                       lambda d:d['lanes'][0].update(handoff='false'),
                       lambda d:d['lanes'][0].update(handoff=True,sync=True),
                       lambda d:d['lanes'][0].update(instructor_fault=''),
                       lambda d:d['lanes'][1].update(id='lane-01'),
                       lambda d:d['modes'][0].update(task=''),
                       lambda d:d['modes'].pop()]:
            changed=copy.deepcopy(content);mutate(changed)
            with self.assertRaises(ValueError):validate_exercise_lanes(changed)
