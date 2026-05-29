export const MASTER_EXAM_QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ', family: 'objective' },
  { value: 'mcq_reasoning', label: 'MCQ with Reasoning', family: 'objective' },
  { value: 'short_subjective', label: 'Short Subjective', family: 'subjective' },
  { value: 'long_subjective', label: 'Long Subjective', family: 'subjective' },
  { value: 'numerical', label: 'Numerical Answer', family: 'objective' },
  { value: 'true_false', label: 'True / False', family: 'objective' },
  { value: 'assertion_reason', label: 'Assertion & Reason', family: 'objective' },
  { value: 'fill_blank', label: 'Fill in the Blanks', family: 'objective' },
  { value: 'case_study', label: 'Case Study / Passage Based', family: 'subjective' },
  { value: 'image_based', label: 'Image-Based Question', family: 'media' },
  { value: 'diagram_based', label: 'Diagram-Based Question', family: 'media' },
];

export const MASTER_EXAM_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

export const EDITOR_SECTIONS = [
  { id: 'question', label: 'Question' },
  { id: 'images', label: 'Images' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'answer_settings', label: 'Answer Settings' },
  { id: 'preview', label: 'Preview' },
];

const legacyTypeToValue = {
  mcq: 'mcq',
  'mcq only': 'mcq',
  'multiple choice': 'mcq',
  subjective: 'long_subjective',
  'short answer': 'short_subjective',
  'long answer': 'long_subjective',
  numerical: 'numerical',
  coding: 'long_subjective',
};

const defaultOption = (index) => ({
  id: `option-${index + 1}`,
  key: String.fromCharCode(65 + index),
  text: '',
  isCorrect: false,
});

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const ensureString = (value) => (typeof value === 'string' ? value : '');
const ensureNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortImageAssets = (imageAssets = []) => (
  [...imageAssets].sort((left, right) => {
    const leftPage = ensureNumber(left?.page_number ?? left?.pageNumber, ensureNumber(left?.order, 0));
    const rightPage = ensureNumber(right?.page_number ?? right?.pageNumber, ensureNumber(right?.order, 0));
    if (leftPage !== rightPage) return leftPage - rightPage;

    const leftY = ensureNumber(left?.bbox?.y ?? left?.bbox_json?.y, ensureNumber(left?.order, 0));
    const rightY = ensureNumber(right?.bbox?.y ?? right?.bbox_json?.y, ensureNumber(right?.order, 0));
    if (leftY !== rightY) return leftY - rightY;

    const leftX = ensureNumber(left?.bbox?.x ?? left?.bbox_json?.x, ensureNumber(left?.order, 0));
    const rightX = ensureNumber(right?.bbox?.x ?? right?.bbox_json?.x, ensureNumber(right?.order, 0));
    if (leftX !== rightX) return leftX - rightX;

    return ensureNumber(left?.order, 0) - ensureNumber(right?.order, 0);
  })
);

const inferQuestionType = (card = {}) => {
  const normalized = ensureString(card.question_type).trim().toLowerCase();
  if (legacyTypeToValue[normalized]) return legacyTypeToValue[normalized];

  if (normalized.includes('reason')) return 'mcq_reasoning';
  if (normalized.includes('mcq')) return 'mcq';
  if (normalized.includes('numerical')) return 'numerical';
  if (normalized.includes('true')) return 'true_false';
  if (normalized.includes('assertion')) return 'assertion_reason';
  if (normalized.includes('blank') || normalized.includes('fill')) return 'fill_blank';
  if (normalized.includes('case')) return 'case_study';
  if (normalized.includes('diagram')) return 'diagram_based';
  if (normalized.includes('image')) return 'image_based';

  return 'long_subjective';
};

export const getQuestionTypeDefinition = (value) =>
  MASTER_EXAM_QUESTION_TYPES.find((item) => item.value === value) || MASTER_EXAM_QUESTION_TYPES[3];

export const isObjectiveType = (value) => ['mcq', 'mcq_reasoning', 'true_false', 'assertion_reason', 'numerical', 'fill_blank'].includes(value);
export const supportsOptions = (value) => ['mcq', 'mcq_reasoning', 'true_false', 'assertion_reason'].includes(value);
export const supportsReasoning = (value) => value === 'mcq_reasoning';

export const createDefaultParsedMetadata = (questionType = 'long_subjective') => ({
  title: '',
  instructions: '',
  internal_notes: '',
  topic: '',
  unit: '',
  subject: '',
  course: '',
  source_year: '',
  source_page_number: '',
  imported_date: '',
  source_paper_name: '',
  source_paper_section: '',
  source_folder_path: [],
  co_mapping: [],
  bloom_taxonomy: '',
  attachments: [],
  options: supportsOptions(questionType) ? [defaultOption(0), defaultOption(1), defaultOption(2), defaultOption(3)] : [],
  correct_option_ids: [],
  explanation: '',
  negative_marking: '',
  shuffle_options: false,
  reasoning_prompt: '',
  reasoning_rubric: '',
  selection_marks: '',
  reasoning_marks: '',
  ai_evaluation_config: '',
  reference_answer: '',
  ai_generated_answer: '',
  rubrics: [],
  expected_concepts: [],
  step_marking_config: '',
  binary_marking: false,
  source_snippet: '',
  source_ocr_text: '',
  extraction_confidence: '',
  extracted_image_notes: '',
  manual_image_asset_overrides: false,
  subparts: [],
});

const normalizeOptions = (questionType, options, correctOptionIds) => {
  const optionList = ensureArray(options)
    .map((option, index) => ({
      id: ensureString(option?.id) || `option-${index + 1}`,
      key: ensureString(option?.key) || String.fromCharCode(65 + index),
      text: ensureString(option?.text ?? option?.label ?? option),
      isCorrect: Boolean(option?.isCorrect),
    }));

  const seeded = optionList.length > 0
    ? optionList
    : (supportsOptions(questionType) ? [defaultOption(0), defaultOption(1), defaultOption(2), defaultOption(3)] : []);

  const normalizedCorrectIds = ensureArray(correctOptionIds).map((item) => ensureString(item));

  return seeded.map((option) => ({
    ...option,
    isCorrect: option.isCorrect || normalizedCorrectIds.includes(option.id) || normalizedCorrectIds.includes(option.key),
  }));
};

export const normalizeMasterExamCard = (card = {}) => {
  const questionType = inferQuestionType(card);
  const baseMetadata = createDefaultParsedMetadata(questionType);
  const incomingMetadata = card?.parsed_metadata && typeof card.parsed_metadata === 'object'
    ? card.parsed_metadata
    : {};

  const options = normalizeOptions(
    questionType,
    incomingMetadata.options,
    incomingMetadata.correct_option_ids
  );

  const parsedMetadata = {
    ...baseMetadata,
    ...incomingMetadata,
    co_mapping: ensureArray(incomingMetadata.co_mapping),
    source_folder_path: ensureArray(incomingMetadata.source_folder_path),
    attachments: ensureArray(incomingMetadata.attachments),
    rubrics: ensureArray(incomingMetadata.rubrics),
    expected_concepts: ensureArray(incomingMetadata.expected_concepts),
    subparts: ensureArray(incomingMetadata.subparts),
    imageAssets: sortImageAssets((ensureArray(card.imageAssets || incomingMetadata.imageAssets).length > 0 
      ? ensureArray(card.imageAssets || incomingMetadata.imageAssets) 
      : ensureArray(card.image_urls).map(url => ({ url })))
      .map((asset, index) => ({
        id: ensureString(asset?.id) || `img-${index + 1}`,
        url: ensureString(asset?.url || (typeof asset === 'string' ? asset : '')),
        order: Number(asset?.order) || index,
        width: asset?.width || null,
        height: asset?.height || null,
        caption: ensureString(asset?.caption),
        page_number: asset?.page_number ?? asset?.pageNumber ?? null,
        bbox: asset?.bbox ?? asset?.bbox_json ?? null,
        source: ensureString(asset?.source),
        association_confidence: ensureNumber(asset?.association_confidence, 0),
      })).filter(a => Boolean(a.url))),
    options,
    correct_option_ids: options.filter((option) => option.isCorrect).map((option) => option.id),
  };

  return {
    ...card,
    question_type: questionType,
    question_type_label: getQuestionTypeDefinition(questionType).label,
    question_body: ensureString(card.question_body),
    marks: ensureNumber(card.marks, 0),
    difficulty: ensureString(card.difficulty),
    tags_json: ensureArray(card.tags_json).map((tag) => ensureString(tag)).filter(Boolean),
    image_urls: parsedMetadata.imageAssets.map(a => a.url), // syncing legacy array for backend
    writing_space_type: ensureString(card.writing_space_type || 'none'),
    writing_space_lines: ensureNumber(card.writing_space_lines, 0),
    writing_space_height: ensureNumber(card.writing_space_height, 0),
    parsed_metadata: parsedMetadata,
    ai_confidence: card.ai_confidence ?? null,
    subject: ensureString(parsedMetadata.subject),
    topic: ensureString(parsedMetadata.topic),
    sourcePaper: ensureString(parsedMetadata.source_paper_name),
    categorizationStatus: ensureString(parsedMetadata.categorization_status || 'uncategorized') || 'uncategorized',
    originWorkspaceId: ensureString(parsedMetadata.origin_workspace_id || card.exam_document_id),
  };
};

export const buildMasterExamCardPayload = (formData) => {
  const normalized = normalizeMasterExamCard(formData);
  const metadata = normalized.parsed_metadata;

  return {
    question_body: normalized.question_body,
    marks: normalized.marks,
    question_type: normalized.question_type,
    difficulty: normalized.difficulty || null,
    tags_json: normalized.tags_json,
    image_urls: normalized.image_urls,
    writing_space_type: normalized.writing_space_type,
    writing_space_lines: normalized.writing_space_lines,
    writing_space_height: normalized.writing_space_height,
    parsed_metadata: {
      ...Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== 'title')),
      options: ensureArray(metadata.options).map((option, index) => ({
        id: ensureString(option.id) || `option-${index + 1}`,
        key: ensureString(option.key) || String.fromCharCode(65 + index),
        text: ensureString(option.text),
        isCorrect: Boolean(option.isCorrect),
      })),
      correct_option_ids: ensureArray(metadata.options)
        .filter((option) => option.isCorrect)
        .map((option) => ensureString(option.id)),
      imageAssets: ensureArray(metadata.imageAssets).map((asset, index) => ({
        id: ensureString(asset.id) || `img-${index + 1}`,
        url: ensureString(asset.url),
        order: ensureNumber(asset.order, index),
        width: asset.width ?? null,
        height: asset.height ?? null,
        caption: ensureString(asset.caption),
        page_number: asset.page_number ?? null,
        bbox: asset.bbox ?? null,
        source: ensureString(asset.source),
        association_confidence: ensureNumber(asset.association_confidence, 0),
      })).filter((asset) => Boolean(asset.url)),
      extraction_confidence: metadata.extraction_confidence || normalized.ai_confidence || '',
    },
  };
};

export const createEmptyRubric = (index) => ({
  id: `rubric-${index + 1}`,
  title: '',
  marks: '',
  description: '',
});

export const createEmptyCardDraft = (card = {}) => normalizeMasterExamCard(card);
