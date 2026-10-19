import {equipmentOptions} from './equipment-options.ts';
/** Deterministic teaching recommendations. No operational inputs or compatibility inference. */
export const missionOptions=[
 {id:'command',title:'Connect a command post',detail:'Help a fictional staff share information and maintain services.',icon:'network',tag:'COMMAND & CONTROL'},
 {id:'fires',title:'Support a fires team',detail:'Explore support responsibilities around AFATDS and radar systems.',icon:'layers',tag:'CROSS-BRANCH SUPPORT'},
 {id:'intelligence',title:'Enable an intelligence team',detail:'Study application access, information sharing and service dependencies.',icon:'scan',tag:'INFORMATION SERVICES'},
 {id:'explore',title:'Help me figure it out',detail:'Start with the user outcome. We’ll guide you from there.',icon:'compass',tag:'START WITH THE BASICS'}
] as const;
export type Mission=typeof missionOptions[number]['id'];
export type Echelon='battalion'|'brigade'|'division';
export type Setting='single'|'distributed'|'disrupted';
export type Priority='availability'|'access'|'continuity';
export type Answers={mission:Mission;echelon:Echelon;systems:string[];setting:Setting;priority:Priority};
export const systemChoices:Record<Mission,{id:string;title:string;detail:string}[]>={
 command:[{id:'cpce',title:'CPCE',detail:'Mission command application overview'},{id:'radio',title:'Radio communications',detail:'Voice and radio fundamentals'}],
 fires:[{id:'afatds',title:'AFATDS',detail:'Fires application overview'},{id:'q53',title:'AN/TPQ-53',detail:'Radar system and support ownership'},{id:'cpce',title:'CPCE',detail:'Mission command context'}],
 intelligence:[{id:'dcgsa',title:'DCGS-A',detail:'Intelligence application overview'},{id:'cpce',title:'CPCE',detail:'Mission command context'}],
 explore:[{id:'cpce',title:'Shared staff information',detail:'Explore mission command concepts'},{id:'radio',title:'Voice communication',detail:'Explore radio communications concepts'}]
};
export function validateAnswers(value:Answers):void{
 if(!missionOptions.some(m=>m.id===value.mission)||!['battalion','brigade','division'].includes(value.echelon)||!['single','distributed','disrupted'].includes(value.setting)||!['availability','access','continuity'].includes(value.priority))throw Error('Choose a supplied fictional training option.');
 const permitted:string[]=equipmentOptions.map(e=>e.id);
 if(!value.systems.length||value.systems.length>12||new Set(value.systems).size!==value.systems.length||value.systems.some(s=>!permitted.includes(s)))throw Error('Choose supported systems for this training mission.');
}
export function recommendation(value:Answers){
 validateAnswers(value);
 const systems=[...value.systems];
 const selectedTransport=['jnn','cpn','tcn','thn','rhn','stt','stt-plus','trilos','hclos','t2c2','smart-t','snap','dket','phoenix-d','phoenix-e','snn','ngtt','scout','htll','wint-inc1','wint-inc2','gait'].some(id=>systems.includes(id));
 const transport=value.setting==='single'||selectedTransport?[]:['jnn','cpn'];
 if(value.setting==='disrupted'&&!systems.includes('radio'))transport.push('radio');
 const equipment=[...new Set([...systems,...transport])].map(id=>({id,reason:
  id==='jnn'||id==='cpn'?'Compare transport-node families while studying a distributed exercise. Variant suitability is unknown.':
  id==='radio'&&!value.systems.includes(id)?'Study an alternate communications category for the synthetic interruption exercise.':
  id==='q53'?'Include radar operators and maintainers in the learning discussion. Signal support does not establish radar interfaces.':
  'Candidate for the described training outcome; confirm its relevance with the supported system owner.'}));
 const emphasis=value.priority==='access'?'Identity and authorized access':value.priority==='continuity'?'Recovery and alternate service concepts':'End-to-end service availability';
 const services=[
  {title:'User outcome',detail:systems.filter(s=>s!=='q53').map(s=>equipmentOptions.find(x=>x.id===s)?.title||s).join(' · ')||'Supported application and users'},
  {title:'Supporting services',detail:value.priority==='access'?'Identity · authorization · application health':'Application health · identity · name resolution'},
  {title:'Transport concepts',detail:value.setting==='single'?'Local network · switching · cabling':'Local network · inter-site transport · service reachability'},
  {title:'Support foundation',detail:value.setting==='disrupted'?'Power · maintenance · recovery rehearsal':'Power · maintenance · responsible owners'}
 ];
 const questions=[
  'Which system versions and approved public references apply?',
  value.mission==='fires'?'Who owns the fires and radar systems, and which interfaces still need authoritative validation?':'Which staff or system owner approves the learning outcome?',
  value.setting==='single'?'What separates a local network fault from an application fault?':'Which synthetic service loss would affect the other locations?',
  value.priority==='access'?'Can a simulated user reach the application but still fail authorization?':value.priority==='continuity'?'What observable evidence would demonstrate recovery?':'What observable user action proves the service is usable?'
 ];
 return {equipment,services,questions,emphasis,systemIds:systems,summary:`${value.echelon[0].toUpperCase()+value.echelon.slice(1)} · ${value.setting==='single'?'One training location':value.setting==='distributed'?'Multiple fictional locations':'Disrupted-service exercise'}`,limitations:['Equipment is a research shortlist, not an allocation or purchase recommendation.','Diagram links show generic learning dependencies, not documented equipment interfaces.','Versions, interfaces, quantities and real-world suitability remain unverified.']};
}
