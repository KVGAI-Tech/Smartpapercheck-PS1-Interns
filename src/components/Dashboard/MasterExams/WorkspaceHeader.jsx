/* eslint-disable react/prop-types */
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Workspace header: eyebrow, paper title, meta sub-line, navigation buttons.
 */
export default function WorkspaceHeader({ paper, courseContext, step, onBack, onContinue, draftStatus }) {
  const title = paper?.title || 'Untitled Paper';
  const code = courseContext?.code || '';
  const subject = paper?.subject || courseContext?.name || '';
  const duration = paper?.duration || '3 Hours';
  const totalMarks = paper?.totalMarks || 100;

  return (
    <div className="ws-header">
      <div className="ws-header__title">
        <h1 className="ws-header__h1">
          {title}
        </h1>
        <div className="ws-header__sub">
          {[code, duration, `${totalMarks} Marks`].filter(Boolean).join(' • ')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {step !== 'import' && (
          <button type="button" className="ws-btn" onClick={onBack}>
            <ArrowLeft size={16} />Back
          </button>
        )}
        {step !== 'builder' && (
          <button type="button" className="ws-btn ws-btn--primary" onClick={onContinue}>
            Continue<ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
