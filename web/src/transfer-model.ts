import content from '../../data/transfer-exercises.json' with {type:'json'};
import type {CaseId} from './troubleshooting-model.ts';
export const transferCases=content.cases;
export function gradeTransfer(id:string,answers:readonly number[]){
 const exercise=transferCases.find(c=>c.id===id);
 if(!exercise||!Array.isArray(answers)||answers.length!==exercise.steps.length||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=exercise.steps[i].options.length))throw Error('Use supplied practice choices.');
 const results=answers.map((a,i)=>a===exercise.steps[i].answer);
 return {score:results.filter(Boolean).length,total:results.length,results};
}
export function nextTransfer(skill:CaseId,lastId?:string){
 const cases=transferCases.filter(c=>c.skill===skill);const index=cases.findIndex(c=>c.id===lastId);return cases[(index+1)%cases.length];
}
