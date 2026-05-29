/* eslint-disable react/prop-types */
import { View } from '@react-pdf/renderer';

import { tw } from './PdfStyles';

function PdfLinedAnswerArea({ lines = 4 }) {
  return (
    <View style={tw('mt-3')} wrap>
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <View key={index} style={[tw('h-5 border-b border-slate-300'), { borderBottomWidth: 0.8 }]} wrap={false} />
      ))}
    </View>
  );
}

function PdfBlankAnswerArea({ height = 120, boxed = false }) {
  return (
    <View
      style={[
        tw('mt-3 w-full bg-white'),
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
  return (
    <View style={[tw('mt-3 bg-white border border-slate-300'), { borderWidth: 0.9 }]} wrap={false}>
      {Array.from({ length: Math.max(lines, 1) }).map((_, index) => (
        <View key={index} style={[tw('flex flex-row'), { height: 24 }]}>
          <View style={{ width: 24, borderRightWidth: 0.6, borderRightColor: '#cbd5e1' }} />
          <View style={{ flex: 1, borderBottomWidth: 0.8, borderBottomColor: '#cbd5e1' }} />
        </View>
      ))}
    </View>
  );
}

function PdfGraphAnswerArea({ height = 156 }) {
  const majorStep = 20;
  const minorStep = 4;
  const horizontalCount = Math.max(1, Math.floor(height / minorStep));
  const verticalCount = Math.max(1, Math.floor(520 / minorStep));

  return (
    <View
      style={[
        tw('mt-3 w-full bg-white border border-slate-300'),
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
