import React,{useRef,useState} from 'react';
import content from '../../data/technology-learning.json';
import catalog from '../../data/catalog.json';
import {stackDependencies,simulateStack,type StackState} from './foundations-model';
const initialStack:StackState={power:true,compute:true,storage:true,network:true,identity:true,policy:true};
const topics = [
 {name:'Networking', ids:['switching','routing','cisco-path-check','steelhead-pass-through']},
 {name:'Servers and virtualization', ids:['compute','containers','vsphere-path-check','openshift-readiness','idrac-event-correlation']},
 {name:'Identity and applications', ids:['services','windows-dns-triage','foundry-data-freshness']},
 {name:'Storage and recovery', ids:['storage','recovery','ontap-nfs-access']},
 {name:'Security and Signal systems', ids:['security','firewalls','panos-traffic-evidence','iq-core-observation','taclane-scope-check']},
];
export function ITFoundations({onExplore}:{onExplore:(id:string)=>void}){
 const [area,setArea]=useState('Learn');
 const [lessonId,setLesson]=useState<string|null>(null);
 const [answer,setAnswer]=useState<number|null>(null);
 const [checked,setChecked]=useState(false);
 const [stack,setStack]=useState<StackState>(initialStack);
 const lessonHeading=useRef<HTMLHeadingElement>(null);
 const lesson=content.lessons.find(item=>item.id===lessonId);
 const simulation=simulateStack(stack);
 function openLesson(id:string|null){
  setLesson(id);setAnswer(null);setChecked(false);setArea('Learn');
  requestAnimationFrame(()=>lessonHeading.current?.focus());
 }
 function references(ids:string[]){
  return <div className="foundation-references">{ids.map(id=>{
   const source=content.sources.find(item=>item.id===id)!;
   return <details key={source.id}><summary>{source.title}</summary><a href={source.url} target="_blank" rel="noopener noreferrer">Open primary reference ↗</a><p>{source.kind} · {source.edition} · {source.locator}</p><p>{source.status} · Retrieved {source.retrieved} · Human review {source.human_review}</p><p>{source.scope}</p></details>;
  })}</div>;
 }
 return <section className="it-foundations">
 <h2>IT foundations for Signal Soldiers</h2>
 <div className="steps" aria-label="IT foundations areas">{['Learn','Vendors','Dependency lab'].map(item=><button key={item} aria-pressed={area===item} onClick={()=>setArea(item)}>{item}</button>)}</div>
 {area==='Learn'&&!lesson&&<>
  <h3 ref={lessonHeading} tabIndex={-1}>Choose a topic</h3>
  <div className="foundation-topics">{topics.map(topic=><details key={topic.name}>
   <summary>{topic.name}</summary>
   <ul>{topic.ids.map(id=><li key={id}><button onClick={()=>openLesson(id)}>{content.lessons.find(item=>item.id===id)!.title}</button></li>)}</ul>
  </details>)}</div>
 </>}
 {area==='Learn'&&lesson&&<article key={lesson.id}>
  <button className="text-button" onClick={()=>openLesson(null)}>← All IT topics</button>
  <h3 ref={lessonHeading} tabIndex={-1}>{lesson.title}</h3>
  <p>{lesson.explanation[0]}</p>
  <details><summary>Go deeper</summary>
   <p><strong>Practice goal:</strong> {lesson.outcome}</p>
   {lesson.explanation.slice(1).map(paragraph=><p key={paragraph}>{paragraph}</p>)}
   <dl className="foundation-terms">{lesson.terms.map(term=><div key={term.term}><dt>{term.term}</dt><dd>{term.meaning}</dd></div>)}</dl>
  </details>
  <details><summary>Try a practice question</summary>
   <fieldset><legend>{lesson.scenario}</legend>{lesson.options.map((option,index)=><label className="toggle" key={option}><input type="radio" name="foundation-answer" disabled={checked} checked={answer===index} onChange={()=>setAnswer(index)}/>{option}</label>)}</fieldset>
   <div className="steps"><button className="primary-button" disabled={answer===null||checked} onClick={()=>setChecked(true)}>Check understanding</button><button onClick={()=>{setAnswer(null);setChecked(false);}}>Reset practice</button></div>
   {checked&&answer!==null&&<div role="status" className="unknown-note"><strong>{answer===lesson.answer?'Reasoning supported':'Review the evidence'}</strong><p>{lesson.feedback[answer]}</p><p>Formative practice. No qualification or instructor grade is recorded.</p></div>}
  </details>
  {!!lesson.system_ids.length&&<details><summary>Related systems</summary><p>Study links. Product-to-system mappings require separate verification.</p><div className="steps">{lesson.system_ids.map(id=><button key={id} onClick={()=>onExplore(id)}>{catalog.equipment.find(item=>item.id===id)!.name} ↗</button>)}</div></details>}
  <details><summary>Sources and limits</summary><p>{content.scope} Human review is pending.</p>{references(lesson.source_ids)}</details>
 </article>}
 {area==='Vendors'&&<>
  <h3>Vendors and technology examples</h3>
  <p>Army context applies to the cited report. Vendor documentation explains the product and its study objectives. It does not verify a unit’s equipment or confer credentials.</p>
  <div className="foundation-vendors">{content.vendors.map(vendor=>{
   const training=content.sources.find(source=>source.id===vendor.training?.source_id);
   return <details key={vendor.id}>
    <summary>{vendor.name}</summary>
    <ul>{vendor.technologies.map(technology=><li key={technology}>{technology}</li>)}</ul>
    <p>{vendor.army_context}</p>
    {vendor.lesson_ids?.map(id=><button key={id} onClick={()=>openLesson(id)}>Practice: {content.lessons.find(item=>item.id===id)!.title}</button>)}
    {training&&vendor.training&&<p><a href={training.url} target="_blank" rel="noopener noreferrer">{vendor.training.label} ↗</a></p>}
    {references(vendor.source_ids)}
   </details>;
  })}</div>
 </>}
 {area==='Dependency lab'&&<><h3>Follow the service dependencies</h3><p>Fictional task: an authorized training user opens a dummy information product. Toggle availability to explore shared failure domains. This is a conceptual model, not a Cisco, PAN-OS, hypervisor or storage emulator.</p><div className="foundation-stack">{stackDependencies.map(d=><label key={d.id} className="toggle"><input type="checkbox" checked={stack[d.id]} onChange={e=>setStack({...stack,[d.id]:e.target.checked})}/>{d.label}</label>)}</div><article role="status"><h4>{simulation.usable?'Synthetic task usable':'Synthetic task blocked'}</h4><p>{simulation.message}</p><div className="steps">{stackDependencies.filter(d=>simulation.missing.includes(d.id)).map(d=><button key={d.id} onClick={()=>openLesson(d.lesson)}>Study: {d.label} →</button>)}</div></article><button onClick={()=>setStack({...initialStack})}>Restore all synthetic dependencies</button></>}
</section>;
}

