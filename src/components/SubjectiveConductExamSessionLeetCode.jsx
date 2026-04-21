import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader,
  Save,
  Send,
  X,
  PanelLeftClose,
  PanelLeft,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Quote,
  Strikethrough as StrikethroughIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Image as ImageIcon,
  FileArchive,
  Upload,
  Trash2,
} from 'lucide-react';

import { examsApi } from './Student_api';

const getSessionStorageKey = (examId) => `conduct_exam_session_${examId}`;

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

const SubjectiveConductExamSessionLeetCode = ({ examId, courseId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedExamId = examId || params.examId || params.id;
  const resolvedCourseId = courseId || params.courseId;
  const sessionIdRef = useRef(null);
  const autoSubmitRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const dirtyQuestionIdsRef = useRef([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [dirtyQuestionIds, setDirtyQuestionIds] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionPanelCollapsed, setQuestionPanelCollapsed] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  // Upload state per question: { [questionId]: { uploading, imageUrl, zipUrl, imageError, zipError } }
  const [uploadState, setUploadState] = useState({});
  const imageInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Initialize TipTap editor for current question
  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : {};

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Placeholder.configure({
        placeholder: `Write your answer here...

• Explain your reasoning step by step
• Show all calculations and formulas
• Use proper formatting for clarity
• Structure your answer logically

Take your time and write a comprehensive answer.`,
      }),
    ],
    content: currentAnswer?.text_answer || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleTextChange(currentQuestion?.id, html);
    },
  }, [currentQuestion?.id]);

  // Update editor content when question changes
  useEffect(() => {
    if (editor && currentAnswer?.text_answer !== editor.getHTML()) {
      editor.commands.setContent(currentAnswer?.text_answer || '');
    }
  }, [currentQuestion?.id, editor]);

  // Word count
  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [editor?.state.doc]);

  useEffect(() => {
    if (!resolvedExamId) return;
    const storageKey = getSessionStorageKey(resolvedExamId);
    const existingSessionId = sessionStorage.getItem(storageKey);
    if (!existingSessionId) {
      sessionStorage.setItem(storageKey, createSessionId());
    }
    sessionIdRef.current = sessionStorage.getItem(storageKey);
  }, [resolvedExamId]);

  useEffect(() => {
    dirtyQuestionIdsRef.current = dirtyQuestionIds;
  }, [dirtyQuestionIds]);

  const hydrateSession = (payload, { preserveDirtyAnswers = false } = {}) => {
    setSession(payload);
    setTimeLeft(normalizeRemainingTime(payload?.remaining_time));
    setAnswers((previousAnswers) => {
      const nextAnswers = {};
      for (const question of payload?.questions || []) {
        const serverAnswer = {
          text_answer: question.text_answer || '',
          image_answer_url: question.image_answer_url || '',
          zip_answer_url: question.zip_answer_url || '',
          answer_images: question.answer_images || [],
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
    // Sync upload state from server (image/zip URLs)
    setUploadState((prev) => {
      const next = { ...prev };
      for (const question of payload?.questions || []) {
        next[question.id] = {
          ...(next[question.id] || {}),
          images: question.answer_images || [],
          zipUrl: question.zip_answer_url || next[question.id]?.zipUrl || null,
          uploading: false,
          imageError: null,
          zipError: null,
        };
      }
      return next;
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

  // Auto-save with 10-second debounce and status indicator
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return undefined;
    
    if (dirtyQuestionIds.length > 0) {
      setAutoSaveStatus('unsaved');
      
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer for 10 seconds
      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving');
        try {
          await saveAnswers(dirtyQuestionIds, true);
          setAutoSaveStatus('saved');
          // Reset to saved after 2 seconds
          setTimeout(() => setAutoSaveStatus('saved'), 2000);
        } catch (err) {
          setAutoSaveStatus('unsaved');
        }
      }, 10000);
    } else {
      setAutoSaveStatus('saved');
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [dirtyQuestionIds, session, answers]);

  // Clear notice after 2 seconds
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Auto-submit when time expires
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

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in editor
      if (editor?.isFocused) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          if (dirtyQuestionIds.length > 0) {
            saveAnswers(dirtyQuestionIds);
          }
        }
        return;
      }
      
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        e.preventDefault();
        setCurrentQuestionIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < (session?.questions?.length || 0) - 1) {
        e.preventDefault();
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, session?.questions?.length, editor, dirtyQuestionIds]);

  const attemptedCount = useMemo(
    () => {
      let count = 0;
      for (const [qId, answer] of Object.entries(answers)) {
        const hasText = String(answer?.text_answer || '').trim();
        const hasImages = uploadState[qId]?.images?.length > 0;
        const hasZip = answer?.zip_answer_url || uploadState[qId]?.zipUrl;
        if (hasText || hasImages || hasZip) count++;
      }
      return count;
    },
    [answers, uploadState]
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

  const handleImageUpload = async (questionId, file) => {
    if (!file || !resolvedExamId || !sessionIdRef.current) return;
    setUploadState((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), uploading: 'image', imageError: null },
    }));
    try {
      const response = await examsApi.uploadSubjectiveConductAnswerImage(
        resolvedExamId, questionId, sessionIdRef.current, file
      );
      const newImage = {
        id: response?.data?.image_id,
        image_url: response?.data?.image_url,
        original_filename: response?.data?.original_filename,
        display_order: response?.data?.display_order,
      };
      setUploadState((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          uploading: false,
          images: [...(prev[questionId]?.images || []), newImage],
          imageError: null,
        },
      }));
      setNotice('Image uploaded successfully');
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), uploading: false, imageError: err.message || 'Image upload failed' },
      }));
    }
  };

  const handleZipUpload = async (questionId, file) => {
    if (!file || !resolvedExamId || !sessionIdRef.current) return;
    setUploadState((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), uploading: 'zip', zipError: null },
    }));
    try {
      const response = await examsApi.uploadSubjectiveConductAnswerZip(
        resolvedExamId, questionId, sessionIdRef.current, file
      );
      const zipUrl = response?.data?.zip_url || null;
      setUploadState((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), uploading: false, zipUrl, zipError: null },
      }));
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), zip_answer_url: zipUrl },
      }));
      setNotice('Zip file uploaded successfully');
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), uploading: false, zipError: err.message || 'Zip upload failed' },
      }));
    }
  };

  const handleRemoveImage = async (questionId, imageId) => {
    if (!resolvedExamId || !sessionIdRef.current) return;
    try {
      await examsApi.deleteSubjectiveConductAnswerImage(
        resolvedExamId, questionId, imageId, sessionIdRef.current
      );
      setUploadState((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          images: (prev[questionId]?.images || []).filter(img => img.id !== imageId),
          imageError: null,
        },
      }));
      setNotice('Image removed successfully');
    } catch (err) {
      setError(err.message || 'Failed to remove image');
    }
  };

  const handleRemoveZip = (questionId) => {
    setUploadState((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), zipUrl: null, zipError: null },
    }));
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), zip_answer_url: null },
    }));
    setDirtyQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleSubmit = async () => {
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
      setNotice('Conduct exam submitted successfully');
    } catch (err) {
      setError(err.message || 'Unable to submit conduct exam.');
    } finally {
      setSubmitting(false);
    }
  };

  const timerClassName =
    typeof timeLeft === 'number' && timeLeft < 300
      ? 'bg-red-50 border-red-200 text-red-600'
      : typeof timeLeft === 'number' && timeLeft < 900
      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  const isQuestionAnswered = (questionId) => {
    const ans = answers[questionId];
    const up = uploadState[questionId];
    return !!(ans?.text_answer?.trim() || (up?.images && up.images.length > 0) || up?.zipUrl);
  };

  // Toolbar button component
  const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'text-gray-700 hover:bg-gray-100'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-gray-50">
        <Loader className="w-8 h-8 text-accent animate-spin" />
        <p className="text-gray-600">Loading conduct exam...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
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
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/student/dashboard`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{session?.exam_name}</h1>
              <p className="text-xs text-gray-500">Subjective Exam</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">Progress:</span>
              <span className="font-bold text-accent">{attemptedCount}/{session?.questions?.length}</span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${timerClassName}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">{formatCountdown(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || session?.status !== 'in_progress'}
              className="bg-accent text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-all text-sm"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Question Tabs - LeetCode Style */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuestionPanelCollapsed(!questionPanelCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 mr-2"
            title={questionPanelCollapsed ? "Show Question" : "Hide Question"}
          >
            {questionPanelCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          {(session?.questions || []).map((q, idx) => {
            const isAnswered = isQuestionAnswered(q.id);
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-accent text-white'
                    : isAnswered
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Q{idx + 1}
                {isAnswered && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {(error || notice) && (
        <div className="px-4 pt-3 flex-shrink-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {notice && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{notice}</p>
              </div>
              <button onClick={() => setNotice('')} className="text-green-400 hover:text-green-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Split Panel Layout - Professional Writing Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Question (35% or hidden) */}
        <div className={`${questionPanelCollapsed ? 'w-0' : 'w-[35%]'} border-r border-gray-200 bg-white overflow-hidden transition-all duration-300 relative flex-shrink-0`}>
          {/* Toggle button pinned to the right edge of the question panel */}
          {!questionPanelCollapsed && (
            <button
              onClick={() => setQuestionPanelCollapsed(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white border-2 border-gray-300 rounded-full p-1.5 hover:bg-gray-50 hover:border-accent transition-all z-20 shadow-md"
              title="Hide Question"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {!questionPanelCollapsed && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h2>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-bold">
                  {currentQuestion?.marks} marks
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {currentQuestion?.question_text}
                </p>
              </div>

            {currentQuestion?.question_body && (
              <div 
                className="mt-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question_body }}
              />
            )}

            {currentQuestion?.image_url && (
              <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={currentQuestion.image_url}
                  alt={`Question ${currentQuestionIndex + 1}`}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {session?.questions?.length}
              </span>

              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                disabled={currentQuestionIndex === (session?.questions?.length || 0) - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            </div>
          )}
        </div>


        {/* Right Panel - Answer Editor (65% or 100%) */}
        <div className={`${questionPanelCollapsed ? 'w-full' : 'w-[65%]'} bg-white overflow-y-auto transition-all duration-300`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">Your Answer</h3>
                {questionPanelCollapsed && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <button
                      onClick={() => setQuestionPanelCollapsed(false)}
                      className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                    >
                      <PanelLeft className="w-3 h-3" />
                      Show Question
                    </button>
                  </div>
                )}
              </div>
              
              {/* Auto-save Status */}
              <div className="flex items-center gap-2 text-xs">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Loader className="w-3 h-3 animate-spin text-amber-600" />
                    <span className="text-amber-600 font-medium">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">Saved</span>
                  </>
                )}
                {autoSaveStatus === 'unsaved' && (
                  <>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 font-medium">Unsaved changes</span>
                  </>
                )}
              </div>
            </div>

            {session?.status !== 'in_progress' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm font-medium">
                  This exam has been {session?.status === 'auto_submitted' ? 'auto-submitted' : 'submitted'}.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {currentQuestion?.allow_text_answer && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text Answer
                  </label>
                  <textarea
                    value={currentAnswer?.text_answer || ''}
                    onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                    disabled={session?.status !== 'in_progress'}
                    rows={24}
                    placeholder="Write your detailed answer here...

• Explain your reasoning step by step
• Show all calculations and formulas  
• Use proper formatting for clarity
• Structure your answer logically

Take your time and write a comprehensive answer."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-100 resize-none transition-all placeholder:text-gray-400 text-[15px] leading-relaxed"
                  />
                </div>
              )}

              {/* Image & Zip Upload Section */}
              {currentQuestion?.allow_image_answer && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-accent" />
                    File Uploads
                  </h4>

                  {/* Image Upload - Multiple */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image Answers (PNG, JPG, JPEG) - Upload multiple
                    </label>

                    {/* Show uploaded images */}
                    {uploadState[currentQuestion?.id]?.images && uploadState[currentQuestion.id].images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {uploadState[currentQuestion.id].images.map((img, idx) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.image_url}
                              alt={`Answer ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                              {session?.status === 'in_progress' && (
                                <button
                                  onClick={() => handleRemoveImage(currentQuestion.id, img.id)}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{img.original_filename || `Image ${idx + 1}`}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    <div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        disabled={session?.status !== 'in_progress'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(currentQuestion.id, file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={
                          session?.status !== 'in_progress' ||
                          uploadState[currentQuestion?.id]?.uploading === 'image'
                        }
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                      >
                        {uploadState[currentQuestion?.id]?.uploading === 'image' ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Uploading image...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4" />
                            {uploadState[currentQuestion?.id]?.images?.length > 0 ? 'Add another image' : 'Click to upload image'}
                          </>
                        )}
                      </button>
                      {uploadState[currentQuestion?.id]?.imageError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {uploadState[currentQuestion.id].imageError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Zip Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <FileArchive className="w-3.5 h-3.5" />
                      Zip File Answer (.zip, max 50 MB)
                    </label>

                    {uploadState[currentQuestion?.id]?.zipUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg">
                        <FileArchive className="w-8 h-8 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Zip file uploaded
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {uploadState[currentQuestion.id].zipUrl.split('/').pop()?.split('?')[0]}
                          </p>
                        </div>
                        {session?.status === 'in_progress' && (
                          <button
                            onClick={() => handleRemoveZip(currentQuestion.id)}
                            className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Remove zip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={zipInputRef}
                          type="file"
                          accept=".zip,application/zip,application/x-zip-compressed"
                          className="hidden"
                          disabled={session?.status !== 'in_progress'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleZipUpload(currentQuestion.id, file);
                            e.target.value = '';
                          }}
                        />
                        <button
                          onClick={() => zipInputRef.current?.click()}
                          disabled={
                            session?.status !== 'in_progress' ||
                            uploadState[currentQuestion?.id]?.uploading === 'zip'
                          }
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-accent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                          {uploadState[currentQuestion?.id]?.uploading === 'zip' ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Uploading zip...
                            </>
                          ) : (
                            <>
                              <FileArchive className="w-4 h-4" />
                              Click to upload zip file
                            </>
                          )}
                        </button>
                        {uploadState[currentQuestion?.id]?.zipError && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {uploadState[currentQuestion.id].zipError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectiveConductExamSessionLeetCode;
