import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { EditorContent, useEditor, NodeViewWrapper, ReactNodeViewRenderer, Node } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
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
  Upload,
  Trash2,
  Plus,
  Type,
  Palette,
  Table as TableIcon,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Grid3X3,
  Split,
  Settings,
  Type as TypeIcon,
} from 'lucide-react';

import { examsApi } from './Student_api';
import OnlineExamSecurityCheck from './OnlineExamSecurityCheck';
import ExamProtectionOverlay from './ExamProtectionOverlay';
import { useExamProtection } from '../hooks/useExamProtection';
import { useTabMonitor } from '../hooks/useTabMonitor';
import toast from 'react-hot-toast';

const getSessionStorageKey = (examId) => `conduct_exam_session_${examId}`;
const getSyncChannelName = (examId) => `conduct_exam_sync_${examId}`;

const isMcqQuestion = (question) => question?.question_type === 'mcq' || question?.question_type === 'mcq_reasoning';
const isMultiSelectQuestion = (question) => {
  const metadata = question?.mcq_metadata || {};
  return Boolean(
    metadata?.multi_select
    || metadata?.multiple_correct
    || metadata?.allow_multiple
    || metadata?.selection_mode === 'multiple'
  );
};
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

const SubjectiveConductExamSessionLeetCode = ({ examId, courseId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const resolvedExamId = examId || params.examId || params.id;
  const resolvedCourseId = courseId || params.courseId;
  const sessionIdRef = useRef(null);
  const autoSubmitRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const dirtyQuestionIdsRef = useRef([]);
  const syncChannelRef = useRef(null);

  const [loading, setLoading] = useState(false);
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(4);
  const [securityCleared, setSecurityCleared] = useState(false);

  const [uploadState, setUploadState] = useState({});
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const imageInputRef = useRef(null);
  const fileUploadInProgressRef = useRef(false);
  const imageUploadInProgressRef = useRef(false);

  const finishTrustedFilePicker = useCallback(() => {
    window.setTimeout(() => {
      fileUploadInProgressRef.current = false;
    }, 250);
  }, []);

  useEffect(() => {
    const handlePickerClosed = () => {
      if (fileUploadInProgressRef.current) {
        finishTrustedFilePicker();
      }
    };

    window.addEventListener('focus', handlePickerClosed);
    window.addEventListener('pageshow', handlePickerClosed);
    return () => {
      window.removeEventListener('focus', handlePickerClosed);
      window.removeEventListener('pageshow', handlePickerClosed);
    };
  }, [finishTrustedFilePicker]);

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
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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

  useEffect(() => {
    if (editor) {
      editor.setEditable(session?.status === 'in_progress');
    }
  }, [editor, session?.status]);

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

  useEffect(() => {
    dirtyQuestionIdsRef.current = dirtyQuestionIds;
  }, [dirtyQuestionIds]);

  useTabMonitor({
    enabled: true,
    active: session?.status === 'in_progress' && !submitting && !saving && !isSubmitted,
    shouldIgnore: () => fileUploadInProgressRef.current || imageUploadInProgressRef.current,
    onTabSwitch: (source) => {
      if (fileUploadInProgressRef.current || imageUploadInProgressRef.current) {
        return;
      }
      toast.error('Tab switch detected! Your exam is being automatically submitted for security reasons.', { duration: 5000 });
      handleSubmit();
    }
  });

  const hydrateSession = (payload, { preserveDirtyAnswers = false, clearDirtyIds = [] } = {}) => {
    setSession(payload);
    setTimeLeft(normalizeRemainingTime(payload?.remaining_time));
    setAnswers((previousAnswers) => {
      const nextAnswers = {};
      for (const question of payload?.questions || []) {
        const serverAnswer = {
          text_answer: question.text_answer || '',
          answer_images: question.answer_images || [],
          selected_option_ids: question.selected_option_ids || [],
        };
        const shouldPreserveLocalAnswer =
          preserveDirtyAnswers &&
          payload?.status === 'in_progress' &&
          (dirtyQuestionIdsRef.current.includes(question.id) || clearDirtyIds.includes(question.id));

        nextAnswers[question.id] = shouldPreserveLocalAnswer
          ? (previousAnswers[question.id] || serverAnswer)
          : serverAnswer;
      }
      return nextAnswers;
    });

    // Sync upload state from server (image URLs)
    setUploadState((prev) => {
      const next = { ...prev };
      for (const question of payload?.questions || []) {
        const localState = next[question.id] || {};
        const isUploading = localState.uploading === 'image';
        
        // CRITICAL FIX: During auto-sync/save (preserveDirtyAnswers=true),
        // only trust the server image list if our local list is empty.
        // This prevents 'vanishing' images during the race condition
        // where a sync happens right after an upload but before DB commit.
        const serverImages = question.answer_images || [];
        const localImages = localState.images || [];
        
        const shouldTrustServerImages = !preserveDirtyAnswers || localImages.length === 0 || (serverImages.length >= localImages.length && !isUploading);

        next[question.id] = {
          ...localState,
          images: shouldTrustServerImages ? serverImages : localImages,
          uploading: isUploading ? 'image' : false,
          imageError: isUploading ? localState.imageError : null,
          zipUrl: question.zip_answer_url || null,
          zipError: null,
        };
      }
      return next;
    });

    if (clearDirtyIds.length > 0) {
      setDirtyQuestionIds(prev => prev.filter(id => !clearDirtyIds.includes(id)));
    } else if (!preserveDirtyAnswers || payload?.status !== 'in_progress') {
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

  const logSecurityEvent = useCallback((eventPayload) => {
    if (!resolvedExamId) return Promise.resolve();
    return examsApi.logConductExamSecurityEvent(resolvedExamId, eventPayload);
  }, [resolvedExamId]);

  const protection = useExamProtection({
    active: Boolean(securityCleared && session?.status === 'in_progress'),
    config: session?.online_exam_security_config,
    examId: resolvedExamId,
    submissionId: session?.submission_id,
    logSecurityEvent,
    onAutoSubmit: handleAutoSubmit,
    shouldIgnoreTabSwitch: () => fileUploadInProgressRef.current || imageUploadInProgressRef.current,
  });

  const openTrustedImagePicker = useCallback(() => {
    fileUploadInProgressRef.current = true;
    protection.suspendProtection?.(90000);
    imageInputRef.current?.click();
  }, [protection]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!resolvedExamId || !sessionIdRef.current || !securityCleared) return;
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
  }, [resolvedExamId, securityCleared]);

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
      hydrateSession(response.data, { preserveDirtyAnswers: true, clearDirtyIds: questionIds });
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
    if (!protection.isOnline || session?.status !== 'in_progress' || dirtyQuestionIds.length === 0) {
      return;
    }
    saveAnswers(dirtyQuestionIds, true).catch(() => {});
  }, [protection.isOnline]);

  useEffect(() => {
    if (session?.status !== 'in_progress' || timeLeft !== 0 || autoSubmitRef.current) return;
    handleAutoSubmit();
  }, [timeLeft, session?.status]);

  useEffect(() => {
    if (!isSubmitted) return undefined;

    setRedirectSeconds(4);
    const interval = setInterval(() => {
      setRedirectSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          navigate('/student-dashboard');
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, navigate]);

  useEffect(() => {
    if (isSubmitted) {
      const fallbackTimer = setTimeout(() => {
        navigate('/student-dashboard');
      }, 4500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isSubmitted, navigate]);

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
        const hasMcq = Array.isArray(answer?.selected_option_ids) && answer.selected_option_ids.length > 0;
        if (hasText || hasImages || hasZip || hasMcq) count++;
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

  const handleOptionChange = (questionId, optionId) => {
    if (session?.status !== 'in_progress') return;
    const question = (session?.questions || []).find((item) => item.id === questionId);
    const isMultiple = isMultiSelectQuestion(question);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        selected_option_ids: isMultiple
          ? ((prev[questionId]?.selected_option_ids || []).includes(optionId)
              ? (prev[questionId]?.selected_option_ids || []).filter((id) => id !== optionId)
              : [...(prev[questionId]?.selected_option_ids || []), optionId])
          : [optionId],
      },
    }));
    setDirtyQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  const handleImageUpload = async (questionId, files) => {
    if (!files || files.length === 0 || !resolvedExamId || !sessionIdRef.current) return;
    imageUploadInProgressRef.current = true;
    protection.suspendProtection?.(90000);
    
    // files could be a FileList or array
    const fileArray = Array.from(files);
    
    setUploadState((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), uploading: 'image', imageError: null },
    }));

    try {
      // For multiple images, we keep track of successful uploads to update state at the end or incrementally
      // Let's do it incrementally for better UX feedback
      for (const file of fileArray) {
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
            images: [...(prev[questionId]?.images || []), newImage],
          },
        }));
      }
      
      setUploadState((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), uploading: false, imageError: null },
      }));
      broadcastSessionSync();
      setNotice(`Successfully uploaded ${fileArray.length} image(s)`);
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        [questionId]: { ...(prev[questionId] || {}), uploading: false, imageError: err.message || 'Image upload failed' },
      }));
    } finally {
      protection.suspendProtection?.(5000);
      imageUploadInProgressRef.current = false;
      finishTrustedFilePicker();
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
      broadcastSessionSync();
      setNotice('Image removed successfully');
    } catch (err) {
      setError(err.message || 'Failed to remove image');
    }
  };


  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
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

  const timerClassName =
    typeof timeLeft === 'number' && timeLeft < 300
      ? 'bg-red-50 border-red-200 text-red-600 shadow-sm shadow-red-100'
      : typeof timeLeft === 'number' && timeLeft < 900
      ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-100'
      : 'bg-accent/10 border-accent/20 text-accent shadow-sm shadow-accent/5';

  const isQuestionAnswered = (questionId) => {
    const ans = answers[questionId];
    const up = uploadState[questionId];
    const hasText = !!ans?.text_answer?.trim() && ans.text_answer !== '<p></p>';
    const hasImages = !!(up?.images && up.images.length > 0);
    const hasMcq = Array.isArray(ans?.selected_option_ids) && ans.selected_option_ids.length > 0;
    return hasText || hasImages || hasMcq;
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

  if (!securityCleared) {
    return (
      <OnlineExamSecurityCheck
        examName={session?.exam_name || 'Online Exam'}
        protection={protection}
        onReady={() => setSecurityCleared(true)}
        onCancel={() => navigate('/student-dashboard')}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-gray-50">
        <Loader className="w-8 h-8 text-accent animate-spin" />
        <p className="text-gray-600">Loading online exam...</p>
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
              <h2 className="font-semibold">Unable to load online exam</h2>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-white overflow-hidden select-none">
      <style>{`
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .ProseMirror td, .ProseMirror th {
          min-width: 1em;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f8fafc;
          color: #1e293b;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(22, 109, 112, 0.05);
          pointer-events: none;
        }
        .ProseMirror .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #166D70;
          pointer-events: none;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
      `}</style>
      {/* Top Bar - Clean Branded Header */}
      <header className="bg-white text-gray-900 px-6 py-4 flex-shrink-0 z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 overflow-hidden min-w-0">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit? Your progress is saved.')) {
                  navigate(`/student-dashboard`);
                }
              }}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all group shrink-0 border border-gray-100 shadow-sm"
              title="Save & Exit"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
            </button>
            <div className="h-8 w-px bg-gray-100 shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-lg font-black truncate tracking-tight text-gray-900">{session?.exam_name}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#166D70] bg-[#166D70]/5 px-2 py-0.5 rounded border border-[#166D70]/10">Online Exam</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 px-6 py-1.5 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Progress</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-black text-accent">{attemptedCount}</span>
                <span className="text-xs text-gray-400">/</span>
                <span className="text-xs text-gray-400">{session?.questions?.length}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time Remaining</span>
              <div className={`flex items-center gap-2 mt-0.5 ${typeof timeLeft === 'number' && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-base font-mono font-black leading-none">{formatCountdown(timeLeft)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-2">
               <div className="flex flex-col items-end mr-4">
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  {autoSaveStatus === 'saving' ? (
                    <span className="text-amber-500 flex items-center gap-1"><Loader className="w-3 h-3 animate-spin" /> Syncing...</span>
                  ) : (
                    <span className="text-accent flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto-saved</span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting || session?.status !== 'in_progress'}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:grayscale overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {submitting ? <Loader className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                Submit Exam
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs & Navigation Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center gap-4">
          <button
            onClick={() => setQuestionPanelCollapsed(!questionPanelCollapsed)}
            className={`p-2.5 rounded-xl transition-all shadow-sm border ${
              questionPanelCollapsed 
                ? 'bg-accent text-white border-accent shadow-accent/20' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-accent'
            }`}
            title={questionPanelCollapsed ? "Show Question Panel" : "Maximize Editor"}
          >
            {questionPanelCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {(session?.questions || []).map((q, idx) => {
              const isAnswered = isQuestionAnswered(q.id);
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`group relative h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    isCurrent
                      ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]'
                      : isAnswered
                      ? 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20'
                      : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300 hover:text-gray-600 active:scale-95'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Q{idx + 1}
                    {isAnswered && !isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-accent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
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
            <div className="bg-accent/5 border border-accent/10 text-accent rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{notice}</p>
              </div>
              <button onClick={() => setNotice('')} className="text-accent/40 hover:text-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Split Panel Layout - Professional Writing Workspace */}
      <div className="flex-1 flex overflow-hidden relative bg-white">
        {/* Left Panel - Question (40% or hidden) */}
        <div className={`${questionPanelCollapsed ? 'w-0 opacity-0' : 'w-[40%] opacity-100'} border-r border-gray-100 bg-gray-50/30 overflow-hidden transition-all duration-500 ease-in-out relative flex-shrink-0 flex flex-col`}>
          {!questionPanelCollapsed && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-accent tracking-[0.2em]">Context</span>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">
                      Question {currentQuestionIndex + 1}
                    </h2>
                  </div>
                  <div className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-2xl flex flex-col items-center min-w-[70px]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Marks</span>
                    <span className="text-base font-black text-gray-900">{currentQuestion?.marks}</span>
                  </div>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
                  {currentQuestion?.question_body ? (
                    <div 
                      className="prose prose-slate max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.question_body }}
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <p className="text-gray-800 text-[16px] leading-[1.625] font-normal whitespace-pre-wrap selection:bg-accent/20">
                        {currentQuestion?.question_text}
                      </p>
                    </div>
                  )}
                </div>

                {currentQuestion?.image_url && (
                  <div className="mb-8 rounded-3xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner group">
                    <img
                      src={currentQuestion.image_url}
                      alt={`Question ${currentQuestionIndex + 1}`}
                      className="w-full h-auto object-contain max-h-[600px] transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                )}

                {/* Navigation Buttons Pinned to bottom of question info */}
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-accent hover:border-accent disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-gray-900">{currentQuestionIndex + 1}</span>
                    <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500" 
                        style={{ width: `${((currentQuestionIndex + 1) / (session?.questions?.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-400">{session?.questions?.length}</span>
                  </div>

                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={currentQuestionIndex === (session?.questions?.length || 0) - 1}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-accent hover:border-accent disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Right Panel - Answer Editor (60%) */}
        <div className={`${questionPanelCollapsed ? 'w-full' : 'w-[60%]'} bg-white overflow-y-auto transition-all duration-500 ease-in-out custom-scrollbar`}>
          <div className="p-8 max-w-4xl mx-auto min-h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Your Answer</h3>
                {questionPanelCollapsed && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Q{currentQuestionIndex + 1}
                    </span>
                    <button
                      onClick={() => setQuestionPanelCollapsed(false)}
                      className="text-[10px] text-accent hover:text-accent/80 font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                      <PanelLeft className="w-3 h-3" />
                      Show Context
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className={`w-1.5 h-1.5 rounded-full ${autoSaveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-accent'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {autoSaveStatus === 'saving' ? 'Syncing...' : 'Encrypted & Saved'}
                  </span>
                </div>
              </div>
            </div>

            {session?.status !== 'in_progress' && (
              <div className="bg-accent/5 border border-accent/10 text-accent rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold uppercase tracking-wide">
                  This exam was {session?.status === 'auto_submitted' ? 'auto-submitted' : 'finalized'} and is now in read-only mode.
                </p>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 gap-6">
              {/* MCQ Options Section */}
              {isMcqQuestion(currentQuestion) && (
                <div className="shrink-0">
                  <div className="space-y-3 max-w-3xl">
                    {(!currentQuestion.mcq_options || currentQuestion.mcq_options.length === 0) ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                        <p className="font-bold">Notice:</p>
                        <p>No multiple-choice options are defined for this question. Please contact your instructor.</p>
                      </div>
                    ) : (
                      (currentQuestion.mcq_options || []).map((option, idx) => {
                      const isSelected = (currentAnswer?.selected_option_ids || []).includes(option.option_id);
                      const multiple = isMultiSelectQuestion(currentQuestion);
                      return (
                        <label
                          key={option.option_id}
                          className={`relative flex items-start p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            isSelected
                              ? 'border-accent bg-accent/5 ring-4 ring-accent/10'
                              : 'border-gray-200 bg-white hover:border-accent/40 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center h-6 mt-1">
                            <input
                              type={multiple ? 'checkbox' : 'radio'}
                              name={`mcq-${currentQuestion.id}`}
                              value={option.option_id}
                              checked={isSelected}
                              disabled={session?.status !== 'in_progress'}
                              onChange={() => handleOptionChange(currentQuestion.id, option.option_id)}
                              className="w-5 h-5 text-accent border-gray-300 focus:ring-accent/50 cursor-pointer transition-colors"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                isSelected ? 'bg-accent text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                            </div>
                            <div
                              className={`prose prose-sm max-w-none transition-colors ${
                                isSelected ? 'text-gray-900' : 'text-gray-700'
                              }`}
                              dangerouslySetInnerHTML={{
                                __html: option.option_body || option.option_text || ''
                              }}
                            />
                          </div>
                        </label>
                      );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Rich Text Editor Section (Subjective or MCQ Reasoning) */}
              {needsTextEditor(currentQuestion) && (
                <div className="flex-1 flex flex-col min-h-0 min-h-[400px]">
                  {isMcqQuestion(currentQuestion) && (
                    <div className="flex items-center gap-2 mb-3 px-2">
                       <TypeIcon size={14} className="text-gray-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Supporting Reasoning Required</span>
                    </div>
                  )}
                  
                  {/* TipTap Toolbar - MS Word Style */}
                  <div className="flex flex-wrap items-center gap-1 p-2 mb-2 bg-gray-50 border border-gray-200 rounded-2xl shrink-0 shadow-sm">
                    {/* Basic Formatting */}
                    <div className="flex items-center gap-0.5 px-1">
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBold().run()} 
                        active={editor?.isActive('bold')}
                        title="Bold (Ctrl+B)"
                      >
                        <BoldIcon size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleItalic().run()} 
                        active={editor?.isActive('italic')}
                        title="Italic (Ctrl+I)"
                      >
                        <ItalicIcon size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleUnderline().run()} 
                        active={editor?.isActive('underline')}
                        title="Underline (Ctrl+U)"
                      >
                        <UnderlineIcon size={16} />
                      </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Alignment */}
                    <div className="flex items-center gap-0.5 px-1">
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                        active={editor?.isActive({ textAlign: 'left' })}
                        title="Align Left"
                      >
                        <AlignLeft size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                        active={editor?.isActive({ textAlign: 'center' })}
                        title="Align Center"
                      >
                        <AlignCenter size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                        active={editor?.isActive({ textAlign: 'right' })}
                        title="Align Right"
                      >
                        <AlignRight size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
                        active={editor?.isActive({ textAlign: 'justify' })}
                        title="Align Justify"
                      >
                        <AlignJustify size={16} />
                      </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Lists */}
                    <div className="flex items-center gap-0.5 px-1">
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleBulletList().run()} 
                        active={editor?.isActive('bulletList')}
                        title="Bullet List"
                      >
                        <List size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                        active={editor?.isActive('orderedList')}
                        title="Ordered List"
                      >
                        <ListOrdered size={16} />
                      </ToolbarButton>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Tables */}
                    <div className="flex items-center gap-0.5 px-1">
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert 3x3 Table"
                      >
                        <TableIcon size={16} />
                      </ToolbarButton>
                      {editor?.isActive('table') && (
                        <>
                          <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before"><Columns size={16} className="rotate-180" /></ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After"><Columns size={16} /></ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before"><Rows size={16} className="rotate-180" /></ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After"><Rows size={16} /></ToolbarButton>
                          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table"><Trash2 size={14} className="text-red-500" /></ToolbarButton>
                        </>
                      )}
                    </div>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-0.5 px-1">
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor?.can().undo()}
                        title="Undo"
                      >
                        <Undo2 size={16} />
                      </ToolbarButton>
                      <ToolbarButton 
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor?.can().redo()}
                        title="Redo"
                      >
                        <Redo2 size={16} />
                      </ToolbarButton>
                    </div>
                    {/* Uploads Trigger */}
                    <div className="ml-auto px-4 flex items-center">
                      <button
                        onClick={() => setShowUploadPanel(!showUploadPanel)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          showUploadPanel 
                            ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                            : 'bg-accent/5 text-accent hover:bg-accent/10 border border-accent/10'
                        }`}
                      >
                        <Upload size={14} className={uploadState[currentQuestion?.id]?.uploading ? 'animate-bounce' : ''} />
                        Uploads {uploadState[currentQuestion?.id]?.images?.length > 0 && `(${uploadState[currentQuestion.id].images.length})`}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Upload Panel */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showUploadPanel ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-inner">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-accent" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Image Workspace</h4>
                        </div>
                        <button onClick={() => setShowUploadPanel(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-colors">Close Panel</button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 overflow-y-auto max-h-[200px] p-2 no-scrollbar">
                        {uploadState[currentQuestion?.id]?.images?.map((img) => (
                          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                            <img src={img.image_url} alt="Uploaded Work" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                              {session?.status === 'in_progress' && (
                                <button
                                  onClick={() => handleRemoveImage(currentQuestion.id, img.id)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {session?.status === 'in_progress' && (
                          <button
                            onPointerDown={() => {
                              fileUploadInProgressRef.current = true;
                            }}
                            onClick={openTrustedImagePicker}
                            disabled={uploadState[currentQuestion?.id]?.uploading === 'image'}
                            className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-accent hover:bg-accent/5 text-gray-400 hover:text-accent transition-all group"
                          >
                            {uploadState[currentQuestion?.id]?.uploading === 'image' ? (
                              <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Add More</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      <input 
                        ref={imageInputRef} 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          protection.suspendProtection?.(90000);
                          if (e.target.files?.length) {
                            handleImageUpload(currentQuestion.id, e.target.files);
                          } else {
                            finishTrustedFilePicker();
                          }
                          e.target.value = '';
                        }} 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 border border-gray-100 rounded-3xl overflow-hidden shadow-inner bg-gray-50/20 group focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent/40 transition-all">
                    <EditorContent 
                      editor={editor} 
                      className="h-full overflow-y-auto no-scrollbar"
                    />
                  </div>
                </div>
              )}
            </div>

            </div>
          </div>
        </div>
      </div>
      {session?.status === 'in_progress' && (
        <ExamProtectionOverlay protection={protection} />
      )}
      
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-md"
          >
            <div className="text-center max-w-md px-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200"
              >
                <CheckCircle2 className="w-16 h-16" />
              </motion.div>
              
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Exam Complete!</h2>
                <p className="text-gray-500 font-medium text-lg mb-10">
                  Your answers have been securely synced and submitted. Great work!
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                    <span>Redirecting to Dashboard</span>
                    <span>{redirectSeconds}s</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.5, ease: "linear" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/student-dashboard')}
                  className="mt-12 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Go Now
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SubjectiveConductExamSessionLeetCode;
