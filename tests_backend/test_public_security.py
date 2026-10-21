import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app import app
from backend.security import RateLimiter

class PublicSecurityTests(unittest.TestCase):
 def setUp(self):
  self.limit=patch('backend.security.public_limiter',RateLimiter())
  self.limit.start();self.addCleanup(self.limit.stop)
  self.client=TestClient(app)
 def test_public_limit_cannot_be_bypassed_with_forwarded_headers(self):
  for i in range(120):
   response=self.client.get('/api/assessment',headers={'x-forwarded-for':f'192.0.2.{i}'})
   self.assertEqual(response.status_code,200)
  response=self.client.get('/api/catalog')
  self.assertEqual(response.status_code,429)
  self.assertIn('Retry-After',response.headers)
  self.assertEqual(response.headers['Cache-Control'],'no-store')
  self.assertIn("frame-ancestors 'none'",response.headers['Content-Security-Policy'])
  self.assertEqual(self.client.get('/health').status_code,200)
 def test_security_headers_cover_rejected_inputs(self):
  for response in [self.client.get('/api/mentor/unsupported'),
                   self.client.post('/api/assessment',content='x'*2049),
                   self.client.get('/api/not-a-route')]:
   self.assertIn(response.status_code,[422,413,404])
   self.assertEqual(response.headers['X-Content-Type-Options'],'nosniff')
   self.assertEqual(response.headers['Cross-Origin-Resource-Policy'],'same-origin')
   self.assertEqual(response.headers['Cross-Origin-Opener-Policy'],'same-origin')
   self.assertNotIn('Access-Control-Allow-Origin',response.headers)
 def test_hsts_only_for_observed_https(self):
  self.assertNotIn('Strict-Transport-Security',self.client.get('/health').headers)
  self.assertNotIn('Strict-Transport-Security',self.client.get('/health',headers={'x-forwarded-proto':'https'}).headers)
  with TestClient(app,base_url='https://testserver') as secure:
   self.assertEqual(secure.get('/health').headers['Strict-Transport-Security'],'max-age=31536000')
