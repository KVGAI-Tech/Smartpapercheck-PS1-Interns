/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
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
} from '@dnd-kit/sortable';
import {
  Filter,
  LayoutGrid,
  List,
  PenSquare,
  Search,
  Sparkles,
  Trash2,
  X,
  GripVertical,
  ChevronRight,
  Settings,
  Plus
} from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import QuestionCard from './QuestionCard';
import { MASTER_EXAM_QUESTION_TYPES } from './masterExamCardSchema';

function BuilderSortableCard({ card, index, onRemove }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">
          {card.parsed_metadata?.title || 'Untitled Question'}
        </p>
        <p className="truncate text-xs text-slate-500">
           {(card.question_body || '').replace(/<[^>]+>/g, '').substring(0, 60)}...
        </p>
      </div>
      <div className="text-xs font-semibold text-emerald-600">{card.marks || 0}M</div>
      <button onClick={onRemove} className="text-slate-400 hover:text-rose-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function BuilderSourceCard({ card, sections, onAddToSection }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-slate-200 p-3 shadow-sm transition hover:border-emerald-300"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-slate-800">{card.parsed_metadata?.title || 'Untitled'}</p>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title="Drag into a section"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      <p className="mb-3 truncate text-xs text-slate-500">{(card.question_body || '').replace(/<[^>]+>/g, '').substring(0, 40)}...</p>
      <div className="flex flex-wrap gap-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => onAddToSection(sec.id, card.id)}
            className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
          >
            + {sec.title || 'Sec'}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortableSection({ section, cards, onRemoveSection, onUpdateSection, onRemoveCardFromSection }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { type: 'Section', section } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { setNodeRef: setDropZoneRef, isOver: isDropZoneOver } = useDroppable({
    id: `${section.id}::dropzone`,
    data: { type: 'Section', sectionId: section.id },
  });

  const sectionMarks = section.cards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);

  return (
    <div ref={setNodeRef} style={style} className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 rounded-t-2xl">
        <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical className="h-5 w-5" />
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-slate-600 transition-transform"
          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(90deg)' }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <input
            value={section.title}
            onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
            className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Section Title (e.g. Section A)"
          />
          <input
            value={section.instructions || ''}
            onChange={(e) => onUpdateSection(section.id, { instructions: e.target.value })}
            className="mt-1 w-full bg-transparent text-xs text-slate-500 outline-none placeholder:text-slate-400"
            placeholder="Optional instructions for this section..."
          />
        </div>
        <div className="text-sm font-semibold text-emerald-600">{sectionMarks} Marks</div>
        <button
          onClick={() => onRemoveSection(section.id)}
          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-3">
          <SortableContext items={section.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div
              ref={setDropZoneRef}
              className={`space-y-2 min-h-[60px] rounded-xl border border-dashed p-2 transition ${
                isDropZoneOver
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {section.cards.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Drag questions here
                </div>
              ) : (
                section.cards.map((card, index) => (
                  <BuilderSortableCard
                    key={card.id}
                    card={card}
                    index={index}
                    onRemove={() => onRemoveCardFromSection(section.id, card.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
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
  onCreateManualCard,
  activeCardId,
  readOnly = false,
  sections = [],
  setSections,
}) {
  const [workspaceMode, setWorkspaceMode] = useState('library'); // 'library' or 'builder'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter cards
  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = cards.filter((card) => {
      const matchesType = typeFilter === 'all' || card.question_type === typeFilter;
      if (!matchesType) return false;

      if (sourceFilter !== 'all') {
        if (card.source_document_id !== sourceFilter) return false;
      }

      if (!query) return true;

      const haystack = [
        card.question_body,
        card.parsed_metadata?.title,
        card.question_type_label,
        ...(card.tags_json || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    // Sort
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
  }, [cards, searchQuery, typeFilter, sourceFilter, sortBy]);

  // Stats
  const typeBreakdown = useMemo(() => {
    const counts = {};
    cards.forEach((card) => {
      const t = card.question_type || 'unknown';
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [cards]);
  const totalMarks = cards.reduce((sum, c) => sum + (Number(c.marks) || 0), 0);

  // Bulk select handlers
  const toggleBulkSelect = (cardId) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedCardIds(new Set(filteredCards.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedCardIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedCardIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedCardIds.size} selected cards?`)) return;
    await onBulkDelete?.(Array.from(selectedCardIds));
    setSelectedCardIds(new Set());
    setBulkMode(false);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = filteredCards.findIndex((c) => c.id === active.id);
    const newIndex = filteredCards.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(filteredCards, oldIndex, newIndex);
    onReorderCards?.(reordered.map((c) => c.id));
  };

  const [activeId, setActiveId] = useState(null);
  const [activeItemType, setActiveItemType] = useState(null);

  const handleBuilderDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveItemType(active.data.current?.type);
  };

  const handleBuilderDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItemType(null);
    if (!over) return;

    if (active.data.current?.type === 'Section' && over.data.current?.type === 'Section' && active.id !== over.id) {
      setSections((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id);
        const newIndex = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    if (active.data.current?.type === 'Card' && (over.data.current?.type === 'Card' || over.data.current?.type === 'Section')) {
      const activeCardId = active.id;
      const overId = over.id;

      setSections((prev) => {
        const sourceSection = prev.find((s) => s.cards.some((c) => c.id === activeCardId));
        const overSectionId = over.data.current?.sectionId || (typeof overId === 'string' ? overId.replace('::dropzone', '') : overId);
        const targetSection = prev.find((s) => s.id === overSectionId || s.id === overId || s.cards.some((c) => c.id === overId));

        if (!targetSection) return prev;

        const sourceCard = sourceSection?.cards.find((c) => c.id === activeCardId) || cards.find((c) => c.id === activeCardId);
        if (!sourceCard) return prev;

        const insertIndex = over.data.current?.type === 'Card'
          ? targetSection.cards.findIndex((c) => c.id === overId)
          : targetSection.cards.length;

        if (!sourceSection) {
          return prev.map((section) => (
            section.id === targetSection.id
              ? {
                  ...section,
                  cards: [
                    ...section.cards.slice(0, insertIndex),
                    sourceCard,
                    ...section.cards.slice(insertIndex),
                  ],
                }
              : section
          ));
        }

        if (sourceSection.id === targetSection.id) {
          const sectionIndex = prev.findIndex((s) => s.id === sourceSection.id);
          const oldIndex = sourceSection.cards.findIndex((c) => c.id === activeCardId);
          const newIndex = over.data.current?.type === 'Card'
            ? targetSection.cards.findIndex((c) => c.id === overId)
            : targetSection.cards.length - 1;
          
          const newSections = [...prev];
          newSections[sectionIndex] = {
            ...sourceSection,
            cards: arrayMove(sourceSection.cards, oldIndex, newIndex),
          };
          return newSections;
        } else {
          return prev.map((section) => {
            if (section.id === sourceSection.id) {
              return {
                ...section,
                cards: section.cards.filter((c) => c.id !== activeCardId),
              };
            }

            if (section.id === targetSection.id) {
              return {
                ...section,
                cards: [
                  ...section.cards.slice(0, insertIndex),
                  sourceCard,
                  ...section.cards.slice(insertIndex),
                ],
              };
            }

            return section;
          });
        }
      });
    }
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `section-${Date.now()}`,
        title: `Section ${String.fromCharCode(65 + prev.length)}`,
        instructions: '',
        cards: [],
      },
    ]);
  };

  const handleRemoveSection = (sectionId) => {
    if (!window.confirm('Remove this section? Cards will not be deleted.')) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId, updates) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const handleAddCardToSection = (sectionId, cardId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, cards: [...s.cards, card] }
          : s
      )
    );
  };

  const handleRemoveCardFromSection = (sectionId, cardId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, cards: s.cards.filter((c) => c.id !== cardId) }
          : s
      )
    );
  };

  const usedCardIds = useMemo(() => {
    const ids = new Set();
    sections.forEach((s) => s.cards.forEach((c) => ids.add(c.id)));
    return ids;
  }, [sections]);

  // Unique source documents for filter dropdown
  const sourceDocOptions = useMemo(() => {
    const map = new Map();
    documents.forEach((doc) => {
      if (!map.has(doc.id)) {
        map.set(doc.id, doc.original_filename);
      }
    });
    return Array.from(map.entries());
  }, [documents]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#fafbf9]">
      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-white px-5 py-3.5">
        {/* Title row */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Question Cards</h2>
            <p className="text-xs text-slate-500">
              {cards.length} cards · {totalMarks} total marks
            </p>
          </div>
          <div className="flex items-center gap-2">
            {bulkMode ? (
              <>
                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Deselect
                </button>
                {selectedCardIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete {selectedCardIds.size}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setBulkMode(false); deselectAll(); }}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={onCreateManualCard}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    New Card
                  </button>
                )}
                {!readOnly && cards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBulkMode(true)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    Bulk Select
                  </button>
                )}
              </>
            )}

            <div className="ml-2 flex items-center rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setWorkspaceMode('library')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  workspaceMode === 'library'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Card Library
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('builder')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  workspaceMode === 'builder'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Paper Builder
              </button>
            </div>
          </div>
        </div>

        {/* Search + Filters row */}
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, tags, topics..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
            />
          </label>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none"
          >
            <option value="all">All types</option>
            {MASTER_EXAM_QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} {typeBreakdown[t.value] ? `(${typeBreakdown[t.value]})` : ''}
              </option>
            ))}
          </select>

          {sourceDocOptions.length > 0 && (
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="max-w-[160px] truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option value="all">All sources</option>
              {sourceDocOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none"
          >
            <option value="order">Default order</option>
            <option value="marks">By marks</option>
            <option value="type">By type</option>
            <option value="source">By source</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-l-xl p-2 ${viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-r-xl p-2 ${viewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card grid / list */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {filteredCards.length === 0 && workspaceMode === 'library' ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-slate-300" />
            <div className="text-base font-semibold text-slate-700">
              {cards.length === 0
                ? 'No question cards yet'
                : 'No cards match your filters'}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {cards.length === 0
                ? 'Upload source papers from the left panel to start extracting questions automatically.'
                : 'Try adjusting your search or filter criteria.'}
            </div>
            {cards.length === 0 && !readOnly && (
              <button
                type="button"
                onClick={onCreateManualCard}
                className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                <PenSquare className="h-4 w-4" />
                Create manually
              </button>
            )}
          </div>
        ) : workspaceMode === 'library' ? (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredCards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className={
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'
                  : 'flex flex-col gap-3'
              }>
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
                    onToggleSelect={bulkMode ? toggleBulkSelect : undefined}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex h-full gap-5">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCorners} 
              onDragStart={handleBuilderDragStart} 
              onDragEnd={handleBuilderDragEnd}
            >
              {/* Left: Unassigned Cards */}
              <div className="w-[300px] shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Unassigned Questions</h3>
                <SortableContext items={filteredCards.filter((c) => !usedCardIds.has(c.id)).map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {filteredCards.filter((c) => !usedCardIds.has(c.id)).map((card) => (
                      <BuilderSourceCard
                        key={card.id}
                        card={card}
                        sections={sections}
                        onAddToSection={handleAddCardToSection}
                      />
                    ))}
                    {filteredCards.filter((c) => !usedCardIds.has(c.id)).length === 0 && (
                      <div className="mt-10 text-center text-xs text-slate-400">All cards assigned.</div>
                    )}
                  </div>
                </SortableContext>
              </div>

              {/* Right: Section Builder */}
              <div className="flex-1 overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Paper Sections</h3>
                  <button
                    onClick={handleAddSection}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Section
                  </button>
                </div>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4 pb-20">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        cards={cards}
                        onRemoveSection={handleRemoveSection}
                        onUpdateSection={handleUpdateSection}
                        onRemoveCardFromSection={handleRemoveCardFromSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
