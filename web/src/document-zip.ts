import {unzipSync} from 'fflate';
/** Called in a disposable worker. Only bounded Word text parts are inflated. */
export function wordTextParts(bytes:Uint8Array){
 if(bytes.length<22||bytes.length>5_000_000||bytes[0]!==80||bytes[1]!==75)throw Error('Use a valid DOCX file.');
 let total=0,count=0;const names=new Set<string>();
 const files=unzipSync(bytes,{filter:file=>{
  if(!/^word\/(?:document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(file.name))return false;
  if(names.has(file.name)||++count>32||file.originalSize>1_000_000||file.originalSize<0||(total+=file.originalSize)>2_000_000||![0,8].includes(file.compression))throw Error('Word text parts exceed the import limits.');
  names.add(file.name);return true;
 }});
 if(!files['word/document.xml'])throw Error('The Word document body is missing.');
 return Object.entries(files).map(([name,value])=>({name,xml:new TextDecoder('utf-8',{fatal:true}).decode(value)})).sort((a,b)=>a.name==='word/document.xml'?-1:b.name==='word/document.xml'?1:a.name.localeCompare(b.name));
}
