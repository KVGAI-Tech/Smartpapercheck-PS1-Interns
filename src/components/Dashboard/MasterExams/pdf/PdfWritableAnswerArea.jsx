/* eslint-disable react/prop-types */
import { View } from '@react-pdf/renderer';

import { tw } from './PdfStyles';

const PAGE_WIDTH = 794;
const PAGE_MARGIN_LEFT = 42; // Page container padding

// Strict Notebook-style margins relative to the Page
const ANSWER_LINE_START_X = 80; // 80px from left edge
const ANSWER_LINE_END_X = PAGE_WIDTH - 80;
const ANSWER_LINE_WIDTH = ANSWER_LINE_END_X - ANSWER_LINE_START_X;

// Container offset since parent starts at PAGE_MARGIN_LEFT
const ANSWER_LINE_OFFSET_LEFT = ANSWER_LINE_START_X - PAGE_MARGIN_LEFT;

const STRICT_WIDTH_STYLES = {
  width: ANSWER_LINE_WIDTH,
  minWidth: ANSWER_LINE_WIDTH,
  maxWidth: ANSWER_LINE_WIDTH,
  marginLeft: ANSWER_LINE_OFFSET_LEFT,
  flexShrink: 0,
};

function logAnswerLine(type) {
  console.log({
    page: 'PDF_EXPORT',
    type,
    answerLineWidth: ANSWER_LINE_WIDTH,
    startX: ANSWER_LINE_START_X,
    endX: ANSWER_LINE_END_X
  });
}

function PdfLinedAnswerArea({ lines = 4 }) {
  logAnswerLine('lined');
  return (
    <View style={[tw('mt-3'), STRICT_WIDTH_STYLES]} wrap>
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <View key={index} style={[tw('h-5 border-b border-slate-300'), { borderBottomWidth: 0.8, width: ANSWER_LINE_WIDTH }]} wrap={false} />
      ))}
    </View>
  );
}

function PdfBlankAnswerArea({ height = 120, boxed = false }) {
  logAnswerLine(boxed ? 'boxed' : 'blank');
  return (
    <View
      style={[
        tw('mt-3 bg-white'),
        STRICT_WIDTH_STYLES,
        {
          height,
          borderWidth: 0.9,
          borderColor: boxed ? '#94a3b8' : '#cbd5e1',
        },
      ]}
      wrap={false}
    />
  );
}

function PdfStepsAnswerArea({ lines = 5 }) {
  logAnswerLine('steps');
  return (
    <View style={[tw('mt-3 bg-white border border-slate-300'), STRICT_WIDTH_STYLES, { borderWidth: 0.9 }]} wrap={false}>
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <View key={index} style={[tw('flex flex-row'), { width: ANSWER_LINE_WIDTH, height: 24 }]}>
          <View style={{ width: 24, borderRightWidth: 0.6, borderRightColor: '#cbd5e1' }} />
          <View style={{ width: ANSWER_LINE_WIDTH - 24, borderBottomWidth: 0.8, borderBottomColor: '#cbd5e1' }} />
        </View>
      ))}
    </View>
  );
}

function PdfGraphAnswerArea({ height = 156 }) {
  logAnswerLine('graph');
  const majorStep = 20;
  const minorStep = 4;
  const horizontalCount = Math.max(1, Math.floor(height / minorStep));
  const verticalCount = Math.max(1, Math.floor(ANSWER_LINE_WIDTH / minorStep));

  return (
    <View
      style={[
        tw('mt-3 bg-white border border-slate-300'),
        STRICT_WIDTH_STYLES,
        {
          height,
          position: 'relative',
          borderWidth: 0.9,
        },
      ]}
      wrap={false}
    >
      {Array.from({ length: horizontalCount }).map((_, index) => (
        <View
          key={`h-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: index * minorStep,
            height: 0,
            borderTopWidth: index % (majorStep / minorStep) === 0 ? 0.7 : 0.35,
            borderTopColor: index % (majorStep / minorStep) === 0 ? '#cbd5e1' : '#e2e8f0',
          }}
        />
      ))}
      {Array.from({ length: verticalCount }).map((_, index) => (
        <View
          key={`v-${index}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: index * minorStep,
            width: 0,
            borderLeftWidth: index % (majorStep / minorStep) === 0 ? 0.7 : 0.35,
            borderLeftColor: index % (majorStep / minorStep) === 0 ? '#cbd5e1' : '#e2e8f0',
          }}
        />
      ))}
    </View>
  );
}

export default function PdfWritableAnswerArea({ answerArea }) {
  if (!answerArea || answerArea.mode === 'none') return null;
  if (answerArea.mode === 'lined') return <PdfLinedAnswerArea lines={answerArea.lines} />;
  if (answerArea.mode === 'steps') return <PdfStepsAnswerArea lines={answerArea.lines} />;
  if (answerArea.mode === 'graph') return <PdfGraphAnswerArea height={answerArea.height} />;
  if (answerArea.mode === 'blank') return <PdfBlankAnswerArea height={answerArea.height} boxed={false} />;
  if (answerArea.mode === 'boxed') return <PdfBlankAnswerArea height={answerArea.height} boxed />;
  return null;
}
