export const PAPER_TYPES = [
  {
    value: 'standard',
    label: 'Standard Paper',
    shortLabel: 'Standard',
    description: 'Traditional print-ready university question paper without answer space.',
  },
  {
    value: 'online',
    label: 'Online Paper',
    shortLabel: 'Online',
    description: 'Digital-first question paper schema for later import into conduct systems.',
  },
  {
    value: 'writable',
    label: 'Writable Paper',
    shortLabel: 'Writable',
    description: 'Printable question paper with built-in answer lines, boxes, or drawing regions.',
  },
  {
    value: 'technical_writable',
    label: 'Graph / Technical Writable',
    shortLabel: 'Technical',
    description: 'Writable paper with graph space reserved only for technical questions that need it.',
  },
];

export const PAPER_TYPE_LABELS = Object.fromEntries(
  PAPER_TYPES.map((paperType) => [paperType.value, paperType])
);

export const getPaperTypeMeta = (value) =>
  PAPER_TYPE_LABELS[value] || PAPER_TYPE_LABELS.standard;

export const PAPER_TEMPLATES = [
  {
    value: 'university_format',
    label: 'University Format',
    description: 'Formal exam paper layout with strong institutional hierarchy.',
  },
  {
    value: 'bits',
    label: 'BITS University',
    description: 'Formal institutional paper with strong hierarchy and exam header.',
  },
  {
    value: 'modern_academic',
    label: 'Modern Academic',
    description: 'Minimal academic layout with softer spacing and cleaner typography.',
  },
  {
    value: 'worksheet',
    label: 'Worksheet',
    description: 'Student-friendly format for writable and practice-driven papers.',
  },
  {
    value: 'universal',
    label: 'Universal',
    description: 'Balanced fallback template for mixed paper types.',
  },
];

export const createDefaultBuilderLayout = () => ({
  headerTitle: 'SmartPaperCheck Examination Paper',
  headerSubtitle: 'Professional question paper workspace',
  examTime: '3 Hours',
  totalMarks: 100,
  institution: '',
  course: '',
  subject: '',
  semester: '',
  instructions: 'Answer all questions as directed. Figures are not to scale unless stated otherwise.',
  previewZoom: 100,
});

export const createDefaultPaperSettings = () => ({
  preview_mode: 'standard',
  answerSpaceMode: 'auto',
  lineDensity: 'comfortable',
  showSectionMarks: true,
  showQuestionMarks: true,
  includeCoverHeader: true,
  numberingStyle: 'numeric',
  writableLineCount: 6,
  writableLineSpacing: 'normal',
  writableBoxHeight: 120,
  graphBoxHeight: 156,
  writablePadding: 'normal',
  writableBoxStyle: 'lines',
  startSectionsNewPage: false,
  repeatHeader: false,
  footerEnabled: true,
});

export const createDefaultExportPreferences = () => ({
  exportPdf: true,
  exportDocx: true,
  includeWatermark: false,
  printMargin: 'standard',
  imageQuality: 'high',
  pageSize: 'A4',
});
