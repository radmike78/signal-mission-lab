const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http'),path=require('node:path');
(async()=>{
 const bundled=process.env.SML_CHROMIUM_PACKAGE?require(process.env.SML_CHROMIUM_PACKAGE).default:null;
 if(bundled)bundled.setGraphicsMode=false;
 const browser=await chromium.launch(bundled?{headless:true,args:['--disable-gpu','--disable-software-rasterizer',...bundled.args.filter(a=>!a.includes('disable-web-security')&&!a.includes('allow-running-insecure-content'))],executablePath:process.env.SML_CHROMIUM_EXECUTABLE||await bundled.executablePath()}:{headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Use a real same-origin endpoint: browser interception is unreliable across SW versions.
 const root=path.resolve(__dirname,'../web/dist');
 const fixture=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  if(pathname==='/api/offline-probe'){
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
   res.end('{"private":"not-cacheable"}');return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,body)=>{
   if(error){res.writeHead(404);res.end();return;}
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(body);
  });
 });
 await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+fixture.address().port;
 try{
 const nav=async(name)=>{const button=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});if(!await button.isVisible())await page.getByText('More learning tools',{exact:true}).click();await button.click();};
 await page.goto(url);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await nav('Offline & privacy');await page.getByText('Offline learning is ready on this browser.',{exact:true}).waitFor();
 // API traffic is deliberately outside the offline allowlist, even after a successful response.
 await page.evaluate(()=>fetch('/api/offline-probe',{headers:{Authorization:'Bearer synthetic-test'}}).then(r=>r.json()));
 await page.evaluate(()=>localStorage.setItem('unrelated-setting','keep'));
 await context.setOffline(true);await page.reload();
 await page.getByRole('heading',{name:'What is your mission?',exact:true}).waitFor();
 // Lazy-loaded Signal products must work even though never opened online.
 for(const name of ['Signal Products','Applications','IT foundations','MDMP','Equipment','Architecture','Mentor','Troubleshoot','Assessment']){
  await nav(name);await page.getByRole('heading',{name,exact:true}).waitFor();
  if(name==='Signal Products')await page.getByLabel('Signal product',{exact:true}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' overflows mobile');
 }
 for(const group of await page.locator('fieldset').all())await group.getByRole('radio').first().check();
 await page.getByRole('button',{name:'Check answers',exact:true}).click();await nav('My training');
 await page.locator('tbody tr').first().waitFor();assert.equal(await page.locator('tbody tr').count(),1);
 await page.reload();await nav('My training');await page.locator('tbody tr').first().waitFor();assert.equal(await page.locator('tbody tr').count(),1);
 await page.getByRole('button',{name:'Clear device practice',exact:true}).click();await page.waitForFunction(()=>localStorage.getItem('sml-practice-v1')===null);
 assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-setting')),'keep');
 assert.equal(await page.evaluate(()=>fetch('/api/offline-probe').then(()=>false,()=>true)),true,'API must not replay offline');
 const keys=await page.evaluate(async()=>{const result=[];for(const name of await caches.keys())for(const r of await(await caches.open(name)).keys())result.push(new URL(r.url).pathname);return result;});
 assert(keys.length>5);assert(keys.every(p=>p==='/'||p==='/index.html'||p==='/manifest.webmanifest'||p.startsWith('/assets/')||p.startsWith('/icons/')),'private/unexpected cache entry');
 await nav('Offline & privacy');fs.mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/offline-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS offline cold reload, lazy lessons, practice persistence/erase, cache privacy and mobile layout');
 }finally{await browser.close();await new Promise(resolve=>fixture.close(resolve));}
})().catch(error=>{console.error(error);process.exit(1)});
