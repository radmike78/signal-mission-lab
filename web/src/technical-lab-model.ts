/** Supplied diagnostic records only. Never execute commands or accept operational text. */
import content from '../../data/it-technical-labs.json' with {type:'json'};
export const technicalLabs=content;
export type LabAttempt={inspected:string[];choices:number[]};
export function getTechnicalLab(id:string){const lab=content.labs.find(l=>l.id===id);if(!lab)throw Error('Unknown technical lab.');return lab;}
export function labSummary(id:string,attempt:LabAttempt){
 const lab=getTechnicalLab(id);
 if(!attempt||typeof attempt!=='object'||!Array.isArray(attempt.inspected)||!Array.isArray(attempt.choices)||attempt.inspected.length>lab.evidence.length||new Set(attempt.inspected).size!==attempt.inspected.length||Array.from(attempt.inspected).some(x=>typeof x!=='string'||!lab.evidence.some(e=>e.id===x))||attempt.choices.length>3||Array.from(attempt.choices).some((x,i)=>!Number.isInteger(x)||x<0||x>=lab.decisions[i].options.length))throw Error('Use supplied evidence and choices.');
 const ready=lab.required_evidence.every(id=>attempt.inspected.includes(id));
 if(attempt.choices.length&&!ready)throw Error('Inspect the required evidence before deciding.');
 return {ready,complete:attempt.choices.length===3,score:attempt.choices.filter((x,i)=>x===lab.decisions[i].answer).length,total:3};
}
export function inspectLab(id:string,attempt:LabAttempt,evidenceId:string):LabAttempt{
 labSummary(id,attempt);const lab=getTechnicalLab(id);
 if(!lab.evidence.some(e=>e.id===evidenceId))throw Error('Unknown lab evidence.');
 return {...attempt,inspected:[...new Set([...attempt.inspected,evidenceId])]};
}
export function answerLab(id:string,attempt:LabAttempt,stage:number,choice:number):LabAttempt{
 const summary=labSummary(id,attempt);
 if(!summary.ready||!Number.isInteger(stage)||stage!==attempt.choices.length||stage>=3)throw Error('Answer the next decision once.');
 const next={...attempt,choices:[...attempt.choices,choice]};labSummary(id,next);return next;
}
