/* eslint-disable react/prop-types */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Edit3, GripVertical, ImageIcon, Trash2, AlertTriangle } from 'lucide-react';

import { getQuestionTypeDefinition, supportsOptions, supportsReasoning } from './masterExamCardSchema';

const TYPE_COLORS = {
  mcq: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  mcq_reasoning: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  short_subjective: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  long_subjective: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  numerical: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  true_false: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  assertion_reason: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  case_study: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  image_based: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  diagram_based: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

function CardImageThumb({ imageUrl, imageCount }) {
  if (!imageUrl) return null;
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <img
        src={imageUrl}
        alt="Question"
        className="h-full w-full object-cover"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {imageCount > 1 && (
        <div className="absolute bottom-0.5 right-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
          +{imageCount - 1}
        </div>
      )}
    </div>
  );
}

function TagPill({ tag }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
      {tag}
    </span>
  );
}

function OptionPill({ optionKey, text, isCorrect }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] ${
      isCorrect
        ? 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-800'
        : 'border-slate-200 bg-white text-slate-600'
    }`}>
      <span className="font-bold">{optionKey}.</span>
      <span className="truncate">{text || 'Option text'}</span>
    </div>
  );
}

function McqCardContent({ options }) {
  const displayOptions = options.length > 0 ? options.slice(0, 4) : Array.from({ length: 4 });
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
      {displayOptions.map((opt, i) => (
        <OptionPill
          key={opt?.id || i}
          optionKey={opt?.key || String.fromCharCode(65 + i)}
          text={opt?.text}
          isCorrect={opt?.isCorrect}
        />
      ))}
    </div>
  );
}

function ReasoningRow() {
  return (
    <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Reasoning Required</div>
      <div className="mt-0.5 h-1.5 w-3/4 rounded-full bg-violet-200/70" />
    </div>
  );
}

export default function QuestionCard({
  card,
  onToggleSelect,
  isActive,
  onDelete,
  onEdit,
  onDuplicate,
  displayIndex,
  readOnly = false,
  isSelected = false,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasImages = card.image_urls && card.image_urls.length > 0;
  const parsedMetadata = card.parsed_metadata || {};
  const typeDefinition = getQuestionTypeDefinition(card.question_type);
  const title = parsedMetadata.title || card.question_title || '';
  const options = parsedMetadata.options || [];
  const tags = card.tags_json || [];
  const typeColors = TYPE_COLORS[card.question_type] || TYPE_COLORS.long_subjective;
  const isObjective = supportsOptions(card.question_type);
  const isReasoning = supportsReasoning(card.question_type);
  const lowConfidence = card.ai_confidence !== null && card.ai_confidence !== undefined && card.ai_confidence < 0.8;

  // Get source document info
  const sourceName = parsedMetadata.source_paper_name || '';
  const sourcePage = card.source_page_number;

  // Question body preview (clean text, max 2 lines)
  const bodyPreview = (card.question_body || '').replace(/<[^>]*>/g, '').trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md ${
        isActive
          ? 'border-emerald-400 shadow-[0_8px_24px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30'
          : isSelected
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={() => onEdit?.(card)}
    >
      {/* Hover actions */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!readOnly && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg border border-slate-200 bg-white/90 p-1.5 text-slate-400 shadow-sm backdrop-blur active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}
        {onDuplicate && !readOnly && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate?.(card.id); }}
            className="rounded-lg border border-slate-200 bg-white/90 p-1.5 text-slate-500 shadow-sm backdrop-blur hover:text-sky-600"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit?.(card); }}
          className="rounded-lg border border-slate-200 bg-white/90 p-1.5 text-slate-500 shadow-sm backdrop-blur hover:text-emerald-700"
          title={readOnly ? 'View' : 'Edit'}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }}
            className="rounded-lg border border-rose-200 bg-white/90 p-1.5 text-rose-500 shadow-sm backdrop-blur hover:text-rose-700"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Card header */}
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-0">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* Question index + type badge */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            {displayIndex !== undefined && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
                {displayIndex}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Type badge + marks row */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                {typeDefinition.label}
              </span>
              <span className="ml-auto shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {card.marks || 0} M
              </span>
              {lowConfidence && (
                <span className="shrink-0" title={`AI Confidence: ${Math.round((card.ai_confidence || 0) * 100)}%`}>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                </span>
              )}
            </div>

            {/* Title */}
            {title && (
              <div className="mt-1.5 text-sm font-semibold leading-tight text-slate-900 line-clamp-1">
                {title}
              </div>
            )}

            {/* Body preview */}
            {bodyPreview && (
              <div className="mt-1 text-[12px] leading-relaxed text-slate-500 line-clamp-2">
                {bodyPreview}
              </div>
            )}
          </div>

          {/* Image thumbnail - top right */}
          {hasImages && (
            <CardImageThumb imageUrl={card.image_urls[0]} imageCount={card.image_urls.length} />
          )}
          {!hasImages && (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <ImageIcon className="h-4 w-4 text-slate-300" />
            </div>
          )}
        </div>
      </div>

      {/* MCQ options grid */}
      {isObjective && (
        <div className="px-4">
          <McqCardContent options={options} />
        </div>
      )}

      {/* Reasoning row for MCQ+Reasoning */}
      {isReasoning && (
        <div className="px-4">
          <ReasoningRow />
        </div>
      )}

      {/* Footer: tags + source */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {tags.slice(0, 3).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] font-medium text-slate-400">+{tags.length - 3}</span>
          )}
        </div>
        {(sourceName || sourcePage) && (
          <div className="shrink-0 text-[10px] text-slate-400">
            {sourceName && <span>{sourceName}</span>}
            {sourcePage && <span>{sourceName ? ' · ' : ''}pg {sourcePage}</span>}
          </div>
        )}
      </div>

      {/* Selection checkbox */}
      {onToggleSelect && !readOnly && (
        <div
          className="absolute bottom-2.5 right-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(card.id)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
          />
        </div>
      )}
    </div>
  );
}
