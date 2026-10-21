import json
import unittest
from copy import deepcopy
from pathlib import Path
from backend.signal_products import validate_signal_products


class SignalProductsTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((Path(__file__).resolve().parents[1] / 'data/signal-products.json').read_text())

    def test_published_products_have_reviewed_context(self):
        self.assertEqual(validate_signal_products(self.data)['signal_products'], 18)
        self.assertTrue({'annex-h', 'soi', 'running-estimate', 'network-diagram', 'pace', 'rehearsal'} <= {p['id'] for p in self.data['products']})

    def test_unread_pdf_cannot_be_claim_evidence(self):
        self.data['products'][0]['source_ids'] = ['fm50-followup']
        with self.assertRaises(ValueError): validate_signal_products(self.data)

    def test_reject_invalid_evidence_and_presentation(self):
        for mutation in ('host', 'duplicate', 'unknown', 'status', 'empty', 'contents'):
            data = deepcopy(self.data)
            if mutation == 'host': data['sources'][0]['url'] = 'https://www.army.mil.evil.test/article/1'
            if mutation == 'duplicate': data['products'].append(data['products'][0])
            if mutation == 'unknown': data['products'][0]['source_ids'] = ['missing']
            if mutation == 'status': data['products'][0]['kind'] = 'approved_operational_template'
            if mutation == 'empty': data['products'][0]['purpose'] = ''
            if mutation == 'contents': data['products'][0]['contents'] = 'Not a list'
            with self.subTest(mutation=mutation), self.assertRaises(ValueError): validate_signal_products(data)
