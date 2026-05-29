/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  Plus,
  Printer,
  Search,
  Settings2,
  Upload,
  X,
  Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { normalizeLegacySections } from './paperDocumentBuilder';
import { PDFLayoutRenderer } from './pdf/PDFLayoutRenderer';

const APP_NAME = 'SMART PAPER CHECK';
const DURATION_OPTIONS = ['30 Minutes', '45 Minutes', '1 Hour', '90 Minutes', '2 Hours', '3 Hours'];

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'mcq', label: 'MCQ' },
  { id: 'short', label: 'Short Answer' },
  { id: 'long', label: 'Long Answer' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'numerical', label: 'Numerical' },
];

const QUICK_QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ' },
  { value: 'short_subjective', label: 'Short Answer' },
  { value: 'long_subjective', label: 'Long Answer' },
  { value: 'diagram_based', label: 'Diagram' },
  { value: 'numerical', label: 'Numerical' },
  { value: 'true_false', label: 'True/False' },
];

const TYPE_STYLES = {
  MCQ: { background: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
  'Short Answer': { background: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'Long Answer': { background: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  Diagram: { background: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  Numerical: { background: '#F0F9FF', text: '#0C4A6E', border: '#BAE6FD' },
};

const DEFAULT_LAYOUT = {
  headerTitle: 'Examination Paper',
  institution: 'My University',
  course: 'Course Name',
  subject: 'Subject',
  examTime: '3 Hours',
  academicYear: '',
  totalMarks: 0,
  instructions: '',
};

const SETTINGS_FIELDS = [
  { key: 'institution', label: 'Institution name', type: 'text' },
  { key: 'headerTitle', label: 'Paper title', type: 'text' },
  { key: 'subject', label: 'Subject', type: 'text' },
  { key: 'course', label: 'Course', type: 'text' },
  { key: 'examTime', label: 'Duration', type: 'select' },
  { key: 'academicYear', label: 'Academic year', type: 'text' },
  { key: 'instructions', label: 'General instructions', type: 'textarea' },
];

const MODAL_INPUT =
  'mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition duration-150 ease-out focus:border-slate-300';

const PDF_EXPORT_TYPES = ['standard', 'writable', 'online'];

function cleanText(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function showBuilderToast(message, type = 'success') {
  toast[type](message, {
    duration: 3000,
    position: 'bottom-center',
  });
}

function PdfExportOption({
  paperType,
  builderLayout,
  cards,
  sections,
  paperSettings,
  fileName,
  onClose,
}) {
  const paperTypeMeta = getPaperTypeMeta(paperType);

  return (
    <PDFDownloadLink
      document={(
        <PDFLayoutRenderer
          title={builderLayout.headerTitle}
          builderLayout={{ ...builderLayout, totalMarks: builderLayout.totalMarks }}
          cards={cards}
          sections={sections}
          paperType={paperType}
          paperSettings={paperSettings}
        />
      )}
      fileName={fileName}
      onClick={() => {
        onClose?.();
        showBuilderToast(`${paperTypeMeta.shortLabel} PDF export started`);
      }}
      className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
    >
      {({ loading }) => (
        <>
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FileDown className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900">{paperTypeMeta.label}</div>
            <div className="mt-0.5 text-xs leading-5 text-slate-500">
              {paperTypeMeta.description}
            </div>
          </div>
          <div className="shrink-0 text-xs font-medium text-slate-400">
            {loading ? 'Preparing…' : 'PDF'}
          </div>
        </>
      )}
    </PDFDownloadLink>
  );
}

function buildInitialLayout(workspace) {
  const seeded = workspace?.builder_layout_json || workspace?.parsed_metadata?.builderLayout || {};
  return {
    ...DEFAULT_LAYOUT,
    ...seeded,
    headerTitle: seeded.headerTitle || workspace?.title || DEFAULT_LAYOUT.headerTitle,
  };
}

function createSection(index) {
  return {
    id: `section-${Date.now()}-${index}`,
    title: '',
    instructions: '',
    cardIds: [],
    parsed_metadata: {},
  };
}

function getSectionLetter(index) {
  return String.fromCharCode(65 + index);
}

function getDisplayType(card = {}) {
  const type = String(card.question_type || '').toLowerCase();
  const label = card.question_type_label || '';

  if (['mcq', 'mcq_reasoning', 'true_false', 'assertion_reason', 'fill_blank'].includes(type)) {
    return 'MCQ';
  }
  if (type === 'short_subjective') return 'Short Answer';
  if (['long_subjective', 'case_study'].includes(type)) return 'Long Answer';
  if (['diagram_based', 'image_based'].includes(type)) return 'Diagram';
  if (type === 'numerical') return 'Numerical';

  if (/short/i.test(label)) return 'Short Answer';
  if (/diagram|image/i.test(label)) return 'Diagram';
  if (/numerical/i.test(label)) return 'Numerical';
  if (/mcq|true/i.test(label)) return 'MCQ';
  return 'Long Answer';
}

function matchesTypeFilter(card, filterId) {
  if (filterId === 'all') return true;
  const displayType = getDisplayType(card);
  if (filterId === 'mcq') return displayType === 'MCQ';
  if (filterId === 'short') return displayType === 'Short Answer';
  if (filterId === 'long') return displayType === 'Long Answer';
  if (filterId === 'diagram') return displayType === 'Diagram';
  if (filterId === 'numerical') return displayType === 'Numerical';
  return true;
}

function Badge({ label, tone, outlined = false }) {
  if (!label) return null;
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: tone?.background || '#F8FAFC',
        color: tone?.text || '#334155',
        borderColor: outlined ? tone?.border || '#CBD5E1' : tone?.border || 'transparent',
      }}
    >
      {label}
    </span>
  );
}

function FilterPill({ active, label, onClick, tone = 'indigo' }) {
  const activeClassName = tone === 'amber'
    ? 'border-[#f59e0b] bg-white text-[#d97706]'
    : 'border-[#6366f1] bg-[#eef2ff] text-[#4f46e5]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition duration-150 ease-out ${
        active
          ? activeClassName
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, valueClassName = 'text-slate-950' }) {
  return (
    <div className="rounded-xl border border-[#e6e7eb] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="text-[11px] font-semibold uppercase text-slate-400">{label}</div>
      <div className={`mt-4 text-[30px] font-semibold leading-none ${valueClassName}`}>{value}</div>
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] ${
          wide ? 'max-w-5xl' : 'max-w-2xl'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ececec] px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition duration-150 ease-out hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-84px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function PreviewModal({ builderLayout, sections, cardsById, onClose }) {
  let globalQuestionNumber = 0;

  return (
    <ModalShell
      title="Preview paper"
      subtitle="Clean print-ready examination layout"
      onClose={onClose}
      wide
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #paper-builder-print-root, #paper-builder-print-root * {
            visibility: visible;
          }
          #paper-builder-print-root {
            position: absolute;
            inset: 0;
            background: white;
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: none;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>

      <div className="border-b border-slate-200/80 bg-white px-6 py-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      <div className="bg-[#f7f4ec] p-6">
        <div id="paper-builder-print-root" className="mx-auto max-w-4xl rounded-2xl bg-white px-8 py-8 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
          <div className="border-b border-slate-200 pb-6 text-center">
            <p className="text-sm font-medium uppercase text-slate-500">{builderLayout.institution || APP_NAME}</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">{builderLayout.headerTitle || 'Untitled Paper'}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span>Subject: {builderLayout.subject || 'Subject'}</span>
              <span>Course: {builderLayout.course || 'Course'}</span>
              <span>Duration: {builderLayout.examTime || 'Duration'}</span>
              <span>Total Marks: {builderLayout.totalMarks || 0}</span>
            </div>
            {builderLayout.academicYear ? (
              <div className="mt-2 text-sm text-slate-500">Academic Year: {builderLayout.academicYear}</div>
            ) : null}
          </div>

          {builderLayout.instructions?.trim() ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-[#fafafa] px-5 py-4">
              <div className="text-[11px] font-semibold uppercase text-slate-400">General instructions</div>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{builderLayout.instructions}</p>
            </div>
          ) : null}

          <div className="mt-8 space-y-8">
            {sections.map((section, sectionIndex) => {
              const questionCards = (section.cardIds || [])
                .map((cardId) => cardsById.get(String(cardId)))
                .filter(Boolean);

              if (questionCards.length === 0) return null;

              return (
                <section key={section.id}>
                  <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
                    <div>
                      <div className="text-xs font-semibold uppercase text-slate-400">Section {getSectionLetter(sectionIndex)}</div>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">{section.title?.trim() || `Section ${getSectionLetter(sectionIndex)}`}</h2>
                    </div>
                  </div>

                  {section.instructions?.trim() ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{section.instructions}</p>
                  ) : null}

                  <div className="mt-5 space-y-4">
                    {questionCards.map((card) => {
                      globalQuestionNumber += 1;
                      return (
                        <div key={card.id} className="flex items-start gap-4">
                          <div className="min-w-[48px] text-sm font-semibold text-slate-900">Q{globalQuestionNumber}.</div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-sm leading-7 text-slate-800"
                              dangerouslySetInnerHTML={{ __html: card.question_body || cleanText(card.question_body) || 'Untitled question' }}
                            />
                            {Array.isArray(card.image_urls) && card.image_urls.length > 0 && (
                              <div className="mt-4 flex flex-col gap-4">
                                {card.image_urls.map((url, idx) => (
                                  url ? <img key={idx} src={url} alt={`Question media ${idx + 1}`} className="max-w-md rounded-lg border border-slate-200" /> : null
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-slate-700">[{Number(card.marks) || 0}]</div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default function PaperComposer({
  workspace,
  cards,
  setCards,
  sections,
  setSections,
  onSaveWorkspace,
  searchQuery,
  onEditCard,
  onCreateQuestion,
  onPublishPaper,
  onExportDocx,
  documents = [],
  isImporting = false,
  importPercent = 0,
  onImportFiles,
}) {
  const [builderLayout, setBuilderLayout] = useState(() => buildInitialLayout(workspace));
  const [paperSettings] = useState(() => (
    workspace?.paper_settings_json || workspace?.parsed_metadata?.paperSettings || { preview_mode: 'standard' }
  ));
  const [templateId] = useState(workspace?.template_id || workspace?.builder_layout_json?.template_id || 'universal');
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || '');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportPaperType, setExportPaperType] = useState(
    workspace?.paper_type || paperSettings.preview_mode || 'standard'
  );
  const [settingsDraft, setSettingsDraft] = useState(() => buildInitialLayout(workspace));
  const [newQuestionDraft, setNewQuestionDraft] = useState({
    questionType: 'mcq',
    questionText: '',
    marks: 1,
    year: '',
    tags: [],
    tagInput: '',
    internalNotes: '',
  });
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const exportMenuRef = useRef(null);
  const importInputRef = useRef(null);

  const normalizedSections = useMemo(
    () => normalizeLegacySections(sections, cards),
    [cards, sections]
  );

  const cardsById = useMemo(
    () => new Map(cards.map((card) => [String(card.id), card])),
    [cards]
  );

  const selectedSection = useMemo(
    () => normalizedSections.find((section) => section.id === selectedSectionId) || normalizedSections[0] || null,
    [normalizedSections, selectedSectionId]
  );

  const cardSectionLookup = useMemo(() => {
    const lookup = new Map();
    normalizedSections.forEach((section, sectionIndex) => {
      (section.cardIds || []).forEach((cardId, cardIndex) => {
        lookup.set(String(cardId), {
          sectionId: section.id,
          sectionIndex,
          cardIndex,
        });
      });
    });
    return lookup;
  }, [normalizedSections]);

  const flatQuestionOrder = useMemo(() => {
    const orderMap = new Map();
    let current = 1;
    normalizedSections.forEach((section) => {
      (section.cardIds || []).forEach((cardId) => {
        orderMap.set(String(cardId), current);
        current += 1;
      });
    });
    return orderMap;
  }, [normalizedSections]);

  const selectedCards = useMemo(
    () => normalizedSections.flatMap((section) => (section.cardIds || []).map((cardId) => cardsById.get(String(cardId))).filter(Boolean)),
    [cardsById, normalizedSections]
  );

  const stats = useMemo(() => {
    const totalQuestions = selectedCards.length;
    const totalMarks = selectedCards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);
    return {
      totalQuestions,
      totalMarks,
      sectionCount: normalizedSections.length,
      avgMarks: totalQuestions > 0 ? (totalMarks / totalQuestions).toFixed(1) : '-',
    };
  }, [normalizedSections.length, selectedCards]);

  const filteredCards = useMemo(() => {
    const query = localSearch.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesSearch = !query || [
        cleanText(card.question_body),
        ...(card.tags_json || []),
      ].join(' ').toLowerCase().includes(query);

      return matchesSearch && matchesTypeFilter(card, typeFilter);
    });
  }, [cards, localSearch, typeFilter]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!normalizedSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(normalizedSections[0]?.id || '');
    }
  }, [normalizedSections, selectedSectionId]);

  useEffect(() => {
    setSettingsDraft(builderLayout);
  }, [builderLayout]);

  useEffect(() => {
    if (onSaveWorkspace) {
      onSaveWorkspace({
        builder_layout_json: {
          ...builderLayout,
          totalMarks: stats.totalMarks,
          template_id: templateId,
          paperStructure: {
            sections: normalizedSections,
          },
        },
        paper_type: workspace?.paper_type || paperSettings.preview_mode || 'standard',
        template_id: templateId,
        paper_settings_json: {
          ...paperSettings,
          preview_mode: workspace?.paper_type || paperSettings.preview_mode || 'standard',
        },
      });
    }
  }, [builderLayout, normalizedSections, onSaveWorkspace, paperSettings, stats.totalMarks, templateId, workspace?.paper_type]);

  useEffect(() => {
    setExportPaperType(workspace?.paper_type || paperSettings.preview_mode || 'standard');
  }, [paperSettings.preview_mode, workspace?.paper_type]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateSection = (sectionId, updater) => {
    setSections((prev) => prev.map((section) => (
      section.id === sectionId
        ? (typeof updater === 'function' ? updater(section) : { ...section, ...updater })
        : section
    )));
  };

  const moveSection = (sectionIndex, direction) => {
    const nextIndex = sectionIndex + direction;
    if (nextIndex < 0 || nextIndex >= normalizedSections.length) return;

    setSections((prev) => {
      const next = [...prev];
      [next[sectionIndex], next[nextIndex]] = [next[nextIndex], next[sectionIndex]];
      return next;
    });
  };

  const addSection = () => {
    const nextSection = createSection(normalizedSections.length);
    setSections((prev) => [...prev, nextSection]);
    setSelectedSectionId(nextSection.id);
    showBuilderToast('Section added');
  };

  const removeSection = (sectionId) => {
    if (normalizedSections.length === 1) {
      showBuilderToast('At least one section is required', 'error');
      return;
    }
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const moveQuestion = (sectionId, cardIndex, direction) => {
    updateSection(sectionId, (section) => {
      const nextIds = [...(section.cardIds || [])];
      const targetIndex = cardIndex + direction;
      if (targetIndex < 0 || targetIndex >= nextIds.length) return section;
      [nextIds[cardIndex], nextIds[targetIndex]] = [nextIds[targetIndex], nextIds[cardIndex]];
      return { ...section, cardIds: nextIds };
    });
  };

  const addCardToSection = (cardId, targetSectionId) => {
    if (!targetSectionId) return;

    const existingSection = cardSectionLookup.get(String(cardId));
    const destination = normalizedSections.find((section) => section.id === targetSectionId);

    setSections((prev) => prev.map((section) => {
      const nextIds = (section.cardIds || []).filter((existingId) => String(existingId) !== String(cardId));
      if (section.id !== targetSectionId) {
        return { ...section, cardIds: nextIds };
      }
      return { ...section, cardIds: [...nextIds, cardId] };
    }));

    setSelectedSectionId(targetSectionId);
    if (existingSection && existingSection.sectionId !== targetSectionId) {
      showBuilderToast(`Moved question to ${destination?.title?.trim() || `Section ${getSectionLetter(normalizedSections.findIndex((item) => item.id === targetSectionId))}`}`);
    } else {
      showBuilderToast('Question added');
    }
  };

  const removeCardFromPaper = (cardId) => {
    setSections((prev) => prev.map((section) => ({
      ...section,
      cardIds: (section.cardIds || []).filter((existingId) => String(existingId) !== String(cardId)),
    })));
    showBuilderToast('Question removed');
  };

  const toggleQuestion = (cardId) => {
    const existingSection = cardSectionLookup.get(String(cardId));
    if (existingSection?.sectionId === selectedSection?.id) {
      removeCardFromPaper(cardId);
      return;
    }
    addCardToSection(cardId, selectedSection?.id || normalizedSections[0]?.id);
  };

  const clearAll = () => {
    setSections((prev) => prev.map((section) => ({ ...section, cardIds: [] })));
    showBuilderToast('Paper cleared');
  };

  const updateCardMarks = (cardId, marks) => {
    setCards?.((prev) => prev.map((card) => (
      String(card.id) === String(cardId)
        ? { ...card, marks: marks === '' ? '' : Number(marks) }
        : card
    )));
  };

  const handleSettingsSave = () => {
    setBuilderLayout((prev) => ({
      ...prev,
      ...settingsDraft,
    }));
    setIsSettingsOpen(false);
  };

  const updateNewQuestionField = (field, value) => {
    setNewQuestionDraft((prev) => ({ ...prev, [field]: value }));
  };

  const pushTag = () => {
    const tag = newQuestionDraft.tagInput.trim();
    if (!tag || newQuestionDraft.tags.includes(tag)) return;
    setNewQuestionDraft((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
      tagInput: '',
    }));
  };

  const removeTag = (tag) => {
    setNewQuestionDraft((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const resetNewQuestionDraft = () => {
    setNewQuestionDraft({
      questionType: 'mcq',
      questionText: '',
      marks: 1,
      year: '',
      tags: [],
      tagInput: '',
      internalNotes: '',
    });
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionDraft.questionText.trim()) {
      showBuilderToast('Question text is required', 'error');
      return;
    }

    const payload = buildMasterExamCardPayload({
      question_type: newQuestionDraft.questionType,
      question_body: newQuestionDraft.questionText,
      marks: Number(newQuestionDraft.marks) || 0,
      tags_json: newQuestionDraft.tags,
      parsed_metadata: {
        source_year: newQuestionDraft.year,
        internal_notes: newQuestionDraft.internalNotes,
        source_paper_name: 'Manual Entry',
      },
    });

    try {
      setIsCreatingQuestion(true);
      await onCreateQuestion?.(payload);
      resetNewQuestionDraft();
      setIsQuestionModalOpen(false);
      showBuilderToast('Question added to bank');
    } catch (error) {
      showBuilderToast(error.message || 'Failed to create question', 'error');
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  const handleImportSelection = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    try {
      await onImportFiles?.(selectedFiles);
      showBuilderToast(`${selectedFiles.length} paper${selectedFiles.length > 1 ? 's' : ''} uploaded for extraction`);
    } catch (error) {
      showBuilderToast(error.message || 'Failed to import paper', 'error');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] text-slate-900 shadow-none [font-family:Inter,'DM_Sans',ui-sans-serif,system-ui,sans-serif]">
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#ececec] bg-white px-5 max-md:h-auto max-md:flex-wrap max-md:py-3">
        <div className="min-w-0 text-sm text-slate-500 max-md:w-full">
          <span className="text-[11px] font-semibold uppercase text-slate-400">{APP_NAME}</span>
          <span className="px-2 text-slate-300">/</span>
          <span>Master Exams</span>
          <span className="px-2 text-slate-300">/</span>
          <span className="truncate font-semibold text-slate-900">{builderLayout.headerTitle || workspace?.title || 'Untitled Paper'}</span>
        </div>

        <div className="flex items-center gap-2 max-md:flex-wrap">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-slate-700 transition duration-150 ease-out hover:bg-slate-50"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionModalOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-slate-700 transition duration-150 ease-out hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            New question
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c7d2fe] bg-[#f5f7ff] px-4 text-sm font-semibold text-[#4f46e5] transition duration-150 ease-out hover:bg-[#eef2ff]"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-semibold text-slate-700 transition duration-150 ease-out hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Import
          </button>

          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition duration-150 ease-out hover:bg-slate-800"
            >
              Export
              <ChevronDown className="h-4 w-4" />
            </button>

            {isExportMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[220px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
                {PDF_EXPORT_TYPES.map((type) => (
                  <PdfExportOption
                    key={type}
                    paperType={type}
                    builderLayout={{ ...builderLayout, totalMarks: stats.totalMarks, template_id: templateId }}
                    cards={cards}
                    sections={normalizedSections}
                    paperSettings={paperSettings}
                    fileName={`${(builderLayout.headerTitle || 'exam-paper').replace(/\s+/g, '_')}-${type}.pdf`}
                    onClose={() => setIsExportMenuOpen(false)}
                  />
                ))}

                <button
                  type="button"
                  onClick={async () => {
                    setIsExportMenuOpen(false);
                    try {
                      await onExportDocx?.();
                    } catch (error) {
                      showBuilderToast(error.message || 'Failed to export DOCX', 'error');
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition duration-150 ease-out hover:bg-slate-100"
                >
                  <Upload className="h-4 w-4" />
                  Export as DOCX
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsExportMenuOpen(false);
                    try {
                      await onPublishPaper?.();
                    } catch (error) {
                      showBuilderToast(error.message || 'Failed to publish paper', 'error');
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition duration-150 ease-out hover:bg-slate-100"
                >
                  <Upload className="h-4 w-4" />
                  Publish to platform
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex flex-1 overflow-hidden max-md:flex-col">
        <aside className="w-[260px] shrink-0 border-r border-[#ececec] bg-[#fafafa] max-xl:w-[240px] max-md:h-[44vh] max-md:w-full max-md:border-b max-md:border-r-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-[#ececec] px-5 py-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase text-slate-400">Question Bank</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-slate-950">{cards.length} questions available</h2>
                </div>
              </div>

              <label className="relative mt-4 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={localSearch}
                  onChange={(event) => setLocalSearch(event.target.value)}
                  placeholder="Search questions, topics..."
                  className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition duration-150 ease-out focus:border-slate-300"
                />
              </label>

              <div className="mt-5 border-t border-[#ececec] pt-4">
                <div className="flex flex-wrap gap-2">
                  {TYPE_FILTERS.map((filter) => (
                    <FilterPill
                      key={filter.id}
                      active={typeFilter === filter.id}
                      label={filter.label}
                      onClick={() => setTypeFilter(filter.id)}
                      tone="indigo"
                    />
                  ))}
                </div>
              </div>

            </div>

            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
              {filteredCards.map((card) => {
                const displayType = getDisplayType(card);
                const typeTone = TYPE_STYLES[displayType];
                const placement = cardSectionLookup.get(String(card.id));
                const isAdded = Boolean(placement);
                const isInSelectedSection = placement?.sectionId === selectedSection?.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleQuestion(card.id)}
                    className={`w-full rounded-xl border px-4 py-3.5 text-left transition duration-150 ease-out ${
                      isInSelectedSection
                        ? 'border-[#c7d2fe] bg-[#f8faff] shadow-[0_1px_3px_rgba(15,23,42,0.05)]'
                        : 'border-[#e5e7eb] bg-white hover:border-slate-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.05)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Badge label={displayType} tone={typeTone} outlined />
                      </div>
                      <div className="shrink-0 text-[13px] font-semibold text-slate-600">{Number(card.marks) || 0}M</div>
                    </div>

                    <div className="mt-3 line-clamp-3 text-[13.5px] leading-6 text-slate-700">
                      {cleanText(card.question_body) || 'Untitled question'}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(card.tags_json || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#f1f2f4] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400">
                        {placement ? `In Section ${getSectionLetter(placement.sectionIndex)}` : ''}
                      </span>
                      <span className={`font-semibold ${isAdded ? 'text-[#6366f1]' : 'text-slate-600'}`}>
                        {isAdded ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredCards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9dde3] bg-white px-4 py-10 text-center text-sm text-slate-500">
                  No questions match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-h-0 flex-1 overflow-y-auto bg-[#f5f5f5] px-6 py-6 max-md:px-4 max-md:py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Questions" value={stats.totalQuestions} valueClassName="text-[#6366f1]" />
              <StatCard label="Total Marks" value={stats.totalMarks} valueClassName="text-[#059669]" />
              <StatCard label="Sections" value={stats.sectionCount} valueClassName="text-[#f59e0b]" />
              <StatCard label="Avg Marks/Q" value={stats.avgMarks} valueClassName="text-[#8b5cf6]" />
            </div>

            {normalizedSections.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e6e7eb] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="mr-2 text-[11px] font-semibold uppercase text-slate-400">Add bank questions to</span>
                {normalizedSections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      selectedSection?.id === section.id
                        ? 'bg-[#eef2ff] text-[#4f46e5]'
                        : 'border border-[#e5e7eb] bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Section {getSectionLetter(index)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="space-y-5">
              {normalizedSections.map((section, sectionIndex) => {
                const questionCards = (section.cardIds || [])
                  .map((cardId) => cardsById.get(String(cardId)))
                  .filter(Boolean);
                const sectionMarks = questionCards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);

                return (
                  <div key={section.id} className="rounded-xl border border-[#e2e5ea] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ececec] px-5 py-4">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, -1)}
                            disabled={sectionIndex === 0}
                            className="flex h-5 w-5 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-300 transition duration-150 ease-out hover:border-slate-300 hover:text-slate-500 disabled:opacity-40"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, 1)}
                            disabled={sectionIndex === normalizedSections.length - 1}
                            className="flex h-5 w-5 items-center justify-center rounded-md border border-[#e5e7eb] text-slate-300 transition duration-150 ease-out hover:border-slate-300 hover:text-slate-500 disabled:opacity-40"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-semibold text-[#6366f1]">
                              Section {getSectionLetter(sectionIndex)}
                            </div>
                            <input
                              value={section.title || ''}
                              onChange={(event) => updateSection(section.id, { title: event.target.value })}
                              placeholder="Click to rename section"
                              className="min-w-[220px] flex-1 border-none bg-transparent p-0 text-[18px] font-semibold text-slate-950 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm font-semibold text-slate-600">{questionCards.length} Qs · {sectionMarks} Marks</div>
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-medium text-slate-400 transition duration-150 ease-out hover:bg-rose-50 hover:text-rose-600"
                        >
                          Remove section
                        </button>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <input
                        value={section.instructions || ''}
                        onChange={(event) => updateSection(section.id, { instructions: event.target.value })}
                        placeholder="Optional section instructions (e.g. Attempt any 3 out of 5)..."
                        className="w-full rounded-xl border border-transparent bg-[#f8f8f7] px-4 py-3 text-sm text-slate-700 outline-none transition duration-150 ease-out placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
                      />
                      <div className="mt-4 space-y-3">
                        {questionCards.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#d7dce3] bg-white px-4 py-8 text-center text-sm text-slate-400">
                          No questions yet - add from the bank on the left
                        </div>
                        ) : questionCards.map((card, cardIndex) => {
                        const displayType = getDisplayType(card);
                        const year = card.parsed_metadata?.source_year || '';

                        return (
                          <div key={card.id} className="rounded-xl border border-[#e6e7eb] bg-[#fcfcfb] px-4 py-4 transition duration-150 ease-out">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(section.id, cardIndex, -1)}
                                  disabled={cardIndex === 0}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-slate-400 transition duration-150 ease-out hover:border-slate-300 disabled:opacity-40"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(section.id, cardIndex, 1)}
                                  disabled={cardIndex === questionCards.length - 1}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-slate-400 transition duration-150 ease-out hover:border-slate-300 disabled:opacity-40"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-semibold text-slate-900">Q{flatQuestionOrder.get(String(card.id))}</div>
                                  <Badge label={displayType} tone={TYPE_STYLES[displayType]} outlined />
                                  {year ? (
                                    <span className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                      {year}
                                    </span>
                                  ) : null}
                                </div>

                                <div
                                  className="mt-3 text-sm leading-7 text-slate-700"
                                  dangerouslySetInnerHTML={{ __html: card.question_body || cleanText(card.question_body) || 'Untitled question' }}
                                />

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {(card.tags_json || []).map((tag) => (
                                    <span key={tag} className="rounded-full bg-[#f1f2f4] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <label className="block">
                                  <span className="text-[11px] font-semibold uppercase text-slate-400">Marks</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={card.marks ?? 0}
                                    onChange={(event) => updateCardMarks(card.id, event.target.value)}
                                    className="mt-2 h-10 w-20 rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm text-slate-700 outline-none transition duration-150 ease-out focus:border-slate-300"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => onEditCard?.(card)}
                                  className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-slate-500 transition duration-150 ease-out hover:border-slate-300 hover:text-slate-700"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeCardFromPaper(card.id)}
                                  className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-slate-500 transition duration-150 ease-out hover:border-rose-300 hover:text-rose-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pb-2">
              <button
                type="button"
                onClick={addSection}
                className="rounded-xl border border-dashed border-[#d7dce3] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-150 ease-out hover:border-slate-400"
              >
                + Add section
              </button>

              {stats.totalQuestions > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition duration-150 ease-out hover:bg-rose-100"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {isSettingsOpen ? (
        <ModalShell
          title="Paper settings"
          subtitle="Edit the metadata used in preview and exports."
          onClose={() => setIsSettingsOpen(false)}
        >
          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            {SETTINGS_FIELDS.map((field) => (
              <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <span className="text-[11px] font-semibold uppercase text-slate-400">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={settingsDraft[field.key] || ''}
                    onChange={(event) => setSettingsDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className={`${MODAL_INPUT} min-h-[140px] resize-y`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={settingsDraft[field.key] || ''}
                    onChange={(event) => setSettingsDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className={MODAL_INPUT}
                  >
                    {[settingsDraft.examTime, ...DURATION_OPTIONS].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={settingsDraft[field.key] || ''}
                    onChange={(event) => setSettingsDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className={MODAL_INPUT}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 px-6 py-5">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSettingsSave}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Save settings
            </button>
          </div>
        </ModalShell>
      ) : null}

      {isImportModalOpen ? (
        <ModalShell
          title="Import papers"
          subtitle="Upload DOCX, PDF, or image papers. Extracted questions will appear in the bank."
          onClose={() => setIsImportModalOpen(false)}
        >
          <div className="space-y-5 px-6 py-6">
            <input
              ref={importInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={async (event) => {
                await handleImportSelection(event.target.files);
                if (event.target.value) event.target.value = '';
              }}
            />

            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={async (event) => {
                event.preventDefault();
                await handleImportSelection(event.dataTransfer.files);
              }}
              className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7dce3] bg-[#fafafa] px-6 py-8 text-center transition duration-150 ease-out hover:border-slate-400 hover:bg-white"
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <div className="mt-4 text-base font-semibold text-slate-900">
                Drop paper files here
              </div>
              <div className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                DOCX, PDF, scanned images, and previous question papers are converted into editable cards.
              </div>
              <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                Choose files
              </div>
            </button>

            {isImporting ? (
              <div className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Extracting questions</span>
                  <span className="text-slate-500">{importPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-150 ease-out"
                    style={{ width: `${Math.max(4, importPercent)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {documents.length > 0 ? (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase text-slate-400">Recent imports</div>
                <div className="space-y-2">
                  {documents.slice(0, 5).map((document) => {
                    const status = document.parsed_status || 'processing';
                    const statusClassName = status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'failed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700';
                    return (
                      <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-800">{document.original_filename || 'Imported paper'}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {document.page_count ? `${document.page_count} pages` : 'Question extraction source'}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClassName}`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </ModalShell>
      ) : null}

      {isQuestionModalOpen ? (
        <ModalShell
          title="New question"
          subtitle="Add a custom question to the workspace bank."
          onClose={() => setIsQuestionModalOpen(false)}
        >
          <div className="space-y-6 px-6 py-6">
            <div>
              <div className="text-[11px] font-semibold uppercase text-slate-400">Question type</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {QUICK_QUESTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateNewQuestionField('questionType', type.value)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition duration-150 ease-out ${
                      newQuestionDraft.questionType === type.value
                        ? 'border-[#0f766e] bg-[#f0fdfa] text-[#0f766e]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Question text</span>
              <textarea
                value={newQuestionDraft.questionText}
                onChange={(event) => updateNewQuestionField('questionText', event.target.value)}
                className={`${MODAL_INPUT} min-h-[150px] resize-y`}
                placeholder="Write the question here"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Marks</span>
                <input
                  type="number"
                  min="0"
                  value={newQuestionDraft.marks}
                  onChange={(event) => updateNewQuestionField('marks', event.target.value)}
                  className={MODAL_INPUT}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Year</span>
                <input
                  value={newQuestionDraft.year}
                  onChange={(event) => updateNewQuestionField('year', event.target.value)}
                  className={MODAL_INPUT}
                  placeholder="2025"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Tags</span>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {newQuestionDraft.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#ecfeff] px-2.5 py-1 text-xs font-medium text-[#155e75]"
                    >
                      {tag}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <input
                    value={newQuestionDraft.tagInput}
                    onChange={(event) => updateNewQuestionField('tagInput', event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        pushTag();
                      }
                      if (event.key === 'Backspace' && !newQuestionDraft.tagInput && newQuestionDraft.tags.length > 0) {
                        removeTag(newQuestionDraft.tags[newQuestionDraft.tags.length - 1]);
                      }
                    }}
                    onBlur={pushTag}
                    className="min-w-[140px] flex-1 border-none bg-transparent p-0 text-sm text-slate-700 outline-none"
                    placeholder="Press Enter to add"
                  />
                </div>
              </div>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Internal notes</span>
              <span className="ml-2 text-xs text-slate-400">only visible to you</span>
              <textarea
                value={newQuestionDraft.internalNotes}
                onChange={(event) => updateNewQuestionField('internalNotes', event.target.value)}
                className={`${MODAL_INPUT} min-h-[120px] resize-y`}
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 px-6 py-5">
            <button
              type="button"
              onClick={() => setIsQuestionModalOpen(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateQuestion}
              disabled={isCreatingQuestion}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isCreatingQuestion ? <Upload className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
              Save question
            </button>
          </div>
        </ModalShell>
      ) : null}

      {isPreviewOpen ? (
        <PreviewModal
          builderLayout={{ ...builderLayout, totalMarks: stats.totalMarks }}
          sections={normalizedSections}
          cardsById={cardsById}
          onClose={() => setIsPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
}
