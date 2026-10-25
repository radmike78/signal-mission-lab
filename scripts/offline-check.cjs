const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const bundled=process.env.SML_CHROMIUM_PACKAGE?require(process.env.SML_CHROMIUM_PACKAGE).default:null;
 if(bundled)bundled.setGraphicsMode=false;
 const browser=await chromium.launch(bundled?{headless:true,args:['--disable-gpu','--disable-software-rasterizer',...bundled.args.filter(a=>!a.includes('disable-web-security')&&!a.includes('allow-running-insecure-content'))],executablePath:process.env.SML_CHROMIUM_EXECUTABLE||await bundled.executablePath()}:{headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.SML_URL||'http://127.0.0.1:8070';
 const nav=async(name)=>{const button=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});if(!await button.isVisible())await page.getByText('More learning tools',{exact:true}).click();await button.click();};
 await page.goto(url);await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await nav('Offline & privacy');await page.getByText('Offline learning is ready on this browser.',{exact:true}).waitFor();
 // API traffic is deliberately outside the offline allowlist, even after a successful response.
 await page.route('**/api/offline-probe',route=>route.fulfill({status:200,contentType:'application/json',body:'{"private":"not-cacheable"}'}));
 await page.evaluate(()=>fetch('/api/offline-probe',{headers:{Authorization:'Bearer synthetic-test'}}).then(r=>r.json()));
 await page.unroute('**/api/offline-probe');
 await page.evaluate(()=>localStorage.setItem('unrelated-setting','keep'));
 await context.setOffline(true);await page.reload();
 await page.getByRole('heading',{name:'What is your mission?',exact:true}).waitFor();
 // Lazy-loaded Signal products must work even though never opened online.
 for(const name of ['Signal Products','Applications','IT foundations','MDMP','Knowledge graph','Architecture','Mentor','Troubleshoot','Assessment']){
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
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS offline cold reload, lazy lessons, practice persistence/erase, cache privacy and mobile layout');
})().catch(error=>{console.error(error);process.exit(1)});
