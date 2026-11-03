import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalLabs,labSummary,inspectLab,answerLab} from '../web/src/technical-lab-model.ts';
const empty=()=>({inspected:[],choices:[]});
const inspectAll=lab=>lab.evidence.reduce((a,e)=>inspectLab(lab.id,a,e.id),empty());
test('all eight cases require evidence and preserve ordered first choices',()=>{
 for(const lab of technicalLabs.labs){
  assert.throws(()=>answerLab(lab.id,empty(),0,lab.decisions[0].answer));
  let a=inspectAll(lab);assert.equal(labSummary(lab.id,a).ready,true);
  assert.deepEqual(inspectLab(lab.id,a,lab.evidence[0].id),a);
  for(let i=0;i<3;i++){
   assert.throws(()=>answerLab(lab.id,a,i+1,0));
   a=answerLab(lab.id,a,i,lab.decisions[i].answer);
   assert.throws(()=>answerLab(lab.id,a,i,0));
  }
  assert.deepEqual(labSummary(lab.id,a),{ready:true,complete:true,score:3,total:3});
  assert.throws(()=>answerLab(lab.id,a,3,0));
 }
});
test('a wrong first choice remains wrong after reading feedback or reference recovery',()=>{
 const lab=technicalLabs.labs[0];let a=inspectAll(lab);
 a=answerLab(lab.id,a,0,(lab.decisions[0].answer+1)%3);
 assert.equal(labSummary(lab.id,a).score,0);
 for(let i=1;i<3;i++)a=answerLab(lab.id,a,i,lab.decisions[i].answer);
 assert.deepEqual(labSummary(lab.id,a),{ready:true,complete:true,score:2,total:3});
});
test('forged, sparse, coercible and unknown lab state is rejected',()=>{
 const id=technicalLabs.labs[0].id,inspected=inspectAll(technicalLabs.labs[0]).inspected;
 for(const value of [null,{},[],{inspected:['unknown'],choices:[]},{inspected:[inspected[0],inspected[0]],choices:[]},{inspected:[],choices:[0]},...[true,'0',-1,3,NaN,undefined].map(x=>({inspected,choices:[x]})),{inspected,choices:Array(3)},{inspected,choices:[0,0,0,0]}])assert.throws(()=>labSummary(id,value));
 assert.throws(()=>labSummary('unknown',empty()));
 assert.throws(()=>inspectLab(id,empty(),'unknown'));
 assert.throws(()=>answerLab(id,{inspected,choices:[]},0.5,0));
});
