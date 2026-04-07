import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as mammoth from 'mammoth/mammoth.browser';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

import ExamDocumentEditor from './ExamDocumentEditor';
import {
  fetchExamDocument,
  updateExamDocument,
  uploadExamDocument,
  uploadExamDocumentImage,
  parseExamDocument,
} from './examDocumentApi';

const serializeContentJson = (value) => JSON.stringify(value ?? null);

const dataUriToFile = (dataUri, fallbackName = 'inline-image.png') => {
  const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i.exec(dataUri || '');
  if (!match) {
    throw new Error('Unsupported inline image format');
  }

  const mimeType = match[1] || 'image/png';
  const base64Data = match[2];
  const binary = window.atob(base64Data);
  const length = binary.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], fallbackName, { type: mimeType });
};

const DOCX_CODE_STYLE_NAME = 'Imported Code Block';
const PROGRAM_OPCODE_PATTERN = /\b(?:add|and|br|brn|brz|brp|brnz|brnp|brzp|brnzp|jmp|jsr|jsrr|ld|ldi|ldr|lea|not|ret|rti|st|sti|str|trap|halt|\.orig|\.end|\.fill|\.blkw|\.stringz)\b/i;
const CODE_LABEL_PATTERN = /^[A-Z][A-Z0-9_]*\s+(?:add|and|br|brn|brz|brp|brnz|brnp|brzp|brnzp|jmp|jsr|jsrr|ld|ldi|ldr|lea|not|ret|rti|st|sti|str|trap|halt|\.orig|\.end|\.fill|\.blkw|\.stringz)\b/i;
const CODE_SECTION_HEADING_PATTERN = /\b(?:assembly program|program listing|source code|pseudo\s*code|pseudocode|algorithm)\b/i;
const CODE_SECTION_TERMINATOR_PATTERN = /^(?:questions?\s*:|question\s+\d+|q\d+[\).\s]|note\s*:|instructions?\s*:|answer\s+(?:all|any)|context\s*:)/i;

const buildMammothImportOptions = () => ({
  styleMap: [
    `p[style-name='${DOCX_CODE_STYLE_NAME}'] => pre:fresh`,
    "p[style-name='Code'] => pre:fresh",
    "p[style-name='Source Code'] => pre:fresh",
    "p[style-name='Program Listing'] => pre:fresh",
    "p[style-name='Preformatted Text'] => pre:fresh",
  ],
});

const isProgramLineText = (text) => {
  const normalized = String(text || '').replace(/\u00A0/g, ' ');
  const trimmed = normalized.trim();

  if (!trimmed) {
    return false;
  }

  const hasIndentedColumns = /\s{4,}\S/.test(normalized) || /\t/.test(normalized);
  const hasAssemblyComment = /\s;/.test(normalized);
  const looksLikeDirectiveLine = /^\s*\.[A-Z]+/i.test(trimmed);
  const looksLikeRegisterLine = /\bR[0-7]\b/.test(trimmed);
  const startsWithOpcode = PROGRAM_OPCODE_PATTERN.test(trimmed) || CODE_LABEL_PATTERN.test(trimmed);

  return Boolean(
    startsWithOpcode ||
    looksLikeDirectiveLine ||
    (looksLikeRegisterLine && (hasAssemblyComment || hasIndentedColumns))
  );
};

const convertProgramSectionsToPreBlocks = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  const paragraphs = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));

  paragraphs.forEach((paragraph) => {
    const headingText = paragraph.textContent?.replace(/\u00A0/g, ' ').trim() || '';
    if (!CODE_SECTION_HEADING_PATTERN.test(headingText)) {
      return;
    }

    const codeLines = [];
    let cursor = paragraph.nextElementSibling;

    while (cursor) {
      const tagName = cursor.tagName.toLowerCase();
      const text = cursor.textContent?.replace(/\u00A0/g, ' ') || '';
      const trimmed = text.trim();

      if (!trimmed) {
        const nextSibling = cursor.nextElementSibling;
        cursor.remove();
        cursor = nextSibling;
        continue;
      }

      if (tagName === 'pre') {
        codeLines.push(text.replace(/\n+$/g, ''));
        const nextSibling = cursor.nextElementSibling;
        cursor.remove();
        cursor = nextSibling;
        continue;
      }

      if (CODE_SECTION_TERMINATOR_PATTERN.test(trimmed)) {
        break;
      }

      if (!['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName) || !isProgramLineText(text)) {
        break;
      }

      codeLines.push(text.replace(/\n+$/g, ''));
      const nextSibling = cursor.nextElementSibling;
      cursor.remove();
      cursor = nextSibling;
    }

    if (!codeLines.length) {
      return;
    }

    const pre = doc.createElement('pre');
    pre.textContent = codeLines.join('\n').replace(/\n{3,}/g, '\n\n');
    paragraph.insertAdjacentElement('afterend', pre);
  });

  return doc.body.innerHTML;
};

const normalizeImportedAlignment = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  const blockSelectors = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'li', 'blockquote'];
  const tiptapAlignableSelectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const wrapperSelectors = ['div', 'td', 'th', 'li', 'blockquote'];
  const blockTagNames = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'blockquote']);

  const getTextAlign = (node) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return '';

    const alignAttr = (node.getAttribute('align') || '').trim().toLowerCase();
    const className = node.className || '';
    const style = node.getAttribute('style') || '';
    const dataAlign = (node.getAttribute('data-align') || '').trim().toLowerCase();

    if (/\btext-align\s*:\s*(left|center|right|justify)\b/i.test(style)) {
      return style.match(/\btext-align\s*:\s*(left|center|right|justify)\b/i)?.[1]?.toLowerCase() || '';
    }
    if (['left', 'center', 'right', 'justify'].includes(alignAttr)) {
      return alignAttr;
    }
    if (['left', 'center', 'right', 'justify'].includes(dataAlign)) {
      return dataAlign;
    }
    if (/\b(?:text-)?center\b/i.test(className)) {
      return 'center';
    }
    if (/\b(?:text-)?right\b/i.test(className)) {
      return 'right';
    }
    if (/\b(?:text-)?justify\b/i.test(className)) {
      return 'justify';
    }
    if (/\b(?:text-)?left\b/i.test(className)) {
      return 'left';
    }
    return '';
  };

  const setTextAlign = (node, textAlign) => {
    if (!node || !textAlign) return;

    const style = node.getAttribute('style') || '';
    const nextStyle = style
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !/^text-align\s*:/i.test(part));
    nextStyle.push(`text-align: ${textAlign}`);
    node.setAttribute('style', nextStyle.join('; '));
    node.removeAttribute('align');
    node.removeAttribute('data-align');
  };

  const hasMeaningfulInlineContent = (node) =>
    Array.from(node.childNodes).some((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        return Boolean(child.textContent?.trim());
      }
      if (child.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }
      const tagName = child.tagName.toLowerCase();
      return !blockTagNames.has(tagName) || tagName === 'img';
    });

  const wrapInlineChildrenInParagraph = (node, textAlign) => {
    const paragraph = doc.createElement('p');
    setTextAlign(paragraph, textAlign);

    const nodesToMove = Array.from(node.childNodes);
    nodesToMove.forEach((child) => paragraph.appendChild(child));
    node.appendChild(paragraph);
  };

  doc.querySelectorAll(blockSelectors.join(',')).forEach((node) => {
    const textAlign = getTextAlign(node);
    if (textAlign) {
      setTextAlign(node, textAlign);
    }
  });

  doc.querySelectorAll(wrapperSelectors.join(',')).forEach((node) => {
    const inheritedAlign = getTextAlign(node);
    if (!inheritedAlign) return;

    const alignableDescendants = Array.from(node.children).filter((child) =>
      tiptapAlignableSelectors.includes(child.tagName.toLowerCase()),
    );

    alignableDescendants.forEach((child) => {
      if (!getTextAlign(child)) {
        setTextAlign(child, inheritedAlign);
      }
    });

    if (node.tagName.toLowerCase() === 'div') {
      const hasBlockChildren = Array.from(node.children).some((child) => blockTagNames.has(child.tagName.toLowerCase()));

      if (!hasBlockChildren && hasMeaningfulInlineContent(node)) {
        const paragraph = doc.createElement('p');
        setTextAlign(paragraph, inheritedAlign);
        Array.from(node.childNodes).forEach((child) => paragraph.appendChild(child));
        node.replaceWith(paragraph);
        return;
      }
    }

    if (!alignableDescendants.length && hasMeaningfulInlineContent(node)) {
      wrapInlineChildrenInParagraph(node, inheritedAlign);
    }
  });

  doc.querySelectorAll(tiptapAlignableSelectors.join(',')).forEach((node) => {
    if (getTextAlign(node)) return;

    const inlineAlignedChild = Array.from(node.children).find((child) => {
      const tagName = child.tagName.toLowerCase();
      return !blockTagNames.has(tagName) && Boolean(getTextAlign(child));
    });

    if (inlineAlignedChild) {
      setTextAlign(node, getTextAlign(inlineAlignedChild));
    }
  });

  return doc.body.innerHTML;
};

const extractDocxParagraphAlignments = async (arrayBuffer) => {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    if (!documentXml) {
      return [];
    }

    const xmlDoc = new DOMParser().parseFromString(documentXml, 'application/xml');
    const namespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    const paragraphNodes = Array.from(xmlDoc.getElementsByTagNameNS(namespace, 'p'));

    return paragraphNodes.map((paragraph) => {
      const justification = paragraph
        .getElementsByTagNameNS(namespace, 'jc')?.[0]
        ?.getAttributeNS(namespace, 'val')
        || paragraph.getElementsByTagNameNS(namespace, 'jc')?.[0]?.getAttribute('w:val')
        || paragraph.getElementsByTagNameNS(namespace, 'jc')?.[0]?.getAttribute('val')
        || '';

      const normalized = String(justification || '').trim().toLowerCase();
      if (normalized === 'both') {
        return 'justify';
      }
      return ['left', 'center', 'right', 'justify'].includes(normalized) ? normalized : '';
    });
  } catch (error) {
    console.warn('Failed to extract DOCX paragraph alignments', error);
    return [];
  }
};

const applyDocxParagraphAlignments = (html, alignments) => {
  if (!alignments?.length) {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');
  const blockNodes = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));

  blockNodes.forEach((node, index) => {
    const textAlign = alignments[index];
    if (!textAlign) {
      return;
    }

    const style = node.getAttribute('style') || '';
    const nextStyle = style
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => !/^text-align\s*:/i.test(part));
    nextStyle.push(`text-align: ${textAlign}`);
    node.setAttribute('style', nextStyle.join('; '));
  });

  return doc.body.innerHTML;
};

const ExamDocumentEditorPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [activeDocument, setActiveDocument] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftContentJson, setDraftContentJson] = useState(null);
  const [pendingImportHtml, setPendingImportHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState('idle');
  const [parseState, setParseState] = useState('idle'); // 'idle', 'parsing', 'ready', 'error'
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef({ title: '', content: '', contentJson: 'null' });

  const loadDocument = useCallback(async (id) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const document = await fetchExamDocument(id);
      setActiveDocument(document);
      setDraftTitle(document.title || '');
      setDraftContent('');
      setDraftContentJson(document.content_json || null);
      lastSavedRef.current = {
        title: document.title || '',
        content: document.content || '',
        contentJson: serializeContentJson(document.content_json),
      };
      setSaveState('saved');
      setParseState(document.parse_status === 'completed' ? 'ready' : 'idle');
    } catch (error) {
      toast.error(error.message || 'Failed to open exam document');
      navigate('/master-exams');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDocument(documentId);
  }, [documentId, loadDocument]);

  const hasUnsavedChanges = 
    activeDocument &&
    (
      draftTitle !== lastSavedRef.current.title ||
      serializeContentJson(draftContentJson) !== lastSavedRef.current.contentJson
    );

  useEffect(() => {
    if (!activeDocument || !hasUnsavedChanges) return undefined;

    setSaveState('pending');
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveState('saving');
        const saved = await updateExamDocument(activeDocument.id, {
          title: draftTitle,
          content_json: draftContentJson,
        });
        setActiveDocument(saved);
        lastSavedRef.current = {
          title: saved.title || '',
          content: saved.content || '',
          contentJson: serializeContentJson(saved.content_json),
        };
        setDraftContent(saved.content || '');
        setDraftContentJson(saved.content_json || null);
        setSaveState('saved');
      } catch (error) {
        setSaveState('error');
        toast.error(error.message || 'Auto-save failed');
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [activeDocument, draftContent, draftContentJson, draftTitle, hasUnsavedChanges]);

  const replaceInlineImagesWithUploads = useCallback(async (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || '', 'text/html');
    const images = Array.from(doc.querySelectorAll('img[src^="data:"]'));

    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const src = image.getAttribute('src');
      if (!src) continue;
      const file = await dataUriToFile(src, `docx-image-${index + 1}.png`);
      const uploadedUrl = await uploadExamDocumentImage(file);
      if (uploadedUrl) {
        image.setAttribute('src', uploadedUrl);
      }
    }

    return doc.body.innerHTML;
  }, []);

  const handleUpload = useCallback(async (file) => {
    try {
      const fileName = file?.name?.toLowerCase() || '';

      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer }, buildMammothImportOptions());
        const paragraphAlignments = await extractDocxParagraphAlignments(arrayBuffer);
        const preformattedHtml = convertProgramSectionsToPreBlocks(result.value || '<p></p>');
        const alignmentAwareHtml = applyDocxParagraphAlignments(preformattedHtml, paragraphAlignments);
        const normalizedHtml = normalizeImportedAlignment(alignmentAwareHtml);
        const cleanedHtml = await replaceInlineImagesWithUploads(normalizedHtml);
        setPendingImportHtml(cleanedHtml);
        setSaveState('pending');
        toast.success('DOCX imported successfully');
        return;
      }

      setIsLoading(true);
      const document = await uploadExamDocument(file);
      navigate(`/master-exams/${document.id}`, { replace: true });
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
      setIsLoading(false);
    }
  }, [navigate, replaceInlineImagesWithUploads]);

  const handleEditorChange = useCallback(({ html, json }) => {
    setDraftContent(html);
    setDraftContentJson(json);
    if (parseState !== 'idle') {
      setParseState('idle');
    }
  }, [parseState]);

  const handleImportApplied = useCallback(({ html, json }) => {
    setDraftContent(html);
    setDraftContentJson(json);
    setPendingImportHtml('');
    if (parseState !== 'idle') {
      setParseState('idle');
    }
  }, [parseState]);

  const handleTitleChange = useCallback((value) => {
    setDraftTitle(value);
    if (parseState !== 'idle') {
      setParseState('idle');
    }
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    try {
      return await uploadExamDocumentImage(file);
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
      return null;
    }
  }, []);

  const handleSaveAndPrepare = useCallback(async () => {
    if (!activeDocument) return;
    
    try {
      setSaveState('saving');
      const savedDoc = await updateExamDocument(activeDocument.id, {
        title: draftTitle,
        content_json: draftContentJson,
      });
      setActiveDocument(savedDoc);
      lastSavedRef.current = {
        title: savedDoc.title || '',
        content: savedDoc.content || '',
        contentJson: serializeContentJson(savedDoc.content_json),
      };
      setDraftContent(savedDoc.content || '');
      setDraftContentJson(savedDoc.content_json || null);
      setSaveState('saved');

      setParseState('parsing');
      const parsedDoc = await parseExamDocument(activeDocument.id, { force_refresh: true });
      setActiveDocument(parsedDoc);
      
      setParseState('ready');
      toast.success('Exam document parsed and ready for use!');
    } catch (error) {
      setParseState('error');
      toast.error(error.message || 'Failed to prepare exam document');
    }
  }, [activeDocument, draftContent, draftContentJson, draftTitle]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7fb]">
      
      {/* Top Navigation Header */}
      <div className="border-b border-[#e5e7eb] bg-white px-8 py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1000px] items-center gap-4">
          <button
            onClick={() => navigate('/master-exams')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            title="Back to Master Exams"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 min-w-0">
             <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
               Document Editor
             </div>
             <div className="truncate text-base font-medium text-slate-900">
               {draftTitle || 'Untitled Document'}
             </div>
          </div>
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="flex-1 px-4 sm:px-6">
        <ExamDocumentEditor
          document={activeDocument}
          draftTitle={draftTitle}
          draftContentJson={draftContentJson}
          importHtml={pendingImportHtml}
          saveState={saveState}
          parseState={parseState}
          isLoading={isLoading}
          onUpload={handleUpload}
          onUploadImage={handleImageUpload}
          onTitleChange={handleTitleChange}
          onContentChange={handleEditorChange}
          onImportApplied={handleImportApplied}
          onSaveAndPrepare={handleSaveAndPrepare}
        />
      </div>
    </div>
  );
};

export default ExamDocumentEditorPage;
