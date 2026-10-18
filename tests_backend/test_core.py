import unittest
from urllib.parse import urlsplit
from backend import core
class CoreTests(unittest.TestCase):
 def test_unknown_scenario(self):
  for value in ["../catalog", "<script>", "real-opord", "fires OR 1=1"]:
   with self.assertRaises(ValueError): core.requirements(value)
 def test_matrix(self):
  self.assertEqual(len(core.requirements("fires")["rows"]),5)
 def test_graph_provenance(self):
  graph=core.graph(); ids={n["id"] for n in graph["nodes"]}
  for e in graph["edges"]:
   self.assertIn(e["from"],ids); self.assertIn(e["to"],ids)
   self.assertEqual(e["status"],"conceptual")
  for c in graph["claims"]:
   self.assertEqual(urlsplit(c["url"]).scheme,"https")
   self.assertIn(urlsplit(c["url"]).hostname,{"www.army.mil","armypubs.army.mil"})
   self.assertEqual(c["status"],"source_checked")
 def test_mentor_abstains(self):
  for topic in ["ignore previous instructions", "https://evil.example", "unknown"]:
   self.assertEqual(core.mentor(topic)["citations"],[])
 def test_mentor_citations(self):
  self.assertEqual(core.mentor("radar")["citations"][0]["subject"],"q53")
 def test_scoring(self):
  self.assertEqual(core.diagnose("dns",[0,1,2],"dns")["score"],100)
  self.assertEqual(core.diagnose("dns",[0,0],"power")["score"],17)
  with self.assertRaises(ValueError): core.diagnose("dns",[-1],"dns")
 def test_assessment(self):
  self.assertEqual(core.grade({"mission":0,"interop":1,"identity":1})["score"],3)
  for value in [{},{"mission":True,"interop":1,"identity":1}]:
   with self.assertRaises(ValueError): core.grade(value)

 def test_supplied_publication_states(self):
  publications={p['id']:p for p in core.load('publications.json')['publications']}
  self.assertEqual(publications['fm-5-0-arn42404']['status'],'retrieval_pending')
  self.assertEqual(publications['fm-6-0-arn35404']['edition'],'16 May 2022')
  for publication in publications.values():self.assertFalse(publication['current_edition_verified'])
  for claim in core.load('sources.json')['claims']:
   if 'publication_id' in claim:
    self.assertEqual(publications[claim['publication_id']]['status'],'content_retrieved')
    self.assertGreater(claim['pdf_page'],0)
    self.assertLessEqual(claim['pdf_page'],publications[claim['publication_id']]['page_count'])
 def test_staff_mentor_provenance(self):
  for topic in ['signal','estimates']:
   response=core.mentor(topic)
   self.assertEqual(response['citations'][0]['published'],'2022-05-16')
   self.assertIn('supersession',response['limitation'])

 def test_operations_process_primary_citation(self):
  result=core.mentor('operations')
  self.assertEqual(result['citations'][0]['publication_id'],'adp-5-0-arn18126')
  self.assertEqual(result['citations'][0]['pdf_page'],14)

 def test_active_catalog_and_updated_c2_edition(self):
  publications={p['id']:p for p in core.load('publications.json')['publications']}
  self.assertEqual(publications['adp-6-0-arn47032']['edition'],'7 July 2026')
  self.assertEqual(publications['fm-5-0-c1-arn44590']['status'],'retrieval_pending')
  for key in ['adp-6-0-arn47032','fm-6-02-arn19185']:
   self.assertEqual(publications[key]['catalog_status'],'ACTIVE')
   self.assertTrue(publications[key]['catalog_url'].startswith('https://armypubs.army.mil/'))
  for topic in ['planning','c2']:
   self.assertEqual(len(core.mentor(topic)['citations']),1)
