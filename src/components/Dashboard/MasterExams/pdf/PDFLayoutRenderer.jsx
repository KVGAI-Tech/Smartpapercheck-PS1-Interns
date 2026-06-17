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
    
    let fontFamily = 'Helvetica';
    if (inline?.marks?.bold && inline?.marks?.italic) {
      fontFamily = 'Helvetica-BoldOblique';
    } else if (inline?.marks?.bold) {
      fontFamily = 'Helvetica-Bold';
    } else if (inline?.marks?.italic) {
      fontFamily = 'Helvetica-Oblique';
    } else if (inline?.marks?.code) {
      fontFamily = 'Courier';
    }

    return (
      <Text
        key={index}
        style={{
          fontFamily: fontFamily,
          fontSize: inline?.marks?.code ? 10 : 11,
        }}
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
            <Text key={index} style={{ fontSize: 11, lineHeight: 1.5, color: '#0f172a' }}>
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
                      <Text style={{ marginRight: 8, fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{marker}</Text>
                      <Text style={{ flex: 1, fontSize: 11, lineHeight: 1.5, color: '#0f172a' }}>
                        <PdfInlineContent inlines={normalInlines} />
                      </Text>
                    </View>
                    {marksInline && (
                      <Text style={{ marginLeft: 8, fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
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
                    <Text style={{ marginBottom: 4, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#475569', textTransform: 'uppercase' }}>({option.key})</Text>
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
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{item.title}</Text>
          {item.instructions?.length > 0 && (
            <View style={tw('mt-1')}>
              <PdfBlocks blocks={item.instructions} />
            </View>
          )}
        </View>
        {paperSettings.showSectionMarks !== false && (
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#475569' }}>{item.marks} marks</Text>
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
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
              {item.showNumber === false ? '' : `Q${item.questionDisplayNumber || item.questionNumber || item.questionLabel}. `}
              {item.title || ''}
            </Text>
          </View>
          {paperSettings.showQuestionMarks !== false && item.showMarks !== false && item.marks > 0 && (
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a', flexShrink: 0 }}>[{item.marks} Marks]</Text>
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
        <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.title}</Text>
        <Text style={{ fontSize: 8, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>
          {header.subject || header.course || 'Exam'}
        </Text>
      </View>
    );
  }

  const isUniv = templateId === 'university_format';
  const titleFont = isUniv ? 'Helvetica-Bold' : 'Times-Bold';

  return (
    <View style={tw('mb-8 border-b-2 border-slate-900 pb-5 flex flex-col items-center')} wrap={false}>
      <Text style={{ textAlign: 'center', fontSize: 20, letterSpacing: 1, color: '#020617', fontFamily: titleFont, textTransform: 'uppercase' }}>
        {header.title}
      </Text>
      {header.institution && (
        <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 11, fontFamily: 'Helvetica-Bold', letterSpacing: 2, color: '#475569', textTransform: 'uppercase' }}>
          {header.institution}
        </Text>
      )}
      {header.subtitle && (
        <Text style={{ marginTop: 8, textAlign: 'center', fontSize: 12, fontFamily: 'Helvetica-Bold', letterSpacing: 2, color: '#475569', textTransform: 'uppercase' }}>
          {header.subtitle}
        </Text>
      )}
      <View style={tw('mt-6 flex w-full flex-row flex-wrap justify-center')}>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Course</Text>
          <Text style={{ marginTop: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.course || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Subject</Text>
          <Text style={{ marginTop: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.subject || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Subject Code</Text>
          <Text style={{ marginTop: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.subjectCode || 'Not set'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Duration</Text>
          <Text style={{ marginTop: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.examTime || '3 Hours'}</Text>
        </View>
        <View style={tw('mb-2 w-1/4 items-center')}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Marks</Text>
          <Text style={{ marginTop: 4, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{header.totalMarks || 100}</Text>
        </View>
      </View>
      {header.instructions?.length > 0 && (
        <View style={tw('mt-4 w-full rounded-xl border border-slate-300 p-4')}>
          <Text style={{ marginBottom: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
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
          size={[PDF_A4_WIDTH, PDF_A4_HEIGHT]}
          style={[
            tw('bg-white'),
            {
              position: 'relative',
              backgroundColor: '#ffffff',
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
              transform: [{ scale: pageScale }],
              transformOriginX: 0,
              transformOriginY: 0,
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
                <Text style={{ fontSize: 9, color: '#94a3b8' }}>
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
