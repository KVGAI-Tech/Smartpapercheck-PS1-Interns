/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
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
import {
  Brain,
  ChevronRight,
  Edit3,
  GripVertical,
  Import,
  LayoutGrid,
  List,
  PenSquare,
  Plus,
  Search,
  Tag,
  Sparkles,
  X,
} from 'lucide-react';

import QuestionCard from './QuestionCard';
import { MASTER_EXAM_QUESTION_TYPES } from './masterExamCardSchema';

function BuilderSortableCard({ card, index, onRemove, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab text-slate-400 transition hover:text-slate-700"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium text-slate-500">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 text-sm leading-6 text-slate-700">
          {(card.question_body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled question'}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
          <span>{card.marks || 0} marks</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(card);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <Edit3 className="h-3 w-3" />
            Edit
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function BuilderSourceCard({ card, sections, onAddToSection, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm leading-6 text-slate-700">
            {(card.question_body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled question'}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span>{card.marks || 0} marks</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(card);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="Drag into a section"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      {sections.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onAddToSection(section.id, card.id)}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          >
            Add to {section.title || 'Section'}
          </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SortableSection({ section, cardsById, onRemoveSection, onUpdateSection, onRemoveCardFromSection, onSelect, isSelected, onEditCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { type: 'Section', section } });

  const { setNodeRef: setDropZoneRef, isOver } = useDroppable({
    id: `${section.id}::dropzone`,
    data: { type: 'Section', sectionId: section.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  const sectionCards = (section.cardIds || [])
    .map((cardId) => cardsById.get(String(cardId)))
    .filter(Boolean);
  const sectionMarks = sectionCards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`rounded-[28px] border bg-white transition ${
        isSelected ? 'border-accent/25 shadow-[0_18px_40px_rgba(22,109,112,0.08)]' : 'border-slate-200/80'
      }`}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onSelect}
          className="mt-0.5 rounded-full border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-slate-400 transition hover:text-slate-700"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={section.title}
            onChange={(event) => onUpdateSection(section.id, { title: event.target.value })}
            className="w-full border-none bg-transparent p-0 text-base font-medium text-slate-950 outline-none placeholder:text-slate-300"
            placeholder="Section title"
          />
          <textarea
            value={section.instructions || ''}
            onChange={(event) => onUpdateSection(section.id, { instructions: event.target.value })}
            rows={2}
            className="mt-2 w-full resize-none border-none bg-transparent p-0 text-sm leading-6 text-slate-500 outline-none placeholder:text-slate-300"
            placeholder="Short instructions for this section"
          />
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-medium text-slate-700">{sectionMarks} Marks</div>
          <button
            type="button"
            onClick={() => onRemoveSection(section.id)}
            className="mt-2 text-xs text-slate-400 transition hover:text-rose-600"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        <SortableContext items={section.cardIds || []} strategy={verticalListSortingStrategy}>
          <div
            ref={setDropZoneRef}
            className={`min-h-[88px] space-y-2 rounded-[24px] border border-dashed px-3 py-3 transition ${
              isOver ? 'border-accent/40 bg-[#f5faf8]' : 'border-slate-200 bg-[#fafcfb]'
            }`}
          >
            {sectionCards.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 py-8 text-center text-sm text-slate-400">
                Drag questions here or use the quick add buttons from the library.
              </div>
            ) : (
              sectionCards.map((card, index) => (
                <BuilderSortableCard
                  key={card.id}
                  card={card}
                  index={index}
                  onRemove={() => onRemoveCardFromSection(section.id, card.id)}
                  onEdit={onEditCard}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}

export default function CardWorkspace({
  cards,
  documents,
  onEditCard,
  onDeleteCard,
  onDuplicateCard,
  onReorderCards,
  onBulkDelete,
  onBulkTag,
  onAiCategorize,
  onCreateManualCard,
  onOpenImportWorkspaceModal,
  activeCardId,
  readOnly = false,
  sections = [],
  setSections,
  initialMode = 'library',
  controlledSearchQuery,
  onSearchQueryChange,
  hideLocalSearch = false,
  showModeToggle = true,
}) {
  const [workspaceMode, setWorkspaceMode] = useState('library');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id || '');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : localSearchQuery;
  const setSearchQuery = onSearchQueryChange || setLocalSearchQuery;

  useEffect(() => {
    if (initialMode === 'builder' || initialMode === 'library') {
      setWorkspaceMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (!sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(sections[0]?.id || '');
    }
  }, [sections, selectedSectionId]);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = cards.filter((card) => {
      const matchesType = typeFilter === 'all' || card.question_type === typeFilter;
      if (!matchesType) return false;

      if (sourceFilter !== 'all' && card.source_document_id !== sourceFilter) {
        return false;
      }
      if (subjectFilter !== 'all' && (card.subject || card.parsed_metadata?.subject || '') !== subjectFilter) {
        return false;
      }
      if (topicFilter !== 'all' && (card.topic || card.parsed_metadata?.topic || '') !== topicFilter) {
        return false;
      }
      if (difficultyFilter !== 'all' && (card.difficulty || '') !== difficultyFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        card.question_body,
        card.question_type_label,
        ...(card.tags_json || []),
        card.parsed_metadata?.source_paper_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    if (sortBy === 'marks') {
      result = [...result].sort((a, b) => (b.marks || 0) - (a.marks || 0));
    } else if (sortBy === 'type') {
      result = [...result].sort((a, b) => (a.question_type || '').localeCompare(b.question_type || ''));
    } else if (sortBy === 'source') {
      result = [...result].sort((a, b) => (a.source_document_id || '').localeCompare(b.source_document_id || ''));
    } else {
      result = [...result].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    }

    return result;
  }, [cards, searchQuery, sortBy, sourceFilter, subjectFilter, topicFilter, difficultyFilter, typeFilter]);

  const typeBreakdown = useMemo(() => {
    const counts = {};
    cards.forEach((card) => {
      const type = card.question_type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [cards]);

  const totalMarks = cards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);
  const cardsById = useMemo(() => new Map(cards.map((card) => [String(card.id), card])), [cards]);
  const usedCardIds = useMemo(() => {
    const ids = new Set();
    sections.forEach((section) => {
      (section.cardIds || []).forEach((cardId) => ids.add(String(cardId)));
    });
    return ids;
  }, [sections]);

  const sourceDocOptions = useMemo(() => {
    const map = new Map();
    documents.forEach((doc) => {
      if (!map.has(doc.id)) map.set(doc.id, doc.original_filename);
    });
    return Array.from(map.entries());
  }, [documents]);

  const subjectOptions = useMemo(() => (
    Array.from(new Set(cards.map((card) => card.subject || card.parsed_metadata?.subject || '').filter(Boolean))).sort()
  ), [cards]);

  const topicOptions = useMemo(() => (
    Array.from(new Set(cards.map((card) => card.topic || card.parsed_metadata?.topic || '').filter(Boolean))).sort()
  ), [cards]);

  const difficultyOptions = useMemo(() => (
    Array.from(new Set(cards.map((card) => card.difficulty || '').filter(Boolean))).sort()
  ), [cards]);

  const sectionSummaries = useMemo(() => (
    sections.map((section) => {
      const sectionCards = (section.cardIds || [])
        .map((cardId) => cardsById.get(String(cardId)))
        .filter(Boolean);
      const marks = sectionCards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);
      return {
        ...section,
        count: sectionCards.length,
        marks,
      };
    })
  ), [cardsById, sections]);

  const toggleBulkSelect = (cardId) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const selectAll = () => setSelectedCardIds(new Set(filteredCards.map((card) => card.id)));
  const deselectAll = () => setSelectedCardIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedCardIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedCardIds.size} selected questions?`)) return;
    await onBulkDelete?.(Array.from(selectedCardIds));
    setSelectedCardIds(new Set());
    setBulkMode(false);
  };

  const handleBulkTag = async () => {
    const nextTags = window.prompt('Apply tags to selected questions (comma-separated)');
    if (!nextTags?.trim()) return;
    const tags = nextTags.split(',').map((tag) => tag.trim()).filter(Boolean);
    await onBulkTag?.(Array.from(selectedCardIds), tags);
    setSelectedCardIds(new Set());
    setBulkMode(false);
  };

  const handleBulkCategorize = async () => {
    await onAiCategorize?.(Array.from(selectedCardIds));
    setSelectedCardIds(new Set());
    setBulkMode(false);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = filteredCards.findIndex((card) => card.id === active.id);
    const newIndex = filteredCards.findIndex((card) => card.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(filteredCards, oldIndex, newIndex);
    onReorderCards?.(reordered.map((card) => card.id));
  };

  const handleBuilderDragEnd = ({ active, over }) => {
    if (!over) return;

    if (active.data.current?.type === 'Section' && over.data.current?.type === 'Section' && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((section) => section.id === active.id);
        const newIndex = prev.findIndex((section) => section.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (active.data.current?.type !== 'Card') return;

    const activeCardId = active.id;
    const overId = over.id;

    setSections((prev) => {
      const sourceSection = prev.find((section) => (section.cardIds || []).some((cardId) => String(cardId) === String(activeCardId)));
      const overSectionId = over.data.current?.sectionId || (typeof overId === 'string' ? overId.replace('::dropzone', '') : overId);
      const targetSection = prev.find((section) => (
        section.id === overSectionId
        || section.id === overId
        || (section.cardIds || []).some((cardId) => String(cardId) === String(overId))
      ));

      if (!targetSection) return prev;

      const sourceCard = cards.find((card) => String(card.id) === String(activeCardId));
      if (!sourceCard) return prev;

      const insertIndex = over.data.current?.type === 'Card'
        ? (targetSection.cardIds || []).findIndex((cardId) => String(cardId) === String(overId))
        : (targetSection.cardIds || []).length;

      if (!sourceSection) {
        return prev.map((section) => {
          const nextCardIds = (section.cardIds || []).filter((cardId) => String(cardId) !== String(activeCardId));
          if (section.id !== targetSection.id) return { ...section, cardIds: nextCardIds };
          return {
            ...section,
            cardIds: [
              ...nextCardIds.slice(0, insertIndex),
              sourceCard.id,
              ...nextCardIds.slice(insertIndex),
            ],
          };
        });
      }

      if (sourceSection.id === targetSection.id) {
        const sectionIndex = prev.findIndex((section) => section.id === sourceSection.id);
        const oldIndex = (sourceSection.cardIds || []).findIndex((cardId) => String(cardId) === String(activeCardId));
        const newIndex = over.data.current?.type === 'Card'
          ? (targetSection.cardIds || []).findIndex((cardId) => String(cardId) === String(overId))
          : Math.max(0, (targetSection.cardIds || []).length - 1);

        const nextSections = [...prev];
        nextSections[sectionIndex] = {
          ...sourceSection,
          cardIds: arrayMove(sourceSection.cardIds || [], oldIndex, newIndex),
        };
        return nextSections;
      }

      return prev.map((section) => {
        if (section.id === sourceSection.id) {
          return {
            ...section,
            cardIds: (section.cardIds || []).filter((cardId) => String(cardId) !== String(activeCardId)),
          };
        }

        if (section.id === targetSection.id) {
          const nextCardIds = (section.cardIds || []).filter((cardId) => String(cardId) !== String(activeCardId));
          return {
            ...section,
            cardIds: [
              ...nextCardIds.slice(0, insertIndex),
              sourceCard.id,
              ...nextCardIds.slice(insertIndex),
            ],
          };
        }

        return section;
      });
    });
  };

  const handleAddSection = () => {
    const nextSection = {
      id: `section-${Date.now()}`,
      title: `Section ${String.fromCharCode(65 + sections.length)}`,
      instructions: '',
      cardIds: [],
      parsed_metadata: {},
    };
    setSections((prev) => [...prev, nextSection]);
    setSelectedSectionId(nextSection.id);
  };

  const handleRemoveSection = (sectionId) => {
    if (!window.confirm('Remove this section? Cards will remain in the library.')) return;
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const handleUpdateSection = (sectionId, updates) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)));
  };

  const handleAddCardToSection = (sectionId, cardId) => {
    setSections((prev) => prev.map((section) => {
      const nextCardIds = (section.cardIds || []).filter((existingId) => String(existingId) !== String(cardId));
      if (section.id !== sectionId) return { ...section, cardIds: nextCardIds };
      return { ...section, cardIds: [...nextCardIds, cardId] };
    }));
    setSelectedSectionId(sectionId);
  };

  const handleAddCardToPaper = (cardOrId) => {
    const cardId = typeof cardOrId === 'object' ? cardOrId.id : cardOrId;
    const firstSectionId = sections[0]?.id;
    if (!firstSectionId) {
      const nextSection = {
        id: `section-${Date.now()}`,
        title: 'Section A',
        instructions: '',
        cardIds: [cardId],
        parsed_metadata: {},
      };
      setSections((prev) => [...prev, nextSection]);
      setSelectedSectionId(nextSection.id);
      return;
    }
    handleAddCardToSection(firstSectionId, cardId);
  };

  const handleRemoveCardFromSection = (sectionId, cardId) => {
    setSections((prev) => prev.map((section) => (
      section.id === sectionId
        ? { ...section, cardIds: (section.cardIds || []).filter((existingId) => String(existingId) !== String(cardId)) }
        : section
    )));
  };

  const unassignedCards = filteredCards.filter((card) => !usedCardIds.has(String(card.id)));

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Question Workspace</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Question library</h2>
              <span className="text-sm text-slate-500">{cards.length} questions · {totalMarks} marks</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {bulkMode ? (
              <>
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  Clear
                </button>
                {selectedCardIds.size > 0 ? (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="rounded-full border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete {selectedCardIds.size}
                  </button>
                ) : null}
                {selectedCardIds.size > 0 ? (
                  <button
                    type="button"
                    onClick={handleBulkTag}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-4 w-4" />
                      Bulk tag
                    </span>
                  </button>
                ) : null}
                {selectedCardIds.size > 0 ? (
                  <button
                    type="button"
                    onClick={handleBulkCategorize}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Brain className="h-4 w-4" />
                      AI categorize
                    </span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setBulkMode(false);
                    deselectAll();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={onCreateManualCard}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <PenSquare className="h-4 w-4" />
                      New Question
                    </span>
                  </button>
                ) : null}
                {!readOnly && cards.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setBulkMode(true)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    Bulk Select
                  </button>
                ) : null}
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => onAiCategorize?.(filteredCards.map((card) => card.id))}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Categorize
                    </span>
                  </button>
                ) : null}
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => onOpenImportWorkspaceModal?.()}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Import className="h-4 w-4" />
                      Import Questions
                    </span>
                  </button>
                ) : null}
              </>
            )}

            {showModeToggle ? (
              <div className="flex items-center rounded-full border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('library')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    workspaceMode === 'library' ? 'bg-[#eef6f3] text-accent' : 'text-slate-500'
                  }`}
                >
                  Library
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode('builder')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    workspaceMode === 'builder' ? 'bg-[#eef6f3] text-accent' : 'text-slate-500'
                  }`}
                >
                  Builder
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!hideLocalSearch ? (
            <label className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search questions, tags, or source papers"
                className="h-10 w-full rounded-full border border-slate-200 bg-[#fafcfb] pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
              />
            </label>
          ) : null}

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
          >
            <option value="all">All types</option>
            {MASTER_EXAM_QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} {typeBreakdown[type.value] ? `(${typeBreakdown[type.value]})` : ''}
              </option>
            ))}
          </select>

          {sourceDocOptions.length > 0 ? (
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="h-10 max-w-[220px] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
            >
              <option value="all">All sources</option>
              {sourceDocOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          ) : null}

          {subjectOptions.length > 0 ? (
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="h-10 max-w-[220px] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
            >
              <option value="all">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          ) : null}

          {topicOptions.length > 0 ? (
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="h-10 max-w-[220px] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
            >
              <option value="all">All topics</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          ) : null}



          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
          >
            <option value="order">Default order</option>
            <option value="marks">By marks</option>
            <option value="type">By type</option>
            <option value="source">By source</option>
          </select>

          <div className="flex items-center rounded-full border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {workspaceMode === 'library' ? (
          filteredCards.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white text-center">
              <Sparkles className="h-8 w-8 text-slate-300" />
              <div className="mt-4 text-lg font-medium text-slate-700">
                {cards.length === 0 ? 'No questions yet' : 'No questions match these filters'}
              </div>
              <div className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {cards.length === 0
                  ? 'Import source papers or create a question manually to begin building the library.'
                  : 'Try a broader search, a different type filter, or another source selection.'}
              </div>
              {cards.length === 0 && !readOnly ? (
                <button
                  type="button"
                  onClick={onCreateManualCard}
                  className="mt-5 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Create manually
                </button>
              ) : null}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredCards.map((card) => card.id)} strategy={rectSortingStrategy}>
                <div className={viewMode === 'grid' ? 'grid gap-4 lg:grid-cols-2 2xl:grid-cols-3' : 'space-y-3'}>
                  {filteredCards.map((card, index) => (
                    <QuestionCard
                      key={card.id}
                      card={card}
                      displayIndex={index + 1}
                      isActive={activeCardId === card.id}
                      isSelected={bulkMode ? selectedCardIds.has(card.id) : false}
                      onEdit={onEditCard}
                      onDelete={onDeleteCard}
                      onDuplicate={onDuplicateCard}
                      onAddToPaper={handleAddCardToPaper}
                      onToggleSelect={bulkMode ? toggleBulkSelect : undefined}
                      readOnly={readOnly}
                      viewMode={viewMode}
                      isInPaper={usedCardIds.has(String(card.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )
        ) : (
          <div className="grid min-h-full gap-5 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleBuilderDragEnd}>
              <div className="min-h-0 rounded-[32px] border border-slate-200/80 bg-white p-4">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Question Library</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Unassigned questions</h3>
                </div>
                <SortableContext items={unassignedCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {unassignedCards.map((card) => (
                      <BuilderSourceCard
                        key={card.id}
                        card={card}
                        sections={sections}
                        onAddToSection={handleAddCardToSection}
                        onEdit={onEditCard}
                      />
                    ))}
                    {unassignedCards.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-slate-200 bg-[#fafcfb] px-4 py-8 text-center text-sm text-slate-500">
                        Every filtered question is already assigned to a section.
                      </div>
                    ) : null}
                  </div>
                </SortableContext>
              </div>

              <div className="min-h-0 rounded-[32px] border border-slate-200/80 bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Paper Outline</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">Sections</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Plus className="h-4 w-4" />
                      Section
                    </span>
                  </button>
                </div>

                <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        cardsById={cardsById}
                        onRemoveSection={handleRemoveSection}
                        onUpdateSection={handleUpdateSection}
                        onRemoveCardFromSection={handleRemoveCardFromSection}
                        onSelect={() => setSelectedSectionId(section.id)}
                        isSelected={selectedSectionId === section.id}
                        onEditCard={onEditCard}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </DndContext>

            <div className="min-h-0 rounded-[32px] border border-slate-200/80 bg-white p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Overview</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">Paper structure</h3>
              </div>

              <div className="mt-5 space-y-3">
                {sectionSummaries.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`w-full rounded-[24px] border px-4 py-3 text-left transition ${
                      selectedSectionId === section.id ? 'border-accent/25 bg-[#f7fbf9]' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-900">{section.title || 'Untitled section'}</div>
                    <div className="mt-1 text-xs text-slate-500">{section.count} questions · {section.marks} marks</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-[#fafcfb] px-4 py-4">
                <div className="text-sm font-medium text-slate-900">Draft summary</div>
                <div className="mt-2 text-sm text-slate-500">{cards.length} library questions</div>
                <div className="mt-1 text-sm text-slate-500">{usedCardIds.size} already placed in sections</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
