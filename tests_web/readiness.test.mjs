import test from 'node:test';import assert from 'node:assert/strict';
import {initialPreparation,preparationSummary,preparationPacket} from '../web/src/readiness-model.ts';
const answers={mission:'command',echelon:'brigade',systems:['gait'],setting:'distributed',priority:'continuity'};
test('A rehearsed item without an owner remains unresolved',()=>{
 const rows=initialPreparation().map(r=>({...r,state:'Rehearsed in simulation'}));
 assert.equal(preparationSummary(rows).unresolved.length,rows.length);
 rows[0].owner='Signal service owner';assert.equal(preparationSummary(rows).reviewed,1);
 rows[0].state='Blocked';assert.equal(preparationSummary(rows).blocked.length,1);assert.equal(preparationSummary(rows).reviewed,0);
});
test('A complete self-report never certifies real readiness',()=>{
 const rows=initialPreparation().map(r=>({...r,owner:'Training team',state:'Rehearsed in simulation'}));
 const r=preparationSummary(rows);assert.equal(r.unresolved.length,0);assert.match(r.boundary,/does not establish real equipment readiness/);
 const packet=preparationPacket(answers,rows);assert.match(packet,/self-reported status/);assert.match(packet,/operational settings remain unverified/);
});
test('Forged rows and free text cannot enter the packet',()=>{
 for(const rows of [[],[...initialPreparation(),initialPreparation()[0]],initialPreparation().map(r=>({...r,owner:'actual unit'})),initialPreparation().map(r=>({...r,state:'ready for operations'}))])assert.throws(()=>preparationSummary(rows));
 assert.throws(()=>preparationPacket({...answers,systems:['<script>']},initialPreparation()));
 assert.throws(()=>preparationPacket({...answers,mission:'free text'},initialPreparation()));
});
