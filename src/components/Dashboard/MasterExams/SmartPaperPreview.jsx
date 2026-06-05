/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { FileText, MonitorSmartphone, PenSquare } from 'lucide-react';

import { getPaperTypeMeta } from './paperBuilderSchema';
import { buildPaperDocument, isWritablePaperType } from './paperDocumentBuilder';
import WritableAnswerArea from './WritableAnswerArea';

const typeIcons = {
  standard: FileText,
  online: MonitorSmartphone,
  writable: PenSquare,
  technical_writable: PenSquare,
};

function PreviewInlineContent({ inlines = [] }) {
  return inlines.map((inline, index) => {
    const className = [
      inline?.marks?.bold ? 'font-semibold' : '',
      inline?.marks?.italic ? 'italic' : '',
      inline?.marks?.code ? 'rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px]' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span key={index} className={className}>
        {inline.text}
        {index < inlines.length - 1 ? ' ' : ''}
      </span>
    );
  });
}

function PreviewBlocks({ blocks = [] }) {
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="text-[13px] leading-7 text-slate-900">
              <PreviewInlineContent inlines={block.inlines} />
            </p>
          );
        }

        if (block.type === 'list') {
          const Tag = block.ordered ? 'ol' : 'ul';
          return (
            <Tag
              key={index}
              className={`space-y-1 pl-5 text-[13px] leading-7 text-slate-900 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
            >
              {(block.items || []).map((item, itemIndex) => (
                <li key={itemIndex}>
                  <PreviewInlineContent inlines={item.inlines} />
                </li>
              ))}
            </Tag>
          );
        }

        if (block.type === 'options') {
          return (
            <div key={index} className="mt-3 grid grid-cols-2 gap-3">
              {(block.options || []).map((option) => (
                <div key={option.id} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">({option.key})</div>
                  <PreviewBlocks blocks={option.blocks} />
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function PreviewQuestionImages({ images = [], layoutMode = {} }) {
  if (!images.length) return null;

  const sizeClass = layoutMode.imageSize === 'full'
    ? 'w-full'
    : layoutMode.imageSize === 'medium'
      ? 'max-w-[360px]'
      : 'max-w-[520px]';
  const alignClass = layoutMode.imageAlign === 'left'
    ? 'items-start'
    : layoutMode.imageAlign === 'right'
      ? 'items-end'
      : 'items-center';

  return (
    <div className={`mt-4 flex flex-col gap-3 ${alignClass}`}>
      {images.map((asset, index) => (
        <div key={asset.id || index} className={`overflow-hidden rounded-xl border border-slate-200 bg-white p-2 ${sizeClass}`}>
          <img
            src={asset.url}
            alt={asset.caption || `Question asset ${index + 1}`}
            className="w-full object-contain bg-white"
            style={{
              maxHeight: `${layoutMode.imageHeight || 220}px`,
              height: 'auto',
              objectFit: 'contain',
            }}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
}

function PreviewQuestionControls({ item, selectedCardId, onUpdateCard, paperType }) {
  if (selectedCardId !== item.cardId || !item.isFirstSegment) return null;

  const rawCard = item.rawCard || {};
  const imageStyle = rawCard.parsed_metadata?.paper_image_style || {};
  const imageSize = imageStyle.size || item.layoutMode.imageSize || 'large';
  const imageAlign = imageStyle.align || item.layoutMode.imageAlign || 'center';
  const imageHeight = Number(imageStyle.height || item.layoutMode.imageHeight || (paperType === 'writable' ? 200 : 220));
  const hasImages = Array.isArray(rawCard?.parsed_metadata?.imageAssets) && rawCard.parsed_metadata.imageAssets.length > 0
    || Array.isArray(rawCard?.image_urls) && rawCard.image_urls.length > 0;

  const setImageStyle = (patch) => {
    onUpdateCard?.(rawCard.id, (currentCard) => ({
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

  const writableSelectionValue = (() => {
    const rawValue = rawCard.writing_space_type || 'none';
    return rawValue === 'none' ? 'auto' : rawValue;
  })();

  return (
    <div className="mt-3 flex flex-col gap-3">
      {hasImages && (
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-[#fafcfb] px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Image</span>
          <button type="button" onClick={() => setImageStyle({ size: 'medium' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageSize === 'medium' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>S</button>
          <button type="button" onClick={() => setImageStyle({ size: 'large' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageSize === 'large' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>M</button>
          <button type="button" onClick={() => setImageStyle({ size: 'full' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageSize === 'full' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>L</button>
          <button type="button" onClick={() => setImageStyle({ align: 'left' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageAlign === 'left' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Left</button>
          <button type="button" onClick={() => setImageStyle({ align: 'center' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageAlign === 'center' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Center</button>
          <button type="button" onClick={() => setImageStyle({ align: 'right' })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${imageAlign === 'right' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>Right</button>
          <button type="button" onClick={() => setImageStyle({ height: Math.max(120, imageHeight - 40) })} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">-</button>
          <span className="text-xs font-medium text-slate-700">{imageHeight}px</span>
          <button type="button" onClick={() => setImageStyle({ height: Math.min(800, imageHeight + 40) })} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">+</button>
        </div>
      )}

      {isWritablePaperType(paperType) && (
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-[#fafcfb] px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700">Answer Area</span>
          <select
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none"
            value={writableSelectionValue}
            onChange={(event) => onUpdateCard?.(rawCard.id, (currentCard) => ({ ...currentCard, writing_space_type: event.target.value === 'auto' ? 'none' : event.target.value }))}
          >
            <option value="auto">Auto</option>
            <option value="no_space">No Space</option>
            <option value="lined">Lined</option>
            <option value="steps">Steps</option>
            <option value="blank">Blank</option>
            <option value="boxed">Boxed</option>
            <option value="graph">Graph</option>
          </select>
        </div>
      )}
    </div>
  );
}

function PreviewQuestionSegment({ item, paperSettings, paperType, isSelected, onSelectCard, onUpdateCard }) {
  return (
    <div
      className={`print-question-block rounded-[20px] px-2 py-1 transition ${isSelected ? 'bg-[#f7fbf9] ring-1 ring-accent/25' : ''}`}
      onClick={() => onSelectCard?.(item.cardId)}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-[30px] pt-0.5 font-bold text-slate-900">
          {item.showNumber ? `Q${item.questionDisplayNumber || item.questionNumber || item.questionLabel})` : ''}
        </div>
        <div className="flex-1">
          {item.blocks?.length > 0 && <PreviewBlocks blocks={item.blocks} />}
          {item.images?.length > 0 && <PreviewQuestionImages images={item.images} layoutMode={item.layoutMode} />}
          {item.answerArea && <WritableAnswerArea answerArea={item.answerArea} />}
          <PreviewQuestionControls
            item={item}
            selectedCardId={isSelected ? item.cardId : null}
            onUpdateCard={onUpdateCard}
            paperType={paperType}
          />
        </div>
        {item.showMarks && paperSettings.showQuestionMarks !== false && item.marks > 0 && (
          <div className="ml-3 shrink-0 font-bold text-slate-900">[{item.marks} Marks]</div>
        )}
      </div>
    </div>
  );
}

function PreviewSectionHeader({ item, sections, paperSettings, onUpdateSection }) {
  const section = sections.find((candidate) => candidate.id === item.sectionId) || {};
  const pageBreakBefore = Boolean(section.parsed_metadata?.page_break_before);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h4 className="text-[1.05rem] font-semibold text-slate-900">{item.title}</h4>
          {item.instructions?.length > 0 && (
            <div className="mt-1 text-sm leading-6 text-slate-500">
              <PreviewBlocks blocks={item.instructions} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {onUpdateSection && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer hover:text-emerald-600 transition">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                checked={pageBreakBefore}
                onChange={(event) => onUpdateSection(item.sectionId, (sectionDraft) => ({
                  ...sectionDraft,
                  parsed_metadata: {
                    ...(sectionDraft.parsed_metadata || {}),
                    page_break_before: event.target.checked,
                  },
                }))}
              />
              Page Break Before
            </label>
          )}
          {paperSettings.showSectionMarks !== false && (
            <div className="text-sm font-bold text-slate-700">{item.marks} marks</div>
          )}
        </div>
      </div>
    </section>
  );
}

function PageHeader({ header, page, builderLayout }) {
  const templateId = builderLayout.template_id || builderLayout.templateId || 'universal';
  if (page.headerMode === 'none') return null;

  if (page.headerMode === 'repeat') {
    return (
      <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="text-sm font-semibold text-slate-900">{header.title}</div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {builderLayout.subject || builderLayout.course || 'Exam'}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-300 pb-5 text-center">
      <h2 className={`text-2xl tracking-[0.02em] text-slate-950 ${templateId === 'university_format' ? 'font-bold uppercase' : 'font-semibold'}`}>
        {header.title}
      </h2>
      {header.subtitle && (
        <p className={`mt-2 text-sm uppercase tracking-[0.18em] text-slate-500 ${templateId === 'university_format' ? 'font-semibold' : 'font-medium'}`}>
          {header.subtitle}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 sm:grid-cols-4">
        <div>Course: {header.course || 'Not set'}</div>
        <div>Subject: {header.subject || 'Not set'}</div>
        <div>Duration: {header.examTime || '3 Hours'}</div>
        <div>Marks: {header.totalMarks || 100}</div>
      </div>
      {header.instructions?.length > 0 && (
        <div className={`mt-4 rounded-[22px] border p-4 text-left text-sm text-slate-600 ${templateId === 'university_format' ? 'border-slate-300 bg-white' : 'border-slate-200 bg-[#fafcfb]'}`}>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">General Instructions</div>
          <PreviewBlocks blocks={header.instructions} />
        </div>
      )}
    </div>
  );
}

export default function SmartPaperPreview({
  title,
  cards = [],
  paperType = 'standard',
  builderLayout = {},
  paperSettings = {},
  sections = [],
  paperDocument = null,
  selectedCardId = null,
  onSelectCard = null,
  onUpdateSection = null,
  onUpdateCard = null,
}) {
  const computedPaperDocument = useMemo(() => paperDocument || buildPaperDocument({
    cards,
    sections,
    builderLayout,
    paperSettings,
    paperType,
  }), [builderLayout, cards, paperDocument, paperSettings, paperType, sections]);
  const paperTypeMeta = getPaperTypeMeta(paperType);
  const TemplateIcon = typeIcons[paperType] || FileText;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-[#f3f5f2] shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200/80 bg-white/90 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Live Paper Preview</div>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{title || 'Untitled Paper'}</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eef6f3] px-3 py-1 text-[11px] font-bold text-accent">
            <TemplateIcon className="h-3.5 w-3.5" />
            {paperTypeMeta.shortLabel}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#edf1ec] p-5">
        <div className="space-y-6">
          {computedPaperDocument.pageDescriptors.map((page) => (
            <div
              key={page.id}
              className="print-page-shell mx-auto w-full max-w-[794px] min-h-[1123px] rounded-[10px] border border-slate-300/80 bg-white px-[15mm] py-[20mm] shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            >
              <PageHeader header={computedPaperDocument.header} page={page} builderLayout={builderLayout} />

              <div className="mt-8 space-y-5">
                {page.items.map((item) => (
                  item.type === 'sectionHeader' ? (
                    <PreviewSectionHeader
                      key={item.id}
                      item={item}
                      sections={sections}
                      paperSettings={paperSettings}
                      onUpdateSection={onUpdateSection}
                    />
                  ) : (
                    <PreviewQuestionSegment
                      key={item.id}
                      item={item}
                      paperSettings={paperSettings}
                      paperType={paperType}
                      isSelected={selectedCardId === item.cardId}
                      onSelectCard={onSelectCard}
                      onUpdateCard={onUpdateCard}
                    />
                  )
                ))}
              </div>

              {page.footerEnabled && (
                <div className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-400">
                  Page {page.pageNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
