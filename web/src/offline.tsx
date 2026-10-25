import React,{useEffect,useState} from 'react';
import {nativeApp} from './runtime';
let registration:ServiceWorkerRegistration|undefined;
let ready=false;
let failed=false;
const changed=()=>window.dispatchEvent(new Event('sml-offline-state'));
export function startOffline(){
 if(nativeApp||!('serviceWorker' in navigator)||!import.meta.env.PROD)return;
 navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(r=>{
  registration=r;
  const report=()=>{ready=!!r.active;changed();};
  report();void navigator.serviceWorker.ready.then(()=>{ready=true;changed();});
  r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',report);});
 }).catch(()=>{failed=true;changed();});
}
export function OfflinePanel(){
 const [online,setOnline]=useState(navigator.onLine),[,refresh]=useState(0),[message,setMessage]=useState('');
 useEffect(()=>{const network=()=>setOnline(navigator.onLine);const update=()=>refresh(x=>x+1);window.addEventListener('online',network);window.addEventListener('offline',network);window.addEventListener('sml-offline-state',update);return()=>{window.removeEventListener('online',network);window.removeEventListener('offline',network);window.removeEventListener('sml-offline-state',update);};},[]);
 return <section className="quiet-reference"><h2>Learn without a connection</h2><p role="status">{nativeApp?'Lessons and exercises are bundled in this app.':failed?'Offline installation is unavailable. Keep this page open or try again on a supported HTTPS site.':ready?'Offline learning is ready on this browser.':'Preparing offline learning. Your first visit needs a connection on a supported HTTPS site.'}</p><p>{online?'Device reports a connection.':'Device reports no connection.'} External source pages require internet access.</p>{!nativeApp&&<details><summary>Install or update</summary><p>Use your browser’s install or Add to Home Screen option after offline learning is ready. Browser storage can be cleared or evicted; reopen online if the installed copy becomes unavailable.</p><p>Core lessons, mission analysis, diagrams, assessments and synthetic exercises work offline. Instructor services require their web server. The legacy prototype is online-only.</p>{registration?.waiting?<button onClick={()=>{let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading){reloading=true;location.reload();}},{once:true});registration?.waiting?.postMessage({type:'ACTIVATE_UPDATE'});}}>Apply downloaded update</button>:<button disabled={!online||!registration} onClick={()=>{void registration?.update().then(()=>setMessage('Update checked. A new version appears here once downloaded.')).catch(()=>setMessage('Could not check for updates. Try again with a connection.'));}}>Check for an update</button>}<p role="status">{message}</p></details>}<details><summary>What stays on this device?</summary><p>Your last 50 practice results: activity, score, total and time. Clear them from My training. Native apps use device preferences; the website uses browser storage. Results are formative practice, not qualifications, and are not automatically uploaded.</p><p>Mission descriptions and access credentials are not saved in this history. Device backups may include preferences according to operating-system settings. Browser storage follows your browser’s controls.</p></details><details><summary>Privacy and support</summary><p>The offline mobile edition has no account, ads, analytics or external AI service. Public reference links open only when selected. Do not enter classified information, CUI, COMSEC or operational plans.</p><p>If you use the instructor website, it saves account and assigned-activity data on that service. Your device practice history stays separate.</p><p>For support, use the developer contact on the app store listing.</p></details></section>;
}
