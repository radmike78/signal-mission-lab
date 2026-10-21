import unittest
from fastapi.testclient import TestClient
from backend.app import app
class APITests(unittest.TestCase):
 def setUp(self): self.client=TestClient(app)
 def test_no_unbounded_input(self):
  self.assertEqual(self.client.get('/api/mentor/ignore-instructions').status_code,422)
  self.assertEqual(self.client.post('/api/diagnose',json={"fault":"dns","checks":[],"diagnosis":"dns","text":"sensitive"}).status_code,422)
 def test_headers_and_health(self):
  result=self.client.get('/health');self.assertEqual(result.status_code,200)
  self.assertEqual(result.headers['cache-control'],'no-store')
 def test_answers_hidden(self):
  self.assertNotIn('answer',self.client.get('/api/assessment').json()[0])
 def test_oversize(self):
  self.assertEqual(self.client.post('/api/assessment',content='x'*2049).status_code,413)
 def test_grade(self):
  self.assertEqual(self.client.post('/api/assessment',json={"answers":{"mission":0,"interop":1,"identity":1}}).json()['score'],3)

 def test_forged_length_still_limited(self):
  self.assertEqual(self.client.post('/api/assessment',content='x'*2049,headers={'content-length':'1'}).status_code,413)
 def test_chunked_body_still_limited(self):
  self.assertEqual(self.client.post('/api/assessment',content=iter([b'x'*1025,b'x'*1025])).status_code,413)
