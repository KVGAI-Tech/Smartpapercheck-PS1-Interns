import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Loader, Send } from 'lucide-react';
import { examsApi } from './Student_api';

const ConductExamSession = ({ examId, courseId, enrollmentId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedExamId = examId || params.id;
  const resolvedCourseId = courseId || params.courseId;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await examsApi.getConductExamQuestions(resolvedExamId);
        if (response?.code !== 200 || !response?.data) {
          throw new Error(response?.message || 'Unable to load portal MCQ exam.');
        }

        const payload = response.data;
        setExamData(payload);

        const nextAnswers = {};
        for (const question of payload.questions || []) {
          nextAnswers[question.question_number] = {
            selected_option_id: question.selected_option_id || '',
            reason_text: question.reason_text || '',
          };
        }
        setAnswers(nextAnswers);
      } catch (err) {
        setError(err.message || 'Unable to load portal MCQ exam.');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedExamId) {
      load();
    }
  }, [resolvedExamId]);

  const attemptedCount = useMemo(
    () =>
      Object.values(answers).filter(
        (answer) => answer && String(answer.selected_option_id || '').trim()
      ).length,
    [answers]
  );

  const handleOptionChange = (questionNumber, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: {
        ...(prev[questionNumber] || {}),
        selected_option_id: optionId,
      },
    }));
  };

  const handleClearSelection = (questionNumber) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: {
        ...(prev[questionNumber] || {}),
        selected_option_id: '',
      },
    }));
  };

  const handleReasonChange = (questionNumber, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: {
        ...(prev[questionNumber] || {}),
        reason_text: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const attemptedAnswers = (examData?.questions || []).map((question) => ({
        question,
        answer: answers[question.question_number] || {},
      }));

      const missingReasonQuestion = attemptedAnswers.find(({ question, answer }) => {
        const selectedOptionId = String(answer.selected_option_id || '').trim();
        const reasonText = String(answer.reason_text || '').trim();
        return question.reason_required && selectedOptionId && !reasonText;
      });

      if (missingReasonQuestion) {
        throw new Error(`Question ${missingReasonQuestion.question.question_number} requires a reason before submission.`);
      }

      const normalizedAnswers = (examData?.questions || [])
        .map((question) => {
          const answer = answers[question.question_number] || {};
          const selectedOptionId = String(answer.selected_option_id || '').trim();
          const reasonText = String(answer.reason_text || '').trim();
          if (!selectedOptionId) return null;
          return {
            question_number: question.question_number,
            selected_option_id: selectedOptionId,
            ...(reasonText ? { reason_text: reasonText } : {}),
          };
        })
        .filter(Boolean);

      if (normalizedAnswers.length === 0) {
        throw new Error('Please answer at least one question before submitting.');
      }

      setSubmitting(true);
      const response = await examsApi.submitConductExam(resolvedExamId, normalizedAnswers);
      if (response?.code !== 200 || !response?.data) {
        throw new Error(response?.message || 'Unable to submit portal MCQ exam.');
      }

      setSuccess('Exam submitted successfully.');
      if (resolvedCourseId && response?.data?.enrollment_id) {
        setTimeout(() => {
          navigate(`/student/evaluations/${resolvedCourseId}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Unable to submit portal MCQ exam.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <Loader className="w-8 h-8 text-accent animate-spin" />
        <p className="text-gray-600">Loading portal MCQ exam...</p>
      </div>
    );
  }

  if (error && !examData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/student/evaluations/${resolvedCourseId}`)}
          className="flex items-center text-gray-600 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Exams
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 mt-0.5" />
          <div>
            <h2 className="font-semibold">Unable to load exam</h2>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <button
        onClick={() => navigate(`/student/evaluations/${resolvedCourseId}`)}
        className="flex items-center text-gray-600 hover:text-accent transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Exams
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-wide">Online Exam</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">{examData?.exam_name || 'Exam'}</h1>
            <p className="text-sm text-gray-500 mt-2">
              Answer the MCQs below. Some questions may require a short reason.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 min-w-[130px]">
              <div className="text-xs text-gray-500">Questions</div>
              <div className="text-lg font-semibold text-gray-900">{examData?.total_questions || 0}</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-accent/5 border border-accent/10 min-w-[130px]">
              <div className="text-xs text-gray-500">Attempted</div>
              <div className="text-lg font-semibold text-accent">{attemptedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="space-y-4">
        {(examData?.questions || []).map((question, index) => {
          const questionAnswer = answers[question.question_number] || {};
          return (
            <div key={question.question_number} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Question {index + 1}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {question.max_marks} marks
                  </div>
                </div>

                {question.question_body ? (
                  <div
                    className="prose prose-sm max-w-none text-lg font-semibold text-gray-900"
                    dangerouslySetInnerHTML={{ __html: question.question_body }}
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {question.question_text || `Question ${question.question_number}`}
                  </h2>
                )}

                {question.question_file_url && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mt-2">
                    <img
                      src={question.question_file_url}
                      alt={`Question ${question.question_number}`}
                      className="w-full h-auto object-contain max-h-[420px]"
                    />
                  </div>
                )}

                <div className="grid gap-3 pt-2">
                  {(question.mcq_options || []).map((option) => {
                    const isSelected = questionAnswer.selected_option_id === option.option_id;
                    return (
                      <label
                        key={option.option_id}
                        className={`rounded-xl border px-4 py-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name={`question-${question.question_number}`}
                            value={option.option_id}
                            checked={isSelected}
                            onChange={() => handleOptionChange(question.question_number, option.option_id)}
                            className="mt-1 h-4 w-4 text-accent"
                          />
                          <div className="flex-1 space-y-2">
                            {option.option_body ? (
                              <div
                                className="text-sm font-medium text-gray-900 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: option.option_body }}
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {option.option_text || option.option_id}
                              </div>
                            )}
                            {option.option_image_url && (
                              <img
                                src={option.option_image_url}
                                alt={option.option_text || option.option_id}
                                className="max-h-48 rounded-lg border border-gray-200"
                              />
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {questionAnswer.selected_option_id && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => handleClearSelection(question.question_number)}
                      className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                {question.reason_required && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={questionAnswer.reason_text || ''}
                      onChange={(e) => handleReasonChange(question.question_number, e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Explain why you chose this option"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-accent" />
            {attemptedCount} of {examData?.total_questions || 0} questions answered
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConductExamSession;
