import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class ScenarioGraphTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT / "data/exercises.json").read_text())

    def test_all_edges_resolve(self):
        for exercise in self.data["exercises"]:
            nodes = {node["id"]: node for node in exercise["nodes"]}
            self.assertIn(exercise["start"], nodes)
            for node in nodes.values():
                for choice in node.get("choices", []):
                    self.assertIn(choice["next"], nodes)

    def test_terminal_reachable(self):
        for exercise in self.data["exercises"]:
            nodes = {node["id"]: node for node in exercise["nodes"]}
            seen, pending = set(), [exercise["start"]]
            while pending:
                current = pending.pop()
                if current in seen:
                    continue
                seen.add(current)
                pending.extend(choice["next"] for choice in nodes[current].get("choices", []))
            self.assertTrue(any(nodes[x].get("terminal") for x in seen))

    def test_training_classification(self):
        self.assertEqual(self.data["classification"], "SYNTHETIC TRAINING ONLY")
        self.assertGreaterEqual(len(self.data["exercises"]), 2)

if __name__ == "__main__":
    unittest.main()
