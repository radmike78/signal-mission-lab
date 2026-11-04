"""Package built public training assets for offline transfer; never authorizes real data."""
import hashlib
import json
from pathlib import Path
import zipfile

README = """Signal Mission Lab — disconnected training demonstration

FICTIONAL TRAINING ONLY. This package is not authorized for classified, CUI or real
operational documents. An offline build is not an authorization to process them.

1. Verify every file listed in SHA256SUMS with a trusted checksum tool.
   On Linux: sha256sum -c SHA256SUMS
   Or, after establishing trust in the release: python3 verify_disconnected.py
   The verifier rejects changed, missing, extra or symlinked files. Run it before
   starting the server or creating files inside the extracted package directory.
   The manifest detects changes; it is not a trusted signature or authorization.
2. In this extracted directory, run: python3 -m http.server 8070 --bind 127.0.0.1
3. Open http://127.0.0.1:8070 on the same machine in a current supported browser.
   Do not open index.html directly as a file. Workers need an HTTP/HTTPS origin.
4. Open Document planner, load the fictional demonstration, confirm the training
   boundary, review tasks and create the requirements worksheet.

No Internet connection is required after approved transfer of this package. All
public parser/code assets are bundled. Document import is local, memory-only and
rule-based; no semantic AI service is included. Optional bundled English OCR reads
PNG/JPEG images up to three megapixels or up to three PDF pages. Every OCR page
requires human correction/review before planning. Recognition confidence is not
measured accuracy. DOCX/text and text-based PDF imports have separate size limits.

Exports are explicit local downloads; browser/OS downloads, caches and temporary
files need their own host handling procedures. Clear session removes application
references; it does not securely erase RAM, swap, crash dumps or downloaded files.
Connected instructor accounts require a separately deployed API and are not part
of this static package. A multi-user deployment requires approved hosting, TLS,
identity/access controls and operating procedures; do not expose this demo server.

For an operational/classified edition: obtain a sponsoring system owner and work
with the responsible security organization and authorizing official. Scope the
enclave, users, information types, endpoints, model/OCR, storage, logs, exports,
backup, updates and media transfer. Test and authorize the complete system before
use with actual data. This package neither enables nor certifies that use.
"""


def package(dist: Path, output: Path):
    manifest = json.loads((dist/'offline-build.json').read_text())
    paths = set()
    for url in manifest['public_assets']:
        relative = 'index.html' if url == '/' else url.removeprefix('/')
        if not relative or '..' in Path(relative).parts or Path(relative).is_absolute() or '\\' in relative or any(ord(c) < 32 or ord(c) == 127 for c in relative):
            raise ValueError('Unsafe public asset path')
        paths.add(relative)
    paths.update({'sw.js', 'offline-build.json', '_headers'})
    legacy = dist/'legacy'
    if legacy.exists():
        paths.update(p.relative_to(dist).as_posix() for p in legacy.rglob('*') if p.is_file())
    contents = {'START_HERE.txt': README.encode(), 'verify_disconnected.py': (Path(__file__).parent/'verify_disconnected.py').read_bytes()}
    for relative in sorted(paths):
        path = dist/relative
        if path.is_symlink() or not path.is_file() or dist.resolve() not in path.resolve().parents:
            raise ValueError('Missing or unsafe packaged asset')
        contents[relative] = path.read_bytes()
    contents['SHA256SUMS'] = ''.join(hashlib.sha256(data).hexdigest()+'  '+name+'\n' for name, data in sorted(contents.items())).encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(contents.items()):
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return len(contents)


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    count = package(root/'web/dist', root/'artifacts/disconnected-training-demo.zip')
    print(f'Disconnected training demo packaged: {count} files; fictional training only.')
