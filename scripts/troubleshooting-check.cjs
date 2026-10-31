const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 const nav=name=>page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')}).click();
 await nav('Troubleshoot');const w=page.locator('.diagnostic-workbench');
 if(await page.getByRole('navigation').getByRole('button').count()!==3)throw Error('Secondary tools visible on entry');
 fs.mkdirSync('artifacts/screenshots',{recursive:true});
 await page.screenshot({path:'artifacts/screenshots/troubleshooting-focused-start.png',fullPage:true});
 if(await w.getByRole('radio').count())throw Error('Decision choices exposed before checks');
 if(await page.getByLabel('Synthetic incident').isVisible())throw Error('Other incidents expanded by default');
 if(await w.locator('.current-check').count()!==1)throw Error('More than one current check');
 await w.getByRole('button',{name:'Show the check result',exact:true}).click();
 await page.waitForFunction(()=>document.activeElement?.classList.contains('check-observation'));
 if(await w.locator('pre').isVisible())throw Error('Script expanded by default');
 await w.getByText('Look inside the example script',{exact:true}).click();
 await w.locator('pre').waitFor();
 await w.getByText('Why this check matters',{exact:true}).click();
 await page.screenshot({path:'artifacts/screenshots/troubleshooting-builder.png',fullPage:true});
 await w.getByText('Review progress or decide early',{exact:true}).click();
 await w.getByRole('button',{name:'Decide with current evidence',exact:true}).click();
 await w.getByLabel('Treat this as partial completion and follow the scoped recovery plan',{exact:true}).check();
 await w.getByRole('button',{name:'Check my decision',exact:true}).click();
 await w.getByRole('heading',{name:'Decision needs review',exact:true}).waitFor();
 if(await w.getByRole('heading',{name:'Recovery and acceptance plan',exact:true}).count())throw Error('Recovery plan exposed without evidence');
 await w.getByRole('button',{name:'Review checks',exact:true}).click();
 await w.getByRole('heading',{name:'Inspect the synthetic error record',exact:true}).waitFor();
 async function finishChecks(){
  while(await w.getByRole('button',{name:'Show the check result',exact:true}).count()){
   await w.getByRole('button',{name:'Show the check result',exact:true}).click();
   const next=w.getByRole('button',{name:'Next check',exact:true});
   if(await next.count())await next.click();else{await w.getByRole('button',{name:'Choose a recovery',exact:true}).click();break;}
  }
 }
 await finishChecks();
 await w.getByRole('button',{name:'Check my decision',exact:true}).click();
 await w.getByRole('heading',{name:'Decision supported by collected evidence',exact:true}).waitFor();
 for(const [id,answer] of [['routing','Escalate the documented area mismatch for a scoped correction'],['satellite','Track the hub acceptance blocker and coordinate the approved test']]){
  await w.getByLabel('Issue to work on',{exact:true}).selectOption(id);
  if(await w.getByRole('status').count())throw Error('Case switch retained feedback');
  await finishChecks();
  await w.getByLabel(answer,{exact:true}).check();
  await w.getByRole('button',{name:'Check my decision',exact:true}).click();
  await w.getByRole('heading',{name:'Decision supported by collected evidence',exact:true}).waitFor();
  await page.screenshot({path:`artifacts/screenshots/troubleshooting-${id}.png`,fullPage:true});
 }
 await w.getByRole('button',{name:'Reset case evidence',exact:true}).click();
 if(await w.getByRole('status').count()||await w.getByRole('radio').count())throw Error('Reset retained decision');
 await page.setViewportSize({width:390,height:844});
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Mobile overflow');
 await page.screenshot({path:'artifacts/screenshots/troubleshooting-mobile.png',fullPage:true});
 await nav('Mission');await nav('Troubleshoot');
 if(await w.getByLabel('Issue to work on',{exact:true}).inputValue()!=='satellite')throw Error('Case was lost during navigation');
 await page.getByText('Other practice incidents',{exact:true}).click();await page.getByLabel('Synthetic incident').selectOption('power');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Focused troubleshooting passed: one check, optional depth, early-decision gate, resume, all cases, reset, mobile and legacy.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
