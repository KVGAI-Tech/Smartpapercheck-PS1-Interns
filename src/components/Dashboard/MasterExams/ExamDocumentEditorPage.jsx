/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  Loader2,
  PanelRightClose,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '../../../BaseURL';
import QuestionEditModal from './QuestionEditModal';
import SourceDocumentPreviewModal from './SourceDocumentPreviewModal';
import { pdf } from '@react-pdf/renderer';
import { PDFLayoutRenderer } from './pdf/PDFLayoutRenderer';

// New workspace components
import './workspace.css';
import WorkspaceStepper from './WorkspaceStepper';
import WorkspaceHeader from './WorkspaceHeader';
import ImportWorkspace from './ImportWorkspace';
import LibraryWorkspace from './LibraryWorkspace';
import BuilderWorkspace from './BuilderWorkspace';
import AIAssistantDrawer from './AIAssistantDrawer';
import {
  aiCategorizeWorkspaceCards,
  bulkDeleteCards,
  bulkUpdateWorkspaceCards,
  createWorkspaceCard,
  deleteWorkspaceCard,
  deleteWorkspaceDocument,
  downloadMasterExamDocx,
  duplicateWorkspaceCard,
  fetchDocumentParseDebug,
  fetchDocumentTaskStatus,
  fetchExamDocument,
  fetchMasterExamById,
  fetchMasterExamPrintableHtml,
  fetchSourceFolders,
  fetchWorkspaceCards,
  fetchWorkspaceDocuments,
  importWorkspaceCards,
  lockMasterExam,
  renameWorkspaceDocument,
  reorderWorkspaceCards,
  reprocessDocument,
  updateExamDocument,
  updateWorkspaceCard,
  uploadWorkspaceDocument,
} from './examDocumentApi';
import { normalizeMasterExamCard } from './masterExamCardSchema';
import { normalizeLegacySections, validatePaperDocumentForExport } from './paperDocumentBuilder';

const WORKSPACE_VIEWS = [
  { id: 'papers', label: 'Papers', hint: 'Compose and export', icon: FileText },
  { id: 'library', label: 'Question Library', hint: 'Review and organize', icon: BookOpen },
  { id: 'imports', label: 'Imports', hint: 'Upload and extract', icon: FolderKanban },
  { id: 'recent', label: 'Recent', hint: 'Latest activity', icon: Clock3 },
  { id: 'archived', label: 'Archived', hint: 'Published snapshots', icon: Archive },
];

const buildWorkspaceProgressSocketUrl = (workspaceId) => {
  const token = localStorage.getItem('accessToken');
  if (!token || !workspaceId) return null;
  const root = API_BASE_URL.replace(/\/api$/, '');
  const wsRoot = root.replace(/^http/i, 'ws');
  return `${wsRoot}/api/master-exams-workspace/${workspaceId}/progress/ws?token=${encodeURIComponent(token)}`;
};

const mergeDocumentProgress = (workspaceDocuments = [], statusMap = new Map()) => (
  (workspaceDocuments || []).map((doc) => {
    const taskData = statusMap.get(String(doc.id));
    if (!taskData) return doc;
    return {
      ...doc,
      parsed_status: taskData.parsed_status || doc.parsed_status,
      task_id: taskData.task_id || doc.task_id,
      task_progress: taskData.task_progress || doc.task_progress,
      parser_runtime: taskData.parser_runtime || doc.parser_runtime,
    };
  })
);

const createManualQuestionDraft = () => normalizeMasterExamCard({
  id: `manual-${Date.now()}`,
  is_selected: false,
  question_body: '',
  marks: 0,
  question_type: 'long_subjective',
  difficulty: '',
  tags_json: [],
  image_urls: [],
  writing_space_type: 'lines',
  writing_space_lines: 6,
  writing_space_height: 0,
  parsed_metadata: {
    instructions: '',
    internal_notes: '',
    topic: '',
    unit: '',
    subject: '',
    course: '',
    source_year: '',
    source_paper_name: 'Manual Entry',
    source_folder_path: [],
    co_mapping: [],
    bloom_taxonomy: '',
    attachments: [],
    options: [],
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
    subparts: [],
  },
});

function WorkspaceNavButton({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
        active
          ? 'bg-[#eef6f3] text-accent'
          : 'text-slate-500 hover:bg-white/80 hover:text-slate-900'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed ? (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{item.label}</div>
          <div className="truncate text-xs text-slate-400">{item.hint}</div>
        </div>
      ) : null}
    </button>
  );
}

function InfoBlock({ eyebrow, title, body, tone = 'default' }) {
  const toneClassName = tone === 'accent'
    ? 'border-emerald-100 bg-[#eef6f3]'
    : 'border-slate-200 bg-white';
  return (
    <div className={`rounded-[26px] border px-4 py-4 ${toneClassName}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</div>
      <div className="mt-2 text-sm font-medium text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-500">{body}</div>
    </div>
  );
}

function ActivityRow({ title, subtitle, meta }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-950">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</div>
      </div>
      {meta ? <div className="shrink-0 text-xs text-slate-400">{meta}</div> : null}
    </div>
  );
}

export default function ExamDocumentEditorPage() {
  const { documentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const wsStatusCache = useRef(new Map());
  const documentsRef = useRef([]);
  const hasPendingRef = useRef(false);

  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [cards, setCards] = useState([]);
  const [sourceFolders, setSourceFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState('');
  const [sections, setSections] = useState([{ id: 'section-1', title: 'Section A', instructions: '', cardIds: [], parsed_metadata: {} }]);

  const [activeView, setActiveView] = useState('papers');
  const [paperSurface, setPaperSurface] = useState('composer');
  const [topbarSearch, setTopbarSearch] = useState('');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [editingCardContext, setEditingCardContext] = useState(null);
  const [editingCardContextLoading, setEditingCardContextLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadBatchTotal, setUploadBatchTotal] = useState(0);
  const [uploadBatchDone, setUploadBatchDone] = useState(0);
  const draftStatusRef = useRef('clean');
  const [draftStatus, setDraftStatusState] = useState('clean');
  const setDraftStatus = useCallback((status) => {
    draftStatusRef.current = status;
    setDraftStatusState(status);
  }, []);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewDocumentData, setPreviewDocumentData] = useState(null);
  const [previewDocumentLoading, setPreviewDocumentLoading] = useState(false);
  const [, setDocumentProgressMap] = useState(new Map());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizedExam, setFinalizedExam] = useState(null);

  // Workspace 3-step shell state
  const [workspaceStep, setWorkspaceStep] = useState('import'); // 'import', 'library', 'workspace', 'builder'
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const workspaceMeta = workspace?.builder_layout_json?.questionWorkspace || workspace?.content_json?.attrs?.questionWorkspace || {};
  const routeCourseId = searchParams.get('courseId');
  const courseLabel = workspaceMeta.courseName || workspaceMeta.course_name || workspaceMeta.courseCode || (routeCourseId ? `Course ${routeCourseId}` : 'Course Workspace');
  const uploadPercent = uploadBatchTotal > 0 ? Math.round((uploadBatchDone / uploadBatchTotal) * 100) : 0;
  const completedDocs = documents.filter((doc) => doc.parsed_status === 'completed').length;
  const pendingDocs = documents.filter((doc) => ['pending', 'processing'].includes(doc.parsed_status)).length;
  const selectedCardIds = new Set(sections.flatMap((section) => section.cardIds || []).map((id) => String(id)));
  const selectedCards = cards.filter((card) => selectedCardIds.has(String(card.id)));
  const selectedMarks = selectedCards.reduce((sum, card) => sum + (Number(card.marks) || 0), 0);
  const currentViewMeta = WORKSPACE_VIEWS.find((item) => item.id === activeView) || WORKSPACE_VIEWS[0];
  const isPaperComposerView = activeView === 'papers' && paperSurface === 'composer';
  const showInspector = !isPaperComposerView;

  const persistableWorkspace = useMemo(() => {
    if (!workspace) return null;
    return {
      title: workspace.title,
      builder_layout_json: {
        ...(workspace.builder_layout_json || {}),
        paperStructure: { sections },
      },
      paper_type: workspace.paper_type || 'standard',
      template_id: workspace.template_id || 'universal',
      paper_settings_json: workspace.paper_settings_json || {},
      export_preferences_json: workspace.export_preferences_json || {},
    };
  }, [sections, workspace]);

  const recentActivity = useMemo(() => {
    const rows = (documents || []).map((doc) => ({
      id: `doc-${doc.id}`,
      title: doc.original_filename,
      subtitle: doc.parsed_status === 'completed'
        ? 'Questions extracted and ready in the library'
        : doc.parsed_status === 'failed'
          ? 'Extraction needs review'
          : 'Parsing is still running in the background',
      meta: new Date(doc.updated_at || doc.created_at || Date.now()).toLocaleDateString(),
      sortValue: new Date(doc.updated_at || doc.created_at || 0).getTime(),
    }));
    if (finalizedExam) {
      rows.push({
        id: `exam-${finalizedExam.id}`,
        title: finalizedExam.exam_name || 'Published master exam',
        subtitle: 'Immutable published snapshot ready for export',
        meta: new Date(finalizedExam.updated_at || finalizedExam.created_at || Date.now()).toLocaleDateString(),
        sortValue: new Date(finalizedExam.updated_at || finalizedExam.created_at || 0).getTime(),
      });
    }
    return rows.sort((a, b) => b.sortValue - a.sortValue).slice(0, 8);
  }, [documents, finalizedExam]);

  const hydrateDocumentProgress = useCallback(async (workspaceDocuments = []) => {
    const pendingDocuments = (workspaceDocuments || []).filter((doc) => ['pending', 'processing'].includes(doc.parsed_status));
    if (!pendingDocuments.length) {
      setDocumentProgressMap(new Map());
      return workspaceDocuments;
    }

    const taskStatuses = await Promise.all(
      pendingDocuments.map(async (doc) => {
        try {
          const taskStatus = await fetchDocumentTaskStatus(documentId, doc.id);
          return [String(doc.id), taskStatus];
        } catch {
          return [String(doc.id), null];
        }
      })
    );

    const nextMap = new Map(taskStatuses.filter(([, status]) => Boolean(status)));
    setDocumentProgressMap(nextMap);
    return mergeDocumentProgress(workspaceDocuments, nextMap);
  }, [documentId]);

  const loadWorkspace = useCallback(async () => {
    console.log('loadWorkspace called!');
    console.trace('loadWorkspace trace');
    if (!documentId) return;
    try {
      const [workspaceDoc, workspaceDocuments, workspaceCards, folders] = await Promise.all([
        fetchExamDocument(documentId),
        fetchWorkspaceDocuments(documentId, activeFolderId ? { folderId: activeFolderId } : {}),
        fetchWorkspaceCards(documentId),
        fetchSourceFolders(documentId),
      ]);

      const normalizedCards = (workspaceCards || []).map((card) => normalizeMasterExamCard(card));
      const savedSections = workspaceDoc?.builder_layout_json?.paperStructure?.sections
        || workspaceDoc?.parsed_metadata?.sections
        || [];
      const hydratedDocuments = await hydrateDocumentProgress(workspaceDocuments);

      setWorkspace(workspaceDoc);
      setDocuments(hydratedDocuments);
      setCards(normalizedCards);
      setSourceFolders(folders);
      
      if (draftStatusRef.current === 'clean') {
        setSections(normalizeLegacySections(savedSections, normalizedCards));
      }

      if (workspaceDoc?.published_master_exam_id) {
        try {
          const exam = await fetchMasterExamById(workspaceDoc.published_master_exam_id);
          setFinalizedExam(exam);
        } catch {
          setFinalizedExam(null);
        }
      } else {
        setFinalizedExam(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load workspace');
    }
  }, [activeFolderId, documentId, hydrateDocumentProgress]);

  // Keep refs in sync with state
  useEffect(() => {
    documentsRef.current = documents;
    hasPendingRef.current = documents.some((doc) => ['pending', 'processing'].includes(doc.parsed_status));
  }, [documents]);

  // Ensure layout header always has the actual course name/code and exam title, even after refresh
  useEffect(() => {
    if (!workspace) return;

    const currentState = window.history.state?.usr || {};
    const workspaceMeta = workspace?.builder_layout_json?.questionWorkspace || workspace?.content_json?.attrs?.questionWorkspace || {};

    const expectedCourseName = workspaceMeta.courseName || workspaceMeta.course_name || '';
    const expectedCourseCode = workspaceMeta.courseCode || workspaceMeta.course_code || '';
    const expectedCourseId = workspaceMeta.courseId || workspaceMeta.course_id || '';
    const expectedExamName = workspace.title || '';

    if (
      currentState.courseName === expectedCourseName &&
      currentState.courseCode === expectedCourseCode &&
      currentState.courseId === expectedCourseId &&
      currentState.examName === expectedExamName
    ) {
      return;
    }

    navigate(window.location.pathname + window.location.search, {
      replace: true,
      state: {
        ...currentState,
        courseName: expectedCourseName,
        courseCode: expectedCourseCode,
        courseId: expectedCourseId,
        examName: expectedExamName,
      },
    });
  }, [workspace, navigate]);

  useEffect(() => {
    console.log('loadWorkspace effect triggered');
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!documentId) return;

    // Use a ref-driven approach: always set up an interval, but only
    // fetch when there are pending/processing docs. This avoids
    // tearing down the interval every time `documents` changes.
    const interval = setInterval(async () => {
      if (!hasPendingRef.current) return;
      try {
        const [workspaceDocuments, workspaceCards] = await Promise.all([
          fetchWorkspaceDocuments(documentId, activeFolderId ? { folderId: activeFolderId } : {}),
          fetchWorkspaceCards(documentId),
        ]);
        const hydratedDocuments = await hydrateDocumentProgress(workspaceDocuments);
        setDocuments(hydratedDocuments);
        setCards((workspaceCards || []).map((card) => normalizeMasterExamCard(card)));
      } catch {
        // keep polling quiet
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeFolderId, documentId, hydrateDocumentProgress]);

  useEffect(() => {
    if (!documentId || !persistableWorkspace || draftStatus !== 'dirty') return undefined;
    const timeoutId = setTimeout(async () => {
      try {
        setDraftStatus('saving');
        const updated = await updateExamDocument(documentId, persistableWorkspace);
        setWorkspace((prev) => ({ ...prev, ...updated }));
        setDraftStatus('clean');
      } catch (error) {
        setDraftStatus('dirty');
        toast.error(error.message || 'Autosave failed');
      }
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [documentId, draftStatus, persistableWorkspace]);

  useEffect(() => {
    if (!documentId) return undefined;
    const socketUrl = buildWorkspaceProgressSocketUrl(documentId);
    if (!socketUrl) return undefined;

    const socket = new WebSocket(socketUrl);

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!['document_parse_progress', 'workspace_progress_snapshot'].includes(payload.event) || !payload.document_id) return;

        setDocumentProgressMap((prev) => {
          const next = new Map(prev);
          next.set(String(payload.document_id), {
            document_id: payload.document_id,
            parsed_status: payload.parsed_status,
            task_id: payload.task_id,
            task_progress: payload.task_progress,
            parser_runtime: {
              status: payload.parsed_status,
              task_id: payload.task_id,
              progress: payload.task_progress,
            },
          });
          return next;
        });

        setDocuments((prev) => prev.map((doc) => (
          String(doc.id) === String(payload.document_id)
            ? {
                ...doc,
                parsed_status: payload.parsed_status || doc.parsed_status,
                task_id: payload.task_id || doc.task_id,
                task_progress: payload.task_progress || doc.task_progress,
                parser_runtime: {
                  ...(doc.parser_runtime || {}),
                  status: payload.parsed_status,
                  task_id: payload.task_id,
                  progress: payload.task_progress,
                },
              }
            : doc
        )));

        const cacheKey = String(payload.document_id);
        const prevStatus = wsStatusCache.current.get(cacheKey);
        wsStatusCache.current.set(cacheKey, payload.parsed_status);

        // When a document transitions to 'completed', refetch everything
        // so the newly extracted question cards appear immediately.
        if (
          payload.parsed_status === 'completed' &&
          prevStatus !== 'completed'
        ) {
          console.log('Document completed, refreshing workspace:', payload.document_id);
          loadWorkspace();
        }

      } catch {
        // keep websocket updates quiet
      }
    };

    return () => {
      socket.close();
    };
  }, [documentId, loadWorkspace]);

  const markWorkspaceDirty = useCallback((updater) => {
    setWorkspace((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
    setDraftStatus('dirty');
  }, []);

  const updateSectionsWithDirty = useCallback((updater) => {
    setSections((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    setDraftStatus('dirty');
  }, []);

  const handleImportFiles = async (filesToUpload) => {
    const files = Array.from(filesToUpload || []);
    if (!files.length) return;
    try {
      setIsUploading(true);
      setUploadBatchTotal(files.length);
      setUploadBatchDone(0);
      for (const file of files) {
        await uploadWorkspaceDocument(documentId, file, activeFolderId ? { folderId: activeFolderId } : {});
        setUploadBatchDone((prev) => prev + 1);
      }
      toast.success(`${files.length} file(s) uploaded. Extraction running in background.`);
      await loadWorkspace();
    } catch (error) {
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadBatchTotal(0);
        setUploadBatchDone(0);
      }, 1200);
    }
  };

  const handleFileUpload = async (event) => {
    await handleImportFiles(event.target.files);
    if (event.target?.value) event.target.value = '';
  };

  const handleReprocessDocument = async (docId) => {
    try {
      await reprocessDocument(documentId, docId);
      toast.success('Document reprocessing started');
      await loadWorkspace();
    } catch (error) {
      toast.error(error.message || 'Failed to reprocess');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this source and all its generated questions?')) return;
    const previousDocuments = [...documents];
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    try {
      await deleteWorkspaceDocument(documentId, docId);
      toast.success('Source deleted');
      await loadWorkspace();
    } catch (error) {
      setDocuments(previousDocuments);
      toast.error(error.message || 'Failed to delete source');
      await loadWorkspace();
    }
  };

  const handleRenameDocument = async (doc) => {
    const nextName = window.prompt('Rename this source document', doc.original_filename || '');
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === doc.original_filename) return;
    try {
      const updated = await renameWorkspaceDocument(documentId, doc.id, { original_filename: trimmed });
      setDocuments((prev) => prev.map((item) => (item.id === doc.id ? updated : item)));
      toast.success('Source renamed');
    } catch (error) {
      toast.error(error.message || 'Failed to rename source');
    }
  };

  const handleOpenDocumentPreview = async (document) => {
    setPreviewDocument(document);
    setPreviewDocumentLoading(true);
    try {
      const data = await fetchDocumentParseDebug(documentId, document.id);
      setPreviewDocumentData(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load source preview');
      setPreviewDocumentData(null);
    } finally {
      setPreviewDocumentLoading(false);
    }
  };

  const handleEditCard = useCallback(async (card) => {
    setEditingCard(card);
    setEditingCardContext(null);

    const targetDocId = card?.source_document_id || documents?.[0]?.exam_document_id;
    if (!targetDocId) return;

    try {
      setEditingCardContextLoading(true);
      const data = await fetchDocumentParseDebug(documentId, targetDocId);
      setEditingCardContext(data);
    } catch {
      setEditingCardContext(null);
    } finally {
      setEditingCardContextLoading(false);
    }
  }, [documentId, documents]);

  const removeCardIdsFromSections = useCallback((cardIdsToRemove) => {
    const blockedIds = new Set(cardIdsToRemove.map((id) => String(id)));
    updateSectionsWithDirty((prev) => prev.map((section) => ({
      ...section,
      cardIds: (section.cardIds || []).filter((id) => !blockedIds.has(String(id))),
    })));
  }, [updateSectionsWithDirty]);

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteWorkspaceCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      removeCardIdsFromSections([cardId]);
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleDuplicateCard = async (cardId) => {
    try {
      const duplicated = normalizeMasterExamCard(await duplicateWorkspaceCard(cardId));
      setCards((prev) => [...prev, duplicated]);
      toast.success('Question duplicated');
    } catch {
      toast.error('Failed to duplicate card');
    }
  };

  const handleBulkDelete = async (cardIds) => {
    try {
      await bulkDeleteCards(documentId, cardIds);
      setCards((prev) => prev.filter((card) => !cardIds.includes(card.id)));
      removeCardIdsFromSections(cardIds);
      toast.success(`${cardIds.length} questions deleted`);
    } catch {
      toast.error('Failed to delete cards');
    }
  };

  const handleBulkTag = async (cardIds, tags) => {
    try {
      const updatedCards = await bulkUpdateWorkspaceCards(documentId, {
        card_ids: cardIds,
        tags_json: tags,
        categorization_status: 'needs_review',
      });
      const map = new Map(updatedCards.map((card) => [String(card.id), normalizeMasterExamCard(card)]));
      setCards((prev) => prev.map((card) => map.get(String(card.id)) || card));
      toast.success(`Tagged ${updatedCards.length} questions`);
    } catch (error) {
      toast.error(error.message || 'Failed to update tags');
    }
  };

  const handleAiCategorize = async (cardIds) => {
    try {
      const updatedCards = await aiCategorizeWorkspaceCards(documentId, cardIds);
      const map = new Map(updatedCards.map((card) => [String(card.id), normalizeMasterExamCard(card)]));
      setCards((prev) => prev.map((card) => map.get(String(card.id)) || card));
      toast.success(`AI categorized ${updatedCards.length} questions`);
    } catch (error) {
      toast.error(error.message || 'Failed to categorize questions');
    }
  };

  const handleImportCards = async ({ sourceExamDocumentId, cardIds }) => {
    try {
      const importedCards = await importWorkspaceCards(documentId, {
        source_exam_document_id: sourceExamDocumentId,
        card_ids: cardIds,
      });
      setCards((prev) => [...prev, ...(importedCards || []).map((card) => normalizeMasterExamCard(card))]);
      toast.success(`Imported ${importedCards.length} questions`);
    } catch (error) {
      toast.error(error.message || 'Failed to import questions');
      throw error;
    }
  };

  const handleReorderCards = async (cardIds) => {
    setCards((prev) => {
      const cardMap = new Map(prev.map((card) => [card.id, card]));
      const reordered = cardIds.map((id, index) => {
        const card = cardMap.get(id);
        return card ? { ...card, order_index: index } : null;
      }).filter(Boolean);
      const remaining = prev.filter((card) => !cardIds.includes(card.id));
      return [...reordered, ...remaining];
    });
    try {
      await reorderWorkspaceCards(documentId, cardIds);
    } catch {
      toast.error('Failed to save card order');
    }
  };

  const handleCardSave = async (cardId, payload) => {
    try {
      const isManualDraft = String(cardId).startsWith('manual-');
      const savedCard = isManualDraft
        ? await createWorkspaceCard(documentId, { ...payload, source_folder_id: activeFolderId || null })
        : await updateWorkspaceCard(cardId, payload);
      const normalized = normalizeMasterExamCard(savedCard);
      setCards((prev) => (
        isManualDraft
          ? [...prev, normalized]
          : prev.map((card) => (card.id === cardId ? { ...card, ...normalized } : card))
      ));
      toast.success(isManualDraft ? 'Question created' : 'Question updated');
    } catch (error) {
      toast.error(error.message || 'Failed to save question');
      throw error;
    }
  };

  const handleUpdateCardMarks = useCallback(async (cardId, newMarks) => {
    const marksNum = Number(newMarks) || 0;

    // Optimistically update local cards state immediately
    setCards((prev) =>
      prev.map((card) =>
        String(card.id) === String(cardId) ? { ...card, marks: marksNum } : card
      )
    );

    try {
      const savedCard = await updateWorkspaceCard(cardId, { marks: marksNum });
      const normalized = normalizeMasterExamCard(savedCard);
      // Sync with the actual saved card from the server
      setCards((prev) =>
        prev.map((card) =>
          String(card.id) === String(cardId) ? { ...card, ...normalized } : card
        )
      );
    } catch (error) {
      toast.error(error.message || 'Failed to update marks');
      // Refetch cards to restore correct state from DB
      try {
        const workspaceCards = await fetchWorkspaceCards(documentId);
        setCards((workspaceCards || []).map((card) => normalizeMasterExamCard(card)));
      } catch {
        // quiet fallback
      }
    }
  }, [documentId]);

  const handleCreateQuickQuestion = async (payload) => {
    const savedCard = await createWorkspaceCard(documentId, {
      ...payload,
      source_folder_id: activeFolderId || null,
    });
    const normalized = normalizeMasterExamCard(savedCard);
    setCards((prev) => [...prev, normalized]);
    return normalized;
  };

  const handleFinalize = async (examName) => {
    try {
      setIsFinalizing(true);
      setDraftStatus('finalizing');
      if (draftStatus === 'dirty' && persistableWorkspace) {
        const updatedWorkspace = await updateExamDocument(documentId, persistableWorkspace);
        setWorkspace((prev) => ({ ...prev, ...updatedWorkspace }));
      }
      const result = await lockMasterExam(documentId, examName);
      const masterExamId = result?.master_exam_id || result?.data?.master_exam_id;
      if (masterExamId) {
        const exam = await fetchMasterExamById(masterExamId);
        setFinalizedExam(exam);
        
        // Finalize paper to create snapshot
        await import('./examDocumentApi').then(api => api.finalizeMasterExamPaper(masterExamId));
      }
      await loadWorkspace();
      setActiveView('papers');
      setPaperSurface('finalize');
      toast.success('Draft finalized successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to finalize draft');
    } finally {
      setIsFinalizing(false);
      setDraftStatus('clean');
    }
  };

  const handleDownloadDocx = useCallback(async (exam) => {
    try {
      const blob = await downloadMasterExamDocx(exam.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(exam.exam_name || 'master_exam').replace(/\s+/g, '_')}.docx`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('DOCX export started', {
        duration: 3000,
        position: 'bottom-center',
      });
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to download DOCX');
      return false;
    }
  }, []);

  const handleOpenPrintable = async (exam) => {
    try {
      const html = await fetchMasterExamPrintableHtml(exam.id);
      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        toast.error('Popup blocked while opening printable view');
        return;
      }
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      toast.error(error.message || 'Failed to open printable view');
    }
  };

  const ensureFinalizedExam = useCallback(async (examName = workspace?.title || 'Final Exam Paper') => {
    if (finalizedExam) return finalizedExam;

    if (draftStatus === 'dirty' && persistableWorkspace) {
      const updatedWorkspace = await updateExamDocument(documentId, persistableWorkspace);
      setWorkspace((prev) => ({ ...prev, ...updatedWorkspace }));
    }

    const result = await lockMasterExam(documentId, examName);
    const masterExamId = result?.master_exam_id || result?.data?.master_exam_id;
    if (!masterExamId) {
      throw new Error('Published exam snapshot was not created');
    }

    const exam = await fetchMasterExamById(masterExamId);
    setFinalizedExam(exam);
    await loadWorkspace();
    return exam;
  }, [documentId, draftStatus, finalizedExam, loadWorkspace, persistableWorkspace, workspace?.title]);

  const handlePublishFromComposer = useCallback(async () => {
    const alreadyPublished = Boolean(finalizedExam);
    await ensureFinalizedExam(workspace?.title || 'Final Exam Paper');
    toast.success(alreadyPublished ? 'Paper already published' : 'Paper published to platform', {
      duration: 3000,
      position: 'bottom-center',
    });
  }, [ensureFinalizedExam, finalizedExam, workspace?.title]);

  const handleDocxExportFromComposer = useCallback(async () => {
    const exam = await ensureFinalizedExam(workspace?.title || 'Final Exam Paper');
    const didExport = await handleDownloadDocx(exam);
    if (!didExport) {
      throw new Error('Failed to export DOCX');
    }
  }, [ensureFinalizedExam, handleDownloadDocx, workspace?.title]);

  const handleCreateManualCard = () => {
    setActiveView('library');
    setEditingCardContext(null);
    setEditingCard(createManualQuestionDraft());
  };



  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f1f4f4]">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--ws-brand)' }} />
          Loading workspace...
        </div>
      </div>
    );
  }

  // Calculate paper counts
  const sourcesCount = documents.length;
  const questionsCount = cards.length;
  const addedMarks = sections.reduce((sum, sec) => sum + (sec.cardIds || []).reduce((s, id) => s + (Number(cards.find(c => String(c.id) === String(id))?.marks) || 0), 0), 0);
  const totalMarks = workspace.paper_settings_json?.totalMarks || 100;

  return (
    <div className="ws-shell">
      <WorkspaceHeader
        paper={{
          title: workspace.title || 'Untitled Paper',
          duration: workspace.paper_settings_json?.duration || '3 Hours',
          totalMarks: totalMarks,
          addedMarks: addedMarks,
          subject: workspaceMeta?.courseName || 'Subject',
        }}
        courseContext={{
          code: workspaceMeta?.courseCode || 'SPC101',
          name: workspaceMeta?.courseName || 'Course',
          institution: 'Institution Name',
        }}
        step={workspaceStep}
        onBack={() => {
          if (workspaceStep === 'builder') setWorkspaceStep('workspace');
          else if (workspaceStep === 'workspace') setWorkspaceStep('library');
          else if (workspaceStep === 'library') setWorkspaceStep('import');
        }}
        onContinue={() => {
          if (workspaceStep === 'import') setWorkspaceStep('library');
          else if (workspaceStep === 'library') setWorkspaceStep('workspace');
          else if (workspaceStep === 'workspace') setWorkspaceStep('builder');
        }}
        draftStatus={draftStatus}
      />

      <WorkspaceStepper
        step={workspaceStep}
        onChange={setWorkspaceStep}
        sourcesCount={sourcesCount}
        questionsCount={questionsCount}
        addedMarks={addedMarks}
        totalMarks={totalMarks}
      />

      <div className={`ws-stage ${workspaceStep === 'workspace' || workspaceStep === 'builder' ? 'ws-stage--builder' : ''}`}>
        {workspaceStep === 'import' && (
          <ImportWorkspace
            documents={documents}
            cards={cards}
            onImportFiles={handleImportFiles}
            onDeleteDocument={handleDeleteDocument}
            onViewDocument={handleOpenDocumentPreview}
            onContinue={() => setWorkspaceStep('library')}
            isUploading={isUploading}
            uploadBatchTotal={uploadBatchTotal}
            uploadBatchDone={uploadBatchDone}
          />
        )}

        {workspaceStep === 'library' && (
          <LibraryWorkspace
            cards={cards}
            onEditCard={handleEditCard}
            onContinue={() => setWorkspaceStep('workspace')}
            onCreateNewQuestion={handleCreateManualCard}
          />
        )}

        {workspaceStep === 'workspace' && (
          <BuilderWorkspace
            mode="compose"
            cards={cards}
            sections={sections}
            updateSections={updateSectionsWithDirty}
            paperTitle={workspace.title}
            setPaperTitle={(t) => markWorkspaceDirty({ title: t })}
            paperSettings={workspace.paper_settings_json || {}}
            builderLayout={workspace.builder_layout_json || {}}
            onUpdateBuilderLayout={(patch) => markWorkspaceDirty((prev) => ({
              ...prev,
              builder_layout_json: {
                ...(prev.builder_layout_json || {}),
                ...patch,
                paperStructure: (prev.builder_layout_json || {}).paperStructure,
              },
            }))}
            paperType={workspace.paper_type || 'standard'}
            onChangePaperType={(pt) => markWorkspaceDirty({ paper_type: pt })}
            courseContext={{
              code: workspaceMeta?.courseCode || 'SPC101',
              name: workspaceMeta?.courseName || 'Subject',
              institution: 'University',
            }}
            onFinalize={() => handleFinalize(workspace.title || 'Final Exam')}
            onUpdateCardMarks={handleUpdateCardMarks}
          />
        )}

        {workspaceStep === 'builder' && (
          <BuilderWorkspace
            mode="finalize"
            cards={cards}
            sections={sections}
            updateSections={updateSectionsWithDirty}
            paperTitle={workspace.title}
            setPaperTitle={(t) => markWorkspaceDirty({ title: t })}
            paperSettings={workspace.paper_settings_json || {}}
            builderLayout={workspace.builder_layout_json || {}}
            onUpdateBuilderLayout={(patch) => markWorkspaceDirty((prev) => ({
              ...prev,
              builder_layout_json: {
                ...(prev.builder_layout_json || {}),
                ...patch,
                paperStructure: (prev.builder_layout_json || {}).paperStructure,
              },
            }))}
            paperType={workspace.paper_type || 'standard'}
            onChangePaperType={(pt) => markWorkspaceDirty({ paper_type: pt })}
            courseContext={{
              code: workspaceMeta?.courseCode || 'SPC101',
              name: workspaceMeta?.courseName || 'Subject',
              institution: 'University',
            }}
            onExport={async ({
              paperType: exportPaperType,
              paperDocument,
              builderLayout,
              paperSettings,
              paperTitle,
            }) => {
              const toastId = toast.loading(`Generating ${exportPaperType} PDF...`);
              try {
                validatePaperDocumentForExport(paperDocument);

                const doc = (
                  <PDFLayoutRenderer
                    title={builderLayout?.headerTitle || paperTitle || workspace.title}
                    builderLayout={builderLayout || {}}
                    paperType={exportPaperType || 'standard'}
                    paperSettings={paperSettings || {}}
                    paperDocument={paperDocument}
                  />
                );

                const blob = await pdf(doc).toBlob();
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `${(paperTitle || workspace.title || 'Exam_Paper').replace(/\s+/g, '_')}_${exportPaperType}.pdf`;
                anchor.click();
                URL.revokeObjectURL(url);
                toast.success('PDF downloaded successfully', { id: toastId });
              } catch (error) {
                toast.error(error.message || 'Failed to generate PDF', { id: toastId });
              }
            }}
            onFinalize={() => handleFinalize(workspace.title || 'Final Exam')}
            onUpdateCardMarks={handleUpdateCardMarks}
          />
        )}
      </div>


      <ErrorBoundary>
        <QuestionEditModal
          card={editingCard}
          sourceAssets={editingCardContext?.assets || []}
          contextLoading={editingCardContextLoading}
          onClose={() => {
            setEditingCard(null);
            setEditingCardContext(null);
            setEditingCardContextLoading(false);
          }}
          onSave={handleCardSave}
          onDelete={handleDeleteCard}
          sections={sections}
        />
      </ErrorBoundary>

      <SourceDocumentPreviewModal
        document={previewDocument}
        parseDebug={previewDocumentData}
        loading={previewDocumentLoading}
        onClose={() => {
          setPreviewDocument(null);
          setPreviewDocumentData(null);
          setPreviewDocumentLoading(false);
        }}
      />
    </div>
  );
}
