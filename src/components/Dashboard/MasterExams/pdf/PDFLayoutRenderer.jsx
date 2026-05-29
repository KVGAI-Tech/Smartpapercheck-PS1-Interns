/* eslint-disable react/prop-types */
import { Document, Page, View, Text, Image } from '@react-pdf/renderer';

import { tw } from './PdfStyles';
import { buildPaperDocument } from '../paperDocumentBuilder';
import PdfWritableAnswerArea from './PdfWritableAnswerArea';

function PdfInlineContent({ inlines = [] }) {
  return inlines.map((inline, index) => (
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
      {`${inline.text}${index < inlines.length - 1 ? ' ' : ''}`}
    </Text>
  ));
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
              {(block.items || []).map((item, itemIndex) => (
                <View key={itemIndex} style={tw('flex flex-row')}>
                  <Text style={tw('mr-2 text-[11px] text-slate-900')}>
                    {block.ordered ? `${itemIndex + 1}.` : '•'}
                  </Text>
                  <Text style={tw('flex-1 text-[11px] leading-relaxed text-slate-900')}>
                    <PdfInlineContent inlines={item.inlines} />
                  </Text>
                </View>
              ))}
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

function PdfQuestionSegment({ item, paperSettings }) {
  return (
    <View style={tw('mb-5 flex flex-row items-start')} wrap={false}>
      <View style={tw('w-[28px]')}>
        <Text style={tw('text-[11px] font-bold text-slate-900')}>
          {item.showNumber ? `Q${item.questionLabel})` : ''}
        </Text>
      </View>
      <View style={tw('flex-1')}>
        {item.blocks?.length > 0 && <PdfBlocks blocks={item.blocks} />}
        {item.images?.length > 0 && <PdfQuestionImages images={item.images} layoutMode={item.layoutMode} />}
        {item.answerArea && <PdfWritableAnswerArea answerArea={item.answerArea} />}
      </View>
      {item.showMarks && paperSettings.showQuestionMarks !== false && item.marks > 0 && (
        <View style={tw('ml-2')}>
          <Text style={tw('text-[11px] font-bold text-slate-900')}>[{item.marks} Marks]</Text>
        </View>
      )}
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
}) {
  const paperDocument = buildPaperDocument({
    cards,
    sections,
    builderLayout: {
      ...builderLayout,
      headerTitle: builderLayout.headerTitle || title,
    },
    paperSettings,
    paperType,
  });

  return (
    <Document>
      {paperDocument.pageDescriptors.map((page) => (
        <Page
          key={page.id}
          size="A4"
          style={[
            tw('bg-white'),
            {
              paddingLeft: 42,
              paddingRight: 42,
              paddingTop: 57,
              paddingBottom: 57,
            },
          ]}
        >
          <PdfPageHeader header={paperDocument.header} page={page} />

          <View style={tw('flex flex-col')}>
            {page.items.map((item) => (
              item.type === 'sectionHeader' ? (
                <PdfSectionHeader key={item.id} item={item} paperSettings={paperSettings} />
              ) : (
                <PdfQuestionSegment key={item.id} item={item} paperSettings={paperSettings} />
              )
            ))}
          </View>

          {page.footerEnabled && (
            <View style={tw('absolute bottom-5 left-0 right-0 flex flex-row justify-center')}>
              <Text style={tw('text-[9px] text-slate-400')}>
                {`Page ${page.pageNumber} of ${paperDocument.pageDescriptors.length}`}
              </Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
}
