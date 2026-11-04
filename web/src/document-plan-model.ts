/** Transparent candidate matching and editable planning; no AI or equipment allocation. */
export type SourceBlock={locator:string;text:string};
export type PlanningDocument={format:string;digest:string;blocks:SourceBlock[];warnings:string[]};
export const exerciseTypes=['Mission','COMMEX','VALEX','STAFFEX','WFX'] as const;
export type EvidenceKind='Derived'|'Assumption'|'Unresolved';
export type FieldSource={source:number;quote:string};
export type Requirement={id:string;source:number;kind:EvidenceKind;capability:string;why:string;sender:string;recipient:string;information:string;timing:string;application:string;owner:string;alternate:string;acceptance:string;impact:string;reviewed:boolean;fieldSources?:Partial<Record<RequirementField,FieldSource>>};
export const SAMPLE_DIRECTIVE=`SYNTHETIC TRAINING ONLY
Fictional exercise memorandum
1. Purpose: Practice the command update and report exchange between fictional training teams.
2. Team Alpha will submit a status report to Team Bravo before each command update.
3. Team Bravo must acknowledge receipt of the current report.
4. The exercise support team shall maintain voice coordination between the two training sites.
5. The training director will verify restoration of the report exchange after a simulated outage.
6. Refer to Annex H for the approved communications plan. Annex H is not included in this sample.`;
export function screenDocumentText(raw:string){
 const text=raw.normalize('NFKC');
 if(text.length<20||text.length>60000)throw Error('Use 20–60,000 characters of fictional training text.');
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)||/\b(?:CUI|SECRET|CONFIDENTIAL|NOFORN|FOUO|COMSEC|SIPR(?:NET)?|JWICS)\b|\b(?:password|passwd|bearer|api[_ -]?key|private[_ -]?key)\b|\b(?:ignore\s+(?:all\s+)?(?:previous|prior|system)|system\s*prompt|bypass\s+(?:rules|safeguards))\b|\b(?:actual|real|live)\s+(?:operational\s+)?(?:mission|operation|deployment|network)\b|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b\d+(?:\.\d+)?\s*(?:MHz|GHz|kHz)\b/i.test(text))throw Error('Document rejected by the training-content screen. Use fictional, non-sensitive material without controlled markings, credentials, addresses or operational details.');
 return text;
}
export function validateDocument(doc:PlanningDocument){
 if(!doc||!['Text','PDF','DOCX'].includes(doc.format)||!/^[a-f0-9]{64}$/.test(doc.digest)||!Array.isArray(doc.blocks)||!doc.blocks.length||doc.blocks.length>300||!Array.isArray(doc.warnings)||doc.warnings.length>40)throw Error('Unsupported document structure.');
 for(const b of doc.blocks)if(typeof b.locator!=='string'||b.locator.length>100||!b.locator.length||typeof b.text!=='string'||!b.text.trim()||b.text.length>10000)throw Error('Invalid source passage.');
 if(new Set(doc.blocks.map(b=>b.locator)).size!==doc.blocks.length)throw Error('Duplicate source references.');
 screenDocumentText(doc.blocks.map(b=>b.text).join('\n'));
 for(const w of doc.warnings)if(typeof w!=='string'||w.length>500)throw Error('Invalid extraction warning.');
 return doc;
}
export function candidateTasks(doc:PlanningDocument){
 validateDocument(doc);
 return doc.blocks.flatMap((b,index)=>/\b(?:will|shall|must|submit|provide|establish|maintain|report|conduct|verify|acknowledge)\b/i.test(b.text)&&!/^\s*(?:refer to|see |annex|appendix|attachment)/i.test(b.text)?[index]:[]).slice(0,40);
}
export function draftRequirement(doc:PlanningDocument,source:number):Requirement{
 validateDocument(doc);if(!Number.isInteger(source)||!doc.blocks[source])throw Error('Choose an existing source passage.');
 const text=doc.blocks[source].text,restriction=/\b(?:will not|must not|shall not|do not|prohibited)\b/i.test(text);
 const voice=!restriction&&/\b(?:voice|radio|call)\b/i.test(text),report=!restriction&&/\b(?:report|submit|acknowledge|exchange)\b/i.test(text);
 return {id:'R'+(source+1),source,kind:restriction?'Unresolved':'Derived',capability:restriction?'Clarify how this restriction constrains the supported information exchange.':voice?'Provide voice coordination for the task’s named participants.':report?'Provide a verified information exchange for this task.':'Clarify the communication capability needed to support this task.',why:restriction?'The passage contains a restriction. Review its exact scope before deriving a service.':voice?'Voice coordination needs an agreed participant set, coverage, authorized method and receiving-user check.':report?'An information exchange needs a sender, intended recipient, usable format, delivery timing and acknowledgement.':'This is a candidate task. Its Signal relevance must be established by the reviewer.',sender:'',recipient:'',information:'',timing:'',application:'',owner:'',alternate:'',acceptance:voice?'Named participants complete an intelligible two-way test under the required exercise conditions.':report?'The intended recipient receives, opens and acknowledges a new test report within the agreed time.':'Define an observable supported-user task and its receiving-user acceptance check.',impact:'',reviewed:false};
}
export const requirementFields=['capability','why','sender','recipient','information','timing','application','owner','alternate','acceptance','impact'] as const;
export type RequirementField=typeof requirementFields[number];
export type FieldSuggestion={field:RequirementField;value:string;source:number;quote:string};
/** Deliberately narrow grammar. Abstain on ambiguity, restrictions and multiple clauses. */
export function sourceSuggestions(doc:PlanningDocument,source:number):FieldSuggestion[]{
 validateDocument(doc);if(!Number.isInteger(source)||!doc.blocks[source])throw Error('Choose an existing source passage.');
 const original=doc.blocks[source].text;
 if(/\b(?:not|never|unless|except|if|either|or|and|after|until|while|once|using|via|with|through|from|prohibited|may|should)\b/i.test(original))return [];
 const text=original.replace(/^\s*\d+[.)]\s*/,'').trim();
 const match=/^([A-Za-z][A-Za-z0-9 '-]{1,79}?)\s+(?:will|shall|must)\s+(?:submit|send|provide|transmit)\s+(.{1,180}?)\s+to\s+([A-Za-z][A-Za-z0-9 '-]{1,79}?)(?:\s+((?:before|by|within|every|during|at)\s+.{1,160}?))?[.!]?$/i.exec(text);
 if(!match||/\b(?:and|will|shall|must)\b/i.test(match[2]+' '+match[3])||/[.;!?]/.test(match.slice(1).filter(Boolean).join('')))return [];
 const values:[RequirementField,string][]=[['sender',match[1]],['information',match[2]],['recipient',match[3]],...(match[4]?[['timing',match[4]] as [RequirementField,string]]:[])];
 return values.map(([field,value])=>({field,value,source,quote:value}));
}
export function applySourceSuggestions(doc:PlanningDocument,row:Requirement):Requirement{
 const next={...row,fieldSources:{...row.fieldSources},reviewed:false};
 for(const suggestion of sourceSuggestions(doc,row.source))if(!next[suggestion.field].trim()){
  next[suggestion.field]=suggestion.value;next.fieldSources[suggestion.field]={source:suggestion.source,quote:suggestion.quote};
 }
 return next;
}
/** Same wording with opposing negation is a review flag, never an automatic resolution. */
export function opposingPassages(doc:PlanningDocument):[number,number][]{
 validateDocument(doc);
 const groups=new Map<string,{positive:number[];negative:number[]}>();
 doc.blocks.forEach((block,index)=>{
  if(!/\b(?:will|shall|must)\b/i.test(block.text))return;
  const negative=/\b(?:will|shall|must)\s+not\b/i.test(block.text);
  const key=block.text.toLowerCase().replace(/^\s*\d+[.)]\s*/,'').replace(/\b(?:will|shall|must|not)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  if(key.length<15)return;const group=groups.get(key)??{positive:[],negative:[]};group[negative?'negative':'positive'].push(index);groups.set(key,group);
 });
 const pairs:[number,number][]=[];
 for(const group of groups.values())for(const a of group.positive)for(const b of group.negative){pairs.push([a,b]);if(pairs.length>=20)return pairs;}
 return pairs;
}
export function updateRequirement(row:Requirement,field:RequirementField,value:string):Requirement{
 if(!requirementFields.includes(field)||typeof value!=='string'||value.length>1200)throw Error('Use a bounded worksheet field.');
 if(value.trim())screenDocumentText('Fictional worksheet field: '+value);
 const fieldSources={...row.fieldSources};delete fieldSources[field];
 return {...row,[field]:value,fieldSources,reviewed:false};
}
export function unresolvedFields(row:Requirement){return requirementFields.filter(field=>!row[field].trim());}
export function planningWarnings(doc:PlanningDocument){
 validateDocument(doc);const text=doc.blocks.map(b=>b.text).join('\n');
 return [...doc.warnings,...(/\b(?:annex|appendix|attachment)\b/i.test(text)?['Referenced annexes or attachments may be missing. Confirm what was supplied before relying on this worksheet.']:[]),'Candidate matching can miss tasks, exceptions and intent. Review every source passage; add overlooked tasks manually.','No equipment, bandwidth, frequencies, security settings or architecture are inferred. Confirm available assets and the approved design separately.'];
}
export function exportWorksheet(doc:PlanningDocument,exercise:string,rows:Requirement[]){
 validateDocument(doc);if(!(exerciseTypes as readonly string[]).includes(exercise)||!rows.length||rows.length>40||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Invalid worksheet.');
 const safe=rows.map(row=>{
  if(!Number.isInteger(row.source)||!doc.blocks[row.source]||row.id!=='R'+(row.source+1)||!['Derived','Assumption','Unresolved'].includes(row.kind)||typeof row.reviewed!=='boolean')throw Error('Invalid requirement evidence.');
  const fields=Object.fromEntries(requirementFields.map(field=>{if(typeof row[field]!=='string'||row[field].length>1200)throw Error('Invalid worksheet field.');if(row[field].trim())screenDocumentText('Fictional worksheet field: '+row[field]);return [field,row[field]];})) as Record<RequirementField,string>;
  const field_sources=Object.fromEntries(Object.entries(row.fieldSources??{}).map(([key,evidence])=>{
   if(!requirementFields.includes(key as RequirementField)||!evidence||evidence.source!==row.source||typeof evidence.quote!=='string'||!evidence.quote.trim()||row[key as RequirementField]!==evidence.quote||!doc.blocks[row.source].text.includes(evidence.quote))throw Error('Detached field evidence.');
   return [key,{locator:doc.blocks[row.source].locator,quote:evidence.quote}];
  }));
  return {id:row.id,source:{locator:doc.blocks[row.source].locator,quote:doc.blocks[row.source].text},classification:row.kind,...fields,field_sources,reviewed:row.reviewed,unresolved:unresolvedFields(row)};
 });
 return {schema_version:2,title:'Draft Signal requirements worksheet',exercise,analysis:'Local rule-based candidate matching, optional source-backed field suggestions and human editing; no AI analysis',source:{format:doc.format,sha256:doc.digest},warnings:planningWarnings(doc),opposing_passages:opposingPassages(doc).map(pair=>pair.map(index=>doc.blocks[index])),requirements:safe,scope:'Fictional training only. Reviewer acknowledgement is self-reported and does not establish approval or readiness.'};
}
export function worksheetMarkdown(doc:PlanningDocument,exercise:string,rows:Requirement[]){
 const packet=exportWorksheet(doc,exercise,rows),escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/[\\`*_{}\[\]()#+!|]/g,'\\$&');
 const opposing=packet.opposing_passages.map(pair=>'### Opposing wording — human review required\n\n'+pair.map(block=>'Source: '+escape(block.locator)+'\n\n'+block.text.split('\n').map(line=>'> '+escape(line)).join('\n')).join('\n\n')).join('\n\n');
 return `# Draft Signal requirements worksheet\n\n${escape(exercise)} · ${packet.analysis}\n\nSource SHA-256: ${doc.digest}\n\n${packet.scope}\n\n`+packet.requirements.map(r=>`## ${r.id} — ${r.classification}\n\nSource: ${escape(r.source.locator)}\n\n${r.source.quote.split('\n').map(line=>'> '+escape(line)).join('\n')}\n\n`+requirementFields.map(field=>`**${field}:** ${escape(String(r[field]||'Unresolved'))}`).join('\n\n')+`\n\nField citations: ${Object.entries(r.field_sources).map(([field,e])=>escape(field)+': '+escape(e.locator)+' — '+escape(e.quote)).join('; ')||'No source-backed field suggestions retained.'}\n\nReviewer acknowledgement: ${r.reviewed?'yes (self-reported)':'pending'}\n\nMissing fields: ${r.unresolved.join(', ')||'none; factual review still required'}\n`).join('\n')+'\n## Review limits\n\n'+(opposing?opposing+'\n\n':'')+packet.warnings.map(w=>'- '+escape(w)).join('\n')+'\n';
}
