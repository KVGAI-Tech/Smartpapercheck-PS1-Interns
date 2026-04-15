import React, { useState, useEffect, useRef, useMemo } from 'react';

import ReactDOM from 'react-dom'; 
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import toast from 'react-hot-toast';
import { 
  X, Plus, Upload, Trash2, 
  FileText, ArrowUp, ArrowDown,
  CheckCircle, Maximize, Minimize,
  File, FilePlus, Upload as UploadIcon,
  AlertCircle, Loader2, Download, Sparkles
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { API_BASE_URL } from '../../../../BaseURL';
import {
  listExamDocuments,
  parseExamDocument,
  fetchExamDocument
} from '../../MasterExams/examDocumentApi';
import { addConductExamQuestion, updateConductQuestion, deleteConductExamQuestion, deleteExamQuestion } from '../api';

if (typeof window !== 'undefined' && !window.katex) {
  window.katex = katex;
}

class QuillErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const RichTextEditor = ({ value, onChange, placeholder, className, modules, formats, allowImagePaste = true }) => {
  const reactQuillRef = useRef(null);

  useEffect(() => {
    const quill = reactQuillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e) => {
      if (!allowImagePaste) return;
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      
      const items = clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image/') === 0) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (event) => {
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, 'image', event.target.result, 'user');
              quill.setSelection(index + 1, 0, 'silent');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    quill.root.addEventListener('paste', handlePaste);
    return () => {
      quill.root.removeEventListener('paste', handlePaste);
    };
  }, [allowImagePaste]);

  const fallback = (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 focus:outline-none resize-none transition-all duration-200 min-h-[180px]"
      rows={6}
      placeholder={placeholder}
    />
  );

  return (
    <div className={className}>
      <QuillErrorBoundary fallback={fallback}>
        <ReactQuill
          ref={reactQuillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
        />
      </QuillErrorBoundary>
    </div>
  );
};

const createEmptyMcqOption = (index = 0) => ({
  optionId: `option_${index + 1}`,
  optionBody: '',
});

const getNextMcqOptionId = (existingOptions = []) => {
  const usedIds = new Set((existingOptions || []).map((opt) => String(opt?.optionId || '').trim()).filter(Boolean));
  let maxNumeric = 0;
  usedIds.forEach((id) => {
    const match = /^option_(\d+)$/i.exec(id);
    if (match) {
      const parsed = Number(match[1]);
      if (!Number.isNaN(parsed)) {
        maxNumeric = Math.max(maxNumeric, parsed);
      }
    }
  });

  let candidate = maxNumeric + 1;
  let nextId = `option_${candidate}`;
  while (usedIds.has(nextId)) {
    candidate += 1;
    nextId = `option_${candidate}`;
  }
  return nextId;
};

const createQuestionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const createDefaultQuestion = (id = createQuestionId()) => ({
  id,
  questionType: 'text',
  answerType: 'text',
  question: null,
  answer: null,
  answerPreview: '',
  answerUrl: '',
  marks: '',
  questionText: '',
  questionBody: '',
  answerText: '',
  answerBody: '',
  domain: 'General',
  isExisting: false,
  num_rubric_items: 1,
  professorInstructions: '',
  aiCustomInstruction: '',
  mcqOptions: [createEmptyMcqOption(0), createEmptyMcqOption(1)],
  correctOptionId: 'option_1',
  reasonRequired: false,
});

// ── Drag Handle Icon (⋮⋮) ───────────────────────────────────
const DragHandleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="3" r="1.25" />
    <circle cx="10.5" cy="3" r="1.25" />
    <circle cx="5.5" cy="8" r="1.25" />
    <circle cx="10.5" cy="8" r="1.25" />
    <circle cx="5.5" cy="13" r="1.25" />
    <circle cx="10.5" cy="13" r="1.25" />
  </svg>
);

// ── Sortable Question Item ───────────────────────────────────
const SortableQuestionItem = ({ question, index, isSelected, onSelect, onDelete, isDeleting = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : (isDeleting ? 0 : 1),
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
    maxHeight: isDeleting ? '0px' : '96px',
    marginBottom: isDeleting ? '0px' : undefined,
    overflow: 'hidden',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <button
        type="button"
        onClick={() => onSelect(index)}
        className={`group w-full text-left rounded-xl border transition-all duration-200 px-3 py-3 flex items-start gap-2
          ${isSelected ? 'border-accent bg-accent/10' : 'border-gray-200 hover:bg-gray-50'}
          ${isDragging ? 'shadow-lg ring-2 ring-accent/30' : ''}
          ${isDeleting ? 'translate-y-[-8px] scale-[0.99]' : ''}`}
      >
        {/* Question number badge */}
        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
          ${isSelected ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {index + 1}
        </div>

        {/* Question info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">Question {index + 1}</p>
            {question.isExisting && (
              <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Existing</span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {question.marks ? `${question.marks} marks` : 'Marks not set'}
          </p>
        </div>

        <button
          type="button"
          title="Delete Question"
          aria-label="Delete Question"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question.id);
          }}
          className={`mt-1 flex-shrink-0 rounded-md p-1.5 transition-all duration-200 ${
            isDeleting
              ? 'pointer-events-none text-red-500 opacity-100'
              : 'text-gray-400 opacity-70 hover:scale-105 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100'
          }`}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Drag Handle */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          className={`mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-200/70 transition-colors
            ${isSelected ? 'text-accent/70 hover:text-accent' : 'text-gray-400 hover:text-gray-600'}`}
          aria-label="Drag to reorder question"
          role="button"
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
        >
          <DragHandleIcon />
        </div>
      </button>
    </div>
  );
};

// ── Drag Overlay Item (static preview while dragging) ────────
const DragOverlayItem = ({ question, index }) => (
  <div className="rounded-xl border border-accent bg-white shadow-xl px-3 py-3 flex items-start gap-2 opacity-90 w-[300px]">
    <div className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold bg-accent text-white flex-shrink-0">
      {index + 1}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900 truncate">Question {index + 1}</p>
        {question.isExisting && (
          <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Existing</span>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate">
        {question.marks ? `${question.marks} marks` : 'Marks not set'}
      </p>
    </div>
    <div className="mt-1 flex-shrink-0 p-0.5 text-accent/70">
      <DragHandleIcon />
    </div>
  </div>
);

const buildDraftStorageKey = (examId, examType) => `mcq_exam_builder_draft_${examType || 'evaluated'}_${examId || 'new'}`;

const serializeQuestionDraft = (question) => ({
  id: question.id,
  questionType: question.questionType,
  answerType: question.answerType,
  questionPreview: question.questionPreview || '',
  questionUrl: question.questionUrl || '',
  answerPreview: question.answerPreview || '',
  answerUrl: question.answerUrl || '',
  marks: question.marks ?? '',
  questionText: question.questionText || '',
  questionBody: question.questionBody || '',
  answerText: question.answerText || '',
  answerBody: question.answerBody || '',
  domain: question.domain || 'General',
  isExisting: Boolean(question.isExisting),
  questionNumber: question.questionNumber,
  num_rubric_items: question.num_rubric_items ?? 1,
  professorInstructions: question.professorInstructions || '',
  aiCustomInstruction: question.aiCustomInstruction || '',
  mcqOptions: Array.isArray(question.mcqOptions)
    ? question.mcqOptions.map((option, optionIndex) => ({
        optionId: option.optionId || `option_${optionIndex + 1}`,
        optionBody: option.optionBody || '',
      }))
    : [createEmptyMcqOption(0), createEmptyMcqOption(1)],
  correctOptionId: question.correctOptionId || 'option_1',
  reasonRequired: Boolean(question.reasonRequired),
});

const parseStoredDraft = (draftKey) => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(draftKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.questions) || parsed.questions.length === 0) {
      return null;
    }

    return {
      selectedIndex: Number.isInteger(parsed.selectedIndex) ? parsed.selectedIndex : 0,
      questions: parsed.questions.map((question, index) => ({
        ...createDefaultQuestion(question?.id || createQuestionId()),
        ...question,
        id: question?.id || createQuestionId(),
        mcqOptions: Array.isArray(question?.mcqOptions) && question.mcqOptions.length > 0
          ? question.mcqOptions.map((option, optionIndex) => ({
              optionId: option?.optionId || `option_${optionIndex + 1}`,
              optionBody: option?.optionBody || '',
            }))
          : [createEmptyMcqOption(0), createEmptyMcqOption(1)],
        correctOptionId: question?.correctOptionId || 'option_1',
        reasonRequired: Boolean(question?.reasonRequired),
        isExisting: Boolean(question?.isExisting),
        questionNumber: question?.questionNumber ?? index + 1,
        question: null,
        answer: null,
      })),
    };
  } catch (error) {
    console.warn('Failed to parse MCQ exam draft from sessionStorage:', error);
    return null;
  }
};

const UploadQnAModal = ({
  isOpen, onClose, examId, examType = 'evaluated', onSubmit, existingQuestions = [], apiPrefix = '/exams', isMasterAttached = false }) => {

  const isPortalMcqMode = examType === 'conduct';
  const isSubjectiveConductMode = examType === 'subjective_conduct';
  const isAnyConductMode = isPortalMcqMode || isSubjectiveConductMode;

  const [questions, setQuestions] = useState([createDefaultQuestion()]);

  const [goldenPdfFile, setGoldenPdfFile] = useState(null);
  const [questionPdfFile, setQuestionPdfFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('standard'); 
  const isPdfUploadMode = !isAnyConductMode && uploadMode === 'golden-pdf';

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAiAnswerModal, setShowAiAnswerModal] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [isGeneratingAllAnswers, setIsGeneratingAllAnswers] = useState(false);
  const [bulkAnswerProgress, setBulkAnswerProgress] = useState({ current: 0, total: 0 });
  const [aiGenerationError, setAiGenerationError] = useState('');
  const [aiPreviewAnswer, setAiPreviewAnswer] = useState('');

  const [masterPapers, setMasterPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [selectedImportQuestionId, setSelectedImportQuestionId] = useState('');
  const [flattenedOptions, setFlattenedOptions] = useState([]);
  const [isParsingPaper, setIsParsingPaper] = useState(false);
  const [isImportingAllQuestions, setIsImportingAllQuestions] = useState(false);
  const [deletingQuestionIds, setDeletingQuestionIds] = useState([]);

  const [selectedIndex, setSelectedIndexRaw] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const suppressQuillOnChangeRef = useRef(false);
  const existingQuestionsRef = useRef(existingQuestions);
  existingQuestionsRef.current = existingQuestions;
  const modalRef = useRef(null);
  const questionRefs = useRef({});
  const dropZoneRefs = useRef({});
  const modalRootRef = useRef(null);
  const deleteToastStateRef = useRef(new Map());
  const draftStorageKey = React.useMemo(
    () => buildDraftStorageKey(examId, examType),
    [examId, examType]
  );

  const stripMarkdown = (text = '') => {
    if (!text) return '';
    let result = text;
    // Remove code fences and inline backticks
    result = result.replace(/```[\s\S]*?```/g, '');
    result = result.replace(/`([^`]+)`/g, '$1');
    // Remove common markdown heading/bullet prefixes while keeping content
    result = result.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    result = result.replace(/^\s{0,3}[-*+]\s+/gm, '');
    result = result.replace(/^\s{0,3}\d+\.\s+/gm, '');
    // Remove horizontal rules (--- etc.)
    result = result.replace(/^\s*-{3,}\s*$/gm, '');
    // Unwrap lines that are just [ ... ] used as display wrappers
    result = result.replace(/^\s*\[(.*?)\]\s*$/gm, '$1');
    // Strip simple LaTeX inline and display math delimiters
    result = result.replace(/\\\((.*?)\\\)/g, '$1');
    result = result.replace(/\\\[(.*?)\\\]/g, '$1');
    // Remove common TeX helpers like boxed{...}, begin{aligned}, end{aligned}
    result = result.replace(/boxed\{/g, '');
    result = result.replace(/begin\{aligned\}/g, '');
    result = result.replace(/end\{aligned\}/g, '');
    // Remove emphasis markers
    result = result.replace(/\*\*(.*?)\*\*/g, '$1');
    result = result.replace(/\*(.*?)\*/g, '$1');
    result = result.replace(/__(.*?)__/g, '$1');
    result = result.replace(/_(.*?)_/g, '$1');
    // Remove remaining stray backslashes (e.g., from LaTeX commands)
    result = result.replace(/\\/g, '');
    // Normalize multiple blank lines
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
  };

  const isRichTextEmpty = (html = '') => {
    if (!html) return true;
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length === 0;
  };

  const richTextToPlainText = (html = '') => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const formatGeneratedAnswerForEditor = (text = '') => {
    const cleaned = stripMarkdown(text || '');
    if (!cleaned) return '';

    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`);

    return paragraphs.join('') || `<p>${cleaned.replace(/\n/g, '<br/>')}</p>`;
  };

  const inferContentType = ({ body, hasFile }) => {
    const hasEditorContent = !isRichTextEmpty(body || '') || /<img\b/i.test(body || '');
    if (hasFile && hasEditorContent) return 'both';
    if (hasEditorContent) return 'text';
    return 'image';
  };

  const flattenParsedExam = (parsedData) => {
    // Extract questions — supports both legacy sections schema and new flat questions schema
    let questionsList = [];
    if (parsedData?.sections) {
      questionsList = parsedData.sections.flatMap(section => section.questions || []);
    } else if (parsedData?.questions) {
      questionsList = parsedData.questions;
    }

    if (!questionsList || questionsList.length === 0) return [];

    // ONLY main questions go into the dropdown — sub-parts (a, b, c) are rubrics, NOT selectable
    return questionsList.map(q => {
      let rubricsCount = 1;
      if (q.rubrics && Array.isArray(q.rubrics)) {
        const countLeaves = (rubs) => {
          let c = 0;
          rubs.forEach(r => {
            if (r.subRubrics && r.subRubrics.length > 0) {
              c += countLeaves(r.subRubrics);
            } else {
              c += 1;
            }
          });
          return c;
        };
        const rc = countLeaves(q.rubrics);
        if (rc > 0) rubricsCount = rc;
      }

      return {
        id: `M_${q.id || Math.random()}`,
        label: `Q${q.id || ''}`,
        questionBody: q.question || '',
        answerBody: q.answer || '',
        marks: q.totalMarks || '',
        rubricsCount,
        rubrics: q.rubrics || [],
      };
    });
  };

  const createQuestionFromImportedOption = (option, index) => {
    let compositeBody = option.questionBody
      ? `<p>${option.questionBody}</p>`
      : '';

    if (option.rubrics && option.rubrics.length > 0) {
      const buildRubricHtml = (rubs, depth = 0) => {
        let html = '';
        rubs.forEach(r => {
          const indent = depth > 0 ? `margin-left:${depth * 20}px;` : '';
          const label = r.id || '';
          const desc = r.description || '';
          const marks = r.marks ? ` [${r.marks} marks]` : '';
          html += `<p style="${indent}"><strong>(${label})</strong> ${desc}${marks}</p>`;
          if (r.subRubrics && r.subRubrics.length > 0) {
            html += buildRubricHtml(r.subRubrics, depth + 1);
          }
        });
        return html;
      };
      compositeBody += buildRubricHtml(option.rubrics);
    }

    return {
      ...createDefaultQuestion(),
      id: createQuestionId(),
      questionType: 'text',
      answerType: option.answerBody ? 'text' : 'image',
      questionBody: compositeBody,
      answerBody: option.answerBody ? `<p>${option.answerBody}</p>` : '',
      marks: option.marks ? String(option.marks) : '',
      num_rubric_items: option.rubricsCount || 1,
      questionNumber: index + 1,
      isExisting: false,
    };
  };

  const hasMeaningfulQuestionData = (question) => {
    if (!question) return false;
    return Boolean(
      (question.question && question.question.size) ||
      (question.answer && question.answer.size) ||
      question.questionUrl ||
      question.answerUrl ||
      !isRichTextEmpty(question.questionBody || '') ||
      !isRichTextEmpty(question.answerBody || '') ||
      String(question.marks || '').trim() ||
      String(question.questionText || '').trim() ||
      String(question.answerText || '').trim()
    );
  };

  const loadPaperOptions = async (paperId) => {
    if (!paperId) {
      setFlattenedOptions([]);
      setSelectedImportQuestionId('');
      return [];
    }

    try {
      setIsParsingPaper(true);
      const paper = masterPapers.find(p => String(p.id) === String(paperId));
      let parsedOutput;

      if (!paper?.parse_status || paper.parse_status !== 'completed') {
        const result = await parseExamDocument(paperId, { force_refresh: false });
        parsedOutput = result.parsed_output;
      } else {
        const fullPaper = await fetchExamDocument(paperId);
        parsedOutput = fullPaper.parsed_output;
      }

      if (!parsedOutput) {
        setFlattenedOptions([]);
        return [];
      }

      let parsedData = parsedOutput;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch (jsonErr) {
          console.error('Failed to parse parsed_output JSON string:', jsonErr);
          throw new Error('Document parsing data is corrupted. Please re-parse.');
        }
      }

      const options = flattenParsedExam(parsedData);
      setFlattenedOptions(options);
      return options;
    } finally {
      setIsParsingPaper(false);
    }
  };

  const handlePaperChange = async (e) => {
    const paperId = e.target.value;
    setSelectedPaperId(paperId);
    setFlattenedOptions([]);
    setSelectedImportQuestionId('');
    if (!paperId) return;

    try {
      await loadPaperOptions(paperId);
    } catch (err) {
      setError(`Failed to process document: ${err.message}`);
      toast.error('Failed to load questions from the selected document');
    }
  };

  const handleImportQuestionChange = (e) => {
    const qId = e.target.value;
    setSelectedImportQuestionId(qId);
    if (!qId) return;

    const selectedOption = flattenedOptions.find(o => o.id === qId);
    if (!selectedOption) return;

    // Build composite question body: main question text + all rubric sub-parts rendered inline
    let compositeBody = selectedOption.questionBody
      ? `<p>${selectedOption.questionBody}</p>`
      : '';

    if (selectedOption.rubrics && selectedOption.rubrics.length > 0) {
      const buildRubricHtml = (rubs, depth = 0) => {
        let html = '';
        rubs.forEach(r => {
          const indent = depth > 0 ? `margin-left:${depth * 20}px;` : '';
          const label = r.id || '';
          const desc = r.description || '';
          const marks = r.marks ? ` [${r.marks} marks]` : '';
          html += `<p style="${indent}"><strong>(${label})</strong> ${desc}${marks}</p>`;
          if (r.subRubrics && r.subRubrics.length > 0) {
            html += buildRubricHtml(r.subRubrics, depth + 1);
          }
        });
        return html;
      };
      compositeBody += buildRubricHtml(selectedOption.rubrics);
    }

    updateQuestion(questions[selectedIndex].id, (q) => ({
      ...q,
      questionBody: compositeBody || q.questionBody,
      answerBody: selectedOption.answerBody ? `<p>${selectedOption.answerBody}</p>` : q.answerBody,
      marks: selectedOption.marks ? String(selectedOption.marks) : String(q.marks || ''),
      num_rubric_items: selectedOption.rubricsCount || q.num_rubric_items,
    }));
  };

  const handleImportAllQuestions = async () => {
    if (!selectedPaperId) {
      toast.error('Please select a document first');
      return;
    }

    try {
      setIsImportingAllQuestions(true);
      setError('');

      const options = flattenedOptions.length > 0 ? flattenedOptions : await loadPaperOptions(selectedPaperId);
      if (!options.length) {
        throw new Error('No questions found in the selected document');
      }

      const importedQuestions = options.map((option, index) => createQuestionFromImportedOption(option, index));
      setQuestionsDraft(importedQuestions);
      setSelectedImportQuestionId('');
      setSelectedIndex(0);

      requestAnimationFrame(() => {
        if (importedQuestions[0]?.id) {
          scrollToQuestion(importedQuestions[0].id);
        }
      });

      toast.success('All questions imported successfully');
    } catch (err) {
      console.error('Failed to import all questions:', err);
      setError(err.message || 'Failed to import questions. Try again.');
      toast.error('Failed to import questions. Try again.');
    } finally {
      setIsImportingAllQuestions(false);
    }
  };

  const setQuestionsDraft = (updater) => {
    setQuestions((prevQuestions) => (
      typeof updater === 'function' ? updater(prevQuestions) : updater
    ));
  };

  const updateQuestion = (questionId, updater) => {
    setQuestionsDraft((prevQuestions) => (
      prevQuestions.map((question) => (
        question.id === questionId ? updater(question) : question
      ))
    ));
  };

  // ── Drag-and-drop setup ───────────────────────────────────────
  const [activeDragId, setActiveDragId] = useState(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const questionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  );

  const handleDragStart = React.useCallback((event) => {
    setActiveDragId(event.active.id);
  }, []);

  const handleDragEnd = React.useCallback((event) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Capture the currently selected question's ID before reordering
    const selectedQuestionId = questions[selectedIndex]?.id;

    setQuestions((prevQuestions) => {
      const oldIndex = prevQuestions.findIndex((q) => q.id === active.id);
      const newIndex = prevQuestions.findIndex((q) => q.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prevQuestions;
      const reordered = arrayMove(prevQuestions, oldIndex, newIndex);

      // Update selectedIndex to track the same question by ID
      if (selectedQuestionId) {
        const newSelectedIdx = reordered.findIndex((q) => q.id === selectedQuestionId);
        if (newSelectedIdx !== -1) {
          setSelectedIndexRaw(newSelectedIdx);
        }
      }

      return reordered;
    });
  }, [questions, selectedIndex]);

  const handleDragCancel = React.useCallback(() => {
    setActiveDragId(null);
  }, []);

  const activeDragQuestion = activeDragId
    ? questions.find((q) => q.id === activeDragId)
    : null;
  const activeDragIndex = activeDragId
    ? questions.findIndex((q) => q.id === activeDragId)
    : -1;
  // ── End drag-and-drop setup ───────────────────────────────────

  useEffect(() => {

    if (isOpen) {
      if (!modalRootRef.current) {
        const modalRoot = document.createElement('div');
        
        Object.assign(modalRoot.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)', 
          zIndex: '9999', 
        });
        
        document.body.appendChild(modalRoot);
        modalRootRef.current = modalRoot;
      }
      
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (modalRootRef.current) {
          document.body.removeChild(modalRootRef.current);
          modalRootRef.current = null;
        }
        
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const formulaSupported = React.useMemo(() => {
    try {
      const Quill = ReactQuill?.Quill;
      if (!Quill) return false;
      Quill.import('formats/formula');
      return typeof window !== 'undefined' && !!window.katex;
    } catch {
      return false;
    }
  }, []);

  const quillFormats = React.useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link',
    'image',
    ...(formulaSupported ? ['formula'] : []),
  ], [formulaSupported]);

  const quillModules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image', ...(formulaSupported ? ['formula'] : [])],
        ['clean'],
      ],
      handlers: {
        image: function imageHandler() {
          const quill = this.quill;
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = () => {
            const file = input.files && input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              const range = quill.getSelection(true);
              const index = range ? range.index : quill.getLength();
              quill.insertEmbed(index, 'image', reader.result, 'user');
              quill.setSelection(index + 1, 0, 'user');
            };
            reader.readAsDataURL(file);
          };
        },
      },
    },
  }), [formulaSupported]);

  const handleOpenAiAnswerModal = () => {
    setAiGenerationError('');
    setAiPreviewAnswer('');
    setShowAiAnswerModal(true);
  };

  const handleCloseAiAnswerModal = () => {
    if (isGeneratingAnswer) return;
    setAiGenerationError('');
    setAiPreviewAnswer('');
    setShowAiAnswerModal(false);
  };

  const generateAiAnswerForQuestion = async (question) => {
    const questionBody = question.questionBody || '';
    const questionBodyPlain = richTextToPlainText(questionBody);

    if (!questionBodyPlain.trim()) {
      throw new Error('Please provide question text before generating.');
    }

    const response = await fetch(`${API_BASE_URL}${apiPrefix}/${examId}/generate-answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: question.domain || 'General',
        question_type: 'text',
        question_body: questionBodyPlain,
        question_image_url: null,
        max_marks: question.marks ? Number(question.marks) : null,
        custom_instruction: question.aiCustomInstruction || null,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
      throw new Error(errorData.message || errorData.detail || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to generate answer');
    }

    const generatedRaw = data?.data?.answer || '';
    const generated = formatGeneratedAnswerForEditor(generatedRaw);
    if (!generated.trim()) {
      throw new Error('AI returned an empty answer');
    }

    return generated;
  };

  const handleGenerateAnswer = async () => {
    setAiGenerationError('');

    setIsGeneratingAnswer(true);

    try {
      const generated = await generateAiAnswerForQuestion(activeQuestion);
      setAiPreviewAnswer(generated);
    } catch (e) {
      setAiGenerationError(e?.message || 'Failed to generate answer');
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const handleApplyGeneratedAnswer = () => {
    const cleaned = (aiPreviewAnswer || '').trim();
    if (!cleaned) {
      setAiGenerationError('Generated answer is empty. Please generate again.');
      return;
    }

    updateQuestion(activeQuestion.id, (q) => {
      if (q.id !== activeQuestion.id) return q;
      const nextAnswerType = (q.answerType || 'image') === 'image' ? 'both' : (q.answerType || 'image');
      return {
        ...q,
        answerType: nextAnswerType,
        answerBody: cleaned,
      };
    });

    setAiPreviewAnswer('');
    setAiGenerationError('');
    setShowAiAnswerModal(false);
  };

  const handleGenerateAllAnswers = async () => {
    if (isGeneratingAllAnswers || isGeneratingAnswer) return;

    if (!examId) {
      toast.error('Please save the exam before generating answers');
      return;
    }

    const eligibleQuestions = questions.filter((question) => {
      const questionBody = question.questionBody || '';
      const questionPlain = richTextToPlainText(questionBody);
      const questionImageUrl = question.questionUrl || question.questionPreview || '';
      return Boolean(questionImageUrl || questionPlain.trim() || /<img\b/i.test(questionBody));
    });

    if (eligibleQuestions.length === 0) {
      toast.error('Add question content before generating answers');
      return;
    }

    setIsGeneratingAllAnswers(true);
    setBulkAnswerProgress({ current: 0, total: eligibleQuestions.length });
    setError('');

    const generatedAnswersById = new Map();
    let completed = 0;
    let failedCount = 0;

    try {
      for (const question of questions) {
        const questionBody = question.questionBody || '';
        const questionPlain = richTextToPlainText(questionBody);
        const questionImageUrl = question.questionUrl || question.questionPreview || '';
        const hasQuestionContent = Boolean(questionImageUrl || questionPlain.trim() || /<img\b/i.test(questionBody));

        if (!hasQuestionContent) {
          continue;
        }

        const currentIndex = questions.findIndex((item) => item.id === question.id);
        if (currentIndex !== -1) {
          setSelectedIndex(currentIndex);
          requestAnimationFrame(() => {
            scrollToQuestion(question.id);
          });
        }

        setBulkAnswerProgress({
          current: completed + 1,
          total: eligibleQuestions.length,
        });

        try {
          const generatedAnswer = await generateAiAnswerForQuestion(question);
          generatedAnswersById.set(question.id, generatedAnswer);
        } catch (generationError) {
          failedCount += 1;
          const visibleIndex = currentIndex !== -1 ? currentIndex + 1 : completed + 1;
          toast.error(`Failed to generate answer for Question ${visibleIndex}`);
          console.error(`Failed to generate answer for Question ${visibleIndex}:`, generationError);
        }

        completed += 1;
      }

      if (generatedAnswersById.size > 0) {
        setQuestionsDraft((prevQuestions) => (
          prevQuestions.map((question) => {
            const generatedAnswer = generatedAnswersById.get(question.id);
            if (!generatedAnswer) return question;

            return {
              ...question,
              answerType: (question.answerType || 'image') === 'image' ? 'both' : (question.answerType || 'image'),
              answerBody: generatedAnswer,
            };
          })
        ));
      }

      if (generatedAnswersById.size > 0 && failedCount === 0) {
        toast.success('All answers generated successfully');
      } else if (generatedAnswersById.size > 0) {
        toast.success(`${generatedAnswersById.size} answers generated`);
      } else {
        toast.error('Failed to generate answers. Try again.');
      }
    } finally {
      setIsGeneratingAllAnswers(false);
      setBulkAnswerProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setGoldenPdfFile(null);
      setQuestionPdfFile(null);
      setError('');
      setUploadMode('standard');
      setShowAiAnswerModal(false);
      setQuestions([createDefaultQuestion()]);
      setSelectedIndexRaw(0);
      setInitialized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPortalMcqMode) {
      setUploadMode('standard');
      setShowAiAnswerModal(false);
    }
  }, [isPortalMcqMode]);

  useEffect(() => {
    if (!isOpen || initialized) {
      return;
    }

    const storedDraft = parseStoredDraft(draftStorageKey);
    if (storedDraft?.questions?.length) {
      setQuestions(storedDraft.questions);
      setSelectedIndexRaw(
        Math.min(Math.max(storedDraft.selectedIndex || 0, 0), storedDraft.questions.length - 1)
      );
      setInitialized(true);
      return;
    }

    const currentExisting = existingQuestionsRef.current;
    if (currentExisting && currentExisting.length > 0) {
      const formattedQuestions = currentExisting.map((q, index) => ({
        ...createDefaultQuestion(),
        id: q.id || q.question_id || `existing_${q.question_number || index + 1}`,
        questionType: q.question_type || q.question_format || (q.question_file_url ? 'image' : 'text'),
        answerType: q.answer_type || (q.answer_file_url ? 'image' : 'text'),
        questionUrl: q.question_file_url || '',
        answerUrl: q.answer_file_url || '',
        marks: q.max_marks || '',
        questionText: q.question_text || '',
        questionBody: q.question_body || '',
        answerText: q.answer_text || '',
        answerBody: q.answer_body || '',
        domain: q.domain || 'General',
        isExisting: true, 
        questionNumber: q.question_number,
        aiCustomInstruction: '',
        mcqOptions: Array.isArray(q.mcq_options) && q.mcq_options.length > 0
          ? q.mcq_options.map((option, optionIndex) => ({
              optionId: option.option_id || `option_${optionIndex + 1}`,
              optionBody: option.option_body || option.option_text || '',
            }))
          : [createEmptyMcqOption(0), createEmptyMcqOption(1)],
        correctOptionId: Array.isArray(q.correct_option_ids) && q.correct_option_ids.length > 0
          ? q.correct_option_ids[0]
          : 'option_1',
        reasonRequired: Boolean(q.reason_required),
        num_rubric_items: q.reason_num_rubric_items || q.num_rubric_items || 1,
        professorInstructions: q.reason_professor_instructions || q.professor_instructions || '',
      }));
      setQuestions(formattedQuestions);
      setSelectedIndexRaw(0);
    } else {
      setQuestions([createDefaultQuestion()]);
      setSelectedIndexRaw(0);
    }
    setInitialized(true);
  }, [draftStorageKey, initialized, isOpen]);

  useEffect(() => {
    if (isOpen && uploadMode === 'standard') {
      const fetchPapers = async () => {
        try {
          const papers = await listExamDocuments();
          setMasterPapers(papers || []);
        } catch (e) {
          console.error("Failed to load master exams for import", e);
        }
      };
      if (masterPapers.length === 0) {
        fetchPapers();
      }
    }
  }, [isOpen, uploadMode, masterPapers.length]);

  useEffect(() => {
    if (!isOpen || !initialized || !questions.length || typeof window === 'undefined') {
      return;
    }

    const payload = {
      selectedIndex,
      questions: questions.map(serializeQuestionDraft),
    };

    try {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist MCQ exam draft to sessionStorage:', error);
    }
  }, [draftStorageKey, initialized, isOpen, questions, selectedIndex]);

  useEffect(() => {
    console.log('[Build MCQ Exam] Questions state updated:', questions);
  }, [questions]);

  useEffect(() => {
    console.log('[Build MCQ Exam] Selected question index changed:', selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  const handleFileChange = (questionId, type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(questionId, (q) => ({
          ...q,
          [type]: file,
          [`${type}Preview`]: reader.result,
          [`${type}Url`]: '',
        }));
      };
      reader.readAsDataURL(file);
    } else {
      updateQuestion(questionId, (q) => ({
        ...q,
        [type]: null,
        [`${type}Preview`]: '',
        [`${type}Url`]: '',
      }));
    }
  };

  const setSelectedIndex = React.useCallback((newIndex) => {
    suppressQuillOnChangeRef.current = true;
    setSelectedIndexRaw(newIndex);
    // Allow Quill editors to settle with new value before accepting onChange again
    setTimeout(() => {
      suppressQuillOnChangeRef.current = false;
    }, 50);
  }, []);

  const addQuestion = () => {
    const newQuestion = createDefaultQuestion();
    const nextIndex = questions.length;
    setQuestionsDraft((prevQuestions) => [
      ...prevQuestions,
      newQuestion,
    ]);

    setSelectedIndex(nextIndex);
    
    setTimeout(() => {
      scrollToQuestion(newQuestion.id);
    }, 100);
  };

  const scrollToQuestion = (id) => {
    if (questionRefs.current[id]) {
      questionRefs.current[id].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  const removeQuestion = async (id) => {
    if (deletingQuestionIds.includes(id)) return;

    const indexToRemove = questions.findIndex((q) => q.id === id);
    if (indexToRemove === -1) return;

    const deletedQuestion = questions[indexToRemove];
    
    // For existing questions, we need to perform a hard delete on the backend.
    if (deletedQuestion.isExisting) {
      const confirmDelete = window.confirm(
        'This question is already saved on the server. Deleting it will permanently remove it from the exam. Are you sure?'
      );
      if (!confirmDelete) return;

      setDeletingQuestionIds((prev) => [...prev, id]);
      const loadingToast = toast.loading('Deleting question from server...');

      try {
        if (isSubjectiveConductMode || isPortalMcqMode) {
          // For conduct/MCQ exams, we use the specific conduct delete API
          await deleteConductExamQuestion(examId, deletedQuestion.id);
        } else {
          // For regular evaluated exams (MongoDB), we use the question number delete API
          const qNum = deletedQuestion.questionNumber || (indexToRemove + 1);
          await deleteExamQuestion(examId, qNum);
        }
        toast.success('Question deleted from server', { id: loadingToast });
      } catch (err) {
        console.error('Failed to delete question from server:', err);
        toast.error(`Delete failed: ${err.message || 'Unknown error'}`, { id: loadingToast });
        setDeletingQuestionIds((prev) => prev.filter((questionId) => questionId !== id));
        return; // Don't remove from local state if backend delete failed
      }
    } else {
        setDeletingQuestionIds((prev) => [...prev, id]);
    }

    const selectedQuestionId = questions[selectedIndex]?.id;
    const previousSelectedIndex = selectedIndex;

    // Wait for animation
    window.setTimeout(() => {
      setQuestionsDraft((prevQuestions) => {
        const stillExists = prevQuestions.some((question) => question.id === id);
        if (!stillExists) {
          return prevQuestions;
        }

        const remainingQuestions = prevQuestions.filter((question) => question.id !== id);

        if (remainingQuestions.length === 0) {
          const fallbackQuestion = createDefaultQuestion();
          setSelectedIndexRaw(0);
          return [fallbackQuestion];
        }

        if (selectedQuestionId === id) {
          const nextIndex = Math.min(indexToRemove, remainingQuestions.length - 1);
          setSelectedIndexRaw(nextIndex);
        } else if (previousSelectedIndex > indexToRemove) {
          setSelectedIndexRaw(Math.max(0, previousSelectedIndex - 1));
        }

        return remainingQuestions;
      });

      setDeletingQuestionIds((prev) => prev.filter((questionId) => questionId !== id));

      // ONLY show undo for non-existing (unsaved) questions
      if (!deletedQuestion.isExisting) {
        const deletionRecord = {
          question: deletedQuestion,
          index: indexToRemove,
        };

        const toastId = toast.custom(
          (toastInstance) => (
            <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
              <span className="text-sm font-medium text-gray-800">Question removed</span>
              <button
                type="button"
                onClick={() => {
                  const activeRecord = deleteToastStateRef.current.get(toastId);
                  if (!activeRecord) return;

                  setQuestionsDraft((prevQuestions) => {
                    const restoredQuestions = [...prevQuestions];
                    const insertIndex = Math.min(activeRecord.index, restoredQuestions.length);
                    restoredQuestions.splice(insertIndex, 0, activeRecord.question);
                    setSelectedIndexRaw(insertIndex);
                    return restoredQuestions;
                  });

                  requestAnimationFrame(() => {
                    scrollToQuestion(activeRecord.question.id);
                  });

                  deleteToastStateRef.current.delete(toastId);
                  toast.dismiss(toastId);
                }}
                className="rounded-lg px-2.5 py-1 text-sm font-semibold text-accent transition hover:bg-accent/10"
              >
                Undo
              </button>
            </div>
          ),
          { duration: 5000 }
        );

        deleteToastStateRef.current.set(toastId, deletionRecord);
        window.setTimeout(() => {
          deleteToastStateRef.current.delete(toastId);
        }, 5200);
      }
    }, 180);
  };

  const navigateQuestion = (direction) => {
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = Math.max(0, selectedIndex - 1);
    } else {
      newIndex = Math.min(questions.length - 1, selectedIndex + 1);
    }
    
    setSelectedIndex(newIndex);
    
    if (questionRefs.current[questions[newIndex].id]) {
      scrollToQuestion(questions[newIndex].id);
    }
  };

  const validateQuestions = () => {
    if (isPortalMcqMode) {
      const conductIssue = questions.find((q) => {
        const hasQuestionFile = Boolean(q.question || q.questionUrl);
        const hasQuestionContent = !isRichTextEmpty(q.questionBody) || /<img\b/i.test(q.questionBody || '');
        const marksValue = Number(q.marks);
        const invalidMarks = Number.isNaN(marksValue) || marksValue <= 0;
        const validOptions = (q.mcqOptions || []).filter((option) => !isRichTextEmpty(option.optionBody || ''));
        const invalidOptions = validOptions.length < 2;
        const missingCorrectOption = !validOptions.some((option) => option.optionId === q.correctOptionId);
        const rubricCount = parseInt(q.num_rubric_items);
        const invalidReasonRubricCount = Boolean(q.reasonRequired) && (
          isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10
        );

        if (!hasQuestionFile && !hasQuestionContent) return { question: q, message: 'Question content is required.' };
        if (invalidMarks) return { question: q, message: 'Max marks must be greater than 0.' };
        if (invalidOptions) return { question: q, message: 'Add at least 2 MCQ options with content.' };
        if (missingCorrectOption) return { question: q, message: 'Select a correct option among the non-empty options.' };
        if (invalidReasonRubricCount) return { question: q, message: 'Reason rubric item count must be between 1 and 10.' };
        return null;
      });

      if (conductIssue) {
        const firstInvalidIndex = questions.findIndex((q) => q.id === conductIssue.question.id);
        setSelectedIndex(firstInvalidIndex);
        scrollToQuestion(conductIssue.question.id);
        setError(`Question ${firstInvalidIndex + 1}: ${conductIssue.message}`);
        return false;
      }

      setError('');
      return true;
    }

    if (isPdfUploadMode) {
      if (!questionPdfFile) {
        setError('Please upload a question paper PDF');
        return false;
      }
      if (!goldenPdfFile) {
        setError('Please upload a golden answer script PDF');
        return false;
      }
      setError('');
      return true;
    }

    const invalidQuestions = questions.filter(q => {
      const hasQuestionFile = Boolean(q.question || q.questionUrl);
      const hasAnswerFile = Boolean(q.answer || q.answerUrl);
      const hasQuestionContent = !isRichTextEmpty(q.questionBody) || /<img\b/i.test(q.questionBody || '');
      const hasAnswerContent = !isRichTextEmpty(q.answerBody) || /<img\b/i.test(q.answerBody || '');

      // Validate rubric items count
      const rubricCount = parseInt(q.num_rubric_items);
      const invalidRubricCount = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;

      return !hasQuestionFile && !hasQuestionContent || !hasAnswerFile && !hasAnswerContent || !q.marks || invalidRubricCount;
    });
    
    if (invalidQuestions.length > 0) {
      const firstInvalidIndex = questions.findIndex(q => q.id === invalidQuestions[0].id);
      const invalidQuestion = invalidQuestions[0];
      
      // Check if the issue is specifically with rubric count
      const rubricCount = parseInt(invalidQuestion.num_rubric_items);
      const invalidRubricCount = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;
      
      if (invalidRubricCount) {
        setError(`Number of rubric items must be between 1 and 10 (current: ${invalidQuestion.num_rubric_items || 'empty'})`);
      } else {
        setError('Please fill in all required fields for each question');
      }
      
      setSelectedIndex(firstInvalidIndex);
      scrollToQuestion(invalidQuestions[0].id);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuestions()) return;
    setIsSubmitting(true);
    setError('');
    
    try {
      if (isPdfUploadMode) {
        const pdfFormData = new FormData();
        if (questionPdfFile) {
          pdfFormData.append('question_pdf', questionPdfFile);
        }
        if (goldenPdfFile) {
          pdfFormData.append('golden_pdf', goldenPdfFile);
        }

        await onSubmit(examId, pdfFormData);
      } else if (isSubjectiveConductMode) {
        // For subjective conduct exams, POST/PATCH each question as JSON
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const hasContent = !isRichTextEmpty(q.questionBody) || (q.questionText && q.questionText.trim().length > 0);
          if (!hasContent) continue;

          // Distinguish between new and existing questions
          let isExisting = q.id && !String(q.id).startsWith('new_') && !String(q.id).startsWith('existing_');

          // For subjective conduct mode, existing questions in Postgres MUST have numeric IDs.
          // If the ID is a UUID/slug (e.g. from standard exams), treat it as a new question to be added.
          if (isSubjectiveConductMode && isExisting) {
            const isNumericId = /^\d+$/.test(String(q.id));
            if (!isNumericId) {
              isExisting = false;
            }
          }
          
          const payload = {
            question_text: q.questionText || richTextToPlainText(q.questionBody || ''),
            question_body: q.questionBody || '',
            marks: parseFloat(q.marks) || 0,
            display_order: i + 1,
            allow_text_answer: true,
            allow_image_answer: true,
          };

          if (isExisting) {
            await updateConductQuestion(examId, q.id, payload);
          } else {
            await addConductExamQuestion(examId, payload);
          }
        }
      } else {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];

          const questionNumber = q.questionNumber || i + 1;
          const hasQuestionFile = q.question || q.questionUrl;
          const hasAnswerFile = q.answer || q.answerUrl;

          // Always send metadata updates (e.g., max marks) when an existing file URL exists.
          // Backend supports updating without re-uploading the file.
          const hasQuestionContent = !isRichTextEmpty(q.questionBody) || /<img\b/i.test(q.questionBody || '');
          const hasAnswerContent = !isRichTextEmpty(q.answerBody) || /<img\b/i.test(q.answerBody || '');
          const shouldSendQuestion = hasQuestionFile || hasQuestionContent;
          const shouldSendAnswer = !isAnyConductMode ? (hasAnswerFile || hasAnswerContent) : false;

          try {
            if (shouldSendQuestion) {
              const questionFormData = new FormData();
              questionFormData.append('question_number', questionNumber.toString());
              questionFormData.append('file_type', 'question');
              questionFormData.append('max_marks', q.marks);
              const inferredQuestionType = inferContentType({ body: q.questionBody, hasFile: Boolean(hasQuestionFile) });
              questionFormData.append('question_type', inferredQuestionType);
              questionFormData.append('question_body', q.questionBody || '');
              // Optional short title/label for the question
              questionFormData.append('question_text', q.questionText || '');
              questionFormData.append('domain', q.domain || 'General');
              // Optional short label for the answer
              questionFormData.append('answer_text', q.answerText || '');
              if (isPortalMcqMode) {
                const normalizedOptions = (q.mcqOptions || []).map((option, optionIndex) => ({
                  option_id: option.optionId || `option_${optionIndex + 1}`,
                  option_text: richTextToPlainText(option.optionBody || ''),
                  option_body: option.optionBody || '',
                }));
                questionFormData.append('mcq_options', JSON.stringify(normalizedOptions));
                questionFormData.append('correct_option_ids', JSON.stringify([q.correctOptionId]));
                questionFormData.append('reason_required', q.reasonRequired ? 'true' : 'false');
                if (q.reasonRequired) {
                  questionFormData.append('num_rubric_items', (q.num_rubric_items || 1).toString());
                  if (q.professorInstructions && q.professorInstructions.trim()) {
                    questionFormData.append('professor_instructions', q.professorInstructions.trim());
                  }
                }
              }
              
              // Add rubric configuration fields
              if (!isPortalMcqMode) {
                questionFormData.append('num_rubric_items', (q.num_rubric_items || 1).toString());
              }
              if (!isPortalMcqMode && q.professorInstructions && q.professorInstructions.trim()) {
                questionFormData.append('professor_instructions', q.professorInstructions.trim());
              }
              
              if (['image', 'both'].includes(inferredQuestionType) && q.question) {
                questionFormData.append('file', q.question);
              } else if (['image', 'both'].includes(inferredQuestionType) && !hasQuestionFile) {
                throw new Error('Question image is required');
              }
              await onSubmit(examId, questionFormData);
            }

            if (!isAnyConductMode && shouldSendAnswer) {
              const answerFormData = new FormData();
              answerFormData.append('question_number', questionNumber.toString());
              answerFormData.append('file_type', 'answer');
              const inferredAnswerType = inferContentType({ body: q.answerBody, hasFile: Boolean(hasAnswerFile) });
              answerFormData.append('answer_type', inferredAnswerType);
              answerFormData.append('answer_body', q.answerBody || '');
              answerFormData.append('answer_text', q.answerText || '');
              answerFormData.append('question_text', q.questionText || '');
              answerFormData.append('max_marks', q.marks);
              answerFormData.append('domain', q.domain || 'General');
              if (['image', 'both'].includes(inferredAnswerType) && q.answer) {
                answerFormData.append('file', q.answer);
              } else if (['image', 'both'].includes(inferredAnswerType) && !hasAnswerFile) {
                throw new Error('Answer image is required');
              }
              await onSubmit(examId, answerFormData);
            }
          } catch (error) {
            const errorMessage = error.message || 'Error uploading question';
            setError(`Error uploading question ${questionNumber}: ${errorMessage}`);
            setIsSubmitting(false);
            return;
          }
        }
      }
  
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(draftStorageKey);
      }
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const QuestionDisplay = ({ type, data, onFileChange, questionId }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const preview = data[`${type}Preview`];
    const url = data[`${type}Url`];
    const title = type === 'question' ? 'Question' : 'Answer';
    const dropZoneId = `${type}-${questionId}`;
    
    const dropZoneRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        
        if (file.type.match('image.*')) {
          onFileChange(questionId, type, file);
        } else {
          setError(`Please upload an image file for ${title}`);
        }
      }
    };

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((it) => it.type?.startsWith('image/'));
      if (!imageItem) return;

      e.preventDefault();
      const pastedFile = imageItem.getAsFile();
      if (pastedFile) {
        onFileChange(questionId, type, pastedFile);
      }
    };
    
    if (url || preview) {
      const src = preview || url;
      return (
        <div className="relative group h-full min-h-[200px] border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-sm">
          <img
            src={src}
            alt={`${title} preview`}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFileChange(questionId, type, null);
              }}
              className="p-2 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-red-600 hover:scale-110 transition-all"
              aria-label={`Remove ${title} image`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div 
          ref={dropZoneRef}
          className={`w-full min-h-[200px] border ${isDragActive || isActive ? 'border-accent bg-accent/10' : 'border-dashed border-gray-300 bg-gray-50'} 
            rounded-lg hover:border-accent hover:bg-accent/5 transition-all duration-300 
            flex flex-col items-center justify-center cursor-pointer relative outline-none`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => {
            setIsActive(true);
            setTimeout(() => dropZoneRef.current?.focus(), 0);
          }}
          onBlur={() => setIsActive(false)}
          tabIndex={0}
          role="button"
        >
          <Upload className={`w-8 h-8 ${isDragActive || isActive ? 'text-accent' : 'text-gray-400'} mb-2`} />
          <span className={`text-sm ${isDragActive || isActive ? 'text-accent font-medium' : 'text-gray-500'} text-center`}>
            {isDragActive ? `Drop ${title.toLowerCase()} here` : `Click to focus, then paste (Ctrl+V) or use Upload button`}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsActive(true);
              setTimeout(() => dropZoneRef.current?.focus(), 0);
              fileInputRef.current?.click();
            }}
            className="mt-3 h-[40px] w-[110px] px-3 py-2 text-sm font-medium bg-accent text-white rounded-md shadow-sm hover:bg-accent transition-colors"
          >
            Upload
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileChange(questionId, type, e.target.files[0]);
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            aria-label={`Upload ${title} image`}
          />

          <span className="text-xs text-gray-400 mt-3">
            JPG, PNG or GIF recommended
          </span>
        </div>
      </div>
    );
  };

  const PdfUploader = ({ title, file, setFile, icon: Icon }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const dropZoneRef = useRef(null);

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          setFile(file);
        } else {
          setError(`${title} must be a PDF file`);
        }
      }
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {title} <span className="text-red-500">*</span>
        </label>
        {file ? (
          <div className="relative border border-gray-200 rounded-lg bg-white p-4 group transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                aria-label={`Remove ${title}`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={dropZoneRef}
            className={`w-full h-32 border ${isDragActive ? 'border-accent bg-accent/10' : 'border-dashed border-gray-300 bg-gray-50'} 
              rounded-lg hover:border-accent hover:bg-accent/5 cursor-pointer transition-all duration-300 
              flex flex-col items-center justify-center relative`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon className={`w-8 h-8 ${isDragActive ? 'text-accent' : 'text-gray-400'} mb-2 ${isDragActive ? '' : 'animate-pulse'}`} />
            <span className={`text-sm ${isDragActive ? 'text-accent font-medium' : 'text-gray-500'} text-center`}>
              {isDragActive ? `Drop PDF here` : `Drag & drop ${title} or click to upload`}
            </span>
            <span className="text-xs text-gray-400 mt-2">
              PDF format required
            </span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onClick={e => e.stopPropagation()}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type === 'application/pdf') {
                  setFile(file);
                } else if (file) {
                  setError(`${title} must be a PDF file`);
                }
              }}
              aria-label={`Upload ${title}`}
            />
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || questions.length === 0) return null;

  const safeIndex = Math.min(Math.max(selectedIndex, 0), questions.length - 1);
  const activeQuestion = questions[safeIndex];

  const ModalContent = (
    <div 
      className={`upload-qna-modal relative bg-white shadow-xl w-full flex flex-col
        transform transition-all duration-300 ease-in-out 
        ${isFullscreen 
          ? 'max-w-full h-screen rounded-none' 
          : 'max-w-6xl max-h-[92vh] h-[92vh] rounded-2xl m-4 sm:m-6'}`}
      style={{ zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .upload-qna-modal .question-body-quill .ql-container,
        .upload-qna-modal .answer-body-quill .ql-container {
          min-height: 180px;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .upload-qna-modal .question-body-quill .ql-editor,
        .upload-qna-modal .answer-body-quill .ql-editor {
          min-height: 180px;
        }
        .upload-qna-modal .question-body-quill .ql-toolbar,
        .upload-qna-modal .answer-body-quill .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .upload-qna-modal .ql-tooltip {
          z-index: 100 !important;
          left: 10px !important;
          right: auto !important;
        }
      `}</style>
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isPortalMcqMode ? 'Build Portal MCQ Exam' : isSubjectiveConductMode ? 'Build Subjective Exam' : 'Upload Questions & Solutions'}
            </h2>
            <p className="text-sm text-gray-500">
              {isPortalMcqMode
                ? 'Create MCQ questions, options, correct answers, and optional reasoning rules.'
                : isSubjectiveConductMode
                ? 'Create subjective questions and configure rubrics for live exams.'
                : 'Upload question images/text, answers, marks, and rubric configuration.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {uploadMode === 'standard' && (
        <>
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-6 py-2 sticky top-[57px] z-10">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Navigate:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateQuestion('prev')}
                  disabled={selectedIndex === 0}
                  className={`flex items-center justify-center p-1 rounded transition-colors ${
                    selectedIndex === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Go to previous question"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 px-3">
                  <select
                    className="text-sm border border-gray-300 bg-white rounded-md py-1 pl-2 pr-6 focus:ring-accent focus:border-accent text-gray-700"
                    value={selectedPaperId}
                    onChange={handlePaperChange}
                    aria-label="Select Paper"
                  >
                    <option value="">Select Paper</option>
                    {masterPapers.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  <select
                    className="text-sm border border-gray-300 bg-white rounded-md py-1 pl-2 pr-6 focus:ring-accent focus:border-accent text-gray-700 disabled:opacity-50 disabled:bg-gray-100"
                    value={selectedImportQuestionId}
                    onChange={handleImportQuestionChange}
                    disabled={!selectedPaperId || isParsingPaper}
                    aria-label="Select Question"
                  >
                    <option value="">
                      {isParsingPaper ? 'Parsing...' : 'Select Question'}
                    </option>
                    {flattenedOptions.map(o => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleImportAllQuestions}
                    disabled={!selectedPaperId || isParsingPaper || isImportingAllQuestions}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      !selectedPaperId || isParsingPaper || isImportingAllQuestions
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-accent/25 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/35'
                    }`}
                  >
                    {isImportingAllQuestions ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>{isImportingAllQuestions ? 'Importing...' : 'Import All Questions'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAllAnswers}
                    disabled={isParsingPaper || isImportingAllQuestions || isGeneratingAllAnswers || isSubmitting || !examId}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isParsingPaper || isImportingAllQuestions || isGeneratingAllAnswers || isSubmitting || !examId
                        ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
                        : 'border border-transparent bg-gradient-to-r from-accent to-teal-500 text-white shadow-sm hover:from-accent/95 hover:to-teal-500/95'
                    }`}
                  >
                    {isGeneratingAllAnswers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>
                      {isGeneratingAllAnswers
                        ? `Generating ${bulkAnswerProgress.current}/${bulkAnswerProgress.total}...`
                        : 'Generate All Answers'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => navigateQuestion('next')}
                  disabled={selectedIndex === questions.length - 1}
                  className={`flex items-center justify-center p-1 rounded transition-colors ${
                    selectedIndex === questions.length - 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="Go to next question"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 py-1 px-3 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="px-6 pt-3 pb-0 animate-slideDown">
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 px-6 py-4 bg-gray-50">
        {isPdfUploadMode ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FilePlus className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-medium text-gray-900">PDF Upload Mode</h3>
              </div>

              <div className="bg-accent/10 text-gray-800 text-sm p-4 rounded-xl flex items-start animate-fadeIn border border-accent/15">
                <span className="text-accent mr-2">💡</span>
                <span>
                  <strong>Tip:</strong> Upload a complete PDF question paper and a corresponding 
                  golden answer script. The system will use these PDFs for automated grading.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <PdfUploader 
                  title="Question Paper PDF" 
                  file={questionPdfFile}
                  setFile={setQuestionPdfFile}
                  icon={FileText}
                />

                <PdfUploader 
                  title="Golden Answer Script PDF" 
                  file={goldenPdfFile}
                  setFile={setGoldenPdfFile}
                  icon={File}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
            {/* Left: Question list panel with its own scroll */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Questions</p>
                  <p className="text-xs text-gray-500">Select a question to edit</p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {questions.map((q, idx) => (
                        <SortableQuestionItem
                          key={q.id}
                          question={q}
                          index={idx}
                          isSelected={idx === selectedIndex}
                          onSelect={setSelectedIndex}
                          onDelete={removeQuestion}
                          isDeleting={deletingQuestionIds.includes(q.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activeDragQuestion ? (
                      <DragOverlayItem question={activeDragQuestion} index={activeDragIndex} />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>

            {/* Right: Editing panel with its own scroll */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Editing</p>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">Question {selectedIndex + 1}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateQuestion('prev')}
                    disabled={selectedIndex === 0}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedIndex === 0 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => navigateQuestion('next')}
                    disabled={selectedIndex === questions.length - 1}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedIndex === questions.length - 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    type="button"
                  >
                    Next
                  </button>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(activeQuestion.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Question Body <span className="text-red-500">*</span>
                      </label>
                      <RichTextEditor
                        className="question-body-quill rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all duration-200 bg-white"
                        value={activeQuestion.questionBody || ''}
                        onChange={(value) => {
                          if (suppressQuillOnChangeRef.current) return;
                          updateQuestion(activeQuestion.id, (q) => ({ ...q, questionBody: value }));
                        }}
                        placeholder="Enter question text"
                        modules={quillModules}
                        formats={quillFormats}
                        allowImagePaste={false}
                      />
                    </div>
                  </div>

                  {!isPortalMcqMode ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="block text-sm font-medium text-gray-600">
                            Answer Body
                          </label>
                          <button
                            type="button"
                            onClick={handleOpenAiAnswerModal}
                            disabled={isSubmitting}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors
                              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} border-gray-200 bg-white text-gray-900`}
                          >
                            <img
                              src="/artificial-intelligence.png"
                              alt="AI"
                              className="w-5 h-5"
                            />
                            <span className="text-sm font-medium">Generate with AI</span>
                          </button>
                        </div>

                        <RichTextEditor
                          className="answer-body-quill rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all duration-200 bg-white"
                          value={activeQuestion.answerBody || ''}
                          onChange={(value) => {
                            if (suppressQuillOnChangeRef.current) return;
                            updateQuestion(activeQuestion.id, (q) => ({ ...q, answerBody: value }));
                          }}
                          placeholder="Enter answer text"
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            MCQ Options
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Add at least 2 options and pick the correct one.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuestion(activeQuestion.id, (q) => ({
                            ...q,
                            mcqOptions: [
                              ...(q.mcqOptions || []),
                              { optionId: getNextMcqOptionId(q.mcqOptions || []), optionBody: '' },
                            ],
                          }))}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                          Add Option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(activeQuestion.mcqOptions || []).map((option, optionIndex) => (
                          <div key={option.optionId} className="rounded-2xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between gap-3">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                  type="radio"
                                  name={`correct-option-${activeQuestion.id}`}
                                  checked={activeQuestion.correctOptionId === option.optionId}
                                  onChange={() => updateQuestion(activeQuestion.id, (q) => ({ ...q, correctOptionId: option.optionId }))}
                                  className="h-4 w-4 text-accent"
                                />
                                Correct Option
                              </label>
                              {(activeQuestion.mcqOptions || []).length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(activeQuestion.id, (q) => {
                                    const nextOptions = (q.mcqOptions || []).filter((item) => item.optionId !== option.optionId);
                                    const nextCorrect = q.correctOptionId === option.optionId ? nextOptions[0]?.optionId || '' : q.correctOptionId;
                                    return { ...q, mcqOptions: nextOptions, correctOptionId: nextCorrect };
                                  })}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <RichTextEditor
                              className="rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all duration-200 bg-white"
                              value={option.optionBody || ''}
                              onChange={(value) => {
                                if (suppressQuillOnChangeRef.current) return;
                                updateQuestion(activeQuestion.id, (q) => ({
                                  ...q,
                                  mcqOptions: (q.mcqOptions || []).map((item) => item.optionId === option.optionId ? { ...item, optionBody: value } : item),
                                }));
                              }}
                              placeholder={`Option ${optionIndex + 1} (rich text, formulas supported)`}
                              modules={quillModules}
                              formats={quillFormats}
                            />

                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={activeQuestion.marks}
                    onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, marks: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all duration-200 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="Enter max marks"
                  />
                </div>

                {!isPortalMcqMode ? (
                  <div className="p-5 bg-accent/5 rounded-2xl border border-accent/15">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-accent" />
                      <h4 className="text-sm font-semibold text-gray-900">Rubric Configuration</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Number of Rubric Items
                        </label>
                        <input
                          type="text"
                          value={activeQuestion.num_rubric_items}
                          onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, num_rubric_items: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500">Enter number of rubric items (1-10, default: 1)</p>
                        {(() => {
                          const rubricCount = parseInt(activeQuestion.num_rubric_items);
                          const isInvalid = isNaN(rubricCount) || rubricCount < 1 || rubricCount > 10;
                          if (isInvalid && activeQuestion.num_rubric_items !== '') {
                            return (
                              <p className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {isNaN(rubricCount) 
                                  ? 'Please enter a valid number' 
                                  : rubricCount < 1 
                                    ? `Minimum 1 rubric item required (current: ${rubricCount})`
                                    : `Maximum 10 rubric items allowed (current: ${rubricCount})`
                                }
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Professor Instructions (Optional)
                        </label>
                        <textarea
                          value={activeQuestion.professorInstructions}
                          onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, professorInstructions: e.target.value }))}
                          maxLength={2000}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none resize-none transition-all duration-200"
                          rows={4}
                          placeholder="Optional: Guide AI rubric generation (e.g., 'Focus on problem-solving steps', 'Weight mathematical rigor higher')"
                        />
                        <p className="text-xs text-gray-500">
                          {activeQuestion.professorInstructions?.length || 0}/2000 characters
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-blue-700" />
                      <h4 className="text-sm font-semibold text-gray-900">Portal Exam Rules</h4>
                    </div>
                    <label className="inline-flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={Boolean(activeQuestion.reasonRequired)}
                        onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, reasonRequired: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-accent"
                      />
                      Require students to provide a short reason with their selected option
                    </label>
                    {Boolean(activeQuestion.reasonRequired) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Rubric Items for Reason
                          </label>
                          <input
                            type="number"
                            value={activeQuestion.num_rubric_items}
                            onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, num_rubric_items: e.target.value }))}
                            min="1"
                            max="10"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-all duration-200"
                            placeholder="1 to 10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Reason Rubric Instructions (Optional)
                          </label>
                          <textarea
                            value={activeQuestion.professorInstructions}
                            onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, professorInstructions: e.target.value }))}
                            maxLength={2000}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none resize-none transition-all duration-200"
                            placeholder="Optional guidance for evaluating reason text"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between sticky bottom-0 z-20">
        <div className="text-sm text-gray-500">
          {isPdfUploadMode
            ? 'Ready to upload PDF files'
            : `${questions.length} ${questions.length === 1 ? 'question' : 'questions'} ${isAnyConductMode ? 'to save' : 'to upload'}`
          }
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium transition-all duration-300
              ${isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-accent text-white hover:bg-accent shadow-sm hover:shadow'}`}
            type="button"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isAnyConductMode ? 'Saving...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>{isPdfUploadMode ? 'Upload PDFs' : `${isAnyConductMode ? 'Save' : 'Upload'} Questions`}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isPortalMcqMode && showAiAnswerModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
                  <img src="/artificial-intelligence.png" alt="AI" className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">Generate Answer with AI</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Review the question and provide optional instructions.</p>
                </div>
              </div>

              <button
                onClick={handleCloseAiAnswerModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close"
                disabled={isGeneratingAnswer}
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Question Preview</h3>

                  {!isRichTextEmpty(activeQuestion.questionBody || '') ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div
                        className="text-sm text-gray-800"
                        dangerouslySetInnerHTML={{ __html: activeQuestion.questionBody }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">Please provide question text before generating.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Custom Instruction (Optional)</h3>
                  <textarea
                    value={activeQuestion.aiCustomInstruction || ''}
                    onChange={(e) => updateQuestion(activeQuestion.id, (q) => ({ ...q, aiCustomInstruction: e.target.value }))}
                    maxLength={2000}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none resize-none transition-all duration-200"
                    rows={8}
                    placeholder="Optional: e.g., 'Answer in bullet points', 'Show step-by-step working', 'Keep it concise'"
                    disabled={isGeneratingAnswer}
                  />
                  <p className="text-xs text-gray-500">{(activeQuestion.aiCustomInstruction || '').length}/2000 characters</p>

                  {aiGenerationError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                      <p className="text-sm text-rose-700">{aiGenerationError}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">AI Generated Answer Preview</h3>
                {isGeneratingAnswer && (
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Generating answer…</p>
                      <p className="text-xs text-gray-600">This may take a few seconds.</p>
                    </div>
                  </div>
                )}
                {!isGeneratingAnswer && !aiPreviewAnswer && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Generated answer will appear here after you click Generate.</p>
                  </div>
                )}
                {aiPreviewAnswer && !isGeneratingAnswer && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiPreviewAnswer}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseAiAnswerModal}
                disabled={isGeneratingAnswer}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={aiPreviewAnswer && !isGeneratingAnswer ? handleApplyGeneratedAnswer : handleGenerateAnswer}
                disabled={isGeneratingAnswer}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isGeneratingAnswer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : aiPreviewAnswer ? (
                  <>
                    <img src="/artificial-intelligence.png" alt="AI" className="w-5 h-5" />
                    Use this answer
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return modalRootRef.current ? ReactDOM.createPortal(
    ModalContent,
    modalRootRef.current
  ) : null;
};

const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-slideDown {
      animation: slideDown 0.4s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
};


addStyles();

export default UploadQnAModal
