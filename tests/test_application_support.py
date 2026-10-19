import json
import unittest
from pathlib import Path
from urllib.parse import urlsplit

class ApplicationSupportTests(unittest.TestCase):
    def test_published_reference_is_bounded(self):
        data = json.loads((Path(__file__).resolve().parents[1] / 'data/application-support.json').read_text())
        sources = {s['id'] for s in data['sources']}
        self.assertEqual(len(sources), len(data['sources']))
        for source in data['sources']:
            parsed = urlsplit(source['url'])
            self.assertEqual(parsed.scheme, 'https')
            self.assertEqual(parsed.netloc, 'www.army.mil')
        ids = [a['id'] for a in data['applications']]
        self.assertEqual(len(ids), len(set(ids)))
        for app in data['applications']:
            self.assertLessEqual(set(app['source_ids']), sources)
            if app['status'] == 'identification_pending':
                self.assertFalse(app['purpose'])
                self.assertFalse(app['source_ids'])
            else:
                self.assertEqual(app['status'], 'public_context')
                self.assertTrue(app['source_ids'])
                self.assertTrue(app['purpose'])
        self.assertEqual(next(a for a in data['applications'] if a['id']=='fss')['status'], 'identification_pending')
