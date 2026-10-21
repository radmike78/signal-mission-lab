"""Bounded in-process rate limiting; trusted edge must also impose distributed limits."""
from collections import OrderedDict
import hashlib
import os
from threading import Lock
import time
from fastapi import HTTPException, Request
from .store import configured_store

class RateLimiter:
    def __init__(self, maximum=4096):
        self.entries=OrderedDict();self.lock=Lock();self.maximum=maximum
    def check(self, key, limit, window=60):
        clock=time.monotonic()
        with self.lock:
            # Sorted by insertion of fixed windows; no per-request window extension.
            while self.entries and next(iter(self.entries.values()))[0]+window<=clock:
                self.entries.popitem(last=False)
            start,count=self.entries.get(key,(clock,0))
            if start+window<=clock:start,count=clock,0
            if count>=limit:
                raise HTTPException(429,'Request limit reached',headers={'Retry-After':str(max(1,int(start+window-clock)))})
            if key not in self.entries and len(self.entries)>=self.maximum:
                raise HTTPException(429,'Service request limit reached',headers={'Retry-After':'60'})
            self.entries[key]=(start,count+1)

limiter=RateLimiter()
def store_dependency():
    try:return configured_store()
    except ValueError as error:
        raise HTTPException(503,'Persistent learning service is not configured') from error

def principal(request: Request):
    if os.environ.get("SML_ENV") not in {"test","local"} and request.url.scheme != "https":
        raise HTTPException(426,"HTTPS is required for account access")
    # Never trust forwarded headers for rate-limit identity.
    client=request.client.host if request.client else 'unknown'
    limiter.check('client:'+client,240)
    authorization=request.headers.get('authorization','')
    import re
    if not re.fullmatch(r'Bearer [A-Za-z0-9_-]{43}',authorization):
        raise HTTPException(401,'A valid lab access token is required',headers={'WWW-Authenticate':'Bearer'})
    token=authorization[7:]
    limiter.check('token:'+hashlib.sha256(token.encode()).hexdigest(),120)
    account=store_dependency().authenticate(token)
    if not account:
        raise HTTPException(401,'Access token expired, revoked or invalid',headers={'WWW-Authenticate':'Bearer'})
    return account

# Public training endpoints also consume server resources. Keep this separate
# from authenticated-account limits, and do not trust user-supplied proxy headers.
public_limiter = RateLimiter()

class PublicAPILimit:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        path = scope.get('path', '')
        account = path == '/api/learning' or path.startswith('/api/learning/')
        if scope['type'] == 'http' and path.startswith('/api/') and not account:
            client = scope.get('client')
            key = 'public:' + (client[0] if client else 'unknown')
            try:
                public_limiter.check(key, 120)
            except HTTPException as error:
                from starlette.responses import JSONResponse
                response = JSONResponse({'detail': error.detail}, status_code=error.status_code,
                                        headers={**(error.headers or {}), 'Cache-Control': 'no-store'})
                return await response(scope, receive, send)
        return await self.app(scope, receive, send)
