/** Editorial synthetic cases: no commands, live equipment, or operational inputs. */
export type CaseId='builder'|'routing'|'satellite';
type Evidence={id:string;label:string;observation:string;meaning:string;code?:string};
type Choice={id:string;label:string;feedback:string};
type TrainingCase={id:CaseId;title:string;mission:string;symptom:string;evidence:Evidence[];required:string[];choices:Choice[];answer:string;recovery:string[];handoff:string;sourceIds:string[]};
import content from '../../data/recovery-exercises.json' with {type:'json'};
export const diagnosticSources=content.sources;
export const diagnosticCases:TrainingCase[]=content.cases as TrainingCase[];
export function evaluateDiagnosis(caseId:string,evidenceIds:readonly string[],choiceId:string){
 const training=diagnosticCases.find(c=>c.id===caseId);
 if(!training||!Array.isArray(evidenceIds)||evidenceIds.length>training.evidence.length||new Set(evidenceIds).size!==evidenceIds.length||evidenceIds.some(id=>!training.evidence.some(e=>e.id===id)))throw Error('Use the supplied exercise evidence.');
 const choice=training.choices.find(c=>c.id===choiceId);if(!choice)throw Error('Use a supplied diagnosis.');
 const missing=training.required.filter(id=>!evidenceIds.includes(id));
 return {score:Number(choiceId===training.answer&&missing.length===0),total:1,supported:choiceId===training.answer&&missing.length===0,missing,feedback:choice.feedback,reason:missing.length?'Collect the missing evidence before making a supported recovery decision.':choiceId===training.answer?'The evidence supports this recovery decision within the fictional case.':'The collected evidence does not support that recovery decision.'};
}
