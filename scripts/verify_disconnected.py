"""Check an extracted demo against its manifest. Integrity is not authenticity/approval."""
import hashlib
from pathlib import Path, PurePosixPath
import re
import sys


def verify(directory: Path):
    root = directory.resolve(strict=True)
    manifest = root/'SHA256SUMS'
    if manifest.is_symlink() or not manifest.is_file() or manifest.stat().st_size > 200_000:
        raise ValueError('Invalid checksum manifest')
    expected = {}
    for line in manifest.read_text(encoding='utf-8').splitlines():
        match = re.fullmatch(r'([0-9a-f]{64})  ([^\x00-\x1f\x7f]+)', line)
        if not match:
            raise ValueError('Invalid checksum entry')
        digest, name = match.groups()
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or path.as_posix() != name or name in expected or name == 'SHA256SUMS':
            raise ValueError('Unsafe or duplicate checksum entry')
        expected[name] = digest
    if not expected or len(expected) > 1000:
        raise ValueError('Invalid checksum entry count')
    actual = set()
    total = 0
    for item in root.rglob('*'):
        if item.is_symlink():
            raise ValueError('Symlinks are not permitted')
        if item.is_file():
            name = item.relative_to(root).as_posix()
            if name == 'SHA256SUMS':
                continue
            if name not in expected or item.stat().st_size > 20_000_000:
                raise ValueError('Unexpected or oversized file')
            total += item.stat().st_size
            if total > 100_000_000:
                raise ValueError('Package exceeds verification limit')
            digest = hashlib.sha256()
            with item.open('rb') as source:
                for chunk in iter(lambda: source.read(65536), b''):
                    digest.update(chunk)
            if digest.hexdigest() != expected[name]:
                raise ValueError('File checksum mismatch')
            actual.add(name)
    if actual != set(expected):
        raise ValueError('Missing packaged file')
    return len(actual)


if __name__ == '__main__':
    try:
        count = verify(Path(sys.argv[1]) if len(sys.argv) == 2 else Path.cwd())
    except (ValueError, OSError, UnicodeError):
        print('Package integrity check failed. Do not use this copy.', file=sys.stderr)
        raise SystemExit(1) from None
    print(f'Integrity checks passed for {count} files. Origin/authenticity and authorization are not established.')
