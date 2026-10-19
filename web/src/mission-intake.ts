/** Local, bounded language matching for fictional training. Not an LLM or a DLP system. */
import type {Answers,Mission,Echelon,Setting,Priority} from './mission-model';
export type Draft=Partial<Answers>;
export type Field=keyof Answers;
export type Intake={answers:Draft;ambiguous:Field[]};
export function screenDescription(text:string):string|null{
 const value=text.normalize('NFKC');
 if(value.length<12||value.length>1200)return 'Use between 12 and 1,200 characters to describe a fictional training outcome.';
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u202a-\u202e\u2066-\u2069]/u.test(value))return 'Remove control or hidden formatting characters.';
 const restricted=[/\b(?:CUI|COMSEC|SIPR(?:NET)?|JWICS|TOP\s*SECRET|SECRET|CONFIDENTIAL|NOFORN|FOUO|OPORD)\b/i,/\b(?:password|passwd|api[_ -]?key|private[_ -]?key|bearer|credential)\b/i,/\b(?:\d{1,3}\.){3}\d{1,3}\b/,/\b(?:[a-f\d]{1,4}:){2,}[a-f\d:]*\b/i,/\b\d+(?:\.\d+)?\s*(?:MHz|GHz|kHz)\b/i,/[+-]?\d{1,3}\.\d{3,}\s*[,/]\s*[+-]?\d{1,3}\.\d{3,}/,/\b\d{1,2}[C-HJ-NP-X]\s*[A-HJ-NP-Z]{2}\s*\d{4,10}\b/i,/\b(?:actual|real|live)\s+(?:operational\s+)?(?:mission|operation|network|deployment|unit)\b/i,/\b(?:ignore\s+(?:all\s+)?(?:previous|prior|system)|system\s*prompt|bypass\s+(?:rules|safeguards))\b/i,/https?:\/\//i];
 return restricted.some(pattern=>pattern.test(value))?'This may contain sensitive details or unsupported instructions. The text was cleared. Use a fictional outcome without unit identifiers, operational plans, addresses, frequencies, credentials or controlled material.':null;
}
function positive(text:string,expression:RegExp):boolean{
 for(const match of text.matchAll(new RegExp(expression.source,'gi'))){
  const before=text.slice(Math.max(0,match.index!-45),match.index);
  if(!/\b(?:no|not|without|excluding|exclude|don['’]t|do not)\b[^,.;!?]{0,32}$/i.test(before))return true;
 }
 return false;
}
export function interpretDescription(text:string):Intake{
 const issue=screenDescription(text);if(issue)throw Error(issue);
 const value=text.normalize('NFKC');const answers:Draft={};const ambiguous:Field[]=[];
 const systems=[['afatds',/\bAFATDS\b/],['q53',/\b(?:AN[\s/-]*)?(?:TPQ|Q)[\s-]*53\b/],['dcgsa',/\bDCGS[\s-]*A\b/],['cpce',/\bCPCE\b/],['radio',/\b(?:radios?|voice communication)\b/]].filter(([,pattern])=>positive(value,pattern as RegExp)).map(([id])=>id as string);
 const additional:[string,RegExp][]=[
 ['wint-inc1',/\bWIN[ -]?T\s*(?:Increment|Inc[ .]*)\s*1\b/],['wint-inc2',/\bWIN[ -]?T\s*(?:Increment|Inc[ .]*)\s*2\b/],
 ['jnn',/\bJNN\b/],['cpn',/\b(?:BnCPN|CPN)\b/],['tcn',/\bTCN\b/],['thn',/\bTHN\b/],['rhn',/\bRHN\b/],['pop',/\bpoint of presence\b/],['sne',/\bSNE\b/],
 ['gait',/\bGAIT\b/],['pacstar',/\bPacStar\b/],['iq-core',/\bIQ[ -]?Core\b/],
 ['stt',/\bSTT\b/],['trilos',/\bTRILOS\b/],['hclos',/\bHCLOS\b/],['t2c2',/\bT2C2\b/],['smart-t',/\bSMART[ -]?T\b/],['snap',/\bSNAP\b/],['dket',/\bDKET\b/],['snn',/\bSNN\b/],
 ['ngtt',/\bNGTT\b/],['ngc2',/\bNGC2\b/],['scout',/\bSCOUT[ -]Medium\b/],['itn',/\bITN\b/],['nett-warrior',/\bNett Warrior\b/],['sincgars',/\bSINCGARS\b/],['tsi',/\bTSI(?:v[23])?\b/],
 ...(['117','150','152','158','160','162','163'] as const).map(n=>['prc'+n,new RegExp('\\b(?:AN[ /-]*)?PRC[ -]*'+n+'\\b','i')] as [string,RegExp])
 ];
 for(const [id,pattern] of additional)if(positive(value,pattern)&&!systems.includes(id))systems.push(id);
 if(systems.length>12)throw Error('Describe up to 12 systems in one training mission.');
 if(systems.length)answers.systems=systems;
 const domains:Mission[]=[];
 if(systems.includes('afatds')||systems.includes('q53')||positive(value,/\b(?:artillery|fires|radar)\b/))domains.push('fires');
 if(systems.includes('dcgsa')||positive(value,/\b(?:intelligence|intel)\b/))domains.push('intelligence');
 if(!domains.length&&(systems.includes('cpce')||systems.includes('radio')||positive(value,/\b(?:command post|headquarters|staff communications)\b/)))domains.push('command');
 if(domains.length===1)answers.mission=domains[0];else if(domains.length>1)ambiguous.push('mission');
 const levelPatterns:Record<Echelon,RegExp>={battalion:/\b(?:battalions?|bn)\b/,brigade:/\b(?:brigades?|bde)\b/,division:/\b(?:divisions?|div)\b/};
 const levels=(Object.keys(levelPatterns) as Echelon[]).filter(level=>positive(value,levelPatterns[level]));
 if(levels.length===1)answers.echelon=levels[0];else if(levels.length>1)ambiguous.push('echelon');
 const locations:Setting[]=[];
 if(positive(value,/\b(?:one|single)\s+(?:training\s+|fictional\s+)?(?:site|location|command post)\b/))locations.push('single');
 if(positive(value,/\b(?:multiple|several|distributed|two|three)\s+(?:fictional\s+|training\s+)?(?:sites|locations|command posts)\b|\bacross sites\b/))locations.push('distributed');
 if(locations.length===1)answers.setting=locations[0];else if(locations.length>1)ambiguous.push('setting');
 else if(positive(value,/\b(?:degraded|interrupted|disruption|simulated outage)\b/))answers.setting='disrupted';
 const priorities:Priority[]=[];
 if(positive(value,/\b(?:availability|uptime|keep services (?:usable|available)|service health)\b/))priorities.push('availability');
 if(positive(value,/\b(?:identity|authorization|authentication|login|sign[ -]?in|user access)\b/))priorities.push('access');
 if(positive(value,/\b(?:recover(?:y)?|restore|restoration|continuity|failover|fallback|outages?)\b/))priorities.push('continuity');
 if(priorities.length===1)answers.priority=priorities[0];else if(priorities.length>1)ambiguous.push('priority');
 return {answers,ambiguous};
}
export function nextClarification(answers:Draft):number{
 if(!answers.mission)return 6;
 if(!answers.echelon)return 1;
 if(!answers.systems?.length)return 2;
 if(!answers.setting)return 3;
 if(!answers.priority)return 4;
 return 5;
}
