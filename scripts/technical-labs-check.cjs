const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const {technicalLabs}=await import('../web/src/technical-lab-model.ts');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 await page.getByRole('button',{name:'Learn STT and network nodes →',exact:true}).click();
 await page.getByRole('button',{name:'Open technical labs',exact:true}).click();
 const area=page.getByRole('region',{name:'IT professional labs',exact:true});
 await area.getByRole('heading',{name:'IT professional labs',exact:true}).waitFor();
 assert.equal(await area.getByRole('radio').count(),3);assert(await area.getByRole('radio').first().isDisabled());
 assert.equal(await area.getByLabel('Reference recovery evidence',{exact:true}).count(),0);
 const navigation=page.getByRole('navigation');
 async function nav(name){const button=navigation.getByRole('button',{name:new RegExp(name+'$')});if(!await button.isVisible())await page.getByText('More learning tools',{exact:true}).click();await button.click();}
 for(const [index,lab] of technicalLabs.labs.entries()){
  await area.getByLabel('Technical lab',{exact:true}).selectOption(lab.id);
  await area.getByRole('heading',{name:lab.title,exact:true}).waitFor();
  assert(await area.getByRole('button',{name:'Record diagnosis',exact:true}).isDisabled());
  for(const evidence of lab.evidence){await area.getByRole('button',{name:'Inspect: '+evidence.title,exact:true}).click();await area.getByLabel(evidence.title+' supplied output',{exact:true}).waitFor();}
  if(index===0){
   await nav('Equipment');await page.getByLabel('Search systems',{exact:true}).waitFor();await nav('Technical labs');
   assert.match(await area.getByRole('status').first().innerText(),/3\/3 evidence/);
   fs.mkdirSync('artifacts/screenshots',{recursive:true});
   await page.screenshot({path:'artifacts/screenshots/technical-lab-desktop.png'});
  }
  for(let stage=0;stage<3;stage++){
   const choice=index===0&&stage===0?(lab.decisions[0].answer+1)%3:lab.decisions[stage].answer;
   await area.getByRole('radio').nth(choice).check();
   await area.getByRole('button',{name:'Record '+['diagnosis','correction','verification'][stage],exact:true}).click();
   await page.waitForFunction(()=>document.activeElement?.classList.contains('technical-feedback'));
   assert.match(await area.getByRole('status').first().innerText(),new RegExp((stage+1)+'/3 decisions'));
   if(stage===0)assert.equal(await area.getByLabel('Reference recovery evidence',{exact:true}).count(),0);
   if(stage===1){await area.getByLabel('Reference recovery evidence',{exact:true}).waitFor();await area.getByText(/shown even if your correction choice was wrong/).waitFor();}
  }
  assert.equal(await area.getByRole('radio').count(),0);
  const summary=await area.getByRole('status').first().innerText();assert.match(summary,index===0?/2\/3 supported/:/3\/3 supported/);
  const record=area.getByRole('button',{name:'Record lab result',exact:true});await record.click();assert(await record.isDisabled());
 }
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sml-practice-v1')));
 assert.equal(saved.length,technicalLabs.labs.length);assert(saved.every(r=>r.kind==='technical-lab'&&r.total===3));assert.equal(saved[0].score,2);
 for(const r of saved)assert.deepEqual(Object.keys(r).sort(),['at','kind','score','total']);
 await area.getByLabel('Technical lab',{exact:true}).selectOption('subnet');assert.match(await area.getByRole('status').first().innerText(),/2\/3 supported/);
 await area.getByRole('button',{name:'Reset this lab attempt',exact:true}).click();assert.match(await area.getByRole('status').first().innerText(),/0\/3 evidence/);
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(const lab of technicalLabs.labs){
   await area.getByLabel('Technical lab',{exact:true}).selectOption(lab.id);
   for(const e of lab.evidence)await area.getByRole('button',{name:'Inspect: '+e.title,exact:true}).click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
  }
 }
 await area.getByLabel('Technical lab',{exact:true}).selectOption('taclane-plaintext');await area.getByRole('heading',{name:'Inspect the remote plaintext route',exact:true}).evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:'artifacts/screenshots/taclane-plaintext-mobile.png'});
 await area.getByLabel('Technical lab',{exact:true}).selectOption('ospf');
 await area.getByLabel('Observed configuration',{exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:'artifacts/screenshots/technical-lab-ospf-mobile.png'});
 await page.reload();await nav('Technical labs');await area.getByLabel('Technical lab',{exact:true}).waitFor();assert.match(await area.getByRole('status').first().innerText(),/0\/3 evidence.*0\/3 decisions/);
 await nav('My training');await page.getByRole('cell',{name:'IT technical lab decisions',exact:true}).first().waitFor();
 await page.getByRole('button',{name:'Clear device practice',exact:true}).click();await page.waitForFunction(()=>localStorage.getItem('sml-practice-v1')===null);
 assert.deepEqual(errors,[]);console.log('PASS ten offline technical labs, evidence gates, first-choice decisions, reference recovery, navigation continuity, summary history, desktop/mobile accessibility and layout');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
