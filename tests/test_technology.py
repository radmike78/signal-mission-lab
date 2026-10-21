import copy
import json
from pathlib import Path
import unittest
from backend.technology import validate_technology
ROOT=Path(__file__).resolve().parents[1]
class TechnologyTests(unittest.TestCase):
 def setUp(self):
  self.content=json.loads((ROOT/'data/technology-learning.json').read_text())
  self.catalog=json.loads((ROOT/'data/catalog.json').read_text())
 def test_sources_and_systems_resolve_without_inferred_deployment(self):
  result=validate_technology(self.content,self.catalog)
  self.assertEqual(result['army_equipment_mapping'],'not_inferred')
  self.assertEqual(result['lessons'],9)
 def test_vendor_documents_cannot_be_marked_army_context(self):
  source=next(s for s in self.content['sources'] if s['kind']=='Vendor education')
  source['kind']='Army context'
  with self.assertRaises(ValueError):validate_technology(self.content,self.catalog)
 def test_source_credentials_and_unapproved_hosts_rejected(self):
  for url in ['https://evil@www.cisco.com/a','https://www.cisco.com.evil.test/a','http://www.cisco.com/a']:
   content=copy.deepcopy(self.content);content['sources'][0]['url']=url
   with self.assertRaises(ValueError):validate_technology(content,self.catalog)
 def test_invalid_answers_and_dangling_references_rejected(self):
  for change in [{'answer':True},{'source_ids':['invented']},{'system_ids':['unverified-hardware']},{'feedback':[]}]:
   content=copy.deepcopy(self.content);content['lessons'][0].update(change)
   with self.assertRaises(ValueError):validate_technology(content,self.catalog)
 def test_major_topics_have_covered_learning_outcomes(self):
  ids={l['id'] for l in self.content['lessons']}
  self.assertTrue({'compute','switching','routing','services','storage','firewalls','containers','recovery','security'}<=ids)
  for lesson in self.content['lessons']:
   self.assertTrue(lesson['outcome']);self.assertGreaterEqual(len(lesson['terms']),3)
