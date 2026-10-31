"""Run from repository root: python scripts/validate_sources.py. No network or uploads."""
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.provenance import validate_corpus
from backend.technology import validate_technology
from backend.recovery import validate_content
from backend.application_support import validate_applications
from backend.signal_products import validate_signal_products
from backend.failure_guides import validate_failure_guides

def main():
    try:
        values = [json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))
                  for name in ['catalog.json', 'sources.json', 'publications.json', 'equipment-coverage.json']]
        result = validate_corpus(*values)
        result.update(validate_failure_guides(json.loads((ROOT / "data/network-failures.json").read_text(encoding="utf-8")), values[0]))
        result.update(validate_technology(json.loads((ROOT / "data/technology-learning.json").read_text(encoding="utf-8")), values[0]))
        result.update(validate_content(json.loads((ROOT / "data/recovery-exercises.json").read_text(encoding="utf-8"))))
        from backend.recovery import validate_transfer
        result.update(validate_transfer(json.loads((ROOT / 'data/transfer-exercises.json').read_text(encoding='utf-8'))))
        result.update(validate_applications(json.loads((ROOT / "data/application-support.json").read_text(encoding="utf-8"))))
        result.update(validate_signal_products(json.loads((ROOT / "data/signal-products.json").read_text(encoding="utf-8"))))
    except (ValueError, KeyError, TypeError, OSError):
        print('Source publication checks failed. Review corpus metadata locally; no input echoed.', file=sys.stderr)
        return 1
    print(json.dumps(result))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

