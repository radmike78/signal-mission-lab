const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const {zipSync,strToU8}=require('fflate');
const assert=require('node:assert/strict'),fs=require('node:fs');
function pdf(text){
 const stream=text?'BT /F1 12 Tf 40 750 Td ('+text+') Tj ET':'';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+Buffer.byteLength(stream)+' >>\nstream\n'+stream+'\nendstream'];
 let body='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(body));body+=(i+1)+' 0 obj\n'+o+'\nendobj\n';});
 const start=Buffer.byteLength(body);body+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF';return Buffer.from(body);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const startURL=process.env.SML_URL||'http://127.0.0.1:8070',origin=new URL(startURL).origin;
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true}),page=await context.newPage(),errors=[],writes=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());if(!(r.url()===origin||r.url().startsWith(origin+'/'))&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url());});
 const csp=fs.readFileSync('_headers','utf8').split('\n').find(line=>line.includes('Content-Security-Policy:')).split('Content-Security-Policy:')[1].trim();
 await page.route(startURL+'/',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'content-security-policy':csp}});});
 await page.goto(startURL);await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 await page.getByRole('button',{name:'Translate a fictional document into Signal requirements →',exact:true}).click();
 const area=page.getByRole('region',{name:'Document to Signal requirements',exact:true});await area.getByRole('heading',{name:'Document to Signal requirements',exact:true}).waitFor();
 const attestation=area.getByRole('checkbox').first(),file=area.getByLabel('Choose a fictional document',{exact:true});
 assert(await file.isDisabled());await area.getByRole('button',{name:'Load fictional demonstration',exact:true}).click();await attestation.check();await area.getByRole('button',{name:'Review document tasks',exact:true}).click();
 await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();assert(await area.getByRole('button',{name:'Create requirements worksheet',exact:true}).isDisabled());
 await area.locator('.document-source-list article').filter({hasText:'Team Alpha will submit'}).getByRole('checkbox').check();await area.getByRole('button',{name:'Create requirements worksheet',exact:true}).click();
 await area.getByRole('heading',{name:'Draft Signal requirements worksheet',exact:true}).waitFor();
 await area.getByText('Suggested source-backed details',{exact:true}).click();await area.getByRole('button',{name:/^Apply source-backed details R/}).click();assert.equal(await area.getByLabel('Who sends or initiates?',{exact:true}).inputValue(),'Team Alpha');assert.equal(await area.getByLabel('Who receives or responds?',{exact:true}).inputValue(),'Team Bravo');assert.equal(await area.locator('.document-field-evidence').count(),4);
 await area.getByLabel('Who sends or initiates?',{exact:true}).fill('Fictional Team Alpha');await area.getByLabel('Who receives or responds?',{exact:true}).fill('Fictional Team Bravo');
 await area.getByRole('checkbox',{name:'I checked this source passage, the proposed requirement and the remaining gaps.',exact:true}).check();
 await area.getByLabel('What information or voice exchange?',{exact:true}).fill('Fictional status report');assert(!await area.getByRole('checkbox',{name:'I checked this source passage, the proposed requirement and the remaining gaps.',exact:true}).isChecked());
 const brief=area.getByRole('region',{name:'Leadership brief',exact:true});
 await brief.getByRole('heading',{name:'Brief leadership',exact:true}).waitFor();
 assert.match(await brief.innerText(),/Dependencies: Unresolved/);
 assert.match(await brief.innerText(),/Decision, authority and deadline: Unresolved/);
 await area.getByLabel('What services, access and resources must be available?',{exact:true}).fill('Confirm fictional report service and recipient access.');
 await area.getByLabel('What decision or clarification is needed, from whom and by when?',{exact:true}).fill('Training director to confirm the deadline before rehearsal.');
 await area.getByLabel('What can leadership not do if this fails?',{exact:true}).fill('The fictional command update cannot use the current report.');
 assert.match(await brief.innerText(),/Confirm fictional report service/);
 assert.match(await brief.innerText(),/Training director to confirm/);
 assert.match(await brief.innerText(),/cannot use the current report/);
 await area.getByLabel('Exercise context',{exact:true}).selectOption('VALEX');
 let downloading=page.waitForEvent('download');await area.getByRole('button',{name:'Download worksheet JSON',exact:true}).click();let download=await downloading;const packet=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 assert.equal(packet.exercise,'VALEX');assert.equal(packet.requirements.length,1);assert.match(packet.requirements[0].source.quote,/Team Alpha will submit/);assert.equal(packet.requirements[0].sender,'Fictional Team Alpha');assert.equal(packet.requirements[0].application,'');assert.equal(packet.requirements[0].field_sources.timing.quote,'before each command update');assert.equal(packet.requirements[0].field_sources.sender,undefined);assert(packet.requirements[0].unresolved.includes('application'));assert.match(packet.analysis,/no AI/);assert.equal(packet.source.sha256.length,64);
 assert.equal(packet.requirements[0].dependencies,'Confirm fictional report service and recipient access.');
 assert.equal(packet.requirements[0].decision,'Training director to confirm the deadline before rehearsal.');
 downloading=page.waitForEvent('download');await area.getByRole('button',{name:'Download worksheet Markdown',exact:true}).click();download=await downloading;assert.match(fs.readFileSync(await download.path(),'utf8'),/Text paragraph/);
 await page.getByRole('navigation').getByRole('button',{name:/Equipment$/}).click();await page.getByLabel('Search systems',{exact:true}).waitFor();await page.getByText('More learning tools',{exact:true}).click();await page.getByRole('navigation').getByRole('button',{name:'Document planner',exact:true}).click();assert.equal(await area.getByLabel('Who sends or initiates?',{exact:true}).inputValue(),'Fictional Team Alpha');
 for(const size of [{width:1280,height:900},{width:390,height:844}]){await page.setViewportSize(size);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);}
 fs.mkdirSync('artifacts/screenshots',{recursive:true});await area.getByRole('heading',{name:'Draft Signal requirements worksheet',exact:true}).evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:'artifacts/screenshots/document-requirements-mobile.png'});
 async function reset(){await area.getByRole('button',{name:'Clear document session',exact:true}).click();await attestation.check();}
 async function upload(name,buffer){await file.setInputFiles({name,mimeType:'application/octet-stream',buffer});}
 await reset();await upload('training.txt',Buffer.from('SYNTHETIC TRAINING ONLY\nFictional Team Alpha will submit a status report to Team Bravo.'));await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();await area.getByText('Text paragraph 2',{exact:true}).waitFor();
 await reset();await upload('training.pdf',pdf('Fictional Team Alpha will submit a status report to Team Bravo.'));await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();await area.getByText('PDF page 1 paragraph 1',{exact:true}).waitFor();
 await reset();const xml='<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Fictional Team Alpha will submit a status report to Team Bravo.</w:t></w:r></w:p></w:body></w:document>';
 await upload('training.docx',Buffer.from(zipSync({'word/document.xml':strToU8(xml)})));await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();await area.getByText('document.xml paragraph 1',{exact:true}).waitFor();
 for(const [name,buffer] of [['scan.pdf',pdf('')],['broken.pdf',Buffer.from('not a PDF')],['unsafe.txt',Buffer.from('Fictional SECRET report to Team Bravo for training.')],['bad.docx',Buffer.from(zipSync({'word/document.xml':strToU8('<!DOCTYPE foo [<!ENTITY x SYSTEM "https://example.test/">]>'+xml)}))],['large.txt',Buffer.alloc(5000001,65)]]){
  await reset();await upload(name,buffer);await area.getByRole('alert').waitFor();assert.equal(await area.locator('.document-source-list').count(),0);assert.equal(await area.getByLabel('Or paste fictional document text',{exact:true}).inputValue(),'');
 }
 await reset();await upload('opposing.txt',Buffer.from('Team Alpha will submit a status report to Team Bravo.\nTeam Alpha must not submit a status report to Team Bravo.'));await area.getByRole('region',{name:'Opposing wording review',exact:true}).waitFor();
 await reset();await area.getByLabel('Or paste fictional document text',{exact:true}).fill('Fictional <img src=x onerror=alert(1)> Team Alpha will submit a report for training.');await area.getByRole('button',{name:'Review document tasks',exact:true}).click();await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();assert.equal(await area.locator('img').count(),0);
 assert.equal(await page.evaluate(()=>localStorage.getItem('sml-practice-v1')),null);assert.deepEqual(writes,[]);assert.deepEqual(external,[]);
 await area.getByRole('button',{name:'Clear document session',exact:true}).click();await page.reload();await page.getByText('More learning tools',{exact:true}).click();await page.getByRole('navigation').getByRole('button',{name:'Document planner',exact:true}).click();await area.getByRole('heading',{name:'Document to Signal requirements',exact:true}).waitFor();assert.equal(await area.locator('.document-source-list').count(),0);assert.equal(await area.getByLabel('Or paste fictional document text',{exact:true}).inputValue(),'');assert.deepEqual(errors,[]);
 console.log('PASS local offline text/PDF/DOCX import, source-linked human review, editable requirements, exports, privacy, rejection paths, reset, mobile layout and accessibility');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
