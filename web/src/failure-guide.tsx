import React,{useState} from 'react';
import content from '../../data/network-failures.json';
export function FailureGuide({node}:{node:string}){
 const record=content.records.find(r=>r.id===node);
 const [chosen,setChosen]=useState('');
 if(!record)return null;
 const topics=content.issues.filter(i=>record.topics.includes(i.id));
 const issue=topics.find(i=>i.id===chosen)||topics[0];
 return <section className="failure-guide" aria-label="Why systems fail"><h3>Why does it fail?</h3><p>{record.applicability}</p>{issue?<>
 <label htmlFor="failure-topic">Work on one issue</label><select id="failure-topic" value={issue.id} onChange={e=>setChosen(e.target.value)}>{topics.map(i=><option key={i.id} value={i.id}>{i.title}</option>)}</select>
 <div key={issue.id}><h4>{issue.title}</h4><p><strong>Why configure it this way?</strong> {issue.purpose}</p><p><strong>Why it can fail</strong> {issue.why}</p><p><strong>Check first</strong> {issue.check}</p>
 <details><summary>Correction and proof of recovery</summary><p><strong>Next action</strong> {issue.action}</p><p><strong>Prove recovery</strong> {issue.verify}</p></details>
 <details><summary>Evidence and limits</summary><p>{issue.scope}</p><p>{content.scope}</p><p>Technical review: pending.</p><ul>{issue.sources.map(id=>{const s=content.sources.find(s=>s.id===id)!;return <li key={id}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a><p>{s.locator} · {s.status} · Checked {s.retrieved}</p></li>;})}</ul></details></div>
 </>:<p>The missing guide is tracked; a general lesson would not establish this system’s failure modes.</p>}
 <details><summary>Reference still needed</summary><p>{record.manual_needed}</p><p>Use only material approved for public release in this app. Restricted references must remain in their authorized environment.</p></details></section>;
}
