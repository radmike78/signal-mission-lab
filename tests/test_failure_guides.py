import copy
import json
from pathlib import Path
import unittest
from backend.failure_guides import validate_failure_guides
ROOT = Path(__file__).resolve().parents[1]

class FailureGuideTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT/'data/network-failures.json').read_text())
        self.catalog = json.loads((ROOT/'data/catalog.json').read_text())

    def test_coverage_is_honest_and_complete(self):
        result = validate_failure_guides(self.data, self.catalog)
        self.assertEqual(result['failure_coverage_records'], len(self.catalog['equipment']))
        self.assertGreater(result['failure_guides_pending'], 0)
        self.assertEqual(result['failure_issues'], 8)

    def test_invalid_provenance_or_missing_why_rejected(self):
        for mutate in [lambda x:x['sources'][0].update(url='https://www.cisco.com.evil.test/manual'),
                       lambda x:x['issues'][0].update(why=''),
                       lambda x:x['issues'][0].update(sources=['missing']),
                       lambda x:x['records'].pop(),
                       lambda x:x['records'][0].update(topics=['unknown'])]:
            data=copy.deepcopy(self.data);mutate(data)
            with self.assertRaises(ValueError): validate_failure_guides(data,self.catalog)

    def test_restricted_procedure_gap_remains_explicit(self):
        crypto=next(r for r in self.data['records'] if r['id']=='crypto')
        self.assertEqual(set(crypto['topics']), {'taclane-boundary','comsec-readiness'})
        taclane=next(i for i in self.data['issues'] if i['id']=='taclane-boundary')
        self.assertIn('No TACLANE operator procedure',taclane['scope'])
        self.assertIn('Never remove protection',next(i for i in self.data['issues'] if i['id']=='vpn-encryption')['action'])
