from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
class ContainerConfigTests(unittest.TestCase):
 def test_compatibility_image_definition_has_no_drift(self):
  self.assertEqual((ROOT/'deploy/Containerfile').read_bytes(),(ROOT/'deploy/Dockerfile.api').read_bytes())
 def test_build_context_excludes_credentials_and_database_files(self):
  ignore=(ROOT/'.dockerignore').read_text()
  self.assertEqual(ignore,(ROOT/'.containerignore').read_text())
  for pattern in ['**/.env','**/.env.*','**/*.db','.git']:
   self.assertIn(pattern,ignore)
 def test_quadlet_has_no_public_listener_or_development_auth_bypass(self):
  unit=(ROOT/'deploy/quadlet/signal-mission-lab.container').read_text()
  self.assertIn('PublishPort=127.0.0.1:8080:8080',unit)
  self.assertNotIn('SML_ENV=local',unit);self.assertNotIn('SML_ENV=test',unit)
  self.assertNotIn('SecurityLabelDisable=true',unit)
  self.assertNotIn('privileged',unit.lower())
