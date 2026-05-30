/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  ArrowDown,
  ArrowUp,
  Eye,
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
  images: ImageIcon,
  metadata: FileSearch,
  answer_settings: Settings2,
  preview: Eye,
};

const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</label>
    {children}
    {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
  </div>
);

const inputClassName = 'w-full rounded-2xl border border-slate-200 bg-[#fafcfb] px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-300';
const textareaClassName = `${inputClassName} min-h-[120px] resize-y`;

const toCsv = (items) => (Array.isArray(items) ? items.join(', ') : '');
const fromCsv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function QuestionEditModal({ card, onClose, onSave, onDelete, sourceAssets = [], contextLoading = false }) {
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

  const availableSections = useMemo(() => EDITOR_SECTIONS, []);

  useEffect(() => {
    if (!availableSections.some((section) => section.id === activeSection)) {
      setActiveSection(availableSections[0]?.id || 'question');
    }
  }, [activeSection, availableSections]);

  if (!card) return null;

  const metadata = formData.parsed_metadata || {};
  const questionLabel = metadata.display_number || metadata.question_number || card.id;

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
    setMetadataField('options', (metadata.options || []).map((option, currentIndex) => (
      currentIndex === index ? { ...option, ...patch } : option
    )));
  };

  const addOption = () => {
    const nextIndex = (metadata.options || []).length;
    setMetadataField('options', [
      ...(metadata.options || []),
      {
        id: `option-${Date.now()}-${nextIndex}`,
        key: String.fromCharCode(65 + nextIndex),
        text: '',
        isCorrect: false,
      },
    ]);
  };

  const removeOption = (index) => {
    const nextOptions = (metadata.options || [])
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
    const imageAssets = formData.parsed_metadata?.imageAssets || [];
    setMetadataField('manual_image_asset_overrides', true);
    setMetadataField('imageAssets', [
      ...imageAssets,
      {
        id: `img-${Date.now()}-${imageAssets.length}`,
        url: '',
        order: imageAssets.length,
        caption: '',
        page_number: null,
        bbox: null,
        source: 'manual',
      },
    ]);
  };

  const setImageAsset = (index, patch) => {
    const imageAssets = formData.parsed_metadata?.imageAssets || [];
    setMetadataField('manual_image_asset_overrides', true);
    setMetadataField('imageAssets', imageAssets.map((asset, currentIndex) => (
      currentIndex === index
        ? { ...asset, ...patch, order: currentIndex }
        : asset
    )));
  };

  const removeImageUrl = (index) => {
    const imageAssets = formData.parsed_metadata?.imageAssets || [];
    setMetadataField('manual_image_asset_overrides', true);
    setMetadataField('imageAssets', imageAssets
      .filter((_, currentIndex) => currentIndex !== index)
      .map((asset, currentIndex) => ({ ...asset, order: currentIndex })));
  };

  const moveImageAsset = (index, direction) => {
    const imageAssets = [...(formData.parsed_metadata?.imageAssets || [])];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= imageAssets.length) return;
    [imageAssets[index], imageAssets[nextIndex]] = [imageAssets[nextIndex], imageAssets[index]];
    setMetadataField('manual_image_asset_overrides', true);
    setMetadataField('imageAssets', imageAssets.map((asset, currentIndex) => ({ ...asset, order: currentIndex })));
  };

  const attachSourceAsset = (asset) => {
    const imageAssets = formData.parsed_metadata?.imageAssets || [];
    const alreadyAttached = imageAssets.some((item) => item.id === asset.id || item.url === asset.asset_url);
    if (alreadyAttached) return;
    setMetadataField('manual_image_asset_overrides', true);
    setMetadataField('imageAssets', [
      ...imageAssets,
      {
        id: asset.id,
        url: asset.asset_url,
        order: imageAssets.length,
        width: asset.width ?? null,
        height: asset.height ?? null,
        caption: asset.asset_role || '',
        page_number: asset.page_number ?? null,
        bbox: asset.bbox_json ?? null,
        source: 'extracted',
        association_confidence: 1,
      },
    ]);
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;
    try {
      setIsUploadingImage(prev => ({ ...prev, [index]: true }));
      const response = await uploadExamDocumentImage(file);
      if (typeof response === 'string' && response) {
        setImageAsset(index, { url: response, source: 'upload' });
        toast.success('Image uploaded successfully');
      } else if (response && response.data && response.data.url) {
        setImageAsset(index, { url: response.data.url, source: 'upload' });
        toast.success('Image uploaded successfully');
      } else if (response && response.url) {
        setImageAsset(index, { url: response.url, source: 'upload' });
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
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    await onDelete(card.id);
    onClose();
  };

  const metadataImageAssets = formData.parsed_metadata?.imageAssets || [];
  const questionPage = formData.source_page_number || formData.parsed_metadata?.page_span?.start;
  const attachableSourceAssets = sourceAssets.filter((asset) => {
    if (metadataImageAssets.some((item) => item.id === asset.id || item.url === asset.asset_url)) return false;
    if (questionPage && asset.page_number) {
      return asset.page_number === questionPage;
    }
    return true;
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'question':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Question Title">
                <input
                  value={metadata.title || ''}
                  onChange={(event) => setMetadataField('title', event.target.value)}
                  className={inputClassName}
                  placeholder="Optional short label"
                />
              </Field>

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

            <Field label="Instructions">
              <input
                value={metadata.instructions || ''}
                onChange={(event) => setMetadataField('instructions', event.target.value)}
                className={inputClassName}
                placeholder="Optional question-level instructions"
              />
            </Field>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Rich Question Body</label>
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
              <span className="mt-1 block text-xs text-slate-400">Use line breaks to preserve exam formatting.</span>
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

            <Field label="Tags">
              <input
                value={toCsv(formData.tags_json)}
                onChange={(event) => setField('tags_json', fromCsv(event.target.value))}
                className={inputClassName}
                placeholder="unit-3, k-map, digital-logic"
              />
            </Field>

            {supportsOptions(formData.question_type) ? (
              <div className="mt-4 border-t border-slate-200 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Options</h3>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(metadata.shuffle_options)}
                      onChange={(event) => setMetadataField('shuffle_options', event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                    />
                    Shuffle options
                  </label>
                </div>
                <div className="space-y-3">
                  {(metadata.options || []).map((option, index) => (
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
                        { (metadata.options || []).length > 2 ? (
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
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              </div>
            ) : null}

            {supportsReasoning(formData.question_type) ? (
              <div className="mt-4 border-t border-slate-200 pt-6">
                <Field label="Reasoning Prompt">
                  <textarea
                    value={metadata.reasoning_prompt || ''}
                    onChange={(event) => setMetadataField('reasoning_prompt', event.target.value)}
                    rows={4}
                    className={`${textareaClassName} min-h-[96px]`}
                    placeholder="Ask the student to justify their selected answer."
                  />
                </Field>
              </div>
            ) : null}

            {!supportsOptions(formData.question_type) ? (
              <div className="mt-4 border-t border-slate-200 pt-6">
                <Field label="Reference Answer / Solution">
                  <textarea
                    value={metadata.reference_answer || ''}
                    onChange={(event) => setMetadataField('reference_answer', event.target.value)}
                    rows={6}
                    className={textareaClassName}
                    placeholder="Canonical answer or solution for this question."
                  />
                </Field>
              </div>
            ) : null}
          </div>
        );

      case 'answer_settings':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Writing Space Type">
                <select
                  value={formData.writing_space_type || 'none'}
                  onChange={(event) => setField('writing_space_type', event.target.value)}
                  className={inputClassName}
                >
                  <option value="none">None</option>
                  <option value="lines">Lines</option>
                  <option value="steps">Steps</option>
                  <option value="graph">Graph</option>
                  <option value="boxed">Boxed</option>
                  <option value="blank">Blank</option>
                </select>
              </Field>
              <Field label="Writing Space Lines">
                <input
                  type="number"
                  min="0"
                  value={formData.writing_space_lines || 0}
                  onChange={(event) => setField('writing_space_lines', Number(event.target.value) || 0)}
                  className={inputClassName}
                />
              </Field>
              <Field label="Writing Space Height">
                <input
                  type="number"
                  min="0"
                  value={formData.writing_space_height || 0}
                  onChange={(event) => setField('writing_space_height', Number(event.target.value) || 0)}
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Subparts">
              <textarea
                value={(metadata.subparts || []).map((subpart) => `${subpart.label || ''} ${subpart.text || ''}`.trim()).join('\n')}
                onChange={(event) => setMetadataField(
                  'subparts',
                  event.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => ({ label: `(${String.fromCharCode(97 + index)})`, text: line }))
                )}
                rows={5}
                className={textareaClassName}
                placeholder="One subpart per line"
              />
            </Field>

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
              {(metadata.options || []).map((option, index) => (
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
                    {(metadata.options || []).length > 2 ? (
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

      case 'images':
        return (
          <div className="space-y-5">
            <Field label="Attached Images" hint="These assets are stored separately and synced through parsed_metadata.imageAssets.">
              <div className="space-y-3">
                {metadataImageAssets.map((asset, index) => (
                  <div key={`${asset.id || index}-${asset.url || ''}`} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">Image {index + 1}</p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImageAsset(index, -1)}
                          disabled={index === 0}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImageAsset(index, 1)}
                          disabled={index === metadataImageAssets.length - 1}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          value={asset.url || ''}
                          onChange={(event) => setImageAsset(index, { url: event.target.value })}
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
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        value={asset.caption || ''}
                        onChange={(event) => setImageAsset(index, { caption: event.target.value })}
                        className={inputClassName}
                        placeholder="Caption / role"
                      />
                      <input
                        value={asset.page_number ?? ''}
                        onChange={(event) => setImageAsset(index, { page_number: event.target.value ? Number(event.target.value) : null })}
                        className={inputClassName}
                        placeholder="Source page number"
                      />
                    </div>
                    {asset.url ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white max-h-48 flex justify-center">
                        <img
                          src={asset.url}
                          alt={`Question ${index + 1}`}
                          loading="lazy"
                          className="max-h-48 max-w-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      {asset.source ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{asset.source}</span> : null}
                      {asset.association_confidence ? <span className="rounded-full bg-slate-100 px-2.5 py-1">association {Math.round(asset.association_confidence * 100)}%</span> : null}
                    </div>
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

            {contextLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-4 text-sm text-slate-500">
                Loading extracted assets...
              </div>
            ) : attachableSourceAssets.length > 0 ? (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Attach Extracted Assets</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {attachableSourceAssets.slice(0, 8).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => attachSourceAsset(asset)}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-slate-300"
                    >
                      <div className="flex h-28 items-center justify-center bg-slate-50">
                        <img src={asset.asset_url} alt="Extracted asset" loading="lazy" className="h-full w-full object-contain" />
                      </div>
                      <div className="px-3 py-3 text-xs text-slate-600">
                        Page {asset.page_number || '-'} {asset.asset_role ? `• ${asset.asset_role}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subject">
                <input
                  value={metadata.subject || ''}
                  onChange={(event) => setMetadataField('subject', event.target.value)}
                  className={inputClassName}
                  placeholder="Computer Science"
                />
              </Field>

              <Field label="Topic">
                <input
                  value={metadata.topic || ''}
                  onChange={(event) => setMetadataField('topic', event.target.value)}
                  className={inputClassName}
                  placeholder="Boolean Algebra"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Unit">
                <input
                  value={metadata.unit || ''}
                  onChange={(event) => setMetadataField('unit', event.target.value)}
                  className={inputClassName}
                  placeholder="Unit 3"
                />
              </Field>
              <Field label="Bloom Taxonomy">
                <input
                  value={metadata.bloom_taxonomy || ''}
                  onChange={(event) => setMetadataField('bloom_taxonomy', event.target.value)}
                  className={inputClassName}
                  placeholder="Analyze"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Source Paper">
                <input
                  value={metadata.source_paper_name || ''}
                  onChange={(event) => setMetadataField('source_paper_name', event.target.value)}
                  className={inputClassName}
                  placeholder="Mid Sem 2025"
                />
              </Field>
              <Field label="Source Page">
                <input
                  value={metadata.source_page_number || formData.source_page_number || ''}
                  onChange={(event) => setMetadataField('source_page_number', event.target.value)}
                  className={inputClassName}
                  placeholder="4"
                />
              </Field>
              <Field label="Imported Date">
                <input
                  value={metadata.imported_date || ''}
                  onChange={(event) => setMetadataField('imported_date', event.target.value)}
                  className={inputClassName}
                  placeholder="2026-05-28"
                />
              </Field>
            </div>

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

      case 'preview':
        return (
          <div className="space-y-5">
            <Field label="Question Summary">
              <div className="rounded-2xl border border-slate-200 bg-[#fafcfb] px-4 py-4 text-sm leading-7 text-slate-600">
                <div><strong className="text-slate-900">Title:</strong> {metadata.title || 'Untitled question'}</div>
                <div><strong className="text-slate-900">Type:</strong> {formData.question_type_label || formData.question_type}</div>
                <div><strong className="text-slate-900">Marks:</strong> {formData.marks || 0}</div>
                <div><strong className="text-slate-900">Images:</strong> {metadataImageAssets.length}</div>
                <div><strong className="text-slate-900">Needs Manual Asset Review:</strong> {metadata.manual_image_asset_overrides ? 'Yes' : 'No'}</div>
              </div>
            </Field>

            <QuestionLivePreview card={normalizeMasterExamCard(formData)} />
          </div>
        );

      default:
        return null;
    }
  };

  const centeredSections = availableSections.filter(
    (s) => s.id === 'question' || s.id === 'images'
  );

  return (
    <>
      <style>{`
        .question-body-quill .ql-container {
          min-height: 150px;
          border: none !important;
          border-top: 1px solid #e2e8f0 !important;
          font-family: inherit;
          font-size: 0.875rem;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          background: #ffffff;
        }
        .question-body-quill .ql-editor {
          padding: 0.75rem 1rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .question-body-quill .ql-toolbar {
          border: none !important;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          background-color: #fafcfb;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-[3px]" onClick={onClose}>
        <div
          className="relative flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <header className="shrink-0 border-b border-slate-200 px-7 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Question Editor</p>
                <h2 className="mt-1 truncate text-xl font-semibold text-slate-950">
                  {`Question ${String(questionLabel).replace(/^Q/i, '')}`}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <nav className="mt-4 flex gap-2">
              {centeredSections.map((section) => {
                const Icon = sectionIcons[section.id] || Sparkles;
                const isSectionActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      isSectionActive ? 'bg-[#eef6f3] text-accent' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </header>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
            {renderSection()}
          </div>

          {/* Footer */}
          <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-7 py-4">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Question'}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
