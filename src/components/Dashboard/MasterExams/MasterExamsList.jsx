import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  FilePlus2,
  FolderPlus,
  Loader2,
  Search,
  X,
} from 'lucide-react';

import ExamForm from '../Course/forms/ExamForm';
import UploadQnAModal from '../Course/modals/UploadQnAModal';
import RubricModal from '../Course/modals/RubricModal';
import {
  createMasterExamFolder,
  createMasterExamNodeExam,
  deleteMasterExamNode,
  fetchMasterExamFolderContents,
  getMasterExamQuestions,
  renameMasterExamNode,
  updateMasterExam,
} from './masterExamApi';
import { API_BASE_URL } from '../../../BaseURL';
import Breadcrumbs from './Breadcrumbs';
import ContextMenu from './ContextMenu';
import FolderGrid from './FolderGrid';

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-6 py-3 text-white shadow-lg ${type === 'success' ? 'bg-accent' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span>{message}</span>
    </div>
  );
};

const ModalShell = ({ isOpen, title, onClose, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full ${maxWidth} rounded-xl bg-white p-6 shadow-xl`} onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FolderModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim());
    setName('');
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Create Folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Folder Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Midterms"
            autoFocus
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-lg bg-accent px-4 py-2 text-white disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, itemType, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Delete ${itemType === 'folder' ? 'Folder' : 'Exam'}`} maxWidth="max-w-sm">
      <p className="mb-6 text-sm text-gray-600">
        Are you sure you want to delete <strong>{itemName}</strong>?
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50">
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </ModalShell>
  );
};

const ExamModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => (
  <ModalShell isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Exam Details' : 'Create Exam'}>
    <ExamForm
      initialData={initialData}
      onSubmit={onSubmit}
      onClose={onClose}
      allowMasterSelection={false}
      isSubmitting={isSubmitting}
    />
  </ModalShell>
);

const MasterExamsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRef = useRef(null);
  const currentParentId = useMemo(() => {
    const rawValue = searchParams.get('parent_id');
    if (!rawValue) return null;
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? null : parsed;
  }, [searchParams]);

  const [folderData, setFolderData] = useState({ parent_id: null, current_folder: null, breadcrumbs: [], items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  const [uploadExam, setUploadExam] = useState(null);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [rubricExam, setRubricExam] = useState(null);
  const [rubricQuestions, setRubricQuestions] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const loadFolderContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMasterExamFolderContents(currentParentId);
      setFolderData({
        parent_id: data?.parent_id ?? currentParentId,
        current_folder: data?.current_folder || null,
        breadcrumbs: Array.isArray(data?.breadcrumbs) ? data.breadcrumbs : [],
        items: Array.isArray(data?.items) ? data.items : [],
      });
    } catch (error) {
      showToast(error.message || 'Failed to load master exam items', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentParentId, showToast]);

  useEffect(() => {
    loadFolderContents();
  }, [loadFolderContents]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return folderData.items;
    return folderData.items.filter((item) => item.name?.toLowerCase().includes(query));
  }, [folderData.items, searchQuery]);

  const openFolder = useCallback((node) => {
    setSearchParams(node?.id ? { parent_id: String(node.id) } : {});
  }, [setSearchParams]);

  const handleCreateFolder = async (name) => {
    try {
      setIsSubmitting(true);
      await createMasterExamFolder({ name, parent_id: currentParentId });
      setShowFolderModal(false);
      showToast('Folder created successfully');
      await loadFolderContents();
    } catch (error) {
      showToast(error.message || 'Failed to create folder', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openExamBuilder = useCallback(async (nodeOrExam) => {
    const exam = nodeOrExam?.exam || nodeOrExam;
    if (!exam?.id) return;

    try {
      const questionsData = await getMasterExamQuestions(exam.id);
      setExistingQuestions(questionsData?.questions || []);
    } catch {
      setExistingQuestions([]);
    }

    setUploadExam(exam);
  }, []);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (pageRef.current && !pageRef.current.contains(event.target)) {
        setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
        setSelectedItemId(null);
      } else {
        setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
        if (renamingNodeId) {
          setRenamingNodeId(null);
          setRenameValue('');
        }
      }

      if (event.key === 'Enter' && selectedItemId && !renamingNodeId) {
        const selected = folderData.items.find((item) => item.id === selectedItemId);
        if (selected) {
          if (selected.type === 'folder') {
            openFolder(selected);
          } else {
            openExamBuilder(selected);
          }
        }
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedItemId && !renamingNodeId) {
        const selected = folderData.items.find((item) => item.id === selectedItemId);
        if (selected) {
          setDeleteTarget(selected);
        }
      }
    };

    window.addEventListener('click', handleClickAway);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('click', handleClickAway);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [folderData.items, openExamBuilder, openFolder, renamingNodeId, selectedItemId]);

  const handleCreateExam = async (formData) => {
    try {
      setIsSubmitting(true);
      const node = await createMasterExamNodeExam({
        name: formData.exam_name,
        parent_id: currentParentId,
        exam_mode: formData.exam_type === 'conduct' ? 'mcq' : 'evaluation',
        full_marks: formData.full_marks,
        is_active: formData.is_active,
        description: formData.description || null,
      });
      setShowExamModal(false);
      showToast('Exam created successfully');
      await loadFolderContents();
      if (node?.exam) {
        await openExamBuilder(node.exam);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExam = async (formData) => {
    try {
      setIsSubmitting(true);
      await updateMasterExam(editingExam.id, {
        exam_name: formData.exam_name,
        full_marks: formData.full_marks,
        exam_type: formData.exam_type,
        is_active: formData.is_active,
        description: formData.description || null,
      });
      setShowExamModal(false);
      setEditingExam(null);
      showToast('Exam details updated successfully');
      await loadFolderContents();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginRename = useCallback((item) => {
    setRenamingNodeId(item.id);
    setRenameValue(item.name || '');
    setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
  }, []);

  const submitRename = useCallback(async (cancel = false) => {
    if (cancel || !renamingNodeId || !renameValue.trim()) {
      setRenamingNodeId(null);
      setRenameValue('');
      return;
    }

    try {
      await renameMasterExamNode(renamingNodeId, renameValue.trim());
      showToast('Renamed successfully');
      setRenamingNodeId(null);
      setRenameValue('');
      await loadFolderContents();
    } catch (error) {
      showToast(error.message || 'Failed to rename item', 'error');
    }
  }, [loadFolderContents, renameValue, renamingNodeId, showToast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteMasterExamNode(deleteTarget.id);
      setDeleteTarget(null);
      showToast(`${deleteTarget.type === 'folder' ? 'Folder' : 'Exam'} deleted successfully`);
      await loadFolderContents();
    } catch (error) {
      showToast(error.message || 'Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenRubrics = async (item) => {
    const exam = item?.exam;
    if (!exam?.id) return;
    if (exam.exam_type === 'conduct') {
      showToast('MCQ master exams do not use rubrics.', 'error');
      return;
    }

    try {
      const questionData = await getMasterExamQuestions(exam.id);
      const questions = questionData?.questions || [];
      if (!questions.length) {
        showToast('Please add questions first', 'error');
        return;
      }
      setRubricQuestions(questions);
      setRubricExam(exam);
    } catch (error) {
      showToast(error.message || 'Failed to open rubric view', 'error');
    }
  };

  const handleUploadSubmit = async (examId, formData) => {
    const response = await fetch(`${API_BASE_URL}/master-exams/${examId}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    if (result.code !== 200 && result.code !== 201) {
      throw new Error(result.message || 'Upload failed');
    }

    await loadFolderContents();
    return result;
  };

  const breadcrumbs = useMemo(() => [{ id: null, name: 'Master Exams', type: 'root' }, ...folderData.breadcrumbs], [folderData.breadcrumbs]);
  const handleSelectItem = useCallback((item) => {
    setSelectedItemId(item.id);
  }, []);

  const handleOpenItem = useCallback((item) => {
    setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
    if (item.type === 'folder') {
      openFolder(item);
      return;
    }
    openExamBuilder(item);
  }, [openExamBuilder, openFolder]);

  const handleContextMenu = useCallback((event, item) => {
    event.preventDefault();
    setSelectedItemId(item.id);
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      item,
    });
  }, []);

  const handleContextMenuAction = useCallback((action) => {
    const item = contextMenu.item;
    setContextMenu((previous) => ({ ...previous, visible: false, item: null }));
    if (!item) return;

    if (action === 'open') {
      handleOpenItem(item);
      return;
    }
    if (action === 'rename') {
      beginRename(item);
      return;
    }
    if (action === 'delete') {
      setDeleteTarget(item);
    }
  }, [beginRename, contextMenu.item, handleOpenItem]);

  return (
    <div ref={pageRef} className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Exams</h1>
          <p className="mt-1 text-sm text-gray-500">Organize reusable exams in folders, then open the same exam builder flow inside each file.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>
          <button onClick={() => { setEditingExam(null); setShowExamModal(true); }} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">
            <FilePlus2 className="h-4 w-4" />
            New Exam
          </button>
        </div>
      </div>

      <Breadcrumbs
        items={breadcrumbs}
        onNavigate={(crumb) => openFolder(crumb.id ? crumb : null)}
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search this folder..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-14 w-14 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-800">This folder is empty</h3>
          <p className="mt-2 text-sm text-gray-500">Create a folder or an exam to start organizing your master content.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setShowFolderModal(true)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Create Folder
            </button>
            <button onClick={() => { setEditingExam(null); setShowExamModal(true); }} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white">
              Create Exam
            </button>
          </div>
        </div>
      ) : (
        <FolderGrid
          items={filteredItems}
          selectedItemId={selectedItemId}
          renamingNodeId={renamingNodeId}
          renameValue={renameValue}
          onRenameChange={setRenameValue}
          onRenameSubmit={submitRename}
          onSelect={handleSelectItem}
          onOpen={handleOpenItem}
          onContextMenu={handleContextMenu}
        />
      )}

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onAction={handleContextMenuAction}
      />

      <FolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSubmit={handleCreateFolder}
        isSubmitting={isSubmitting}
      />

      <ExamModal
        isOpen={showExamModal}
        onClose={() => { setShowExamModal(false); setEditingExam(null); }}
        onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
        initialData={editingExam}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
        itemType={deleteTarget?.type}
        isDeleting={isDeleting}
      />

      {uploadExam && (
        <UploadQnAModal
          isOpen={!!uploadExam}
          onClose={async () => {
            setUploadExam(null);
            setExistingQuestions([]);
            await loadFolderContents();
          }}
          examId={uploadExam.id}
          examType={uploadExam.exam_type === 'conduct' ? 'conduct' : 'evaluated'}
          onSubmit={handleUploadSubmit}
          existingQuestions={existingQuestions}
          apiPrefix="/master-exams"
        />
      )}

      {rubricExam && (
        <RubricModal
          isOpen={!!rubricExam}
          onClose={async () => {
            setRubricExam(null);
            setRubricQuestions([]);
            await loadFolderContents();
          }}
          examId={rubricExam.id}
          questions={rubricQuestions}
          apiPrefix="/master-exams"
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({ ...previous, show: false }))}
      />
    </div>
  );
};

export default MasterExamsList;
