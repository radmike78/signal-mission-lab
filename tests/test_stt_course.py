import copy
import json
from pathlib import Path
import unittest
from backend.stt_course import validate_stt_course
ROOT=Path(__file__).resolve().parents[1]
class STTCourseTests(unittest.TestCase):
    def setUp(self):
        self.content=json.loads((ROOT/'data/stt-node-course.json').read_text())
        self.lanes=json.loads((ROOT/'data/exercise-lanes.json').read_text())
    def test_complete_editorial_course_with_explicit_capstones(self):
        self.assertEqual(validate_stt_course(self.content,self.lanes)['stt_node_course_modules'],6)
        self.assertEqual(next(s for s in self.content['sources'] if s['id']=='army-ath')['status'],'direct_access_403_search_excerpt_checked')
    def test_invalid_authority_sources_answers_and_missing_modules_fail_publication(self):
        for mutate in [lambda d:d.update(configuration_authority=True),lambda d:d.update(review_status='verified'),
                       lambda d:d['sources'][0].update(url='https://www.army.mil.evil.test/manual'),
                       lambda d:d['sources'][0].update(url='https://user:password@www.army.mil/manual'),
                       lambda d:d['sources'][0].update(kind='Vendor concept education'),
                       lambda d:d['sources'][0].update(status='SME approved'),
                       lambda d:d['sources'].append(d['sources'][0]),lambda d:d['modules'].pop(),
                       lambda d:d['modules'][0].update(sources=['missing']),
                       lambda d:d['modules'][0]['checkpoint'].update(answer=True),
                       lambda d:d['modules'][0]['checkpoint'].update(answer=3),
                       lambda d:d['modules'][0]['checkpoint']['options'][0].update(feedback=''),
                       lambda d:d['capstones'][0].update(lane_id='missing'),lambda d:d.update(manual_gaps=[])]:
            changed=copy.deepcopy(self.content);mutate(changed)
            with self.assertRaises(ValueError):validate_stt_course(changed,self.lanes)
