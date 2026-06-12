/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Layers,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  listExamDocuments,
  listMasterExams,
  listProfessorCourses,
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

function CourseWorkspaceCard({ course, workspacesCount = 0, finalizedCount = 0, onOpen }) {
  const statusLabel = workspacesCount > 0 ? `${workspacesCount} Workspaces` : 'Empty';
  const statusTone = workspacesCount > 0
    ? 'border-emerald-200 bg-emerald-50/90 text-emerald-700'
    : 'border-sky-100 bg-white/80 text-slate-500';
  const courseSubtitle = course.semester_code || course.semester || course.session || course.academic_year || 'Course Workspaces';
  const actionLabel = 'View Workspaces';

  return (
    <article className="group relative flex min-h-[230px] flex-col overflow-hidden rounded-[20px] border border-[#d9e8e4] bg-[linear-gradient(180deg,#fbfefd_0%,#ffffff_52%,#f4faf8_100%)] p-5 shadow-[0_18px_48px_rgba(16,72,62,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#b8d6ce] hover:shadow-[0_24px_60px_rgba(16,72,62,0.14)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(205,236,229,0.55)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6e8f89]">
            {course.course_code || 'Course'}
          </div>
        </div>
        <div className={`relative z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur ${statusTone}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${workspacesCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {statusLabel}
        </div>
      </div>

      <div className="relative z-10 mt-4 min-w-0 border-b border-[#e5f0ec] pb-4">
        <h3 className="line-clamp-2 text-[20px] font-semibold tracking-tight text-[#082038] md:text-[22px]">
          {course.course_name || course.course_code || 'Untitled Course'}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#5c7281]">
          {courseSubtitle}
        </p>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-1 gap-3 rounded-[16px] border border-[#dcebe6] bg-white/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86a39b]">Published Papers</div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#103b36]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {finalizedCount}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-4 pt-4">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#86a39b]">Total Workspaces</div>
          <div className="mt-2 text-sm font-medium leading-5 text-[#365955]">
            {workspacesCount} workspace{workspacesCount !== 1 ? 's' : ''} available
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#1f7a6b,#114d46)] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(17,77,70,0.22)] transition hover:scale-[1.01] hover:shadow-[0_18px_34px_rgba(17,77,70,0.28)]"
        >
          <Layers className="h-4 w-4" />
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

const MasterExamsList = () => {
  const [courses, setCourses] = useState([]);
  const [documents, setDocuments] = useState({ workspaces: [], finalized: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [creatingCourseId, setCreatingCourseId] = useState(null); // Unused now, kept for minimal diff
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

  const workspacesCountByCourseId = useMemo(() => {
    const map = new Map();
    (documents.workspaces || []).forEach((workspace) => {
      if (workspace.published_master_exam_id) return;
      const meta = getCourseWorkspaceMeta(workspace);
      const courseId = meta.courseId ?? meta.course_id;
      if (!courseId) return;
      const key = String(courseId);
      map.set(key, (map.get(key) || 0) + 1);
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

  // Removed handleCreateCourseWorkspace and handleDelete as they moved to CourseWorkspacesList.jsx

  return (
    <div className="mx-auto w-full max-w-[1360px] px-5 py-6 lg:px-8">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const count = workspacesCountByCourseId.get(String(course.id)) || 0;
            return (
              <div key={course.id} className="group relative">
                <CourseWorkspaceCard
                  course={course}
                  workspacesCount={count}
                  finalizedCount={finalizedCountByCourseId.get(String(course.id)) || 0}
                  onOpen={() => navigate(`/master-exams/course/${course.id}`, { state: { courseId: course.id, courseName: course.course_name, courseCode: course.course_code } })}
                />
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
