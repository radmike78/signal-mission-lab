const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:320,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 const nav=page.getByRole('navigation').getByRole('button',{name:/Knowledge graph$/});if(!await nav.isVisible())await page.getByText('More learning tools',{exact:true}).click();await nav.click();
 await page.getByLabel('Search systems',{exact:true}).fill('cpn');await page.getByRole('button',{name:/^CPN/}).click();
 const guide=page.getByRole('region',{name:'Why systems fail'});await guide.getByRole('heading',{name:'Why does it fail?',exact:true}).waitFor();
 const select=guide.getByLabel('Work on one issue',{exact:true});assert.equal(await select.locator('option').count(),6);
 await select.selectOption('vpn-encryption');await guide.getByText('Correction and proof of recovery',{exact:true}).click();await guide.getByText(/Never remove protection/).waitFor();
 await guide.getByText('Evidence and limits',{exact:true}).click();assert.equal(await guide.getByRole('link').count(),2);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px guide overflow');
 await page.getByLabel('Search systems',{exact:true}).fill('crypto');await page.getByRole('button',{name:/Public cryptographic-device overview/}).click();await select.selectOption('comsec-readiness');await guide.getByText(/No fill, zeroize or recovery sequence/).count().then(n=>assert.equal(n,1));
 await page.getByLabel('Search systems',{exact:true}).fill('STT');await page.getByRole('button',{name:/^Satellite Transportable Terminal \(STT\)/}).click();await guide.getByText('No researched failure guide published for this entry yet.',{exact:true}).waitFor();assert.equal(await guide.getByRole('combobox').count(),0);
 await page.getByLabel('Search systems',{exact:true}).fill('cpn');await page.getByRole('button',{name:/^CPN/}).click();await select.selectOption('ospf-exchange');
 require('fs').mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/network-failure-guide-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'artifacts/screenshots/network-failure-guide.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS offline network guides, six conditional topics, encryption boundary, explicit missing system guide, selection reset and 320px layout');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
