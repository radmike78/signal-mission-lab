/** Guided first-choice checks; never an operator qualification or secure exam. */
import content from '../../data/stt-node-course.json' with {type:'json'};
export const sttCourse=content;
export type CourseAnswers=Record<string,number>;
export function courseSummary(answers:CourseAnswers){
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||Object.keys(answers).length>content.modules.length)throw Error('Use supplied course choices.');
 for(const [id,choice] of Object.entries(answers)){
  const module=content.modules.find(m=>m.id===id);
  if(!module||!Number.isInteger(choice)||choice<0||choice>=module.checkpoint.options.length)throw Error('Use supplied course choices.');
 }
 return {answered:Object.keys(answers).length,score:content.modules.filter(m=>Object.hasOwn(answers,m.id)&&answers[m.id]===m.checkpoint.answer).length,total:content.modules.length,complete:Object.keys(answers).length===content.modules.length};
}
export function recordCourseAnswer(answers:CourseAnswers,id:string,choice:number):CourseAnswers{
 courseSummary(answers);
 if(Object.hasOwn(answers,id))throw Error('The first choice is already recorded. Reset to start another attempt.');
 const next={...answers,[id]:choice};courseSummary(next);return next;
}
export function escapeCourseText(text:string){return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function instructorCoursePacket(answers:CourseAnswers){
 const summary=courseSummary(answers),esc=escapeCourseText;
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${esc(content.title)} — instructor packet</title><style>body{font:18px/1.55 system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#172219}h1,h2,h3{line-height:1.2}section{margin:2rem 0;border-top:1px solid #b6beb8;padding-top:1rem}a{color:#135b35}li{margin:.5rem 0}@media print{body{font-size:12pt}section{break-inside:avoid}a{color:inherit}}</style><h1>${esc(content.title)}</h1><p>${esc(content.scope)}</p><p>Instructor discussion packet. Includes answers; this is transparent formative practice, not a protected examination. Browser Print can save a paper/PDF copy. No script or external asset is required.</p><p>${summary.complete?'Guided first-choice result: '+summary.score+'/'+summary.total+'.':'Preview packet: guided checks are not all complete.'} This is editable and self-reported. It does not verify practical performance or an instructor observation.</p>${content.modules.map((m,i)=>`<section><h2>${i+1}. ${esc(m.title)}</h2><p><strong>Outcome:</strong> ${esc(m.outcome)}</p><p>${esc(m.explain)}</p><p><strong>Why:</strong> ${esc(m.why)}</p><p><strong>Failure and impact:</strong> ${esc(m.failure)}</p><ol>${m.checks.map(c=>`<li>${esc(c)}</li>`).join('')}</ol><h3>Fictional check</h3><p>${esc(m.scenario)}</p><p>${esc(m.checkpoint.question)}</p><ol>${m.checkpoint.options.map((o,n)=>`<li>${esc(o.label)}${n===m.checkpoint.answer?' — supported choice':''}<p>${esc(o.feedback)}</p></li>`).join('')}</ol><p><strong>Discuss:</strong> ${esc(m.discussion)}</p></section>`).join('')}<section><h2>Capstone lanes</h2><p>Start each lane separately. Its action trail and four-part rubric are separate from guided course checks. No capstone result or instructor approval is inferred from this packet.</p>${content.capstones.map(c=>`<h3>${esc(c.lane_id)}: ${esc(c.title)}</h3><p>${esc(c.task)}</p>`).join('')}<h3>Instructor observation criteria</h3><ul>${content.instructor_criteria.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></section><section><h2>References and evidence limits</h2>${content.sources.map(s=>`<h3><a href="${esc(s.url)}">${esc(s.title)}</a></h3><p>${esc(s.claim)}</p><p>${esc(s.locator)} · ${s.status==='page_content_checked'?'Public page content checked':'Search excerpt checked; direct page access returned 403'} · ${esc(s.published)} · Checked ${esc(s.retrieved)}</p><p>${esc(s.scope)}</p>`).join('')}<h3>References still needed</h3><ul>${content.manual_gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></section></html>`;
}
