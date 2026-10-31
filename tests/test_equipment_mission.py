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
