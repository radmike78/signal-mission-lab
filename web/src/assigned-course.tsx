import React, {useEffect, useRef, useState} from 'react';

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

const stages = ['Brief', 'Practice', 'Review'] as const;

export function AssignedCourse({busy, load, save, onError}: Props) {
  const [lesson, setLesson] = useState<CourseLesson>();
  const [stage, setStage] = useState<typeof stages[number]>('Brief');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CourseResult>();
  const [working, setWorking] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const loaded = Boolean(lesson);

  useEffect(() => {
    if (loaded) heading.current?.focus();
  }, [loaded, stage, index]);

  async function run(fn: () => Promise<void>) {
    setWorking(true);
    try {await fn();} catch (error) {onError(error);} finally {setWorking(false);}
  }

  const disabled = busy || working;
  if (!lesson) return <button className="primary-button" disabled={disabled} onClick={() => void run(async () => setLesson(await load()))}>Start course</button>;

  const question = lesson.questions[index];
  const last = index === lesson.questions.length - 1;

  return <>
    <ol className="course-stages" aria-label="Course stages">
      {stages.map(name => <li key={name} aria-current={stage === name ? 'step' : undefined}>{name}</li>)}
    </ol>
    {stage === 'Brief' && <>
      <h4 ref={heading} tabIndex={-1}>The problem</h4>
      <p>{lesson.context}</p>
      <div className="course-takeaway">
        <h5>Key learning</h5>
        <p>{lesson.objective}</p>
      </div>
      <div className="course-actions">
        <button className="primary-button" disabled={disabled} onClick={() => setStage('Practice')}>Start practice</button>
      </div>
      <details>
        <summary>Equipment and training setup</summary>
        <ul>{lesson.equipment.map(item => <li key={item}>{item}</li>)}</ul>
        <ol>{lesson.setup.map(step => <li key={step}>{step}</li>)}</ol>
      </details>
    </>}
    {stage === 'Practice' && <>
      <h4 ref={heading} tabIndex={-1}>Decision {index + 1} of {lesson.questions.length}</h4>
      <details className="course-evidence">
        <summary>What the Soldier observes</summary>
        <ul>{lesson.scenario.map(item => <li key={item}>{item}</li>)}</ul>
      </details>
      <fieldset key={question.id} disabled={disabled}>
        <legend>{question.prompt}</legend>
        {question.options.map((option, value) => <label className="course-choice" key={option}>
          <input type="radio" name={'course-' + question.id} checked={answers[question.id] === value}
            onChange={() => setAnswers(previous => ({...previous, [question.id]: value}))}/>{option}
        </label>)}
      </fieldset>
      <div className="course-actions">
        <button type="button" disabled={disabled} onClick={() => {
          if (index === 0) setStage('Brief');
          else setIndex(index - 1);
        }}>{index === 0 ? 'Back to brief' : 'Previous decision'}</button>
        <button className="primary-button" disabled={answers[question.id] === undefined || disabled} onClick={() => {
          if (last) void run(async () => {
            setResult(await save(answers));
            setStage('Review');
          });
          else setIndex(index + 1);
        }}>{last ? 'Submit course result' : 'Next decision'}</button>
      </div>
    </>}
    {stage === 'Review' && result && <>
      <h4 ref={heading} tabIndex={-1}>Course completed. Score: {result.score}/{result.total}</h4>
      <div className="course-takeaway">
        <h5>Key takeaway</h5>
        <p>{lesson.lesson}</p>
      </div>
      <ol className="course-review">
        {result.feedback.review.map(item => <li key={item.id}>
          <strong>{item.supported ? 'Supported' : 'Review this decision'}</strong>
          <p>{item.explanation}</p>
        </li>)}
      </ol>
      <button disabled={disabled} onClick={() => {
        setResult(undefined);
        setIndex(0);
        setAnswers({});
        setStage('Brief');
      }}>Try the course again</button>
    </>}
    {stage !== 'Practice' && <details>
      <summary>Sources and training limits</summary>
      <p>This exercise is for practice. The score does not establish qualification.</p>
      <ul>{lesson.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
    </details>}
  </>;
}
