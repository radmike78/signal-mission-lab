import copy
import json
from pathlib import Path
import unittest
from backend.provenance import validate_corpus, validate_url
ROOT = Path(__file__).resolve().parents[1]
class SourcePublicationTests(unittest.TestCase):
 def setUp(self):
  self.values=[json.loads((ROOT/'data'/name).read_text()) for name in
               ['catalog.json','sources.json','publications.json','equipment-coverage.json']]
 def test_existing_corpus_passes_without_claiming_human_review(self):
  result=validate_corpus(*self.values)
  self.assertEqual(result['human_review'],'required')
  self.assertEqual(result['pending_equipment_sources'],8)
 def test_unapproved_link_forms_are_rejected(self):
  for url in ['http://www.army.mil/a','https://www.army.mil.evil.test/a',
              'https://evil@www.army.mil/a','https://www.army.mil:8443/a',
              'https://127.0.0.1/a','file:///etc/passwd','javascript:alert(1)',
              'https://www.army.mil/a\n','https://www.army.mil\\@evil.test/a']:
   with self.subTest(url=url),self.assertRaises(ValueError):validate_url(url)
 def test_duplicate_and_pending_claims_fail(self):
  duplicate=copy.deepcopy(self.values);duplicate[1]['claims'].append(duplicate[1]['claims'][0])
  with self.assertRaises(ValueError):validate_corpus(*duplicate)
  self.values[1]['claims'][0]['subject']='prc160'
  with self.assertRaises(ValueError):validate_corpus(*self.values)
 def test_page_cannot_be_attached_to_unretrieved_document(self):
  claim=next(c for c in self.values[1]['claims'] if 'publication_id' in c)
  publication=next(p for p in self.values[2]['publications'] if p['id']==claim['publication_id'])
  publication['status']='retrieval_pending'
  with self.assertRaises(ValueError):validate_corpus(*self.values)
 def test_page_and_origin_must_match_publication(self):
  for value in [0,True,100000]:
   values=copy.deepcopy(self.values)
   next(c for c in values[1]['claims'] if 'publication_id' in c)['pdf_page']=value
   with self.assertRaises(ValueError):validate_corpus(*values)
 def test_claim_url_cannot_substitute_another_approved_source(self):
  claim=next(c for c in self.values[1]['claims'] if 'publication_id' in c)
  claim['url']='https://www.army.mil/another-source'
  with self.assertRaises(ValueError):validate_corpus(*self.values)
 def test_pending_reference_does_not_bypass_url_credentials_check(self):
  record=next(r for r in self.values[3]['records'] if r['id']=='lcn-t')
  record['source_url']='https://attacker@cpec2in.army.mil/a'
  with self.assertRaises(ValueError):validate_corpus(*self.values)
