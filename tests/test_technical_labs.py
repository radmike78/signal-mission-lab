import copy
import ipaddress
import json
from pathlib import Path
import unittest
from backend.technical_labs import validate_technical_labs

ROOT = Path(__file__).resolve().parents[1]


class TechnicalLabTests(unittest.TestCase):
    def setUp(self):
        self.content = json.loads((ROOT/'data/it-technical-labs.json').read_text())

    def test_complete_path_with_inspectable_evidence_and_reference_recovery(self):
        self.assertEqual(validate_technical_labs(self.content)['it_technical_labs'], 10)
        self.assertEqual(sum(len(lab['evidence']) for lab in self.content['labs']), 30)

    def test_publication_rejects_broken_sources_incomplete_decisions_and_false_authority(self):
        changes = [lambda c:c.update(configuration_authority=True), lambda c:c.update(schema_version=True),
                   lambda c:c.update(review_status='approved'), lambda c:c['labs'].pop(),
                   lambda c:c['sources'][0].update(url='https://learn.microsoft.com.evil.test/help'),
                   lambda c:c['sources'][0].update(url='https://user:secret@learn.microsoft.com/help'),
                   lambda c:c['sources'][0].update(status='not_checked'),
                   lambda c:c['sources'][0].update(status='search_excerpt_checked_direct_403'),
                   lambda c:c['sources'].append(c['sources'][0]),
                   lambda c:c['labs'][0].update(sources=['missing']),
                   lambda c:c['labs'][0].update(required_evidence=['prefix']),
                   lambda c:c['labs'][0]['evidence'][0].update(output=''),
                   lambda c:c['labs'][0]['decisions'].pop(),
                   lambda c:c['labs'][0]['decisions'][0].update(answer=True),
                   lambda c:c['labs'][0]['decisions'][0].update(answer=3),
                   lambda c:c['labs'][0]['decisions'][0]['options'][0].update(feedback='')]
        for change in changes:
            value = copy.deepcopy(self.content)
            change(value)
            with self.assertRaises(ValueError):
                validate_technical_labs(value)

    def test_subnet_example_matches_the_taught_next_hop_and_host_range(self):
        host = ipaddress.ip_interface('10.20.30.50/24')
        remote = ipaddress.ip_address('10.20.40.20')
        self.assertNotIn(remote, host.network)
        self.assertIn(remote, ipaddress.ip_network('10.20.0.0/16'))
        self.assertEqual(str(host.netmask), '255.255.255.0')
        self.assertEqual(str(host.network.broadcast_address), '10.20.30.255')
        self.assertEqual(host.network.num_addresses-2, 254)
