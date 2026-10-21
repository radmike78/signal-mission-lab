/** Editorial training rubric, not an equipment interface specification. */
export const outcomes = [
 {id:'exchange',label:'Exchange a synthetic information product',service:'Application and information exchange',acceptance:'An authorized training user sends a dummy product and the intended training recipient confirms receipt and readability.'},
 {id:'access',label:'Access a shared training application',service:'Identity and application access',acceptance:'An authorized test account completes the intended application task; an unauthorized test account is denied.'},
 {id:'voice',label:'Complete a simulated voice exchange',service:'Voice communications',acceptance:'Both training participants acknowledge a scripted test message through the simulator.'},
 {id:'restore',label:'Restore a service after a simulated fault',service:'Continuity and recovery',acceptance:'After the injected fault is removed, the learner repeats the original user task and records successful completion.'}
] as const;
export type Outcome=typeof outcomes[number]['id'];
export type Observation='not-run'|'passed'|'failed';
export function requirement(outcome:Outcome,observation:Observation){
 const selected=outcomes.find(o=>o.id===outcome);
 if(!selected||!['not-run','passed','failed'].includes(observation))throw Error('Select a supplied training outcome and observation.');
 return {...selected,observation,status:observation==='passed'?'Synthetic task demonstrated':observation==='failed'?'Training gap observed':'Acceptance test pending',
 owner:'Supported system owner and Signal service owner: coordinate and confirm responsibilities.',
 interfaceStatus:'Unverified — a successful synthetic task does not validate equipment interoperability.',
 evidenceNeeded:['Applicable system variants and software versions','Approved public interface documentation with a precise locator','System-owner review and an authorized acceptance test'],
 constraints:['Synthetic data and simulated services only','No equipment quantities, configurations or performance requirements inferred']};
}
