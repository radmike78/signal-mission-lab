import React,{useState} from 'react';
import content from '../../data/equipment-mission-learning.json';
const fields=[
 ['failure','What failed, and what evidence supports that?'],
 ['users','Who is affected?'],
 ['task','What task or information exchange is disrupted?'],
 ['available','What still works, and which alternate has been tested?'],
 ['action','What are you doing, and what help or decision is needed?'],
 ['update','What is known about restoration, and when is the next update?']
] as const;
export function EquipmentMission({node}:{node:string}){
 const record=content.records.find(r=>r.id===node);
 const [stage,setStage]=useState('COMMEX'),[draft,setDraft]=useState<Record<string,string>>({}),[review,setReview]=useState(false),[checked,setChecked]=useState<string[]>([]);
 if(!record)return null;
 const source=content.sources.find(s=>s.id===record.source)!;
 const complete=fields.every(([id])=>draft[id]?.trim());
 const rubric=['I separated verified facts from suspected causes.','I named affected users and their disrupted task.','I limited the impact to the failed path or service.','I identified what still works and did not assume an alternate works.','I explained recovery actions, assistance or a leader decision.','I stated uncertainty, a next update time and how the staff will validate recovery.'];
 return <section aria-label="Equipment mission learning">
 <h3>Understand the equipment and its mission impact</h3>
 <p><strong>Why we need it:</strong> {record.purpose}</p><p><strong>Mission use:</strong> {record.mission}</p>
 <details><summary>Setup sequence and why it matters</summary><p>{record.path}</p><p>{record.why}</p><p>Use the exact variant’s authorized technical manual and approved baseline for execution. This sequence explains dependencies; it does not replace setup instructions.</p><p><strong>Prove it works:</strong> {record.proof}</p></details>
 <h4>Explain the impact to leaders</h4><p><strong>Possible failure scope:</strong> {record.impact}</p><p><strong>Effect on the mission:</strong> {record.consequence}</p><p><strong>Check what remains available:</strong> {record.remaining}</p>
 <label htmlFor="equipment-exercise">Practice environment</label><select id="equipment-exercise" value={stage} onChange={e=>{setStage(e.target.value);setDraft({});setReview(false);setChecked([]);}}>{Object.keys(record.exercises).map(s=><option key={s}>{s}</option>)}</select>
 <p>{record.exercises[stage as keyof typeof record.exercises]}</p>
 <details><summary>Practice a leader update</summary><p><strong>Synthetic incident:</strong> {record.scenario}</p><p>{record.lesson} Use fictional roles and observations only. Drafts stay in memory and clear when you leave this equipment or change the exercise.</p>
 {fields.map(([id,label])=><div key={id}><label htmlFor={'impact-'+id}>{label}</label><textarea id={'impact-'+id} maxLength={600} rows={3} value={draft[id]||''} onChange={e=>{setDraft({...draft,[id]:e.target.value});setReview(false);setChecked([]);}}/></div>)}
 <button disabled={!complete} onClick={()=>setReview(true)}>Review my leader update</button>
 {review&&<div role="region" aria-label="Leader update review"><h4>Your draft briefing</h4><blockquote>{fields.map(([id,label])=><p key={id}><strong>{label}</strong><br/>{draft[id]}</p>)}</blockquote><p>Self-review or instructor observation. Completing fields does not establish that the explanation is correct.</p>{rubric.map((text,i)=><label className="toggle" key={text}><input type="checkbox" checked={checked.includes(String(i))} onChange={()=>setChecked(checked.includes(String(i))?checked.filter(x=>x!==String(i)):[...checked,String(i)])}/>{text}</label>)}<p role="status">{checked.length}/{rubric.length} discussion criteria reviewed. Ask an instructor to challenge unsupported claims and validate the proposed recovery test.</p></div>}
 <button onClick={()=>{setDraft({});setReview(false);setChecked([]);}}>Clear practice draft</button></details>
 <details><summary>Sources and training limits</summary><p>{content.scope}</p><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p>Public reference supports purpose/context. Setup dependency explanations, mission impacts, exercises and rubric are editorial teaching material; technical and instructor review remain pending.</p></details>
 </section>;
}
