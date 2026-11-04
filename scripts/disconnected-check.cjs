/* Exercise the extracted artifact from a fresh local origin, never the source dist. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http');
const {spawn,spawnSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'sml-disconnected-'));
 let server;
 try{
  const extracted=spawnSync('python',['-c',`import pathlib,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
 for name in archive.namelist():
  if pathlib.PurePosixPath(name).is_absolute() or '..' in pathlib.PurePosixPath(name).parts or '\\\\' in name: raise ValueError('Unsafe archive path')
 archive.extractall(sys.argv[2])`,path.join(root,'artifacts/disconnected-training-demo.zip'),directory],{encoding:'utf8'});
  if(extracted.status!==0)throw Error('Disconnected package extraction failed.');
  const verified=spawnSync('python',[path.join(root,'scripts/verify_disconnected.py'),directory],{encoding:'utf8'});
  if(verified.status!==0)throw Error('Disconnected artifact integrity failed.');
  const csp=fs.readFileSync(path.join(directory,'_headers'),'utf8').split('\n').find(line=>line.includes('Content-Security-Policy:')).split('Content-Security-Policy:')[1].trim();
  server=http.createServer((req,res)=>{
   let file;
   try{const url=new URL(req.url,'http://127.0.0.1');file=path.resolve(directory,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{res.writeHead(400);res.end();return;}
   if(!file.startsWith(directory+path.sep)){res.writeHead(403);res.end();return;}
   fs.readFile(file,(error,body)=>{
    if(error){res.writeHead(404);res.end();return;}
    const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.txt':'text/plain','.wasm':'application/wasm'};
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff'});res.end(body);
   });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,'scripts/document-plan-check.cjs')],{cwd:root,env:{...process.env,SML_URL:'http://127.0.0.1:'+port},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Disconnected browser journey failed.')));});
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,'scripts/ocr-check.cjs')],{cwd:root,env:{...process.env,SML_URL:'http://127.0.0.1:'+port},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Disconnected OCR journey failed.')));});
  console.log('PASS verified extracted disconnected artifact, fresh-origin startup, offline document workflow and no external requests');
 }finally{if(server)await new Promise(resolve=>server.close(resolve));fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exit(1)});
