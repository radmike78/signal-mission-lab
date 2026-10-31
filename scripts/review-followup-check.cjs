const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const content=require('../data/transfer-exercises.json');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:320,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.SML_URL||'http://127.0.0.1:8070';await page.goto(url);
 await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 async function nav(name){const button=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});if(!await button.isVisible())await page.getByText('More learning tools',{exact:true}).click();await button.click();}
 await nav('Troubleshoot');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'320px troubleshooting overflow');
 await page.getByLabel('Issue to work on',{exact:true}).selectOption('routing');await page.getByRole('button',{name:'Show the check result',exact:true}).click();
 await nav('My training');await nav('Troubleshoot');assert.equal(await page.getByLabel('Issue to work on',{exact:true}).inputValue(),'routing');await page.locator('.check-observation').waitFor();
 await nav('Architecture');await page.waitForFunction(()=>document.activeElement?.textContent==='Architecture');
 assert(!await page.getByText('More learning tools',{exact:true}).evaluate(e=>e.parentElement.open),'menu remains open');
 let first=true;
 for(const skill of ['builder','routing','satellite']){
  await nav('My training');await page.getByRole('button',{name:'Practice '+({builder:'build failures',routing:'routing and tunnels',satellite:'transport acceptance'}[skill]),exact:true}).click();
  for(let variant=0;variant<2;variant++){
   const exercise=content.cases.filter(c=>c.skill===skill)[variant];await page.getByRole('heading',{name:exercise.title,exact:true}).waitFor();
   for(let step=0;step<3;step++){
    const radios=page.locator('.transfer-practice').getByRole('radio');const incorrect=first&&step===0;
    await radios.nth(incorrect?(exercise.steps[step].answer+1)%3:exercise.steps[step].answer).check();await page.getByRole('button',{name:'Check this reasoning',exact:true}).click();
    assert(await radios.first().isDisabled(),'first choice can be changed after feedback');
    await page.getByRole('button',{name:step===2?'Review this attempt':'Next decision',exact:true}).click();
   }
   await page.getByRole('heading',{name:(first?'2':'3')+'/3 reasoning checks supported',exact:true}).waitFor();first=false;
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'independent practice overflow');
   if(variant===0)await page.getByRole('button',{name:'Try another variant',exact:true}).click();
  }
 }
 await nav('My training');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sml-practice-v1')||'[]').length===6);assert.equal(await page.locator('tbody tr').count(),6);
 await page.reload();await nav('My training');await page.getByText('2/3 reasoning checks',{exact:true}).waitFor();assert.equal(await page.locator('tbody tr').count(),6);
 await nav('Mission');await page.getByLabel('Tell us what your team needs to accomplish').fill('Fictional brigade uses CPCE at one location for user access.');await page.getByLabel('This is a fictional, non-sensitive training mission.').check();await page.getByRole('button',{name:'Understand my mission →',exact:true}).click();
 await page.getByRole('heading',{name:'Your mission. A clearer path.',exact:true}).waitFor();
 assert(await page.locator('.equipment-shortlist').isHidden(),'equipment detail expanded on entry');assert(await page.locator('.preparation-brief').isHidden(),'preparation detail expanded on entry');
 const words=await page.locator('main').innerText().then(t=>t.split(/\s+/).length);assert(words<500,'mission result too dense: '+words);
 require('fs').mkdirSync('artifacts/screenshots',{recursive:true});await page.screenshot({path:'artifacts/screenshots/mission-focused-review.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS focused brief, keyboard destination, 320px layout, preserved case, offline lazy practice, six varied cases, locked first choices, durable outcomes and review prompts');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
