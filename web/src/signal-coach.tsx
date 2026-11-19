import React, {useEffect, useRef, useState} from 'react';
import {technicalLabs as content} from './technical-lab-model';
import {confirmOCR, requireOCRReview, screenDocumentText, type PlanningDocument} from './document-plan-model';
import {localCoachReply, localRecognition, readLocally} from './coach-device';
import {nativeApp} from './runtime';

const labs = content.labs.filter(lab => !lab.id.startsWith('taclane'));
const modes = ['Installation', 'Configuration', 'Troubleshooting'] as const;
type Mode = typeof modes[number];
type Turn = { question: string; reply: string; generated: boolean; evidence?: string };

function guidedReply(lab: typeof labs[number], mode: Mode, evidence: boolean) {
  const guidance = {
    Installation: 'Identify the lab platform and version. Check prerequisites and write down the expected result and rollback before installing anything.',
    Configuration: 'Compare one observed value with the provided lab baseline. Explain the difference before changing a setting.',
    Troubleshooting: 'Start with one read-only observation. Which result would distinguish the first failed dependency from a downstream symptom?',
  };
  return [evidence ? 'Treat the selected excerpt as an observation to verify against the fictional lab.' : '', guidance[mode], lab.concepts[0], lab.objective].filter(Boolean).join(' ');
}

export function SignalCoach() {
  const [labId, setLabId] = useState('dns');
  const [mode, setMode] = useState<Mode>('Troubleshooting');
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [generative, setGenerative] = useState(false);
  const [attested, setAttested] = useState(false);
  const [scan, setScan] = useState(false);
  const [doc, setDoc] = useState<PlanningDocument | null>(null);
  const [passage, setPassage] = useState('');
  const [edits, setEdits] = useState<string[]>([]);
  const [review, setReview] = useState<boolean[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [mic, setMic] = useState<'idle'|'checking'|'listening'|'finishing'>('idle');
  const work = useRef<AbortController | null>(null);
  const voiceAttempt = useRef<AbortController | null>(null);
  const recognition = useRef<Awaited<ReturnType<typeof localRecognition>>>(null);
  const lab = labs.find(item => item.id === labId)!;

  function stopDeviceWork() {
    work.current?.abort();
    voiceAttempt.current?.abort();
    recognition.current?.abort();
    work.current = null;
    voiceAttempt.current = null;
    recognition.current = null;
    window.speechSynthesis?.cancel();
  }
  useEffect(() => stopDeviceWork, []);

  function clear() {
    stopDeviceWork();
    setMic('idle');
    setBusy(false);
    setTurns([]);
    setQuestion('');
    setDoc(null);
    setPassage('');
    setEdits([]);
    setReview([]);
    setAttested(false);
    setScan(false);
    setStatus('Session cleared.');
  }

  async function listen() {
    const attempt = new AbortController();
    voiceAttempt.current = attempt;
    setMic('checking');
    setStatus('');
    function finish(message?: string) {
      if (attempt.signal.aborted) return;
      recognition.current = null;
      voiceAttempt.current = null;
      setMic('idle');
      if (message) setStatus(message);
    }
    try {
      const local = await localRecognition();
      if (attempt.signal.aborted) return;
      if (!local) return finish('On-device English speech recognition is unavailable. Type your question instead.');
      recognition.current = local;
      local.onresult = event => {
        if (attempt.signal.aborted) return;
        setQuestion((event.results[0]?.[0]?.transcript ?? '').slice(0, 1200));
        setStatus('Review the transcript before asking.');
      };
      local.onend = () => finish();
      local.onerror = () => finish('Microphone input failed. Check browser permission or type your question.');
      window.speechSynthesis?.cancel();
      local.start();
      setMic('listening');
    } catch {
      finish('On-device microphone input is unavailable. Type your question instead.');
    }
  }

  async function attach(file: File) {
    if (!attested || work.current) return;
    const task = new AbortController();
    work.current = task;
    setBusy(true);
    setDoc(null);
    setPassage('');
    setEdits([]);
    setReview([]);
    setTurns(previous => previous.filter(turn => !turn.evidence));
    setStatus('Reading attachment on this device…');
    try {
      const {importDocument} = await import('./document-import');
      const image = /\.(png|jpe?g)$/i.test(file.name);
      const result = await importDocument(file, task.signal, {
        ocr: image || (scan && /\.pdf$/i.test(file.name)),
        progress: message => {if (!task.signal.aborted) setStatus(message);},
      });
      if (task.signal.aborted) return;
      setDoc(result);
      setEdits(result.ocr?.pages.map(page => page.text) ?? []);
      setReview(result.ocr?.pages.map(() => false) ?? []);
      setStatus(result.ocr ? 'Review every page before selecting an excerpt.' : 'Choose an excerpt to discuss.');
    } catch {
      if (!task.signal.aborted) setStatus('Could not import this file. Check the format, size and fictional-training content.');
    } finally {
      if (work.current === task) {work.current = null; setBusy(false);}
    }
  }

  function acceptTranscription() {
    if (!doc) return;
    try {
      setDoc(confirmOCR(doc, edits, review));
      setEdits([]);
      setReview([]);
      setStatus('Transcription confirmed. Choose an excerpt to discuss.');
    } catch {
      setStatus('Review each page and check the corrected text for restricted content.');
    }
  }

  async function ask(event: React.FormEvent) {
    event.preventDefault();
    const draft = question.normalize('NFKC').trim();
    if (!draft || draft.length > 1200 || !attested || work.current || mic !== 'idle') return;
    let selected;
    try {
      screenDocumentText('Fictional IT practice question: ' + draft);
      if (doc) requireOCRReview(doc);
      selected = doc && passage !== '' ? doc.blocks[Number(passage)] : null;
    } catch {
      setStatus('Use fictional material without restricted details and finish any pending transcription review.');
      return;
    }
    const task = new AbortController();
    work.current = task;
    setBusy(true);
    setStatus(generative ? 'Checking for an installed browser model…' : '');
    const timeout = window.setTimeout(() => task.abort(), 20_000);
    const cancelled = new Promise<null>(resolve => task.signal.addEventListener('abort', () => resolve(null), {once: true}));
    let reply: string | null = null;
    try {
      if (generative) {
        reply = await Promise.race([cancelled, localCoachReply({
          topic: lab.title, mode, concepts: lab.concepts, objective: lab.objective,
          recentQuestions: turns.slice(-2).filter(turn => !turn.evidence).map(turn => turn.question),
          question: draft, observation: selected?.text.slice(0, 1200),
        }, task.signal)]);
      }
    } catch {
      // Failed or timed-out local inference still leaves the lesson available.
    } finally {
      window.clearTimeout(timeout);
      if (work.current === task) {
        work.current = null;
        setBusy(false);
        setTurns(previous => [...previous.slice(-9), {
          question: draft, reply: reply || guidedReply(lab, mode, !!selected),
          generated: !!reply, evidence: selected?.locator,
        }]);
        setQuestion('');
        setStatus(generative && !reply ? 'Installed AI was unavailable or did not respond. Showing lesson guidance.' : '');
      }
    }
  }

  const awaitingReview = !!doc?.ocr && !doc.ocr.reviewed;
  const selectedPassage = doc && passage !== '' ? doc.blocks[Number(passage)] : null;
  const sources = content.sources.filter(source => lab.sources.includes(source.id));
  return <section className="signal-coach" aria-labelledby="signal-coach-title">
    <h2 id="signal-coach-title">Signal Coach</h2>
    <p>Talk through installation, configuration and troubleshooting in fictional IT labs.</p>
    <label className="toggle"><input type="checkbox" checked={attested} onChange={event => event.target.checked ? setAttested(true) : clear()}/>I’m using fictional training material only.</label>
    <label>Lab topic<select disabled={busy} value={labId} onChange={event => {setLabId(event.target.value); setTurns([]); window.speechSynthesis?.cancel();}}>
      {labs.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select></label>
    <label>Practice goal<select disabled={busy} value={mode} onChange={event => setMode(event.target.value as Mode)}>
      {modes.map(item => <option key={item}>{item}</option>)}
    </select></label>
    <label className="toggle"><input type="checkbox" checked={generative} disabled={busy} onChange={event => setGenerative(event.target.checked)}/>Use experimental on-device AI when installed</label>
    <p>Voice input and AI depend on installed browser capabilities. You can also type your question. Use lesson references to check generated explanations.</p>
    <details open={doc ? true : undefined}><summary>Discuss a training file or photo</summary>
      <p>TXT, MD, DOCX, PDF, PNG or JPEG, up to 5 MB. Photos provide printed text through OCR.</p>
      <label className="toggle"><input type="checkbox" disabled={busy} checked={scan} onChange={event => setScan(event.target.checked)}/>Use OCR for scanned PDFs (up to three pages)</label>
      <label>Training attachment<input type="file" accept=".txt,.md,.docx,.pdf,.png,.jpg,.jpeg" disabled={!attested || busy || mic !== 'idle'} onChange={event => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';
        if (file) void attach(file);
      }}/></label>
      {awaitingReview && doc.ocr?.pages.map((page, index) => <fieldset key={page.page}>
        <legend>Review OCR page {page.page}</legend>
        <img className="coach-scan" src={page.preview} alt={'Original scan of page ' + page.page}/>
        <label>Transcription for page {page.page}<textarea value={edits[index]} maxLength={10000} onChange={event => {
          const value = event.target.value;
          setEdits(previous => previous.map((item, i) => i === index ? value : item));
          setReview(previous => previous.map((item, i) => i === index ? false : item));
        }}/></label>
        <label className="toggle"><input type="checkbox" checked={review[index]} onChange={event => {
          const checked = event.target.checked;
          setReview(previous => previous.map((item, i) => i === index ? checked : item));
        }}/>I compared this transcription with the original.</label>
      </fieldset>)}
      {awaitingReview && <button disabled={!review.every(Boolean)} onClick={acceptTranscription}>Confirm transcription</button>}
      {doc && !awaitingReview && <label>Excerpt to include with your question<select value={passage} disabled={busy} onChange={event => setPassage(event.target.value)}>
        <option value="">No excerpt</option>
        {doc.blocks.map((block, index) => <option key={block.locator} value={index}>{block.locator} · {block.text.slice(0, 72)}</option>)}
      </select></label>}
      {selectedPassage && <blockquote>{selectedPassage.text.slice(0, 1200)}</blockquote>}
      {doc && <button disabled={busy} onClick={() => {setDoc(null); setPassage(''); setEdits([]); setReview([]); setTurns(previous => previous.filter(turn => !turn.evidence)); setStatus('Attachment removed.');}}>Remove attachment</button>}
    </details>
    <div role="log" aria-label="Coach conversation">{turns.map((turn, index) => <article key={index}>
      <p><strong>You</strong> · {turn.question}</p>
      {turn.evidence && <p>Attachment excerpt: {turn.evidence}</p>}
      <p><strong>{turn.generated ? 'Signal Coach · On-device AI' : 'Signal Coach · Lesson guidance'}</strong></p>
      <p className="coach-reply">{turn.reply}</p>
      <button onClick={() => {if (!readLocally(turn.reply)) setStatus('No installed English speaking voice is available.');}} disabled={mic !== 'idle'}>Read reply aloud</button>
    </article>)}</div>
    <form onSubmit={ask}>
      <label>Your question<textarea value={question} maxLength={1200} disabled={busy || mic !== 'idle'} onChange={event => setQuestion(event.target.value)} placeholder="What should I check if the application works by IP but fails by name?"/></label>
      <div className="coach-actions">
        <button type="submit" disabled={!attested || !question.trim() || awaitingReview || mic !== 'idle' || busy}>Ask Signal Coach</button>
        {!nativeApp && <button type="button" disabled={!attested || busy || mic === 'checking' || mic === 'finishing'} onClick={() => {
          if (mic === 'listening') {setMic('finishing'); recognition.current?.stop();}
          else void listen();
        }}>{mic === 'listening' ? 'Finish speaking' : mic === 'finishing' ? 'Transcribing…' : 'Speak question'}</button>}
        <button type="button" onClick={() => window.speechSynthesis?.cancel()}>Stop audio</button>
        <button type="button" onClick={clear}>Clear coach session</button>
      </div>
    </form>
    <p role="status">{mic === 'listening' ? 'Listening on this device…' : status}</p>
    <details><summary>References for the selected lesson</summary><ul>{sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> · {source.scope}</li>)}</ul></details>
    <p>Conversation and attachments are kept in this tab’s memory and cleared when you leave the coach.</p>
  </section>;
}
