import { supportsOptions } from './masterExamCardSchema.js';

export const PDF_PAGE_WIDTH = 794;
export const PDF_PAGE_HEIGHT = 1123;
export const PDF_PAGE_PADDING_X = 42;
export const PDF_PAGE_PADDING_Y = 57;
export const PDF_A4_WIDTH = 595.28;
export const PDF_A4_HEIGHT = 841.89;
const DEFAULT_PAGE_HEIGHT = PDF_PAGE_HEIGHT;
const DEFAULT_FIRST_PAGE_HEADER_HEIGHT = 240;
const DEFAULT_REPEAT_HEADER_HEIGHT = 56;
const DEFAULT_FOOTER_HEIGHT = 28;
const DEFAULT_CHARS_PER_LINE = 82;
const DEFAULT_BODY_LINES_PER_SEGMENT = 7;
const DEFAULT_INLINE_ANSWER_LINES = 3;
const DEFAULT_CONTINUATION_ANSWER_LINES = 6;

const INLINE_TAGS = new Set(['strong', 'b', 'em', 'i', 'code', 'span', 'u', 'sup', 'sub']);
const BLOCK_TAGS = new Set(['p', 'div', 'section', 'article', 'blockquote', 'pre']);
const GRAPH_KEYWORDS = [
  'graph',
  'plot',
  'draw',
  'sketch',
  'timing diagram',
  'waveform',
  'circuit diagram',
  'graph paper',
  'coordinate axes',
];

function clampNumber(value, fallback, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

function ensureString(value) {
  return typeof value === 'string' ? value : '';
}

export function isWritablePaperType(paperType = 'standard') {
  return paperType === 'writable' || paperType === 'technical_writable';
}

function isTechnicalWritablePaperType(paperType = 'standard') {
  return paperType === 'technical_writable';
}

function getSourceQuestionLabel(card, fallbackNumber) {
  const displayNumber = ensureString(card?.parsed_metadata?.display_number).trim();
  if (displayNumber) return displayNumber;

  const rawQuestionNumber = ensureString(card?.parsed_metadata?.question_number || card?.question_number).trim();
  if (rawQuestionNumber) {
    return rawQuestionNumber.replace(/^question\s*/i, '').replace(/^q\s*/i, '').trim();
  }

  return String(fallbackNumber);
}

function normalizePaperSettings(paperSettings = {}) {
  return {
    ...paperSettings,
    showSectionMarks: paperSettings.showSectionMarks !== false,
    showQuestionMarks: paperSettings.showQuestionMarks !== false,
    footerEnabled: paperSettings.footerEnabled !== false,
    includeCoverHeader: paperSettings.includeCoverHeader !== false,
    repeatHeader: Boolean(paperSettings.repeatHeader),
    startSectionsNewPage: Boolean(
      paperSettings.startSectionsNewPage ?? paperSettings.start_sections_new_page
    ),
    writableLineCount: clampNumber(paperSettings.writableLineCount, 5, 1),
    writableBoxHeight: clampNumber(paperSettings.writableBoxHeight, 120, 40),
    graphBoxHeight: clampNumber(paperSettings.graphBoxHeight, 156, 80),
  };
}

function resolveSubjectCode(builderLayout = {}) {
  return ensureString(
    builderLayout.subjectCode
    || builderLayout.subject_code
    || builderLayout.courseContext?.subjectCode
  );
}

function dedupeIds(cardIds = [], validCardIds = new Map()) {
  const seen = new Set();
  const normalized = [];

  cardIds.forEach((cardId) => {
    const key = String(cardId);
    if (!validCardIds.has(key) || seen.has(key)) return;
    seen.add(key);
    normalized.push(validCardIds.get(key));
  });

  return normalized;
}

export function normalizeLegacySections(rawSections = [], cards = []) {
  const validCardIds = new Map(cards.map((card) => [String(card.id), card.id]));
  const globallyAssigned = new Set();

  return (Array.isArray(rawSections) ? rawSections : [])
    .map((section, index) => {
    const legacyCardIds = Array.isArray(section?.cards)
      ? section.cards.map((card) => card?.id).filter(Boolean)
      : [];
    const explicitCardIds = Array.isArray(section?.cardIds) ? section.cardIds : [];
    const candidateCardIds = dedupeIds(
      explicitCardIds.length > 0 ? explicitCardIds : legacyCardIds,
      validCardIds
    );
    const cardIds = candidateCardIds.filter((cardId) => {
      const key = String(cardId);
      if (globallyAssigned.has(key)) return false;
      globallyAssigned.add(key);
      return true;
    });

    return {
      id: section?.id || `section-${index + 1}`,
      title: ensureString(section?.title) || `Section ${String.fromCharCode(65 + index)}`,
      instructions: ensureString(section?.instructions),
      cardIds,
      parsed_metadata: section?.parsed_metadata && typeof section.parsed_metadata === 'object'
        ? section.parsed_metadata
        : {},
    };
  })
    .filter((section) => {
      const hasTitle = Boolean(ensureString(section?.title).trim());
      const hasInstructions = Boolean(ensureString(section?.instructions).trim());
      const hasCards = Array.isArray(section?.cardIds) && section.cardIds.length > 0;
      return hasTitle || hasInstructions || hasCards;
    });
}

function normalizeInlineText(text) {
  return ensureString(text)
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlDecode(text) {
  return ensureString(text)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function parseQuestionHeaderAndTitle(text) {
  const cleanText = text.trim();
  const qMatch = cleanText.match(/^(Q\d+[.)]\s*)/i);
  let qNum = '';
  let remaining = cleanText;
  if (qMatch) {
    qNum = qMatch[1].trim();
    remaining = cleanText.substring(qMatch[0].length).trim();
  }
  
  // Strip leading/trailing marks like [35 Marks] from remaining for title extraction
  const marksStripped = remaining.replace(/\[\s*\d+(?:\.\d+)?\s*(?:Marks|M|marks|m)?\s*\]\s*/gi, '').trim();
  const textToAnalyze = marksStripped || remaining;
  
  // Verb list: words that typically START the question body (imperative verbs / sentence starters)
  const sentenceStartVerbs = /\b(Implement|Explain|Analyze|Calculate|Consider|Suppose|Write|State|Define|Compare|Contrast|Describe|List|Show|Prove|Find|Determine|Evaluate|Construct|Solve|For|Given|Using|Draw|What|How|Why|Derive|The|A|An|If|Assume|Apply|Discuss)\b/;
  
  // Strategy 1: Look for verb that starts after a clear sentence break (newline or period+space)
  const sentenceBreak = textToAnalyze.match(/[.\n]\s+/);
  if (sentenceBreak && sentenceBreak.index > 2 && sentenceBreak.index < 200) {
    const before = textToAnalyze.substring(0, sentenceBreak.index).trim();
    const after = textToAnalyze.substring(sentenceBreak.index).replace(/^[.\n]\s+/, '').trim();
    // Only split if the text after the break starts with a sentence-start verb
    if (sentenceStartVerbs.test(after.split(/\s+/)[0])) {
      return { qNum, title: before, body: after };
    }
    // If the before part is short enough to be a title, use it anyway
    if (before.length < 120) {
      return { qNum, title: before, body: after };
    }
  }
  
  // Strategy 2: Look for first sentence-start verb with index > 0 
  // But only if it's preceded by a space (word boundary) and the preceding text looks like a title (< 150 chars)
  const verbPattern = new RegExp(`\\s+(${sentenceStartVerbs.source.slice(2, -2)})\\s`, 'g');
  let verbMatch = null;
  let match;
  while ((match = verbPattern.exec(textToAnalyze)) !== null) {
    const beforeText = textToAnalyze.substring(0, match.index).trim();
    // Title must be non-empty and reasonably short
    if (beforeText.length > 2 && beforeText.length < 150) {
      verbMatch = match;
      break;
    }
  }
  
  let title = '';
  let body = remaining;
  if (verbMatch) {
    title = textToAnalyze.substring(0, verbMatch.index).trim();
    body = textToAnalyze.substring(verbMatch.index).trim();
  } else {
    // Fallback: split on first period or colon if early
    const splitMatch = textToAnalyze.match(/[.:]\s/);
    if (splitMatch && splitMatch.index > 2 && splitMatch.index < 120) {
      const possibleTitle = textToAnalyze.substring(0, splitMatch.index).trim();
      const possibleBody = textToAnalyze.substring(splitMatch.index + 1).trim();
      if (possibleBody) {
        title = possibleTitle;
        body = possibleBody;
      }
    }
  }
  return { qNum, title, body };
}

export function reconstructHtmlStructure(html = '') {
  const preBlocks = [];
  const withPrePlaceholders = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match) => {
    preBlocks.push(match);
    return `\n__PRE_PLACEHOLDER_${preBlocks.length - 1}__\n`;
  });

  const imgTags = [];
  const withPlaceholders = withPrePlaceholders.replace(/<img[^>]*>/gi, (match) => {
    imgTags.push(match);
    return `__IMG_PLACEHOLDER_${imgTags.length - 1}__`;
  });

  // Decode HTML first and strip tags to get clean lines
  let text = withPlaceholders
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
    
  text = htmlDecode(text);

  // Extract main question marks if present in the header area (first 150 chars)
  const marksPattern = /\[\s*\d+(?:\.\d+)?\s*(?:Marks|M|marks|m)?\s*\]/i;
  const marksMatch = text.match(marksPattern);
  let marksText = '';
  if (marksMatch && marksMatch.index < 150) {
    marksText = marksMatch[0].trim();
    text = text.substring(0, marksMatch.index) + text.substring(marksMatch.index + marksText.length);
    text = text.replace(/\s+/g, ' ').trim();
  }
  
  const { qNum, title, body } = parseQuestionHeaderAndTitle(text);
  
  let processedBody = body;
  const contextLabels = [
    'Context:', 'Scenario:', 'Problem Statement:', 'Given:', 'Task:',
    'Constraints:', 'Instructions:', 'Your solution should include:', 'Constraint:'
  ];
  
  // Insert split markers before context labels
  contextLabels.forEach(label => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*(?=\\b${escaped})`, 'gi');
    processedBody = processedBody.replace(regex, ' __BLOCK_SPLIT__ ');
  });
  
  // Insert split markers before bullets
  processedBody = processedBody.replace(/\s*(?=[-•●▪*+]\s+)/g, ' __BLOCK_SPLIT__ ');
  
  // Insert split markers before subquestions like (a), (b), (i), (ii)
  processedBody = processedBody.replace(/\s*(?=\([a-zivx]+\)\s+)/gi, ' __BLOCK_SPLIT__ ');
  
  // Split by split marker and newlines
  const rawSegments = processedBody.split(/__BLOCK_SPLIT__|\n/);
  const segments = [];
  rawSegments.forEach(seg => {
    const cleanSeg = seg.trim();
    if (!cleanSeg) return;
    
    // If a segment exceeds 400 characters, let's split it by sentences
    if (cleanSeg.length > 400) {
      const subSegs = cleanSeg.split(/(?<=\.)\s+(?=[A-Z])/);
      subSegs.forEach(sub => {
        const cleanSub = sub.trim();
        if (cleanSub) segments.push(cleanSub);
      });
    } else {
      segments.push(cleanSeg);
    }
  });

  // Apply continuation merging logic
  const mergedSegments = [];
  segments.forEach((seg) => {
    if (mergedSegments.length === 0) {
      mergedSegments.push(seg);
      return;
    }
    
    const lastSeg = mergedSegments[mergedSegments.length - 1];
    
    const startsWithLowercase = /^[a-z]/.test(seg);
    const isParenthesizedContinuation = /^\([^a-zivx]+\)/i.test(seg) || /^\([a-z]{2,}\)/i.test(seg);
    const isMathOrSpecial = new RegExp('^[-=+/*]').test(seg);
    const lastSegEndsWithPunctuation = /[.?!:]\s*$/.test(lastSeg);
    
    if (startsWithLowercase || isParenthesizedContinuation || isMathOrSpecial || !lastSegEndsWithPunctuation) {
      const isBullet = /^[-•●▪*+]\s+/.test(seg);
      const isSubquestion = /^\([a-zivx]+\)\s+/i.test(seg);
      
      const isContextLabel = contextLabels.some(label => seg.toLowerCase().startsWith(label.toLowerCase()));
      
      if (!isBullet && !isSubquestion && !isContextLabel) {
        mergedSegments[mergedSegments.length - 1] = `${lastSeg} ${seg}`;
        return;
      }
    }
    
    mergedSegments.push(seg);
  });
  
  let reconstructedHtml = '';
  
  // Wrap question header
  if (qNum || title) {
    reconstructedHtml += `
      <div class="question-header">
        <span class="question-number">${qNum || ''}</span>
        <span class="question-title">${title || ''}</span>
        ${marksText ? `<span class="question-marks">${marksText}</span>` : ''}
      </div>
    `;
  }
  
  let inList = false;
  let subquestionListType = null;

  segments.forEach((segment) => {
    if (segment.startsWith('__PRE_PLACEHOLDER_')) {
      if (inList) { reconstructedHtml += '</ul>'; inList = false; }
      if (subquestionListType) { reconstructedHtml += '</ol>'; subquestionListType = null; }
      reconstructedHtml += segment;
      return;
    }

    // Check if it's a list item (bullet or numbered)
    const listMatch = segment.match(/^([•●-]|(?:\d+[.)]))\s+(.*)$/);
    if (listMatch) {
      if (subquestionListType) {
        reconstructedHtml += `</ol>`;
        subquestionListType = null;
      }
      if (!inList) {
        reconstructedHtml += `<ul class="ws-paper-preview-ul">`;
        inList = true;
      }
      reconstructedHtml += `<li class="ws-paper-preview-li">${listMatch[2]}</li>`;
      return;
    }
    
    if (inList) {
      reconstructedHtml += `</ul>`;
      inList = false;
    }
    
    // Check if it is a subquestion
    const subMatch = segment.match(/^\(([a-zivx]+)\)\s+(.*)$/i);
    if (subMatch) {
      const marker = subMatch[1].toLowerCase();
      const subText = subMatch[2];
      
      const isRoman = /^[ivx]+$/.test(marker);
      const currentListType = isRoman ? 'roman' : 'alpha';
      
      // Extract marks from subquestion if present, e.g. [2]
      const marksMatch = subText.match(/\[\s*(\d+)\s*(?:Marks|M|marks|m)?\s*\]\s*$/i);
      let marksHtml = '';
      let cleanSubText = subText;
      if (marksMatch) {
        const marksVal = marksMatch[1];
        marksHtml = `<span class="subquestion-marks">[${marksVal}]</span>`;
        cleanSubText = subText.substring(0, marksMatch.index).trim();
      }
      
      if (subquestionListType !== currentListType) {
        if (subquestionListType) {
          reconstructedHtml += `</ol>`;
        }
        reconstructedHtml += `<ol class="subquestions-list-${currentListType}">`;
        subquestionListType = currentListType;
      }
      
      reconstructedHtml += `<li data-marker="(${marker})">${cleanSubText} ${marksHtml}</li>`;
      return;
    }
    
    // Close subquestion list
    if (subquestionListType) {
      reconstructedHtml += `</ol>`;
      subquestionListType = null;
    }
    
    // Check if it starts with a context label
    let matchedLabel = null;
    for (const label of contextLabels) {
      if (segment.toLowerCase().startsWith(label.toLowerCase())) {
        matchedLabel = segment.substring(0, label.length);
        break;
      }
    }
    
    if (matchedLabel) {
      const remainingText = segment.substring(matchedLabel.length).trim();
      reconstructedHtml += `
        <p class="ws-paper-preview-context-header"><strong>${matchedLabel}</strong></p>
        <p class="ws-paper-preview-p">${remainingText}</p>
      `;
    } else {
      reconstructedHtml += `<p class="ws-paper-preview-p">${segment}</p>`;
    }
  });
  
  if (inList) reconstructedHtml += '</ul>';
  if (subquestionListType) reconstructedHtml += '</ol>';
  
  // Restore the placeholders
  let restoredHtml = reconstructedHtml;
  for (let i = 0; i < imgTags.length; i++) {
    restoredHtml = restoredHtml.replace(`__IMG_PLACEHOLDER_${i}__`, imgTags[i]);
  }
  for (let i = 0; i < preBlocks.length; i++) {
    restoredHtml = restoredHtml.replace(`__PRE_PLACEHOLDER_${i}__`, preBlocks[i]);
  }
  
  return restoredHtml;
}

function appendTextInline(target, text, marks = {}) {
  const normalized = normalizeInlineText(htmlDecode(text));
  if (!normalized) return;

  const previous = target[target.length - 1];
  const previousMarks = previous?.marks || {};
  const sameMarks = JSON.stringify(previousMarks) === JSON.stringify(marks);
  if (previous?.type === 'text' && sameMarks) {
    previous.text = `${previous.text} ${normalized}`.trim();
    return;
  }

  target.push({
    type: 'text',
    text: normalized,
    marks: {
      bold: Boolean(marks.bold),
      italic: Boolean(marks.italic),
      code: Boolean(marks.code),
      subquestionMarks: Boolean(marks.subquestionMarks),
    },
  });
}

function inlineNodeFromDom(node, images, marks = {}) {
  if (node.nodeType === 3) {
    return [{ type: 'text', text: htmlDecode(node.textContent || ''), marks }];
  }

  if (node.nodeType !== 1) return [];

  const tag = node.tagName.toLowerCase();
  if (tag === 'br') {
    return [{ type: 'br' }];
  }
  if (tag === 'img') {
    const src = ensureString(node.getAttribute('src'));
    if (src) {
      images.push({
        id: node.getAttribute('data-image-id') || `inline-${images.length + 1}`,
        url: src,
        caption: ensureString(node.getAttribute('alt')),
        source: 'inline',
        order: images.length,
      });
    }
    return [];
  }

  const nextMarks = { ...marks };
  if (tag === 'strong' || tag === 'b') nextMarks.bold = true;
  if (tag === 'em' || tag === 'i') nextMarks.italic = true;
  if (tag === 'code') nextMarks.code = true;
  if (tag === 'span' && node.classList && node.classList.contains('subquestion-marks')) {
    nextMarks.subquestionMarks = true;
  }

  const fragments = [];
  Array.from(node.childNodes || []).forEach((child) => {
    inlineNodeFromDom(child, images, nextMarks).forEach((fragment) => {
      if (fragment.type === 'text') {
        appendTextInline(fragments, fragment.text, fragment.marks);
      } else if (fragment.type === 'br') {
        fragments.push(fragment);
      }
    });
  });
  return fragments;
}

function domToAst(html = '') {
  const images = [];
  const ast = [];
  const parser = new DOMParser();
  
  // Clean up HTML: keep standard tag structures. Do not aggressively split paragraphs.
  let processedHtml = html;
    
  const doc = parser.parseFromString(`<div>${processedHtml}</div>`, 'text/html');
  const root = doc.body.firstElementChild;

  const pushParagraph = (node) => {
    const inlines = [];
    Array.from(node.childNodes || []).forEach((child) => {
      inlineNodeFromDom(child, images).forEach((fragment) => {
        if (fragment.type === 'text') {
          appendTextInline(inlines, fragment.text, fragment.marks);
        } else if (fragment.type === 'br') {
          inlines.push(fragment);
        }
      });
    });
    if (inlines.length > 0) {
      ast.push({ type: 'paragraph', inlines });
    }
  };

  Array.from(root?.childNodes || []).forEach((node) => {
    if (node.nodeType === 3) {
      const text = normalizeInlineText(node.textContent || '');
      if (text) {
        ast.push({ type: 'paragraph', inlines: [{ type: 'text', text, marks: {} }] });
      }
      return;
    }

    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();

    if (tag === 'img') {
      inlineNodeFromDom(node, images);
      return;
    }

    if (tag === 'pre') {
      ast.push({ type: 'pre', text: node.textContent || '' });
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      let listStyleType = 'decimal';
      if (tag === 'ol') {
        const typeAttr = node.getAttribute('type');
        if (typeAttr === 'a' || node.classList.contains('subquestions-list-alpha')) {
          listStyleType = 'alpha';
        } else if (typeAttr === 'i' || node.classList.contains('subquestions-list-roman')) {
          listStyleType = 'roman';
        }
      } else {
        listStyleType = 'bullet';
      }
      const items = [];
      Array.from(node.children || []).forEach((child) => {
        if (child.tagName?.toLowerCase() !== 'li') return;
        const inlines = [];
        Array.from(child.childNodes || []).forEach((grandChild) => {
          inlineNodeFromDom(grandChild, images).forEach((fragment) => {
            if (fragment.type === 'text') {
              appendTextInline(inlines, fragment.text, fragment.marks);
            } else if (fragment.type === 'br') {
              inlines.push(fragment);
            }
          });
        });
        if (inlines.length > 0) items.push({ inlines });
      });

      if (items.length > 0) {
        ast.push({ type: 'list', ordered: tag === 'ol', listStyleType, items });
      }
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      pushParagraph(node);
      return;
    }

    if (INLINE_TAGS.has(tag)) {
      const inlines = inlineNodeFromDom(node, images);
      if (inlines.length > 0) {
        ast.push({ type: 'paragraph', inlines });
      }
      return;
    }

    pushParagraph(node);
  });

  return { blocks: ast, inlineImages: images };
}

function fallbackParseHtml(html = '') {
  const images = [];
  const imagePattern = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"']*)["']?[^>]*>/gi;
  let imageMatch = imagePattern.exec(html);
  while (imageMatch) {
    images.push({
      id: `inline-${images.length + 1}`,
      url: imageMatch[1],
      caption: imageMatch[2] || '',
      source: 'inline',
      order: images.length,
    });
    imageMatch = imagePattern.exec(html);
  }

  const withoutImages = html.replace(/<img[^>]*>/gi, ' ');
  const normalized = withoutImages
    .replace(/<\/?(div|p|section|article|blockquote|pre)[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?li[^>]*>/gi, '\n- ')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    .replace(/<strong[^>]*>|<b[^>]*>/gi, '**')
    .replace(/<\/strong>|<\/b>/gi, '**')
    .replace(/<em[^>]*>|<i[^>]*>/gi, '*')
    .replace(/<\/em>|<\/i>/gi, '*')
    .replace(/<code[^>]*>/gi, '`')
    .replace(/<\/code>/gi, '`')
    .replace(/<[^>]+>/g, ' ');

  const blocks = normalized
    .split(/\n{2,}/)
    .map((chunk) => normalizeInlineText(chunk))
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph',
      inlines: [{ type: 'text', text, marks: {} }],
    }));

  return { blocks, inlineImages: images };
}

/**
 * Post-process AST blocks to fix subquestion layout issues:
 * 1. Merge standalone subquestion labels "(a)", "(b)" with following content
 * 2. Merge consecutive lists of the same type into one list
 * 3. Deduplicate repeated labels like multiple "(b)" items
 */
function postProcessAstBlocks(blocks) {
  if (!blocks || blocks.length <= 1) return blocks;

  const subqLabelPattern = /^\s*\(([a-zivx]+)\)\s*$/i;
  const numberedItemPattern = /^\s*\d+[.)]\s+/;

  // Pass 1: Merge standalone subquestion label paragraphs with the next block
  let merged = [];
  let lastPrependedLabel = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check if this block is a paragraph containing only a subquestion label like "(b)"
    if (block.type === 'paragraph' && block.inlines) {
      const text = block.inlines.map(il => il.text || '').join('').trim();
      const labelMatch = text.match(subqLabelPattern);

      if (labelMatch) {
        const currentLabel = labelMatch[1].toLowerCase();
        
        // If this is a duplicate label immediately following the same label sequence, skip it
        if (currentLabel === lastPrependedLabel) {
          continue;
        }

        if (i + 1 < blocks.length) {
          const nextBlock = blocks[i + 1];
          const label = `(${labelMatch[1]}) `;

          if (nextBlock.type === 'paragraph' && nextBlock.inlines) {
            // Prepend label to next paragraph
            nextBlock.inlines.unshift({ type: 'text', text: label, marks: { bold: true } });
            lastPrependedLabel = currentLabel;
            continue;
          } else if (nextBlock.type === 'list') {
            // Prepend label to first list item
            if (nextBlock.items && nextBlock.items.length > 0 && nextBlock.items[0].inlines) {
              nextBlock.items[0].inlines.unshift({ type: 'text', text: label, marks: { bold: true } });
            }
            lastPrependedLabel = currentLabel;
            continue;
          }
        }
      } else {
        // Reset if we hit normal text, though keeping it allows skipping scattered duplicate labels
        // within the same question segment. For subquestions, this is generally what we want.
      }
    }

    merged.push(block);
  }

  // Pass 2: Merge consecutive lists of the same type
  const result = [];
  for (let i = 0; i < merged.length; i++) {
    const block = merged[i];
    const prev = result[result.length - 1];

    if (
      block.type === 'list' &&
      prev &&
      prev.type === 'list' &&
      prev.ordered === block.ordered &&
      prev.listStyleType === block.listStyleType
    ) {
      // Merge items into the previous list
      prev.items.push(...(block.items || []));
      continue;
    }

    result.push(block);
  }

  return result;
}

export function parseHtmlToAst(html = '') {
  if (!html) return { blocks: [], inlineImages: [] };
  
  const hasLists = /<(ul|ol|li)/i.test(html);
  const hasCustomClass = /subquestions-list/i.test(html) || /question-header/i.test(html);
  
  let processedHtml = html;
  if (!hasCustomClass && (!hasLists || html.includes('•') || html.includes('●') || /\([a-zivx]+\)/i.test(html) || html.replace(/<[^>]+>/g, ' ').length > 400)) {
    processedHtml = reconstructHtmlStructure(html);
  }

  let ast;
  if (typeof DOMParser !== 'undefined') {
    try {
      ast = domToAst(processedHtml);
    } catch (_error) {
      ast = fallbackParseHtml(processedHtml);
    }
  } else {
    ast = fallbackParseHtml(processedHtml);
  }

  // Post-process to fix standalone labels, merge consecutive lists, etc.
  ast.blocks = postProcessAstBlocks(ast.blocks);

  return ast;
}

function parseOptionToBlocks(optionText) {
  const { blocks } = parseHtmlToAst(optionText);
  return blocks.length > 0
    ? blocks
    : [{ type: 'paragraph', inlines: [{ type: 'text', text: ensureString(optionText), marks: {} }] }];
}

function sortImageAssets(imageAssets = []) {
  return [...imageAssets].sort((left, right) => {
    const leftPage = clampNumber(left.page_number ?? left.pageNumber, clampNumber(left.order, 0), 0);
    const rightPage = clampNumber(right.page_number ?? right.pageNumber, clampNumber(right.order, 0), 0);
    if (leftPage !== rightPage) return leftPage - rightPage;

    const leftY = clampNumber(left?.bbox?.y ?? left?.bbox_json?.y, clampNumber(left.order, 0), 0);
    const rightY = clampNumber(right?.bbox?.y ?? right?.bbox_json?.y, clampNumber(right.order, 0), 0);
    if (leftY !== rightY) return leftY - rightY;

    const leftX = clampNumber(left?.bbox?.x ?? left?.bbox_json?.x, clampNumber(left.order, 0), 0);
    const rightX = clampNumber(right?.bbox?.x ?? right?.bbox_json?.x, clampNumber(right.order, 0), 0);
    if (leftX !== rightX) return leftX - rightX;

    return clampNumber(left.order, 0) - clampNumber(right.order, 0);
  });
}

export function normalizeQuestionImages(card = {}, inlineImages = []) {
  const canonicalImages = sortImageAssets(
    Array.isArray(card?.parsed_metadata?.imageAssets) && card.parsed_metadata.imageAssets.length > 0
      ? card.parsed_metadata.imageAssets
      : (card?.image_urls || []).map((url, index) => ({ id: `legacy-${index + 1}`, url, order: index }))
  );

  const deduped = [];
  const seenUrls = new Set();

  [...inlineImages, ...canonicalImages].forEach((asset, index) => {
    const url = ensureString(asset?.url);
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    deduped.push({
      id: ensureString(asset?.id) || `img-${index + 1}`,
      url,
      caption: ensureString(asset?.caption),
      width: asset?.width ?? null,
      height: asset?.height ?? null,
      order: clampNumber(asset?.order, index, 0),
      page_number: asset?.page_number ?? asset?.pageNumber ?? null,
      bbox: asset?.bbox ?? asset?.bbox_json ?? null,
      source: asset?.source || (index < inlineImages.length ? 'inline' : 'asset'),
    });
  });

  return sortImageAssets(deduped);
}

function normalizeAnswerSpaceType(rawValue) {
  const value = ensureString(rawValue).trim().toLowerCase();
  if (!value || value === 'auto' || value === 'inherit') return 'auto';
  if (value === 'none') return 'auto';
  if (value === 'no_space') return 'none';
  if (value === 'lines') return 'lined';
  if (value === 'graph_grid' || value === 'grid') return 'graph';
  if (value === 'blank' || value === 'drawing_area') return 'blank';
  if (value === 'box') return 'boxed';
  return value;
}

function calculateWritableLines(marks = 0, baseLineCount = 5) {
  if (marks <= 0) return Math.max(2, Math.min(baseLineCount, 4));
  if (marks <= 1) return 2;
  if (marks <= 2) return 4;
  if (marks <= 3) return 6;
  if (marks <= 5) return 10;
  if (marks <= 10) return 10 + ((marks - 5) * 2);
  if (marks <= 15) return 20 + ((marks - 10) * 2);
  return 30 + ((marks - 15) * 2);
}

function calculateWritableHeight(marks = 0, baseHeight = 120, extraLargeFloor = 150) {
  if (marks <= 2) return Math.max(84, Math.min(baseHeight, 100));
  if (marks <= 5) return Math.max(104, baseHeight);
  if (marks <= 10) return Math.max(extraLargeFloor, baseHeight + 18);
  return Math.max(extraLargeFloor + 24, baseHeight + 42);
}

function questionLooksGraphFriendly(card = {}) {
  const haystack = [
    card?.question_type,
    card?.question_body,
    card?.parsed_metadata?.source_snippet,
    card?.parsed_metadata?.source_ocr_text,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return GRAPH_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function deriveHeuristicAnswerArea(card, paperSettings, paperType) {
  const marks = clampNumber(card?.marks, 0, 0);
  const graphFriendly = questionLooksGraphFriendly(card);
  const technicalMode = isTechnicalWritablePaperType(paperType);

  switch (card?.question_type) {
    case 'mcq':
    case 'true_false':
    case 'assertion_reason':
      return { mode: 'none' };
    case 'mcq_reasoning':
      return {
        mode: 'lined',
        lines: Math.max(3, Math.min(5, calculateWritableLines(marks, paperSettings.writableLineCount) - 1)),
      };
    case 'numerical':
      return graphFriendly && technicalMode
        ? { mode: 'graph', height: calculateWritableHeight(marks, paperSettings.graphBoxHeight, 144) }
        : { mode: 'steps', lines: Math.max(4, Math.min(10, calculateWritableLines(marks, paperSettings.writableLineCount))) };
    case 'image_based':
    case 'diagram_based':
      return technicalMode || graphFriendly
        ? { mode: 'graph', height: calculateWritableHeight(marks, paperSettings.graphBoxHeight, 150) }
        : { mode: 'blank', height: calculateWritableHeight(marks, paperSettings.writableBoxHeight, 136) };
    case 'short_subjective':
      return {
        mode: 'lined',
        lines: Math.max(4, Math.min(8, calculateWritableLines(marks, paperSettings.writableLineCount))),
      };
    case 'case_study':
    case 'long_subjective':
    default:
      return {
        mode: 'lined',
        lines: calculateWritableLines(marks, paperSettings.writableLineCount),
      };
  }
}

export function deriveAnswerArea(card = {}, paperSettings = {}, paperType = 'standard') {
  const normalizedSettings = normalizePaperSettings(paperSettings);
  const explicitType = normalizeAnswerSpaceType(card?.writing_space_type);
  const explicitLines = clampNumber(card?.writing_space_lines, 0, 0);
  const explicitHeight = clampNumber(card?.writing_space_height, 0, 0);

  if (explicitType !== 'auto') {
    if (explicitType === 'none') {
      return { mode: 'none' };
    }
    if (explicitType === 'lined') {
      return { mode: 'lined', lines: explicitLines || normalizedSettings.writableLineCount };
    }
    if (explicitType === 'steps') {
      return { mode: 'steps', lines: explicitLines || Math.max(4, normalizedSettings.writableLineCount) };
    }
    if (explicitType === 'graph') {
      return { mode: 'graph', height: explicitHeight || normalizedSettings.graphBoxHeight };
    }
    if (explicitType === 'blank') {
      return { mode: 'blank', height: explicitHeight || normalizedSettings.writableBoxHeight };
    }
    if (explicitType === 'boxed') {
      return { mode: 'boxed', height: explicitHeight || normalizedSettings.writableBoxHeight };
    }
  }

  if (!isWritablePaperType(paperType)) {
    return { mode: 'none' };
  }

  return deriveHeuristicAnswerArea(card, normalizedSettings, paperType);
}

function extractPlainTextFromInlines(inlines = []) {
  return inlines.map((inline) => ensureString(inline?.text)).join(' ').replace(/\s+/g, ' ').trim();
}

function estimateLinesFromText(text, charsPerLine = DEFAULT_CHARS_PER_LINE) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function inlineLength(inline) {
  return ensureString(inline?.text).length;
}

function splitInlinesByBudget(inlines = [], charBudget = DEFAULT_CHARS_PER_LINE * DEFAULT_BODY_LINES_PER_SEGMENT) {
  let remaining = charBudget;
  const head = [];
  const tail = [];

  inlines.forEach((inline) => {
    if (inline.type === 'br') {
      if (remaining <= 0) {
        tail.push(inline);
      } else {
        head.push(inline);
      }
      return;
    }
    const text = ensureString(inline?.text);
    if (!text) return;

    if (remaining <= 0) {
      tail.push({ ...inline, text });
      return;
    }

    if (text.length <= remaining) {
      head.push({ ...inline, text });
      remaining -= text.length;
      return;
    }

    const cutAt = Math.max(1, text.lastIndexOf(' ', remaining));
    head.push({ ...inline, text: text.slice(0, cutAt).trim() });
    tail.push({ ...inline, text: text.slice(cutAt).trim() });
    remaining = 0;
  });

  return [
    head.filter((inline) => inline.type === 'br' || ensureString(inline.text)),
    tail.filter((inline) => inline.type === 'br' || ensureString(inline.text)),
  ];
}

function splitParagraphBlock(block, lineBudget = DEFAULT_BODY_LINES_PER_SEGMENT) {
  const maxChars = lineBudget * DEFAULT_CHARS_PER_LINE;
  const segments = [];
  let current = block?.inlines || [];

  while (current.length > 0) {
    const currentTextLength = current.reduce((sum, inline) => sum + inlineLength(inline), 0);
    if (currentTextLength <= maxChars) {
      segments.push({ type: 'paragraph', inlines: current });
      current = [];
      continue;
    }

    const [head, tail] = splitInlinesByBudget(current, maxChars);
    if (head.length === 0) {
      segments.push({ type: 'paragraph', inlines: current });
      current = [];
      continue;
    }

    segments.push({ type: 'paragraph', inlines: head });
    current = tail;
  }

  return segments;
}

function splitListBlock(block, lineBudget = DEFAULT_BODY_LINES_PER_SEGMENT) {
  const segments = [];
  let currentItems = [];
  let currentLines = 0;

  (block?.items || []).forEach((item) => {
    const text = extractPlainTextFromInlines(item.inlines);
    const lines = Math.max(1, estimateLinesFromText(text));
    if (currentItems.length > 0 && currentLines + lines > lineBudget) {
      segments.push({
        type: 'list',
        ordered: Boolean(block?.ordered),
        items: currentItems,
      });
      currentItems = [];
      currentLines = 0;
    }

    currentItems.push(item);
    currentLines += lines;
  });

  if (currentItems.length > 0) {
    segments.push({
      type: 'list',
      ordered: Boolean(block?.ordered),
      items: currentItems,
    });
  }

  return segments;
}

function estimateBlockHeight(block) {
  if (!block) return 0;

  if (block.type === 'paragraph') {
    return Math.max(26, estimateLinesFromText(extractPlainTextFromInlines(block.inlines)) * 22 + 8);
  }

  if (block.type === 'list') {
    const lines = (block.items || []).reduce(
      (sum, item) => sum + Math.max(1, estimateLinesFromText(extractPlainTextFromInlines(item.inlines))),
      0
    );
    const itemGaps = Math.max(0, (block.items || []).length - 1) * 4;
    return Math.max(30, lines * 22 + 8 + itemGaps);
  }

  if (block.type === 'pre') {
    const lines = (block.text || '').split('\n').length;
    return Math.max(30, lines * 16 + 24);
  }

  if (block.type === 'options') {
    const optionHeights = (block.options || []).map((option) => {
      const optionHeight = (option.blocks || []).reduce((sum, optBlock) => {
        return sum + estimateBlockHeight(optBlock);
      }, 0);
      return optionHeight + 26;
    });

    let totalHeight = 0;
    for (let i = 0; i < optionHeights.length; i += 2) {
      const h1 = optionHeights[i] || 0;
      const h2 = optionHeights[i + 1] || 0;
      totalHeight += Math.max(h1, h2);
      if (i > 0) {
        totalHeight += 16;
      }
    }
    return Math.max(54, totalHeight + 12);
  }

  return 0;
}

function splitBlocksIntoSegments(blocks = [], lineBudget = DEFAULT_BODY_LINES_PER_SEGMENT) {
  const fragments = [];

  blocks.forEach((block) => {
    if (block.type === 'pre') {
      fragments.push(block);
      return;
    }

    if (block.type === 'paragraph') {
      splitParagraphBlock(block, lineBudget).forEach((fragment) => fragments.push(fragment));
      return;
    }

    if (block.type === 'list') {
      splitListBlock(block, lineBudget).forEach((fragment) => fragments.push(fragment));
      return;
    }

    fragments.push(block);
  });

  return fragments.reduce((segments, fragment) => {
    const lastSegment = segments[segments.length - 1];
    const fragmentHeight = estimateBlockHeight(fragment);

    if (!lastSegment) {
      segments.push({
        blocks: [fragment],
        estimatedHeight: fragmentHeight,
      });
      return segments;
    }

    if (fragment.type === 'options') {
      segments.push({
        blocks: [fragment],
        estimatedHeight: fragmentHeight,
      });
      return segments;
    }

    const blockGap = 12;
    if (lastSegment.estimatedHeight + fragmentHeight + blockGap <= lineBudget * 22) {
      lastSegment.blocks.push(fragment);
      lastSegment.estimatedHeight += fragmentHeight + blockGap;
      return segments;
    }

    segments.push({
      blocks: [fragment],
      estimatedHeight: fragmentHeight,
    });
    return segments;
  }, []);
}

function buildOptionBlock(card = {}) {
  const options = supportsOptions(card?.question_type)
    ? (card?.parsed_metadata?.options || []).filter((option) => ensureString(option?.text))
    : [];

  if (options.length === 0) return null;

  return {
    type: 'options',
    options: options.map((option, index) => ({
      id: option.id || `option-${index + 1}`,
      key: option.key || String.fromCharCode(65 + index),
      blocks: parseOptionToBlocks(option.text),
    })),
  };
}

function estimateImagesHeight(questionBlock) {
  if (!questionBlock.images.length) return 0;
  const imageHeight = clampNumber(
    questionBlock.layoutMode?.imageHeight,
    questionBlock.paperType === 'writable' ? 200 : 220,
    120
  );
  return questionBlock.images.length * (imageHeight + 28) + 18;
}

function estimateAnswerAreaHeight(answerArea) {
  if (!answerArea || answerArea.mode === 'none') return 0;
  if (answerArea.mode === 'lined' || answerArea.mode === 'steps') {
    return clampNumber(answerArea.lines, 0, 0) * 20 + 12;
  }
  return clampNumber(answerArea.height, 0, 0) + 12;
}

export function buildQuestionBlock(card, context = {}) {
  const paperSettings = normalizePaperSettings(context.paperSettings);
  let rawBody = ensureString(card?.question_body);
  
  // Extract title and qNum prefix from plain text to avoid splitting HTML tags
  const plainTextForHeader = htmlDecode(rawBody.replace(/<[^>]+>/g, ' ').trim());
  const parsedHeader = parseQuestionHeaderAndTitle(plainTextForHeader);
  let extractedTitle = parsedHeader.title || card?.parsed_metadata?.title || '';
  
  // If the extracted title contains ONLY marks (e.g. "[35 Marks]" or "[10]"), discard it as title
  if (/^\[\s*\d+(?:\.\d+)?\s*(?:Marks|M|marks|m)?\s*\]$/i.test(extractedTitle.trim())) {
    extractedTitle = '';
  }
  
  let cleanBody = rawBody;
  
  // Strip question-header div block and question-marks span entirely from cleanBody
  cleanBody = cleanBody.replace(/<div class=["']question-header["']>[\s\S]*?<\/div>/gi, '');
  cleanBody = cleanBody.replace(/<span class=["']question-marks["']>[\s\S]*?<\/span>/gi, '');
  
  // Strip question number prefix like Q1. or Q1) from rawBody/cleanBody
  cleanBody = cleanBody.replace(/^\s*(?:<[^>]+>)*\s*Q\d+[.)]\s*/i, '');
  // If we found a title, we can also remove it from the start of the body
  if (extractedTitle) {
    const words = extractedTitle.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(?:\\s*|<[^>]+>)+');
      const titleRegex = new RegExp(`^\\s*(?:<[^>]+>)*\\s*${pattern}\\s*(?:<[^>]+>)*[.:]?\\s*(?:<[^>]+>)*`, 'i');
      cleanBody = cleanBody.replace(titleRegex, '');
    }
  }

  // Strip trailing marks like [10 Marks] or [10] at the end of elements, paragraphs, or lines
  cleanBody = cleanBody.replace(/\s*\[\s*\d+(\.\d+)?\s*(?:Marks|M|marks|m)?\s*\]\s*(?=(?:<\/p>|<\/li>|<br\s*\/?>|\n|$))/gi, '');
  
  const bodyAst = parseHtmlToAst(cleanBody);
  const bodyBlocks = [...bodyAst.blocks];

  let finalTitle = extractedTitle;
  if (!finalTitle && bodyBlocks.length > 0 && bodyBlocks[0].type === 'paragraph') {
    const firstBlockText = extractPlainTextFromInlines(bodyBlocks[0].inlines);
    if (firstBlockText.length < 150) {
      finalTitle = firstBlockText;
      bodyBlocks.shift();
    }
  }

  const optionBlock = buildOptionBlock(card);
  if (optionBlock) bodyBlocks.push(optionBlock);

  const images = normalizeQuestionImages(card, bodyAst.inlineImages);
  const answerArea = deriveAnswerArea(card, paperSettings, context.paperType);
  const imageStyle = card?.parsed_metadata?.paper_image_style || {};
  const questionBlock = {
    id: String(card?.id),
    cardId: String(card?.id),
    type: card?.question_type || 'long_subjective',
    title: finalTitle,
    body: {
      blocks: bodyBlocks,
      plainText: bodyBlocks
        .map((block) => {
          if (block.type === 'paragraph') return extractPlainTextFromInlines(block.inlines);
          if (block.type === 'list') return block.items.map((item) => extractPlainTextFromInlines(item.inlines)).join(' ');
          if (block.type === 'options') return block.options.map((option) => option.blocks.map((child) => child.type === 'paragraph' ? extractPlainTextFromInlines(child.inlines) : '').join(' ')).join(' ');
          return '';
        })
        .filter(Boolean)
        .join(' '),
    },
    marks: clampNumber(card?.marks, 0, 0),
    images,
    answerArea,
    layoutMode: {
      paperType: context.paperType || 'standard',
      imageAlign: imageStyle.align || 'center',
      imageSize: imageStyle.size || 'large',
      imageHeight: clampNumber(
        imageStyle.height,
        (context.paperType || 'standard') === 'writable' ? 200 : 220,
        120
      ),
    },
    estimatedHeight: 0,
    allowPageSplit: true,
    questionNumber: context.questionNumber || 1,
    questionDisplayNumber: String(context.questionDisplayNumber || context.questionNumber || 1),
    questionLabel: getSourceQuestionLabel(card, context.questionNumber || 1),
    sectionId: context.sectionId || null,
    paperType: context.paperType || 'standard',
    rawCard: card,
  };

  const blockGap = 12;
  const bodyHeight = bodyBlocks.reduce((sum, block, idx) => {
    const gap = idx > 0 ? blockGap : 0;
    return sum + estimateBlockHeight(block) + gap;
  }, 0);
  questionBlock.estimatedHeight = 26 + bodyHeight + estimateImagesHeight(questionBlock) + estimateAnswerAreaHeight(answerArea);
  questionBlock.allowPageSplit = questionBlock.estimatedHeight > 240 || bodyBlocks.length > 2 || ((answerArea.mode === 'lined' || answerArea.mode === 'steps') && answerArea.lines > 6);
  return questionBlock;
}

export function createQuestionSegments(questionBlock) {
  const segments = [];
  const bodySegments = splitBlocksIntoSegments(
    questionBlock.body.blocks,
    questionBlock.allowPageSplit ? DEFAULT_BODY_LINES_PER_SEGMENT : 99
  );

  bodySegments.forEach((segment, index) => {
    segments.push({
      id: `${questionBlock.id}-body-${index + 1}`,
      type: 'questionSegment',
      segmentType: 'body',
      questionId: questionBlock.id,
      cardId: questionBlock.cardId,
      questionNumber: questionBlock.questionNumber,
      questionDisplayNumber: questionBlock.questionDisplayNumber,
      questionLabel: questionBlock.questionLabel,
      marks: questionBlock.marks,
      continuation: index > 0,
      showNumber: index === 0,
      showMarks: index === 0,
      blocks: segment.blocks,
      images: [],
      answerArea: null,
      estimatedHeight: segment.estimatedHeight + (index === 0 ? 30 : 24),
      layoutMode: questionBlock.layoutMode,
      rawCard: questionBlock.rawCard,
    });
  });

  const attachAnswerAreaToLastSegment = (answerArea) => {
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return false;
    lastSegment.answerArea = answerArea;
    lastSegment.estimatedHeight += estimateAnswerAreaHeight(answerArea);
    return true;
  };

  if (questionBlock.images.length > 0) {
    segments.push({
      id: `${questionBlock.id}-images`,
      type: 'questionSegment',
      segmentType: 'images',
      questionId: questionBlock.id,
      cardId: questionBlock.cardId,
      questionNumber: questionBlock.questionNumber,
      questionDisplayNumber: questionBlock.questionDisplayNumber,
      questionLabel: questionBlock.questionLabel,
      marks: questionBlock.marks,
      continuation: bodySegments.length > 0,
      showNumber: bodySegments.length === 0,
      showMarks: bodySegments.length === 0,
      blocks: [],
      images: questionBlock.images,
      answerArea: null,
      estimatedHeight: estimateImagesHeight(questionBlock),
      layoutMode: questionBlock.layoutMode,
      rawCard: questionBlock.rawCard,
    });
  }

  if (questionBlock.answerArea?.mode === 'lined' || questionBlock.answerArea?.mode === 'steps') {
    const totalLines = clampNumber(questionBlock.answerArea.lines, 0, 0);
    const inlineLines = Math.min(totalLines, DEFAULT_INLINE_ANSWER_LINES);
    let remaining = totalLines;
    let index = 0;
    if (inlineLines > 0 && attachAnswerAreaToLastSegment({
      ...questionBlock.answerArea,
      lines: inlineLines,
    })) {
      remaining -= inlineLines;
    }
    while (remaining > 0) {
      const lineCount = Math.min(DEFAULT_CONTINUATION_ANSWER_LINES, remaining);
      segments.push({
        id: `${questionBlock.id}-answer-${index + 1}`,
        type: 'questionSegment',
        segmentType: 'answer',
        questionId: questionBlock.id,
        cardId: questionBlock.cardId,
        questionNumber: questionBlock.questionNumber,
        questionDisplayNumber: questionBlock.questionDisplayNumber,
        questionLabel: questionBlock.questionLabel,
        marks: questionBlock.marks,
        continuation: true,
        showNumber: false,
        showMarks: false,
        blocks: [],
        images: [],
        answerArea: { ...questionBlock.answerArea, lines: lineCount },
        estimatedHeight: estimateAnswerAreaHeight({ ...questionBlock.answerArea, lines: lineCount }),
        layoutMode: questionBlock.layoutMode,
        rawCard: questionBlock.rawCard,
      });
      remaining -= lineCount;
      index += 1;
    }
  } else if (questionBlock.answerArea && questionBlock.answerArea.mode !== 'none') {
    const attached = attachAnswerAreaToLastSegment(questionBlock.answerArea);
    if (!attached) {
      segments.push({
        id: `${questionBlock.id}-answer`,
        type: 'questionSegment',
        segmentType: 'answer',
        questionId: questionBlock.id,
        cardId: questionBlock.cardId,
        questionNumber: questionBlock.questionNumber,
        questionDisplayNumber: questionBlock.questionDisplayNumber,
        questionLabel: questionBlock.questionLabel,
        marks: questionBlock.marks,
        continuation: true,
        showNumber: false,
        showMarks: false,
        blocks: [],
        images: [],
        answerArea: questionBlock.answerArea,
        estimatedHeight: estimateAnswerAreaHeight(questionBlock.answerArea),
        layoutMode: questionBlock.layoutMode,
        rawCard: questionBlock.rawCard,
      });
    }
  }

  return segments.map((segment, index) => ({
    ...segment,
    title: questionBlock.title || '',
    isFirstSegment: index === 0,
    isLastSegment: index === segments.length - 1,
    totalSegments: segments.length,
  }));
}

function buildHeaderDescriptor(builderLayout = {}) {
  const headerInstructions = parseHtmlToAst(ensureString(builderLayout.instructions));
  return {
    title: ensureString(builderLayout.headerTitle || 'Examination Paper'),
    subtitle: ensureString(builderLayout.headerSubtitle || builderLayout.institution),
    templateId: ensureString(builderLayout.template_id || builderLayout.templateId || 'universal'),
    institution: ensureString(builderLayout.institution),
    course: ensureString(builderLayout.course),
    subject: ensureString(builderLayout.subject),
    subjectCode: resolveSubjectCode(builderLayout),
    examTime: ensureString(builderLayout.examTime || '3 Hours'),
    totalMarks: builderLayout.totalMarks ?? 100,
    instructions: headerInstructions.blocks,
  };
}

function buildSectionDescriptors(normalizedSections, cardsById, paperSettings, paperType, globalContext = { questionIndex: 0 }) {
  return normalizedSections
    .map((section, index) => {
      const cards = section.cardIds
        .map((cardId) => cardsById.get(String(cardId)))
        .filter(Boolean);
      if (cards.length === 0) return null;

      const instructionsAst = parseHtmlToAst(section.instructions);
      const questionBlocks = cards.map((card, cardIndex) => {
        globalContext.questionIndex += 1;
        return buildQuestionBlock(card, {
          sectionId: section.id,
          questionNumber: globalContext.questionIndex,
          questionDisplayNumber: cardIndex + 1,
          paperSettings,
          paperType,
        });
      });

      return {
        ...section,
        orderIndex: index,
        instructionsAst: instructionsAst.blocks,
        cards,
        questionBlocks,
        marks: cards.reduce((sum, card) => sum + clampNumber(card?.marks, 0, 0), 0),
      };
    })
    .filter(Boolean);
}

function estimateSectionHeaderHeight(section) {
  const blockGap = 12;
  const instructionHeight = (section.instructionsAst || []).reduce((sum, block, idx) => {
    const gap = idx > 0 ? blockGap : 0;
    return sum + estimateBlockHeight(block) + gap;
  }, 0);
  return 46 + instructionHeight;
}

function createEmptyPage(pageNumber, isFirstPage, header, paperSettings) {
  const repeatHeaderHeight = paperSettings.repeatHeader && !isFirstPage
    ? DEFAULT_REPEAT_HEADER_HEIGHT
    : 0;
  const headerHeight = isFirstPage && paperSettings.includeCoverHeader !== false
    ? DEFAULT_FIRST_PAGE_HEADER_HEIGHT
    : repeatHeaderHeight;
  const footerHeight = paperSettings.footerEnabled !== false ? DEFAULT_FOOTER_HEIGHT : 0;

  return {
    id: `page-${pageNumber}`,
    pageNumber,
    isFirstPage,
    headerMode: isFirstPage ? 'full' : (paperSettings.repeatHeader ? 'repeat' : 'none'),
    header,
    footerEnabled: paperSettings.footerEnabled !== false,
    headerHeight,
    footerHeight,
    contentHeight: DEFAULT_PAGE_HEIGHT - headerHeight - footerHeight,
    cursorY: 0,
    remainingHeight: DEFAULT_PAGE_HEIGHT - headerHeight - footerHeight,
    items: [],
  };
}

export function paginatePaperDocument({ header, sections, paperSettings = {} }) {
  const normalizedSettings = normalizePaperSettings(paperSettings);
  const pages = [];
  let currentPage = createEmptyPage(1, true, header, normalizedSettings);
  pages.push(currentPage);

  const startNewPage = () => {
    currentPage = createEmptyPage(pages.length + 1, false, header, normalizedSettings);
    pages.push(currentPage);
  };

  const pushItem = (item) => {
    currentPage.items.push({
      ...item,
      yOffset: currentPage.cursorY,
    });
    currentPage.cursorY += item.estimatedHeight;
    currentPage.remainingHeight -= item.estimatedHeight;
  };

  const paginateQuestionBlock = (questionBlock) => {
    const questionSegments = createQuestionSegments(questionBlock);

    questionSegments.forEach((segment, index) => {
      if (segment.estimatedHeight > currentPage.remainingHeight && currentPage.items.length > 0) {
        startNewPage();
      }

      pushItem({
        ...segment,
        continuation: segment.continuation || index > 0,
      });
    });
  };

  const allSectionLikeGroups = [...sections];

  allSectionLikeGroups.forEach((section, sectionIndex) => {
    const needsPageBreak = Boolean(section.parsed_metadata?.page_break_before)
      || (normalizedSettings.startSectionsNewPage && sectionIndex !== 0);
    if (needsPageBreak && currentPage.items.length > 0) {
      startNewPage();
    }

    const firstQuestion = section.questionBlocks[0];
    const firstQuestionSegment = firstQuestion ? createQuestionSegments(firstQuestion)[0] : null;

    const sectionHeaderHeight = estimateSectionHeaderHeight(section);
    if (firstQuestion) {
      if (
        currentPage.items.length > 0
        && sectionHeaderHeight + (firstQuestionSegment?.estimatedHeight || firstQuestion.estimatedHeight) > currentPage.remainingHeight
      ) {
        startNewPage();
      }
    } else if (currentPage.items.length > 0 && sectionHeaderHeight > currentPage.remainingHeight) {
      startNewPage();
    }

    pushItem({
      id: `section-${section.id}`,
      type: 'sectionHeader',
      sectionId: section.id,
      title: section.title,
      instructions: section.instructionsAst || [],
      marks: section.marks,
      estimatedHeight: sectionHeaderHeight,
    });

    section.questionBlocks.forEach((questionBlock) => paginateQuestionBlock(questionBlock));
  });

  return pages
    .filter((page) => page.items.length > 0)
    .map((page, index) => ({
      ...page,
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      isFirstPage: index === 0,
      remainingHeight: undefined,
      cursorY: undefined,
    }));
}

export function buildPaperDocument({
  cards = [],
  sections = [],
  builderLayout = {},
  paperSettings = {},
  paperType = 'standard',
}) {
  const normalizedSettings = normalizePaperSettings(paperSettings);
  const normalizedSections = normalizeLegacySections(sections, cards);
  const cardsById = new Map(cards.map((card) => [String(card.id), card]));
  const header = buildHeaderDescriptor(builderLayout);
  
  const globalContext = { questionIndex: 0 };
  const resolvedSections = buildSectionDescriptors(normalizedSections, cardsById, normalizedSettings, paperType, globalContext);
  
  const questions = resolvedSections.flatMap((section) => section.questionBlocks);
  const pageDescriptors = paginatePaperDocument({
    header,
    sections: resolvedSections,
    paperSettings: normalizedSettings,
  });

  return {
    header,
    sections: resolvedSections,
    questions,
    pageDescriptors,
    normalizedSections,
  };
}

export function summarizePaperDocument(paperDocument = null) {
  const pageItems = paperDocument?.pageDescriptors?.flatMap((page) => page.items || []) || [];
  const renderedSectionCount = pageItems.filter((item) => item.type === 'sectionHeader').length;
  const renderedQuestionItems = pageItems.filter(
    (item) => item.type === 'questionBlock' || item.type === 'questionSegment'
  );
  const renderedQuestionIds = renderedQuestionItems.map((item) => String(item.questionId || item.id));
  const renderedQuestionCount = new Set(renderedQuestionIds).size;
  const renderedSectionOrder = pageItems
    .filter((item) => item.type === 'sectionHeader')
    .map((item) => String(item.sectionId));
  const renderedQuestionOrder = renderedQuestionItems
    .filter((item, index, list) => (
      list.findIndex((candidate) => String(candidate.questionId || candidate.id) === String(item.questionId || item.id)) === index
    ))
    .map((item) => String(item.questionId || item.id));
  const expectedSectionOrder = (paperDocument?.sections || []).map((section) => String(section.id));
  const expectedQuestionOrder = (paperDocument?.sections || []).flatMap((section) => (
    section.questionBlocks || []
  ).map((questionBlock) => String(questionBlock.id)));
  const consecutiveDedupedIds = renderedQuestionIds.filter((id, index, arr) => index === 0 || id !== arr[index - 1]);
  const duplicateQuestionIds = consecutiveDedupedIds.filter(
    (questionId, index, list) => list.indexOf(questionId) !== index
  );

  return {
    sectionCount: paperDocument?.sections?.length || 0,
    questionCount: paperDocument?.questions?.length || 0,
    renderedSectionCount,
    renderedQuestionCount,
    pageCount: paperDocument?.pageDescriptors?.length || 0,
    expectedSectionOrder,
    renderedSectionOrder,
    expectedQuestionOrder,
    renderedQuestionOrder,
    duplicateQuestionIds,
  };
}

export function validatePaperDocumentForExport(paperDocument = null) {
  if (!paperDocument || !Array.isArray(paperDocument.pageDescriptors)) {
    throw new Error('ExportValidationError: paper document is missing page descriptors.');
  }

  const summary = summarizePaperDocument(paperDocument);

  if (summary.sectionCount !== summary.renderedSectionCount) {
    throw new Error(
      `ExportValidationError: previewSectionCount (${summary.sectionCount}) !== pdfSectionCount (${summary.renderedSectionCount}).`
    );
  }

  if (summary.questionCount !== summary.renderedQuestionCount) {
    throw new Error(
      `ExportValidationError: previewQuestionCount (${summary.questionCount}) !== pdfQuestionCount (${summary.renderedQuestionCount}).`
    );
  }

  if (summary.duplicateQuestionIds.length > 0) {
    throw new Error(
      `ExportValidationError: duplicate questions detected in export order (${summary.duplicateQuestionIds.join(', ')}).`
    );
  }

  if (JSON.stringify(summary.expectedSectionOrder) !== JSON.stringify(summary.renderedSectionOrder)) {
    throw new Error('ExportValidationError: rendered section order does not match builder section order.');
  }

  if (JSON.stringify(summary.expectedQuestionOrder) !== JSON.stringify(summary.renderedQuestionOrder)) {
    throw new Error('ExportValidationError: rendered question order does not match builder question order.');
  }

  return summary;
}
