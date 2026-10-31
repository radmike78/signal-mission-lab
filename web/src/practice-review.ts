import type {PracticeResult} from './practice-store.ts';
import type {CaseId} from './troubleshooting-model.ts';
const day=86400000;
/** A local practice schedule, not a claim of an optimal or validated interval. */
export function practiceReviews(records:readonly PracticeResult[],now=Date.now()){
 return (['builder','routing','satellite'] as CaseId[]).map(skill=>{
  const attempts=records.filter(r=>r.kind===skill+'-transfer').sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  const last=attempts.at(-1);const successfulDays=new Set<string>();
  for(let i=attempts.length-1;i>=0&&attempts[i].score===attempts[i].total;i--)successfulDays.add(new Date(attempts[i].at).toISOString().slice(0,10));
  const streak=successfulDays.size;
  const interval=last&&last.score===last.total?[1,3,7,21][Math.min(Math.max(streak-1,0),3)]:1;
  const dueAt=last?Date.parse(last.at)+interval*day:null;
  return {skill,dueAt,due:dueAt===null||now>=dueAt,attempted:!!last};
 });
}
export const skillLabel=(skill:string)=>({builder:'Build failures',routing:'Routing and tunnels',satellite:'Transport acceptance'}[skill.replace('-transfer','')]||skill);
