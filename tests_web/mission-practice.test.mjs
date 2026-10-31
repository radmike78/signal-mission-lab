import test from 'node:test';
import assert from 'node:assert/strict';
import {missionPractice} from '../web/src/mission-practice.ts';
const base={mission:'command',echelon:'brigade',systems:['cpce'],setting:'single',priority:'availability'};
test('satellite topics take the prerequisite focus in a mixed transport study list',()=>{
 const r=missionPractice({...base,systems:['cpce','jnn','stt'],setting:'distributed'});assert.equal(r.caseId,'satellite');assert.match(r.scope,/No acquisition/);
 for(const id of ['stt','stt-plus','t2c2','smart-t','snap','dket','phoenix-e','snn','ngtt'])assert.equal(missionPractice({...base,systems:[id]}).caseId,'satellite');
});
test('routing study follows explicit topics or a distributed exercise, not echelon allocation',()=>{
 assert.equal(missionPractice({...base,systems:['cpn']}).caseId,'routing');assert.equal(missionPractice({...base,setting:'distributed'}).caseId,'routing');
 for(const echelon of ['battalion','brigade','division'])assert.deepEqual(missionPractice({...base,echelon}),missionPractice(base));
});
test('fallback is explicitly generic, cannot promise identity instruction or accept arbitrary input',()=>{
 const r=missionPractice({...base,priority:'access'});assert.equal(r.caseId,'builder');assert.match(r.scope,/not an Army builder or an identity-access lesson/);
 assert.throws(()=>missionPractice({...base,systems:['unknown-live-device']}));
});
