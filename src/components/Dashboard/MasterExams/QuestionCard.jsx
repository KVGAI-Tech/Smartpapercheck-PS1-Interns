/* eslint-disable react/prop-types */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Edit3, GripVertical, ImageIcon, Trash2, TriangleAlert } from 'lucide-react';

import { getQuestionTypeDefinition, supportsOptions } from './masterExamCardSchema';

const TYPE_STYLES = {
  mcq: 'bg-sky-50 text-sky-700',
  mcq_reasoning: 'bg-violet-50 text-violet-700',
  short_subjective: 'bg-amber-50 text-amber-700',
  long_subjective: 'bg-emerald-50 text-emerald-700',
  numerical: 'bg-cyan-50 text-cyan-700',
  true_false: 'bg-pink-50 text-pink-700',
  assertion_reason: 'bg-orange-50 text-orange-700',
  fill_blank: 'bg-lime-50 text-lime-700',
  case_study: 'bg-teal-50 text-teal-700',
  image_based: 'bg-rose-50 text-rose-700',
  diagram_based: 'bg-indigo-50 text-indigo-700',
};

const cleanText = (value = '') => (
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

function ActionButton({ title, onClick, children, danger = false, dragProps = null }) {
  const className = `flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 text-slate-400 transition hover:text-slate-700 ${
    danger ? 'border-rose-200 hover:border-rose-300 hover:text-rose-600' : 'border-slate-200 hover:border-slate-300'
  }`;

  if (dragProps) {
    return (
      <div
        {...dragProps}
        className={`${className} cursor-grab active:cursor-grabbing`}
        title={title}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}

export default function QuestionCard({
  card,
  onToggleSelect,
  isActive,
  onDelete,
  onEdit,
  onDuplicate,
  onAddToPaper,
  displayIndex,
  readOnly = false,
  isSelected = false,
  viewMode = 'grid',
  isInPaper = false,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeDefinition = getQuestionTypeDefinition(card.question_type);
  const typeStyle = TYPE_STYLES[card.question_type] || TYPE_STYLES.long_subjective;
  const tags = card.tags_json || [];
  const bodyPreview = cleanText(card.question_body);
  const hasImages = Array.isArray(card.image_urls) && card.image_urls.length > 0;
  const lowConfidence = card.ai_confidence !== null && card.ai_confidence !== undefined && card.ai_confidence < 0.8;
  const questionTitle = card.parsed_metadata?.title || '';

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={() => onEdit?.(card)}
      className={`group relative overflow-hidden rounded-[24px] border bg-white px-4 py-4 text-left transition duration-200 ${
        isActive
          ? 'border-accent/30 shadow-[0_18px_40px_rgba(22,109,112,0.12)]'
          : isSelected
            ? 'border-accent/25 bg-[#f7fbf9]'
            : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.05)]'
      } ${viewMode === 'list' ? 'w-full' : 'h-full'}`}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!readOnly ? (
          <ActionButton
            title="Reorder"
            dragProps={{ ...attributes, ...listeners }}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </ActionButton>
        ) : null}
        {onDuplicate && !readOnly ? (
          <ActionButton title="Duplicate" onClick={() => onDuplicate(card.id)}>
            <Copy className="h-3.5 w-3.5" />
          </ActionButton>
        ) : null}
        <ActionButton title={readOnly ? 'View' : 'Edit'} onClick={() => onEdit?.(card)}>
          <Edit3 className="h-3.5 w-3.5" />
        </ActionButton>
        {!readOnly ? (
          <ActionButton title="Delete" onClick={() => onDelete?.(card.id)} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionButton>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {displayIndex !== undefined ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              Q{displayIndex}
            </span>
          ) : null}
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${typeStyle}`}>
            {typeDefinition.label}
          </span>
          {lowConfidence ? (
            <span title={`AI confidence: ${Math.round((card.ai_confidence || 0) * 100)}%`}>
              <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
            </span>
          ) : null}
        </div>
        <div className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {card.marks || 0} marks
        </div>
      </div>

      <div className={`mt-4 ${viewMode === 'list' ? 'flex items-start gap-4' : 'space-y-3'}`}>
        <div className="min-w-0 flex-1">
          {questionTitle ? (
            <p className="line-clamp-1 text-sm font-semibold text-slate-900">{questionTitle}</p>
          ) : null}
          <p className="line-clamp-3 text-sm leading-7 text-slate-700">
            {bodyPreview || 'Untitled question'}
          </p>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                  {tag}
                </span>
              ))}
              {tags.length > 3 ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-400">
                  +{tags.length - 3}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {hasImages ? (
          <div className={`overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 ${
            viewMode === 'list' ? 'h-20 w-24 shrink-0' : 'h-24 w-full'
          }`}>
            <img
              src={card.image_urls[0]}
              alt="Question preview"
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : viewMode === 'list' ? null : (
          <div className="flex h-24 items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-[#fafcfb] text-slate-300">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
      </div>

      {!readOnly ? (
        <div
          className={`mt-4 flex items-center justify-between gap-3 ${onToggleSelect ? 'pr-8' : ''}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onAddToPaper?.(card)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              isInPaper
                ? 'bg-[#eef6f3] text-accent'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {isInPaper ? 'In paper' : 'Add to paper'}
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(card)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      ) : null}

      {onToggleSelect && !readOnly ? (
        <div
          className="absolute bottom-4 right-4"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(card.id)}
            className="h-4 w-4 rounded border-slate-300 text-accent accent-accent"
          />
        </div>
      ) : null}
    </article>
  );
}
