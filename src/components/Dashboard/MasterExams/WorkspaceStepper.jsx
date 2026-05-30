import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

/**
 * 4-step workspace stepper: Import Sources → Question Library → Question Paper Workspace → Paper Builder & Preview
 */
export default function WorkspaceStepper({ step, onChange, sourcesCount, questionsCount, addedMarks, totalMarks }) {
  const steps = [
    { id: 'import', label: 'Import Sources', sub: `${sourcesCount || 0} sources` },
    { id: 'library', label: 'Question Library', sub: `${questionsCount || 0} questions` },
    { id: 'workspace', label: 'Question Paper Workspace', sub: `${addedMarks || 0}/${totalMarks || 100} marks` },
    { id: 'builder', label: 'Paper Builder & Preview', sub: 'Settings & preview' },
  ];
  const idx = steps.findIndex((s) => s.id === step);

  return (
    <div className="ws-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <button
            type="button"
            className={`ws-stepper__item ${step === s.id ? 'ws-stepper__item--active' : ''} ${i < idx ? 'ws-stepper__item--done' : ''}`}
            onClick={() => onChange(s.id)}
          >
            <span className="ws-stepper__num">
              {i < idx ? <Check size={12} /> : i + 1}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span>{s.label}</span>
              <span style={{ fontSize: 11, color: 'var(--ws-ink-400)', fontWeight: 500 }}>{s.sub}</span>
            </span>
          </button>
          {i < steps.length - 1 && (
            <span className="ws-stepper__chev">
              <ChevronRight size={14} />
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
