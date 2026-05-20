import React from 'react';
import { ImageIcon } from 'lucide-react';

import { getQuestionTypeDefinition, supportsOptions, supportsReasoning } from './masterExamCardSchema';

const PreviewSection = ({ label, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
    {children}
  </section>
);

export default function QuestionLivePreview({ card }) {
  const metadata = card?.parsed_metadata || {};
  const questionType = getQuestionTypeDefinition(card?.question_type);
  const options = metadata.options || [];
  const correctOptions = options.filter((option) => option.isCorrect);
  const rubricItems = (metadata.rubrics || []).filter((item) => item?.title || item?.description || item?.marks);
  const hasImages = card?.image_urls && card.image_urls.length > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_44%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
                Final Paper Preview
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {metadata.title || 'Untitled Question'}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{questionType.label}</span>
                <span>•</span>
                <span>{card.marks || 0} Marks</span>
                {card.difficulty ? (
                  <>
                    <span>•</span>
                    <span>{card.difficulty}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* MCQ Layout (no reasoning) */}
        {supportsOptions(card?.question_type) && !supportsReasoning(card?.question_type) && (
          <div className="grid gap-6 pt-5 xl:grid-cols-[1fr_240px]">
            {/* Left Column: Instructions, Question Body, Options */}
            <div className="space-y-4">
              {metadata.instructions && (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                  <p className="font-semibold">Instructions</p>
                  <p className="mt-1 whitespace-pre-wrap leading-6">{metadata.instructions}</p>
                </div>
              )}

              <div className="rounded-2xl bg-white px-1">
                <div 
                  className="text-[15px] leading-7 text-slate-800 ql-editor p-0"
                  dangerouslySetInnerHTML={{ __html: card?.question_body || 'Question text will appear here once you add it.' }} 
                />
              </div>

              {options.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm ${
                        option.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="mr-2 font-semibold">{option.key}.</span>
                      <span className="whitespace-pre-wrap">{option.text || 'Empty option'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Media (if image) + Metadata */}
            <div className="space-y-4">
              {hasImages && (
                <div className="shrink-0 w-full">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Media</p>
                  <div className="relative group/img overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:border-slate-300 hover:shadow-md h-36 w-full flex items-center justify-center">
                    <img
                      src={card.image_urls[0]}
                      alt="Question Image"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {card.image_urls.length > 1 && (
                      <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-[2px] ring-1 ring-white/10">
                        +{card.image_urls.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Subjective Layout */}
        {!supportsOptions(card?.question_type) && (
          <div className="space-y-5 pt-5">
            {/* Top Row: Question text + Right-side image */}
            <div className="grid gap-6 xl:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                {metadata.instructions && (
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                    <p className="font-semibold">Instructions</p>
                    <p className="mt-1 whitespace-pre-wrap leading-6">{metadata.instructions}</p>
                  </div>
                )}

                <div className="rounded-2xl bg-white px-1">
                  <div 
                    className="text-[15px] leading-7 text-slate-800 ql-editor p-0"
                    dangerouslySetInnerHTML={{ __html: card?.question_body || 'Question text will appear here once you add it.' }} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                {hasImages && (
                  <div className="shrink-0 w-full">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Media</p>
                    <div className="relative group/img overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:border-slate-300 hover:shadow-md h-36 w-full flex items-center justify-center">
                      <img
                        src={card.image_urls[0]}
                        alt="Question Image"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      {card.image_urls.length > 1 && (
                        <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-[2px] ring-1 ring-white/10">
                          +{card.image_urls.length - 1} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Row: Full-width Answer Writing Space Preview */}
            {card?.writing_space_type && card?.writing_space_type !== 'none' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Writable Space Preview ({card.writing_space_type})
                </p>
                {card.writing_space_type === 'lines' && (
                  <div className="space-y-1 overflow-hidden" style={{ minHeight: '60px', height: card.writing_space_height ? `${card.writing_space_height}px` : 'auto' }}>
                    {Array.from({ length: card.writing_space_lines || 4 }).map((_, i) => (
                      <div key={i} className="border-b border-dashed border-slate-300 h-6" />
                    ))}
                  </div>
                )}
                {card.writing_space_type === 'blank' && (
                  <div
                    className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white"
                    style={{ height: `${card.writing_space_height || 120}px` }}
                  >
                    <span className="text-xs text-slate-400 font-medium">Blank Answer / Sketching Space</span>
                  </div>
                )}
                {card.writing_space_type === 'grid' && (
                  <div
                    className="rounded-xl border border-slate-200 bg-white relative overflow-hidden"
                    style={{
                      height: `${card.writing_space_height || 120}px`,
                      backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-semibold text-slate-400/80 bg-white/90 px-2.5 py-1 rounded-md border border-slate-100 shadow-sm">
                        Graph Grid Workspace
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MCQ with Reason Layout */}
        {supportsReasoning(card?.question_type) && (
          <div className="grid gap-6 pt-5 xl:grid-cols-[1fr_260px]">
            {/* Left Column: Question body + Options */}
            <div className="space-y-4">
              {metadata.instructions && (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                  <p className="font-semibold">Instructions</p>
                  <p className="mt-1 whitespace-pre-wrap leading-6">{metadata.instructions}</p>
                </div>
              )}

              <div className="rounded-2xl bg-white px-1">
                <div 
                  className="text-[15px] leading-7 text-slate-800 ql-editor p-0"
                  dangerouslySetInnerHTML={{ __html: card?.question_body || 'Question text will appear here once you add it.' }} 
                />
              </div>

              {options.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`rounded-2xl border px-4 py-3 text-sm leading-6 shadow-sm ${
                        option.isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="mr-2 font-semibold">{option.key}.</span>
                      <span className="whitespace-pre-wrap">{option.text || 'Empty option'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Images + Rea Prompt Container + Metadata */}
            <div className="space-y-4">
              {hasImages && (
                <PreviewSection label="Media">
                  <div className="grid grid-cols-2 gap-2">
                    {card.image_urls.slice(0, 2).map((url, idx) => (
                      <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 h-20">
                        <img src={url} alt={`Asset ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </PreviewSection>
              )}

              {metadata.reasoning_prompt && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Reason Required</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-amber-900/80">{metadata.reasoning_prompt}</p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {(metadata.reference_answer || metadata.ai_generated_answer || metadata.explanation) ? (
        <PreviewSection label="Solutions">
          <div className="space-y-4 text-sm leading-6 text-slate-700">
            {correctOptions.length > 0 ? (
              <div>
                <p className="font-semibold text-slate-900">Correct Answer</p>
                <p className="mt-1">{correctOptions.map((option) => option.key).join(', ')}</p>
              </div>
            ) : null}
            {metadata.reference_answer ? (
              <div>
                <p className="font-semibold text-slate-900">Reference Answer</p>
                <p className="mt-1 whitespace-pre-wrap">{metadata.reference_answer}</p>
              </div>
            ) : null}
            {metadata.ai_generated_answer ? (
              <div>
                <p className="font-semibold text-slate-900">AI Generated Answer</p>
                <p className="mt-1 whitespace-pre-wrap">{metadata.ai_generated_answer}</p>
              </div>
            ) : null}
            {metadata.explanation ? (
              <div>
                <p className="font-semibold text-slate-900">Explanation</p>
                <p className="mt-1 whitespace-pre-wrap">{metadata.explanation}</p>
              </div>
            ) : null}
          </div>
        </PreviewSection>
      ) : null}

      {(rubricItems.length > 0 || metadata.reasoning_rubric || metadata.ai_evaluation_config) ? (
        <PreviewSection label="Evaluation">
          <div className="space-y-4">
            {rubricItems.length > 0 ? (
              <div className="space-y-2">
                {rubricItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">{item.title || 'Rubric item'}</p>
                      <span className="text-xs font-semibold text-slate-500">{item.marks || 0} marks</span>
                    </div>
                    {item.description ? <p className="mt-1 text-sm text-slate-600">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
            {metadata.reasoning_rubric ? (
              <div>
                <p className="font-semibold text-slate-900">Reasoning Rubric</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{metadata.reasoning_rubric}</p>
              </div>
            ) : null}
            {metadata.ai_evaluation_config ? (
              <div>
                <p className="font-semibold text-slate-900">AI Evaluation Config</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{metadata.ai_evaluation_config}</p>
              </div>
            ) : null}
          </div>
        </PreviewSection>
      ) : null}
    </div>
  );
}
