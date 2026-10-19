import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnosticCases,diagnosticSources,evaluateDiagnosis} from '../web/src/troubleshooting-model.ts';
for(const c of diagnosticCases){
 test(`${c.id}: a correct guess without evidence is not a supported diagnosis`,()=>{
  const r=evaluateDiagnosis(c.id,[],c.answer);assert.equal(r.supported,false);assert.deepEqual(r.missing,c.required);
 });
 test(`${c.id}: evidence cannot compensate for an unsupported recovery decision`,()=>{
  const ids=c.evidence.map(e=>e.id);
  for(const choice of c.choices)assert.equal(evaluateDiagnosis(c.id,ids,choice.id).supported,choice.id===c.answer);
  assert.equal(evaluateDiagnosis(c.id,ids.slice(1),c.answer).supported,false);
 });
 test(`${c.id}: all source references resolve and recovery has explicit acceptance`,()=>{
  assert.ok(c.sourceIds.length);for(const id of c.sourceIds)assert.ok(diagnosticSources.some(s=>s.id===id&&new URL(s.url).protocol==='https:'));
  assert.ok(c.recovery.some(r=>/verify|validate|recheck/i.test(r)));assert.ok(c.handoff.length>40);
 });
}
test('Forged evidence, duplicate evidence and unsupported cases are rejected',()=>{
 for(const args of [['builder',['shell'],'partial'],['builder',['log','log'],'partial'],['builder',[],'execute'],['unknown',[],'partial'],['builder','log','partial']])assert.throws(()=>evaluateDiagnosis(...args));
});
