"""Bundle pinned public OCR assets after Vite, before offline allowlisting. No network."""
import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT/'web/node_modules'


def main():
    assets = ROOT/'web/dist/assets'
    assets.mkdir(parents=True, exist_ok=True)
    versions = {'tesseract.js': '7.0.0', 'tesseract.js-core': '7.0.0', '@tesseract.js-data/eng': '1.0.0'}
    for package, version in versions.items():
        if json.loads((MODULES/package/'package.json').read_text())['version'] != version:
            raise ValueError('Review OCR asset version changes before packaging')
    files = {
        'ocr-worker.min.js': 'tesseract.js/dist/worker.min.js',
        'tesseract-core-lstm.js': 'tesseract.js-core/tesseract-core-lstm.js',
        'tesseract-core-lstm.wasm': 'tesseract.js-core/tesseract-core-lstm.wasm',
        'eng.traineddata.gz': '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz',
    }
    manifest = {'packages': versions, 'language': 'English', 'engine': 'LSTM-only, non-SIMD', 'files': {}}
    for name, source in files.items():
        shutil.copyfile(MODULES/source, assets/name)
        manifest['files'][name] = hashlib.sha256((assets/name).read_bytes()).hexdigest()
    notices = 'Bundled OCR assets. No CDN or external language fetch is configured.\n\n'
    for package in ('tesseract.js', 'tesseract.js-core'):
        notices += package+'\n'+(MODULES/package/('LICENSE.md' if package=='tesseract.js' else 'LICENSE')).read_text()+'\n'
    notices += 'Upstream tessdata license (https://github.com/naptha/tessdata/blob/gh-pages/LICENSE):\n'+(ROOT/'third_party/tessdata-LICENSE.txt').read_text()+'\n'
    notices += 'English language distribution metadata and provenance:\n'+(MODULES/'@tesseract.js-data/eng/package.json').read_text()+'\n'+(MODULES/'@tesseract.js-data/eng/README.md').read_text()
    (assets/'ocr-notices.txt').write_text(notices)
    (assets/'ocr-assets.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print('Bundled pinned local English OCR worker, core and language assets.')


if __name__ == '__main__':
    main()
