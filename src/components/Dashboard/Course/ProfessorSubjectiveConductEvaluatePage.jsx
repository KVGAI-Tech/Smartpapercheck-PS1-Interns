import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

import {
  getSubjectiveConductSubmissions,
  publishConductExam,
} from './api';

const StudentEvaluationLoader = React.lazy(() => import('./modals/StudentEvaluationLoader'));

const ProfessorSubjectiveConductEvaluatePage = () => {
  const navigate = useNavigate();
  const { courseId, examId } = useParams();

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [listData, setListData] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showEvaluationDetail, setShowEvaluationDetail] = useState(false);

  const loadSubmissions = async () => {
    const response = await getSubjectiveConductSubmissions(examId);
    const payload = response?.data || null;
    setListData(payload);
    return payload;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await loadSubmissions();
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load conduct exam submissions.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      await publishConductExam(examId);
      await loadSubmissions();
    } catch (err) {
      setError(err.message || 'Failed to publish conduct exam.');
    } finally {
      setPublishing(false);
    }
  };

  const handleEvaluateSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowEvaluationDetail(true);
  };

  const handleCloseEvaluation = () => {
    setShowEvaluationDetail(false);
    setSelectedSubmission(null);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationDetail(false);
    setSelectedSubmission(null);
    // Reload submissions to show updated marks
    await loadSubmissions();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => navigate(`/courses/${courseId}`, { state: { activeTab: 'exams' } })}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">
            {listData?.exam?.exam_name || 'Conduct Exam Review'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review subjective conduct submissions, award marks, and leave feedback question by question.
          </p>
        </div>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/15 disabled:opacity-50"
        >
          {publishing ? 'Publishing...' : 'Publish Exam'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
          <span className="text-sm text-gray-500">Loading conduct exam review...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-lg font-semibold">Unable to load conduct exam review</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && !error && (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900">Submissions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {(listData?.submissions || []).length} students • Click on a submission to evaluate
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(listData?.submissions || []).map((submission) => (
                  <tr key={submission.submission_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{submission.roll_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        submission.status === 'submitted' || submission.status === 'auto_submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.marks_obtained !== null && submission.marks_obtained !== undefined
                          ? `${submission.marks_obtained} / ${listData?.exam?.full_marks ?? 0}`
                          : 'Not evaluated'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEvaluateSubmission(submission)}
                        className="text-accent hover:text-accent/80 font-medium transition"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(listData?.submissions || []).length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No submissions yet. Students haven't submitted this exam.
            </div>
          )}
        </div>
      )}

      {/* Evaluation Detail Modal */}
      {showEvaluationDetail && selectedSubmission && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
            </div>
          }
        >
          <StudentEvaluationLoader
            examId={parseInt(examId)}
            enrollmentId={selectedSubmission.enrollment_id}
            onClose={handleCloseEvaluation}
            onComplete={handleEvaluationComplete}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ProfessorSubjectiveConductEvaluatePage;
