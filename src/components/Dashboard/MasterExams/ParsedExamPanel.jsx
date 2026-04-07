import React, { useMemo } from 'react';
import { Braces, CheckCircle2, FolderSync, ListChecks, Save, WandSparkles, FileText, Layers, FileQuestion } from 'lucide-react';

const ExamPreviewRenderer = ({ sections }) => {
  if (!sections || !sections.length) return null;

  const renderSubquestions = (subquestions, level = 0) => {
    if (!subquestions || !subquestions.length) return null;
    return (
      <div className="mt-2 space-y-3 border-l-2 border-slate-100 pl-6">
        {subquestions.map((sub, idx) => (
          <div key={idx} className="text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-medium text-slate-900">({sub.label || String.fromCharCode(97 + idx)})</span>
              <div className="flex-1">
                <div dangerouslySetInnerHTML={{ __html: sub.question }} className="leading-relaxed" />
                {sub.marks ? <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-500">[{sub.marks} marks]</span> : null}
              </div>
            </div>
            {renderSubquestions(sub.subquestions, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 border-b border-[#e5e7eb] bg-slate-50 px-5 py-3.5">
            <Layers className="h-4 w-4 text-accent" />
            <span className="font-semibold text-slate-800">{section.title || `Section ${sIdx + 1}`}</span>
            <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {Array.isArray(section.questions) ? section.questions.length : 0} Questions
            </span>
          </div>
          
          <div className="space-y-6 p-5">
            {Array.isArray(section.questions) && section.questions.map((question, qIdx) => (
              <div key={qIdx} className="text-sm text-slate-800">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-semibold text-slate-900">{question.id || qIdx + 1}.</span>
                  <div className="flex-1">
                    <div dangerouslySetInnerHTML={{ __html: question.question }} className="leading-relaxed" />
                    {question.marks && !question.subquestions?.length ? (
                      <span className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-500">[{question.marks} marks]</span>
                    ) : null}
                  </div>
                </div>
                {renderSubquestions(question.subquestions)}
              </div>
            ))}
            {(!section.questions || !section.questions.length) && (
              <p className="text-sm italic text-slate-500">No questions in this section.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ParsedExamPanel = ({
  parsedOutput,
  parseStatus,
  isParsing,
  isPublishing,
  isAttaching,
  publishedMasterExamId,
  onPublish,
  onContinueToClassicBuilder,
  onOpenClassicRubrics,
  onAttach,
}) => {
  const parsed = useMemo(() => {
    if (!parsedOutput) return null;
    try {
      return JSON.parse(parsedOutput);
    } catch {
      return null;
    }
  }, [parsedOutput]);

  const summary = useMemo(() => {
    const countSubquestions = (subquestions = []) =>
      (Array.isArray(subquestions) ? subquestions : []).reduce((total, item) => {
        return total + 1 + countSubquestions(item?.subquestions || []);
      }, 0);

    const sections = Array.isArray(parsed?.sections) ? parsed.sections : [];
    const rootQuestions = sections.flatMap((section) => section?.questions || []);
    const totalQuestions = rootQuestions.reduce((total, question) => {
      return total + 1 + countSubquestions(question?.subquestions || []);
    }, 0);

    return {
      sections: sections.length,
      questions: totalQuestions,
      instructions: Array.isArray(parsed?.instructions) ? parsed.instructions.length : 0,
    };
  }, [parsed]);

  return (
    <div className="h-full bg-[#f5f7fb]">
      <div className="mx-auto w-full max-w-[1100px] p-6 lg:p-6">
        
        {/* Header Bar */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Structured Exam Preview</h3>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600 shadow-sm">
                {isParsing ? 'Processing...' : (parseStatus || 'idle').replaceAll('_', ' ')}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">
              {publishedMasterExamId 
                ? `Published as master exam #${publishedMasterExamId}. Continue in the classic exam flow.` 
                : 'Review the extracted structure below, then save and continue to the builder.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublishing || !parsedOutput}
              className="inline-flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isPublishing ? 'Saving...' : 'Save Exam'}
            </button>
            <button
              type="button"
              onClick={onOpenClassicRubrics}
              disabled={isPublishing || !parsedOutput}
              className="inline-flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
            >
              <ListChecks className="h-4 w-4" />
              Open Rubrics
            </button>
            <button
              type="button"
              onClick={onAttach}
              disabled={isAttaching || !parsedOutput}
              className="inline-flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl border-2 border-accent bg-transparent px-4 text-sm font-semibold text-accent shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/5 disabled:pointer-events-none disabled:opacity-60"
            >
              <FolderSync className="h-4 w-4" />
              {isAttaching ? 'Attaching...' : 'Attach to Course'}
            </button>
            <button
              type="button"
              onClick={onContinueToClassicBuilder}
              disabled={isPublishing || !parsedOutput}
              className="inline-flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:opacity-95 disabled:pointer-events-none disabled:opacity-60"
            >
              <WandSparkles className="h-4 w-4" />
              Continue in Exam Flow
            </button>
          </div>
        </div>

        {!parsed && !parsedOutput ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#e5e7eb] bg-white px-6 py-20 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-slate-50 p-4">
              <Braces className="h-10 w-10 text-slate-300" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900">No structured exam generated yet</h4>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Click “Generate Structured Exam” to extract instructions, question hierarchy, marks, options, and metadata.
            </p>
          </div>
        ) : !parsed ? (
          <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-red-800">Failed to parse exam structure. Raw output:</p>
            <pre className="mt-4 overflow-x-auto rounded-[12px] border border-red-100 bg-white p-4 text-xs tracking-tight text-red-900 shadow-inner">{parsedOutput}</pre>
          </div>
        ) : (
          <div className="grid items-start gap-6 xl:grid-cols-[3fr_7fr] 2xl:grid-cols-[300px_1fr]">
            
            {/* Left Column: Summary & Instructions */}
            <div className="space-y-6">
              
              {/* Document Summary Card */}
              <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">
                  <FileText className="h-4 w-4 text-accent" />
                  Document Summary
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 text-sm">
                  <div className="font-medium text-slate-500">Title</div>
                  <div className="max-w-[150px] truncate text-right font-medium text-slate-900" title={parsed.title || '-'}>{parsed.title || '-'}</div>
                  
                  <div className="font-medium text-slate-500">Instructions</div>
                  <div className="text-right font-semibold text-slate-900">{summary.instructions}</div>
                  
                  <div className="font-medium text-slate-500">Sections</div>
                  <div className="text-right font-semibold text-slate-900">{summary.sections}</div>
                  
                  <div className="font-medium text-slate-500">Questions</div>
                  <div className="text-right font-semibold text-slate-900">{summary.questions}</div>
                </div>
              </div>

              {/* Instructions Card */}
              {Array.isArray(parsed.instructions) && parsed.instructions.length > 0 && (
                <div className="rounded-[12px] border border-[#e5e7eb] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">
                    <ListChecks className="h-4 w-4 text-accent" />
                    Instructions
                  </div>
                  <div className="space-y-2">
                    {parsed.instructions.map((instruction, index) => (
                      <div key={`${instruction}-${index}`} className="rounded-xl border border-slate-100 bg-[#f8fafc] px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                        {instruction}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visual Exam Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <FileQuestion className="h-5 w-5 text-accent" />
                  Exam Structure View
                </h4>
              </div>
              
              <ExamPreviewRenderer sections={parsed.sections} />
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ParsedExamPanel;
