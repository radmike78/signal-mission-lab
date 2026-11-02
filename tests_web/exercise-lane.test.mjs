import test from 'node:test';
import assert from 'node:assert/strict';
import {initialLane,replayLane,laneDebrief,MAX_LANE_EVENTS} from '../web/src/exercise-lane-model.ts';
const first=['inspect-local','inspect-link','inspect-path','inspect-feed','brief-remote'];
const proof=['send-report','confirm-receipt','inspect-feed','handoff-tested'];
export const solutions={
 'lane-01':[...first,'repair-handoff',...proof],
 'lane-02':[...first,'restore-sync',...proof],
 'lane-03':[...first,'repair-handoff','inspect-path','inspect-feed','restore-sync',...proof]
};
test('Every environment and lane supports a repeatable complete user task',()=>{
 for(const mode of ['commex','staffex','wfx'])for(const [lane,events] of Object.entries(solutions)){
  const result=laneDebrief(lane,mode,events);assert.equal(result.score,4);assert.equal(result.total,4);assert.equal(result.unsupportedChanges,0);
  assert.deepEqual(laneDebrief(lane,mode,events),result);assert.equal(result.trace.length,events.length);
 }
});
test('A repaired handoff cannot conceal an independent synchronization fault',()=>{
 const events=[...first,'repair-handoff','inspect-path','send-report','confirm-receipt','inspect-feed'];
 const s=replayLane('lane-03','commex',events);assert.equal(s.handoff,true);assert.equal(s.sync,false);assert.equal(s.receipt,false);assert.equal(s.fresh,false);assert.equal(s.feedSeen,'stale');
 assert.equal(laneDebrief('lane-03','commex',[...events,'handoff-tested']).score,1);
});
test('Evidence exposure, a link light or an early final briefing cannot earn recovery credit',()=>{
 assert.equal(laneDebrief('lane-01','commex',['inspect-link','handoff-light']).score,0);
 assert.throws(()=>laneDebrief('lane-01','commex',['inspect-local']));
 const s=replayLane('lane-01','commex',['inspect-link','inspect-feed']);assert.equal(s.feedSeen,'unreachable');assert.equal(s.fresh,false);
});
test('An accidental repair and unsupported initial impact remain visible after restoration',()=>{
 const accidental=laneDebrief('lane-01','commex',['repair-handoff',...proof]);assert.equal(accidental.score,2);assert.equal(accidental.unsupportedChanges,1);
 const wrong=laneDebrief('lane-01','commex',[...first.slice(0,4),'brief-all','repair-handoff',...proof]);assert.equal(wrong.score,3);assert.equal(wrong.rubric.find(r=>r.id==='impact').passed,false);
 assert.throws(()=>replayLane('lane-01','commex',['brief-all','brief-remote']));
});
test('Every change invalidates sender, recipient and freshness acceptance',()=>{
 const prefix=[...solutions['lane-01'].slice(0,-1)];
 for(const change of ['repair-handoff','restore-sync','restart-local']){
  const s=replayLane('lane-01','commex',[...prefix,change]);assert.equal(s.sent,false);assert.equal(s.receipt,false);assert.equal(s.fresh,false);
  const result=laneDebrief('lane-01','commex',[...prefix,change,'handoff-tested']);assert.equal(result.rubric.find(r=>r.id==='acceptance').passed,false);assert.equal(result.rubric.find(r=>r.id==='handoff').passed,false);
 }
});
test('Sender submission cannot stand in for recipient acknowledgment',()=>{
 const events=[...first,'repair-handoff','send-report','inspect-feed','handoff-tested'];
 const result=laneDebrief('lane-01','commex',events);assert.equal(result.score,2);assert.equal(result.rubric.find(r=>r.id==='acceptance').passed,false);
});
test('Forged, oversized and post-completion actions cannot create a result',()=>{
 for(const events of [null,{},['__proto__'],['toString'],['<script>'],[1],Array(MAX_LANE_EVENTS+1).fill('inspect-link')])assert.throws(()=>replayLane('lane-01','commex',events));
 assert.throws(()=>initialLane('unknown','commex'));assert.throws(()=>initialLane('lane-01','real-operation'));
 assert.throws(()=>replayLane('lane-01','commex',['handoff-light','inspect-path']));
 const result=laneDebrief('lane-01','commex',solutions['lane-01']);assert.match(result.scope,/fictional/);assert.match(result.recordStatus,/not an authenticated instructor record/);
});
