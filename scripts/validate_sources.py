"""Run from repository root: python scripts/validate_sources.py. No network or uploads."""
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.provenance import validate_corpus

def main():
    try:
        values = [json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))
                  for name in ['catalog.json', 'sources.json', 'publications.json', 'equipment-coverage.json']]
        result = validate_corpus(*values)
    except (ValueError, KeyError, TypeError, OSError):
        print('Source publication checks failed. Review corpus metadata locally; no input echoed.', file=sys.stderr)
        return 1
    print(json.dumps(result))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
