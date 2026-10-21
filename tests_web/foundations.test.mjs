import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateStack} from '../web/src/foundations-model.ts';
const healthy={power:true,compute:true,storage:true,network:true,identity:true,policy:true};
test('Reachable running VM does not establish readable data or permitted access',()=>{
 const result=simulateStack({...healthy,storage:false,policy:false});
 assert.equal(result.usable,false);assert.deepEqual(result.missing,['storage','policy']);
});
test('Restoring one dependency cannot conceal another remaining failure',()=>{
 const result=simulateStack({...healthy,identity:false});
 assert.equal(result.usable,false);assert.deepEqual(result.missing,['identity']);
 assert.match(simulateStack(healthy).message,/does not validate an actual system/);
});
test('Unavailable power remains visible alongside other failures',()=>{
 assert.deepEqual(simulateStack({...healthy,power:false,compute:false}).missing,['power','compute']);
});
test('Unsupported state keys and coercible values are rejected',()=>{
 for(const state of [{...healthy,network:'true'},{...healthy,execute:'reconfigure'},{}])assert.throws(()=>simulateStack(state));
});
