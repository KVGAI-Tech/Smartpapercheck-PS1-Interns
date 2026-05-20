import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, FileText, Trash2, Edit3, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  listExamDocuments,
  listMasterExams,
  createExamDocument,
  deleteExamDocument
} from './examDocumentApi';
import { API_BASE_URL } from '../../../BaseURL';
import { getPaperTypeMeta } from './paperBuilderSchema';

const MASTER_EXAM_WHITELIST = [
  "pareta7atharv@gmail.com",
  "testprof12345@gmail.com",
  "anubhav@kvgai.com",
  "anubhav.elhence@smart-qna.com",
  "anubhav.elhence@pilani.bits-pilani.ac.in",
  "rishi.garg@aiqwip.com",
  "rishigarg2503@gmail.com",
  "nidesh.ahilan@gmail.com",
  "ahilan.nidesh@gmail.com",
  "nidesh.ahilan.1234@gmail.com",
  "dhanvantg07@gmail.com",
  "dhanvant006@gmail.com",
  "dhanvantdgrt@gmail.com",
  "tomaluter@gmail.com"
];

const MasterExamsList = () => {
  const [documents, setDocuments] = useState({ workspaces: [], finalized: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const body = await res.json();
          const email = body?.data?.email?.toLowerCase()?.trim();
          if (email && !MASTER_EXAM_WHITELIST.includes(email)) {
            setIsAuthorized(false);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    checkAuth();
  }, []);

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const [workspaces, finalized] = await Promise.all([
        listExamDocuments(),
        listMasterExams()
      ]);
      
      // Merge them into a single list or handle separately
      // For now, let's keep workspaces that AREN'T finalized yet separately or mark them
      setDocuments({
        workspaces: Array.isArray(workspaces) ? workspaces : [],
        finalized: Array.isArray(finalized) ? finalized : []
      });
    } catch (err) {
      toast.error('Failed to load library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      const newDoc = await createExamDocument({
        title: 'Untitled Document',
        content: '',
        content_json: {
          type: 'doc',
          content: [{ type: 'paragraph' }],
        },
      });
      toast.success('Document created successfully');
      navigate(`/master-exams/${newDoc.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create document');
      setIsCreating(false);
    }
  };

  const handleDelete = async (e, docId, title) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${title || 'Untitled Document'}"?`);
    if (!confirmed) return;

    try {
      await deleteExamDocument(docId);
      setDocuments(prev => ({
        ...prev,
        workspaces: prev.workspaces.filter(d => d.id !== docId)
      }));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m-3 3h10a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
          <p className="text-sm text-slate-500">You do not have access to the Master Exams library workspace. Please contact support or your institution administrator for permissions.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">SmartPaperCheck Library</h2>
          <p className="mt-1 text-sm text-slate-500">
            Build professional question papers with document flow, visual composition, and reusable extracted cards.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-accent/90 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <FilePlus2 className="h-5 w-5" />}
          New Paper
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (documents.workspaces?.length === 0 && documents.finalized?.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          {/* ... (empty state content) ... */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
            <FileText className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Your library is empty</h3>
          <p className="mt-2 mb-6 max-w-sm text-sm text-slate-500">
            Start by creating a new paper or uploading documents to build your master exam database.
          </p>
          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white shadow hover:opacity-90"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            Create New Paper
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Finalized Master Exams Section */}
          {documents.finalized?.length > 0 && (
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                <FileText className="h-4 w-4" />
                Finalized Master Exams
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {documents.finalized.map((exam) => {
                  const paperType = getPaperTypeMeta(exam.paper_type);
                  return (
                  <div
                    key={exam.id}
                    className="group relative flex flex-col rounded-[12px] border border-green-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-green-300"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 ring-1 ring-green-100 transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          Finalized
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {paperType.shortLabel}
                        </span>
                      </div>
                    </div>
                    <h4 className="mb-2 line-clamp-2 text-base font-semibold text-slate-900">
                      {exam.exam_name || exam.title}
                    </h4>
                    <p className="mb-4 text-xs text-slate-500 line-clamp-1">
                      {exam.full_marks} Marks • {paperType.label}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : 'Ready'}
                      </div>
                      <span className="text-green-600 font-semibold">Locked 🔒</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Draft Workspaces Section */}
          {documents.workspaces?.filter(d => !d.published_master_exam_id).length > 0 && (
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                <Edit3 className="h-4 w-4" />
                Draft Workspaces
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {documents.workspaces
                  .filter(d => !d.published_master_exam_id)
                  .map((doc) => {
                  const paperType = getPaperTypeMeta(doc.paper_type);
                  return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/master-exams/${doc.id}`)}
                    className="group relative flex cursor-pointer flex-col rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-accent ring-1 ring-slate-100 transition-colors group-hover:bg-accent/5">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                           Draft
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          {paperType.shortLabel}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, doc.id, doc.title)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="mb-2 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-accent">
                      {doc.title || 'Untitled Document'}
                    </h4>
                    <p className="mb-4 text-xs text-slate-500 line-clamp-2">
                      {paperType.label} • Continue building sections, cards, and document layout before locking the paper.
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'Just now'}
                      </div>
                      <span className="flex items-center gap-1 text-accent opacity-0 transition-opacity group-hover:opacity-100">
                        <Edit3 className="h-3.5 w-3.5" /> Continue Assembly
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MasterExamsList;
