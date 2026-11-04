import {screenDocumentText,validateDocument,type PlanningDocument,type SourceBlock} from './document-plan-model';
const MAX_BYTES=5_000_000;
const wordNS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
async function digest(bytes:Uint8Array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');}
function check(signal:AbortSignal){if(signal.aborted)throw Error('Import cancelled.');}
function splitText(text:string,locator:string):SourceBlock[]{return text.split(/\r?\n/).filter(line=>line.trim()).map((line,i)=>({locator:locator+' paragraph '+(i+1),text:line.trim()}));}
export async function importText(text:string,signal:AbortSignal):Promise<PlanningDocument>{
 check(signal);const screened=screenDocumentText(text),bytes=new TextEncoder().encode(text);
 const doc={format:'Text',digest:await digest(bytes),blocks:splitText(screened,'Text'),warnings:['Paragraph references follow nonempty extracted lines, not original page numbers.']};check(signal);return validateDocument(doc);
}
export function wordParagraphs(parts:{name:string;xml:string}[]):SourceBlock[]{
 const blocks:SourceBlock[]=[];
 for(const part of parts){
  if(/<!DOCTYPE|<!ENTITY/i.test(part.xml))throw Error('Unsupported Word XML.');
  const xml=new DOMParser().parseFromString(part.xml,'application/xml');
  if(xml.getElementsByTagName('parsererror').length||['ins','del','moveFrom','moveTo'].some(tag=>xml.getElementsByTagNameNS(wordNS,tag).length))throw Error('Use a clean Word document with revisions accepted or rejected.');
  let number=0;
  for(const paragraph of Array.from(xml.getElementsByTagNameNS(wordNS,'p'))){
   const text=Array.from(paragraph.getElementsByTagNameNS(wordNS,'t')).map(t=>t.textContent??'').join('');
   if(text.trim())blocks.push({locator:part.name.replace('word/','')+' paragraph '+(++number),text:text.trim()});
   if(blocks.length>300)throw Error('Too many source paragraphs.');
  }
 }
 return blocks;
}
function unzipWord(bytes:Uint8Array,signal:AbortSignal):Promise<{name:string;xml:string}[]>{
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./document-worker.ts',import.meta.url),{type:'module'});
  const timer=setTimeout(()=>fail(),15000);
  function clean(){clearTimeout(timer);signal.removeEventListener('abort',cancel);worker.terminate();}
  function fail(){clean();reject(Error('Word import failed or exceeded its limits. Use a clean, smaller file.'));}
  function cancel(){clean();reject(Error('Import cancelled.'));}
  signal.addEventListener('abort',cancel,{once:true});
  worker.onerror=fail;worker.onmessage=event=>{if(event.data.error){fail();return;}clean();resolve(event.data.parts);};
  if(signal.aborted){cancel();return;}worker.postMessage(bytes,[bytes.buffer]);
 });
}
export async function importDocument(file:File,signal:AbortSignal):Promise<PlanningDocument>{
 check(signal);const ext=file.name.split('.').pop()?.toLowerCase();
 if(!['txt','md','pdf','docx'].includes(ext??'')||file.size<1||file.size>MAX_BYTES)throw Error('Choose TXT, MD, text PDF or DOCX, up to 5 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());check(signal);const sha=await digest(bytes);check(signal);
 if(ext==='txt'||ext==='md'){const doc=await importText(new TextDecoder('utf-8',{fatal:true}).decode(bytes),signal);return {...doc,digest:sha};}
 if(ext==='docx'){
  const parts=await unzipWord(bytes,signal);check(signal);
  return validateDocument({format:'DOCX',digest:sha,blocks:wordParagraphs(parts),warnings:['Word references identify XML part and paragraph, not rendered pages. Verify tables, reading order and omitted comments, text boxes, images and embedded attachments against the original.']});
 }
 if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Use a valid PDF.');
 const pdfjs=await import('pdfjs-dist');const workerURL=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');check(signal);
 pdfjs.GlobalWorkerOptions.workerSrc=workerURL.default;
 const task=pdfjs.getDocument({data:bytes,verbosity:0,useWorkerFetch:false,useWasm:false,disableFontFace:true,useSystemFonts:false,enableXfa:false,stopAtErrors:true,maxImageSize:0});
 const abort=()=>{void task.destroy();};signal.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,20000);
 try{
  const pdf=await task.promise;if(pdf.numPages>30)throw Error('Use a PDF of 30 pages or fewer.');
  const blocks:SourceBlock[]=[],warnings=['PDF text order and tables need comparison with the original. Images, handwriting, comments and attachments are not analyzed; OCR is not included.'];
  for(let i=1;i<=pdf.numPages;i++){
   check(signal);const page=await pdf.getPage(i),content=await page.getTextContent();let text='';
   for(const item of content.items)if('str' in item){text+=item.str+(item.hasEOL?'\n':' ');if(text.length>10000)throw Error('A PDF page exceeds the text limit.');}
   if(!text.trim())throw Error('A PDF page has no readable text. Scanned/image-only or mixed scanned PDFs need verified OCR before import.');
   blocks.push(...splitText(text,'PDF page '+i));if(blocks.length>300||blocks.reduce((n,b)=>n+b.text.length,0)>60000)throw Error('PDF text exceeds import limits.');page.cleanup();
  }
  check(signal);return validateDocument({format:'PDF',digest:sha,blocks,warnings});
 }finally{clearTimeout(timer);signal.removeEventListener('abort',abort);await task.destroy();}
}
