/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import {
  FileText, Plus, Search, GripVertical, X, Download, CheckCircle2, ChevronDown, ChevronRight,
} from 'lucide-react';
import DifficultyDots from './DifficultyDots';

const TYPE_LABEL_MAP = {
  mcq: 'MCQ', short_subjective: 'Short Answer', long_subjective: 'Long Subjective',
  numerical: 'Numerical', diagram_based: 'Diagram', true_false: 'True/False',
};

function cleanText(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function BuilderWorkspace({
  cards,
  sections,
  updateSections,
  paperTitle,
  setPaperTitle,
  paperSettings,
  courseContext,
  onExport,
  onFinalize,
}) {
  const [libSearch, setLibSearch] = useState('');
  const [dragOverSectionId, setDragOverSectionId] = useState(null);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);

  const cardsById = useMemo(() => {
    const map = {};
    cards.forEach((c) => { map[c.id] = c; });
    return map;
  }, [cards]);

  const addedIds = useMemo(() => {
    const s = new Set();
    sections.forEach((sec) => (sec.cardIds || []).forEach((id) => s.add(String(id))));
    return s;
  }, [sections]);

  const { totalMarks, difficulty, bloom, count } = useMemo(() => {
    let tMarks = 0;
    const diff = { easy: 0, medium: 0, hard: 0 };
    const blm = {};
    let c = 0;
    sections.forEach((sec) => {
      (sec.cardIds || []).forEach((id) => {
        const q = cardsById[id];
        if (!q) return;
        const m = Number(q.marks) || 0;
        tMarks += m;
        diff[q.difficulty || 'medium'] += m;
        const bLevel = q.parsed_metadata?.bloom_taxonomy || 'Remember';
        blm[bLevel] = (blm[bLevel] || 0) + m;
        c += 1;
      });
    });
    return { totalMarks: tMarks, difficulty: diff, bloom: blm, count: c };
  }, [sections, cardsById]);

  const targetMarks = paperSettings?.totalMarks || 100;
  const marksPercent = Math.min(100, Math.round((totalMarks / targetMarks) * 100));

  const filteredLib = useMemo(() => {
    const q = libSearch.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter((c) => {
      const hay = (cleanText(c.question_body) + ' ' + (c.tags_json || []).join(' ')).toLowerCase();
      return hay.includes(q);
    });
  }, [cards, libSearch]);

  const handleDrop = (e, sectionId) => {
    e.preventDefault();
    setDragOverSectionId(null);
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    
    // Check if already in this section
    const sec = sections.find(s => s.id === sectionId);
    if (sec?.cardIds?.includes(String(cardId))) return; // Already in this section

    updateSections((prev) => {
      return prev.map((s) => {
        if (s.id === sectionId) {
          return { ...s, cardIds: [...(s.cardIds || []), String(cardId)] };
        }
        return s;
      });
    });
  };

  const removeCard = (sectionId, cardId) => {
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
    const newLabel = String.fromCharCode(65 + sections.length); // A, B, C...
    updateSections((prev) => [
      ...prev,
      { id: newId, title: `Section ${newLabel}`, instructions: '', cardIds: [] },
    ]);
  };

  const updateSectionMeta = (id, key, val) => {
    updateSections((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  return (
    <div 
      className="ws-builder-layout" 
      style={{
        gridTemplateColumns: isLibraryCollapsed 
          ? '48px 0.8fr 1.2fr'  // When collapsed: smaller canvas, larger preview
          : '280px 1fr 1fr'      // When expanded: equal canvas and preview
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
          <div className="ws-summary-meter">
            <div className="ws-summary-meter__label">Total marks</div>
            <div className="ws-summary-meter__val">
              {totalMarks} <span style={{ color: 'var(--ws-ink-400)', fontSize: 13, fontWeight: 600 }}>/ {targetMarks}</span>
            </div>
            <div className="ws-summary-meter__bar">
              <div style={{ width: `${marksPercent}%`, background: marksPercent > 100 ? 'var(--ws-danger)' : 'var(--ws-brand)' }} />
            </div>
          </div>
          <button type="button" className="ws-btn ws-btn--primary" onClick={onFinalize}>
            <CheckCircle2 size={14} /> Finalize
          </button>
        </div>
      </div>

      {/* LEFT: Mini library */}
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
              return (
                <div
                  key={c.id}
                  className={`ws-mini-card ${added ? 'ws-mini-card--added' : ''}`}
                  draggable={!added}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(c.id));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <div className="ws-mini-card__top">
                    <span className="ws-tag ws-tag--neutral">{TYPE_LABEL_MAP[c.question_type] || 'Q'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--ws-ink-700)' }}>{c.marks || 0}M</span>
                    <div style={{ marginLeft: 'auto' }}><DifficultyDots level={c.difficulty} /></div>
                  </div>
                  <div className="ws-mini-card__title">
                    {cleanText(c.question_body).slice(0, 60)}...
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CENTER: Canvas */}
      <div className="ws-builder-canvas ws-fade-up" style={{ animationDelay: '80ms' }}>
        {/* Sections */}
        {sections.map((sec) => {
          const secMarks = (sec.cardIds || []).reduce((sum, id) => sum + (Number(cardsById[id]?.marks) || 0), 0);
          return (
            <div
              key={sec.id}
              className={`ws-section-block ${dragOverSectionId === sec.id ? 'ws-section-block--drop' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverSectionId(sec.id); }}
              onDragLeave={() => setDragOverSectionId(null)}
              onDrop={(e) => handleDrop(e, sec.id)}
            >
              <div className="ws-section-block__head">
                <div className="ws-section-block__title">
                  <input
                    value={sec.title}
                    onChange={(e) => updateSectionMeta(sec.id, 'title', e.target.value)}
                  />
                </div>
                <div className="ws-section-block__marks">{secMarks} Marks</div>
              </div>
              <div style={{ padding: '8px 14px 0' }}>
                <input
                  className="ws-section-block__instructions"
                  placeholder="Optional section instructions (e.g. Answer any 5 questions)"
                  value={sec.instructions || ''}
                  onChange={(e) => updateSectionMeta(sec.id, 'instructions', e.target.value)}
                />
              </div>
              <div className="ws-section-block__body">
                {(sec.cardIds || []).map((id, idx) => {
                  const q = cardsById[id];
                  if (!q) return null;
                  return (
                    <div key={`${sec.id}-${id}-${idx}`} className="ws-builder-row">
                      <GripVertical className="ws-builder-row__grip" size={14} />
                      <div className="ws-builder-row__num">{idx + 1}</div>
                      <div className="ws-builder-row__title">{cleanText(q.question_body)}</div>
                      <div className="ws-builder-row__marks">{q.marks || 0}M</div>
                      <button
                        type="button"
                        className="ws-builder-row__remove"
                        onClick={() => removeCard(sec.id, id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                {(sec.cardIds || []).length === 0 && (
                  <div className="ws-empty-state" style={{ padding: '20px', border: '1px dashed var(--ws-ink-200)', borderRadius: 8 }}>
                    Drag questions here from the library
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <button type="button" className="ws-btn ws-btn--ghost" onClick={addSection} style={{ alignSelf: 'center' }}>
          <Plus size={14} /> Add section
        </button>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="ws-preview-pane ws-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="ws-preview-pane__toolbar">
          <div className="ws-label-eyebrow">Live Preview</div>
          <button type="button" className="ws-btn ws-btn--sm" onClick={onExport}>
            <Download size={12} /> Export PDF
          </button>
        </div>
        <div className="ws-preview-pane__scroll">
          <div className="ws-paper-doc">
            <div className="ws-paper-doc__header">
              <div className="ws-paper-doc__institution">{courseContext?.institution || 'Institution Name'}</div>
              <h2 className="ws-paper-doc__title">{paperTitle || 'Untitled Paper'}</h2>
              <div className="ws-paper-doc__meta">
                <div><strong>Course</strong><span>{courseContext?.code || 'Course'}</span></div>
                <div><strong>Subject</strong><span>{courseContext?.name || 'Subject'}</span></div>
                <div><strong>Duration</strong><span>{paperSettings?.duration || '3 Hours'}</span></div>
                <div><strong>Max Marks</strong><span>{targetMarks}</span></div>
              </div>
            </div>
            {paperSettings?.instructions && (
              <div className="ws-paper-doc__instructions">{paperSettings.instructions}</div>
            )}
            
            {sections.map((sec) => (
              <div key={`prev-${sec.id}`} className="ws-paper-doc__section">
                <div className="ws-paper-doc__section-head">
                  <div className="ws-paper-doc__section-title">{sec.title}</div>
                  <div className="ws-paper-doc__section-marks">
                    [{(sec.cardIds || []).reduce((sum, id) => sum + (Number(cardsById[id]?.marks) || 0), 0)}]
                  </div>
                </div>
                {sec.instructions && (
                  <div style={{ fontStyle: 'italic', marginBottom: 12, fontSize: 12.5 }}>{sec.instructions}</div>
                )}
                {(sec.cardIds || []).map((id, idx) => {
                  const q = cardsById[id];
                  if (!q) return null;
                  const hasImages = Array.isArray(q.image_urls) && q.image_urls.length > 0;
                  return (
                    <div key={`prev-q-${id}-${idx}`} className="ws-paper-doc__q">
                      <div className="ws-paper-doc__qnum">Q{idx + 1}.</div>
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: q.question_body || '' }} />
                        {hasImages && (
                          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.image_urls.map((url, imgIdx) => (
                              url ? (
                                <img 
                                  key={imgIdx} 
                                  src={url} 
                                  alt={`Question ${idx + 1} image ${imgIdx + 1}`}
                                  style={{ 
                                    maxWidth: '100%', 
                                    height: 'auto',
                                    borderRadius: '4px',
                                    border: '1px solid var(--ws-ink-150)'
                                  }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ws-paper-doc__qmarks">[{q.marks}]</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
