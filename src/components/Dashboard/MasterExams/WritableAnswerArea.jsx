/* eslint-disable react/prop-types */

export function GraphAnswerArea({ height = 156 }) {
  return (
    <div
      className="w-full border border-slate-300 bg-white"
      style={{
        height: `${height}px`,
        backgroundImage: [
          'linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)',
          'linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '20px 20px, 20px 20px, 4px 4px, 4px 4px',
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
      }}
    />
  );
}

function LinedAnswerArea({ lines = 4 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <div key={index} className="h-6 border-b border-slate-300/90" />
      ))}
    </div>
  );
}

function BlankAnswerArea({ height = 120 }) {
  return <div className="w-full border border-slate-300 bg-white" style={{ height: `${height}px` }} />;
}

function BoxedAnswerArea({ height = 120 }) {
  return <div className="w-full border border-slate-400 bg-white" style={{ height: `${height}px` }} />;
}

function StepsAnswerArea({ lines = 5 }) {
  return (
    <div className="border border-slate-300 bg-white">
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <div key={index} className="flex h-8 items-stretch">
          <div className="w-8 shrink-0 border-r border-slate-200" />
          <div className="flex-1 border-b border-slate-300/90" />
        </div>
      ))}
    </div>
  );
}

export default function WritableAnswerArea({ answerArea }) {
  if (!answerArea || answerArea.mode === 'none') return null;

  return (
    <div className="mt-3">
      {answerArea.mode === 'lined' ? <LinedAnswerArea lines={answerArea.lines} /> : null}
      {answerArea.mode === 'steps' ? <StepsAnswerArea lines={answerArea.lines} /> : null}
      {answerArea.mode === 'graph' ? <GraphAnswerArea height={answerArea.height} /> : null}
      {answerArea.mode === 'blank' ? <BlankAnswerArea height={answerArea.height} /> : null}
      {answerArea.mode === 'boxed' ? <BoxedAnswerArea height={answerArea.height} /> : null}
    </div>
  );
}
