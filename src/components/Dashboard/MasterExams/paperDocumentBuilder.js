import { supportsOptions } from './masterExamCardSchema.js';

const DEFAULT_PAGE_HEIGHT = 980;
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

  return (Array.isArray(rawSections) ? rawSections : []).map((section, index) => {
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
    },
  });
}

function inlineNodeFromDom(node, images, marks = {}) {
  if (node.nodeType === 3) {
    return [{ type: 'text', text: htmlDecode(node.textContent || ''), marks }];
  }

  if (node.nodeType !== 1) return [];

  const tag = node.tagName.toLowerCase();
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

  const fragments = [];
  Array.from(node.childNodes || []).forEach((child) => {
    inlineNodeFromDom(child, images, nextMarks).forEach((fragment) => {
      if (fragment.type === 'text') {
        appendTextInline(fragments, fragment.text, fragment.marks);
      }
    });
  });
  return fragments;
}

function domToAst(html = '') {
  const images = [];
  const ast = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstElementChild;

  const pushParagraph = (node) => {
    const inlines = [];
    Array.from(node.childNodes || []).forEach((child) => {
      inlineNodeFromDom(child, images).forEach((fragment) => {
        if (fragment.type === 'text') {
          appendTextInline(inlines, fragment.text, fragment.marks);
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

    if (tag === 'ul' || tag === 'ol') {
      const items = [];
      Array.from(node.children || []).forEach((child) => {
        if (child.tagName?.toLowerCase() !== 'li') return;
        const inlines = [];
        Array.from(child.childNodes || []).forEach((grandChild) => {
          inlineNodeFromDom(grandChild, images).forEach((fragment) => {
            if (fragment.type === 'text') {
              appendTextInline(inlines, fragment.text, fragment.marks);
            }
          });
        });
        if (inlines.length > 0) items.push({ inlines });
      });

      if (items.length > 0) {
        ast.push({ type: 'list', ordered: tag === 'ol', items });
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

export function parseHtmlToAst(html = '') {
  if (!html) return { blocks: [], inlineImages: [] };
  if (typeof DOMParser !== 'undefined') {
    try {
      return domToAst(html);
    } catch (_error) {
      return fallbackParseHtml(html);
    }
  }
  return fallbackParseHtml(html);
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
  if (marks <= 0) return Math.max(3, baseLineCount);
  if (marks <= 2) return 2;
  if (marks <= 5) return Math.max(5, baseLineCount);
  if (marks <= 10) return Math.max(8, baseLineCount + 2);
  if (marks <= 15) return Math.max(12, baseLineCount + 5);
  return Math.max(16, baseLineCount + 8);
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
    head.filter((inline) => ensureString(inline.text)),
    tail.filter((inline) => ensureString(inline.text)),
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
    return Math.max(24, estimateLinesFromText(extractPlainTextFromInlines(block.inlines)) * 18 + 6);
  }

  if (block.type === 'list') {
    const lines = (block.items || []).reduce(
      (sum, item) => sum + Math.max(1, estimateLinesFromText(extractPlainTextFromInlines(item.inlines))),
      0
    );
    return Math.max(30, lines * 18 + 8);
  }

  if (block.type === 'options') {
    const lines = (block.options || []).reduce((sum, option) => {
      const optionText = option.blocks
        .map((optionBlock) => {
          if (optionBlock.type === 'paragraph') return extractPlainTextFromInlines(optionBlock.inlines);
          if (optionBlock.type === 'list') return optionBlock.items.map((item) => extractPlainTextFromInlines(item.inlines)).join(' ');
          return '';
        })
        .join(' ');
      return sum + Math.max(1, estimateLinesFromText(optionText));
    }, 0);
    const rows = Math.max(1, Math.ceil((block.options || []).length / 2));
    return Math.max(54, rows * 28 + lines * 6 + 12);
  }

  return 0;
}

function splitBlocksIntoSegments(blocks = [], lineBudget = DEFAULT_BODY_LINES_PER_SEGMENT) {
  const fragments = [];

  blocks.forEach((block) => {
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

    if (lastSegment.estimatedHeight + fragmentHeight <= lineBudget * 22) {
      lastSegment.blocks.push(fragment);
      lastSegment.estimatedHeight += fragmentHeight;
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
  const bodyAst = parseHtmlToAst(ensureString(card?.question_body));
  const bodyBlocks = [...bodyAst.blocks];
  const optionBlock = buildOptionBlock(card);
  if (optionBlock) bodyBlocks.push(optionBlock);

  const images = normalizeQuestionImages(card, bodyAst.inlineImages);
  const answerArea = deriveAnswerArea(card, paperSettings, context.paperType);
  const imageStyle = card?.parsed_metadata?.paper_image_style || {};
  const questionBlock = {
    id: String(card?.id),
    cardId: String(card?.id),
    type: card?.question_type || 'long_subjective',
    title: '',
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
    questionLabel: getSourceQuestionLabel(card, context.questionNumber || 1),
    sectionId: context.sectionId || null,
    paperType: context.paperType || 'standard',
    rawCard: card,
  };

  const bodyHeight = bodyBlocks.reduce((sum, block) => sum + estimateBlockHeight(block), 0);
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
    course: ensureString(builderLayout.course),
    subject: ensureString(builderLayout.subject),
    examTime: ensureString(builderLayout.examTime || '3 Hours'),
    totalMarks: builderLayout.totalMarks ?? 100,
    instructions: headerInstructions.blocks,
  };
}

function buildSectionDescriptors(normalizedSections, cardsById, paperSettings, paperType) {
  return normalizedSections
    .map((section, index) => {
      const cards = section.cardIds
        .map((cardId) => cardsById.get(String(cardId)))
        .filter(Boolean);
      if (cards.length === 0) return null;

      const instructionsAst = parseHtmlToAst(section.instructions);
      const questionBlocks = cards.map((card, cardIndex) =>
        buildQuestionBlock(card, {
          sectionId: section.id,
          questionNumber: cardIndex + 1,
          paperSettings,
          paperType,
        })
      );

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

function buildUnsectionedQuestionBlocks(cards, usedCardIds, paperSettings, paperType) {
  return cards
    .filter((card) => !usedCardIds.has(String(card.id)))
    .map((card, index) =>
      buildQuestionBlock(card, {
        sectionId: null,
        questionNumber: index + 1,
        paperSettings,
        paperType,
      })
    );
}

function estimateSectionHeaderHeight(section) {
  const instructionHeight = (section.instructionsAst || []).reduce((sum, block) => sum + estimateBlockHeight(block), 0);
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
    remainingHeight: DEFAULT_PAGE_HEIGHT - headerHeight - footerHeight,
    items: [],
  };
}

export function paginatePaperDocument({ header, sections, unsectionedQuestionBlocks = [], paperSettings = {} }) {
  const normalizedSettings = normalizePaperSettings(paperSettings);
  const pages = [];
  let currentPage = createEmptyPage(1, true, header, normalizedSettings);
  pages.push(currentPage);

  const startNewPage = () => {
    currentPage = createEmptyPage(pages.length + 1, false, header, normalizedSettings);
    pages.push(currentPage);
  };

  const pushItem = (item) => {
    currentPage.items.push(item);
    currentPage.remainingHeight -= item.estimatedHeight;
  };

  const paginateQuestionBlock = (questionBlock) => {
    const segments = createQuestionSegments(questionBlock);
    const totalHeight = segments.reduce((sum, segment) => sum + segment.estimatedHeight, 0);
    const maxPageHeight = DEFAULT_PAGE_HEIGHT - DEFAULT_REPEAT_HEADER_HEIGHT - DEFAULT_FOOTER_HEIGHT;

    if (totalHeight <= maxPageHeight && totalHeight > currentPage.remainingHeight && currentPage.items.length > 0) {
      startNewPage();
    }

    segments.forEach((segment, index) => {
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
  if (unsectionedQuestionBlocks.length > 0) {
    allSectionLikeGroups.push({
      id: 'unsectioned',
      title: 'Unsectioned Questions',
      instructionsAst: [],
      marks: unsectionedQuestionBlocks.reduce((sum, block) => sum + block.marks, 0),
      parsed_metadata: {},
      questionBlocks: unsectionedQuestionBlocks,
    });
  }

  allSectionLikeGroups.forEach((section, sectionIndex) => {
    const needsPageBreak = Boolean(section.parsed_metadata?.page_break_before)
      || (normalizedSettings.startSectionsNewPage && sectionIndex !== 0);
    if (needsPageBreak && currentPage.items.length > 0) {
      startNewPage();
    }

    const firstQuestion = section.questionBlocks[0];
    if (!firstQuestion) return;

    const firstQuestionFirstSegment = createQuestionSegments(firstQuestion)[0];
    const sectionHeaderHeight = estimateSectionHeaderHeight(section);
    if (
      currentPage.items.length > 0
      && sectionHeaderHeight + firstQuestionFirstSegment.estimatedHeight > currentPage.remainingHeight
    ) {
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

  return pages.map((page) => ({
    ...page,
    remainingHeight: undefined,
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
  const usedCardIds = new Set(normalizedSections.flatMap((section) => section.cardIds));
  const header = buildHeaderDescriptor(builderLayout);
  const resolvedSections = buildSectionDescriptors(normalizedSections, cardsById, normalizedSettings, paperType);
  const unsectionedQuestionBlocks = buildUnsectionedQuestionBlocks(cards, usedCardIds, normalizedSettings, paperType);
  const questions = [
    ...resolvedSections.flatMap((section) => section.questionBlocks),
    ...unsectionedQuestionBlocks,
  ];
  const pageDescriptors = paginatePaperDocument({
    header,
    sections: resolvedSections,
    unsectionedQuestionBlocks,
    paperSettings: normalizedSettings,
  });

  return {
    header,
    sections: resolvedSections,
    questions,
    pageDescriptors,
    normalizedSections,
    unsectionedQuestionBlocks,
  };
}
