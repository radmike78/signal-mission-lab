"""Preserve the original app under /legacy in the new static deployment."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
dist = root / 'web/dist'
legacy = dist / 'legacy'
legacy.mkdir(parents=True, exist_ok=True)
for name in ['index.html','app.js','styles.css']:
    shutil.copy2(root/name, legacy/name)
shutil.copytree(root/'data', legacy/'data', dirs_exist_ok=True)
shutil.copy2(root/'_headers', dist/'_headers')
