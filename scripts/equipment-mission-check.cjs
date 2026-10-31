const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const bundled=process.env.SML_CHROMIUM_PACKAGE?require(process.env.SML_CHROMIUM_PACKAGE).default:null;
 const browser=await chromium.launch(bundled?{headless:true,args:bundled.args,executablePath:await bundled.executablePath()}:{headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 await page.getByRole('navigation').getByRole('button',{name:/Equipment$/}).click();
 async function select(id,name){await page.getByLabel('Search systems',{exact:true}).fill(id);await page.getByRole('button',{name}).click();}
 await select('stt',/^Satellite Transportable Terminal \(STT\)/);
 const panel=page.getByRole('region',{name:'Equipment mission learning'});
 await panel.getByText('Practice a leader update',{exact:true}).click();
 const review=panel.getByRole('button',{name:'Review my leader update'});
 assert(await review.isDisabled());
 for(const textarea of await panel.getByRole('textbox').all())await textarea.fill('Synthetic observation for instructor discussion.');
 await review.click();assert(await panel.getByRole('region',{name:'Leader update review'}).isVisible());
 await panel.getByRole('checkbox').first().check();
 await panel.getByRole('textbox').first().fill('Revised synthetic evidence');
 assert.equal(await panel.getByRole('region',{name:'Leader update review'}).count(),0);
 await review.click();assert.equal(await panel.locator('input[type=checkbox]:checked').count(),0);
 await panel.getByLabel('Practice environment').selectOption('WFX');assert.equal(await panel.getByRole('textbox').first().inputValue(),'');assert(await review.isDisabled());
 for(const [id,name] of [['jnn',/^JNN \/ WIN-T/],['cpn',/^CPN/],['bccs',/^Battle Command Common Services/],['tsi',/^Tactical Server Infrastructure/],['jbc-p',/^Joint Battle Command/],['mmc-s',/^Mounted Mission Command–Software/],['trilos',/^Terrestrial Transmission/],['sincgars',/^SINCGARS/],['hf',/^HF radio category/]]){
 await select(id,name);assert.equal(await panel.count(),1);assert.equal(await panel.getByLabel('Practice environment').inputValue(),'COMMEX');
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 require('fs').mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/equipment-mission-mobile.png',fullPage:true});
 console.log('PASS all ten systems, offline leader practice, required fields, reset behavior and mobile layout');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
