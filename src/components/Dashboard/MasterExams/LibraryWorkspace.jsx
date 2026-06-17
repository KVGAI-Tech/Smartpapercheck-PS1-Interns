/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { Search, X, Zap, History, Edit2, Plus } from 'lucide-react';

const TYPE_LABEL_MAP = {
  mcq: 'MCQ', short_subjective: 'Short Answer', long_subjective: 'Long Subjective',
  numerical: 'Numerical', diagram_based: 'Diagram', true_false: 'True/False',
};

function cleanText(value = '') {
  return value.replace(/\[\[IMAGE_SLOT:\d+\]\]/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function QuestionCard({ card, onEdit }) {
  const title = cleanText(card.question_body).slice(0, 100) || 'Untitled';
  const body = cleanText(card.question_body).slice(0, 200);
  const tags = card.tags_json || [];
  const typeLabel = TYPE_LABEL_MAP[card.question_type] || card.question_type || 'Question';
  const marks = card.marks || 0;
  const repeatCount = card.parsed_metadata?.repeat_count || 0;
  const usedIn = card.parsed_metadata?.used_in || [];

  return (
    <div
      className="ws-q-card"
      onClick={() => onEdit?.(card)}
      style={{ cursor: 'pointer' }}
    >
      <div className="ws-q-card__top">
        <span className="ws-q-card__type">{typeLabel}</span>
        <span className="ws-q-card__marks">{marks}M</span>
      </div>
      <div className="ws-q-card__title">{title}</div>
      <div className="ws-q-card__body">{body}</div>
      <div className="ws-q-card__tags">
        {tags.slice(0, 3).map((t) => <span key={t} className="ws-tag">{t}</span>)}
        {tags.length > 3 && <span className="ws-tag ws-tag--neutral">+{tags.length - 3}</span>}
      </div>
      <div className="ws-q-card__footer">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {usedIn.length > 0 && (
            <span title={`Used in ${usedIn.join(', ')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <History size={11} />{usedIn.length}
            </span>
          )}
          {repeatCount >= 5 && (
            <span className="ws-repeat-chip" title={`Appeared ${repeatCount}× in last 5 yrs`}>
              <Zap size={11} />{repeatCount}×
            </span>
          )}
        </div>
        <button
          type="button"
          className="ws-q-card__add"
          onClick={(e) => { e.stopPropagation(); onEdit?.(card); }}
          title="Edit question"
          style={{ color: 'var(--ws-ink-500)', background: 'var(--ws-ink-50)' }}
        >
          <Edit2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function LibraryWorkspace({
  cards,
  onEditCard,
  onContinue,
  onCreateNewQuestion,
}) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    types: new Set(),
    years: new Set(),
    exams: new Set(),
  });

  const toggleFilter = (group, value) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const s = new Set(prev[group]);
      if (s.has(value)) s.delete(value); else s.add(value);
      next[group] = s;
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (q) {
        const hay = (cleanText(card.question_body) + ' ' + (card.tags_json || []).join(' ')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (activeFilters.types.size && !activeFilters.types.has(card.question_type)) return false;
      const year = String(card.parsed_metadata?.source_year || '');
      if (activeFilters.years.size && year && !activeFilters.years.has(year)) return false;
      const examId = String(card.source_document_id || card.parsed_metadata?.source_exam_document_id || '');
      if (activeFilters.exams.size && examId && !activeFilters.exams.has(examId)) return false;
      return true;
    });
  }, [cards, search, activeFilters]);

  const counts = {
    long_subjective: cards.filter((c) => c.question_type === 'long_subjective').length,
    short_subjective: cards.filter((c) => c.question_type === 'short_subjective').length,
    numerical: cards.filter((c) => c.question_type === 'numerical').length,
    mcq: cards.filter((c) => c.question_type === 'mcq').length,
  };

  const years = useMemo(() => {
    const s = new Set();
    cards.forEach((c) => { if (c.parsed_metadata?.source_year) s.add(String(c.parsed_metadata.source_year)); });
    return Array.from(s).sort().reverse();
  }, [cards]);

  const exams = useMemo(() => {
    const examMap = new Map();
    cards.forEach((c) => {
      const examId = c.source_document_id || c.parsed_metadata?.source_exam_document_id;
      const examName = c.source_document_title || c.parsed_metadata?.source_exam_name || `Paper ${examId}`;
      if (examId) {
        if (!examMap.has(String(examId))) {
          examMap.set(String(examId), { id: String(examId), name: examName, count: 0 });
        }
        examMap.get(String(examId)).count++;
      }
    });
    return Array.from(examMap.values()).sort((a, b) => b.count - a.count);
  }, [cards]);

  return (
    <div className="ws-library-layout" style={{ position: 'relative' }}>
      {/* LEFT: filter rail */}
      <aside className="ws-filters-rail">
        <div className="ws-filters-rail__group">
          <div className="ws-filters-rail__title">Question type</div>
          {[
            { id: 'long_subjective', label: 'Long Subjective', n: counts.long_subjective },
            { id: 'short_subjective', label: 'Short Answer', n: counts.short_subjective },
            { id: 'numerical', label: 'Numerical', n: counts.numerical },
            { id: 'mcq', label: 'MCQ', n: counts.mcq },
          ].map((t) => (
            <label key={t.id} className="ws-filter-check">
              <input
                type="checkbox"
                checked={activeFilters.types.has(t.id)}
                onChange={() => toggleFilter('types', t.id)}
              />
              {t.label}
              <span className="ws-filter-check__count">{t.n}</span>
            </label>
          ))}
        </div>

        {years.length > 0 && (
          <div className="ws-filters-rail__group">
            <div className="ws-filters-rail__title">Source year</div>
            {years.map((y) => (
              <label key={y} className="ws-filter-check">
                <input
                  type="checkbox"
                  checked={activeFilters.years.has(y)}
                  onChange={() => toggleFilter('years', y)}
                />
                {y}
              </label>
            ))}
          </div>
        )}

        {exams.length > 0 && (
          <div className="ws-filters-rail__group">
            <div className="ws-filters-rail__title">Question Paper</div>
            {exams.map((exam) => (
              <label key={exam.id} className="ws-filter-check">
                <input
                  type="checkbox"
                  checked={activeFilters.exams.has(exam.id)}
                  onChange={() => toggleFilter('exams', exam.id)}
                />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exam.name}>
                  {exam.name}
                </span>
                <span className="ws-filter-check__count">{exam.count}</span>
              </label>
            ))}
          </div>
        )}
      </aside>

      {/* MIDDLE: main library */}
      <section className="ws-library-main">
        <div className="ws-library-toolbar">
          <div className="ws-search-bar ws-input ws-input--lg">
            <Search size={16} />
            <input
              placeholder="Search by question text, tag, topic, or paste a PYQ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="ws-btn ws-btn--ghost ws-btn--sm" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--ws-ink-500)' }}>
              {filtered.length} of {cards.length}
            </span>
          </div>
        </div>

        <div className="ws-library-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--ws-ink-700)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              All questions
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="ws-btn ws-btn--sm ws-btn--primary"
                onClick={onCreateNewQuestion}
                title="Create a new question manually"
              >
                <Plus size={14} />
                New Question
              </button>
            </div>
          </div>

          <div className="ws-q-grid">
            {filtered.map((card) => (
              <QuestionCard
                key={card.id}
                card={card}
                onEdit={onEditCard}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="ws-empty-state">
              <Search size={28} />
              <div>No questions match your filters</div>
              <button
                type="button"
                className="ws-btn ws-btn--sm"
                onClick={() => { setSearch(''); setActiveFilters({ types: new Set(), years: new Set(), exams: new Set() }); }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
