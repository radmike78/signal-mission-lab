"""Bound actual ASGI body bytes before JSON parsing, including chunked requests."""
from starlette.responses import JSONResponse
class BodyLimit:
    def __init__(self, app, limit=2048):
        self.app, self.limit = app, limit
    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope['method'] not in {'POST','PUT','PATCH'}:
            return await self.app(scope, receive, send)
        body = bytearray()
        while True:
            message = await receive()
            if message['type'] == 'http.disconnect':
                return
            body.extend(message.get('body', b''))
            if len(body) > self.limit:
                response=JSONResponse({'detail':'Request body too large'},status_code=413,headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
                return await response(scope, receive, send)
            if not message.get('more_body', False):
                break
        consumed = False
        async def replay():
            nonlocal consumed
            if not consumed:
                consumed = True
                return {'type':'http.request','body':bytes(body),'more_body':False}
            return await receive()
        await self.app(scope, replay, send)
