import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader,
  Save,
  Send,
} from 'lucide-react';

import { examsApi } from './Student_api';

const getSessionStorageKey = (examId) => `conduct_exam_session_${examId}`;
const getSyncChannelName = (examId) => `conduct_exam_sync_${examId}`;

const isMcqQuestion = (question) => question?.question_type === 'mcq' || question?.question_type === 'mcq_reasoning';
const needsReasoningEditor = (question) => (
  question?.question_type === 'mcq_reasoning'
  || (question?.question_type === 'mcq' && Boolean(question?.reason_required))
);
const needsTextEditor = (question) => (
  needsReasoningEditor(question)
  || (!isMcqQuestion(question) && Boolean(question?.allow_text_answer))
);

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatCountdown = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || totalSeconds < 0) return '--:--:--';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

const normalizeRemainingTime = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.max(0, Math.floor(numericValue));
};

const SubjectiveConductExamSession = ({ examId, courseId }) => {
  const navigate = useNavigate();
  const params = useParams();
  // Support both /student/exams/:examId/conduct and legacy StudentExamDetails embed (params.id)
  const resolvedExamId = examId || params.examId || params.id;
  const resolvedCourseId = courseId || params.courseId;
  const sessionIdRef = useRef(null);
  const autoSubmitRef = useRef(false);
  const dirtyQuestionIdsRef = useRef([]);
  const syncChannelRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [dirtyQuestionIds, setDirtyQuestionIds] = useState([]);

  useEffect(() => {
    dirtyQuestionIdsRef.current = dirtyQuestionIds;
  }, [dirtyQuestionIds]);

  useEffect(() => {
    if (!resolvedExamId) return;
    const storageKey = getSessionStorageKey(resolvedExamId);
    const existingSessionId = sessionStorage.getItem(storageKey);
    if (!existingSessionId) {
      sessionStorage.setItem(storageKey, createSessionId());
    }
    sessionIdRef.current = sessionStorage.getItem(storageKey);
  }, [resolvedExamId]);

  const syncSessionFromServer = async () => {
    if (!resolvedExamId || !sessionIdRef.current) return;
    const response = await examsApi.getSubjectiveConductExamSession(resolvedExamId, sessionIdRef.current);
    if (response?.data) {
      hydrateSession(response.data, { preserveDirtyAnswers: true });
    }
  };

  const broadcastSessionSync = () => {
    if (!resolvedExamId) return;
    const payload = {
      type: 'conduct_exam_sync',
      examId: String(resolvedExamId),
      at: Date.now(),
    };
    try {
      syncChannelRef.current?.postMessage(payload);
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(`conduct_exam_sync_ping_${resolvedExamId}`, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!resolvedExamId) return undefined;

    const handleSyncSignal = (payload) => {
      if (!payload || String(payload.examId) !== String(resolvedExamId)) return;
      syncSessionFromServer().catch(() => {});
    };

    if (typeof BroadcastChannel !== 'undefined') {
      syncChannelRef.current = new BroadcastChannel(getSyncChannelName(resolvedExamId));
      syncChannelRef.current.onmessage = (event) => handleSyncSignal(event.data);
    }

    const onStorage = (event) => {
      if (event.key !== `conduct_exam_sync_ping_${resolvedExamId}` || !event.newValue) return;
      try {
        handleSyncSignal(JSON.parse(event.newValue));
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, [resolvedExamId]);

  const hydrateSession = (payload, { preserveDirtyAnswers = false } = {}) => {
    setSession(payload);
    setTimeLeft(normalizeRemainingTime(payload?.remaining_time));
    setAnswers((previousAnswers) => {
      const nextAnswers = {};
      for (const question of payload?.questions || []) {
        const serverAnswer = {
          text_answer: question.text_answer || '',
          image_answer_url: question.image_answer_url || '',
          selected_option_ids: question.selected_option_ids || null,
        };
        const shouldPreserveLocalAnswer =
          preserveDirtyAnswers &&
          payload?.status === 'in_progress' &&
          dirtyQuestionIdsRef.current.includes(question.id);

        nextAnswers[question.id] = shouldPreserveLocalAnswer
          ? (previousAnswers[question.id] || serverAnswer)
          : serverAnswer;
      }
      return nextAnswers;
    });
    if (!preserveDirtyAnswers || payload?.status !== 'in_progress') {
      setDirtyQuestionIds([]);
    }
  };

  const handleAutoSubmit = async () => {
    if (autoSubmitRef.current || !resolvedExamId || !sessionIdRef.current) {
      return;
    }

    autoSubmitRef.current = true;
    try {
      if (dirtyQuestionIdsRef.current.length > 0) {
        await saveAnswers(dirtyQuestionIdsRef.current, true);
      }

      const response = await examsApi.submitSubjectiveConductExam(resolvedExamId, sessionIdRef.current);
      if (response?.data) {
        hydrateSession(response.data);
        broadcastSessionSync();
        setNotice('Time expired. Your exam was auto-submitted.');
      }
    } catch (err) {
      setError(err.message || 'Unable to auto-submit conduct exam.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!resolvedExamId || !sessionIdRef.current) return;
      setLoading(true);
      setError('');
      try {
        const response = await examsApi.startSubjectiveConductExam(resolvedExamId, sessionIdRef.current);
        if (cancelled) return;
        if (!response?.data) {
          throw new Error(response?.message || 'Unable to load conduct exam session.');
        }
        hydrateSession(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load conduct exam session.');
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
  }, [resolvedExamId]);

  const saveAnswers = async (questionIds = dirtyQuestionIds, silent = false) => {
    if (!resolvedExamId || !sessionIdRef.current || questionIds.length === 0) {
      return session;
    }

    const payloadAnswers = questionIds.map((questionId) => ({
      question_id: Number(questionId),
      text_answer: answers[questionId]?.text_answer || '',
      image_url: answers[questionId]?.image_answer_url || null,
      selected_option_ids: answers[questionId]?.selected_option_ids || null,
    }));

    if (!silent) {
      setSaving(true);
    }
    setError('');

    try {
      const response = await examsApi.saveSubjectiveConductAnswers(resolvedExamId, sessionIdRef.current, payloadAnswers);
      if (!response?.data) {
        throw new Error(response?.message || 'Unable to save answers.');
      }
      hydrateSession(response.data);
      broadcastSessionSync();
      if (!silent) {
        setNotice('Answers saved');
      }
      return response.data;
    } catch (err) {
      setError(err.message || 'Unable to save answers.');
      throw err;
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (!session || session.status !== 'in_progress') return undefined;
    const interval = setInterval(() => {
      if (dirtyQuestionIds.length > 0) {
        saveAnswers(dirtyQuestionIds, true).catch(() => {});
      }
    }, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [dirtyQuestionIds, session, answers]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (session?.status !== 'in_progress') return undefined;
    const interval = setInterval(() => {
      setTimeLeft((previousTimeLeft) => {
        if (typeof previousTimeLeft !== 'number') {
          return previousTimeLeft;
        }
        return Math.max(previousTimeLeft - 1, 0);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  useEffect(() => {
    if (!resolvedExamId || !sessionIdRef.current || session?.status !== 'in_progress') return undefined;

    let cancelled = false;
    const syncSession = async () => {
      try {
        const response = await examsApi.getSubjectiveConductExamSession(resolvedExamId, sessionIdRef.current);
        if (!cancelled && response?.data) {
          hydrateSession(response.data, { preserveDirtyAnswers: true });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to sync conduct exam session timer', err);
        }
      }
    };

    const interval = setInterval(syncSession, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [resolvedExamId, session?.status]);

  useEffect(() => {
    if (session?.status !== 'in_progress' || timeLeft !== 0 || autoSubmitRef.current) return;
    handleAutoSubmit();
  }, [timeLeft, session?.status]);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate('/student/dashboard');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const attemptedCount = useMemo(
    () => Object.values(answers).filter((answer) => String(answer?.text_answer || '').trim() || answer?.image_answer_url).length,
    [answers]
  );

  const handleTextChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        text_answer: value,
      },
    }));
    setDirtyQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        selected_option_ids: [optionId],
      },
    }));
    setDirtyQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleImageUpload = async (questionId, file) => {
    if (!file) return;
    setError('');
    setNotice('');
    try {
      const response = await examsApi.uploadSubjectiveConductAnswerImage(
        resolvedExamId,
        questionId,
        sessionIdRef.current,
        file,
      );
      const imageUrl = response?.data?.image_url || '';
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          image_answer_url: imageUrl,
        },
      }));
      broadcastSessionSync();
      setNotice('Answer image uploaded');
    } catch (err) {
      setError(err.message || 'Unable to upload answer image.');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      if (dirtyQuestionIds.length > 0) {
        await saveAnswers(dirtyQuestionIds, true);
      }
      const response = await examsApi.submitSubjectiveConductExam(resolvedExamId, sessionIdRef.current);
      if (!response?.data) {
        throw new Error(response?.message || 'Unable to submit conduct exam.');
      }
      hydrateSession(response.data);
      broadcastSessionSync();
      setIsSubmitted(true);
      setNotice('Conduct exam submitted successfully');
    } catch (err) {
      setError(err.message || 'Unable to submit conduct exam.');
    } finally {
      setSubmitting(false);
    }
  };

  const questionRefs = useRef({});

  const scrollToQuestion = (questionId) => {
    questionRefs.current[questionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const timerClassName =
    typeof timeLeft === 'number' && timeLeft < 300
      ? 'bg-red-50 border-red-100 text-red-600 animate-pulse'
      : typeof timeLeft === 'number' && timeLeft < 900
      ? 'bg-yellow-50 border-yellow-100 text-yellow-700'
      : 'bg-emerald-50 border-emerald-100 text-emerald-700';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <Loader className="w-8 h-8 text-accent animate-spin" />
        <p className="text-gray-600">Loading conduct exam...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/student/dashboard`)}
          className="flex items-center text-gray-600 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 mt-0.5" />
          <div>
            <h2 className="font-semibold">Unable to load conduct exam</h2>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isQuestionAnswered = (questionId) => {
    const ans = answers[questionId];
    const q = session?.questions?.find(it => String(it.id) === String(questionId));
    if (isMcqQuestion(q)) {
      return !!(ans?.selected_option_ids?.length > 0);
    }
    return !!(ans?.text_answer?.trim() || ans?.image_answer_url);
  };

  return (

    <div className="min-h-screen bg-white">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/student/dashboard`)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{session?.exam_name}</h1>
              <p className="text-xs text-gray-500 font-medium">Timed Subjective Exam</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Progress</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-accent">{attemptedCount}/{session?.questions?.length}</span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="bg-accent h-full transition-all duration-500"
                            style={{ width: `${(attemptedCount / (session?.questions?.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timerClassName}`}>
              <Clock className="w-4 h-4" />
              <span className="text-lg font-mono font-bold">{formatCountdown(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || session?.status !== 'in_progress'}
              className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden text-xs">Submit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Questions Content */}
          <div className="flex-grow space-y-8 min-w-0">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                   <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {notice && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                   <p className="text-sm font-medium">{notice}</p>
                </div>
            )}

            {session?.status !== 'in_progress' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl px-6 py-4">
                  <p className="text-sm font-medium">This exam has already been {session?.status === 'auto_submitted' ? 'auto-submitted' : 'submitted'}.</p>
                </div>
            )}

            <div className="space-y-8">
              {(session?.questions || []).map((question, index) => {
                const questionAnswer = answers[question.id] || {};
                return (
                  <div 
                    key={question.id} 
                    ref={el => questionRefs.current[question.id] = el}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Question</p>
                          <div className="text-sm font-bold text-gray-600">
                            {isMcqQuestion(question) ? (needsReasoningEditor(question) ? 'MCQ with Reasoning' : 'Multiple Choice') : 'Subjective'}
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 border border-gray-100">
                        {question.marks} MARKS
                      </div>
                    </div>

                    {question.question_body ? (
                      <div
                        className="prose prose-sm max-w-none text-lg font-semibold text-gray-900"
                        dangerouslySetInnerHTML={{ __html: question.question_body }}
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900 leading-relaxed mb-6 whitespace-pre-wrap">
                        {question.question_text}
                      </h2>
                    )}

                    {question.image_url && (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden mb-6">
                        <img
                          src={question.image_url}
                          alt={`Question ${index + 1}`}
                          className="w-full h-auto object-contain max-h-[500px]"
                        />
                      </div>
                    )}

                    {isMcqQuestion(question) && (
                      <div className="space-y-3 mb-8">
                        {(question.mcq_options || []).map((option) => {
                          const isSelected = (questionAnswer.selected_option_ids || []).includes(option.option_id);
                          return (
                            <button
                              key={option.option_id}
                              onClick={() => handleOptionSelect(question.id, option.option_id)}
                              disabled={session?.status !== 'in_progress'}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                                isSelected 
                                ? "border-accent bg-accent/5 ring-4 ring-accent/5" 
                                : "border-gray-100 hover:border-gray-200 bg-white"
                              }`}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected ? "border-accent bg-accent" : "border-gray-300"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="flex-grow">
                                <div className="text-xs font-bold text-gray-400 mb-1">{option.option_id}</div>
                                {option.option_body ? (
                                  <div 
                                    className="prose prose-sm max-w-none text-gray-700 font-medium"
                                    dangerouslySetInnerHTML={{ __html: option.option_body }}
                                  />
                                ) : (
                                  <div className="text-gray-700 font-medium">{option.option_text}</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm"
                      >
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                          >
                            <CheckCircle2 className="w-12 h-12" />
                          </motion.div>
                          <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                          >
                            Exam Submitted!
                          </motion.h2>
                          <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-500"
                          >
                            Redirecting to your dashboard...
                          </motion.p>
                          <div className="mt-8 flex justify-center">
                            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3.5 }}
                                className="h-full bg-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-6">
                      {needsTextEditor(question) && (
                        <div className="relative">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                              {isMcqQuestion(question) ? 'Reason for Answer' : 'Your Answer'}
                            </div>
                            <textarea
                                value={questionAnswer.text_answer || ''}
                                onChange={(e) => handleTextChange(question.id, e.target.value)}
                                disabled={session?.status !== 'in_progress'}
                                rows={isMcqQuestion(question) ? 4 : 8}
                                placeholder={isMcqQuestion(question) ? "Briefly explain the reason for your choice..." : "Type your detailed answer here..."}
                                className="w-full rounded-2xl border border-gray-200 px-6 py-5 focus:ring-4 focus:ring-accent/5 focus:border-accent disabled:bg-gray-50/50 resize-none transition-all placeholder:text-gray-300 font-medium text-gray-700"
                            />
                            {dirtyQuestionIds.includes(question.id) && (
                                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3" />
                                    Unsaved
                                </div>
                            )}
                        </div>
                      )}

                      {question.allow_image_answer && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</h4>
                                {questionAnswer.image_answer_url && (
                                    <button 
                                        className="text-xs font-bold text-accent hover:underline"
                                        onClick={() => window.open(questionAnswer.image_answer_url, '_blank')}
                                    >
                                        View Full Size
                                    </button>
                                )}
                            </div>
                          
                            {questionAnswer.image_answer_url ? (
                                <div className="group relative rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all">
                                    <img
                                        src={questionAnswer.image_answer_url}
                                        alt={`Answer upload for question ${index + 1}`}
                                        className="max-h-[300px] rounded-xl object-contain shadow-sm"
                                    />
                                    {session?.status === 'in_progress' && (
                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl cursor-pointer">
                                            <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                                <ImagePlus className="w-4 h-4" />
                                                Replace Image
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                disabled={session?.status !== 'in_progress'}
                                                onChange={(e) => handleImageUpload(question.id, e.target.files?.[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed border-gray-200 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-700">Upload Answer Image</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (Max 10MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={session?.status !== 'in_progress'}
                                        onChange={(e) => handleImageUpload(question.id, e.target.files?.[0])}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0 sticky top-24 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 px-1">Navigation</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                    {(session?.questions || []).map((q, idx) => {
                        const isAnswered = isQuestionAnswered(q.id);
                        const isCurrent = false; // Could track active scroll

                        return (
                            <button
                                key={q.id}
                                onClick={() => scrollToQuestion(q.id)}
                                className={`aspect-square rounded-xl font-bold text-sm transition-all flex items-center justify-center border-2 ${
                                    isAnswered 
                                    ? "bg-accent/5 border-accent text-accent" 
                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                }`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 space-y-3 px-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="w-3 h-3 bg-accent/10 border-2 border-accent rounded-sm"></div>
                        Answered
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="w-3 h-3 bg-white border-2 border-gray-100 rounded-sm"></div>
                        Pending
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50">
                    <button
                        onClick={() => saveAnswers()}
                        disabled={saving || session?.status !== 'in_progress' || dirtyQuestionIds.length === 0}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-30 transition-all active:scale-95"
                    >
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Manual Save'}
                    </button>
                    {saving && <p className="text-[10px] text-center text-gray-400 mt-2 font-bold animate-pulse">Syncing to cloud...</p>}
                </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Important</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                            The timer is strictly enforced. Your work will be automatically submitted when time expires. Please ensure stable internet.
                        </p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl animate-pulse scale-150 opacity-40" />
              <div className="relative w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
                </motion.div>
              </div>

              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    opacity: [0, 1, 0],
                    x: Math.cos(i * 60 * Math.PI / 180) * 80,
                    y: Math.sin(i * 60 * Math.PI / 180) * 80
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 + (i * 0.1) }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
                />
              ))}
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-4xl font-black text-gray-900 mt-10 mb-4 tracking-tight"
            >
              Great Job!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl text-gray-500 max-w-md mx-auto leading-relaxed"
            >
              Your exam has been submitted successfully. Your hard work is now being processed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-12 flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                Redirecting to dashboard...
              </div>
              
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium underline underline-offset-4"
              >
                Click here if you're not redirected
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectiveConductExamSession;
