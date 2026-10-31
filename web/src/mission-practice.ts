import {validateAnswers,type Answers} from './mission-model.ts';
import type {CaseId} from './troubleshooting-model.ts';
export type MissionPractice={caseId:CaseId;title:string;reason:string;scope:string};
/** Editorial study routing only. Never infer a live fault or an equipment interface. */
export function missionPractice(answers:Answers):MissionPractice{
 validateAnswers(answers);
 const selected=new Set(answers.systems);
 const satellite=['stt','stt-plus','t2c2','smart-t','snap','dket','phoenix-d','phoenix-e','snn','ngtt','scout','satcom-fot'].some(id=>selected.has(id));
 const routing=['jnn','cpn','tcn','thn','rhn','gait','wint-inc1','wint-inc2','trilos','hclos'].some(id=>selected.has(id));
 if(satellite)return {caseId:'satellite',title:'Transport acceptance',reason:'Your study list includes satellite transport. Practice separating a local indication from accepted two-way service before testing dependent applications.',scope:'Generic acceptance reasoning only. No acquisition, lock, transmit or system-specific procedure is supplied.'};
 if(routing||answers.setting==='distributed')return {caseId:'routing',title:'Routing and tunnels',reason:'Your study list or multiple-location setting makes the path between services worth rehearsing. Practice distinguishing a tunnel, adjacency, route and usable application.',scope:'A study focus, not a diagnosis or a verified network design. Actual interfaces and routing baselines remain unknown.'};
 return {caseId:'builder',title:'Build failures and dependencies',reason:'Begin with a generic application dependency failure. Practice comparing automation messages with observed state and a documented recovery contract.',scope:'No system-specific match is established. This is a generic build example, not an Army builder or an identity-access lesson.'};
}
