import React, {useState} from 'react';

export const missionCourseId = 'mission-report-v1';
export const missionCourseTitle = 'Mission Command: Restore access to a staff report';
export type CourseLesson = {
  context: string;
  objective: string;
  equipment: string[];
  setup: string[];
  lesson: string;
  scenario: string[];
  sources: {title: string; url: string}[];
  questions: {id: string; prompt: string; options: string[]}[];
};
export type CourseResult = {
  score: number;
  total: number;
  feedback: {review: {id: string; supported: boolean; explanation: string}[]};
};

type Props = {
  busy: boolean;
  load: () => Promise<CourseLesson>;
  save: (answers: Record<string, number>) => Promise<CourseResult>;
  onError: (error: unknown) => void;
};

export function AssignedCourse({busy, load, save, onError}: Props) {
  const [lesson, setLesson] = useState<CourseLesson>();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number>();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CourseResult>();
  const [working, setWorking] = useState(false);

  async function run(fn: () => Promise<void>) {
    setWorking(true);
    try {await fn();} catch (error) {onError(error);} finally {setWorking(false);}
  }

  if (!lesson) return <button disabled={busy || working} onClick={() => void run(async () => setLesson(await load()))}>Start course</button>;
  const question = lesson.questions[index];
  const last = index === lesson.questions.length - 1;

  return <>
    <p>{lesson.context}</p>
    <p><strong>Objective:</strong> {lesson.objective}</p>
    <details><summary>Equipment and training setup</summary>
      <ul>{lesson.equipment.map(item => <li key={item}>{item}</li>)}</ul>
      <ol>{lesson.setup.map(step => <li key={step}>{step}</li>)}</ol>
    </details>
    <p>{lesson.lesson}</p>
    <h4>What the Soldier observes</h4>
    <ul>{lesson.scenario.map(item => <li key={item}>{item}</li>)}</ul>
    {result ? <>
      <h4 role="status">Course completed. Score: {result.score}/{result.total}</h4>
      <ol>{result.feedback.review.map(item => <li key={item.id}>{item.supported ? 'Supported. ' : 'Review. '}{item.explanation}</li>)}</ol>
      <button disabled={busy || working} onClick={() => {
        setResult(undefined); setIndex(0); setChoice(undefined); setAnswers({});
      }}>Try the course again</button>
    </> : <>
      <p>Decision {index + 1} of {lesson.questions.length}. Each choice is recorded when you continue.</p>
      <fieldset key={question.id} disabled={busy || working}>
        <legend>{question.prompt}</legend>
        {question.options.map((option, value) => <label className="toggle" key={option}>
          <input type="radio" name={'course-' + question.id} checked={choice === value} onChange={() => setChoice(value)}/>{option}
        </label>)}
      </fieldset>
      <button disabled={choice === undefined || busy || working} onClick={() => {
        if (choice === undefined) return;
        const next = {...answers, [question.id]: choice};
        if (last) void run(async () => setResult(await save(next)));
        else {setAnswers(next); setChoice(undefined); setIndex(index + 1);}
      }}>{last ? 'Submit course result' : 'Continue course'}</button>
    </>}
    <details><summary>Sources and training limits</summary>
      <p>The scenarios are formative practice and require technical review before any qualification claim.</p>
      <ul>{lesson.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
    </details>
  </>;
}
