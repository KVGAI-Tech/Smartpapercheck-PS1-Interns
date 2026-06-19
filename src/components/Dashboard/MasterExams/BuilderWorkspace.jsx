/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText, Plus, Search, GripVertical, X, Download, CheckCircle2, ChevronDown, ChevronRight, ChevronLeft,
  Settings2, Printer, Layout, Eye, EyeOff,
} from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DifficultyDots from './DifficultyDots';
import { supportsOptions } from './masterExamCardSchema';
import PaperPreviewRenderer from './PaperPreviewRenderer';
import { buildPaperDocument } from './paperDocumentBuilder';

class LocalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#fee' }}>
          <h4>Preview Crashed</h4>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TYPE_LABEL_MAP = {
  mcq: 'MCQ', short_subjective: 'Short Answer', long_subjective: 'Long Subjective',
  numerical: 'Numerical', diagram_based: 'Diagram', true_false: 'True/False',
  mcq_reasoning: 'MCQ + Reasoning', assertion_reason: 'Assertion & Reason',
};

function cleanText(value = '') {
  return value.replace(/\[\[IMAGE_SLOT:\d+\]\]/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function EditableMarks({ cardId, initialMarks, onUpdateCardMarks }) {
  const [val, setVal] = useState(initialMarks);

  useEffect(() => {
    setVal(initialMarks);
  }, [initialMarks]);

  const handleBlurOrSubmit = () => {
    const num = parseFloat(val);
    if (!isNaN(num) && num !== initialMarks && num >= 0) {
      onUpdateCardMarks?.(cardId, num);
    } else {
      setVal(initialMarks);
    }
  };

  return (
    <div className="ws-builder-row__marks" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px' }}>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        onChange={(e) => {
          let inputVal = e.target.value.replace(/[^0-9.]/g, '');
          const parts = inputVal.split('.');
          if (parts.length > 2) {
            inputVal = parts[0] + '.' + parts.slice(1).join('');
          }
          setVal(inputVal);
        }}
        onBlur={handleBlurOrSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.target.blur();
          }
        }}
        style={{
          width: '32px',
          border: 'none',
          background: 'transparent',
          fontWeight: 700,
          fontSize: '12px',
          color: 'var(--ws-ink-700)',
          textAlign: 'center',
          outline: 'none',
          padding: 0,
          margin: 0,
        }}
        draggable={false}
        onDragStart={(e) => e.stopPropagation()}
      />
      <span>Marks</span>
    </div>
  );
}

function EditableLines({ cardId, initialLines, onUpdateCard, defaultLines, initialType }) {
  const initialVal = (!initialType || initialType === 'auto') ? '' : (initialLines ?? '');
  const [val, setVal] = useState(initialVal);

  useEffect(() => {
    const newInitialVal = (!initialType || initialType === 'auto') ? '' : (initialLines ?? '');
    setVal(newInitialVal);
  }, [initialLines, initialType]);

  const handleBlurOrSubmit = () => {
    if (val === '') {
      onUpdateCard?.(cardId, { writing_space_lines: null, writing_space_type: 'auto' });
    } else {
      let num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 50) {
        if (num === 0) {
          onUpdateCard?.(cardId, { writing_space_lines: 0, writing_space_type: 'none' });
        } else {
          onUpdateCard?.(cardId, { writing_space_lines: num, writing_space_type: 'lined' });
        }
      } else {
        setVal(initialLines ?? '');
      }
    }
  };

  return (
    <div className="ws-builder-row__marks" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '3px 8px', background: 'var(--ws-ink-50)', borderRadius: '4px', border: '1px solid var(--ws-ink-200)', marginLeft: '8px' }}>
      <input
        type="text"
        inputMode="numeric"
        value={val}
        placeholder={String(defaultLines)}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={handleBlurOrSubmit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        style={{ width: '20px', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '12px', color: 'var(--ws-brand)', textAlign: 'center', outline: 'none', padding: 0 }}
      />
      <span style={{ fontSize: '11px', color: 'var(--ws-ink-500)', fontWeight: 600 }}>Lines</span>
    </div>
  );
}

function splitQuestionSummary(card = {}) {
  const metadataTitle = cleanText(card?.parsed_metadata?.title || '');
  const normalizedBody = cleanText(card?.question_body || '')
    .replace(/^q(?:uestion)?\s*\d+[\).:-]?\s*/i, '')
    .replace(/\[\s*\d+\s*marks?\s*\]/gi, '')
    .trim();

  if (metadataTitle) {
    const preview = normalizedBody.startsWith(metadataTitle)
      ? normalizedBody.slice(metadataTitle.length).replace(/^[\s:.-]+/, '').trim()
      : normalizedBody;
    return {
      title: metadataTitle,
      preview: preview || normalizedBody || 'No preview available.',
      fullText: normalizedBody || metadataTitle,
    };
  }

  const bodyLines = normalizedBody.split(/\s*(?:\r?\n)+\s*/).filter(Boolean);
  if (bodyLines.length > 1) {
    return {
      title: bodyLines[0],
      preview: bodyLines.slice(1).join(' '),
      fullText: normalizedBody,
    };
  }

  const clauseMatch = normalizedBody.match(/^(.*?)(\([a-z]\)|\b[a-d]\)|[:.-])\s+(.*)$/i);
  if (clauseMatch) {
    return {
      title: clauseMatch[1].trim(),
      preview: clauseMatch[3].trim(),
      fullText: normalizedBody,
    };
  }

  const truncatedTitle = normalizedBody.slice(0, 64).trim();
  const preview = normalizedBody.slice(truncatedTitle.length).trim();
  return {
    title: truncatedTitle || 'Untitled question',
    preview: preview || normalizedBody || 'No preview available.',
    fullText: normalizedBody,
  };
}

function PerQuestionLinesPanel({ sections, cardsById, paperSettings, onUpdateCard }) {
  return (
    <div className="ws-card" style={{ marginTop: '16px', overflow: 'hidden', flexShrink: 0 }}>
      <div className="ws-card__head" style={{ padding: '16px', borderBottom: '1px solid var(--ws-ink-150)' }}>
        <div>
          <div className="ws-label-eyebrow">Per-Question Overrides</div>
          <div style={{ fontSize: '13px', color: 'var(--ws-ink-500)', marginTop: '4px' }}>
            Adjust answer space for individual questions
          </div>
        </div>
      </div>
      <div className="ws-card__body" style={{ padding: '0', maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ borderBottom: '1px solid var(--ws-ink-150)', background: 'var(--ws-ink-50)', textAlign: 'left' }}>
              <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--ws-ink-600)' }}>Question</th>
              <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--ws-ink-600)', width: '60px', textAlign: 'center' }}>Marks</th>
              <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--ws-ink-600)', width: '100px', textAlign: 'center' }}>Lines</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec) => (
              <React.Fragment key={sec.id}>
                <tr>
                  <td colSpan={3} style={{ padding: '8px 16px', background: 'var(--ws-ink-50)', fontWeight: 600, color: 'var(--ws-ink-700)', fontSize: '12px', borderTop: '1px solid var(--ws-ink-150)' }}>
                    {sec.title || 'Untitled Section'}
                  </td>
                </tr>
                {(sec.cardIds || []).map((id, idx) => {
                  const q = cardsById[id];
                  if (!q) return null;
                  const questionSummary = splitQuestionSummary(q);
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid var(--ws-ink-100)' }}>
                      <td style={{ padding: '8px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ws-ink-800)', fontSize: '13px', marginBottom: '2px' }}>Q{idx + 1}.</div>
                        <div style={{ color: 'var(--ws-ink-500)', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {questionSummary.preview}
                        </div>
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'center', color: 'var(--ws-ink-700)', fontWeight: 500 }}>
                        {q.marks || 0}
                      </td>
                      <td style={{ padding: '8px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <EditableLines
                            cardId={q.id}
                            initialLines={q.writing_space_lines}
                            initialType={q.writing_space_type}
                            onUpdateCard={onUpdateCard}
                            defaultLines={paperSettings?.writableLineCount ?? 0}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PreviewOptions({ options = [] }) {
  if (!options.length) return null;
  return (
    <div className="ws-paper-doc__options">
      {options.map((opt, idx) => (
        <div key={opt.id || idx} className="ws-paper-doc__option">
          <span className="ws-paper-doc__option-key">({opt.key || String.fromCharCode(65 + idx)})</span>
          <span className="ws-paper-doc__option-text">{cleanText(opt.text || '')}</span>
        </div>
      ))}
    </div>
  );
}

function PaperSettingsPanel({ builderLayout = {}, onUpdateLayout, paperType, onChangePaperType, paperSettings = {}, onUpdatePaperSettings, pdfViewMode, computedTotalMarks }) {
  const [isOpen, setIsOpen] = useState(true);
  const [totalMarksInput, setTotalMarksInput] = useState(String(builderLayout.totalMarks ?? computedTotalMarks ?? 100));

  // Sync local state if builderLayout.totalMarks changes externally
  const layoutTotalMarks = builderLayout.totalMarks;
  React.useEffect(() => {
    setTotalMarksInput(String(layoutTotalMarks ?? computedTotalMarks ?? 100));
  }, [layoutTotalMarks, computedTotalMarks]);

  const handleTotalMarksBlur = () => {
    if (totalMarksInput.trim() === '') {
      onUpdateLayout?.({ totalMarks: null });
      return;
    }
    const parsed = parseInt(totalMarksInput, 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 1000) {
      onUpdateLayout?.({ totalMarks: parsed });
    } else {
      // Revert to last valid value
      setTotalMarksInput(String(builderLayout.totalMarks ?? computedTotalMarks ?? 100));
    }
  };

  return (
    <div className="ws-settings-panel" style={{ flexShrink: 0 }}>
      <button
        type="button"
        className="ws-settings-panel__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ borderBottom: isOpen ? '1px solid var(--ws-ink-150)' : 'none' }}
      >
        <Settings2 size={14} />
        <span>Paper Settings</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="ws-settings-panel__body" style={{ animation: 'none', padding: '16px' }}>
          <div className="ws-settings-panel__row">
            <label className="ws-settings-panel__label">Header Title</label>
            <input
              className="ws-settings-panel__input"
              value={builderLayout.headerTitle || ''}
              onChange={(e) => onUpdateLayout?.({ headerTitle: e.target.value })}
              placeholder="E.g. University of Technology"
            />
          </div>
          <div className="ws-settings-panel__row">
            <label className="ws-settings-panel__label">Subtitle</label>
            <input
              className="ws-settings-panel__input"
              value={builderLayout.headerSubtitle || ''}
              onChange={(e) => onUpdateLayout?.({ headerSubtitle: e.target.value })}
              placeholder="E.g. Mid-Semester Examination"
            />
          </div>
          <div className="ws-settings-panel__grid">
            <div className="ws-settings-panel__row">
              <label className="ws-settings-panel__label">Total Marks</label>
              <input
                type="text"
                inputMode="numeric"
                className="ws-settings-panel__input"
                placeholder={`Calculated: ${computedTotalMarks || 100}`}
                value={totalMarksInput}
                onChange={(e) => setTotalMarksInput(e.target.value)}
                onBlur={handleTotalMarksBlur}
              />
            </div>
            <div className="ws-settings-panel__row">
              <label className="ws-settings-panel__label">Duration</label>
              <input
                className="ws-settings-panel__input"
                value={builderLayout.examTime || '3 Hours'}
                onChange={(e) => onUpdateLayout?.({ examTime: e.target.value })}
                placeholder="3 Hours"
              />
            </div>
          </div>
          <div className="ws-settings-panel__row">
            <label className="ws-settings-panel__label">Institution</label>
            <input
              className="ws-settings-panel__input"
              value={builderLayout.institution || ''}
              onChange={(e) => onUpdateLayout?.({ institution: e.target.value })}
              placeholder="E.g. University of Technology"
            />
          </div>
          <div className="ws-settings-panel__grid">
            <div className="ws-settings-panel__row">
              <label className="ws-settings-panel__label">Course</label>
              <input
                className="ws-settings-panel__input"
                value={builderLayout.course || ''}
                onChange={(e) => onUpdateLayout?.({ course: e.target.value })}
                placeholder="E.g. B.Tech CSE"
              />
            </div>
            <div className="ws-settings-panel__row">
              <label className="ws-settings-panel__label">Subject Code</label>
              <input
                className="ws-settings-panel__input"
                value={builderLayout.subject || ''}
                onChange={(e) => onUpdateLayout?.({ subject: e.target.value })}
                placeholder="SPC101"
              />
            </div>
          </div>
          <div className="ws-settings-panel__row">
            <label className="ws-settings-panel__label">General Instructions</label>
            <textarea
              className="ws-settings-panel__textarea"
              rows={3}
              value={builderLayout.instructions || ''}
              onChange={(e) => onUpdateLayout?.({ instructions: e.target.value })}
              placeholder="1. Attempt all questions.\n2. All questions carry equal marks."
            />
          </div>


        </div>
      )}
    </div>
  );
}



function LibrarySortableCard({ card, added, questionSummary }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: `lib-${card.id}`,
    data: { type: 'LibraryCard', card },
    disabled: added,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`ws-mini-card ${added ? 'ws-mini-card--added' : ''}`}
      style={{ 
        opacity: isDragging ? 0.5 : (added ? 0.45 : 1), 
        touchAction: 'none', 
        cursor: added ? 'default' : 'grab',
        pointerEvents: added ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <div className="ws-mini-card__top">
        <span className="ws-tag ws-tag--neutral">{TYPE_LABEL_MAP[card.question_type] || 'Q'}</span>
        <span style={{ fontWeight: 600, color: 'var(--ws-ink-700)' }}>{card.marks || 0}M</span>
        <div style={{ marginLeft: 'auto' }}><DifficultyDots level={card.difficulty} /></div>
      </div>
      <div className="ws-mini-card__title">{questionSummary.title}</div>
      <div className="ws-mini-card__preview">{questionSummary.preview}</div>
    </div>
  );
}

function SectionDropZone({ section, isSectionDropTarget, setSectionRef, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${section.id}`,
    data: { type: 'Section', sectionId: section.id },
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (setSectionRef) setSectionRef(node);
      }}
      className={`ws-section-block ${(isOver || isSectionDropTarget) ? 'ws-section-block--drop' : ''}`}
      data-section-id={section.id}
    >
      {children}
    </div>
  );
}

function BuilderSortableRow({
  card,
  sectionId,
  idx,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdateCardMarks,
  pdfViewMode,
  paperSettings,
  onUpdateCard,
  questionSummary,
  hasOptions,
  optionList,
  EditableMarks,
  EditableLines,
  cleanText
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${sectionId}-${card.id}-${idx}`,
    data: { type: 'SectionCard', card, sectionId, idx },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ws-builder-row ${isExpanded ? 'ws-builder-row--expanded' : ''}`}
    >
      <div className="ws-builder-row__header">
        <div className="ws-builder-row__left">
          <div
            {...attributes}
            {...listeners}
            className="ws-builder-row__grip"
            style={{ cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <GripVertical size={16} color="var(--ws-ink-300)" />
          </div>
          <div className="ws-builder-row__index">
            <div className="ws-builder-row__num">Q{idx + 1}</div>
            <span className="ws-tag ws-tag--neutral">{TYPE_LABEL_MAP[card.question_type] || 'Q'}</span>
          </div>
          <div className="ws-builder-row__content">
            <div className="ws-builder-row__title" title={questionSummary.title}>
              {questionSummary.title}
            </div>
            <div className="ws-builder-row__preview" title={questionSummary.preview}>
              {questionSummary.preview}
            </div>
          </div>
        </div>
        <div className="ws-builder-row__right">
          <EditableMarks cardId={card.id} initialMarks={card.marks || 0} onUpdateCardMarks={onUpdateCardMarks} />
          {pdfViewMode === 'writable' && (
            <EditableLines
              cardId={card.id}
              initialLines={card.writing_space_lines}
              onUpdateCard={onUpdateCard}
              defaultLines={paperSettings?.writableLineCount || 5}
            />
          )}
          <button
            type="button"
            className="ws-builder-row__expand"
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse question' : 'Expand question'}
          >
            {isExpanded ? <EyeOff size={15} /> : <Eye size={15} />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            type="button"
            className="ws-builder-row__remove"
            onClick={onRemove}
            title="Remove Question"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ws-builder-row__details">
          <div className="ws-builder-row__full-text">{questionSummary.fullText}</div>
          {hasOptions && (
            <div className="ws-builder-row__options">
              {optionList.slice(0, 4).map((opt, optIdx) => (
                <div key={optIdx} className="ws-builder-row__option">
                  <span className="ws-builder-row__option-key">({opt.key || String.fromCharCode(65 + optIdx)})</span>
                  <span className="ws-builder-row__option-text">{cleanText(opt.text)}</span>
                </div>
              ))}
              {optionList.length > 4 && (
                <div className="ws-builder-row__option-more">+{optionList.length - 4} more</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuilderWorkspace({
  mode = 'compose',
  cards,
  sections,
  updateSections,
  paperTitle,
  setPaperTitle,
  paperSettings,
  courseContext,
  builderLayout = {},
  onUpdateBuilderLayout,
  paperType = 'standard',
  onChangePaperType,
  onExport,
  onFinalize,
  onUpdateCardMarks,
  onUpdatePaperSettings,
  onUpdateCard,
}) {
  const [pdfViewMode, setPdfViewMode] = useState('standard');
  const [libSearch, setLibSearch] = useState('');
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [pendingFocusSectionId, setPendingFocusSectionId] = useState(null);
  const builderCanvasRef = useRef(null);
  const sectionRefs = useRef({});
  const sectionTitleRefs = useRef({});
  const autoExpandTimeoutRef = useRef(null);
  const autoExpandSectionIdRef = useRef(null);
  const [activeDragItem, setActiveDragItem] = useState(null);
  
  const isComposeMode = mode === 'compose';
  const isFinalizeMode = mode === 'finalize';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const cardsById = useMemo(() => {
    const map = {};
    cards.forEach((c) => {
      map[c.id] = c;
      map[String(c.id)] = c;
    });
    return map;
  }, [cards]);

  const addedIds = useMemo(() => {
    const s = new Set();
    sections.forEach((sec) => (sec.cardIds || []).forEach((idObj) => {
      const id = typeof idObj === 'object' && idObj !== null ? idObj.id : idObj;
      s.add(String(id));
    }));
    return s;
  }, [sections]);

  const { totalMarks, count } = useMemo(() => {
    let tMarks = 0;
    let c = 0;
    sections.forEach((sec) => {
      (sec.cardIds || []).forEach((id) => {
        const q = cardsById[id];
        if (!q) return;
        tMarks += Number(q.marks) || 0;
        c += 1;
      });
    });
    return { totalMarks: tMarks, count: c };
  }, [sections, cardsById]);

  const targetMarks = builderLayout?.totalMarks || paperSettings?.totalMarks || 100;
  const marksPercent = Math.min(100, Math.round((totalMarks / targetMarks) * 100));

  const resolvedBuilderLayout = useMemo(() => ({
    ...builderLayout,
    headerTitle: builderLayout.headerTitle || paperTitle,
    institution: builderLayout.institution || courseContext?.institution || 'University',
    course: builderLayout.course || courseContext?.name || 'Course',
    subject: builderLayout.subject || courseContext?.code || 'Code',
    subjectCode: builderLayout.subjectCode || builderLayout.subject_code || courseContext?.code || '',
  }), [builderLayout, courseContext, paperTitle]);

  const standardDocument = useMemo(() => {
    try {
      return buildPaperDocument({
        cards,
        sections,
        builderLayout: resolvedBuilderLayout,
        paperSettings,
        paperType: 'standard',
      });
    } catch (err) {
      console.error("Error building standard paper document:", err);
      return { error: err.message || String(err) };
    }
  }, [cards, sections, resolvedBuilderLayout, paperSettings]);

  const writableDocument = useMemo(() => {
    try {
      return buildPaperDocument({
        cards,
        sections,
        builderLayout: resolvedBuilderLayout,
        paperSettings,
        paperType: 'writable',
      });
    } catch (err) {
      console.error("Error building writable paper document:", err);
      return { error: err.message || String(err) };
    }
  }, [cards, sections, resolvedBuilderLayout, paperSettings]);

  const paperDocument = pdfViewMode === 'writable' ? writableDocument : standardDocument;

  const filteredLib = useMemo(() => {
    const q = libSearch.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter((c) => {
      const hay = (cleanText(c.question_body) + ' ' + (c.tags_json || []).join(' ')).toLowerCase();
      return hay.includes(q);
    });
  }, [cards, libSearch]);

  useEffect(() => {
    if (!sections.length) return;

    if (pendingFocusSectionId && sections.some((section) => section.id === pendingFocusSectionId)) {
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        next.delete(pendingFocusSectionId);
        return next;
      });
    }
  }, [sections, pendingFocusSectionId]);

  useEffect(() => {
    if (!pendingFocusSectionId) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const sectionNode = sectionRefs.current[pendingFocusSectionId];
      const inputNode = sectionTitleRefs.current[pendingFocusSectionId];
      sectionNode?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (inputNode) {
        inputNode.focus();
        inputNode.select?.();
      }
      setPendingFocusSectionId(null);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pendingFocusSectionId, sections]);


  const toggleSection = (id) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleQuestionExpanded = (sectionId, cardId, index) => {
    const key = `${sectionId}:${cardId}:${index}`;
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearAutoExpandTimeout = () => {
    if (autoExpandTimeoutRef.current) {
      window.clearTimeout(autoExpandTimeoutRef.current);
      autoExpandTimeoutRef.current = null;
    }
    autoExpandSectionIdRef.current = null;
  };

  const scheduleSectionExpand = (sectionId) => {
    if (!collapsedSections.has(sectionId)) {
      clearAutoExpandTimeout();
      return;
    }

    if (autoExpandSectionIdRef.current === sectionId) return;

    clearAutoExpandTimeout();
    autoExpandSectionIdRef.current = sectionId;
    autoExpandTimeoutRef.current = window.setTimeout(() => {
      setCollapsedSections((prev) => {
        if (!prev.has(sectionId)) return prev;
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
      autoExpandTimeoutRef.current = null;
      autoExpandSectionIdRef.current = null;
    }, 500);
  };

  useEffect(() => () => {
    clearAutoExpandTimeout();
  }, []);

  const handleDragStart = ({ active }) => {
    console.log('[DnD] Drag Start', active.id);
    setActiveDragItem(active);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    console.log('[DnD] Drag Over', over.id);
    const overType = over.data.current?.type;
    if (overType === 'Section' || overType === 'SectionCard') {
      const sectionId = over.data.current?.sectionId;
      if (sectionId) scheduleSectionExpand(sectionId);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveDragItem(null);
    clearAutoExpandTimeout();
    if (!over) return;
    
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    const activeId = active.id;
    const overId = over.id;

    if (activeType === 'Section' && overType === 'Section' && activeId !== overId) {
      updateSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === activeId);
        const newIndex = prev.findIndex((s) => s.id === overId);
        console.log('[DnD] Section Updated (reordered)', { oldIndex, newIndex });
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (activeType === 'LibraryCard') {
      const card = active.data.current?.card;
      if (!card) return;
      const targetSectionId = over.data.current?.sectionId;
      if (!targetSectionId) return;

      updateSections((prev) => {
        const targetSec = prev.find(s => s.id === targetSectionId);
        if (!targetSec || targetSec.cardIds?.includes(String(card.id))) return prev;
        
        let insertIndex = targetSec.cardIds?.length || 0;
        if (overType === 'SectionCard') {
          insertIndex = over.data.current?.idx;
        }
        
        console.log('[DnD] Drop Success');
        console.log(`[DnD] Question Added: ${card.id} to section ${targetSectionId} at index ${insertIndex}`);
        
        return prev.map(s => {
          if (s.id === targetSectionId) {
            const nextIds = [...(s.cardIds || [])];
            nextIds.splice(insertIndex, 0, String(card.id));
            return { ...s, cardIds: nextIds };
          }
          return s;
        });
      });
    }

    if (activeType === 'SectionCard') {
      const activeSectionId = active.data.current?.sectionId;
      const targetSectionId = over.data.current?.sectionId;
      if (!activeSectionId || !targetSectionId) return;
      
      const cardId = active.data.current?.card?.id;

      if (activeSectionId === targetSectionId) {
        const oldIndex = active.data.current?.idx;
        let newIndex = over.data.current?.idx ?? over.data.current?.cardIds?.length ?? 0;
        
        if (oldIndex !== newIndex) {
          console.log('[DnD] Drop Success');
          console.log(`[DnD] Section Updated (question reordered within section ${activeSectionId})`);
          updateSections((prev) => prev.map(s => {
            if (s.id === activeSectionId) {
              return { ...s, cardIds: arrayMove(s.cardIds || [], oldIndex, newIndex) };
            }
            return s;
          }));
        }
      } else {
        let insertIndex = over.data.current?.idx ?? (overType === 'Section' ? (prev => { const t=prev.find(s=>s.id===targetSectionId); return t?t.cardIds.length:0; }) : 0);
        updateSections((prev) => {
          if (typeof insertIndex === 'function') insertIndex = insertIndex(prev);
          const oldIndex = active.data.current?.idx;
          const newIndex = insertIndex;
          console.log('[DnD] Drop Success');
          console.log(`[DnD] Question Removed from section ${activeSectionId}`);
          console.log(`[DnD] Question Added: ${cardId} to section ${targetSectionId}`);
          return prev.map(s => {
            if (s.id === activeSectionId) {
              const nextIds = [...(s.cardIds || [])];
              nextIds.splice(oldIndex, 1);
              return { ...s, cardIds: nextIds };
            }
            if (s.id === targetSectionId) {
              const nextIds = [...(s.cardIds || [])];
              nextIds.splice(newIndex, 0, String(cardId));
              return { ...s, cardIds: nextIds };
            }
            return s;
          });
        });
      }
    }
  };

  const removeCard = (sectionId, cardId) => {
    console.log(`[DnD] Question Removed from section ${sectionId}`);
    updateSections((prev) => {
      return prev.map((s) => {
        if (s.id === sectionId) {
          return { ...s, cardIds: (s.cardIds || []).filter((id) => String(id) !== String(cardId)) };
        }
        return s;
      });
    });
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    const newLabel = String.fromCharCode(65 + sections.length);
    setPendingFocusSectionId(newId);
    updateSections((prev) => [
      ...prev,
      { id: newId, title: `Section ${newLabel}`, instructions: '', cardIds: [] },
    ]);
  };

  const updateSectionMeta = (id, key, val) => {
    updateSections((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  const structureSummary = sections.map((sec) => {
    const sectionQuestionCount = (sec.cardIds || []).length;
    const sectionMarks = (sec.cardIds || []).reduce((sum, id) => sum + (Number(cardsById[id]?.marks) || 0), 0);
    return {
      id: sec.id,
      title: sec.title || 'Untitled Section',
      questionCount: sectionQuestionCount,
      marks: sectionMarks,
    };
  });

  const handleSectionDelete = (sectionId) => {
    updateSections((prev) => prev.filter((s) => s.id !== sectionId));
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.delete(sectionId);
      return next;
    });
    setExpandedQuestions((prev) => {
      const next = new Set([...prev].filter((key) => !key.startsWith(`${sectionId}:`)));
      return next;
    });
    delete sectionRefs.current[sectionId];
    delete sectionTitleRefs.current[sectionId];
  };

  const expandAllSections = () => {
    setCollapsedSections(new Set());
  };

  const collapseAllSections = () => {
    setCollapsedSections(new Set(sections.map((section) => section.id)));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        className={`ws-builder-layout ${isFinalizeMode ? 'ws-builder-layout--finalize' : 'ws-builder-layout--compose'}`} 
      style={{
        gridTemplateColumns: isComposeMode
          ? (isLibraryCollapsed ? '48px 1fr' : '280px 1fr')
          : (isSettingsCollapsed ? '48px 1fr' : '420px minmax(0, 1fr)'),
        transition: 'grid-template-columns 0.3s ease'
      }}
    >
      {/* TOP: Summary bar */}
      <div className="ws-builder-summary ws-fade-up">
        <div className="ws-summary-block" style={{ flex: 1 }}>
          <FileText size={20} color="var(--ws-ink-400)" />
          <input
            value={paperTitle || ''}
            onChange={(e) => setPaperTitle?.(e.target.value)}
            placeholder="Untitled Paper"
            style={{
              fontSize: 16, fontWeight: 700, border: 'none', background: 'transparent',
              outline: 'none', color: 'var(--ws-ink-900)', width: '100%',
              fontFamily: 'var(--ws-font-sans)',
            }}
          />
        </div>
        
        <div className="ws-summary-block">
          {isComposeMode && (
            <div className="ws-section-visibility-controls">
              <button type="button" className="ws-btn ws-btn--sm" onClick={expandAllSections}>
                Expand All Sections
              </button>
              <button type="button" className="ws-btn ws-btn--sm" onClick={collapseAllSections}>
                Collapse All Sections
              </button>
            </div>
          )}
          <div className="ws-summary-meter">
            <div className="ws-summary-meter__label">Total marks</div>
            <div className="ws-summary-meter__val">
              {totalMarks}
            </div>
          </div>
          {isFinalizeMode ? (
            <button type="button" className="ws-btn ws-btn--primary" onClick={onFinalize}>
              <CheckCircle2 size={14} /> Finalize
            </button>
          ) : (
            <div className="ws-summary-chip">
              <Layout size={14} />
              Arrange sections here, then finish in Paper Builder
            </div>
          )}
        </div>
      </div>

      {isComposeMode && (
        <div className={`ws-builder-library ws-fade-up ${isLibraryCollapsed ? 'ws-builder-library--collapsed' : ''}`} style={{ 
          animationDelay: '40ms',
          width: isLibraryCollapsed ? '48px' : '280px',
          minWidth: isLibraryCollapsed ? '48px' : '280px',
          transition: 'width 0.3s ease, min-width 0.3s ease'
        }}>
          <div className="ws-builder-library__head">
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                cursor: 'pointer',
                justifyContent: isLibraryCollapsed ? 'center' : 'flex-start',
                width: '100%'
              }} 
              onClick={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
            >
              {isLibraryCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              {!isLibraryCollapsed && <div className="ws-label-eyebrow">Question Library</div>}
            </div>
            {!isLibraryCollapsed && (
              <div className="ws-input">
                <Search size={14} />
                <input placeholder="Search library..." value={libSearch} onChange={(e) => setLibSearch(e.target.value)} />
              </div>
            )}
          </div>
          {!isLibraryCollapsed && (
            <div className="ws-builder-library__list">
              {filteredLib.map((c) => {
                const added = addedIds.has(String(c.id));
                const questionSummary = splitQuestionSummary(c);
                return (
                  <LibrarySortableCard key={c.id} card={c} added={added} questionSummary={questionSummary} />
                );
              })}
            </div>
          )}
        </div>
      )}

      <div
        ref={builderCanvasRef}
        className="ws-builder-canvas ws-fade-up"
        style={{ 
          animationDelay: '80ms',
          width: isFinalizeMode ? (isSettingsCollapsed ? '48px' : '420px') : undefined,
          minWidth: isFinalizeMode ? (isSettingsCollapsed ? '48px' : '420px') : undefined,
          padding: isFinalizeMode && isSettingsCollapsed ? '14px 4px 72px' : undefined,
          transition: isFinalizeMode ? 'width 0.3s ease, min-width 0.3s ease, padding 0.3s ease' : undefined,
          overflowX: 'hidden'
        }}
      >
        {isFinalizeMode && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isSettingsCollapsed ? 'center' : 'space-between',
              padding: '12px 14px',
              borderBottom: isSettingsCollapsed ? 'none' : '1px solid var(--ws-ink-150)',
              background: 'var(--ws-ink-50)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--ws-ink-700)',
              fontWeight: 600,
              fontSize: '13px',
              width: '100%',
              flexShrink: 0
            }}
            onClick={() => setIsSettingsCollapsed((prev) => !prev)}
            title={isSettingsCollapsed ? "Expand Settings" : "Collapse Settings"}
          >
            {!isSettingsCollapsed && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings2 size={14} />
                Builder Settings &amp; Structure
              </span>
            )}
            {isSettingsCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </div>
        )}

        {isFinalizeMode && !isSettingsCollapsed && (
          <>
            <PaperSettingsPanel
              builderLayout={builderLayout}
              onUpdateLayout={onUpdateBuilderLayout}
              paperType={paperType}
              onChangePaperType={onChangePaperType}
              computedTotalMarks={totalMarks}
              paperSettings={paperSettings}
              onUpdatePaperSettings={onUpdatePaperSettings}
              pdfViewMode={pdfViewMode}
            />

            {pdfViewMode === 'writable' ? (
              <PerQuestionLinesPanel
                sections={sections}
                cardsById={cardsById}
                paperSettings={paperSettings}
                onUpdateCard={onUpdateCard}
              />
            ) : (
              <div className="ws-card ws-builder-structure-card" style={{ margin: 0, flexShrink: 0 }}>
                <div className="ws-builder-structure-card__head">
                  <div>
                    <div className="ws-label-eyebrow">Question Paper Workspace</div>
                    <div className="ws-builder-structure-card__title">Sections locked in from step 3</div>
                  </div>
                  <div className="ws-builder-structure-card__meta">{count} questions</div>
                </div>
                <div className="ws-builder-structure-card__list">
                  {structureSummary.map((section) => (
                    <div key={section.id} className="ws-builder-structure-card__row">
                      <div>
                        <div className="ws-builder-structure-card__row-title">{section.title}</div>
                        <div className="ws-builder-structure-card__row-sub">
                          {section.questionCount} question{section.questionCount === 1 ? '' : 's'}
                        </div>
                      </div>
                      <div className="ws-builder-structure-card__row-marks">{section.marks} marks</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {isComposeMode && (
          <div className="ws-section-workspace-list">
            {sections.map((sec) => {
              const secMarks = (sec.cardIds || []).reduce((sum, id) => sum + (Number(cardsById[id]?.marks) || 0), 0);
              const qCount = (sec.cardIds || []).length;
              const isCollapsed = collapsedSections.has(sec.id);
              return (
                <SectionDropZone
                  key={sec.id}
                  section={sec}
                  isSectionDropTarget={activeDragItem && !activeDragItem.data.current?.idx && activeDragItem.data.current?.sectionId !== sec.id}
                  setSectionRef={(node) => {
                    if (node) sectionRefs.current[sec.id] = node;
                    else delete sectionRefs.current[sec.id];
                  }}
                >
                  <div className="ws-section-block__head">
                    <div className="ws-section-block__head-main">
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <GripVertical size={16} color="var(--ws-ink-300)" />
                      </div>
                      <div className="ws-section-block__title">
                        <input
                          ref={(node) => {
                            if (node) sectionTitleRefs.current[sec.id] = node;
                            else delete sectionTitleRefs.current[sec.id];
                          }}
                          value={sec.title}
                          onChange={(e) => updateSectionMeta(sec.id, 'title', e.target.value)}
                          placeholder="Section Name"
                        />
                        <div className="ws-section-block__meta">
                          <span>Questions: {qCount}</span>
                          <span>Marks: {secMarks}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ws-section-block__actions">
                      <button type="button" className="ws-section-block__action-btn" onClick={() => toggleSection(sec.id)} title={isCollapsed ? "Expand" : "Collapse"}>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button type="button" className="ws-section-block__action-btn" onClick={() => handleSectionDelete(sec.id)} title="Delete Section">
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`ws-section-block__summary ${!isCollapsed ? 'ws-section-block__summary--hidden' : ''}`}
                    onClick={() => toggleSection(sec.id)}
                    style={{ cursor: 'pointer' }}
                    aria-hidden={!isCollapsed}
                  >
                    {qCount === 0 ? 'No questions added yet' : `${qCount} Question${qCount !== 1 ? 's' : ''} • ${secMarks} Marks`}
                  </div>
                  <div
                    className={`ws-section-block__content ${isCollapsed ? 'ws-section-block__content--collapsed' : ''}`}
                    aria-hidden={isCollapsed}
                  >
                      <div className="ws-section-block__toolbar">
                        <input
                          className="ws-section-block__instructions"
                          placeholder="Optional section instructions (e.g. Answer any 5 questions)"
                          value={sec.instructions || ''}
                          onChange={(e) => updateSectionMeta(sec.id, 'instructions', e.target.value)}
                        />
                        <div className="ws-section-block__marks">{secMarks} Marks</div>
                      </div>
                      <div className={`ws-section-block__body ${(sec.cardIds || []).length === 0 ? 'ws-section-block__body--empty' : ''}`}>
                        <SortableContext items={(sec.cardIds || []).map((idObj, idx) => {
                          const id = typeof idObj === 'object' && idObj !== null ? idObj.id : idObj;
                          return `card-${sec.id}-${id}-${idx}`;
                        })} strategy={verticalListSortingStrategy}>
                          {(sec.cardIds || []).map((idObj, idx) => {
                            const id = typeof idObj === 'object' && idObj !== null ? idObj.id : idObj;
                            const q = cardsById[id];
                            if (!q) {
                              console.warn(`[DEBUG] Missing card for id: ${id}.`);
                              return null;
                            }

                            const optionList = Array.isArray(q.options) && q.options.length > 0
                              ? q.options
                              : (Array.isArray(q.parsed_metadata?.options) ? q.parsed_metadata.options : []);
                            const hasOptions = supportsOptions(q.question_type) && optionList.length > 0;
                            const questionSummary = splitQuestionSummary(q);
                            const questionKey = `${sec.id}:${id}:${idx}`;
                            const isExpanded = expandedQuestions.has(questionKey);

                            return (
                              <BuilderSortableRow
                                key={`${sec.id}-${id}-${idx}`}
                                card={q}
                                sectionId={sec.id}
                                idx={idx}
                                isExpanded={isExpanded}
                                onToggleExpand={() => toggleQuestionExpanded(sec.id, id, idx)}
                                onRemove={() => removeCard(sec.id, id)}
                                onUpdateCardMarks={onUpdateCardMarks}
                                pdfViewMode={pdfViewMode}
                                paperSettings={paperSettings}
                                onUpdateCard={onUpdateCard}
                                questionSummary={questionSummary}
                                hasOptions={hasOptions}
                                optionList={optionList}
                                EditableMarks={EditableMarks}
                                EditableLines={EditableLines}
                                cleanText={cleanText}
                                TYPE_LABEL_MAP={TYPE_LABEL_MAP}
                              />
                            );
                          })}
                        </SortableContext>
                        {(sec.cardIds || []).length === 0 && (
                          <div
                            className="ws-empty-state"
                            style={{ padding: '30px', textAlign: 'center', border: '2px dashed var(--ws-ink-200)', borderRadius: 8, color: 'var(--ws-ink-500)', width: '100%' }}
                            data-section-id={sec.id}
                          >
                            No questions added yet.
                            <br/>
                            Drag questions here from Question Library.
                          </div>
                        )}
                      </div>
                  </div>
                </SectionDropZone>
              );
            })}
            <button type="button" className="ws-btn ws-btn--ghost ws-section-workspace__add" onClick={addSection}>
              <Plus size={14} /> Add section
            </button>
          </div>
        )}
      </div>

      {isFinalizeMode && (
        <div className="ws-preview-pane ws-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="ws-preview-pane__toolbar">
            <div className="ws-label-eyebrow">Live Preview</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <select
                  className="ws-btn ws-btn--sm"
                  value={pdfViewMode}
                  onChange={(e) => setPdfViewMode(e.target.value)}
                  style={{ appearance: 'none', paddingRight: '24px', cursor: 'pointer', background: 'var(--ws-ink-0)' }}
                >
                  <option value="standard">Standard PDF View</option>
                  <option value="writable">Writable PDF View</option>
                </select>
                <ChevronDown size={12} color="var(--ws-ink-500)" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <button
                type="button"
                className="ws-btn ws-btn--sm"
                onClick={() => {
                  onExport?.({
                    paperType: pdfViewMode,
                    paperDocument,
                    builderLayout: resolvedBuilderLayout,
                    paperSettings,
                    paperTitle,
                  });
                }}
              >
                <Download size={12} /> Export PDF
              </button>
            </div>
          </div>
          <div className="ws-preview-pane__scroll">
            <LocalErrorBoundary>
              <PaperPreviewRenderer 
                paperDocument={paperDocument} 
                paperSettings={paperSettings} 
              />
            </LocalErrorBoundary>
          </div>
        </div>
      )}
        <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ sideEffects: ['transform'] })}>
          {activeDragItem?.data.current?.type === 'LibraryCard' ? (
            <LibrarySortableCard card={activeDragItem.data.current?.card} added={false} questionSummary={splitQuestionSummary(activeDragItem.data.current?.card)} TYPE_LABEL_MAP={TYPE_LABEL_MAP} />
          ) : null}
          {activeDragItem?.data.current?.type === 'SectionCard' ? (
            <BuilderSortableRow
              card={activeDragItem.data.current?.card}
              sectionId={activeDragItem.data.current?.sectionId}
              idx={activeDragItem.data.current?.idx}
              isExpanded={false}
              questionSummary={splitQuestionSummary(activeDragItem.data.current?.card)}
              EditableMarks={EditableMarks}
              EditableLines={EditableLines}
              cleanText={cleanText}
              TYPE_LABEL_MAP={TYPE_LABEL_MAP}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
