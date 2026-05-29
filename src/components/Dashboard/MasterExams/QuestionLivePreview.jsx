/* eslint-disable react/prop-types */

import { getQuestionTypeDefinition, supportsOptions, supportsReasoning } from './masterExamCardSchema';
import WritableAnswerArea from './WritableAnswerArea';

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
  const writablePreviewArea = (() => {
    const rawType = (card?.writing_space_type || '').toLowerCase();
    if (!rawType || rawType === 'none') return null;
    if (rawType === 'lines' || rawType === 'lined') return { mode: 'lined', lines: card?.writing_space_lines || 4 };
    if (rawType === 'steps') return { mode: 'steps', lines: card?.writing_space_lines || 5 };
    if (rawType === 'grid' || rawType === 'graph_grid' || rawType === 'graph') return { mode: 'graph', height: card?.writing_space_height || 120 };
    if (rawType === 'boxed' || rawType === 'box') return { mode: 'boxed', height: card?.writing_space_height || 120 };
    if (rawType === 'blank' || rawType === 'drawing_area') return { mode: 'blank', height: card?.writing_space_height || 120 };
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_44%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">
                Final Paper Preview
              </p>
              {metadata.title ? (
                <div className="mt-2 text-lg font-semibold text-slate-900">{metadata.title}</div>
              ) : null}
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
          <div className={`grid gap-6 pt-5 ${hasImages ? 'xl:grid-cols-[1fr_240px]' : 'grid-cols-1'}`}>
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
            {hasImages && (
              <div className="space-y-4">
                <div className="shrink-0 w-full">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Media</p>
                  <div className="relative group/img overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:border-slate-300 hover:shadow-md h-36 w-full flex items-center justify-center">
                    <img
                      src={card.image_urls[0]}
                      alt="Question Image"
                      loading="lazy"
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
              </div>
            )}
          </div>
        )}

        {/* Subjective Layout */}
        {!supportsOptions(card?.question_type) && (
          <div className="space-y-5 pt-5">
            {/* Top Row: Question text + Right-side image */}
            <div className={`grid gap-6 ${hasImages ? 'xl:grid-cols-[1fr_240px]' : 'grid-cols-1'}`}>
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

              {hasImages && (
                <div className="space-y-4">
                  <div className="shrink-0 w-full">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Media</p>
                    <div className="relative group/img overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:border-slate-300 hover:shadow-md h-36 w-full flex items-center justify-center">
                      <img
                        src={card.image_urls[0]}
                        alt="Question Image"
                        loading="lazy"
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
                </div>
              )}
            </div>

            {/* Bottom Row: Full-width Answer Writing Space Preview */}
            {writablePreviewArea && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Writable Space Preview ({card.writing_space_type})
                </p>
                <WritableAnswerArea answerArea={writablePreviewArea} />
              </div>
            )}
          </div>
        )}

        {/* MCQ with Reason Layout */}
        {supportsReasoning(card?.question_type) && (
          <div className={`grid gap-6 pt-5 ${(hasImages || metadata.reasoning_prompt) ? 'xl:grid-cols-[1fr_260px]' : 'grid-cols-1'}`}>
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
            {(hasImages || metadata.reasoning_prompt) && (
              <div className="space-y-4">
                {hasImages && (
                  <PreviewSection label="Media">
                    <div className="grid grid-cols-2 gap-2">
                      {card.image_urls.slice(0, 2).map((url, idx) => (
                        <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 h-20">
                          <img src={url} alt={`Asset ${idx + 1}`} loading="lazy" className="h-full w-full object-cover" />
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
            )}
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
