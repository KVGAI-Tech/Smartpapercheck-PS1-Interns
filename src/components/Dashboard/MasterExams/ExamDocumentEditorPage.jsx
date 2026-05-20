/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

import SourcePanel from './SourcePanel';
import CardWorkspace from './CardWorkspace';
import QuestionEditModal from './QuestionEditModal';
import PaperComposer from './PaperComposer';
import {
  createSourceFolder,
  createWorkspaceCard,
  deleteWorkspaceCard,
  deleteWorkspaceDocument,
  duplicateWorkspaceCard,
  bulkDeleteCards,
  fetchExamDocument,
  fetchSourceFolders,
  fetchWorkspaceCards,
  fetchWorkspaceDocuments,
  reorderWorkspaceCards,
  reprocessDocument,
  updateExamDocument,
  updateWorkspaceCard,
  uploadWorkspaceDocument,
} from './examDocumentApi';
import { normalizeMasterExamCard } from './masterExamCardSchema';

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
    title: 'New Question Card',
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

export default function ExamDocumentEditorPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  // Core state
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [cards, setCards] = useState([]);
  const [sourceFolders, setSourceFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState('');
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState('cards'); // 'cards' | 'composer'

  // UI state
  const [editingCard, setEditingCard] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadBatchTotal, setUploadBatchTotal] = useState(0);
  const [uploadBatchDone, setUploadBatchDone] = useState(0);
  const [sourcePanelCollapsed, setSourcePanelCollapsed] = useState(false);
  
  // Paper Structure state
  const [sections, setSections] = useState([
    { id: 'section-1', title: 'Section A', instructions: '', cards: [] }
  ]);

  // Derived values
  const uploadPercent = uploadBatchTotal > 0 ? Math.round((uploadBatchDone / uploadBatchTotal) * 100) : 0;
  const completedDocs = documents.filter((d) => d.parsed_status === 'completed').length;
  const pendingDocs = documents.filter((d) => ['pending', 'processing'].includes(d.parsed_status)).length;

  // ==========================================
  // DATA LOADING
  // ==========================================

  const loadWorkspace = useCallback(async () => {
    if (!documentId) return;
    try {
      const [workspaceDoc, workspaceDocuments, workspaceCards, folders] = await Promise.all([
        fetchExamDocument(documentId),
        fetchWorkspaceDocuments(documentId, activeFolderId ? { folderId: activeFolderId } : {}),
        fetchWorkspaceCards(documentId),
        fetchSourceFolders(documentId),
      ]);

      setWorkspace(workspaceDoc);
      setDocuments(workspaceDocuments);
      setCards((workspaceCards || []).map((c) => normalizeMasterExamCard(c)));
      setSourceFolders(folders);
      
      if (workspaceDoc?.parsed_metadata?.sections) {
        setSections(workspaceDoc.parsed_metadata.sections);
      }
    } catch (error) {
      toast.error('Failed to load workspace');
    }
  }, [activeFolderId, documentId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Poll for processing documents
  useEffect(() => {
    if (!documentId) return;
    const hasPending = documents.some((d) => ['pending', 'processing'].includes(d.parsed_status));
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const [workspaceDocuments, workspaceCards] = await Promise.all([
          fetchWorkspaceDocuments(documentId, activeFolderId ? { folderId: activeFolderId } : {}),
          fetchWorkspaceCards(documentId),
        ]);
        setDocuments(workspaceDocuments);
        setCards((workspaceCards || []).map((c) => normalizeMasterExamCard(c)));
      } catch {
        // Silent polling failure
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeFolderId, documentId, documents]);

  // ==========================================
  // SOURCE PANEL HANDLERS
  // ==========================================

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
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
      setTimeout(() => { setUploadBatchTotal(0); setUploadBatchDone(0); }, 1200);
      if (event.target?.value) event.target.value = '';
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Name this source folder');
    if (!name?.trim()) return;

    try {
      const folder = await createSourceFolder(documentId, {
        name: name.trim(),
        folder_type: 'source',
      });
      setSourceFolders((prev) => [...prev, folder]);
      setActiveFolderId(folder.id);
      toast.success('Source folder created');
    } catch (error) {
      toast.error(error.message || 'Failed to create folder');
    }
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
    if (!window.confirm('Delete this source and all its generated cards?')) return;
    try {
      await deleteWorkspaceDocument(documentId, docId);
      toast.success('Source deleted');
      await loadWorkspace();
    } catch (error) {
      toast.error(error.message || 'Failed to delete source');
    }
  };

  // ==========================================
  // CARD HANDLERS
  // ==========================================

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Delete this question card?')) return;
    try {
      await deleteWorkspaceCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleDuplicateCard = async (cardId) => {
    try {
      const duplicated = normalizeMasterExamCard(await duplicateWorkspaceCard(cardId));
      setCards((prev) => [...prev, duplicated]);
      toast.success('Card duplicated');
    } catch {
      toast.error('Failed to duplicate card');
    }
  };

  const handleBulkDelete = async (cardIds) => {
    try {
      await bulkDeleteCards(documentId, cardIds);
      setCards((prev) => prev.filter((c) => !cardIds.includes(c.id)));
      toast.success(`${cardIds.length} cards deleted`);
    } catch {
      toast.error('Failed to delete cards');
    }
  };

  const handleReorderCards = async (cardIds) => {
    // Optimistic reorder
    setCards((prev) => {
      const cardMap = new Map(prev.map((c) => [c.id, c]));
      const reordered = cardIds
        .map((id, index) => {
          const c = cardMap.get(id);
          return c ? { ...c, order_index: index } : null;
        })
        .filter(Boolean);
      const remaining = prev.filter((c) => !cardIds.includes(c.id));
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
        ? await createWorkspaceCard(documentId, {
            ...payload,
            source_folder_id: activeFolderId || null,
          })
        : await updateWorkspaceCard(cardId, payload);

      const normalized = normalizeMasterExamCard(savedCard);
      setCards((prev) =>
        isManualDraft
          ? [...prev, normalized]
          : prev.map((c) => (c.id === cardId ? { ...c, ...normalized } : c))
      );
      toast.success(isManualDraft ? 'Card created' : 'Card updated');
    } catch (error) {
      toast.error('Failed to save card');
      throw error;
    }
  };

  const handleCreateManualCard = () => {
    setEditingCard(createManualQuestionDraft());
  };

  const handleSaveWorkspace = async () => {
    if (!workspace) return;
    setIsSaving(true);
    try {
      const updated = await updateExamDocument(documentId, {
        title: workspace.title,
        parsed_metadata: {
          ...workspace.parsed_metadata,
          sections: sections
        }
      });
      setWorkspace((prev) => ({ ...prev, ...updated }));
      toast.success('Workspace saved');
    } catch {
      toast.error('Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fbf8]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f8fbf8] text-slate-900">
      {/* Top header bar */}
      <header className="z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/master-exams')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Question Import Workspace
              </span>
            </div>
            <input
              value={workspace.title || ''}
              onChange={(e) => setWorkspace((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-0.5 block w-[320px] border-none bg-transparent text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-300"
              placeholder="Untitled Workspace"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 'cards' ? (
            <button
              onClick={() => setCurrentStep('composer')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Compose Paper →
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep('cards')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              ← Back to Cards
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveWorkspace}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </header>

      {/* Main content: source panel + card workspace */}
      {currentStep === 'cards' ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SourcePanel
            documents={documents}
            sourceFolders={sourceFolders}
            activeFolderId={activeFolderId}
            setActiveFolderId={setActiveFolderId}
            isUploading={isUploading}
            uploadPercent={uploadPercent}
            pendingDocs={pendingDocs}
            completedDocs={completedDocs}
            totalCards={cards.length}
            onFileUpload={handleFileUpload}
            onCreateFolder={handleCreateFolder}
            onReprocessDocument={handleReprocessDocument}
            onDeleteDocument={handleDeleteDocument}
            collapsed={sourcePanelCollapsed}
            onToggleCollapse={() => setSourcePanelCollapsed((prev) => !prev)}
          />

          <CardWorkspace
            cards={cards}
            documents={documents}
            onEditCard={setEditingCard}
            onDeleteCard={handleDeleteCard}
            onDuplicateCard={handleDuplicateCard}
            onReorderCards={handleReorderCards}
            onBulkDelete={handleBulkDelete}
            onCreateManualCard={handleCreateManualCard}
            activeCardId={editingCard?.id}
            sections={sections}
            setSections={setSections}
          />
        </div>
      ) : (
        <PaperComposer
          cards={cards}
          workspace={workspace}
          sections={sections}
          setSections={setSections}
          onSaveWorkspace={(updates) => setWorkspace(prev => ({ ...prev, ...updates }))}
        />
      )}

      {/* Edit modal */}
      <QuestionEditModal
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleCardSave}
        onDelete={handleDeleteCard}
        sections={[]}
      />
    </div>
  );
}
