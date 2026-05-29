import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { tw } from './PdfStyles';
import { PdfQuestionBlock } from './PdfQuestionBlock';
import { HtmlToReactPdf } from './HtmlToReactPdf';

export function UnifiedPaperRenderer({ sections, unsectionedCards, paperSettings, paperType }) {
  return (
    <View style={tw('flex flex-col')}>
      {sections.filter(sec => sec.cards?.length > 0).map((section, idx) => {
        const breakPage = section.parsed_metadata?.page_break_before || (paperSettings.start_sections_new_page && idx !== 0);
        return (
          <View key={section.id} style={tw('mt-6')} wrap={true} break={breakPage}>
            {/* Section Header */}
            <View style={tw('border-b border-slate-900 pb-1 mb-4 flex flex-row justify-between items-end')} wrap={false}>
              <View style={tw('flex-1 pr-4')}>
                <Text style={tw('font-bold text-[14px] text-slate-900')}>{section.title}</Text>
                {section.instructions && (
                  <View style={tw('mt-1')}>
                    <HtmlToReactPdf html={section.instructions} baseStyle="text-[10px] text-slate-600 italic" />
                  </View>
                )}
              </View>
              {paperSettings.showSectionMarks !== false && (
                <Text style={tw('font-bold text-[11px] text-slate-700')}>
                  {section.cards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0)} marks
                </Text>
              )}
            </View>

            {/* Questions Flow */}
            <View>
              {section.cards.map((card, cardIdx) => (
                <PdfQuestionBlock
                  key={card.id}
                  card={card}
                  index={cardIdx + 1}
                  paperType={paperType}
                  paperSettings={paperSettings}
                />
              ))}
            </View>
          </View>
        );
      })}

      {unsectionedCards?.length > 0 && (
        <View style={tw('mt-6')} wrap={true}>
          {unsectionedCards.map((card, cardIdx) => (
            <PdfQuestionBlock
              key={card.id}
              card={card}
              index={cardIdx + 1}
              paperType={paperType}
              paperSettings={paperSettings}
            />
          ))}
        </View>
      )}
    </View>
  );
}
