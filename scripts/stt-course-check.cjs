const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const {sttCourse}=await import('../web/src/stt-course-model.ts');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 await page.getByRole('button',{name:'Learn STT and network nodes →',exact:true}).click();
 const course=page.getByRole('region',{name:'STT and network-node course'});
 await course.getByRole('heading',{name:'Start with the staff task',exact:true}).waitFor();
 async function nav(name){const b=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});if(!await b.isVisible())await page.getByText('More learning tools',{exact:true}).click();await b.click();}
 assert(await course.getByRole('button',{name:'Record lesson-check result',exact:true}).isDisabled());
 for(const [i,module] of sttCourse.modules.entries()){
  const answer=i===0?0:module.checkpoint.answer;
  await course.getByLabel(module.checkpoint.options[answer].label,{exact:true}).check();await course.getByRole('button',{name:'Check my reasoning',exact:true}).click();
  await page.waitForFunction(()=>document.activeElement?.classList.contains('course-feedback'));
  assert(await course.getByRole('radio').first().isDisabled());
  if(i===1){await nav('Equipment');await page.getByLabel('Search systems',{exact:true}).waitFor();await nav('Courses');await course.getByRole('heading',{name:module.title,exact:true}).waitFor();assert.match(await course.getByRole('status').first().innerText(),/2\/6/);}
  if(i<sttCourse.modules.length-1)await course.getByRole('button',{name:'Next lesson',exact:true}).click();
 }
 await course.getByRole('button',{name:'Record lesson-check result',exact:true}).click();await course.getByText('Saved 5/6 first-choice lesson checks to device history. This does not certify practical performance or equipment readiness.',{exact:true}).waitFor();
 assert(await course.getByRole('button',{name:'Record lesson-check result',exact:true}).isDisabled());
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sml-practice-v1')));assert.equal(saved.filter(r=>r.kind==='stt-node-course').length,1);for(const r of saved)assert.deepEqual(Object.keys(r).sort(),['at','kind','score','total']);
 await course.getByText('Instructor packet and observation guide',{exact:true}).click();
 const downloading=page.waitForEvent('download');await course.getByRole('button',{name:'Download printable instructor packet',exact:true}).click();const file=await downloading,html=fs.readFileSync(await file.path(),'utf8');
 assert.match(html,/Guided first-choice result: 5\/6/);assert.match(html,/Search excerpt checked; direct page access returned 403/);assert.equal(html.includes('<script'),false);
 const packet=await context.newPage();await packet.setContent(html);await packet.getByRole('heading',{name:'STT and network-node foundations',exact:true}).waitFor();assert.equal(await packet.getByRole('heading',{level:2}).count(),8);
 const packetA11y=await new AxeBuilder({page:packet}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(packetA11y.violations.map(v=>v.id),[]);await packet.close();
 for(const id of ['lane-01','lane-02','lane-03']){await course.getByRole('button',{name:'Start '+id,exact:true}).click();await page.getByRole('region',{name:'Stateful exercise lane'}).getByLabel('Lane code').waitFor();assert.equal(await page.getByLabel('Lane code').inputValue(),id);await nav('Courses');}
 await course.getByRole('button',{name:'Reset course checks',exact:true}).click();assert.match(await course.getByRole('status').first().innerText(),/0\/6/);await page.reload();await nav('Courses');await course.getByRole('heading',{name:'Start with the staff task',exact:true}).waitFor();assert.match(await course.getByRole('status').first().innerText(),/0\/6/);
 const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(a11y.violations.map(v=>v.id),[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 fs.mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/stt-node-course-mobile.png',fullPage:true});
 await nav('My training');await page.locator('tbody tr').first().waitFor();await page.getByRole('cell',{name:'STT/node course checks',exact:true}).waitFor();await page.getByRole('button',{name:'Clear device practice',exact:true}).click();await page.waitForFunction(()=>localStorage.getItem('sml-practice-v1')===null);
 assert.deepEqual(errors,[]);console.log('PASS six offline lessons, first-choice scoring, memory continuity, capstone routing, printable packet, mobile accessibility and summary-only history');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
