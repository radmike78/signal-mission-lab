import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "data/catalog.json").read_text(encoding="utf-8"))

    def test_unique_equipment_ids(self):
        ids = [x["id"] for x in self.data["equipment"]]
        self.assertEqual(len(ids), len(set(ids)))

    def test_scenario_references_resolve(self):
        ids = {x["id"] for x in self.data["equipment"]}
        for scenario in self.data["scenarios"]:
            self.assertTrue(set(scenario["systems"]) <= ids)

    def test_records_have_scope(self):
        for record in self.data["equipment"]:
            for key in ("name", "category", "description", "dependencies", "roles", "confidence"):
                self.assertTrue(record[key], f"Missing {key}: {record['id']}")

    def test_no_external_scripts(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("https://", html)
        self.assertIn('src="app.js"', html)

if __name__ == "__main__":
    unittest.main()
