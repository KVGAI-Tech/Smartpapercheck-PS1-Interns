import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ImageIcon, Edit3 } from 'lucide-react';

export default function QuestionCard({ card, onSelect, onToggleSelect, isActive, onDelete, onEdit, isMini = false, displayIndex, readOnly = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasImages = card.image_urls && card.image_urls.length > 0;

  if (isMini) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative mb-2 cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md ${
          isActive ? 'border-accent ring-1 ring-accent' : 'border-slate-200'
        }`}
        onClick={() => onEdit?.(card)}
      >
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          {!readOnly && (
            <div
              {...attributes}
              {...listeners}
              className="mt-0.5 shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Q{displayIndex}</span>
              <span className="text-[10px] font-bold text-slate-500">{card.marks}M</span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
              {card.question_body}
            </p>
            {hasImages && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <ImageIcon className="h-3 w-3" />
                <span>{card.image_urls.length} images</span>
              </div>
            )}
          </div>

          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="rounded-md p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-3 cursor-pointer rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
        isActive ? 'border-accent ring-1 ring-accent' : 'border-slate-200'
      } ${!card.is_selected ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        {!readOnly && (
          <input
            type="checkbox"
            checked={card.is_selected || false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.(card.id);
            }}
            className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-accent accent-accent focus:ring-accent"
          />
        )}

        {/* Drag Handle */}
        {!readOnly && (
          <div
            {...attributes}
            {...listeners}
            className="mt-1 shrink-0 cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onEdit?.(card)}>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
            <span className="uppercase tracking-wide">{card.question_type || 'General'}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-accent">{card.marks} Marks</span>
          </div>
          
          <div className="line-clamp-3 text-sm leading-relaxed text-slate-800">
            {card.question_body}
          </div>

          {/* Image thumbnails */}
          {hasImages && (
            <div className="mt-2 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex gap-1">
                {card.image_urls.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="h-8 w-8 overflow-hidden rounded border border-slate-200 bg-slate-50">
                    <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ))}
                {card.image_urls.length > 3 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500">
                    +{card.image_urls.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {card.tags_json && card.tags_json.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.tags_json.map((tag, idx) => (
                <span key={idx} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(card);
            }}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-accent/10 hover:text-accent group-hover:opacity-100"
            title={readOnly ? "View Details" : "Edit"}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
