const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 const nav=name=>page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')}).click();
 await nav('Troubleshoot');const workbench=page.locator('.diagnostic-workbench');
 await workbench.getByLabel('Treat this as partial completion and follow the scoped recovery plan',{exact:true}).check();
 await workbench.getByRole('button',{name:'Review recovery decision',exact:true}).click();
 await workbench.getByRole('heading',{name:'Decision needs review',exact:true}).waitFor();
 if(await workbench.getByRole('heading',{name:'3. Recovery and acceptance plan',exact:true}).count())throw Error('Recovery plan exposed before evidence gate');
 for(const b of await workbench.getByRole('button').all())if((await b.textContent()).startsWith('Read the synthetic')||(await b.textContent()).startsWith('Inspect'))await b.click();
 await workbench.getByRole('button',{name:'Review recovery decision',exact:true}).click();
 await workbench.getByRole('heading',{name:'Decision supported by collected evidence',exact:true}).waitFor();
 fs.mkdirSync('artifacts/screenshots',{recursive:true});
 await page.screenshot({path:'artifacts/screenshots/troubleshooting-builder.png',fullPage:true});
 for(const [id,answer] of [['routing','Escalate the documented area mismatch for a scoped correction'],['satellite','Track the hub acceptance blocker and coordinate the approved test']]){
  await workbench.getByLabel('Mission troubleshooting case',{exact:true}).selectOption(id);
  if(await workbench.getByRole('status').count())throw Error('Case switch retained prior feedback');
  if(!(await workbench.getByRole('button',{name:'Review recovery decision',exact:true}).isDisabled()))throw Error('Case switch retained answer');
  for(const b of await workbench.locator('.grid button').all())await b.click();
  await workbench.getByLabel(answer,{exact:true}).check();
  await workbench.getByRole('button',{name:'Review recovery decision',exact:true}).click();
  await workbench.getByRole('heading',{name:'Decision supported by collected evidence',exact:true}).waitFor();
  await page.screenshot({path:`artifacts/screenshots/troubleshooting-${id}.png`,fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Mobile overflow');
 await page.screenshot({path:'artifacts/screenshots/troubleshooting-mobile.png',fullPage:true});
 await workbench.getByRole('button',{name:'Reset case evidence',exact:true}).click();
 if(await workbench.getByRole('status').count())throw Error('Reset retained decision');
 if(await workbench.getByText('Collected:',{exact:false}).count())throw Error('Reset retained evidence');
 await nav('Mission');await nav('Troubleshoot');
 if(await workbench.getByLabel('Mission troubleshooting case',{exact:true}).inputValue()!=='builder')throw Error('Workbench state survived navigation');
 // The original incidents remain present alongside the new workbench.
 await page.getByLabel('Synthetic incident').selectOption('power');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Troubleshooting browser journeys passed: evidence gate, all cases, reset, navigation, mobile, legacy incident.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
