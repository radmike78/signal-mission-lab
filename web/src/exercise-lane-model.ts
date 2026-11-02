/** Deterministic, bounded teaching model. No real equipment commands or network calls. */
import content from '../../data/exercise-lanes.json' with {type:'json'};
export const laneContent=content;
export const MAX_LANE_EVENTS=40;
export const laneActions={
 'inspect-local':{label:'Check local application',group:'Checks',cost:1},
 'inspect-link':{label:'Check link indication',group:'Checks',cost:1},
 'inspect-path':{label:'Test remote path',group:'Checks',cost:1},
 'inspect-feed':{label:'Check remote update freshness',group:'Checks',cost:1},
 'repair-handoff':{label:'Restore modeled handoff',group:'Changes',cost:3},
 'restore-sync':{label:'Restore modeled synchronization',group:'Changes',cost:3},
 'restart-local':{label:'Restart local application',group:'Changes',cost:4},
 'send-report':{label:'Send dummy report',group:'Verify',cost:1},
 'confirm-receipt':{label:'Confirm receipt and readability',group:'Verify',cost:1},
 'brief-remote':{label:'Remote digital reporting is affected; local functions work. No alternate or restoration estimate is verified. Next update follows the checks.',group:'Initial impact',cost:1},
 'brief-all':{label:'All communications are lost.',group:'Initial impact',cost:1},
 'brief-link':{label:'The link is on, so staff reporting is working.',group:'Initial impact',cost:1},
 'handoff-tested':{label:'Recipient receipt and fresh information are confirmed; the tested exchange is restored. Continue monitoring.',group:'Final handoff',cost:1},
 'handoff-light':{label:'The link indication is healthy; declare all services restored.',group:'Final handoff',cost:1},
 'handoff-eta':{label:'Promise restoration in five minutes without further evidence.',group:'Final handoff',cost:1}
} as const;
export type LaneAction=keyof typeof laneActions;
type Trace={index:number;action:LaneAction;label:string;observation:string;minute:number};
export type LaneState={laneId:string;mode:string;handoff:boolean;sync:boolean;sent:boolean;receipt:boolean;fresh:boolean;localSeen:boolean;linkSeen:boolean;pathSeen:boolean|null;feedSeen:string|null;failedExchange:boolean;impact:boolean|null;unsupportedChanges:number;changes:number;finished:boolean;handoffSupported:boolean;minutes:number;trace:Trace[]};
export function initialLane(laneId:string,mode:string):LaneState{
 const lane=content.lanes.find(l=>l.id===laneId);
 if(!lane||!content.modes.some(m=>m.id===mode))throw Error('Choose a supplied exercise lane and environment.');
 return {laneId,mode,handoff:lane.handoff,sync:lane.sync,sent:false,receipt:false,fresh:false,localSeen:false,linkSeen:false,pathSeen:null,feedSeen:null,failedExchange:false,impact:null,unsupportedChanges:0,changes:0,finished:false,handoffSupported:false,minutes:0,trace:[]};
}
function isAction(value:unknown):value is LaneAction{return typeof value==='string'&&Object.hasOwn(laneActions,value);}
/** Always reconstruct from the supplied event log; never accept client-supplied state or scores. */
export function replayLane(laneId:string,mode:string,events:readonly string[]):LaneState{
 if(!Array.isArray(events)||events.length>MAX_LANE_EVENTS||events.some(e=>!isAction(e)))throw Error('Use bounded exercise actions.');
 const s=initialLane(laneId,mode);
 for(const raw of events){
  const action=raw as LaneAction,definition=laneActions[action];
  if(s.finished)throw Error('This lane is finished. Reset before another attempt.');
  let observation='';
  const ready=()=>s.handoff&&s.sync;
  if(action==='inspect-local'){s.localSeen=true;observation='The local application opens and a local dummy record is readable. Remote exchange has not been established by this check.';}
  if(action==='inspect-link'){s.linkSeen=true;observation='The modeled physical link indication is healthy. This does not establish an IP path, remote application or delivery.';}
  if(action==='inspect-path'){s.pathSeen=s.handoff;observation=s.handoff?'The fictional remote path test succeeds. Application synchronization and message delivery require separate checks.':'The fictional remote path test fails despite the physical link indication.';}
  if(action==='inspect-feed'){
   s.feedSeen=!s.handoff?'unreachable':s.sync?'fresh':'stale';s.fresh=ready();
   observation=s.feedSeen==='unreachable'?'The remote update cannot be retrieved. The unavailable path prevents this check from isolating synchronization.':s.feedSeen==='stale'?'The remote path is available, but the application update is stale. Local display availability is not current remote information.':'A new synthetic update is retrieved and its timestamp is current for this model.';
  }
  if(['repair-handoff','restore-sync','restart-local'].includes(action)){
   const supported=action==='repair-handoff'?!s.handoff&&s.pathSeen===false&&s.linkSeen:action==='restore-sync'?!s.sync&&s.pathSeen===true&&s.feedSeen==='stale':false;
   if(!supported)s.unsupportedChanges++;s.changes++;
   if(action==='repair-handoff'){s.handoff=true;observation='The modeled handoff is now available. Other dependencies and user acceptance remain unverified.';}
   if(action==='restore-sync'){s.sync=true;observation='The modeled synchronization setting is restored. Re-run the user exchange; this action alone proves no delivery.';}
   if(action==='restart-local')observation='The local application restarts. Neither remote dependency changed. Previous acceptance evidence must be repeated.';
   s.sent=false;s.receipt=false;s.fresh=false;s.pathSeen=null;s.feedSeen=null;
  }
  if(action==='send-report'){
   s.sent=ready();s.receipt=false;if(!s.sent)s.failedExchange=true;
   observation=s.sent?'The sender accepts the dummy report. Recipient receipt and readability are not yet confirmed.':'The dummy reporting exchange fails. Inspect the path and application dependencies.';
  }
  if(action==='confirm-receipt'){s.receipt=s.sent&&ready();observation=s.receipt?'The fictional recipient confirms receipt and readability of the dummy report.':'No successful recipient confirmation. A working sender or link is insufficient.';}
  if(action.startsWith('brief-')){
   if(s.impact!==null)throw Error('The first initial-impact choice is already recorded.');
   s.impact=action==='brief-remote'&&!ready()&&s.localSeen&&(s.failedExchange||s.feedSeen==='stale'||s.feedSeen==='unreachable');
   observation='Your initial impact statement is recorded. Its evidence support will be reviewed in the debrief.';
  }
  if(action.startsWith('handoff-')){s.finished=true;s.handoffSupported=action==='handoff-tested'&&s.receipt&&s.fresh;observation='Final handoff recorded. Review the decision trail and acceptance evidence below.';}
  s.minutes+=definition.cost;s.trace.push({index:s.trace.length+1,action,label:definition.label,observation,minute:s.minutes});
 }
 return s;
}
export function laneDebrief(laneId:string,mode:string,events:readonly string[]){
 const state=replayLane(laneId,mode,events);
 if(!state.finished)throw Error('Finish the lane before producing a debrief.');
 const rubric=[
  {id:'reasoning',label:'Changes supported by observed fault evidence',passed:state.handoff&&state.sync&&state.changes>0&&state.unsupportedChanges===0,detail:state.unsupportedChanges?'At least one change was unnecessary or made without the relevant observations.':'Observe the link/path before handoff repair; observe a working path and stale update before synchronization repair.'},
  {id:'impact',label:'Initial mission impact stayed within verified scope',passed:state.impact===true,detail:'First choice counts. Establish local availability and a failed exchange or update before reporting a bounded remote-service impact.'},
  {id:'acceptance',label:'Recipient delivery and current information verified after changes',passed:state.receipt&&state.fresh,detail:'After the last change, send the dummy report, confirm recipient receipt/readability and retrieve a current update. Sender success alone is insufficient.'},
  {id:'handoff',label:'Final leader handoff supported by acceptance evidence',passed:state.handoffSupported,detail:'Brief restoration only after the tested exchange and fresh information are confirmed. Do not invent an ETA or extend the result to all services.'}
 ];
 return {schema_version:1,laneId,mode,score:rubric.filter(r=>r.passed).length,total:rubric.length,modeledMinutes:state.minutes,actionCount:state.trace.length,unsupportedChanges:state.unsupportedChanges,rubric,trace:state.trace,scope:content.scope,recordStatus:'Self-reported formative exercise export. Editable and not an authenticated instructor record or equipment qualification.'};
}
