/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Download, Loader2, Printer, Settings, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import SmartPaperPreview from './SmartPaperPreview';
import { formatQuestionTextAI } from './examDocumentApi';

export default function PaperComposer({ workspace, sections, setSections, onSaveWorkspace }) {
  const [builderLayout, setBuilderLayout] = useState(() => {
    return workspace?.parsed_metadata?.builderLayout || {
      headerTitle: workspace?.title || 'Examination Paper',
      institution: 'My University',
      course: 'Course Name',
      subject: 'Subject',
      examTime: '3 Hours',
      totalMarks: 100,
      instructions: 'Attempt all questions.',
    };
  });

  const [exportMode, setExportMode] = useState('standard'); // 'standard' | 'writable'
  const [isFormattingPaper, setIsFormattingPaper] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Save changes to workspace automatically
  useEffect(() => {
    if (onSaveWorkspace) {
      onSaveWorkspace({
        parsed_metadata: {
          ...workspace?.parsed_metadata,
          sections,
          builderLayout,
        }
      });
    }
  }, [sections, builderLayout]);

  const handleExportStandardPDF = () => {
    setExportMode('standard');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportWritablePDF = () => {
    setExportMode('writable');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const formatTextIfPresent = async (text) => {
    if (!text?.trim()) return text;
    try {
      return (await formatQuestionTextAI(text)) || text;
    } catch (error) {
      return text;
    }
  };

  const handleFormatWholePaper = async () => {
    setIsFormattingPaper(true);
    try {
      const formattedInstructions = await formatTextIfPresent(builderLayout.instructions);

      const formattedSections = await Promise.all(
        sections.map(async (section) => ({
          ...section,
          title: section.title,
          instructions: await formatTextIfPresent(section.instructions || ''),
          cards: await Promise.all(
            (section.cards || []).map(async (card) => ({
              ...card,
              question_body: await formatTextIfPresent(card.question_body || ''),
              parsed_metadata: {
                ...card.parsed_metadata,
                options: await Promise.all(
                  ((card.parsed_metadata?.options) || []).map(async (option) => ({
                    ...option,
                    text: await formatTextIfPresent(option.text || ''),
                  }))
                ),
              },
            }))
          ),
        }))
      );

      setBuilderLayout((prev) => ({
        ...prev,
        instructions: formattedInstructions,
      }));
      setSections?.(formattedSections);
      toast.success('Whole paper formatted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to format paper');
    } finally {
      setIsFormattingPaper(false);
    }
  };

  const updateCardById = (cardId, updater) => {
    if (!cardId) return;
    setSections?.((prev) =>
      prev.map((section) => ({
        ...section,
        cards: (section.cards || []).map((card) => (
          card.id === cardId
            ? updater(card)
            : card
        )),
      }))
    );
  };

  const updateSectionById = (sectionId, updater) => {
    if (!sectionId) return;
    setSections?.((prev) =>
      prev.map((section) => (
        section.id === sectionId
          ? updater(section)
          : section
      ))
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-100">
      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #paper-preview-container, #paper-preview-container * {
            visibility: visible;
          }
          #paper-preview-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
            background: white;
          }
          #paper-preview-container .print-page-shell {
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          #paper-preview-container img {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          #paper-preview-container .print-question-block,
          #paper-preview-container section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <button
          type="button"
          onClick={handleFormatWholePaper}
          disabled={isFormattingPaper}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isFormattingPaper ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isFormattingPaper ? 'Formatting Paper...' : 'Auto-Format Whole Paper'}
        </button>
      </div>
      
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Panel: Paper Header Settings */}
        <div className="w-[360px] shrink-0 flex flex-col border-r border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Paper Formatting</h2>
              <p className="text-xs text-slate-500">Edit header and export</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <label className="space-y-1 block text-xs font-semibold text-slate-600">
              Institution Name
              <input
                value={builderLayout.institution || ''}
                onChange={(e) => setBuilderLayout(prev => ({ ...prev, institution: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
              />
            </label>
            <label className="space-y-1 block text-xs font-semibold text-slate-600">
              Paper Title
              <input
                value={builderLayout.headerTitle || ''}
                onChange={(e) => setBuilderLayout(prev => ({ ...prev, headerTitle: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1 block text-xs font-semibold text-slate-600">
                Course
                <input
                  value={builderLayout.course || ''}
                  onChange={(e) => setBuilderLayout(prev => ({ ...prev, course: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </label>
              <label className="space-y-1 block text-xs font-semibold text-slate-600">
                Subject
                <input
                  value={builderLayout.subject || ''}
                  onChange={(e) => setBuilderLayout(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </label>
              <label className="space-y-1 block text-xs font-semibold text-slate-600">
                Duration
                <input
                  value={builderLayout.examTime || ''}
                  onChange={(e) => setBuilderLayout(prev => ({ ...prev, examTime: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </label>
              <label className="space-y-1 block text-xs font-semibold text-slate-600">
                Total Marks
                <input
                  type="number"
                  value={builderLayout.totalMarks || ''}
                  onChange={(e) => setBuilderLayout(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </label>
            </div>
            <label className="space-y-1 block text-xs font-semibold text-slate-600">
              General Instructions
              <textarea
                value={builderLayout.instructions || ''}
                onChange={(e) => setBuilderLayout(prev => ({ ...prev, instructions: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 min-h-[100px]"
              />
            </label>

          </div>

          <div className="border-t border-slate-200 p-5 bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Export Options</h3>
            <button
              onClick={handleExportStandardPDF}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              Standard PDF
            </button>
            <button
              onClick={handleExportWritablePDF}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <Download className="h-4 w-4" />
              Writable PDF (With Spaces)
            </button>
          </div>
        </div>

        {/* Main Area: Live Preview */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div id="paper-preview-container" className="w-full max-w-4xl">
            <SmartPaperPreview
              title={builderLayout.headerTitle}
              builderLayout={builderLayout}
              sections={sections}
              unsectionedCards={[]}
              paperType={exportMode}
              paperSettings={{ showSectionMarks: true }}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              onUpdateBuilderField={(field, value) => setBuilderLayout((prev) => ({ ...prev, [field]: value }))}
              onUpdateSection={updateSectionById}
              onUpdateCard={updateCardById}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
