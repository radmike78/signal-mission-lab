import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendation,validateAnswers} from '../web/src/mission-model.ts';
const base={mission:'fires',echelon:'brigade',systems:['afatds','q53'],setting:'single',priority:'availability'};
test('Selected systems stay visible without implying a radar connection',()=>{
 const result=recommendation(base);
 assert.deepEqual(result.equipment.map(x=>x.id),['afatds','q53']);
 assert.equal(result.services[0].detail,'AFATDS');
 assert.ok(result.equipment.find(e=>e.id==='q53').reason.includes('does not establish radar interfaces'));
 assert.equal(result.limitations.length,3);
});
test('Distributed exercise adds comparison categories, not allocations',()=>{
 const result=recommendation({...base,setting:'distributed'});
 assert.ok(result.equipment.some(e=>e.id==='jnn'));
 assert.ok(result.equipment.some(e=>e.id==='cpn'));
 assert.match(result.equipment.find(e=>e.id==='jnn').reason,/suitability is unknown/);
});
test('Disruption and access priorities change the teaching plan',()=>{
 assert.ok(recommendation({...base,setting:'disrupted'}).equipment.some(e=>e.id==='radio'));
 assert.equal(recommendation({...base,priority:'access'}).emphasis,'Identity and authorized access');
 assert.notDeepEqual(recommendation({...base,priority:'access'}).questions,recommendation({...base,priority:'continuity'}).questions);
});
test('Unknown or invalid recommendation inputs are rejected',()=>{
 for(const answers of [{...base,mission:'real-opord'},{...base,echelon:'unknown'},{...base,systems:[]},{...base,systems:['afatds','afatds']},{...base,systems:['unknown-system']},{...base,setting:'1 OR 1=1'}])assert.throws(()=>validateAnswers(answers));
});
test('Exploration is also a complete guided path',()=>{
 const result=recommendation({mission:'explore',echelon:'battalion',systems:['radio'],setting:'single',priority:'continuity'});
 assert.deepEqual(result.equipment.map(e=>e.id),['radio']);
 assert.match(result.summary,/Battalion/);
});

test('Mixed supported systems retain readable labels',()=>{
 const result=recommendation({...base,systems:['afatds','dcgsa']});
 assert.equal(result.services[0].detail,'AFATDS · DCGS-A');
});

test('Expanded catalog selections retain readable labels and bounded size',()=>{
 const result=recommendation({...base,systems:['ngtt','prc158','tcn']});
 assert.equal(result.services[0].detail,'Next Generation Tactical Terminal (NGTT) · AN/PRC-158 · Tactical Communications Node (TCN)');
 assert.throws(()=>recommendation({...base,systems:['afatds','q53','dcgsa','cpce','radio','jnn','cpn','tcn','ngtt','mom','pop','sne','vwp']}));
});

test('Explicit transport study choices do not silently add legacy node alternatives',()=>{
 const result=recommendation({...base,systems:['cpce','ngtt'],setting:'distributed'});
 assert.deepEqual(result.equipment.map(e=>e.id),['cpce','ngtt']);
});
