import unittest
from backend.recovery import CASES,grade,summarize
class RecoveryTests(unittest.TestCase):
 def test_missing_evidence_prevents_complete_result(self):
  for id,c in CASES.items():
   r=grade(id,[],c['answer']);self.assertFalse(r['supported']);self.assertEqual(r['score'],0)
   r=grade(id,c['required'],c['answer']);self.assertTrue(r['supported']);self.assertEqual(r['score'],r['total'])
 def test_viewing_every_check_cannot_credit_a_wrong_decision(self):
  for id,c in CASES.items():
   for choice in c['choices']:
    if choice['id']!=c['answer']:
     r=grade(id,c['required'],choice['id']);self.assertEqual((r['score'],r['total']),(0,1));self.assertEqual(r['evidence_count'],4)
 def test_history_window_does_not_define_coverage(self):
  members=[{'learner_id':'one'},{'learner_id':'two'}];assignments=[{'id':'a'},{'id':'b'}]
  attempts=[{'id':'1','learner_id':'one','assignment_id':'a','created_at':'2026-01-01','score':1,'total':5,'case_id':'builder','evidence_count':1,'decision_supported':0},{'id':'2','learner_id':'one','assignment_id':'a','created_at':'2026-01-02','score':5,'total':5,'case_id':'builder','evidence_count':4,'decision_supported':1}]
  r=summarize(members,assignments,attempts)
  self.assertEqual(r['assigned_pairs'],4);self.assertEqual(r['attempted_pairs'],1);self.assertEqual(r['unattempted_pairs'],3);self.assertEqual(r['recovery_gaps']['builder']['decision_gap'],0)
 def test_forged_case_and_duplicate_evidence_rejected(self):
  for args in [('unknown',[],'partial'),('builder',['log','log'],'partial'),('builder',['script'],'fake')]:
   with self.assertRaises(ValueError):grade(*args)

 def test_publication_gate_rejects_wrong_origin_and_broken_rubric(self):
  from copy import deepcopy
  from backend.recovery import CONTENT,validate_content
  self.assertEqual(validate_content(CONTENT)['recovery_cases'],3)
  for modify in [lambda c:c['sources'][0].update(url='https://attacker.example/manual'),lambda c:c['cases'][0].update(required=['log']),lambda c:c['cases'][0].update(sourceIds=[])]:
   content=deepcopy(CONTENT);modify(content)
   with self.assertRaises(ValueError):validate_content(content)

 def test_transfer_publication_gate_rejects_broken_choice_and_missing_case(self):
  import json
  from copy import deepcopy
  from pathlib import Path
  from backend.recovery import validate_transfer
  content=json.loads((Path(__file__).resolve().parents[1]/'data/transfer-exercises.json').read_text())
  self.assertEqual(validate_transfer(content)['transfer_cases'],6)
  for modify in [lambda c:c['cases'].pop(),lambda c:c['cases'][0]['steps'][0].update(answer=99),lambda c:c.update(review_status='verified')]:
   bad=deepcopy(content);modify(bad)
   with self.assertRaises(ValueError):validate_transfer(bad)
