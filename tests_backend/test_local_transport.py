import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app import app

class LocalTransportTests(unittest.TestCase):
 def call(self,mode,peer,base='http://localhost',headers=None):
  account={'id':'synthetic-review','role':'learner'}
  with patch.dict(os.environ,{'SML_ENV':mode}),patch('backend.security.store_dependency') as store:
   store.return_value.authenticate.return_value=account
   return TestClient(app,base_url=base,client=(peer,40000)).get('/api/learning/me',headers={'Authorization':'Bearer '+'A'*43,**(headers or {})})
 def test_local_http_requires_numeric_loopback_peer_and_loopback_host(self):
  for peer in ['127.0.0.1','::1','::ffff:127.0.0.1']:
   self.assertEqual(self.call('local',peer).status_code,200)
  for peer in ['203.0.113.10','localhost','unknown']:
   self.assertEqual(self.call('local',peer).status_code,426)
  self.assertEqual(self.call('local','127.0.0.1','http://testserver').status_code,426)
 def test_forwarded_headers_cannot_enable_local_http(self):
  self.assertEqual(self.call('local','203.0.113.10',headers={'X-Forwarded-For':'127.0.0.1','X-Forwarded-Proto':'https'}).status_code,426)
  self.assertEqual(self.call('production','127.0.0.1').status_code,426)
  self.assertEqual(self.call('production','203.0.113.10','https://localhost').status_code,200)
