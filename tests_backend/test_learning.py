import os
import tempfile
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app import app
from backend.store import Store, digest
from backend.security import limiter, RateLimiter

class LearningTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.url=os.environ.get('SML_TEST_POSTGRES_URL','sqlite:///'+self.temp.name+'/learning.db')
  self.env=patch.dict(os.environ,{'SML_DATABASE_URL':self.url,'SML_ENV':'test'})
  self.env.start();self.db=Store(self.url,testing=True);self.db.migrate()
  self.teacher=self.db.provision('instructor');self.other=self.db.provision('instructor')
  self.learner=self.db.provision('learner');self.outsider=self.db.provision('learner')
  self.created=[self.teacher,self.other,self.learner,self.outsider]
  limiter.entries.clear();self.client=TestClient(app)
 def tearDown(self):
  with self.db.transaction() as connection:
   for account in self.created:self.db.execute(connection,'DELETE FROM accounts WHERE id=?',(account['account_id'],))
  self.env.stop();self.temp.cleanup()
 def headers(self,account):return {'Authorization':'Bearer '+account['access_token']}
 def call(self,method,path,account=None,**kwargs):
  return self.client.request(method,'/api/learning'+path,headers=self.headers(account or self.teacher),**kwargs)
 def cohort(self):
  r=self.call('POST','/cohorts',json={'callsign':'Alpha'});self.assertEqual(r.status_code,201);return r.json()['id']
 def enroll(self,cohort):
  r=self.call('POST',f'/cohorts/{cohort}/members',json={'learner_id':self.learner['account_id']});self.assertEqual(r.status_code,201)
 def assignment(self,cohort,activity='assessment'):
  r=self.call('POST',f'/cohorts/{cohort}/assignments',json={'activity':activity});self.assertEqual(r.status_code,201);return r.json()['id']
 def test_authentication_revocation_and_hashes(self):
  self.assertEqual(self.client.get('/api/learning/me').status_code,401)
  self.assertEqual(self.call('GET','/me',self.learner).json()['role'],'learner')
  with self.db.transaction() as connection:
   rows=self.db.execute(connection,'SELECT digest FROM access_tokens').fetchall()
   self.assertTrue(all(len(row['digest'])==64 for row in rows))
   self.assertIn(digest(self.learner['access_token']),[row['digest'] for row in rows])
  self.db.revoke(self.learner['account_id']);self.assertEqual(self.call('GET','/me',self.learner).status_code,401)
 def test_expired_token(self):
  with self.db.transaction() as connection:
   self.db.execute(connection,'UPDATE access_tokens SET expires_at=? WHERE account_id=?',('2000-01-01T00:00:00+00:00',self.learner['account_id']))
  self.assertEqual(self.call('GET','/me',self.learner).status_code,401)
 def test_instructor_ownership(self):
  c=self.cohort()
  self.assertEqual(self.call('GET',f'/cohorts/{c}/progress',self.other).status_code,404)
  self.assertEqual(self.call('DELETE',f'/cohorts/{c}',self.other).status_code,404)
  self.assertEqual(self.call('POST',f'/cohorts/{c}/assignments',self.other,json={'activity':'dns'}).status_code,404)
  self.assertEqual(self.call('GET','/cohorts',self.other).json(),[])
 def test_role_escalation_rejected(self):
  self.assertEqual(self.call('POST','/cohorts',self.learner,json={'callsign':'Alpha'}).status_code,403)
  self.assertEqual(self.call('POST','/cohorts',json={'callsign':'Alpha','role':'instructor'}).status_code,422)
  c=self.cohort()
  self.assertEqual(self.call('POST',f'/cohorts/{c}/members',json={'learner_id':self.other['account_id']}).status_code,404)
 def test_learner_assignment_isolation(self):
  c=self.cohort();self.enroll(c);a=self.assignment(c)
  self.assertEqual(self.call('GET','/assignments',self.outsider).json(),[])
  body={'answers':{'mission':0,'interop':1,'identity':1}}
  self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.outsider,json=body).status_code,404)
  self.assertEqual(self.call('GET',f'/cohorts/{c}/progress',self.learner).status_code,403)
  self.assertEqual(len(self.call('GET','/assignments',self.learner).json()),1)
 def test_score_is_server_computed_and_persists(self):
  c=self.cohort();self.enroll(c);a=self.assignment(c)
  body={'answers':{'mission':0,'interop':1,'identity':1}}
  self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.learner,json={**body,'score':999}).status_code,422)
  r=self.call('POST',f'/assignments/{a}/attempts',self.learner,json=body)
  self.assertEqual(r.status_code,201);self.assertEqual((r.json()['score'],r.json()['total']),(3,3))
  self.assertEqual(len(self.call('GET','/attempts',self.learner).json()),1)
  self.assertEqual(self.call('GET','/attempts',self.outsider).json(),[])
  self.assertEqual(len(self.call('GET',f'/cohorts/{c}/progress').json()['attempts']),1)
  # A fresh client still sees persisted records, independent of browser memory.
  with TestClient(app) as fresh:
   self.assertEqual(len(fresh.get('/api/learning/attempts',headers=self.headers(self.learner)).json()),1)
 def test_diagnosis_validation(self):
  c=self.cohort();self.enroll(c);a=self.assignment(c,'dns')
  self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.learner,json={'checks':[-1],'diagnosis':'dns'}).status_code,422)
  r=self.call('POST',f'/assignments/{a}/attempts',self.learner,json={'checks':[0,1,2],'diagnosis':'dns'})
  self.assertEqual(r.json()['score'],100)
 def test_membership_removal_erases_access_and_attempts(self):
  c=self.cohort();self.enroll(c);a=self.assignment(c)
  body={'answers':{'mission':0,'interop':1,'identity':1}}
  self.call('POST',f'/assignments/{a}/attempts',self.learner,json=body)
  self.assertEqual(self.call('DELETE',f'/cohorts/{c}/members/'+self.learner['account_id']).status_code,204)
  self.assertEqual(self.call('GET','/assignments',self.learner).json(),[])
  self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.learner,json=body).status_code,404)
  self.assertEqual(self.call('GET','/attempts',self.learner).json(),[])
 def test_delete_account_cascades(self):
  c=self.cohort();self.enroll(c);self.assignment(c)
  self.assertEqual(self.call('DELETE','/me',self.learner).status_code,204)
  self.assertEqual(self.call('GET','/me',self.learner).status_code,401)
  self.assertEqual(self.call('GET',f'/cohorts/{c}/progress').json()['members'],[])
 def test_cohort_delete_cascades(self):
  c=self.cohort();self.enroll(c);self.assignment(c)
  self.assertEqual(self.call('DELETE',f'/cohorts/{c}').status_code,204)
  self.assertEqual(self.call('GET','/assignments',self.learner).json(),[])
 def test_no_sensitive_free_text_fields(self):
  r=self.call('POST','/cohorts',json={'callsign':'REAL UNIT CONFIGURATION'})
  self.assertEqual(r.status_code,422);self.assertNotIn('REAL UNIT',r.text)
  self.assertEqual(self.call('POST','/cohorts',json={'callsign':'Alpha','notes':'anything'}).status_code,422)
  self.assertEqual(self.call('GET',"/cohorts/1%20OR%201=1/progress").status_code,422)
 def test_rate_limiter_and_configuration(self):
  from fastapi import HTTPException
  rate=RateLimiter(maximum=1);rate.check('one',1)
  with self.assertRaises(HTTPException):rate.check('one',1)
  with self.assertRaises(HTTPException):rate.check('two',1)
  with self.assertRaises(ValueError):Store('sqlite:///anything')
  with self.assertRaises(ValueError):Store('postgresql://localhost/lab?sslmode=disable')
  with patch.dict(os.environ,{'SML_DATABASE_URL':''}):
   self.assertEqual(self.call('GET','/cohorts').status_code,503)
 def test_schema_migration_is_repeatable(self):
  self.db.migrate()
  with self.db.transaction() as connection:
   self.assertEqual(self.db.execute(connection,'SELECT count(*) AS n FROM schema_versions').fetchone()['n'],1)
 def test_attempt_limit(self):
  c=self.cohort();self.enroll(c);a=self.assignment(c)
  for _ in range(20):
   self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.learner,json={'answers':{'mission':0,'interop':1,'identity':1}}).status_code,201)
  self.assertEqual(self.call('POST',f'/assignments/{a}/attempts',self.learner,json={'answers':{'mission':0,'interop':1,'identity':1}}).status_code,409)

 def test_default_account_access_requires_https(self):
  with patch.dict(os.environ,{'SML_ENV':'production'}):
   self.assertEqual(self.call('GET','/me').status_code,426)
 def test_untrusted_host_and_credential_echo(self):
  result=self.client.get('/api/learning/me',headers={'host':'attacker.invalid','authorization':'Bearer '+self.teacher['access_token']})
  self.assertEqual(result.status_code,400)
  result=self.call('POST','/cohorts',json={'callsign':'Alpha','secret':self.teacher['access_token']})
  self.assertEqual(result.status_code,422);self.assertNotIn(self.teacher['access_token'],result.text)
 def test_audit_events_exclude_credentials(self):
  self.cohort()
  with self.db.transaction() as connection:
   rows=self.db.execute(connection,'SELECT * FROM audit_events').fetchall()
  content=str([dict(row) for row in rows])
  for account in self.created:self.assertNotIn(account['access_token'],content)
