const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const {serveDirectory}=require('./static-fixture.cjs'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),zlib=require('node:zlib');
function scannedPDF(rgb,width,height,count=1){
 const data=zlib.deflateSync(rgb),stream=`q ${width} 0 0 ${height} 0 0 cm /Scan Do Q`;
 const objects=[Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Scan 4 0 R >> >> /Contents 5 0 R >>`),Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${data.length} >>\nstream\n`),data,Buffer.from('\nendstream')]),Buffer.from(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)];
 if(count>1){objects[1]=Buffer.from('<< /Type /Pages /Kids [3 0 R '+Array.from({length:count-1},(_,i)=>(6+i)+' 0 R').join(' ')+'] /Count '+count+' >>');for(let i=1;i<count;i++)objects.push(objects[2]);}
 let chunks=[Buffer.from('%PDF-1.4\n')],offsets=[],length=chunks[0].length;
 objects.forEach((object,i)=>{offsets.push(length);const chunk=Buffer.concat([Buffer.from(`${i+1} 0 obj\n`),object,Buffer.from('\nendobj\n')]);chunks.push(chunk);length+=chunk.length;});
 chunks.push(Buffer.from('xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${length}\n%%EOF`));return Buffer.concat(chunks);
}
(async()=>{
 const fixture=process.env.SML_URL?null:await serveDirectory(path.resolve(__dirname,'../web/dist'));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const url=process.env.SML_URL||fixture.url,origin=new URL(url).origin,context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true}),page=await context.newPage(),errors=[],external=[],writes=[];
 page.on('pageerror',error=>errors.push(error.message));context.on('request',request=>{if(!request.url().startsWith(origin+'/')&&!request.url().startsWith('data:')&&!request.url().startsWith('blob:'))external.push(request.url());if(request.method()!=='GET')writes.push(request.url());});
 await page.goto(url);await page.evaluate(async()=>await navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);
 const image=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=320;const c=canvas.getContext('2d');c.fillStyle='white';c.fillRect(0,0,1200,320);c.fillStyle='black';c.font='38px sans-serif';c.fillText('SYNTHETIC TRAINING ONLY',40,90);c.fillText('Team Alpha will send a report to Team Bravo.',40,180);const rgba=c.getImageData(0,0,1200,320).data,rgb=new Uint8Array(1200*320*3);for(let i=0,j=0;i<rgba.length;i+=4){rgb[j++]=rgba[i];rgb[j++]=rgba[i+1];rgb[j++]=rgba[i+2];}let binary='';for(let i=0;i<rgb.length;i+=8192)binary+=String.fromCharCode(...rgb.subarray(i,i+8192));return {png:canvas.toDataURL('image/png').split(',')[1],rgb:btoa(binary),width:1200,height:320};});
 await page.getByRole('button',{name:'Translate a fictional document into Signal requirements →',exact:true}).click();
 const area=page.getByRole('region',{name:'Document to Signal requirements',exact:true});await area.getByRole('heading',{name:'Document to Signal requirements',exact:true}).waitFor();
 async function prepare(){await area.getByRole('checkbox').first().check();await area.getByRole('checkbox',{name:'Use local English OCR for a scanned PDF or image',exact:true}).check();}
 async function upload(name,buffer){await area.getByLabel('Choose a fictional document',{exact:true}).setInputFiles({name,mimeType:'application/octet-stream',buffer});}
 await prepare();await upload('fictional.png',Buffer.from(image.png,'base64'));
 const review=area.getByRole('region',{name:'Review OCR transcription',exact:true});await review.waitFor({timeout:120000});
 const transcript=review.getByLabel('Transcription for OCR page 1',{exact:true});assert.match(await transcript.inputValue(),/Team Alpha/);
 assert.equal(await area.getByRole('button',{name:'Create requirements worksheet',exact:true}).count(),0);
 const accept=review.getByRole('button',{name:'Accept reviewed OCR transcription',exact:true});assert(await accept.isDisabled());
 await review.getByRole('checkbox').check();await transcript.fill('SYNTHETIC TRAINING ONLY\nTeam Alpha will send a report to Team Bravo.');assert(!await review.getByRole('checkbox').isChecked());
 await review.getByRole('checkbox').check();
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){await page.setViewportSize(viewport);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);}
 fs.mkdirSync('artifacts/screenshots',{recursive:true});await review.getByRole('heading',{name:'Review each OCR page',exact:true}).evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:'artifacts/screenshots/ocr-review-mobile.png'});
 await accept.click();await area.getByRole('heading',{name:'Review the source and select tasks',exact:true}).waitFor();
 await area.locator('.document-source-list article').filter({hasText:'Team Alpha will send'}).getByRole('checkbox').check();await area.getByRole('button',{name:'Create requirements worksheet',exact:true}).click();
 const downloading=page.waitForEvent('download');await area.getByRole('button',{name:'Download worksheet JSON',exact:true}).click();const download=await downloading,packet=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 assert.equal(packet.source.format,'OCR image');assert.equal(packet.source.ocr.reviewed_transcription,true);assert.match(packet.requirements[0].source.locator,/reviewed transcription/);assert(!JSON.stringify(packet).includes('data:image'));
 await area.getByRole('button',{name:'Clear document session',exact:true}).click();await prepare();await upload('fictional-scan.pdf',scannedPDF(Buffer.from(image.rgb,'base64'),image.width,image.height));await review.waitFor({timeout:120000});assert.match(await transcript.inputValue(),/Team Alpha/);
 await area.getByRole('button',{name:'Clear document session',exact:true}).click();await prepare();await upload('four-pages.pdf',scannedPDF(Buffer.from(image.rgb,'base64'),image.width,image.height,4));await area.getByRole('alert').waitFor();assert.equal(await review.count(),0);
 await area.getByRole('button',{name:'Clear document session',exact:true}).click();await prepare();const blank=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=200;c.getContext('2d').fillStyle='white';c.getContext('2d').fillRect(0,0,600,200);return c.toDataURL('image/png').split(',')[1];});await upload('blank.png',Buffer.from(blank,'base64'));await area.getByRole('alert').waitFor({timeout:120000});assert.equal(await review.count(),0);
 await area.getByRole('button',{name:'Clear document session',exact:true}).click();await prepare();await upload('cancel.png',Buffer.from(image.png,'base64'));await area.getByRole('button',{name:'Clear document session',exact:true}).click();await page.waitForTimeout(1000);assert.equal(await review.count(),0);assert.equal(await area.locator('.document-source-list').count(),0);assert.equal(page.workers().length,0);
 const databases=await page.evaluate(async()=>await indexedDB.databases());assert.deepEqual(databases,[]);assert.equal(await page.evaluate(()=>localStorage.getItem('sml-practice-v1')),null);assert.deepEqual(writes,[]);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 console.log('PASS real local image/scanned-PDF OCR offline under CSP, required correction/review, provenance-only export, cancellation, no external requests/persistence and mobile accessibility');
 }finally{await browser.close();if(fixture)await fixture.close();}
})().catch(error=>{console.error(error);process.exit(1)});
