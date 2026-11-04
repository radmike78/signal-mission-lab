import test from 'node:test';
import assert from 'node:assert/strict';
import {ocrSourceBlocks,validateDocument,confirmOCR,candidateTasks,draftRequirement,exportWorksheet,worksheetMarkdown} from '../web/src/document-plan-model.ts';
import {imageDimensions} from '../web/src/ocr-image-limits.ts';
const page={page:1,text:'Fictional Team Alpha will send a report to Team Bravo.',confidence:82,preview:'data:image/jpeg;base64,/9j/'};
const doc={format:'OCR image',digest:'a'.repeat(64),blocks:ocrSourceBlocks([page],false),warnings:['OCR transcription needs checking against the page image.'],ocr:{pages:[page],reviewed:false}};
test('unreviewed OCR cannot enter task selection or requirements/export',()=>{
 validateDocument(doc);
 assert.throws(()=>candidateTasks(doc));assert.throws(()=>draftRequirement(doc,0));assert.throws(()=>exportWorksheet(doc,'COMMEX',[]));
 assert.throws(()=>confirmOCR(doc,[page.text],[false]));assert.throws(()=>confirmOCR(doc,[],[]));
});
test('corrected and acknowledged transcription keeps the original fingerprint and explicit OCR provenance',()=>{
 const text='Fictional Team Alpha must not send a report to Team Bravo.';
 const reviewed=confirmOCR(doc,[text],[true]);assert.equal(reviewed.digest,doc.digest);assert.equal(reviewed.blocks[0].text,text);assert.match(reviewed.blocks[0].locator,/reviewed transcription/);
 const row=draftRequirement(reviewed,0);assert.equal(row.kind,'Unresolved');
 const packet=exportWorksheet(reviewed,'WFX',[row]);assert.equal(packet.source.ocr.reviewed_transcription,true);assert.equal(packet.source.ocr.pages[0].engine_confidence,82);assert(!JSON.stringify(packet).includes('data:image'));
 assert.match(worksheetMarkdown(reviewed,'WFX',[row]),/must not send/);
});
test('detached OCR text, invalid confidence, external preview and unsupported page counts fail',()=>{
 for(const value of [{...doc,blocks:[{locator:'forged',text:page.text}]},{...doc,ocr:{pages:[{...page,confidence:101}],reviewed:false}},{...doc,ocr:{pages:[{...page,preview:'https://example.test/image'}],reviewed:false}},{...doc,ocr:{pages:Array(4).fill(page),reviewed:false}},{...doc,format:'Text'}])assert.throws(()=>validateDocument(value));
 assert.throws(()=>confirmOCR(doc,['Fictional SECRET training report for the review.'],[true]));
});
test('PNG/JPEG dimensions are bounded before decode; invalid headers are rejected',()=>{
 const png=new Uint8Array(24);png.set([137,80,78,71,13,10,26,10]);png.set([73,72,68,82],12);const v=new DataView(png.buffer);v.setUint32(16,1200);v.setUint32(20,800);assert.deepEqual(imageDimensions(png),{width:1200,height:800});
 v.setUint32(16,100000);assert.throws(()=>imageDimensions(png));
 const jpg=new Uint8Array([255,216,255,192,0,8,8,1,44,3,232,1]);assert.deepEqual(imageDimensions(jpg),{width:1000,height:300});
 assert.throws(()=>imageDimensions(new Uint8Array([255,216,255,192,0,0])));assert.throws(()=>imageDimensions(new Uint8Array(24)));
});

test('short cover-page text is retained and reviewed rather than silently omitted',()=>{
 const pages=[{...page,text:'CONTENTS'},{...page,page:2}];const multi={...doc,format:'OCR PDF',blocks:ocrSourceBlocks(pages,false),ocr:{pages,reviewed:false}};
 const reviewed=confirmOCR(multi,pages.map(p=>p.text),[true,true]);assert.equal(reviewed.blocks[0].text,'CONTENTS');assert.equal(reviewed.ocr.pages.length,2);
 assert.throws(()=>confirmOCR(multi,['',page.text],[true,true]));
});
