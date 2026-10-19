import test from 'node:test';
import assert from 'node:assert/strict';
import {outcomes,requirement} from '../web/src/requirements-model.ts';
test('Every outcome has an observable acceptance criterion and evidence gate',()=>{
 for(const o of outcomes){const r=requirement(o.id,'not-run');assert.ok(r.acceptance.length>60);assert.equal(r.evidenceNeeded.length,3);assert.match(r.status,/pending/);}
});
test('Passing a simulation never promotes equipment interface confidence',()=>{
 for(const o of outcomes)for(const state of ['not-run','passed','failed']){const r=requirement(o.id,state);assert.match(r.interfaceStatus,/Unverified/);assert.match(r.interfaceStatus,/does not validate/);}
 assert.match(requirement('exchange','failed').status,/gap/);
});
test('Unknown user-controlled states cannot enter the requirement record',()=>{
 for(const [o,s] of [['unknown','passed'],['exchange','certified'],['<script>','not-run']])assert.throws(()=>requirement(o,s));
});
