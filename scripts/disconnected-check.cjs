/* Exercise the extracted artifact from a fresh local origin, never the source dist. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const assert=require('node:assert/strict');
const readline=require('node:readline');
const {spawn,spawnSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),directory=fs.mkdtempSync(path.join(os.tmpdir(),'sml-disconnected-'));
 let launcher;
 try{
  const extracted=spawnSync('python',['-c',`import pathlib,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
 for name in archive.namelist():
  if pathlib.PurePosixPath(name).is_absolute() or '..' in pathlib.PurePosixPath(name).parts or '\\\\' in name: raise ValueError('Unsafe archive path')
 archive.extractall(sys.argv[2])`,path.join(root,'artifacts/disconnected-training-demo.zip'),directory],{encoding:'utf8'});
  if(extracted.status!==0)throw Error('Disconnected package extraction failed.');
  const verified=spawnSync('python',[path.join(root,'scripts/verify_disconnected.py'),directory],{encoding:'utf8'});
  if(verified.status!==0)throw Error('Disconnected artifact integrity failed.');
  launcher=spawn('python',['-B','start_disconnected.py','--port','0'],{cwd:directory,stdio:['ignore','pipe','inherit']});
  const url=await new Promise((resolve,reject)=>{
   const lines=readline.createInterface({input:launcher.stdout});
   const timer=setTimeout(()=>{lines.close();reject(Error('Offline launcher did not start.'));},10000);
   const finish=()=>{clearTimeout(timer);lines.close();};
   launcher.once('error',error=>{finish();reject(error);});
   launcher.once('exit',()=>{finish();reject(Error('Offline launcher exited early.'));});
   lines.once('line',line=>{
    finish();
    if(!/^http:\/\/127\.0\.0\.1:[0-9]+$/.test(line)){reject(Error('Offline launcher returned an invalid address.'));return;}
    resolve(line);
   });
  });
  const home=await fetch(url);
  assert.equal(home.status,200);
  assert.match(home.headers.get('Content-Security-Policy'),/default-src 'none'/);
  assert.equal(home.headers.get('X-Content-Type-Options'),'nosniff');
  assert.equal((await fetch(url+'/start_disconnected.py')).status,404);
  assert.equal((await fetch(url+'/api/capabilities')).status,404);
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,'scripts/document-plan-check.cjs')],{cwd:root,env:{...process.env,SML_URL:url},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Disconnected browser journey failed.')));});
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,'scripts/ocr-check.cjs')],{cwd:root,env:{...process.env,SML_URL:url},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Disconnected OCR journey failed.')));});
  console.log('PASS verified extracted disconnected artifact, fresh-origin startup, offline document workflow and no external requests');
 }finally{if(launcher?.pid&&launcher.exitCode===null&&launcher.signalCode===null){await new Promise(resolve=>{launcher.once('exit',resolve);launcher.kill();});}fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exit(1)});
