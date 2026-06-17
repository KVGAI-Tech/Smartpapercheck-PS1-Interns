/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { Download, FileCheck2, FileText, Loader2, Printer, ShieldCheck, Sparkles } from 'lucide-react';

function ValidationItem({ label, value, ok = true }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${ok ? 'text-slate-950' : 'text-rose-600'}`}>{value}</span>
    </div>
  );
}

export default function FinalizeWorkspacePanel({
  workspace,
  sections,
  selectedCards,
  selectedMarks,
  onFinalize,
  isFinalizing = false,
  finalizedExam = null,
  onDownloadPdf,
  onDownloadDocx,
  onOpenPrintable,
  onReturnToComposer,
}) {
  const [examName, setExamName] = useState(workspace?.title || 'Final Exam Paper');
  const validation = useMemo(() => {
    const titlePresent = Boolean((workspace?.title || '').trim());
    const hasSections = sections.length > 0;
    const hasSelectedQuestions = selectedCards.length > 0;
    const sectionTitlesComplete = sections.every((section) => (section.title || '').trim());
    return {
      titlePresent,
      hasSections,
      hasSelectedQuestions,
      sectionTitlesComplete,
      isValid: titlePresent && hasSections && hasSelectedQuestions && sectionTitlesComplete,
    };
  }, [sections, selectedCards.length, workspace?.title]);

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 overflow-y-auto px-6 py-8 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="rounded-[32px] border border-slate-200 bg-white px-8 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Finalize & Export</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Freeze the draft when it’s ready.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Review the paper summary, validate the draft, and create an immutable master exam snapshot for clean exports.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <ValidationItem label="Paper title" value={validation.titlePresent ? 'Ready' : 'Missing'} ok={validation.titlePresent} />
            <ValidationItem label="Sections" value={`${sections.length} created`} ok={validation.hasSections} />
            <ValidationItem label="Questions in draft" value={`${selectedCards.length} selected`} ok={validation.hasSelectedQuestions} />
            <ValidationItem label="Section labels" value={validation.sectionTitlesComplete ? 'Complete' : 'Needs review'} ok={validation.sectionTitlesComplete} />
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-[#fafcfb] px-5 py-5">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Final exam name</span>
              <input
                value={examName}
                onChange={(event) => setExamName(event.target.value)}
                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                placeholder="Ex: Mid Semester Examination"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onFinalize?.(examName)}
                disabled={!validation.isValid || isFinalizing || Boolean(finalizedExam)}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {isFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {finalizedExam ? 'Finalized' : 'Finalize draft'}
                </span>
              </button>
              <button
                type="button"
                onClick={onReturnToComposer}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
              >
                Back to composer
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Paper summary</p>
          <div className="mt-5 space-y-3">
            <ValidationItem label="Total questions" value={selectedCards.length} />
            <ValidationItem label="Total marks" value={selectedMarks} />
            <ValidationItem label="Paper type" value={workspace?.paper_type || 'standard'} />
            <ValidationItem label="Template" value={workspace?.template_id || 'universal'} />
          </div>
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-[#fafcfb] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Sparkles className="h-4 w-4 text-accent" />
              Finalized exports are generated from the immutable snapshot.
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Draft changes after finalization won’t affect the locked exam until you create a new finalized version.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white px-8 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Final export</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Download clean examination outputs</h2>
          </div>
          {finalizedExam ? (
            <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[11px] font-semibold text-accent">
              Finalized as #{finalizedExam.id}
            </span>
          ) : null}
        </div>

        {!finalizedExam ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-[#fafcfb] px-6 py-10 text-center text-sm text-slate-500">
            Finalize the draft first to unlock PDF, DOCX, and printable exports.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => onDownloadPdf?.(finalizedExam)}
              className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 transition hover:border-slate-300"
            >
              <div className="flex items-center gap-2 text-base font-medium text-slate-950">
                <FileText className="h-5 w-5" />
                PDF export
              </div>
              <div className="mt-2 text-sm text-slate-500">Download the finalized paper as a print-ready PDF.</div>
            </button>

            <button
              type="button"
              onClick={() => onDownloadDocx?.(finalizedExam)}
              className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-slate-300"
            >
              <div className="flex items-center gap-2 text-base font-medium text-slate-950">
                <Download className="h-5 w-5" />
                DOCX export
              </div>
              <div className="mt-2 text-sm text-slate-500">Export the finalized exam as an editable Word document.</div>
            </button>

            <button
              type="button"
              onClick={() => onOpenPrintable?.(finalizedExam)}
              className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-slate-300"
            >
              <div className="flex items-center gap-2 text-base font-medium text-slate-950">
                <Printer className="h-5 w-5" />
                Printable view
              </div>
              <div className="mt-2 text-sm text-slate-500">Open a print-friendly version generated from the locked snapshot.</div>
            </button>
          </div>
        )}

        {finalizedExam ? (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-[#fafcfb] px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <FileCheck2 className="h-4 w-4 text-accent" />
              Finalized artifact ready
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Snapshot <span className="font-medium text-slate-700">{finalizedExam.exam_name}</span> contains {finalizedCards.length} finalized questions and can be reused safely without mutating the working draft.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
