import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

/**
 * 4-step workspace stepper: Import Sources → Question Library → Question Paper Workspace → Paper Builder & Preview
 */
export default function WorkspaceStepper({ step, onChange, sourcesCount, questionsCount, addedMarks, totalMarks }) {
  const steps = [
    { id: 'import', label: 'Import Sources', sub: `${sourcesCount || 0} sources` },
    { id: 'library', label: 'Question Library', sub: `${questionsCount || 0} questions` },
    { id: 'workspace', label: 'Question Paper Workspace', sub: `${addedMarks || 0} marks` },
    { id: 'builder', label: 'Paper Builder & Preview', sub: 'Settings & preview' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between overflow-x-auto pb-1 mt-1 sm:mt-0">
        {steps.map((s, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => onChange(s.id)}
                className={`relative flex flex-1 items-center justify-center lg:justify-start gap-3 pb-3 pt-2 px-2 transition-colors ${
                  isActive ? 'border-b-[3px] border-accent' : 'border-b-[3px] border-transparent hover:border-slate-300'
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted || isActive ? 'bg-accent text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : (index + 1)}
                </div>
                
                <div className="flex flex-col text-left">
                  <span className={`text-[15px] font-semibold whitespace-nowrap ${
                    isActive ? 'text-slate-900' : 'text-slate-700'
                  }`}>
                    {s.label}
                  </span>
                  <span className={`text-[13px] font-medium whitespace-nowrap ${
                    isActive ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {s.sub}
                  </span>
                </div>
              </button>

              {index < steps.length - 1 && (
                <div className="flex shrink-0 items-center px-1 lg:px-4">
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
