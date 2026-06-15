/* eslint-disable react/prop-types */
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';

import { tw } from './PdfStyles';
import {
  PDF_A4_HEIGHT,
  PDF_A4_WIDTH,
  buildPaperDocument,
  PDF_PAGE_PADDING_X,
  PDF_PAGE_PADDING_Y,
  PDF_PAGE_HEIGHT,
  PDF_PAGE_WIDTH,
  validatePaperDocumentForExport,
} from '../paperDocumentBuilder';
import PdfWritableAnswerArea from './PdfWritableAnswerArea';

function PdfInlineContent({ inlines = [] }) {
  return inlines.map((inline, index) => {
    if (inline.type === 'br') {
      return <Text key={index}>{'\n'}</Text>;
    }
    return (
      <Text
        key={index}
        style={tw([
          inline?.marks?.bold ? 'font-bold' : '',
          inline?.marks?.italic ? 'italic' : '',
          inline?.marks?.code ? 'font-mono text-[10px]' : '',
        ]
          .filter(Boolean)
          .join(' '))}
      >
        {`${inline.text || ''}${index < inlines.length - 1 ? ' ' : ''}`}
      </Text>
    );
  });
}

function PdfBlocks({ blocks = [] }) {
  return (
    <View style={tw('flex flex-col gap-2')}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <Text key={index} style={tw('text-[11px] leading-relaxed text-slate-900')}>
              <PdfInlineContent inlines={block.inlines} />
            </Text>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={index} style={tw('flex flex-col gap-1 pl-3')}>
              {(block.items || []).map((item, itemIndex) => {
                const marksInline = item.inlines.find(inf => inf.marks?.subquestionMarks);
                const normalInlines = item.inlines.filter(inf => !inf.marks?.subquestionMarks);
                
                let marker = '•';
                if (block.ordered) {
                  if (block.listStyleType === 'alpha') {
                    marker = `(${String.fromCharCode(97 + itemIndex)})`;
                  } else if (block.listStyleType === 'roman') {
                    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                    marker = `(${romanNumerals[itemIndex] || itemIndex + 1})`;
                  } else {
                    marker = `${itemIndex + 1}.`;
                  }
                }
                
                return (
                  <View key={itemIndex} style={tw('flex flex-row justify-between items-start mb-1')} wrap={false}>
                    <View style={tw('flex-1 flex flex-row items-start')}>
                      <Text style={tw('mr-2 text-[11px] font-bold text-slate-900')}>{marker}</Text>
                      <Text style={tw('flex-1 text-[11px] leading-relaxed text-slate-900')}>
                        <PdfInlineContent inlines={normalInlines} />
                      </Text>
                    </View>
                    {marksInline && (
                      <Text style={tw('ml-2 text-[11px] font-bold text-slate-900')}>
                        {marksInline.text}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        }

        if (block.type === 'options') {
          return (
            <View key={index} style={tw('mt-2 flex flex-row flex-wrap')}>
              {(block.options || []).map((option) => (
                <View key={option.id} style={tw('w-1/2 pr-2 mb-2')}>
                  <View style={tw('rounded-lg border border-slate-200 bg-slate-50 p-2')}>
                    <Text style={tw('mb-1 text-[9px] font-bold uppercase text-slate-600')}>({option.key})</Text>
                    <PdfBlocks blocks={option.blocks} />
                  </View>
                </View>
              ))}
            </View>
          );
        }

        return null;
      })}
    </View>
  );
}

function PdfQuestionImages({ images = [], layoutMode = {} }) {
  if (!images.length) return null;

  const widthMap = { medium: '50%', large: '75%', full: '100%' };
  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

  return (
    <View
      style={[
        tw('mt-4 w-full flex flex-col gap-2'),
        { alignItems: alignMap[layoutMode.imageAlign || 'center'] },
      ]}
      wrap={false}
    >
      {images.map((asset, index) => (
        <View
          key={asset.id || index}
          style={[
            tw('border border-slate-200 rounded-lg p-1'),
            { width: widthMap[layoutMode.imageSize || 'large'] || '75%' },
          ]}
        >
          <Image
            src={asset.url}
            style={{
              maxHeight: Number(layoutMode.imageHeight || 220),
              objectFit: 'contain',
            }}
          />
        </View>
      ))}
    </View>
  );
}

function PdfSectionHeader({ item, paperSettings }) {
  return (
    <View style={tw('mb-4 border-b border-slate-200 pb-2')} wrap={false}>
      <View style={tw('flex flex-row items-end justify-between')}>
        <View style={tw('flex-1 pr-4')}>
          <Text style={tw('text-[14px] font-bold text-slate-900')}>{item.title}</Text>
          {item.instructions?.length > 0 && (
            <View style={tw('mt-1')}>
              <PdfBlocks blocks={item.instructions} />
            </View>
          )}
        </View>
        {paperSettings.showSectionMarks !== false && (
          <Text style={tw('text-[11px] font-bold text-slate-700')}>{item.marks} marks</Text>
        )}
      </View>
    </View>
  );
}

function PdfQuestionBlock({ item, paperSettings }) {
  return (
    <View style={tw('flex flex-col mb-4')} wrap={false}>
      {item.isFirstSegment && (
        <View style={tw('flex flex-row justify-between items-baseline mb-3 border-b border-slate-900 pb-1')}>
          <View style={tw('flex-1 pr-4')}>
            <Text style={tw('text-[11px] font-bold text-slate-900')}>
              {item.showNumber === false ? '' : `Q${item.questionDisplayNumber || item.questionNumber || item.questionLabel}. `}
              {item.title || ''}
            </Text>
          </View>
          {paperSettings.showQuestionMarks !== false && item.showMarks !== false && item.marks > 0 && (
            <Text style={tw('text-[11px] font-bold text-slate-900 shrink-0')}>[{item.marks} Marks]</Text>
          )}
        </View>
      )}
      <View style={tw('pl-2 flex-1')}>
        {(item.body?.blocks || item.blocks)?.length > 0 && <PdfBlocks blocks={item.body?.blocks || item.blocks} />}
        {item.images?.length > 0 && <PdfQuestionImages images={item.images} layoutMode={item.layoutMode} />}
        {item.answerArea && <PdfWritableAnswerArea answerArea={item.answerArea} />}
      </View>
    </View>
  );
}

function PdfPageHeader({ header, page }) {
  const templateId = header.templateId || 'universal';
  if (page.headerMode === 'none') return null;

  if (page.headerMode === 'repeat') {
    return (
      <View style={tw('mb-4 flex flex-row items-center justify-between border-b border-slate-200 pb-2')}>
        <Text style={tw('text-[12px] font-bold text-slate-900')}>{header.title}</Text>
        <Text style={tw('text-[8px] uppercase tracking-widest text-slate-400')}>
          {header.subject || header.course || 'Exam'}
        </Text>
      </View>
    );
  }

  return (
    <View style={tw('mb-8 border-b-2 border-slate-900 pb-5 flex flex-col items-center')} wrap={false}>
      <Text style={tw(`text-center text-[20px] tracking-[0.08em] text-slate-950 ${templateId === 'university_format' ? 'font-bold uppercase' : 'font-serif font-bold uppercase'}`)}>
        {header.title}
      </Text>
      {header.institution && (
        <Text style={tw('mt-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600')}>
          {header.institution}
        </Text>
      )}
      {header.subtitle && (
        <Text style={tw('mt-2 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-slate-600')}>
          {header.subtitle}
        </Text>
      )}
      <View style={tw('mt-6 flex w-full flex-row flex-wrap justify-center')}>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={tw('text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500')}>Course</Text>
          <Text style={tw('mt-1 text-[10px] font-bold')}>{header.course || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={tw('text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500')}>Subject</Text>
          <Text style={tw('mt-1 text-[10px] font-bold')}>{header.subject || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={tw('text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500')}>Subject Code</Text>
          <Text style={tw('mt-1 text-[10px] font-bold')}>{header.subjectCode || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={tw('text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500')}>Duration</Text>
          <Text style={tw('mt-1 text-[10px] font-bold')}>{header.examTime || '3 Hours'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={tw('text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500')}>Marks</Text>
          <Text style={tw('mt-1 text-[10px] font-bold')}>{header.totalMarks || 100}</Text>
        </View>
      </View>
      {header.instructions?.length > 0 && (
        <View style={tw('mt-4 w-full rounded-xl border border-slate-300 p-4')}>
          <Text style={tw('mb-1 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500')}>
            General Instructions
          </Text>
          <PdfBlocks blocks={header.instructions} />
        </View>
      )}
    </View>
  );
}

export function PDFLayoutRenderer({
  title,
  builderLayout = {},
  cards = [],
  sections = [],
  paperType = 'standard',
  paperSettings = {},
  paperDocument = null,
}) {
  const resolvedPaperDocument = paperDocument || buildPaperDocument({
    cards,
    sections,
    builderLayout: {
      ...builderLayout,
      headerTitle: builderLayout.headerTitle || title,
    },
    paperSettings,
    paperType,
  });
  validatePaperDocumentForExport(resolvedPaperDocument);
  const pageScale = Math.min(PDF_A4_WIDTH / PDF_PAGE_WIDTH, PDF_A4_HEIGHT / PDF_PAGE_HEIGHT);

  return (
    <Document>
      {resolvedPaperDocument.pageDescriptors.map((page) => (
        <Page
          key={page.id}
          size="A4"
          style={[
            tw('bg-white'),
            {
              position: 'relative',
            },
          ]}
          wrap={false}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: PDF_PAGE_WIDTH,
              height: PDF_PAGE_HEIGHT,
              transformOrigin: 'top left',
              transform: [{ scale: pageScale }],
            }}
            wrap={false}
          >
            <PdfPageHeader header={resolvedPaperDocument.header} page={page} />
            <View
              style={{
                position: 'absolute',
                left: PDF_PAGE_PADDING_X,
                right: PDF_PAGE_PADDING_X,
                top: PDF_PAGE_PADDING_Y + page.headerHeight,
                height: page.contentHeight,
              }}
              wrap={false}
            >
              {page.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: item.yOffset || 0,
                    left: 0,
                    right: 0,
                  }}
                  wrap={false}
                >
                  {item.type === 'sectionHeader' ? (
                    <PdfSectionHeader item={item} paperSettings={paperSettings} />
                  ) : (
                    <PdfQuestionBlock item={item} paperSettings={paperSettings} />
                  )}
                </View>
              ))}
            </View>

            {page.footerEnabled && (
              <View style={tw('absolute bottom-5 left-0 right-0 flex flex-row justify-center')} wrap={false}>
                <Text style={tw('text-[9px] text-slate-400')}>
                  {`Page ${page.pageNumber} of ${resolvedPaperDocument.pageDescriptors.length}`}
                </Text>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
}
