import unittest
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
   self.assertTrue(c["url"].startswith("https://www.army.mil/"))
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
