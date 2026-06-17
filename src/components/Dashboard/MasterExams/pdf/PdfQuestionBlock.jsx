import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { tw } from './PdfStyles';
import { HtmlToReactPdf } from './HtmlToReactPdf';
import { supportsOptions } from '../masterExamCardSchema';
import { PdfImageRenderer } from './PdfImageRenderer';
import { PdfAnswerArea } from './PdfAnswerArea';

function cleanQuestionBody(htmlText, index, marks) {
  if (!htmlText || typeof htmlText !== 'string') return htmlText;

  let cleaned = htmlText.replace(/\[\[IMAGE_SLOT:\d+\]\]/gi, '').trim();
  const prefixRegex = new RegExp(
    `^((?:<[^>]+>|\\s)*)(?:Q(?:uestion)?\\s*)?0*${index}\\s*[\\).\\-、:\\s]*`,
    'i'
  );
  cleaned = cleaned.replace(prefixRegex, '$1');

  const strayRegex = /^((?:<[^>]+>|\\s)*)[\\).\\-、:\\s]+\\s*/;
  cleaned = cleaned.replace(strayRegex, '$1');

  if (marks > 0) {
    const escapedMarks = String(marks).replace(/\\./g, '\\\\.');
    const marksRegex = new RegExp(
      `\\s*[\\(\\[]\\s*0*${escapedMarks}\\s*(?:marks|mark|m|marks\\.)?\\s*[\\)\\]]`,
      'gi'
    );
    cleaned = cleaned.replace(marksRegex, '');
  }

  return cleaned;
}

export function PdfQuestionBlock({ card, index, paperType, paperSettings }) {
  const options = card.parsed_metadata?.options || [];
  const cleanedHtml = cleanQuestionBody(card.question_body, index, card.marks);
  const images = card.parsed_metadata?.imageAssets || (card.image_urls ? card.image_urls.map((url, i) => ({ id: i, url })) : []);
  const imageStyle = card.parsed_metadata?.paper_image_style || {};

  return (
    <View style={tw('mb-6 flex flex-row items-start')} wrap={true}>
      {/* Number */}
      <View style={tw('w-[24px]')}>
        <Text style={tw('font-bold text-[11px] text-slate-900')}>Q{index})</Text>
      </View>

      {/* Content */}
      <View style={tw('flex-1')}>
        <View wrap={true}>
          <HtmlToReactPdf html={cleanedHtml} />

          {supportsOptions(card.question_type) && options.length > 0 && (
            <View style={tw('mt-3 flex flex-row flex-wrap')}>
              {options.map((opt) => (
                <View key={opt.id} style={tw('w-1/2 flex flex-row mb-1 pr-2')}>
                  <Text style={tw('font-bold text-[11px] mr-1')}>({opt.key})</Text>
                  <HtmlToReactPdf html={opt.text} />
                </View>
              ))}
            </View>
          )}

          <PdfImageRenderer images={images} imageStyle={imageStyle} paperType={paperType} />
        </View>

        {/* Answer area can wrap gracefully if it's long lines, or stays solid if box */}
        <PdfAnswerArea card={card} paperSettings={paperSettings} paperType={paperType} />
      </View>

      {/* Marks */}
      {card.marks > 0 && paperSettings.showQuestionMarks !== false && (
        <View style={tw('ml-2')}>
          <Text style={tw('font-bold text-[11px] text-slate-900')}>[{card.marks}]</Text>
        </View>
      )}
    </View>
  );
}
