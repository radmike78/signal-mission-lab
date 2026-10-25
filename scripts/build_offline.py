"""Build an exact, versioned public-asset allowlist. Never cache API/credential traffic."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
dist = root / 'web/dist'
files = [dist/'index.html', dist/'manifest.webmanifest', *sorted((dist/'assets').glob('*')), *sorted((dist/'icons').glob('*.png'))]
if any(not p.is_file() for p in files):
    raise SystemExit('Missing offline build assets')
version = hashlib.sha256(b''.join(p.read_bytes() for p in files)).hexdigest()[:20]
urls = ['/' if p.name == 'index.html' else '/'+p.relative_to(dist).as_posix() for p in files]
urls.append('/index.html')
worker = ''''use strict';
const CACHE='sml-public-VERSION';
const URLS=ASSETS;
const allowed=new Set(URLS);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(URLS);}catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('sml-public-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.source&&event.data?.type==='ACTIVATE_UPDATE')void self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.search||request.headers.has('Authorization')||!allowed.has(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(url.pathname);return cached||fetch(request);})());
});
'''.replace('VERSION', version).replace('ASSETS', json.dumps(urls))
(dist/'sw.js').write_text(worker)
(dist/'offline-build.json').write_text(json.dumps({'version': version, 'public_assets': urls}, indent=2)+'\n')
print('Offline public assets:', len(urls))
