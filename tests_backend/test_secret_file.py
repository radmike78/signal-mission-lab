import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend.store import configured_store
class SecretFileTests(unittest.TestCase):
 def test_file_secret_can_configure_database_without_url_in_environment(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'runtime-secret';path.write_text('postgresql://runtime:synthetic@db.example/lab?sslmode=verify-full\n')
   with patch.dict(os.environ,{'SML_DATABASE_URL_FILE':str(path)},clear=True):
    store=configured_store();self.assertFalse(store.sqlite)
 def test_missing_oversized_and_ambiguous_secrets_fail_closed(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'secret'
   for content in [None,'x'*4098,'','one\ntwo']:
    if content is not None:path.write_text(content)
    with patch.dict(os.environ,{'SML_DATABASE_URL_FILE':str(path)},clear=True):
     with self.assertRaises(ValueError):configured_store()
   path.write_text('postgresql://runtime:synthetic@db.example/lab?sslmode=verify-full')
   with patch.dict(os.environ,{'SML_DATABASE_URL_FILE':str(path),'SML_DATABASE_URL':'other'},clear=True):
    with self.assertRaises(ValueError):configured_store()
 def test_file_secret_does_not_bypass_database_tls_policy(self):
  with tempfile.TemporaryDirectory() as folder:
   path=Path(folder)/'secret';path.write_text('postgresql://db.example/lab?sslmode=disable')
   with patch.dict(os.environ,{'SML_DATABASE_URL_FILE':str(path)},clear=True):
    with self.assertRaises(ValueError):configured_store()
