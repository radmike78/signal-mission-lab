const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
exports.serveDirectory=async(directory)=>{
 const root=path.resolve(directory),csp=fs.readFileSync(path.join(root,'_headers'),'utf8').split('\n').find(line=>line.includes('Content-Security-Policy:')).split('Content-Security-Policy:')[1].trim();
 const server=http.createServer((req,res)=>{
  let file;
  try{const url=new URL(req.url,'http://127.0.0.1');file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{res.writeHead(400);res.end();return;}
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,body)=>{
   if(error){res.writeHead(404);res.end();return;}
   const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.txt':'text/plain','.wasm':'application/wasm'};
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff'});res.end(body);
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {url:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(resolve=>server.close(resolve))};
};
