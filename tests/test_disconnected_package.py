import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('disconnected', Path(__file__).resolve().parents[1]/'scripts/package_disconnected.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DisconnectedPackageTests(unittest.TestCase):
    def test_reproducible_public_bundle_checksums_and_training_boundary(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            dist = root/'dist'
            dist.mkdir()
            for name in ['index.html', 'sw.js', '_headers']:
                (dist/name).write_text('public fixture')
            (dist/'offline-build.json').write_text(json.dumps({'public_assets': ['/', '/index.html']}))
            (dist/'not-public.txt').write_text('must not be packaged')
            first, second = root/'first.zip', root/'second.zip'
            module.package(dist, first)
            module.package(dist, second)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with zipfile.ZipFile(first) as archive:
                self.assertNotIn('not-public.txt', archive.namelist())
                self.assertIn('FICTIONAL TRAINING ONLY', archive.read('START_HERE.txt').decode())
                for line in archive.read('SHA256SUMS').decode().splitlines():
                    digest, name = line.split('  ', 1)
                    self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), digest)

    def test_traversal_and_missing_assets_fail_packaging(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for url in ['/../private.txt', '/missing.js']:
                (root/'offline-build.json').write_text(json.dumps({'public_assets': [url]}))
                with self.assertRaises(ValueError):
                    module.package(root, root/'out.zip')
