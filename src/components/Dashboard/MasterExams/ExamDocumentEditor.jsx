import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ChartColumn, Clock3, Code2, Columns2, FilePlus2, FileText, Heading1, Heading2, Heading3, Highlighter, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Merge, Minus, Quote, Redo2, Rows2, Split, Strikethrough, Subscript as SubscriptIcon, Superscript as SuperscriptIcon, Table2, Trash2, Type, Underline as UnderlineIcon, Undo2, Unlink, UploadCloud } from 'lucide-react';

import FontSize from './extensions/FontSize';
import ChartInsertModal from './ChartInsertModal';

const saveCopy = {
  idle: 'Saved',
  pending: 'Unsaved changes',
  saving: 'Saving...',
  saved: 'Saved',
  error: 'Save failed',
};

const DEFAULT_DOCUMENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

const FONT_FAMILY_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: '"Times New Roman"' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: '"Courier New"' },
];

const FONT_SIZE_OPTIONS = ['12px', '14px', '16px', '18px', '22px', '28px', '36px'];
const TEXT_COLOR_OPTIONS = ['#0f172a', '#1d4ed8', '#047857', '#b45309', '#b91c1c', '#7c3aed'];
const HIGHLIGHT_COLOR_OPTIONS = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fecaca', '#e9d5ff', '#fed7aa'];

const ToolbarButton = ({ active = false, disabled = false, onClick, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(event) => {
      event.preventDefault();
      onClick();
    }}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-slate-600 transition ${
      active ? 'border-accent bg-accent/10 text-accent' : 'border-slate-200 bg-white hover:bg-slate-50'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    {children}
  </button>
);

const ToolbarSelect = ({ title, value, onChange, options, className = '' }) => (
  <select
    title={title}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:bg-slate-50 ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ColorInput = ({ title, value, onChange }) => (
  <label
    title={title}
    className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50"
  >
    <input
      type="color"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-6 w-6 cursor-pointer appearance-none border-0 bg-transparent p-0"
    />
  </label>
);

const parseExternalContent = (draftContentJson) => {
  if (draftContentJson && typeof draftContentJson === 'object') {
    return draftContentJson;
  }
  return DEFAULT_DOCUMENT;
};

const ExamDocumentEditor = ({
  document,
  draftTitle,
  draftContentJson,
  importHtml,
  saveState,
  parseState,
  isLoading,
  onCreate,
  onUpload,
  onUploadImage,
  onTitleChange,
  onContentChange,
  onImportApplied,
  onSaveAndPrepare,
}) => {
  const uploadInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const suppressOnUpdateRef = useRef(false);
  const [, setEditorVersion] = useState(0);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const externalContent = useMemo(
    () => parseExternalContent(draftContentJson),
    [draftContentJson],
  );
  const externalSignature = useMemo(
    () => JSON.stringify(draftContentJson ?? null),
    [draftContentJson],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: 'Write your full exam paper here (questions, sections, marks, instructions, diagrams, tables, code, and notes).',
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'exam-doc-image',
        },
      }),
    ],
    content: externalContent,
    onUpdate: ({ editor: currentEditor }) => {
      if (suppressOnUpdateRef.current) return;
      onContentChange({
        html: currentEditor.getHTML(),
        json: currentEditor.getJSON(),
      });
    },
    onSelectionUpdate: () => {
      setEditorVersion((version) => version + 1);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[560px] px-8 py-8 text-[15px] leading-7 text-slate-700 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const currentSignature = JSON.stringify(editor.getJSON() ?? null);
    const nextSignature = JSON.stringify(draftContentJson ?? null);

    if (draftContentJson && currentSignature !== nextSignature) {
      suppressOnUpdateRef.current = true;
      editor.commands.setContent(draftContentJson, false);
      queueMicrotask(() => {
        suppressOnUpdateRef.current = false;
      });
    }
  }, [document?.id, draftContentJson, editor, externalSignature]);

  useEffect(() => {
    if (!editor || !importHtml) return;
    suppressOnUpdateRef.current = true;
    editor.commands.setContent(importHtml, false);
    queueMicrotask(() => {
      const importedPayload = {
        html: editor.getHTML(),
        json: editor.getJSON(),
      };
      onContentChange(importedPayload);
      onImportApplied?.(importedPayload);
      suppressOnUpdateRef.current = false;
    });
  }, [editor, importHtml, onContentChange, onImportApplied]);

  const handleSetLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const nextUrl = window.prompt('Enter link URL', previousUrl);

    if (nextUrl === null) {
      return;
    }

    const trimmed = nextUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const normalizedUrl = /^(https?:|mailto:|tel:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run();
  };

  const handleFontFamilyChange = (value) => {
    if (!editor) return;
    if (!value) {
      editor.chain().focus().unsetFontFamily().run();
      return;
    }
    editor.chain().focus().setFontFamily(value).run();
  };

  const handleFontSizeChange = (value) => {
    if (!editor) return;
    if (!value) {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    editor.chain().focus().setFontSize(value).run();
  };

  const handleTextColorChange = (value) => {
    if (!editor) return;
    editor.chain().focus().setColor(value).run();
  };

  const handleHighlightChange = (value) => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color: value }).run();
  };

  const currentTextStyle = editor?.getAttributes('textStyle') || {};
  const currentLink = editor?.getAttributes('link')?.href || '';
  const currentFontFamily = currentTextStyle.fontFamily || '';
  const currentFontSize = currentTextStyle.fontSize || '';
  const currentTextColor = currentTextStyle.color || '#0f172a';
  const currentHighlight = editor?.getAttributes('highlight')?.color || '#fef08a';

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file && onUpload) {
      await onUpload(file);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onUploadImage || !editor) return;

    const imageUrl = await onUploadImage(file);
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    }
  };

  const handleChartInsert = async (file) => {
    if (!file || !editor || !onUploadImage) return;

    const imageUrl = await onUploadImage(file);
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name, title: file.name }).run();
    }
  };

  const isInsideTable = Boolean(editor?.isActive('table'));
  const canMergeCells = Boolean(editor?.can().mergeCells?.());
  const canSplitCell = Boolean(editor?.can().splitCell?.());

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1000px] items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto mt-12 w-full max-w-[800px] rounded-[16px] border border-dashed border-[#e5e7eb] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-accent ring-1 ring-slate-100">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">Blank Document</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500">
          Start writing your exam paper with full formatting, tables, images, and preserved layout.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow hover:opacity-95"
          >
            <FilePlus2 className="h-5 w-5" />
            Create Blank Document
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".docx,.pdf,.txt,.html,.htm"
              onChange={handleFileUpload}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow hover:bg-slate-50 pointer-events-none"
            >
              <UploadCloud className="h-5 w-5 text-slate-400" />
              Import Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] flex-1 pb-20 pt-6">
      <input
        ref={uploadInputRef}
        type="file"
        accept=".docx,.pdf,.txt,.html,.htm"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="rounded-[16px] border border-[#e5e7eb] bg-white shadow-sm transition-shadow">
        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Untitled Document"
              className="w-full border-none bg-transparent p-0 text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
            />
            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${saveState === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                <Clock3 className="h-3.5 w-3.5" />
                {saveCopy[saveState] || saveCopy.idle}
              </span>
              <span className="capitalize text-slate-400">
                Status: {(document.status || 'draft').replace('_', ' ')}
                {document.parse_status === 'completed' ? ' • Parsed' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <UploadCloud className="h-4 w-4 text-slate-400" />
              Import
            </button>

            <button
              onClick={onSaveAndPrepare}
              disabled={parseState === 'parsing' || saveState === 'saving'}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-medium text-white shadow-sm transition ${
                parseState === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : (parseState === 'ready' || document.parse_status === 'completed') && saveState !== 'pending' && saveState !== 'saving'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-accent hover:opacity-95'
              } ${parseState === 'parsing' ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {parseState === 'error' ? 'Parsing failed. Retry' : parseState === 'parsing'
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Parsing...</>
                : (parseState === 'ready' || document.parse_status === 'completed') && saveState !== 'pending' && saveState !== 'saving'
                  ? 'Ready to Use'
                  : 'Save & Prepare Exam'}
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarSelect
              title="Font family"
              value={currentFontFamily}
              onChange={handleFontFamilyChange}
              options={FONT_FAMILY_OPTIONS}
              className="min-w-[148px]"
            />
            <ToolbarSelect
              title="Font size"
              value={FONT_SIZE_OPTIONS.includes(currentFontSize) ? currentFontSize : ''}
              onChange={handleFontSizeChange}
              options={[{ label: 'Size', value: '' }, ...FONT_SIZE_OPTIONS.map((size) => ({ label: size, value: size }))]}
              className="min-w-[92px]"
            />
            <ToolbarButton title="Heading 1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Heading 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Heading 3" active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Strike" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Inline code" active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}>
              <Code2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Code block" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
              <Type className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Blockquote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Bullet list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Ordered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Subscript" active={editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()}>
              <SubscriptIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Superscript" active={editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>
              <SuperscriptIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Align left" active={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()}>
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Align center" active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()}>
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Align right" active={editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()}>
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Justify" active={editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.chain().focus().setTextAlign('justify').run()}>
              <AlignJustify className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <Table2 className="h-4 w-4" />
            </ToolbarButton>
            {isInsideTable ? (
              <>
                <ToolbarButton title="Add column before" onClick={() => editor?.chain().focus().addColumnBefore().run()}>
                  <Columns2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Add column after" onClick={() => editor?.chain().focus().addColumnAfter().run()}>
                  <Columns2 className="h-4 w-4 rotate-180" />
                </ToolbarButton>
                <ToolbarButton title="Delete column" onClick={() => editor?.chain().focus().deleteColumn().run()}>
                  <Trash2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Add row before" onClick={() => editor?.chain().focus().addRowBefore().run()}>
                  <Rows2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Add row after" onClick={() => editor?.chain().focus().addRowAfter().run()}>
                  <Rows2 className="h-4 w-4 rotate-180" />
                </ToolbarButton>
                <ToolbarButton title="Delete row" onClick={() => editor?.chain().focus().deleteRow().run()}>
                  <Trash2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Merge cells" disabled={!canMergeCells} onClick={() => editor?.chain().focus().mergeCells().run()}>
                  <Merge className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Split cell" disabled={!canSplitCell} onClick={() => editor?.chain().focus().splitCell().run()}>
                  <Split className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Toggle header row" onClick={() => editor?.chain().focus().toggleHeaderRow().run()}>
                  <Table2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton title="Delete table" onClick={() => editor?.chain().focus().deleteTable().run()}>
                  <Trash2 className="h-4 w-4" />
                </ToolbarButton>
              </>
            ) : null}
            <ToolbarButton title="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Add link" active={Boolean(currentLink)} onClick={handleSetLink}>
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Remove link" disabled={!currentLink} onClick={() => editor?.chain().focus().unsetLink().run()}>
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Insert image" onClick={() => imageInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Insert chart" onClick={() => setIsChartModalOpen(true)}>
              <ChartColumn className="h-4 w-4" />
            </ToolbarButton>
            <ColorInput title="Text color" value={currentTextColor} onChange={handleTextColorChange} />
            <ColorInput title="Highlight color" value={currentHighlight} onChange={handleHighlightChange} />
            <ToolbarButton title="Highlight selection" active={editor?.isActive('highlight')} onClick={() => editor?.chain().focus().toggleHighlight({ color: currentHighlight }).run()}>
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        <div className="min-h-[600px] rounded-b-[16px] bg-white">
          <EditorContent
            editor={editor}
            className="[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_a]:text-accent [&_.ProseMirror_a]:underline [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-200 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_hr]:my-6 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-slate-200 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-slate-300 [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-slate-300 [&_.ProseMirror_th]:bg-slate-50 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:mx-auto [&_.ProseMirror_img]:block [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:object-contain [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-slate-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[0.92em] [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-xl [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-slate-200 [&_.ProseMirror_pre]:bg-slate-50 [&_.ProseMirror_pre]:px-4 [&_.ProseMirror_pre]:py-3 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-[13px] [&_.ProseMirror_pre]:leading-6 [&_.ProseMirror_pre]:text-slate-700 [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-1"
          />
        </div>
      </div>

      <ChartInsertModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        onInsert={handleChartInsert}
      />
    </div>
  );
};

export default ExamDocumentEditor;
