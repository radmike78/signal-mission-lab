"""Serve a verified fictional-training package on IPv4 loopback only."""
import argparse
from hashlib import sha256
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from verify_disconnected import verified_manifest

MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
    '.png': 'image/png', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
}
PRIVATE = {'START_HERE.txt', 'verify_disconnected.py', 'start_disconnected.py', '_headers'}
STATIC_HEADERS = {
    'Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy',
    'X-Frame-Options', 'Permissions-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy',
}


def load_release(root):
    manifest = verified_manifest(root)

    def read(name):
        value = (root / name).read_bytes()
        if sha256(value).hexdigest() != manifest[name]:
            raise ValueError('Package changed after verification')
        return value

    headers = {}
    for line in read('_headers').decode('utf-8').splitlines():
        name, _, value = line.strip().partition(':')
        if name in STATIC_HEADERS and value.strip():
            headers[name] = value.strip()
    if set(headers) != STATIC_HEADERS:
        raise ValueError('Invalid release security headers')
    # HTTP loopback is a secure context for the supported browser. Do not
    # upgrade its local assets to TLS, which this launcher does not serve.
    headers['Content-Security-Policy'] = '; '.join(
        item.strip() for item in headers['Content-Security-Policy'].split(';')
        if item.strip() and item.strip() != 'upgrade-insecure-requests'
    )
    files = {'/' + name: read(name) for name in manifest if name not in PRIVATE}
    files['/'] = files['/index.html']
    if '/legacy/index.html' in files:
        files['/legacy/'] = files['/legacy/index.html']
    return headers, files


def handler(headers, files):
    class ReleaseHandler(BaseHTTPRequestHandler):
        def send_asset(self, send_body):
            if self.headers.get('Host') != f'127.0.0.1:{self.server.server_port}':
                self.respond(400)
                return
            try:
                url = urlsplit(self.path)
            except ValueError:
                self.respond(400)
                return
            if url.scheme or url.netloc or url.path not in files:
                self.respond(404)
                return
            data = files[url.path]
            suffix = Path(url.path).suffix or '.html'
            self.respond(200, MIME.get(suffix, 'application/octet-stream'), data, send_body)

        def respond(self, status, mime='text/plain', data=b'', send_body=False):
            self.send_response(status)
            for name, value in headers.items():
                self.send_header(name, value)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            if send_body:
                self.wfile.write(data)

        def do_GET(self):
            self.send_asset(True)

        def do_HEAD(self):
            self.send_asset(False)

        def log_message(self, *_):
            pass

    return ReleaseHandler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8070)
    args = parser.parse_args()
    try:
        headers, files = load_release(Path(__file__).resolve().parent)
        with ThreadingHTTPServer(('127.0.0.1', args.port), handler(headers, files)) as server:
            print(f'http://127.0.0.1:{server.server_port}', flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except (OSError, ValueError, KeyError, OverflowError):
        parser.exit(1, 'Could not start the verified training package. Check its integrity or choose another port.\n')


if __name__ == '__main__':
    main()
