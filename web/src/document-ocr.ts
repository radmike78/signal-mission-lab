import type {OCRPage} from './document-plan-model';
/** Own the native worker from startup so cancellation also terminates initialization.
 * The wire protocol matches pinned Tesseract.js 7.0.0 createWorker/worker-script.
 * Asset version gates and real worker integration tests guard protocol changes. */
export async function localOCR<T>(signal:AbortSignal,progress:(message:string)=>void,work:(recognize:(canvas:HTMLCanvasElement,page:number)=>Promise<OCRPage>)=>Promise<T>):Promise<T>{
 if(signal.aborted)throw Error('OCR cancelled.');
 const worker=new Worker(new URL('/assets/ocr-worker.min.js',location.origin));
 let closed=false,sequence=0,rejectCancelled:(reason:Error)=>void=()=>{};
 const pending=new Map<string,{resolve:(data:unknown)=>void;reject:(reason:Error)=>void}>();
 const cancelled=new Promise<never>((_,reject)=>{rejectCancelled=reject;});cancelled.catch(()=>{});
 function stop(){closed=true;worker.terminate();const error=Error('OCR cancelled or exceeded its time limit.');for(const job of pending.values())job.reject(error);pending.clear();rejectCancelled(error);}
 function request<R>(action:string,payload:unknown,transfer:Transferable[]=[]):Promise<R>{
  if(closed||signal.aborted)return Promise.reject(Error('OCR cancelled.'));
  return new Promise((resolve,reject)=>{const jobId='ocr-'+(++sequence);pending.set(jobId,{resolve:data=>resolve(data as R),reject});worker.postMessage({workerId:'sml-local-ocr',jobId,action,payload},transfer);});
 }
 worker.onmessage=event=>{const message=event.data,job=pending.get(message?.jobId);if(!job)return;if(message.status==='resolve'){pending.delete(message.jobId);job.resolve(message.data);}else if(message.status==='reject'){pending.delete(message.jobId);job.reject(Error('Local OCR worker failed.'));}};
 worker.onerror=stop;worker.onmessageerror=stop;signal.addEventListener('abort',stop,{once:true});const timer=setTimeout(stop,120000);
 try{
  progress('Loading bundled English OCR…');
  await request('load',{options:{lstmOnly:true,corePath:new URL('/assets/tesseract-core-lstm.js',location.origin).href,logging:false}});
  await request('loadLanguage',{langs:'eng',options:{langPath:new URL('/assets',location.origin).href,cacheMethod:'none',gzip:true,lstmOnly:true}});
  await request('initialize',{langs:'eng',oem:1,config:{}});
  return await Promise.race([work(async(canvas,page)=>{
   if(closed||signal.aborted)throw Error('OCR cancelled.');progress('Reading page '+page+' locally…');
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('OCR image encoding failed.')),'image/png'));
   const imageBytes=new Uint8Array(await blob.arrayBuffer());
   const data=await request<{text:string;confidence:number}>('recognize',{image:imageBytes,options:{},output:{text:true}},[imageBytes.buffer]);
   if(closed||signal.aborted||typeof data.text!=='string'||data.text.length>10000||!data.text.trim()||!Number.isFinite(data.confidence))throw Error('OCR page unreadable or exceeds limits.');
   const preview=document.createElement('canvas'),scale=Math.min(1,1200/Math.max(canvas.width,canvas.height));preview.width=Math.round(canvas.width*scale);preview.height=Math.round(canvas.height*scale);preview.getContext('2d')!.drawImage(canvas,0,0,preview.width,preview.height);
   const image=preview.toDataURL('image/jpeg',0.8);preview.width=preview.height=0;
   return {page,text:data.text,confidence:Math.max(0,Math.min(100,data.confidence)),preview:image};
  }),cancelled]);
 }finally{closed=true;clearTimeout(timer);signal.removeEventListener('abort',stop);worker.terminate();pending.clear();}
}
