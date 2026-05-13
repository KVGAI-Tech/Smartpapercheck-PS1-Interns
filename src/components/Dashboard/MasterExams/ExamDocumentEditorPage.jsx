import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle, 
  Loader2, 
  Save, 
  Lock,
  FileText,
  CheckSquare,
  XCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import QuestionCard from './QuestionCard';
import QuestionEditModal from './QuestionEditModal';
import { 
  fetchExamDocument, 
  uploadWorkspaceDocument,
  fetchWorkspaceDocuments,
  fetchWorkspaceCards,
  updateWorkspaceCard,
  deleteWorkspaceCard,
  reorderWorkspaceCards,
  toggleCardSelection,
  lockMasterExam,
} from './examDocumentApi';

function DroppableContainer({ id, children, className }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export default function ExamDocumentEditorPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  
  const [masterExam, setMasterExam] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [cards, setCards] = useState([]);
  
  const [editingCard, setEditingCard] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load Initial Data
  const loadWorkspace = useCallback(async () => {
    if (!documentId) return;
    
    try {
      const isViewOnly = window.location.pathname.includes('/view/');
      setIsReadOnly(isViewOnly);

      let docs = [];
      let loadedCards = [];

      if (isViewOnly) {
        // Fetch questions from finalized master exam
        loadedCards = await fetchMasterExamQuestions(documentId);
        // We don't need source docs in view mode for now
      } else {
        const examData = await fetchExamDocument(documentId);
        setMasterExam(examData);
        docs = await fetchWorkspaceDocuments(documentId);
        loadedCards = await fetchWorkspaceCards(documentId);
      }
      
      setDocuments(docs);
      setCards(loadedCards);
    } catch (err) {
      toast.error('Failed to load document data');
    }
  }, [documentId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Polling for document processing
  useEffect(() => {
    if (isReadOnly) return;
    const hasPendingDocs = documents.some(d => ['pending', 'processing'].includes(d.parsed_status));
    if (!hasPendingDocs) return;

    const intervalId = setInterval(async () => {
      const docs = await fetchWorkspaceDocuments(documentId);
      setDocuments(docs);
      
      const loadedCards = await fetchWorkspaceCards(documentId);
      setCards(loadedCards);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [documents, documentId, isReadOnly]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      for (const file of files) {
        await uploadWorkspaceDocument(documentId, file);
      }
      toast.success(`${files.length} document(s) uploaded. Processing started...`);
      loadWorkspace();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDragOver = (event) => {
    if (isReadOnly) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeCard = cards.find(c => c.id === activeId);
    const overCard = cards.find(c => c.id === overId);
    
    // If over a container droppable instead of an item
    const overContainerId = over.data?.current?.sortable?.containerId || over.id;
    const activeContainerId = active.data?.current?.sortable?.containerId;

    if (activeContainerId && overContainerId && activeContainerId !== overContainerId) {
      setCards((prev) => {
        const activeIndex = prev.findIndex((c) => c.id === activeId);
        const newCards = [...prev];
        
        // Toggle selection based on destination container
        newCards[activeIndex] = { 
          ...newCards[activeIndex], 
          is_selected: overContainerId === 'paper' 
        };

        // If dropping on an item in a different container, move it near that item
        const overIndex = prev.findIndex((c) => c.id === overId);
        if (overIndex !== -1) {
          return arrayMove(newCards, activeIndex, overIndex);
        }
        
        return newCards;
      });
    }
  };

  const handleDragEnd = async (event) => {
    if (isReadOnly) return;
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);
      
      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
      
      try {
        await reorderWorkspaceCards(documentId, newCards.map(c => c.id));
        // Also ensure selection is persisted if moved between containers
        const movedCard = newCards[newIndex];
        const originalCard = cards[oldIndex];
        if (movedCard.is_selected !== originalCard.is_selected) {
          await toggleCardSelection(movedCard.id);
        }
      } catch (err) {
        toast.error('Failed to persist order');
      }
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (isReadOnly) return;
    try {
      await deleteWorkspaceCard(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      toast.success('Card deleted');
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  const handleToggleSelect = async (cardId) => {
    if (isReadOnly) return;
    try {
      const updated = await toggleCardSelection(cardId);
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, is_selected: updated.is_selected } : c));
    } catch (err) {
      toast.error('Failed to toggle selection');
    }
  };

  const handleCardSave = async (cardId, formData) => {
    if (isReadOnly) return;
    try {
      const updated = await updateWorkspaceCard(cardId, formData);
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updated } : c));
      toast.success('Question updated');
    } catch (err) {
      toast.error('Failed to save question');
    }
  };

  const handleSaveDraft = async () => {
    if (isReadOnly) return;
    setIsSavingOrder(true);
    try {
      await reorderWorkspaceCards(documentId, cards.map(c => c.id));
      toast.success('Draft saved');
    } catch (err) {
      toast.error('Failed to save draft');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleLockExam = async () => {
    const selectedCount = paperCards.length;
    if (selectedCount === 0) {
      toast.error('No questions to lock. Upload and process documents first.');
      return;
    }
    
    const examName = masterExam?.title || 'Master Exam';
    if (!window.confirm(`Lock "${examName}" with ${selectedCount} questions (${selectedMarks} marks)?\n\nThis will create a Master Exam that can be imported into Conduct Exams.`)) return;

    setIsLocking(true);
    try {
      const result = await lockMasterExam(documentId, examName);
      toast.success(`Master Exam created! ID: ${result.master_exam_id}`);
      navigate('/master-exams');
    } catch (err) {
      toast.error(err.message || 'Failed to lock exam');
    } finally {
      setIsLocking(false);
    }
  };

  const bankCards = cards.filter(c => !c.is_selected);
  const paperCards = cards.filter(c => c.is_selected);
  const selectedMarks = paperCards.reduce((sum, c) => sum + (parseFloat(c.marks) || 0), 0);
  const totalMarks = cards.reduce((sum, card) => sum + (parseFloat(card.marks) || 0), 0);

  return (
    <div className="flex h-screen flex-col bg-[#f8f9fa]">
      {/* Top Navbar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master-exams')} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">{masterExam?.title || 'Master Exam Workspace'}</h1>
              {isReadOnly && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">Finalized</span>}
            </div>
            <p className="text-xs font-medium text-slate-500">{isReadOnly ? 'Read-only View' : 'Draft'} • ID: {documentId?.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="mr-2 flex items-center gap-4 text-sm font-semibold text-slate-600">
            <span>All: <span className="text-accent">{totalMarks}</span> marks</span>
            <span className="text-slate-300">|</span>
            <span>Selected: <span className="text-green-600">{paperCards.length}</span> Q / <span className="text-green-600">{selectedMarks}</span> marks</span>
          </div>
          {!isReadOnly && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSavingOrder}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSavingOrder ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleLockExam}
                disabled={isLocking || paperCards.length === 0}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {isLocking ? 'Locking...' : 'Lock Exam'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Uploads & Processing */}
        {!isReadOnly && (
          <div className="flex w-[300px] shrink-0 flex-col border-r bg-white">
            <div className="border-b p-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-accent hover:bg-accent/5">
                {isUploading ? (
                  <Loader2 className="h-7 w-7 animate-spin text-accent" />
                ) : (
                  <UploadCloud className="mb-1.5 h-7 w-7 text-slate-400" />
                )}
                <span className="text-sm font-semibold text-slate-600">
                  {isUploading ? 'Uploading...' : 'Upload Papers'}
                </span>
                <span className="mt-0.5 text-xs text-slate-400">PDF, DOCX, Images</span>
                <input type="file" className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg,.webp" multiple onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Processing Queue</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500">No documents uploaded yet.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="mb-2 flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-slate-700">{doc.original_filename}</div>
                    </div>
                    <div className="ml-2 shrink-0">
                      {doc.parsed_status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : doc.parsed_status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Center Panel: Question Bank */}
          <DroppableContainer id="bank" className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                  <Sparkles className="h-5 w-5 text-accent" />
                  {isReadOnly ? 'Exam Content' : 'Question Bank'}
                  <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{bankCards.length} cards</span>
                </h2>
              </div>
              
              {!isReadOnly && bankCards.length === 0 && documents.length > 0 && documents.every(d => d.parsed_status === 'completed') ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center text-slate-400">
                  <CheckCircle className="mb-3 h-10 w-10 text-green-500" />
                  <p className="font-semibold">All questions moved to paper!</p>
                  <p className="mt-1 text-sm">Drag questions back here to remove them from the exam.</p>
                </div>
              ) : bankCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center text-slate-400">
                  <UploadCloud className="mb-3 h-10 w-10" />
                  <p className="font-semibold">No questions generated yet.</p>
                  <p className="mt-1 text-sm">Upload a document to automatically generate question cards.</p>
                </div>
              ) : (
                <SortableContext id="bank" items={bankCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {bankCards.map(card => (
                    <QuestionCard 
                      key={card.id} 
                      card={card} 
                      isActive={editingCard?.id === card.id}
                      onSelect={(c) => setEditingCard(c)}
                      onToggleSelect={handleToggleSelect}
                      onDelete={handleDeleteCard}
                      onEdit={(c) => setEditingCard(c)}
                      readOnly={isReadOnly}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </DroppableContainer>

          {/* Right Panel: Paper Assembly Preview */}
          <div className="flex w-[340px] shrink-0 flex-col border-l bg-white">
            <div className="border-b p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="h-4 w-4 text-accent" />
                Master Exam Paper
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {paperCards.length} questions • {selectedMarks} marks
              </p>
            </div>
            
            <DroppableContainer id="paper" className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <SortableContext id="paper" items={paperCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {paperCards.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-400">
                    <CheckSquare className="mb-2 h-8 w-8" />
                    <p className="font-medium">Paper is empty</p>
                    <p className="mt-1 text-xs px-4">Drag questions from the bank here to build your exam.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paperCards.map((card, idx) => (
                      <QuestionCard 
                        key={card.id} 
                        card={card} 
                        isMini={true}
                        isActive={editingCard?.id === card.id}
                        onSelect={(c) => setEditingCard(c)}
                        onToggleSelect={handleToggleSelect}
                        onDelete={handleDeleteCard}
                        onEdit={(c) => setEditingCard(c)}
                        displayIndex={idx + 1}
                        readOnly={isReadOnly}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DroppableContainer>

            {/* Lock Summary Footer */}
            {!isReadOnly && paperCards.length > 0 && (
              <div className="border-t bg-gradient-to-r from-accent/5 to-transparent p-4">
                <div className="mb-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <div className="text-lg font-bold text-accent">{paperCards.length}</div>
                    <div className="text-[10px] font-medium text-slate-500">Questions</div>
                  </div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <div className="text-lg font-bold text-accent">{selectedMarks}</div>
                    <div className="text-[10px] font-medium text-slate-500">Total Marks</div>
                  </div>
                </div>
                <button
                  onClick={handleLockExam}
                  disabled={isLocking}
                  className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                >
                  <Lock className="mr-1.5 inline h-4 w-4" />
                  {isLocking ? 'Creating Master Exam...' : 'Lock & Create Master Exam'}
                </button>
              </div>
            )}
          </div>
        </DndContext>

      </div>

      {/* Question Edit Modal */}
      {editingCard && (
        <QuestionEditModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleCardSave}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
}
