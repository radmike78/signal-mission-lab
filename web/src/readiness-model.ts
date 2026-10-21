import {validateAnswers,type Answers} from './mission-model.ts';
export const preparationChecks=[
 {id:'intent',title:'Commander’s intent and user outcome',purpose:'Explain the fictional purpose, desired outcome, constraints and how the user task supports the decision.',acceptance:'Exercise director and supported user agree on a dummy task and observable success criterion.'},
 {id:'parts',title:'Parts and support prerequisites',purpose:'Investigate the documented components, power, cabling, accessories, software, licenses and tools required for the selected variants.',acceptance:'Review a public variant-specific parts/reference checklist; record missing items as blockers. No bill of materials is inferred here.'},
 {id:'architecture',title:'Architecture and interfaces',purpose:'Explain each service dependency and why it supports the intended user outcome.',acceptance:'Separate generic dependencies from documented interfaces; identify missing version/interface evidence.'},
 {id:'coordination',title:'External service coordination',purpose:'Identify the synthetic service owner, approvals, handoff and test availability before the exercise site visit.',acceptance:'The fictional owner acknowledges prerequisites, responsibilities and the approved test plan.'},
 {id:'build',title:'Build and recovery rehearsal',purpose:'Explain manual operations behind automation, partial completion and safe recovery boundaries.',acceptance:'Rehearse a synthetic failure, preserve evidence and follow a documented recovery/rollback contract.'},
 {id:'acceptance',title:'End-to-end acceptance and handoff',purpose:'Test the user task after dependencies pass; communicate residual risks and remaining blockers.',acceptance:'Repeat the dummy user task, explain what was demonstrated and what equipment claims remain unverified.'}
] as const;
export type CheckId=typeof preparationChecks[number]['id'];
export const ownerChoices=['Unassigned','Exercise director','Supported system owner','Signal service owner','Training team'] as const;
export const reviewStates=['Not reviewed','Blocked','Rehearsed in simulation'] as const;
export type PreparationRow={id:CheckId;owner:typeof ownerChoices[number];state:typeof reviewStates[number]};
export const initialPreparation=():PreparationRow[]=>preparationChecks.map(c=>({id:c.id,owner:'Unassigned',state:'Not reviewed'}));
export function preparationSummary(rows:readonly PreparationRow[]){
 if(!Array.isArray(rows)||rows.length!==preparationChecks.length||new Set(rows.map(r=>r.id)).size!==rows.length||rows.some(r=>!preparationChecks.some(c=>c.id===r.id)||!ownerChoices.includes(r.owner)||!reviewStates.includes(r.state)))throw Error('Use supplied synthetic preparation choices.');
 const unresolved=rows.filter(r=>r.owner==='Unassigned'||r.state!=='Rehearsed in simulation');
 const blocked=rows.filter(r=>r.state==='Blocked');
 return {unresolved:unresolved.map(r=>r.id),blocked:blocked.map(r=>r.id),reviewed:rows.length-unresolved.length,status:unresolved.length?'Preparation gaps remain':'Synthetic preparation reviewed',boundary:'Self-reported exercise review only. This does not establish real equipment readiness, complete parts coverage, authorization or interoperability.'};
}
export function preparationPacket(answers:Answers,rows:readonly PreparationRow[]){
 validateAnswers(answers);const summary=preparationSummary(rows);
 return ['SIGNAL MISSION LAB — SYNTHETIC PREPARATION BRIEF','Unofficial education; no operational plan or equipment configuration.',`Training focus: ${answers.mission}; echelon: ${answers.echelon}; setting: ${answers.setting}; priority: ${answers.priority}`,`Catalog study identifiers: ${answers.systems.join(', ')}`,`Review: ${summary.status}; ${summary.reviewed}/${rows.length} assigned and rehearsed.`,summary.boundary,'',...preparationChecks.flatMap(c=>{const r=rows.find(r=>r.id===c.id)!;return [c.title,`Exercise owner: ${r.owner}; self-reported status: ${r.state}`,`Purpose: ${c.purpose}`,`Expected evidence: ${c.acceptance}`,''];}),'RISK AND BLOCKER BRIEF','An unassigned owner, missing component/reference, unverified interface or unconfirmed external service is an unresolved planning item.','For each gap: name the missing evidence, responsible exercise role, next check, dependency impact and decision needed.','Do not treat a successful script, tunnel indication or acquisition indication as an end-to-end service test.','Fallback: rehearse a separately approved synthetic alternative; document its assumptions and acceptance criteria.','Manual procedures, compatibility, exact parts/quantities and operational settings remain unverified.'].join('\n');
}
