import React, { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FileSearch,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import QuestionLivePreview from './QuestionLivePreview';
import { uploadExamDocumentImage, formatQuestionTextAI } from './examDocumentApi';
import {
  EDITOR_SECTIONS,
  MASTER_EXAM_QUESTION_TYPES,
  buildMasterExamCardPayload,
  createEmptyCardDraft,
  createEmptyRubric,
  normalizeMasterExamCard,
  supportsOptions,
  supportsReasoning,
} from './masterExamCardSchema';

const sectionIcons = {
  question: Sparkles,
  options: CheckSquare,
  answers: ClipboardList,
  rubrics: Settings2,
  media: ImageIcon,
  source: FileSearch,
};

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
    {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
  </label>
);

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10';
const textareaClassName = `${inputClassName} min-h-[120px] resize-y`;

const toCsv = (items) => (Array.isArray(items) ? items.join(', ') : '');
const fromCsv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function QuestionEditModal({ card, onClose, onSave, onDelete, sections = [] }) {
  const [formData, setFormData] = useState(createEmptyCardDraft());
  const [activeSection, setActiveSection] = useState('question');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState({});
  const [isFormattingText, setIsFormattingText] = useState(false);

  const formulaSupported = useMemo(() => {
    try {
      const Quill = ReactQuill?.Quill;
      if (!Quill) return false;
      Quill.import('formats/formula');
      return typeof window !== 'undefined' && !!window.katex;
    } catch {
      return false;
    }
  }, []);

  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link',
    'image',
    ...(formulaSupported ? ['formula'] : []),
  ], [formulaSupported]);

  const quillModules = useMemo(() => ({
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

  useEffect(() => {
    if (card) {
      setFormData(createEmptyCardDraft(card));
      setActiveSection('question');
    }
  }, [card]);

  const availableSections = useMemo(() => (
    EDITOR_SECTIONS.filter((section) => {
      if (section.id === 'options') return supportsOptions(formData.question_type);
      return true;
    })
  ), [formData.question_type]);

  useEffect(() => {
    if (!availableSections.some((section) => section.id === activeSection)) {
      setActiveSection(availableSections[0]?.id || 'question');
    }
  }, [activeSection, availableSections]);

  if (!card) return null;

  const metadata = formData.parsed_metadata || {};

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setMetadataField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      parsed_metadata: {
        ...prev.parsed_metadata,
        [field]: value,
      },
    }));
  };

  const setOption = (index, patch) => {
    setMetadataField('options', metadata.options.map((option, currentIndex) => (
      currentIndex === index ? { ...option, ...patch } : option
    )));
  };

  const addOption = () => {
    const nextIndex = metadata.options.length;
    setMetadataField('options', [
      ...metadata.options,
      {
        id: `option-${Date.now()}-${nextIndex}`,
        key: String.fromCharCode(65 + nextIndex),
        text: '',
        isCorrect: false,
      },
    ]);
  };

  const removeOption = (index) => {
    const nextOptions = metadata.options
      .filter((_, currentIndex) => currentIndex !== index)
      .map((option, currentIndex) => ({
        ...option,
        key: String.fromCharCode(65 + currentIndex),
      }));
    setMetadataField('options', nextOptions);
  };

  const addRubric = () => {
    setMetadataField('rubrics', [...(metadata.rubrics || []), createEmptyRubric((metadata.rubrics || []).length)]);
  };

  const setRubric = (index, patch) => {
    setMetadataField('rubrics', (metadata.rubrics || []).map((rubric, currentIndex) => (
      currentIndex === index ? { ...rubric, ...patch } : rubric
    )));
  };

  const removeRubric = (index) => {
    setMetadataField('rubrics', (metadata.rubrics || []).filter((_, currentIndex) => currentIndex !== index));
  };

  const addImageUrl = () => {
    setField('image_urls', [...(formData.image_urls || []), '']);
  };

  const setImageUrl = (index, value) => {
    setField('image_urls', formData.image_urls.map((url, currentIndex) => (currentIndex === index ? value : url)));
  };

  const removeImageUrl = (index) => {
    setField('image_urls', formData.image_urls.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setIsUploadingImage(prev => ({ ...prev, [index]: true }));
      const response = await uploadExamDocumentImage(file);
      if (response && response.data && response.data.url) {
        setImageUrl(index, response.data.url);
        toast.success('Image uploaded successfully');
      } else if (response && response.url) {
        setImageUrl(index, response.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleAutoFormat = async () => {
    if (!formData.question_body) return;
    setIsFormattingText(true);
    try {
      const formattedHtml = await formatQuestionTextAI(formData.question_body);
      if (formattedHtml) {
        setFormData(prev => ({ ...prev, question_body: formattedHtml }));
        toast.success('Text formatted successfully');
      } else {
        toast.error('Failed to get formatted text');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to format text');
    } finally {
      setIsFormattingText(false);
    }
  };

  const handleQuestionTypeChange = (value) => {
    const next = normalizeMasterExamCard({
      ...formData,
      question_type: value,
      parsed_metadata: {
        ...metadata,
      },
    });
    setFormData(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(card.id, buildMasterExamCardPayload(formData));
      onClose();
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question card?')) return;
    await onDelete(card.id);
    onClose();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'question':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Question Type">
                <select
                  value={formData.question_type}
                  onChange={(event) => handleQuestionTypeChange(event.target.value)}
                  className={inputClassName}
                >
                  {MASTER_EXAM_QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Marks">
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.marks}
                  onChange={(event) => setField('marks', Number(event.target.value) || 0)}
                  className={inputClassName}
                  placeholder="Ex: 5"
                />
              </Field>
            </div>

            <Field label="Question Title">
              <input
                value={metadata.title || ''}
                onChange={(event) => setMetadataField('title', event.target.value)}
                className={inputClassName}
                placeholder="Ex: Kirchhoff network analysis with Thevenin equivalent"
              />
            </Field>

            <div className="space-y-1.5 block">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-700">Rich Question Body</span>
                <button
                  type="button"
                  onClick={handleAutoFormat}
                  disabled={isFormattingText || !formData.question_body}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                  title="Clean up raw text or Markdown into structured HTML"
                >
                  {isFormattingText ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Auto-Format AI
                </button>
              </div>
              <span className="mt-1 block text-xs text-slate-400 mb-1.5">Use line breaks to preserve exam formatting.</span>
              <ReactQuill
                value={formData.question_body || ''}
                onChange={(value) => setField('question_body', value)}
                modules={quillModules}
                formats={quillFormats}
                className="question-body-quill rounded-xl border border-slate-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all bg-white"
                theme="snow"
                placeholder="Write the final question exactly how it should appear in the paper."
              />
            </div>

            <Field label="Internal Notes">
              <textarea
                value={metadata.internal_notes || ''}
                onChange={(event) => setMetadataField('internal_notes', event.target.value)}
                rows={4}
                className={`${textareaClassName} min-h-[96px]`}
                placeholder="Visible to professors only."
              />
            </Field>
          </div>
        );

      case 'options':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Negative Marking">
                <input
                  value={metadata.negative_marking || ''}
                  onChange={(event) => setMetadataField('negative_marking', event.target.value)}
                  className={inputClassName}
                  placeholder="Ex: -0.25"
                />
              </Field>
              <Field label="Selection Marks">
                <input
                  value={metadata.selection_marks || ''}
                  onChange={(event) => setMetadataField('selection_marks', event.target.value)}
                  className={inputClassName}
                  placeholder="Marks awarded for selecting the correct answer"
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(metadata.shuffle_options)}
                onChange={(event) => setMetadataField('shuffle_options', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
              Shuffle options during delivery
            </label>

            <div className="space-y-3">
              {metadata.options.map((option, index) => (
                <div key={option.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {option.key}
                      </span>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(option.isCorrect)}
                          onChange={(event) => setOption(index, { isCorrect: event.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                        />
                        Correct option
                      </label>
                    </div>
                    {metadata.options.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <textarea
                    value={option.text}
                    onChange={(event) => setOption(index, { text: event.target.value })}
                    rows={3}
                    className={`${textareaClassName} min-h-[88px]`}
                    placeholder={`Option ${option.key}`}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </button>

            {supportsReasoning(formData.question_type) ? (
              <Field label="Reasoning Prompt">
                <textarea
                  value={metadata.reasoning_prompt || ''}
                  onChange={(event) => setMetadataField('reasoning_prompt', event.target.value)}
                  rows={4}
                  className={`${textareaClassName} min-h-[96px]`}
                  placeholder="Ask the student to justify their selected answer."
                />
              </Field>
            ) : null}
          </div>
        );

      case 'answers':
        return (
          <div className="space-y-5">
            <Field label="Explanation / Solution Summary">
              <textarea
                value={metadata.explanation || ''}
                onChange={(event) => setMetadataField('explanation', event.target.value)}
                rows={5}
                className={textareaClassName}
                placeholder="Professor-facing explanation or concise solution."
              />
            </Field>

            <Field label="Reference Answer">
              <textarea
                value={metadata.reference_answer || ''}
                onChange={(event) => setMetadataField('reference_answer', event.target.value)}
                rows={6}
                className={textareaClassName}
                placeholder="Canonical answer used for evaluation."
              />
            </Field>

            <Field label="AI Generated Answer">
              <textarea
                value={metadata.ai_generated_answer || ''}
                onChange={(event) => setMetadataField('ai_generated_answer', event.target.value)}
                rows={6}
                className={textareaClassName}
                placeholder="Optional AI-generated answer draft."
              />
            </Field>
          </div>
        );

      case 'rubrics':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Reasoning Marks">
                <input
                  value={metadata.reasoning_marks || ''}
                  onChange={(event) => setMetadataField('reasoning_marks', event.target.value)}
                  className={inputClassName}
                  placeholder="Marks for reasoning evaluation"
                />
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(metadata.binary_marking)}
                  onChange={(event) => setMetadataField('binary_marking', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                />
                Enable binary marking
              </label>
            </div>

            <Field label="Reasoning Rubric">
              <textarea
                value={metadata.reasoning_rubric || ''}
                onChange={(event) => setMetadataField('reasoning_rubric', event.target.value)}
                rows={5}
                className={textareaClassName}
                placeholder="Describe how reasoning should be graded."
              />
            </Field>

            <Field label="AI Evaluation Config">
              <textarea
                value={metadata.ai_evaluation_config || ''}
                onChange={(event) => setMetadataField('ai_evaluation_config', event.target.value)}
                rows={4}
                className={`${textareaClassName} min-h-[96px]`}
                placeholder="Prompting notes, strictness rules, or model settings."
              />
            </Field>

            <Field label="Step Marking Config">
              <textarea
                value={metadata.step_marking_config || ''}
                onChange={(event) => setMetadataField('step_marking_config', event.target.value)}
                rows={4}
                className={`${textareaClassName} min-h-[96px]`}
                placeholder="Define stepwise allocation logic for subjective questions."
              />
            </Field>

            <Field label="Expected Concepts / Keywords">
              <input
                value={toCsv(metadata.expected_concepts)}
                onChange={(event) => setMetadataField('expected_concepts', fromCsv(event.target.value))}
                className={inputClassName}
                placeholder="KCL, KVL, theorem statement, calculation steps"
              />
            </Field>

            <div className="space-y-3">
              {(metadata.rubrics || []).map((rubric, index) => (
                <div key={rubric.id || index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">Rubric Item {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeRubric(index)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                    <input
                      value={rubric.title || ''}
                      onChange={(event) => setRubric(index, { title: event.target.value })}
                      className={inputClassName}
                      placeholder="Criterion title"
                    />
                    <input
                      value={rubric.marks || ''}
                      onChange={(event) => setRubric(index, { marks: event.target.value })}
                      className={inputClassName}
                      placeholder="Marks"
                    />
                  </div>
                  <textarea
                    value={rubric.description || ''}
                    onChange={(event) => setRubric(index, { description: event.target.value })}
                    rows={3}
                    className={`${textareaClassName} mt-3 min-h-[88px]`}
                    placeholder="What should be awarded under this criterion?"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRubric}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Rubric Item
            </button>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-5">
            <Field label="Extracted / Uploaded Images" hint="Use URLs for now. This stays compatible with the current backend upload flow.">
              <div className="space-y-3">
                {(formData.image_urls || []).map((url, index) => (
                  <div key={`${index}-${url}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">Image {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          value={url}
                          onChange={(event) => setImageUrl(index, event.target.value)}
                          className={inputClassName}
                          placeholder="https://... or upload an image"
                        />
                      </div>
                      <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        {isUploadingImage[index] ? (
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        ) : (
                          <UploadCloud className="h-4 w-4" />
                        )}
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage[index]}
                          onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        />
                      </label>
                    </div>
                    {url ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <img
                          src={url}
                          alt={`Question ${index + 1}`}
                          className="h-44 w-full object-contain bg-white"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Field>

            <button
              type="button"
              onClick={addImageUrl}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Add Image Slot
            </button>
          </div>
        );

      case 'source':
        return (
          <div className="space-y-5">
            <Field label="Source Folder Path">
              <input
                value={toCsv(metadata.source_folder_path)}
                onChange={(event) => setMetadataField('source_folder_path', fromCsv(event.target.value))}
                className={inputClassName}
                placeholder="BTech CSE, COA, Unit 3, 2024, Mid Sem Paper"
              />
            </Field>

            <Field label="Original Paper Snippet">
              <textarea
                value={metadata.source_snippet || ''}
                onChange={(event) => setMetadataField('source_snippet', event.target.value)}
                rows={6}
                className={textareaClassName}
                placeholder="Paste the relevant snippet from the uploaded paper."
              />
            </Field>

            <Field label="OCR Text">
              <textarea
                value={metadata.source_ocr_text || ''}
                onChange={(event) => setMetadataField('source_ocr_text', event.target.value)}
                rows={8}
                className={textareaClassName}
                placeholder="Store raw OCR text here for review."
              />
            </Field>

            <Field label="Extraction Confidence">
              <input
                value={metadata.extraction_confidence || formData.ai_confidence || ''}
                onChange={(event) => setMetadataField('extraction_confidence', event.target.value)}
                className={inputClassName}
                placeholder="0.92"
              />
            </Field>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .question-body-quill .ql-container {
          min-height: 150px;
          border: none !important;
          border-top: 1px solid #e2e8f0 !important;
          font-family: inherit;
          font-size: 0.875rem;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
        }
        .question-body-quill .ql-editor {
          padding: 0.75rem 1rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .question-body-quill .ql-toolbar {
          border: none !important;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background-color: #f8fafc;
        }
      `}</style>
      <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-screen max-w-[1700px] items-stretch p-4 lg:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-h-0 w-full overflow-hidden rounded-[32px] bg-slate-100 shadow-2xl ring-1 ring-slate-900/10">
          <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-white lg:flex lg:flex-col">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Question Builder</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{metadata.title || formData.question_type_label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Edit by section and watch the final paper preview update live.
              </p>
            </div>

            <nav className="space-y-2">
              {availableSections.map((section) => {
                const Icon = sectionIcons[section.id] || Sparkles;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </span>
                    <ChevronRight className={`h-4 w-4 ${isActive ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Master Exam Card</p>
                <h2 className="truncate text-lg font-semibold text-slate-900">
                  {metadata.title || 'Untitled Question'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.92fr)]">
              <div className="min-h-0 overflow-y-auto bg-white px-5 py-5 lg:px-6">
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {availableSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                        activeSection === section.id ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
                {renderSection()}
              </div>

              <div className="min-h-0 overflow-y-auto border-t border-slate-200 bg-slate-50 px-5 py-5 xl:border-l xl:border-t-0 lg:px-6">
                <QuestionLivePreview card={normalizeMasterExamCard(formData)} />
              </div>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 lg:px-6">
              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Card'}
              </button>
            </footer>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
