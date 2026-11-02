const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const {laneActions}=await import('../web/src/exercise-lane-model.ts');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 async function nav(name){const b=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});if(!await b.isVisible())await page.getByText('More learning tools',{exact:true}).click();await b.click();}
 await nav('Troubleshoot');await page.getByRole('button',{name:'Run an exercise lane',exact:true}).click();
 const lane=page.getByRole('region',{name:'Stateful exercise lane'});
 await lane.getByLabel('Lane code').waitFor();
 async function act(id){const a=laneActions[id];await lane.getByRole('group',{name:'Action categories'}).getByRole('button',{name:a.group,exact:true}).click();const escaped=a.label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');await lane.getByRole('button',{name:new RegExp('^'+escaped)}).click();}
 async function inspect(){for(const id of ['inspect-local','inspect-link','inspect-path','inspect-feed','brief-remote'])await act(id);}
 for(const [id,mode] of [['lane-01','commex'],['lane-02','staffex'],['lane-03','wfx']]){
  await lane.getByLabel('Lane code').selectOption(id);await lane.getByLabel('Exercise environment').selectOption(mode);
  await inspect();
  if(id==='lane-01'){
   await nav('Equipment');await page.getByLabel('Search systems',{exact:true}).waitFor();await nav('Exercise lane');
   assert.match(await lane.getByLabel('Exercise activity').innerText(),/5\s+actions recorded/);
  }
  if(id!=='lane-02')await act('repair-handoff');
  if(id==='lane-03'){
   await act('send-report');await lane.locator('.lane-observation').getByText('The dummy reporting exchange fails. Inspect the path and application dependencies.',{exact:true}).waitFor();
   await act('inspect-path');await act('inspect-feed');
  }
  if(id!=='lane-01')await act('restore-sync');
  for(const action of ['send-report','confirm-receipt','inspect-feed','handoff-tested'])await act(action);
  const review=lane.getByRole('article',{name:'Exercise debrief'});
  await review.getByRole('heading',{name:'Exercise debrief',exact:true}).waitFor();
  await page.waitForFunction(()=>document.activeElement?.textContent==='Exercise debrief');
  assert.match(await review.getByRole('status').innerText(),/4\/4/);
  const download=page.waitForEvent('download');await review.getByRole('button',{name:'Download instructor debrief'}).click();const exported=await download;
  const report=JSON.parse(fs.readFileSync(await exported.path(),'utf8'));assert.equal(report.laneId,id);assert.equal(report.mode,mode);assert.equal(report.score,4);assert.equal(report.trace.length,report.actionCount);assert.match(report.recordStatus,/not an authenticated/);
 }
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a11y.violations.map(v=>v.id),[]);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 fs.mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/exercise-lane-debrief-mobile.png',fullPage:true});
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sml-practice-v1')));assert.equal(stored.filter(r=>r.kind==='exercise-lane').length,3);for(const r of stored)assert.deepEqual(Object.keys(r).sort(),['at','kind','score','total']);
 await lane.getByRole('button',{name:'Reset exercise lane',exact:true}).click();assert.match(await lane.getByLabel('Exercise activity').innerText(),/0\s+actions recorded/);
 await page.reload();await page.getByRole('button',{name:'Practice an exercise lane →',exact:true}).click();await lane.getByLabel('Lane code').waitFor();assert.match(await lane.getByLabel('Exercise activity').innerText(),/0\s+actions recorded/);
 await nav('My training');await page.locator('tbody tr').first().waitFor();assert.equal(await page.locator('tbody tr').count(),3);await page.getByRole('button',{name:'Clear device practice'}).click();await page.waitForFunction(()=>localStorage.getItem('sml-practice-v1')===null);
 assert.deepEqual(errors,[]);console.log('PASS offline stateful lanes, partial multi-fault recovery, repeatable contexts, instructor exports, cross-tab continuity, focus, mobile accessibility and bounded history');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
