/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  FilePlus2,
  Loader2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  createExamDocument,
  createSourceFolder,
  deleteExamDocument,
  listExamDocuments,
  listMasterExams,
  listProfessorCourses,
  updateExamDocument,
} from './examDocumentApi';

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

function CourseWorkspaceCard({ course, workspace, onOpen, onCreate, creating }) {
  const statusLabel = workspace ? 'Ready' : 'Empty';
  const statusTone = workspace ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200';
  const courseSubtitle = course.semester_code || course.semester || course.session || course.academic_year || 'Workspace';

  return (
    <article className="group flex min-h-[190px] flex-col rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {course.course_code || 'Course'}
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${workspace ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {statusLabel}
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <h3 className="line-clamp-2 text-[22px] font-semibold tracking-tight text-slate-950">
          {course.course_name || course.course_code || 'Untitled Course'}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {courseSubtitle}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <button
          type="button"
          onClick={workspace ? onOpen : onCreate}
          disabled={creating}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
          {workspace ? 'Open Workspace' : 'Create Workspace'}
        </button>
      </div>
    </article>
  );
}

const MasterExamsList = () => {
  const [courses, setCourses] = useState([]);
  const [documents, setDocuments] = useState({ workspaces: [], finalized: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [creatingCourseId, setCreatingCourseId] = useState(null);
  const navigate = useNavigate();

  const loadWorkspaceDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [courseList, workspaces, finalized] = await Promise.all([
        listProfessorCourses(),
        listExamDocuments(),
        listMasterExams(),
      ]);

      setCourses(Array.isArray(courseList) ? courseList : []);
      setDocuments({
        workspaces: Array.isArray(workspaces) ? workspaces : [],
        finalized: Array.isArray(finalized) ? finalized : [],
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load course workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceDashboard();
  }, [loadWorkspaceDashboard]);

  const workspacesByCourseId = useMemo(() => {
    const map = new Map();
    (documents.workspaces || []).forEach((workspace) => {
      if (workspace.published_master_exam_id) return;
      const meta = getCourseWorkspaceMeta(workspace);
      const courseId = meta.courseId ?? meta.course_id;
      if (!courseId) return;
      const key = String(courseId);
      const current = map.get(key);
      if (!current || new Date(workspace.updated_at || workspace.created_at || 0) > new Date(current.updated_at || current.created_at || 0)) {
        map.set(key, workspace);
      }
    });
    return map;
  }, [documents.workspaces]);

  const finalizedCountByCourseId = useMemo(() => {
    const map = new Map();
    (documents.finalized || []).forEach((exam) => {
      const courseId = exam.course_id || exam.courseId;
      if (!courseId) return;
      const key = String(courseId);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [documents.finalized]);

  const handleCreateCourseWorkspace = async (course) => {
    try {
      setCreatingCourseId(course.id);
      const created = await createExamDocument(buildCourseWorkspacePayload(course));
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
        title: `${course.course_name || course.course_code} Question Workspace`,
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

      toast.success('Course question workspace created');
      navigate(`/master-exams/${updated.id}?courseId=${course.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create course workspace');
    } finally {
      setCreatingCourseId(null);
    }
  };

  const handleDelete = async (event, docId, title) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Archive "${title || 'Untitled Workspace'}"?`);
    if (!confirmed) return;

    try {
      await deleteExamDocument(docId);
      setDocuments((prev) => ({
        ...prev,
        workspaces: prev.workspaces.filter((item) => item.id !== docId),
      }));
      toast.success('Workspace archived');
    } catch (err) {
      toast.error(err.message || 'Failed to archive workspace');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-6 lg:px-8">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const workspace = workspacesByCourseId.get(String(course.id));
            return (
              <div key={course.id} className="group relative">
                <CourseWorkspaceCard
                  course={course}
                  workspace={workspace}
                  creating={creatingCourseId === course.id}
                  onCreate={() => handleCreateCourseWorkspace(course)}
                  onOpen={() => navigate(`/master-exams/${workspace.id}?courseId=${course.id}`)}
                />
                {workspace && (
                  <button
                    type="button"
                    onClick={(event) => handleDelete(event, workspace.id, workspace.title)}
                    className="absolute right-4 top-4 hidden rounded-full border border-rose-100 bg-white p-2 text-rose-500 shadow-sm hover:bg-rose-50 md:group-hover:block"
                    title="Archive workspace"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Archive className="mx-auto mb-3 h-9 w-9 text-slate-300" />
          <h3 className="text-base font-semibold text-slate-900">No assigned courses found</h3>
          <p className="mt-2 text-sm text-slate-500">Courses assigned to this professor will appear here as question workspaces.</p>
        </div>
      )}
    </div>
  );
};

export default MasterExamsList;
