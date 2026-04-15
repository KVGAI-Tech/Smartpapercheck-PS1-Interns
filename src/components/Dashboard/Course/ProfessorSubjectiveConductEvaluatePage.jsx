import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Save } from 'lucide-react';

import {
  evaluateSubjectiveConductSubmission,
  getSubjectiveConductSubmissionDetail,
  getSubjectiveConductSubmissions,
  publishConductExam,
} from './api';

const ProfessorSubjectiveConductEvaluatePage = () => {
  const navigate = useNavigate();
  const { courseId, examId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [listData, setListData] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [submissionDetail, setSubmissionDetail] = useState(null);
  const [draftGrades, setDraftGrades] = useState({});

  const loadSubmissions = async (nextSelectedId = null) => {
    const response = await getSubjectiveConductSubmissions(examId);
    const payload = response?.data || null;
    setListData(payload);
    const firstSubmissionId = nextSelectedId || payload?.submissions?.[0]?.submission_id || null;
    setSelectedSubmissionId(firstSubmissionId);
    return firstSubmissionId;
  };

  const loadSubmissionDetail = async (submissionId) => {
    if (!submissionId) {
      setSubmissionDetail(null);
      setDraftGrades({});
      return;
    }
    const response = await getSubjectiveConductSubmissionDetail(submissionId);
    const payload = response?.data || null;
    setSubmissionDetail(payload);
    const nextDraftGrades = {};
    for (const question of payload?.questions || []) {
      nextDraftGrades[question.id] = {
        marks_awarded: question.marks_awarded ?? '',
        feedback: question.feedback || '',
      };
    }
    setDraftGrades(nextDraftGrades);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const firstSubmissionId = await loadSubmissions();
        if (!cancelled) {
          await loadSubmissionDetail(firstSubmissionId);
        }
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

  useEffect(() => {
    if (!selectedSubmissionId) return;
    loadSubmissionDetail(selectedSubmissionId).catch((err) => {
      setError(err.message || 'Failed to load submission details.');
    });
  }, [selectedSubmissionId]);

  const scoredTotal = useMemo(
    () => (submissionDetail?.questions || []).reduce((sum, question) => {
      const nextValue = Number(draftGrades[question.id]?.marks_awarded || 0);
      return sum + (Number.isNaN(nextValue) ? 0 : nextValue);
    }, 0),
    [draftGrades, submissionDetail]
  );

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      await publishConductExam(examId);
      const refreshedSubmissionId = await loadSubmissions(selectedSubmissionId);
      await loadSubmissionDetail(refreshedSubmissionId);
    } catch (err) {
      setError(err.message || 'Failed to publish conduct exam.');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedSubmissionId || !submissionDetail) return;
    setSaving(true);
    setError('');
    try {
      const answers = submissionDetail.questions.map((question) => ({
        question_id: question.id,
        marks_awarded: Number(draftGrades[question.id]?.marks_awarded || 0),
        feedback: draftGrades[question.id]?.feedback || '',
      }));
      const response = await evaluateSubjectiveConductSubmission(selectedSubmissionId, answers);
      const payload = response?.data || null;
      setSubmissionDetail(payload);
      const refreshedSubmissionId = await loadSubmissions(selectedSubmissionId);
      await loadSubmissionDetail(refreshedSubmissionId);
    } catch (err) {
      setError(err.message || 'Failed to save conduct exam evaluation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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

      {loading && (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-accent" />
          <span className="text-sm text-gray-500">Loading conduct exam review...</span>
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm">
          <h2 className="text-lg font-semibold">Unable to load conduct exam review</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
              <p className="text-sm text-gray-500 mt-1">
                {(listData?.submissions || []).length} students
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
              {(listData?.submissions || []).map((submission) => {
                const isSelected = submission.submission_id === selectedSubmissionId;
                return (
                  <button
                    key={submission.submission_id}
                    type="button"
                    onClick={() => setSelectedSubmissionId(submission.submission_id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected ? 'border-accent bg-accent/10' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{submission.student_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{submission.roll_number || 'No roll number'}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                        submission.status === 'submitted' || submission.status === 'auto_submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {submission.status}
                      </span>
                      <span className="text-gray-500">
                        {submission.marks_obtained ?? '-'} / {listData?.exam?.full_marks ?? 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {!submissionDetail ? (
              <div className="p-10 text-center text-gray-500">
                Select a submission to start grading.
              </div>
            ) : (
              <>
                <div className="border-b border-gray-100 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{submissionDetail.student_name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {submissionDetail.roll_number || 'No roll number'} • {submissionDetail.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current Score</div>
                    <div className="text-2xl font-semibold text-accent">
                      {scoredTotal} / {submissionDetail.total_marks}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {(submissionDetail.questions || []).map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                        <span className="text-sm text-gray-500">{question.marks} marks</span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-gray-800">{question.question_text}</p>

                      {question.image_url && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                          <img src={question.image_url} alt={`Question ${index + 1}`} className="max-h-[280px] rounded-lg object-contain" />
                        </div>
                      )}

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Student Answer</p>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 min-h-[140px]">
                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                              {question.text_answer || 'No text answer submitted.'}
                            </p>
                            {question.image_answer_url && (
                              <img
                                src={question.image_answer_url}
                                alt={`Student answer ${index + 1}`}
                                className="mt-3 max-h-[220px] rounded-lg object-contain"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Marks Awarded
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={question.marks}
                              step="0.5"
                              value={draftGrades[question.id]?.marks_awarded ?? ''}
                              onChange={(e) => setDraftGrades((prev) => ({
                                ...prev,
                                [question.id]: {
                                  ...(prev[question.id] || {}),
                                  marks_awarded: e.target.value,
                                },
                              }))}
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-accent focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Feedback
                            </label>
                            <textarea
                              rows={5}
                              value={draftGrades[question.id]?.feedback ?? ''}
                              onChange={(e) => setDraftGrades((prev) => ({
                                ...prev,
                                [question.id]: {
                                  ...(prev[question.id] || {}),
                                  feedback: e.target.value,
                                },
                              }))}
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-accent focus:outline-none"
                              placeholder="Add feedback for this answer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveEvaluation}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Evaluation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorSubjectiveConductEvaluatePage;
