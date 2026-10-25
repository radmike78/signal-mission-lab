/** Bounded local formative results only. Never store mission text or credentials. */
export type PracticeKind='assessment'|'diagnosis'|'builder'|'routing'|'satellite';
export type PracticeResult={kind:PracticeKind;score:number;total:number;at:string};
export function parsePracticeHistory(raw:string|null):PracticeResult[]{
 if(!raw||raw.length>30000)return [];
 try{const value:unknown=JSON.parse(raw);if(!Array.isArray(value))return [];
 return value.slice(-50).flatMap((r:unknown)=>{
  if(!r||typeof r!=='object')return [];
  const x=r as Record<string,unknown>;
  if(typeof x.kind!=='string'||!['assessment','diagnosis','builder','routing','satellite'].includes(x.kind)||typeof x.score!=='number'||typeof x.total!=='number'||!Number.isFinite(x.score)||!Number.isFinite(x.total)||x.total<=0||x.total>100||x.score<0||x.score>x.total||typeof x.at!=='string'||x.at.length>30||!Number.isFinite(Date.parse(x.at)))return [];
  return [{kind:x.kind as PracticeKind,score:x.score,total:x.total,at:x.at}];
 });}catch{return [];}
}
export function createPracticeStore(storage:{get:()=>Promise<string|null>;set:(value:string)=>Promise<void>;remove:()=>Promise<void>}){
 let queue:Promise<unknown>=Promise.resolve();
 const serial=<T,>(action:()=>Promise<T>):Promise<T>=>{const next=queue.then(action,action);queue=next.catch(()=>undefined);return next;};
 return {
  read:()=>serial(async()=>parsePracticeHistory(await storage.get())),
  add:(result:PracticeResult)=>serial(async()=>{const safe=parsePracticeHistory(JSON.stringify([result]));if(safe.length!==1)throw Error('Invalid practice result');const next=[...parsePracticeHistory(await storage.get()),safe[0]].slice(-50);await storage.set(JSON.stringify(next));return next;}),
  clear:()=>serial(async()=>{await storage.remove();return [] as PracticeResult[];})
 };
}
