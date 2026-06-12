import React from 'react';

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

  return (
    <div className="w-full">
      <div className="flex-1 mt-1 sm:mt-0 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 max-w-full">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`relative -mb-px px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex-1 sm:flex-none
                ${step === s.id
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <div className="flex flex-col items-center sm:items-start text-left">
                <span className="block truncate max-w-[200px]">{s.label}</span>
                <span className={`text-[11px] mt-0.5 ${step === s.id ? 'text-accent/80' : 'text-gray-400'}`}>
                  {s.sub}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
