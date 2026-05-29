import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { tw } from './PdfStyles';

function unescapeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function HtmlToReactPdf({ html, baseStyle = '' }) {
  if (!html) return null;

  // Extremely basic HTML to React-PDF parser.
  // In a real scenario, consider using 'react-pdf-html' or a full parser.
  // For now, we strip complex tags and handle basic paragraphs and bold.

  // 1. Split by <p> or <br>
  const blocks = html.split(/<p>|<\/p>|<br\s*\/?>/i).filter((s) => s.trim());

  return (
    <View style={tw('flex flex-col')}>
      {blocks.map((block, idx) => {
        // Find <strong> or <b> tags
        const parts = block.split(/(<strong[^>]*>.*?<\/strong>|<b[^>]*>.*?<\/b>)/gi).filter(Boolean);
        
        return (
          <Text key={idx} style={tw(`text-[11px] leading-relaxed text-slate-900 ${baseStyle} mb-1`)}>
            {parts.map((part, pIdx) => {
              if (part.toLowerCase().startsWith('<strong') || part.toLowerCase().startsWith('<b')) {
                const content = part.replace(/<[^>]+>/g, '');
                return (
                  <Text key={pIdx} style={tw('font-bold')}>
                    {unescapeHtml(content)}
                  </Text>
                );
              }
              // Basic strip tags for the rest
              const plain = part.replace(/<[^>]+>/g, '');
              return <Text key={pIdx}>{unescapeHtml(plain)}</Text>;
            })}
          </Text>
        );
      })}
    </View>
  );
}
