import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeLegacySections,
  buildQuestionBlock,
  buildPaperDocument,
  deriveAnswerArea,
} from './paperDocumentBuilder.js';

const baseCard = {
  id: 101,
  question_type: 'long_subjective',
  question_body: '<p>Explain the relationship between current and voltage in the circuit shown below.</p>',
  marks: 8,
  image_urls: [],
  parsed_metadata: {
    title: 'Circuit Question',
    options: [],
  },
  writing_space_type: 'none',
  writing_space_lines: 0,
  writing_space_height: 0,
};

test('normalizeLegacySections migrates embedded cards into cardIds and drops duplicates', () => {
  const cards = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const sections = normalizeLegacySections([
    {
      id: 'section-a',
      title: 'Section A',
      cards: [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 99 }],
    },
  ], cards);

  assert.equal(sections.length, 1);
  assert.deepEqual(sections[0].cardIds, [1, 2]);
});

test('buildQuestionBlock normalizes inline and attached images into one ordered question image list', () => {
  const questionBlock = buildQuestionBlock({
    ...baseCard,
    question_body: '<p>Study the figure.</p><img src="https://cdn.example.com/inline.png" alt="Inline figure" />',
    image_urls: ['https://cdn.example.com/inline.png', 'https://cdn.example.com/attached.png'],
    parsed_metadata: {
      ...baseCard.parsed_metadata,
      imageAssets: [
        {
          id: 'asset-2',
          url: 'https://cdn.example.com/attached.png',
          order: 2,
          page_number: 2,
          bbox: { x: 12, y: 48 },
        },
      ],
    },
  }, {
    paperType: 'standard',
    paperSettings: {},
    questionNumber: 1,
  });

  assert.equal(questionBlock.images.length, 2);
  assert.deepEqual(questionBlock.images.map((image) => image.url), [
    'https://cdn.example.com/inline.png',
    'https://cdn.example.com/attached.png',
  ]);
});

test('buildQuestionBlock prefers parser numbering over local section index', () => {
  const questionBlock = buildQuestionBlock({
    ...baseCard,
    parsed_metadata: {
      ...baseCard.parsed_metadata,
      display_number: '12',
      question_number: 'Q12',
    },
  }, {
    paperType: 'standard',
    paperSettings: {},
    questionNumber: 2,
  });

  assert.equal(questionBlock.questionLabel, '12');
});

test('deriveAnswerArea uses writable heuristics when no explicit card override exists', () => {
  assert.deepEqual(
    deriveAnswerArea({
      question_type: 'mcq',
      writing_space_type: 'none',
      writing_space_lines: 0,
      writing_space_height: 0,
    }, {}, 'writable'),
    { mode: 'none' }
  );

  assert.equal(
    deriveAnswerArea({
      question_type: 'numerical',
      writing_space_type: 'none',
      writing_space_lines: 0,
      writing_space_height: 0,
    }, {}, 'writable').mode,
    'steps'
  );

  assert.equal(
    deriveAnswerArea({
      question_type: 'short_subjective',
      writing_space_type: 'none',
      writing_space_lines: 0,
      writing_space_height: 0,
      marks: 4,
    }, {}, 'writable').mode,
    'lined'
  );

  assert.equal(
    deriveAnswerArea({
      question_type: 'diagram_based',
      question_body: '<p>Draw the timing graph for the waveform.</p>',
      writing_space_type: 'none',
      writing_space_lines: 0,
      writing_space_height: 0,
      marks: 8,
    }, {}, 'technical_writable').mode,
    'graph'
  );
});

test('buildPaperDocument paginates long writable questions without detaching answer lines from the question', () => {
  const veryLongQuestion = {
    ...baseCard,
    id: 202,
    question_type: 'long_subjective',
    question_body: `<p>${'This is a long derivation prompt. '.repeat(180)}</p>`,
    marks: 14,
  };

  const paperDocument = buildPaperDocument({
    cards: [veryLongQuestion],
    sections: [{ id: 'section-a', title: 'Section A', instructions: '', cardIds: [202], parsed_metadata: {} }],
    builderLayout: {
      headerTitle: 'Physics Exam',
      course: 'PHY101',
      subject: 'Physics',
      examTime: '3 Hours',
      totalMarks: 100,
      instructions: 'Answer all questions.',
    },
    paperSettings: {
      writableLineCount: 6,
    },
    paperType: 'writable',
  });

  assert.ok(paperDocument.pageDescriptors.length >= 2);

  const answerSegments = paperDocument.pageDescriptors
    .flatMap((page) => page.items)
    .filter((item) => item.type === 'questionSegment' && item.segmentType === 'answer');
  const bodySegmentWithInlineAnswerArea = paperDocument.pageDescriptors
    .flatMap((page) => page.items)
    .find((item) => item.type === 'questionSegment' && item.segmentType === 'body' && item.answerArea);

  assert.ok(bodySegmentWithInlineAnswerArea);
  assert.ok(answerSegments.length > 0);
  assert.ok(answerSegments.every((segment) => segment.questionId === '202'));
});
