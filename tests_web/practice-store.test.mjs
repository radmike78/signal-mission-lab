import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePracticeHistory,createPracticeStore} from '../web/src/practice-store.ts';
const record={kind:'routing',score:3,total:5,at:'2026-10-21T12:00:00.000Z'};
test('device history rejects malformed, oversized and invalid values',()=>{
 for(const raw of ['{','null','{}','x'.repeat(30001),JSON.stringify([{...record,total:0},{...record,score:6},{...record,kind:'secret'},{...record,at:'invalid'}])])assert.deepEqual(parsePracticeHistory(raw),[]);
 assert.deepEqual(parsePracticeHistory(JSON.stringify([{...record,mission:'must not persist',token:'must not persist'}])),[record]);
 assert.equal(parsePracticeHistory(JSON.stringify(Array(80).fill(record))).length,50);
});
test('concurrent writes and erasure remain ordered and bounded',async()=>{
 let value=null;const store=createPracticeStore({get:async()=>value,set:async v=>{await Promise.resolve();value=v},remove:async()=>{value=null}});
 await Promise.all(Array.from({length:60},()=>store.add(record)));assert.equal((await store.read()).length,50);
 await Promise.all([store.add(record),store.clear(),store.add({...record,kind:'builder'})]);assert.deepEqual(await store.read(),[{...record,kind:'builder'}]);
 await store.clear();assert.equal(value,null);
});
test('a storage failure does not poison later operations',async()=>{
 let fail=true,value=null;const store=createPracticeStore({get:async()=>value,set:async v=>{if(fail)throw Error('unavailable');value=v},remove:async()=>{value=null}});
 await assert.rejects(store.add(record));fail=false;await store.add(record);assert.deepEqual(await store.read(),[record]);
 await assert.rejects(store.add({...record,score:-1}));assert.equal((await store.read()).length,1);
});
