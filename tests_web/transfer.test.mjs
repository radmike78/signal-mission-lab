import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeTransfer,nextTransfer,transferCases} from '../web/src/transfer-model.ts';
import {practiceReviews} from '../web/src/practice-review.ts';
for(const skill of ['builder','routing','satellite'])test(skill+': changed faults and first-choice scoring',()=>{
 const first=nextTransfer(skill),second=nextTransfer(skill,first.id);assert.notEqual(first.id,second.id);assert.equal(nextTransfer(skill,second.id).id,first.id);
 for(const c of transferCases.filter(x=>x.skill===skill)){
  const correct=c.steps.map(s=>s.answer);assert.equal(gradeTransfer(c.id,correct).score,3);
  const wrong=c.steps.map(s=>(s.answer+1)%s.options.length);assert.equal(gradeTransfer(c.id,wrong).score,0);
  assert.equal(gradeTransfer(c.id,[...correct.slice(0,2),wrong[2]]).score,2);
 }
});
test('invalid and incomplete evidence cannot create an independent result',()=>{
 for(const args of [['unknown',[0,0,0]],['builder-access',[0]],['builder-access',[0,0,99]],['builder-access',[0,0,'2']]])assert.throws(()=>gradeTransfer(...args));
});
test('review schedule separates skills, handles failed attempts and crosses day boundaries',()=>{
 const now=Date.parse('2026-10-31T12:00:00Z'),day=86400000;
 assert(practiceReviews([],now).every(x=>x.due));
 const r=(score,at)=>({kind:'routing-transfer',score,total:3,at:new Date(at).toISOString()});
 let queue=practiceReviews([r(3,now)],now);assert.equal(queue[1].dueAt,now+day);assert.equal(queue[0].attempted,false);
 assert.equal(practiceReviews([r(3,now-1000),r(3,now)],now)[1].dueAt,now+day);
 queue=practiceReviews([r(3,now-2*day),r(3,now)],now);assert.equal(queue[1].dueAt,now+3*day);
 queue=practiceReviews([r(3,now-2*day),r(3,now-day),r(1,now)],now);assert.equal(queue[1].dueAt,now+day);
 assert.equal(practiceReviews([r(1,now-day)],now)[1].due,true);
});
