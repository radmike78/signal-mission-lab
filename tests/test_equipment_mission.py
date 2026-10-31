"""Prevent missing systems, dangling references and incomplete exercise content."""
import json
import pathlib
import unittest
ROOT = pathlib.Path(__file__).resolve().parents[1]
class EquipmentMissionTests(unittest.TestCase):
    def test_requested_systems_have_context_and_exercises(self):
        data = json.loads((ROOT/'data/equipment-mission-learning.json').read_text())
        catalog = json.loads((ROOT/'data/catalog.json').read_text())
        ids = [r['id'] for r in data['records']]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(set(ids), {'stt','jnn','cpn','bccs','tsi','jbc-p','mmc-s','trilos','sincgars','hf'})
        self.assertLessEqual(set(ids), {r['id'] for r in catalog['equipment']})
        sources = {s['id'] for s in data['sources']}
        for r in data['records']:
            self.assertIn(r['source'], sources)
            for key in ('purpose','mission','path','why','impact','consequence','remaining','proof','scenario','lesson'):
                self.assertTrue(r[key].strip(), (r['id'], key))
            self.assertEqual(set(r['exercises']), {'COMMEX','STAFFEX','WFX','Mission rehearsal'})
    def test_assessment_answers_are_valid_and_unique(self):
        questions = json.loads((ROOT/'data/assessment.json').read_text())
        self.assertEqual(len(questions), len({q['id'] for q in questions}))
        for q in questions:
            self.assertIn(q['answer'], range(len(q['options'])))
            self.assertTrue(q['rationale'])

    def test_publication_gate_rejects_unreviewed_assertions_and_broken_content(self):
        import copy
        from backend.equipment_mission import validate_equipment_mission
        data = json.loads((ROOT/'data/equipment-mission-learning.json').read_text())
        catalog = json.loads((ROOT/'data/catalog.json').read_text())
        self.assertEqual(validate_equipment_mission(data,catalog)['equipment_mission_lessons'],10)
        mutations = [lambda d:d.update(review_status='verified'),
                     lambda d:d['sources'][0].update(url='https://www.army.mil.evil.test/manual'),
                     lambda d:d['sources'][0].update(url='https://user:password@www.army.mil/manual'),
                     lambda d:d['sources'].append(d['sources'][0]),
                     lambda d:d['records'].append(d['records'][0]),
                     lambda d:d['records'][0].update(source='missing'),
                     lambda d:d['records'][0].update(id='unknown-system'),
                     lambda d:d['records'][0].update(proof=''),
                     lambda d:d['records'][0]['exercises'].pop('WFX'),
                     lambda d:d['records'][0]['exercises'].update(COMMEX='')]
        for mutate in mutations:
            changed=copy.deepcopy(data);mutate(changed)
            with self.assertRaises(ValueError):validate_equipment_mission(changed,catalog)
