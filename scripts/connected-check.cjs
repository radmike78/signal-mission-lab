/* Real browser -> same-origin FastAPI -> persistent database, synthetic test identities only. */
const {chromium}=require('playwright');
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sml-browser-'));
 const env={...process.env,SML_ENV:'test',SML_DATABASE_URL:'sqlite:///'+path.join(temp,'learning.db'),SML_SERVE_WEB:'1'};
 const fixture=spawnSync('python',['-c',`import json\nfrom backend.store import configured_store\ns=configured_store();s.migrate()\nprint(json.dumps({'teacher':s.provision('instructor'),'learner':s.provision('learner'),'other':s.provision('instructor')}))`],{env,encoding:'utf8'});
 if(fixture.status!==0)throw Error('Fixture setup failed: '+fixture.stderr);
 const identities=JSON.parse(fixture.stdout);
 const server=spawn('python',['-m','uvicorn','backend.app:app','--host','127.0.0.1','--port','8073','--no-access-log'],{env,stdio:'ignore'});
 let browser;
 try{
  for(let i=0;i<100;i++){try{const res=await fetch('http://127.0.0.1:8073/health');if(res.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const bundled=process.env.SML_CHROMIUM_PACKAGE?require(process.env.SML_CHROMIUM_PACKAGE).default:null;
  if(bundled)bundled.setGraphicsMode=false;
  browser=await chromium.launch(bundled?{headless:true,executablePath:process.env.SML_CHROMIUM_EXECUTABLE||await bundled.executablePath(),args:['--disable-gpu','--disable-software-rasterizer',...bundled.args.filter(a=>!a.includes('disable-web-security')&&!a.includes('allow-running-insecure-content'))]}:{headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1100}});const teacher=await context.newPage();
  const learnerContext=await browser.newContext({viewport:{width:1440,height:1100}});const learner=await learnerContext.newPage();
  const errors=[];for(const page of [teacher,learner])page.on('pageerror',e=>errors.push(e.message));
  async function connect(page,identity){
   await page.goto('http://127.0.0.1:8073');
   await page.getByRole('navigation').getByRole('button',{name:/My training$/}).click();
   await page.getByLabel('Lab access credential').fill(identity.access_token);
   await page.getByRole('button',{name:'Connect account',exact:true}).click();
   await page.getByRole('button',{name:'Disconnect account',exact:true}).waitFor();
  }
  await connect(teacher,identities.teacher);
  await teacher.getByRole('button',{name:'Create cohort',exact:true}).click();
  await teacher.getByLabel('Synthetic learner ID').fill(identities.learner.account_id);
  await teacher.getByRole('button',{name:'Enroll learner',exact:true}).click();
  await teacher.getByRole('status').getByText('Learner enrolled.',{exact:true}).waitFor();
  await teacher.getByRole('button',{name:'Assign activity',exact:true}).click();
  await teacher.getByRole('status').getByText('Activity assigned.',{exact:true}).waitFor();
  await connect(learner,identities.learner);
  const assigned=learner.getByLabel('Assigned activity');
  const id=await assigned.locator('option').nth(1).getAttribute('value');await assigned.selectOption(id);
  await learner.getByLabel('Mission and information requirements',{exact:true}).check();
  await learner.getByLabel('No',{exact:true}).check();
  await learner.getByLabel('Identity dependency',{exact:true}).check();
  await learner.getByRole('button',{name:'Submit and save attempt',exact:true}).click();
  await learner.getByRole('status').getByText('Saved server-scored result: 3/3.',{exact:true}).waitFor();
  await teacher.getByRole('button',{name:'Refresh saved learning',exact:true}).click();
  await teacher.getByRole('button',{name:/^Alpha ·/}).click();
  await teacher.locator('.learning-account tbody').getByText('3/3',{exact:true}).waitFor();
  await teacher.getByLabel('Training activity').selectOption('builder');
  await teacher.getByRole('button',{name:'Assign activity',exact:true}).click();
  await teacher.getByRole('status').getByText('Activity assigned.',{exact:true}).waitFor();
  await learner.getByRole('button',{name:'Refresh saved learning',exact:true}).click();
  const recoveryId=await assigned.locator('option').filter({hasText:'builder'}).getAttribute('value');
  await assigned.selectOption(recoveryId);
  const workbench=learner.locator('.learning-account .diagnostic-workbench');
  if(await workbench.getByLabel('Issue to work on').count())throw Error('Assigned case can be changed');
  await workbench.getByRole('button',{name:'Show the check result',exact:true}).click();
  await workbench.getByText('Review progress or decide early',{exact:true}).click();
  await workbench.getByRole('button',{name:'Decide with current evidence',exact:true}).click();
  await workbench.getByLabel('Rerun the whole builder immediately',{exact:true}).check();
  await workbench.getByRole('button',{name:'Submit my decision',exact:true}).click();
  await learner.getByRole('status').getByText(/Saved practice result: 0\/1/).waitFor();
  await teacher.getByRole('button',{name:'Refresh saved learning',exact:true}).click();
  const gapRow=teacher.getByRole('row').filter({has:teacher.getByRole('cell',{name:'Understand a failed build',exact:true})});
  await gapRow.getByRole('cell').nth(2).filter({hasText:/^1$/}).waitFor();
  if(await gapRow.getByRole('cell').allTextContents().then(v=>v.join('|'))!=='Understand a failed build|1|1|1')throw Error('Recovery gaps not visible');
  await assigned.selectOption(recoveryId);
  for(let i=0;i<4;i++){
   await workbench.getByRole('button',{name:'Show the check result',exact:true}).click();
   await workbench.getByRole('button',{name:i<3?'Next check':'Choose a recovery',exact:true}).click();
  }
  await workbench.getByLabel('Treat this as partial completion and follow the scoped recovery plan',{exact:true}).check();
  await workbench.getByRole('button',{name:'Submit my decision',exact:true}).click();
  await learner.getByRole('status').getByText(/Saved practice result: 1\/1/).waitFor();
  await teacher.getByRole('button',{name:'Refresh saved learning',exact:true}).click();
  await gapRow.getByRole('cell').nth(2).filter({hasText:/^0$/}).waitFor();
  if(await gapRow.getByRole('cell').allTextContents().then(v=>v.join('|'))!=='Understand a failed build|1|0|0')throw Error('Latest attempt failed to replace old gaps');
  fs.mkdirSync('artifacts/screenshots',{recursive:true});
  await teacher.screenshot({path:'artifacts/screenshots/connected-instructor.png',fullPage:true});
  await learner.screenshot({path:'artifacts/screenshots/connected-learner.png',fullPage:true});
  await teacher.setViewportSize({width:390,height:844});
  if(!await teacher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw Error('Instructor dashboard mobile overflow');
  await teacher.screenshot({path:'artifacts/screenshots/connected-instructor-mobile.png',fullPage:true});
  await teacher.setViewportSize({width:1440,height:1100});
  const leaked=await learner.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}}));
  if(leaked.includes(identities.learner.access_token))throw Error('Credential entered browser storage');
  await learner.reload();
  await learner.getByRole('navigation').getByRole('button',{name:/My training$/}).click();
  await learner.getByRole('button',{name:'Connect account',exact:true}).waitFor();
  if(await learner.getByLabel('Lab access credential').inputValue())throw Error('Credential persisted across reload');
  await learner.getByLabel('Lab access credential').fill(identities.learner.access_token);
  await learner.getByRole('button',{name:'Connect account',exact:true}).click();
  await learner.locator('.learning-account tbody').getByText('3/3',{exact:true}).waitFor();
  // A different instructor cannot read this cohort even with a guessed valid UUID.
  const cohort=await teacher.evaluate(async token=>(await (await fetch('/api/learning/cohorts',{headers:{Authorization:'Bearer '+token}})).json())[0].id,identities.teacher.access_token);
  const foreign=await learner.evaluate(async ({token,cohort})=>(await fetch('/api/learning/cohorts/'+cohort+'/progress',{headers:{Authorization:'Bearer '+token}})).status,{token:identities.other.access_token,cohort});
  if(foreign!==404)throw Error('Cross-instructor cohort isolation failed');
  await teacher.getByRole('button',{name:'Remove learner and cohort results',exact:true}).click();
  await teacher.getByRole('status').getByText('Learner removed; this cohort’s saved attempts were erased.',{exact:true}).waitFor();
  await learner.getByRole('button',{name:'Refresh saved learning',exact:true}).click();
  await learner.getByText('No activities assigned yet.',{exact:false}).waitFor();
  if(await learner.locator('.learning-account tbody tr').count())throw Error('Removed learner attempts retained');
  if(errors.length)throw Error(errors.join('; '));
  console.log('Connected journeys passed: provisioning, cohort enrollment, assignment, server scoring, saved progress, credential clearing and ownership isolation.');
 }finally{if(browser)await browser.close();server.kill();fs.rmSync(temp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exit(1)});
