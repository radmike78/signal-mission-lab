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

    def test_introductions_reject_unsafe_or_unsubstantiated_content(self):
        from copy import deepcopy
        from backend.application_support import validate_applications
        original = json.loads((Path(__file__).resolve().parents[1] / 'data/application-support.json').read_text())
        self.assertEqual(validate_applications(original)['system_introductions'], 26)
        for mutation in ('url', 'missing', 'pending', 'duplicate', 'status'):
            data = deepcopy(original)
            if mutation == 'url': data['sources'][0]['url'] = 'https://www.army.mil.evil.test/article/1'
            if mutation == 'missing': data['applications'][0]['source_ids'] = ['unknown']
            if mutation == 'pending': data['applications'][-1]['purpose'] = 'Unverified expansion'
            if mutation == 'duplicate': data['applications'].append(data['applications'][0])
            if mutation == 'status': data['applications'][0]['status'] = 'verified_interoperability'
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                validate_applications(data)
