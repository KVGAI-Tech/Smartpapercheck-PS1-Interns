import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  FilePlus2,
  Loader2,
  Trash2,
  Edit2,
  Check,
  X,
  LayoutGrid,
  List,
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  createExamDocument,
  createSourceFolder,
  deleteExamDocument,
  listExamDocuments,
  listProfessorCourses,
  fetchExamDocument,
  fetchWorkspaceCards,
  fetchMasterExamById,
  fetchMasterExamQuestions
} from './examDocumentApi';
import SmartPaperPreview from './SmartPaperPreview';
import { normalizeMasterExamCard } from './masterExamCardSchema';
import { normalizeLegacySections } from './paperDocumentBuilder';

const DEFAULT_SOURCE_FOLDERS = [
  { name: 'Previous Year Papers', folder_type: 'previous_year' },
  { name: 'Mid Sem', folder_type: 'mid_sem' },
  { name: 'End Sem', folder_type: 'end_sem' },
  { name: 'Unit Tests', folder_type: 'unit_test' },
  { name: 'Assignments', folder_type: 'assignment' },
  { name: 'Practice Sets', folder_type: 'practice' },
  { name: 'Custom Imports', folder_type: 'custom' },
];

const getCourseWorkspaceMeta = (document = {}) => (
  document?.builder_layout_json?.questionWorkspace
  || document?.content_json?.attrs?.questionWorkspace
  || document?.content_json?.questionWorkspace
  || {}
);

const buildCourseWorkspacePayload = (course) => ({
  title: `${course.course_name || course.course_code || 'Course'} Question Workspace`,
  content: '',
  content_json: {
    type: 'doc',
    attrs: {
      questionWorkspace: {
        courseId: course.id,
        courseCode: course.course_code,
        courseName: course.course_name,
      },
    },
    content: [{ type: 'paragraph' }],
  },
});

function WorkspaceCard({ workspace, course, onOpen, onDelete, onRename, onPreview }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(workspace.title || 'Untitled Workspace');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRename = async () => {
    if (!editTitle.trim() || editTitle === workspace.title) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    await onRename(workspace.id, editTitle);
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const isFinalized = !!workspace.published_master_exam_id;
  const statusLabel = isFinalized ? 'Finalized' : 'Ready';
  const statusTone = isFinalized ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700';
  const updatedLabel = workspace.updated_at
    ? new Date(workspace.updated_at).toLocaleDateString()
    : null;

  return (
    <article className="group relative flex min-h-[200px] flex-col rounded-2xl border border-[#d9e8e4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#b8d6ce] hover:shadow-md">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6e8f89]">
              {course.course_code || 'Course'}
            </div>
            <div className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isFinalized ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              {statusLabel}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
            className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-emerald-50 hover:text-emerald-600 group-hover:opacity-100"
            title="Preview workspace"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(workspace.id, workspace.title);
            }}
            className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
            title="Archive workspace"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 rounded-md border border-[#dcebe6] px-2 py-1 text-lg font-semibold text-[#082038] focus:border-[#86a39b] focus:outline-none focus:ring-1 focus:ring-[#86a39b]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditTitle(workspace.title || 'Untitled Workspace');
                  setIsEditing(false);
                }
              }}
            />
            <button
              onClick={handleRename}
              disabled={isSubmitting}
              className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                setEditTitle(workspace.title || 'Untitled Workspace');
                setIsEditing(false);
              }}
              disabled={isSubmitting}
              className="rounded-md bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="group/title flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-bold text-[#082038]">
              {workspace.title || 'Untitled Workspace'}
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-1 flex-shrink-0 text-[#86a39b] opacity-0 transition-opacity hover:text-[#365955] group-hover/title:opacity-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Last Updated</div>
          <div className="text-sm font-medium text-slate-600">
            {updatedLabel || 'No activity'}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-[#f0f7f5] px-4 py-2 text-sm font-semibold text-[#1f7a6b] transition-colors hover:bg-[#e1f0ec]"
        >
          Open Workspace
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function WorkspaceListItem({ workspace, course, onOpen, onDelete, onRename, onPreview }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(workspace.title || 'Untitled Workspace');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRename = async () => {
    if (!editTitle.trim() || editTitle === workspace.title) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    await onRename(workspace.id, editTitle);
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const isFinalized = !!workspace.published_master_exam_id;
  const statusLabel = isFinalized ? 'Finalized' : 'Ready';
  const statusTone = isFinalized ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700';
  const updatedLabel = workspace.updated_at
    ? new Date(workspace.updated_at).toLocaleDateString()
    : null;

  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-[#d9e8e4] bg-white p-4 transition-all hover:border-[#b8d6ce] hover:shadow-sm">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <FileText className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 rounded-md border border-[#dcebe6] px-2 py-1 text-base font-semibold text-[#082038] focus:border-[#86a39b] focus:outline-none focus:ring-1 focus:ring-[#86a39b]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setEditTitle(workspace.title || 'Untitled Workspace');
                    setIsEditing(false);
                  }
                }}
              />
              <button
                onClick={handleRename}
                disabled={isSubmitting}
                className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setEditTitle(workspace.title || 'Untitled Workspace');
                  setIsEditing(false);
                }}
                disabled={isSubmitting}
                className="rounded-md bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="group/title flex items-center gap-2">
              <h3 className="truncate text-base font-bold text-[#082038]">
                {workspace.title || 'Untitled Workspace'}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#86a39b] opacity-0 transition-opacity hover:text-[#365955] group-hover/title:opacity-100"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="mt-1 flex items-center gap-3 text-sm text-[#5c7281]">
            <span className="font-medium text-[#6e8f89]">{course.course_code || 'Course'}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Last Updated: {updatedLabel || 'No activity'}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isFinalized ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
          className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-emerald-50 hover:text-emerald-600 group-hover:opacity-100"
          title="Preview workspace"
        >
          <Eye className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(workspace.id, workspace.title);
          }}
          className="rounded-lg p-2 text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
          title="Archive workspace"
        >
          <Trash2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-[#f0f7f5] px-4 py-2.5 text-sm font-semibold text-[#1f7a6b] transition-colors hover:bg-[#e1f0ec]"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function WorkspacePreviewModal({ workspaceId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const doc = await fetchExamDocument(workspaceId);
        let cards = [];
        let sections = [];
        let builderLayout = {};
        let paperType = 'standard';
        let paperSettings = {};

        if (doc.published_master_exam_id) {
          const exam = await fetchMasterExamById(doc.published_master_exam_id);
          
          let structureSnapshot = {};
          if (typeof exam.structure_snapshot_json === 'string') {
            try { structureSnapshot = JSON.parse(exam.structure_snapshot_json); } catch(e) {}
          } else if (exam.structure_snapshot_json) {
            structureSnapshot = exam.structure_snapshot_json;
          }
          
          let builderSnapshot = {};
          if (typeof exam.builder_snapshot_json === 'string') {
            try { builderSnapshot = JSON.parse(exam.builder_snapshot_json); } catch(e) {}
          } else if (exam.builder_snapshot_json) {
            builderSnapshot = exam.builder_snapshot_json;
          }

          // Fetch cards via API to get presigned URLs for images
          const questionsAPI = await fetchMasterExamQuestions(doc.published_master_exam_id);
          const rawCardsAPI = questionsAPI?.questions || questionsAPI || [];
          let cards = [];
          
          if (structureSnapshot.cards && structureSnapshot.cards.length > 0) {
            cards = structureSnapshot.cards.map((card, i) => {
              const mongoQuestion = rawCardsAPI.find(q => q.original_card_id == card.id) || rawCardsAPI[i];
              if (mongoQuestion) {
                 if (mongoQuestion.image_urls && mongoQuestion.image_urls.length > 0) {
                    card.image_urls = mongoQuestion.image_urls;
                 }
                 if (card.parsed_metadata && card.parsed_metadata.options && mongoQuestion.mcq_options) {
                    card.parsed_metadata.options = card.parsed_metadata.options.map((opt, optIndex) => {
                       const mOpt = mongoQuestion.mcq_options[optIndex];
                       if (mOpt && mOpt.option_image_url) {
                          opt.option_image_url = mOpt.option_image_url;
                       }
                       return opt;
                    });
                 }
                 if (mongoQuestion.model_answer && typeof mongoQuestion.model_answer === 'string' && mongoQuestion.model_answer.includes('https://')) {
                    if (!card.parsed_metadata) card.parsed_metadata = {};
                    card.parsed_metadata.reference_answer = mongoQuestion.model_answer;
                 }
                 if (mongoQuestion.question_text && typeof mongoQuestion.question_text === 'string' && mongoQuestion.question_text.includes('https://')) {
                    card.question_body = mongoQuestion.question_text;
                 }
              }
              return normalizeMasterExamCard(card);
            });
          } else if (rawCardsAPI && rawCardsAPI.length > 0) {
            cards = rawCardsAPI.map((q, i) => normalizeMasterExamCard({
              id: q.original_card_id || q.id || `q-${i}`,
              question_body: q.question_text || '',
              marks: q.max_marks || 0,
              question_type: q.question_type || 'Subjective',
              image_urls: q.image_urls || [],
              paper_section_id: q.paper_section_id || null,
              parsed_metadata: {
                options: (q.mcq_options || []).map(opt => ({
                  id: opt.id || `opt-${Math.random()}`,
                  key: opt.key || '',
                  text: opt.text || '',
                  option_image_url: opt.option_image_url || ''
                })),
                correct_option_ids: q.correct_option_ids || [],
                reference_answer: q.model_answer || '',
                rubrics: q.rubric_items || []
              }
            }));
          }
          
          const builderLayout = builderSnapshot.builder_layout_json || {};
          
          const savedSections = structureSnapshot.sections || [];
          const sections = normalizeLegacySections(savedSections, cards);
          const paperType = structureSnapshot.paper_type || exam.paper_type || 'standard';
          
          setPreviewData({
            type: 'smart',
            title: doc.title,
            cards,
            sections,
            builderLayout,
            paperType,
            paperSettings: builderSnapshot.paper_settings_json || {}
          });
        } else {
          const rawCards = await fetchWorkspaceCards(workspaceId);
          const cards = rawCards.map(normalizeMasterExamCard);
          
          let builderLayout = {};
          if (typeof doc.builder_layout_json === 'string') {
            try { builderLayout = JSON.parse(doc.builder_layout_json); } catch(e) {}
          } else if (doc.builder_layout_json) {
            builderLayout = doc.builder_layout_json;
          }
          
          let parsedMetadata = {};
          if (typeof doc.parsed_metadata === 'string') {
            try { parsedMetadata = JSON.parse(doc.parsed_metadata); } catch(e) {}
          } else if (doc.parsed_metadata) {
            parsedMetadata = doc.parsed_metadata;
          }
          
          const savedSections = builderLayout.paperStructure?.sections || parsedMetadata.sections || [];
          const sections = normalizeLegacySections(savedSections, cards);
          const paperType = doc.paper_type || 'standard';
          
          setPreviewData({
            type: 'smart',
            title: doc.title,
            cards,
            sections,
            builderLayout,
            paperType,
            paperSettings: {}
          });
        }
      } catch (err) {
        toast.error('Failed to load preview');
      } finally {
        setLoading(false);
      }
    }
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  if (!workspaceId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8">
      <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{previewData?.title || 'Preview Workspace'}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-[#f3f5f2] relative">
          {loading ? (
             <div className="flex h-full items-center justify-center flex-col gap-3">
               <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
               <div className="text-sm font-medium text-slate-500">Loading preview...</div>
             </div>
          ) : previewData?.type === 'smart' ? (
             <SmartPaperPreview
                title={previewData.title}
                cards={previewData.cards}
                sections={previewData.sections}
                builderLayout={previewData.builderLayout}
                paperType={previewData.paperType}
                paperSettings={previewData.paperSettings}
             />
          ) : (
             <div className="p-8 text-center text-slate-500">Failed to load preview</div>
          )}
        </div>
      </div>
    </div>
  );
}

const CourseWorkspacesList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [previewWorkspaceId, setPreviewWorkspaceId] = useState(null);

  const loadCourseAndWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const [courseList, allWorkspaces] = await Promise.all([
        listProfessorCourses(),
        listExamDocuments(),
      ]);

      const currentCourse = courseList.find((c) => String(c.id) === String(courseId));
      if (!currentCourse) {
        toast.error('Course not found');
        navigate('/master-exams');
        return;
      }
      setCourse(currentCourse);

      const courseWorkspaces = allWorkspaces.filter((workspace) => {
        const meta = getCourseWorkspaceMeta(workspace);
        const wsCourseId = meta.courseId ?? meta.course_id;
        return String(wsCourseId) === String(courseId);
      });

      // Sort by updated_at descending
      courseWorkspaces.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
      
      setWorkspaces(courseWorkspaces);
    } catch (err) {
      toast.error(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    loadCourseAndWorkspaces();
  }, [loadCourseAndWorkspaces]);

  const handleCreateWorkspace = async () => {
    try {
      setIsCreating(true);
      const title = `${course.course_code || 'Course'} Workspace - ${new Date().toLocaleDateString()}`;
      
      const payload = buildCourseWorkspacePayload(course);
      payload.title = title;
      
      const created = await createExamDocument(payload);
      const builderLayout = {
        ...(created.builder_layout_json || {}),
        questionWorkspace: {
          courseId: course.id,
          courseCode: course.course_code,
          courseName: course.course_name,
          workspaceType: 'course_question_workspace',
        },
        paperStructure: {
          sections: [
            { id: 'section-1', title: 'Section A', instructions: '', cardIds: [], parsed_metadata: {} },
          ],
        },
      };
      
      const updated = await updateExamDocument(created.id, {
        title,
        builder_layout_json: builderLayout,
      });

      await Promise.all(DEFAULT_SOURCE_FOLDERS.map((folder) => createSourceFolder(updated.id, {
        ...folder,
        course_name: course.course_name,
        metadata_json: {
          course_id: course.id,
          course_code: course.course_code,
        },
      }).catch(() => null)));

      toast.success('Workspace created successfully');
      // Reload the list
      await loadCourseAndWorkspaces();
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameWorkspace = async (docId, newTitle) => {
    try {
      await updateExamDocument(docId, { title: newTitle });
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.id === docId ? { ...ws, title: newTitle } : ws))
      );
      toast.success('Workspace renamed');
    } catch (err) {
      toast.error(err.message || 'Failed to rename workspace');
    }
  };

  const handleDeleteWorkspace = async (docId, title) => {
    const confirmed = window.confirm(`Archive "${title || 'Untitled Workspace'}"?`);
    if (!confirmed) return;

    try {
      await deleteExamDocument(docId);
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== docId));
      toast.success('Workspace archived');
    } catch (err) {
      toast.error(err.message || 'Failed to archive workspace');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/master-exams')}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#6e8f89] transition-colors hover:text-[#365955]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#082038] md:text-3xl">
            {course.course_name}
          </h1>
          <p className="mt-1 text-sm text-[#5c7281]">
            {course.course_code} • Question Workspaces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-[#d9e8e4] bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 transition-colors ${
                viewMode === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isCreating}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[linear-gradient(135deg,#1f7a6b,#114d46)] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            Create Workspace
          </button>
        </div>
      </div>

      {workspaces.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                course={course}
                onOpen={() => navigate(`/master-exams/${workspace.id}?courseId=${course.id}`)}
                onPreview={() => setPreviewWorkspaceId(workspace.id)}
                onDelete={handleDeleteWorkspace}
                onRename={handleRenameWorkspace}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {workspaces.map((workspace) => (
              <WorkspaceListItem
                key={workspace.id}
                workspace={workspace}
                course={course}
                onOpen={() => navigate(`/master-exams/${workspace.id}?courseId=${course.id}`)}
                onPreview={() => setPreviewWorkspaceId(workspace.id)}
                onDelete={handleDeleteWorkspace}
                onRename={handleRenameWorkspace}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Archive className="mx-auto mb-3 h-9 w-9 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No workspaces yet</h3>
          <p className="mt-2 text-sm text-slate-500">Create a new workspace to start managing questions for this course.</p>
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isCreating}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
            Create First Workspace
          </button>
        </div>
      )}
      
      {previewWorkspaceId && (
        <WorkspacePreviewModal 
          workspaceId={previewWorkspaceId} 
          onClose={() => setPreviewWorkspaceId(null)} 
        />
      )}
    </div>
  );
};

export default CourseWorkspacesList;

