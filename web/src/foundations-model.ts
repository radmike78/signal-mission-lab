/** Synthetic dependency model. No device emulation or equipment interface inference. */
export const stackDependencies=[
 {id:'power',label:'Physical power available',lesson:'compute'},
 {id:'compute',label:'Host and workload running',lesson:'compute'},
 {id:'storage',label:'Required data readable',lesson:'storage'},
 {id:'network',label:'Required network path usable',lesson:'routing'},
 {id:'identity',label:'Test identity accepted',lesson:'services'},
 {id:'policy',label:'Approved policy permits the test task',lesson:'firewalls'}
] as const;
export type Dependency=typeof stackDependencies[number]['id'];
export type StackState=Record<Dependency,boolean>;
export function simulateStack(state:StackState){
 const keys=Object.keys(state);
 if(keys.length!==stackDependencies.length||keys.some(k=>!stackDependencies.some(d=>d.id===k))||stackDependencies.some(d=>typeof state[d.id]!=='boolean'))throw Error('Use supplied synthetic dependency states.');
 const missing=stackDependencies.filter(d=>!state[d.id]);
 return {usable:missing.length===0,missing:missing.map(d=>d.id),message:missing.length?'The synthetic user task is blocked. Investigate each missing dependency; this model does not diagnose real equipment.':'The synthetic user task succeeds in this simplified model. This does not validate an actual system or interface.'};
}
