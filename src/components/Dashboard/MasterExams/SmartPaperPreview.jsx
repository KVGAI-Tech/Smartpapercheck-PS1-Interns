/* eslint-disable react/prop-types */
import { FileText, LayoutTemplate, MonitorSmartphone, PenSquare } from 'lucide-react';

import { getPaperTypeMeta } from './paperBuilderSchema';
import { supportsOptions, supportsReasoning } from './masterExamCardSchema';

const typeIcons = {
  standard: FileText,
  online: MonitorSmartphone,
  writable: PenSquare,
};

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyInlineFormatting(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(.+?)\*(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function markdownLikeToHtml(text) {
  const normalized = escapeHtml(text).replace(/\r\n/g, '\n');
  const codeBlocks = [];
  const withCodePlaceholders = normalized.replace(/```([\s\S]*?)```/g, (_, code) => {
    const token = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre class="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-xs text-slate-100"><code>${code.trim()}</code></pre>`);
    return token;
  });

  const lines = withCodePlaceholders.split('\n');
  const blocks = [];
  let currentList = [];
  let currentParagraph = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push(`<ul class="list-disc pl-6 space-y-1">${currentList.map((item) => `<li>${applyInlineFormatting(item)}</li>`).join('')}</ul>`);
      currentList = [];
    }
  };

  const flushParagraph = () => {
    if (currentParagraph.length) {
      blocks.push(`<p>${applyInlineFormatting(currentParagraph.join('<br />'))}</p>`);
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      return;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      flushParagraph();
      currentList.push(bulletMatch[1]);
      return;
    }

    flushList();
    currentParagraph.push(trimmed);
  });

  flushList();
  flushParagraph();

  let html = blocks.join('');
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return html;
}

function renderRichText(value, fallback = '') {
  const text = typeof value === 'string' ? value : '';
  const html = text.includes('<')
    ? text
    : markdownLikeToHtml(text);

  return { __html: html || fallback };
}

function AnswerSpacePreview({ card, paperSettings, paperType }) {
  if (paperType !== 'writable') return null;

  const lines = Number(card.writing_space_lines || paperSettings.writableLineCount || 6);
  const boxHeight = Number(card.writing_space_height || paperSettings.writableBoxHeight || 160);
  const mode = card.writing_space_type || 'lines';

  if (mode === 'blank' || mode === 'box' || mode === 'drawing_area') {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Writable Area</div>
        <div className="rounded-xl border border-dashed border-emerald-300 bg-white" style={{ height: `${boxHeight}px` }} />
      </div>
    );
  }

  if (mode === 'grid' || mode === 'graph_grid') {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Graph Space</div>
        <div
          className="rounded-xl border border-emerald-200"
          style={{
            height: `${paperSettings.graphBoxHeight || 180}px`,
            backgroundImage: 'linear-gradient(to right, #d1fae5 1px, transparent 1px), linear-gradient(to bottom, #d1fae5 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Answer Space</div>
      <div className="space-y-3">
        {Array.from({ length: Math.max(lines, 3) }).map((_, index) => (
          <div key={index} className="h-5 border-b border-dashed border-emerald-300" />
        ))}
      </div>
    </div>
  );
}

function PreviewQuestion({ card, index, paperType, paperSettings, isSelected, onSelectCard, onUpdateCard }) {
  const options = card.parsed_metadata?.options || [];
  const imageStyle = card.parsed_metadata?.paper_image_style || {};
  const imageSize = imageStyle.size || 'large';
  const imageAlign = imageStyle.align || 'center';
  const imageHeight = Number(imageStyle.height || (paperType === 'writable' ? 220 : 260));
  const imageOffsetX = Number(imageStyle.offsetX || 0);
  const imageOffsetY = Number(imageStyle.offsetY || 0);

  const imageWidthClass = imageSize === 'full'
    ? 'w-full'
    : imageSize === 'medium'
      ? 'max-w-[360px]'
      : 'max-w-[520px]';

  const imageAlignClass = imageAlign === 'left'
    ? 'justify-start'
    : imageAlign === 'right'
      ? 'justify-end'
      : 'justify-center';

  const setImageStyle = (patch) => {
    onUpdateCard?.(card.id, (currentCard) => ({
      ...currentCard,
      parsed_metadata: {
        ...currentCard.parsed_metadata,
        paper_image_style: {
          ...(currentCard.parsed_metadata?.paper_image_style || {}),
          ...patch,
        },
      },
    }));
  };

  return (
    <div
      className={`print-question-block mb-6 break-inside-avoid rounded-2xl transition ${
        isSelected ? 'ring-2 ring-emerald-300 ring-offset-2' : 'hover:bg-slate-50/70'
      }`}
      onClick={() => onSelectCard?.(card.id)}
    >
      <div className="flex items-start gap-2">
        <div className="font-bold text-slate-900 min-w-[24px]">Q{index})</div>
        <div className="flex-1 text-[13px] leading-7 text-slate-900">
          <div
            className={`smart-paper-rich-text min-h-[48px] rounded-md px-1 py-0.5 outline-none ${
              isSelected ? 'focus:bg-emerald-50/50' : ''
            }`}
            contentEditable={isSelected}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={renderRichText(card.question_body, 'Question body will appear here.')}
            onClick={(event) => event.stopPropagation()}
            onBlur={(event) => onUpdateCard?.(card.id, (currentCard) => ({
              ...currentCard,
              question_body: event.currentTarget.innerHTML,
            }))}
          />
          
          {supportsOptions(card.question_type) && options.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {options.map((option) => (
                <div key={option.id}>
                  <span className="mr-2 font-medium">({option.key})</span>
                  <span dangerouslySetInnerHTML={renderRichText(option.text)} />
                </div>
              ))}
            </div>
          )}

          {card.image_urls?.length > 0 && (
            <div className={`mt-4 flex flex-col gap-3 ${imageAlignClass}`}>
              <div className={`flex flex-col gap-4 ${imageWidthClass}`}>
              {card.image_urls.slice(0, 2).map((url, imageIndex) => (
                <div key={`${card.id}-image-${imageIndex}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={url}
                    alt={`Question asset ${imageIndex + 1}`}
                    className="w-full object-contain bg-white"
                    style={{
                      maxHeight: `${imageHeight}px`,
                      height: 'auto',
                      transform: `translate(${imageOffsetX}px, ${imageOffsetY}px)`,
                      transformOrigin: 'center top',
                    }}
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ))}
              </div>
              {isSelected && (
                <div
                  className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3 py-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Image</span>
                  <button type="button" onClick={() => setImageStyle({ size: 'medium' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageSize === 'medium' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>S</button>
                  <button type="button" onClick={() => setImageStyle({ size: 'large' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageSize === 'large' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>M</button>
                  <button type="button" onClick={() => setImageStyle({ size: 'full' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageSize === 'full' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>L</button>
                  <button type="button" onClick={() => setImageStyle({ align: 'left' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageAlign === 'left' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Left</button>
                  <button type="button" onClick={() => setImageStyle({ align: 'center' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageAlign === 'center' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Center</button>
                  <button type="button" onClick={() => setImageStyle({ align: 'right' })} className={`rounded-lg px-2 py-1 text-xs font-semibold ${imageAlign === 'right' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700'}`}>Right</button>
                  <button type="button" onClick={() => setImageStyle({ height: Math.max(120, imageHeight - 40) })} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-700">-</button>
                  <span className="text-xs font-medium text-slate-700">{imageHeight}px</span>
                  <button type="button" onClick={() => setImageStyle({ height: Math.min(800, imageHeight + 40) })} className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-700">+</button>
                </div>
              )}
            </div>
          )}
          
          <AnswerSpacePreview card={card} paperSettings={paperSettings} paperType={paperType} />
        </div>
        
        {card.marks > 0 && (
          <div className="ml-4 shrink-0 font-bold text-slate-900">
            [{card.marks} Marks]
          </div>
        )}
      </div>
    </div>
  );
}

export default function SmartPaperPreview({
  title,
  paperType = 'standard',
  templateId = 'universal',
  builderLayout = {},
  paperSettings = {},
  sections = [],
  unsectionedCards = [],
  selectedCardId = null,
  onSelectCard = null,
  onUpdateBuilderField = null,
  onUpdateSection = null,
  onUpdateCard = null,
}) {
  const paperTypeMeta = getPaperTypeMeta(paperType);
  const TemplateIcon = typeIcons[paperType] || FileText;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[#f6f7f2] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Live Paper Preview</div>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{title || 'Untitled Paper'}</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <TemplateIcon className="h-3.5 w-3.5" />
            {paperTypeMeta.shortLabel}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="print-page-shell mx-auto max-w-[820px] rounded-[26px] border border-slate-300 bg-white p-10 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="border-b-2 border-slate-900 pb-5 text-center">
            <h2 className="font-serif text-2xl font-bold uppercase tracking-[0.08em] text-slate-950">
              {builderLayout.headerTitle || title || 'SmartPaperCheck Examination'}
            </h2>
            {(builderLayout.headerSubtitle || builderLayout.institution) && (
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                {builderLayout.headerSubtitle || builderLayout.institution}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:grid-cols-4">
              <div>Course: {builderLayout.course || 'Not set'}</div>
              <div>Subject: {builderLayout.subject || 'Not set'}</div>
              <div>Duration: {builderLayout.examTime || '3 Hours'}</div>
              <div>Marks: {builderLayout.totalMarks || 100}</div>
            </div>
            {builderLayout.instructions && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600">
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">General Instructions</div>
                <div
                  className="smart-paper-rich-text min-h-[36px] rounded-md outline-none focus:bg-emerald-50/50"
                  contentEditable={false}
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={renderRichText(builderLayout.instructions)}
                />
              </div>
            )}
          </div>

          <div className="mt-8 space-y-8">
            {sections.filter((section) => section.cards?.length > 0).map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      {section.section_key || 'Section'}
                    </div>
                    <h4 className="rounded-md text-lg font-semibold text-slate-900">{section.title}</h4>
                    {section.instructions && (
                      <div className="smart-paper-rich-text mt-1 min-h-[28px] rounded-md text-sm text-slate-500" dangerouslySetInnerHTML={renderRichText(section.instructions)} />
                    )}
                  </div>
                  {paperSettings.showSectionMarks !== false && (
                    <div className="text-sm font-bold text-slate-700">
                      {section.cards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0)} marks
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  {section.cards.map((card, index) => (
                    <PreviewQuestion
                      key={card.id}
                      card={card}
                      index={index + 1}
                      paperType={paperType}
                      paperSettings={paperSettings}
                      isSelected={selectedCardId === card.id}
                      onSelectCard={onSelectCard}
                      onUpdateCard={onUpdateCard}
                    />
                  ))}
                </div>
              </section>
            ))}

            {unsectionedCards.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Unsectioned Questions</div>
                </div>
                <div className="space-y-4">
                  {unsectionedCards.map((card, index) => (
                    <PreviewQuestion
                      key={card.id}
                      card={card}
                      index={index + 1}
                      paperType={paperType}
                      paperSettings={paperSettings}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
