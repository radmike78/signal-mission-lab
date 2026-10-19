import json
import pathlib
import unittest
from urllib.parse import urlparse
ROOT = pathlib.Path(__file__).resolve().parents[1]
class EquipmentCoverageTests(unittest.TestCase):
 def setUp(self):
  self.catalog=json.loads((ROOT/'data/catalog.json').read_text())['equipment']
  self.coverage=json.loads((ROOT/'data/equipment-coverage.json').read_text())
  self.claims=json.loads((ROOT/'data/sources.json').read_text())['claims']
 def test_every_catalog_entry_has_one_scope_record(self):
  ids=[r['id'] for r in self.coverage['records']]
  self.assertEqual(len(ids),len(set(ids)))
  self.assertEqual(set(ids),{r['id'] for r in self.catalog})
  self.assertFalse(self.coverage['complete'])
  self.assertTrue(self.coverage['gaps'])
 def test_source_checked_records_have_primary_source_claims(self):
  for r in self.coverage['records']:
   if r['review_status']=='source_checked':
    claims=[c for c in self.claims if c['subject']==r['id']]
    self.assertTrue(claims,r['id'])
    self.assertTrue(all(urlparse(c['url']).hostname.endswith(('.army.mil','.dvidshub.net')) for c in claims))
    self.assertTrue(all('pending' in c['reviewer'] for c in claims))
 def test_blocked_sources_are_not_promoted(self):
  for r in self.coverage['records']:
   if r['review_status']=='retrieval_pending':
    self.assertFalse(any(c['subject']==r['id'] for c in self.claims))
    self.assertTrue(r['source_url'].startswith('https://'))
 def test_both_tiers_and_modernization_are_present(self):
  records={r['id']:r for r in self.coverage['records']}
  for id in ['wint-inc1','wint-inc2','tcn','stt','trilos','ngtt','phoenix-e','scout']:
   self.assertEqual(records[id]['tier'],'Upper TI')
  for id in ['sincgars','prc150','prc160','prc158','prc162','prc163','nett-warrior']:
   self.assertEqual(records[id]['tier'],'Lower TI')
  self.assertEqual(records['ngc2']['kind'],'Modernization ecosystem')
 def test_generated_options_match_catalog(self):
  content=(ROOT/'web/src/equipment-options.ts').read_text().split(' = ',1)[1].split(' as const;',1)[0]
  options=json.loads(content)
  self.assertEqual(options,[{'id':r['id'],'title':r['name']} for r in self.catalog])
