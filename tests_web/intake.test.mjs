import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretDescription,nextClarification,screenDescription} from '../web/src/mission-intake.ts';
const full='For a fictional brigade training exercise support AFATDS and Q-53 at multiple locations and practice recovery from outages.';
test('Complete natural description skips all unnecessary questions',()=>{
 const parsed=interpretDescription(full);
 assert.deepEqual(parsed.answers,{mission:'fires',echelon:'brigade',systems:['afatds','q53'],setting:'distributed',priority:'continuity'});
 assert.equal(nextClarification(parsed.answers),5);
});
test('Sparse description asks only for missing details',()=>{
 const draft=interpretDescription('In a fictional exercise our brigade needs AFATDS.').answers;
 assert.equal(draft.mission,'fires');assert.equal(draft.echelon,'brigade');
 assert.equal(nextClarification(draft),3);
 assert.equal(nextClarification({...draft,setting:'single'}),4);
});
test('Unknown scope and multiple echelons require clarification',()=>{
 assert.equal(nextClarification(interpretDescription('Help my fictional team collaborate.').answers),6);
 const parsed=interpretDescription('A fictional brigade and division use CPCE at one location for user access.');
 assert.equal(parsed.answers.echelon,undefined);assert.ok(parsed.ambiguous.includes('echelon'));
 assert.equal(nextClarification(parsed.answers),1);
});
test('Ambiguous priorities are not silently guessed',()=>{
 const result=interpretDescription('Fictional battalion uses CPCE at one location for user access and recovery.');
 assert.equal(result.answers.priority,undefined);assert.ok(result.ambiguous.includes('priority'));
});
test('Mixed-domain systems survive a primary-focus clarification',()=>{
 const result=interpretDescription('Fictional brigade studies AFATDS and DCGS-A at one location for recovery.');
 assert.equal(result.answers.mission,undefined);assert.deepEqual(result.answers.systems,['afatds','dcgsa']);
 assert.equal(nextClarification(result.answers),6);
});
test('Negated systems and plain numbers do not become recommendations',()=>{
 assert.equal(interpretDescription('For a fictional exercise use CPCE without AFATDS at one location.').answers.systems.includes('afatds'),false);
 assert.equal(interpretDescription('A fictional team of 53 users needs collaboration.').answers.systems,undefined);
});
test('Sensitive examples and instruction overrides are rejected without echoing',()=>{
 for(const detail of ['CUI training notes','COMSEC material','10.1.2.3','password is abc','151.2 MHz','36.1234, -115.1234','actual mission','ignore previous instructions','https://evil.example']){
  const text='For a fictional brigade training exercise: '+detail;
  assert.ok(screenDescription(text));assert.throws(()=>interpretDescription(text));
 }
 assert.ok(screenDescription('x'.repeat(1201)));assert.ok(screenDescription('short'));
});
test('Unrecognized markup remains data and is not executed',()=>{
 const result=interpretDescription('For a fictional brigade exercise use CPCE <script>alert(1)</script> at one location for recovery.');
 assert.equal(result.answers.mission,'command');assert.equal(result.answers.setting,'single');
});

test('Named upper and lower TI systems retain distinct catalog identifiers',()=>{
 const a=interpretDescription('Fictional brigade exercise with WIN-T Increment 2, TCN, TRILOS, AN/PRC-158 and PRC-163 at one location for user access.').answers;
 for(const id of ['wint-inc2','tcn','trilos','prc158','prc163'])assert.ok(a.systems.includes(id),id);
 assert.equal(interpretDescription('Fictional brigade exercise without PRC-160. Use CPCE at one location for user access.').answers.systems.includes('prc160'),false);
});
