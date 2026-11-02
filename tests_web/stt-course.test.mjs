import test from 'node:test';
import assert from 'node:assert/strict';
import {sttCourse,recordCourseAnswer,courseSummary,instructorCoursePacket,escapeCourseText} from '../web/src/stt-course-model.ts';
const correct=Object.fromEntries(sttCourse.modules.map(m=>[m.id,m.checkpoint.answer]));
test('Six distinct course outcomes retain first-choice scoring and complete separately from capstones',()=>{
 let answers={};
 for(const m of sttCourse.modules)answers=recordCourseAnswer(answers,m.id,m.checkpoint.answer);
 assert.deepEqual(courseSummary(answers),{answered:6,score:6,total:6,complete:true});
 assert.throws(()=>recordCourseAnswer(answers,'mission',0));
 const wrong={...correct,mission:0};assert.equal(courseSummary(wrong).score,5);
 assert.equal(courseSummary({mission:1}).complete,false);
 assert.throws(()=>recordCourseAnswer({},'unknown',1));
});
test('Invalid, oversized or coercible response values cannot create a result',()=>{
 for(const value of [null,[],{'unknown':1},{mission:true},{mission:-1},{mission:3},{mission:NaN},{mission:'1'},Object.fromEntries(Array.from({length:7},(_,i)=>['x'+i,0]))])assert.throws(()=>courseSummary(value));
});
test('Instructor packet is bounded, printable and honest about practical performance',()=>{
 const html=instructorCoursePacket(correct);
 assert.match(html,/Guided first-choice result: 6\/6/);assert.match(html,/not.*verify practical performance/);
 for(const id of ['lane-01','lane-02','lane-03'])assert.ok(html.includes(id));
 for(const source of sttCourse.sources)assert.ok(html.includes(source.url));
 assert.match(html,/Search excerpt checked; direct page access returned 403/);assert.equal(html.includes('<script'),false);
 assert.match(instructorCoursePacket({}),/Preview packet/);
 assert.equal(escapeCourseText('<script>"&\'</script>'),'&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
});
test('Inherited choices cannot inflate a partial result',()=>{
 const forged=Object.create(correct);
 assert.deepEqual(courseSummary(forged),{answered:0,score:0,total:6,complete:false});
});
