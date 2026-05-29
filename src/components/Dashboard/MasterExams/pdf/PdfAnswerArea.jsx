import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { tw } from './PdfStyles';

export function PdfAnswerArea({ card, paperSettings, paperType }) {
  if (paperType !== 'writable') return null;

  const lines = Number(card.writing_space_lines || paperSettings.writableLineCount || 6);
  const boxHeight = Number(card.writing_space_height || paperSettings.writableBoxHeight || 160);
  const mode = card.writing_space_type || 'lines';

  if (mode === 'none') return null;

  // We wrap=false so a single small answer area tries to stay on one page,
  // but if it's super huge, React-PDF will have to force split it if we didn't wrap=false.
  // Actually, for lines, we might want to let them split gracefully across pages!
  // If we wrap={true} the lines container, but wrap={false} each individual line, 
  // they can flow nicely to the next page!

  if (mode === 'blank' || mode === 'box' || mode === 'drawing_area') {
    return (
      <View style={tw('mt-4 rounded-xl border border-dashed border-slate-300')} wrap={false}>
        <View style={[tw('w-full'), { height: boxHeight }]} />
      </View>
    );
  }

  if (mode === 'grid' || mode === 'graph_grid') {
    return (
      <View style={tw('mt-4 rounded-xl border border-slate-300 p-2')} wrap={false}>
        <Text style={tw('text-[8px] text-slate-400 uppercase tracking-widest mb-1')}>Graph Space</Text>
        <View style={[tw('w-full border border-slate-200 rounded-lg'), { height: paperSettings.graphBoxHeight || 180 }]} />
      </View>
    );
  }

  // Default: lines. 
  // We use wrap={true} for the container so a long list of lines can split pages gracefully,
  // but each line is wrap={false} (which it is naturally).
  return (
    <View style={tw('mt-4')} wrap={true}>
      {Array.from({ length: Math.max(lines, 3) }).map((_, i) => (
        <View key={i} style={tw('h-6 border-b border-dashed border-slate-300')} wrap={false} />
      ))}
    </View>
  );
}
