/* Automated WCAG checks complement the keyboard and mobile browser journeys. */
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs');
(async()=>{
 const bundled=process.env.SML_CHROMIUM_PACKAGE?require(process.env.SML_CHROMIUM_PACKAGE).default:null;
 const browser=await chromium.launch(bundled?{headless:true,args:bundled.args.filter(a=>!a.includes('single-process')),executablePath:await bundled.executablePath()}:{headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:1000}}),page=await context.newPage(),results=[];
 await page.goto(process.env.SML_URL||'http://127.0.0.1:8070');
 async function scan(name){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();results.push({name,violations:result.violations});}
 for(const name of ['Mission','Equipment','Troubleshoot','My training','Assessment','IT foundations','Applications','Signal Products','MDMP','Architecture','Mentor','Offline & privacy']){
  const button=page.getByRole('navigation').getByRole('button',{name:new RegExp(name+'$')});
  if(!await button.isVisible())await page.getByText('More learning tools',{exact:true}).click();await button.click();await scan(name);
 }
 await page.getByRole('navigation').getByRole('button',{name:/Equipment$/}).click();
 await page.getByLabel('Search systems',{exact:true}).fill('stt');await page.getByRole('button',{name:/^Satellite Transportable Terminal \(STT\)/}).click();
 const panel=page.getByRole('region',{name:'Equipment mission learning'});
 await panel.getByText('Practice a leader update',{exact:true}).click();
 for(const text of await panel.getByRole('textbox').all())await text.fill('Synthetic observation for instructor discussion.');
 await panel.getByRole('button',{name:'Review my leader update',exact:true}).click();
 await page.getByRole('heading',{name:'Your draft briefing'}).waitFor();await scan('Expanded leader update');
 await page.setViewportSize({width:390,height:844});await scan('Mobile leader update');
 fs.mkdirSync('artifacts/screenshots',{recursive:true});fs.writeFileSync('artifacts/screenshots/accessibility.json',JSON.stringify(results,null,2));
 const failures=results.filter(r=>r.violations.length);
 if(failures.length)throw Error('Accessibility violations: '+failures.map(r=>r.name+': '+r.violations.map(v=>v.id).join(', ')).join('; '));
 console.log('PASS automated WCAG A/AA rules on 12 learning areas and expanded desktop/mobile leader practice; manual assistive-technology review remains separate.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
