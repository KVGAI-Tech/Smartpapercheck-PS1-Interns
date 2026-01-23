import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import {
  Search, Users, CheckCircle, XCircle, Eye, ArrowLeft, Loader,
  Clock, AlertTriangle, Filter, ArrowUp, ArrowDown, PlayCircle,
  BarChart, RefreshCw, List, BarChart2, Star, History, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';
import { Link } from 'react-router-dom';
// Breadcrumbs are already handled by the course/layout components; avoid duplicating them here.
// import Breadcrumbs from '../../../ui/breadcrumbs';

const StudentEvaluationLoader = React.lazy(() => import('./StudentEvaluationLoader'));
const RubricModal = React.lazy(() => import('./RubricModal'));
const EvaluationHistoryModal = React.lazy(() => import('./EvaluationHistoryModal'));

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bgColor: 'bg-accent/5',
      textColor: 'text-accent',
      borderColor: 'border-accent/20',
      icon: <Clock className="w-3 h-3 mr-1.5" />
    },
    completed: {
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      borderColor: 'border-accent/20',
      icon: <CheckCircle className="w-3 h-3 mr-1.5" />
    },
    inProgress: {
      bgColor: 'bg-accent/10',
      textColor: 'text-accent',
      borderColor: 'border-accent/20',
      icon: <Loader className="w-3 h-3 mr-1.5 animate-spin" />
    },
    failed: {
      bgColor: 'bg-rose-100',
      textColor: 'text-rose-800',
      borderColor: 'border-rose-200',
      icon: <XCircle className="w-3 h-3 mr-1.5" />
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center border shadow-sm
      ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Toast = ({ show, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-accent',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: <XCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-accent',
          icon: <Loader className="w-5 h-5" />
        };
    }
  };

  const { bg, icon } = getToastStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 0, x: 100 }}
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 
        ${bg} text-white max-w-md backdrop-blur-sm border border-white/10`}
    >
      <div className="bg-white/20 p-2 rounded-full">
        {icon}
      </div>
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      startValue += increment;
      if (startValue >= value) {
        startValue = value;
        clearInterval(timer);
      }
      setDisplayValue(Math.floor(startValue));
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

const ProgressBar = ({ value, max, color = 'blue' }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const colorStyles = {
    blue: "bg-accent/80",
    green: "bg-accent/80",
    amber: "bg-accent/40",
    red: "bg-red-600/80",
    purple: "bg-accent/80"
  };

  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${colorStyles[color]}`}
      />
    </div>
  );
};

const BatchProcessingIndicator = ({ completed, total }) => {
  return (
    <div className="mt-4 bg-accent/5 border border-accent/10 rounded-lg overflow-hidden">
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="relative w-6 h-6">
            <motion.div
              className="w-6 h-6 rounded-full border-2 border-accent/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <motion.div
              className="absolute inset-0 border-t-2 border-accent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-accent font-medium mb-2">AI Evaluation in Progress</h3>
          <p className="text-sm text-gray-600 mb-3">Processing student submissions. This may take several minutes as our AI analyzes answers in detail.</p>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-accent/80 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-2 text-xs text-accent font-medium flex justify-between">
            <span>{completed} of {total} completed</span>
            <span>{Math.round((completed / total) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamEvaluation = ({ examId, courseId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'student_name', direction: 'asc' });
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [batchEvaluating, setBatchEvaluating] = useState(false);
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState(new Set());
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailEnrollmentId, setDetailEnrollmentId] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [evaluationError, setEvaluationError] = useState({});
  const [evaluationProgress, setEvaluationProgress] = useState({ completed: 0, total: 0, inProgress: [], errors: 0 });
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEnrollmentId, setHistoryEnrollmentId] = useState(null);
  const selectAllCheckboxRef = useRef(null);
  const [showRecheckWindowModal, setShowRecheckWindowModal] = useState(false);
  const [recheckWindowHours, setRecheckWindowHours] = useState(24);
  const [recheckWindowError, setRecheckWindowError] = useState('');
  const [activeEvaluationJobId, setActiveEvaluationJobId] = useState(null);
  const [activeEvaluationJob, setActiveEvaluationJob] = useState(null);
  const evaluationJobPollRef = useRef(null);
  
  const API_TIMEOUT = 600000;
  const MAX_RETRIES = 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ show: true, message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEnrollmentIds(new Set());
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!examId) {
        throw new Error('Exam ID is missing');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data && data.code === 200 && data.data && Array.isArray(data.data.enrollments)) {
        // Get exam full_marks from response if available
        const examFullMarks = data.data.exam?.full_marks || null;

        const formattedStudents = data.data.enrollments.map(student => {
          const status = student.status || 'not_uploaded';
          const hasMarks = student.marks_obtained !== null && student.marks_obtained !== undefined;

          return {
            enrollment_id: student.id,
            student_id: student.student_id,
            exam_id: student.exam_id,
            student_name: student.student_name,
            roll_number: student.roll_number,
            marks_obtained: hasMarks ? student.marks_obtained : null,
            max_marks: student.max_marks || examFullMarks || 0,
            feedback: student.feedback,
            status,
            uploaded_by: student.uploaded_by || null,
            upload_time: student.uploaded_by?.upload_time || null,
            recheck_requested: student.recheck_requested || false,
            recheck_count: student.recheck_count || 0,
            // Consider a student evaluated only when marks are present
            evaluation_status: hasMarks ? 'completed' : 'pending',
            answer_sheet_url: student.answer_sheet_url || null,
          };
        });

        setStudents(formattedStudents);
      } else {
        throw new Error(`Invalid response format from API: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);

      if (error.name === 'AbortError') {
        setError("Request timed out. Please check your network connection and try again.");
      } else if (error.message.includes('NetworkError') || !navigator.onLine) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(error.message || "Failed to load student enrollments. Please try again later.");
      }

      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [examId, retryCount]);

  const stopEvaluationJobPolling = useCallback(() => {
    if (evaluationJobPollRef.current) {
      clearInterval(evaluationJobPollRef.current);
      evaluationJobPollRef.current = null;
    }
  }, []);

  const fetchEvaluationJob = useCallback(async (jobId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/exams/professor/jobs/evaluations/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (!data || data.code !== 200 || !data.data) {
      throw new Error(data?.message || 'Failed to fetch evaluation job');
    }
    return data.data;
  }, []);

  const syncUiWithEvaluationJob = useCallback((job) => {
    const status = job?.status;
    const progress = job?.progress || {};
    const running = status === 'pending' || status === 'running';

    setActiveEvaluationJob(job || null);
    setBatchEvaluating(running);

    setEvaluationProgress({
      completed: Number(progress.completed || 0),
      total: Number(progress.total || 0),
      inProgress: progress.current_enrollment_id ? [Number(progress.current_enrollment_id)] : [],
      errors: Number(progress.failed || 0),
    });
  }, []);

  const pollEvaluationJob = useCallback(async (jobId) => {
    try {
      const job = await fetchEvaluationJob(jobId);
      syncUiWithEvaluationJob(job);

      const status = job?.status;
      const running = status === 'pending' || status === 'running';
      if (!running) {
        stopEvaluationJobPolling();
        setActiveEvaluationJobId(null);
        setActiveEvaluationJob(null);

        const failed = Number(job?.progress?.failed || 0);
        const completed = Number(job?.progress?.completed || 0);
        const total = Number(job?.progress?.total || 0);

        if (failed > 0) {
          showToast(`Evaluation finished: ${completed}/${total}. Failed: ${failed}.`, 'warning', 6000);
        } else {
          showToast(`Evaluation finished: ${completed}/${total}.`, 'success', 6000);
        }

        clearSelection();
        await fetchEnrollments();
      }
    } catch (e) {
      console.error('Evaluation job polling error:', e);
      stopEvaluationJobPolling();
      setBatchEvaluating(false);
      setActiveEvaluationJobId(null);
      setActiveEvaluationJob(null);
      showToast(e.message || 'Failed to track evaluation job', 'error', 6000);
    }
  }, [fetchEvaluationJob, syncUiWithEvaluationJob, stopEvaluationJobPolling, showToast, clearSelection, fetchEnrollments]);

  const startEvaluationJob = useCallback(async (enrollmentIds, forceReevaluate) => {
    if (!examId) {
      throw new Error('Exam ID is missing');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      throw new Error('No students selected');
    }

    const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluations/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        enrollment_ids: enrollmentIds,
        force_reevaluate: Boolean(forceReevaluate),
      }),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const jobId = data?.data?.job_id;
    if (!jobId) {
      throw new Error(data?.message || 'Failed to start evaluation');
    }

    setActiveEvaluationJobId(jobId);
    setBatchEvaluating(true);
    setEvaluationProgress({ completed: 0, total: enrollmentIds.length, inProgress: [], errors: 0 });
    stopEvaluationJobPolling();
    evaluationJobPollRef.current = setInterval(() => {
      pollEvaluationJob(jobId);
    }, 4000);

    await pollEvaluationJob(jobId);
    return jobId;
  }, [examId, pollEvaluationJob, stopEvaluationJobPolling]);

  useEffect(() => {
    return () => {
      stopEvaluationJobPolling();
    };
  }, [stopEvaluationJobPolling]);

  useEffect(() => {
    const resume = async () => {
      try {
        if (!examId) return;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/exams/professor/jobs/evaluations?exam_id=${examId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) return;
        const data = await response.json();
        const jobs = Array.isArray(data?.data?.jobs) ? data.data.jobs : [];
        const active = jobs.find(j => j && (j.status === 'pending' || j.status === 'running'));
        if (!active?.id) return;

        setActiveEvaluationJobId(active.id);
        setBatchEvaluating(true);
        stopEvaluationJobPolling();
        evaluationJobPollRef.current = setInterval(() => {
          pollEvaluationJob(active.id);
        }, 4000);

        await pollEvaluationJob(active.id);
      } catch (e) {
        console.error('Failed to resume evaluation job:', e);
      }
    };

    resume();
  }, [examId, pollEvaluationJob, stopEvaluationJobPolling]);

  const toggleSelectedEnrollment = useCallback((enrollmentId) => {
    setSelectedEnrollmentIds(prev => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) {
        next.delete(enrollmentId);
      } else {
        next.add(enrollmentId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student =>
        (student.student_name?.toLowerCase().includes(query)) ||
        (student.roll_number?.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      const isEvaluated = statusFilter === 'completed';
      result = result.filter(student =>
        isEvaluated ? student.marks_obtained !== null : student.marks_obtained === null
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, statusFilter, students, sortConfig]);

  const isStudentSelectable = useCallback((student) => {
    if (!student || student.status === 'not_uploaded') return false;
    const hasResults = student.marks_obtained !== null;
    const inProgress = evaluationProgress.inProgress.includes(student.enrollment_id) ||
      evaluatingStudent?.enrollment_id === student.enrollment_id;

    if (hasResults) {
      // Already evaluated: can still be re-evaluated (via batch actions)
      return !(inProgress || batchEvaluating || publishing);
    }

    // For initial evaluation, allow both explicit 'uploaded' and 'evaluated' (backend may mark evaluated without marks yet)
    return (student.status === 'uploaded' || student.status === 'evaluated')
      && !hasResults && !inProgress && !batchEvaluating && !publishing;
  }, [evaluationProgress.inProgress, evaluatingStudent, batchEvaluating, publishing]);

  const selectedCount = useMemo(() => selectedEnrollmentIds.size, [selectedEnrollmentIds]);

  const selectableFilteredStudents = useMemo(
    () => filteredStudents.filter(isStudentSelectable),
    [filteredStudents, isStudentSelectable]
  );

  const selectableStudents = useMemo(
    () => students.filter(isStudentSelectable),
    [students, isStudentSelectable]
  );

  const allFilteredSelected = useMemo(() => {
    if (selectableFilteredStudents.length === 0) return false;
    return selectableFilteredStudents.every(s => selectedEnrollmentIds.has(s.enrollment_id));
  }, [selectableFilteredStudents, selectedEnrollmentIds]);

  const allStudentsSelected = useMemo(() => {
    if (selectableStudents.length === 0) return false;
    return selectableStudents.every(s => selectedEnrollmentIds.has(s.enrollment_id));
  }, [selectableStudents, selectedEnrollmentIds]);

  const toggleSelectAllFiltered = useCallback(() => {
    setSelectedEnrollmentIds(prev => {
      if (selectableFilteredStudents.length === 0) return prev;
      const next = new Set(prev);
      const shouldUnselect = selectableFilteredStudents.every(s => next.has(s.enrollment_id));

      selectableFilteredStudents.forEach(student => {
        if (shouldUnselect) {
          next.delete(student.enrollment_id);
        } else {
          next.add(student.enrollment_id);
        }
      });

      return next;
    });
  }, [selectableFilteredStudents]);

  const toggleSelectAllStudents = useCallback(() => {
    setSelectedEnrollmentIds(prev => {
      if (selectableStudents.length === 0) return prev;
      const next = new Set(prev);
      const shouldUnselect = selectableStudents.every(s => next.has(s.enrollment_id));

      selectableStudents.forEach(student => {
        if (shouldUnselect) {
          next.delete(student.enrollment_id);
        } else {
          next.add(student.enrollment_id);
        }
      });

      return next;
    });
  }, [selectableStudents]);

  useEffect(() => {
    if (!selectAllCheckboxRef.current) return;
    const hasSomeSelected = selectableFilteredStudents.some(s => selectedEnrollmentIds.has(s.enrollment_id));
    selectAllCheckboxRef.current.indeterminate = hasSomeSelected && !allFilteredSelected;
  }, [selectableFilteredStudents, selectedEnrollmentIds, allFilteredSelected]);

  const performPublishSelected = useCallback(async (windowHours) => {
    try {
      if (!examId) {
        throw new Error('Exam ID is missing');
      }

      if (selectedEnrollmentIds.size === 0) {
        showToast('Please select at least one student', 'warning');
        return;
      }

      setPublishing(true);
      showToast('Publishing results... This will re-evaluate selected students and send emails.', 'info', 5000);

      const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluations/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollment_ids: Array.from(selectedEnrollmentIds),
          force_reevaluate: true,
          recheck_window_hours: windowHours
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (!data || data.code !== 200) {
        throw new Error(data?.message || 'Failed to publish results');
      }

      const published = data?.data?.published ?? 0;
      const failed = Array.isArray(data?.data?.failed) ? data.data.failed.length : 0;
      const emailsSent = data?.data?.emails_sent ?? 0;

      if (failed > 0) {
        showToast(`Published ${published}. Failed ${failed}. Emails sent: ${emailsSent}.`, 'warning', 6000);
      } else {
        showToast(`Published ${published} results. Emails sent: ${emailsSent}.`, 'success', 6000);
      }

      clearSelection();
      await fetchEnrollments();
    } catch (e) {
      console.error('Publish error:', e);
      showToast(e.message || 'Failed to publish results', 'error', 6000);
    } finally {
      setPublishing(false);
    }
  }, [examId, selectedEnrollmentIds, showToast, clearSelection, fetchEnrollments]);

  const handlePublishSelected = useCallback(() => {
    if (selectedEnrollmentIds.size === 0) {
      showToast('Please select at least one student', 'warning');
      return;
    }

    setShowRecheckWindowModal(true);
  }, [selectedEnrollmentIds, showToast]);

  const handleEvaluate = async (student) => {
    try {
      if (!student || !student.enrollment_id) {
        throw new Error('Invalid student');
      }

      setEvaluationError(prev => ({ ...prev, [student.enrollment_id]: null }));
      showToast('Evaluation started...', 'info', 5000);
      await startEvaluationJob([student.enrollment_id], false);
    } catch (error) {
      console.error("Evaluation error:", error);

      setEvaluationError(prev => ({
        ...prev,
        [student.enrollment_id]: error.message || 'Failed to evaluate submission'
      }));

      if (error.name === 'AbortError') {
        showToast('Evaluation timed out. The AI evaluation process might be taking longer than expected.', 'error');
      } else if (error.message.includes('NetworkError') || !navigator.onLine) {
        showToast('Network error during evaluation. Please check your connection.', 'error');
      } else {
        showToast(error.message || 'Failed to evaluate submission', 'error');
      }
    } finally {
      setEvaluatingStudent(null);
    }
  };

  const handleEvaluateAll = async () => {
    try {
      if (!examId) {
        throw new Error('Exam ID is missing');
      }

      const candidates = students.filter(student =>
        student &&
        student.status !== 'not_uploaded' &&
        student.marks_obtained === null &&
        !isEvaluationInProgress(student)
      );

      if (candidates.length === 0) {
        showToast('No pending uploaded submissions to evaluate.', 'warning', 4000);
        return;
      }

      showToast('Evaluation started...', 'info', 5000);
      await startEvaluationJob(candidates.map(s => s.enrollment_id), false);
    } catch (e) {
      console.error('Evaluate all error:', e);
      showToast(e.message || 'Failed to evaluate all students', 'error', 6000);
    } finally {
    }
  };

  const performReevaluateSelected = useCallback(async () => {
    try {
      if (!examId) {
        throw new Error('Exam ID is missing');
      }

      if (selectedEnrollmentIds.size === 0) {
        showToast('Please select at least one student', 'warning');
        return;
      }

      const selected = students.filter(s => selectedEnrollmentIds.has(s.enrollment_id) && s.status !== 'not_uploaded');
      if (selected.length === 0) {
        showToast('No selectable students found in your selection', 'warning');
        return;
      }

      const evaluatedCount = selected.filter(s => s.marks_obtained !== null && s.marks_obtained !== undefined).length;
      const pendingCount = selected.length - evaluatedCount;

      if (pendingCount > 0 && evaluatedCount > 0) {
        showToast('Selected students include both evaluated and not evaluated. Processing all selected.', 'info', 5000);
      } else if (pendingCount > 0) {
        showToast('Evaluation started...', 'info', 5000);
      } else {
        showToast('Re-evaluation started...', 'info', 5000);
      }

      await startEvaluationJob(selected.map(s => s.enrollment_id), true);
    } catch (e) {
      console.error('Re-evaluate selected error:', e);
      showToast(e.message || 'Failed to re-evaluate selected students', 'error', 6000);
    } finally {
    }
  }, [examId, selectedEnrollmentIds, students, showToast, fetchEnrollments, clearSelection]);

  const hasEvaluationResults = (student) => {
    return student.marks_obtained !== null;
  };

  const isEvaluationInProgress = (student) => {
    return evaluationProgress.inProgress.includes(student.enrollment_id) || 
           evaluatingStudent?.enrollment_id === student.enrollment_id;
  };

  const handleViewRecheckRequest = (student) => {
    window.location.href = `/professor/recheck-requests?examId=${examId}&enrollmentId=${student.enrollment_id}`;
  };
  
  const handleViewResults = (student) => {
    if (!hasEvaluationResults(student)) {
      showToast('No evaluation results available', 'warning');
      return;
    }
    setDetailEnrollmentId(student.enrollment_id);
    setShowDetailView(true);
  };
  
  const stats = useMemo(() => {
    const total = students.length;

    const evaluated = students.filter(
      (s) => s.evaluation_status === 'completed' || s.marks_obtained !== null
    ).length;

    const pending = students.filter(
      (s) =>
        s.status !== 'not_uploaded' &&
        (s.evaluation_status !== 'completed' && s.marks_obtained === null)
    ).length;

    const uploaded = students.filter((s) => s.status && s.status !== 'not_uploaded').length;
    const notUploaded = students.filter((s) => s.status === 'not_uploaded').length;
    const recheckRequested = students.filter((s) => s.recheck_requested).length;

    const evaluatedStudents = students.filter((s) => s.marks_obtained !== null);
    const averageScore = evaluatedStudents.length
      ? Math.round(
          evaluatedStudents.reduce((sum, s) => sum + (s.marks_obtained || 0), 0) /
            Math.max(1, evaluatedStudents.length)
        )
      : 0;

    return {
      total,
      evaluated,
      pending,
      uploaded,
      notUploaded,
      recheckRequested,
      averageScore,
    };
  }, [students]);

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;

    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  }, []);

  const getUploadedBy = (student) => {
    if (student.uploaded_by) {
      if (typeof student.uploaded_by === 'string') {
        return `Uploaded by: ${student.uploaded_by}`;
      }

      if (student.uploaded_by.role === 'professor') {
        return 'Uploaded by: Professor';
      } else if (student.uploaded_by.role === 'student') {
        return `Uploaded by: Student (${student.uploaded_by.name})`;
      } else {
        return `Uploaded by: ${student.uploaded_by.name} (${student.uploaded_by.role})`;
      }
    }

    if (student.status && student.status !== 'not_uploaded') {
      // Treat both 'uploaded' and 'evaluated' (and any future non-empty) as having an upload
      return 'Uploaded';
    }

    return 'Not uploaded';
  };

  const LoadingView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative">
        <motion.div
          className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 border-r-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-blue-300 rounded-full"
          animate={{ rotate: -180 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      <motion.p
        className="mt-6 text-gray-600 font-medium"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading student submissions...
      </motion.p>
    </motion.div>
  );

  const ErrorState = ({ message, onRetry }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-8 text-center"
    >
      <motion.div
        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        whileHover={{ scale: 1.1 }}
      >
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">Unable to Load Data</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        {message || "There was an error loading the student enrollments. Please try again."}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-6 py-3 bg-accent text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
      >
        <RefreshCw className="w-5 h-5" />
        Retry
      </motion.button>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-xl shadow-sm"
    >
      <motion.div
        className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
        whileHover={{ scale: 1.1 }}
      >
        <Users className="w-10 h-10 text-accent" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">No Students Enrolled</h3>
      <p className="text-gray-500 max-w-md mx-auto px-6">
        There are no students enrolled for this exam yet. Once students are enrolled, they will appear here.
      </p>
    </motion.div>
  );

  const StudentGridItem = ({ student, index }) => {
    const hasResults = hasEvaluationResults(student);
    const isInProgress = isEvaluationInProgress(student);
    const status = hasResults || student.status === 'evaluated'
      ? 'completed'
      : isInProgress
        ? 'inProgress'
        : 'pending';
    const delay = 0.05 * (index % 8);
    const hasError = evaluationError[student.enrollment_id];
    
    const canEvaluate = (student.status === 'uploaded' || student.status === 'evaluated')
      && !hasResults && !isInProgress && !batchEvaluating;
    const canReevaluate = hasResults && !isInProgress && !batchEvaluating && !publishing;

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
        whileHover={{ y: -5, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col"
      >
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white font-medium text-lg shadow-md">
              {student.student_name?.charAt(0) || '?'}
            </div>
            <StatusBadge status={status} />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-1">{student.student_name}</h3>
          <p className="text-sm text-gray-500 mb-1">{student.roll_number}</p>
          <p className="text-xs text-gray-400 mb-3">{getUploadedBy(student)}</p>

          {student.recheck_requested && (
            <div className="mb-2 px-2 py-1 bg-accent/10 text-accent text-xs rounded flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Recheck requested
            </div>
          )}

          {hasResults ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Score</span>
                <span className="font-medium text-gray-900">{student.marks_obtained}/{student.max_marks || 0}</span>
              </div>
              <ProgressBar
                value={student.marks_obtained}
                max={student.max_marks || 0}
                color={student.marks_obtained > 80 ? "green" : student.marks_obtained > 60 ? "blue" : "amber"}
              />
            </div>
          ) : (
            <div className="h-7 mb-4">
              {isInProgress ? (
                <p className="text-xs text-accent flex items-center">
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  Evaluation in progress...
                </p>
              ) : batchEvaluating ? (
                <p className="text-xs text-accent flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Waiting for batch evaluation...
                </p>
              ) : hasError ? (
                <p className="text-xs text-rose-600 italic">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {hasError.length > 50 ? hasError.substring(0, 50) + '...' : hasError}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100">
          {hasResults ? (
            student.recheck_requested ? (
              <Link to={`/professor/recheck-requests?examId=${examId}&enrollmentId=${student.enrollment_id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 bg-accent text-white rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">View Recheck</span>
                </motion.button>
              </Link>
            ) : (
              <div className="space-y-2">
                {isInProgress || batchEvaluating ? (
                  <motion.button
                    whileHover={{}}
                    whileTap={{}}
                    disabled
                    className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-wait"
                  >
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Processing...</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewResults(student)}
                    className="w-full py-2 bg-accent text-white rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">View Results</span>
                  </motion.button>
                )}

                {/** Per-student Re-evaluate button hidden; use top toolbar Re-evaluate Selected instead */}
                {false && (
                  <motion.button
                    whileHover={canReevaluate ? { scale: 1.05 } : {}}
                    whileTap={canReevaluate ? { scale: 0.95 } : {}}
                    onClick={() => canReevaluate && handleEvaluate(student)}
                    disabled={!canReevaluate}
                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all
                      ${!canReevaluate ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20'}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="font-medium">Re-evaluate</span>
                  </motion.button>
                )}
              </div>
            )
          ) : student.status !== 'not_uploaded' ? (
            <motion.button
              whileHover={canEvaluate ? { scale: 1.03 } : {}}
              whileTap={canEvaluate ? { scale: 0.97 } : {}}
              onClick={() => canEvaluate && toggleSelectedEnrollment(student.enrollment_id)}
              disabled={!canEvaluate}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all 
                ${isInProgress
                  ? 'bg-accent/10 text-accent cursor-wait'
                  : batchEvaluating
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : !canEvaluate
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : hasError
                        ? 'bg-amber-500 text-white hover:shadow-md'
                        : selectedEnrollmentIds.has(student.enrollment_id)
                          ? 'bg-accent text-white'
                          : 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20'
                }`}
            >
              {isInProgress ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Evaluating...</span>
                </>
              ) : batchEvaluating ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Batch in Progress</span>
                </>
              ) : !canEvaluate ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Cannot Evaluate</span>
                </>
              ) : hasError ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-medium">Retry</span>
                </>
              ) : selectedEnrollmentIds.has(student.enrollment_id) ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Selected</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span className="font-medium">Evaluate</span>
                </>
              )}
            </motion.button>
          ) : (
            <div className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Not Uploaded</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const NavButton = ({ icon: Icon, label, onClick, disabled, variant = "primary" }) => {
    const getStyles = () => {
      switch (variant) {
        case "primary":
          return {
            base: `${disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-accent text-white hover:shadow-lg'}`,
            hover: !disabled && 'hover:scale-105',
            tap: !disabled && 'active:scale-95'
          };
        case "secondary":
          return {
            base: `${disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300'}`,
            hover: !disabled && 'hover:scale-105',
            tap: !disabled && 'active:scale-95'
          };
        case "success":
          return {
            base: `${disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-accent text-white hover:shadow-lg'}`,
            hover: !disabled && 'hover:scale-105',
            tap: !disabled && 'active:scale-95'
          };
        default:
          return {
            base: 'bg-gray-100 text-gray-700',
            hover: !disabled && 'hover:bg-gray-200',
            tap: !disabled && 'active:bg-gray-300'
          };
      }
    };

    const styles = getStyles();

    return (
      <motion.button
        whileHover={styles.hover ? { scale: 1.05 } : {}}
        whileTap={styles.tap ? { scale: 0.95 } : {}}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${styles.base}`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </motion.button>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, percentage }) => {
    const gradients = {
      blue: "bg-white border-gray-200",
      green: "bg-white border-gray-200",
      yellow: "bg-white border-gray-200",
      purple: "bg-white border-gray-200"
    };

    const iconColors = {
      blue: "bg-accent",
      green: "bg-accent",
      yellow: "bg-accent/70",
      purple: "bg-accent"
    };

    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        className={`${gradients[color]} rounded-xl p-6 flex items-center justify-between shadow-sm border`}
      >
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCounter value={value} />
            </p>
            {percentage && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 text-gray-700">
                {percentage}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 ${iconColors[color]} text-white rounded-full flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
      </motion.div>
    );
  };

  const getPublishIndicator = () => {
    if (publishing) return 'Publishing...';
    if (selectedCount === 0) return 'Publish';
    return `Publish (${selectedCount})`;
  };

  const getReevaluateIndicator = () => {
    if (batchEvaluating) return 'Re-evaluating...';
    if (selectedCount === 0) return 'Evaluate / Re-evaluate Selected';

    const selectedStudents = students.filter(s => selectedEnrollmentIds.has(s.enrollment_id));
    const evaluatedCount = selectedStudents.filter(s => s.marks_obtained !== null && s.marks_obtained !== undefined).length;
    const pendingCount = selectedStudents.length - evaluatedCount;

    if (pendingCount > 0 && evaluatedCount === 0) return `Evaluate (${selectedCount})`;
    if (evaluatedCount > 0 && pendingCount === 0) return `Re-evaluate (${selectedCount})`;
    return `Evaluate / Re-evaluate (${selectedCount})`;
  };

  const getProgressIndicator = () => {
    if (!batchEvaluating) return 'Evaluate All';
    
    const { completed, total, inProgress, errors } = evaluationProgress;
    
    if (inProgress.length > 0) {
      return `Evaluating (${completed}/${total})`;
    }
    
    if (errors > 0) {
      return `Processed: ${completed}/${total} (${errors} errors)`;
    }
    
    return `Evaluating (${completed}/${total})`;
  };

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 bg-white overflow-x-hidden">
      {showDetailView ? (
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              className="w-16 h-16 border-4 border-t-accent border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-6 text-gray-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Loading evaluation details...
            </motion.p>
          </div>
        }>
          <StudentEvaluationLoader
            examId={examId}
            enrollmentId={detailEnrollmentId}
            courseId={courseId}
            onClose={() => {
              setShowDetailView(false);
              setDetailEnrollmentId(null);
            }}
            onSaveFeedback={(data) => {
              if (!data) {
                showToast('No feedback data received', 'error');
                return;
              }

              try {
                setStudents(prev => prev.map(s =>
                  s.enrollment_id === detailEnrollmentId
                    ? {
                      ...s,
                      feedback: typeof data.overall_feedback === 'string'
                        ? data.overall_feedback
                        : Array.isArray(data.overall_feedback)
                          ? data.overall_feedback.join('\n')
                          : s.feedback || ''
                    }
                    : s
                ));

                showToast('Feedback saved successfully', 'success');
              } catch (error) {
                console.error('Error saving feedback:', error);
                showToast('Failed to save feedback: ' + error.message, 'error');
              }
            }}
            onError={(errorMessage) => {
              showToast(errorMessage || 'Failed to load evaluation details', 'error');
              setShowDetailView(false);
              setDetailEnrollmentId(null);
            }}
          />
        </Suspense>
      ) : (
        <div className="flex flex-col h-full min-h-0 min-w-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: pageLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col h-full min-h-0 min-w-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-1">
              <StatCard
                icon={Users}
                label="Total Students"
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                label="Evaluated"
                value={stats.evaluated}
                color="green"
                percentage={stats.total ? `${Math.round((stats.evaluated / stats.total) * 100)}%` : "0%"}
              />
              <StatCard
                icon={Clock}
                label="Pending Evaluation"
                value={stats.pending}
                color="yellow"
              />
              <StatCard
                icon={BarChart}
                label="Average Score"
                value={stats.averageScore}
                color="purple"
              />
            </div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-4 md:p-5 mt-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                {/* Left: search + status filter */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 min-w-0">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or student ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-accent focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Evaluated</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Center: view mode + main actions */}
                <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-center">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <BarChart2 className="w-5 h-5" />
                    </button>
                  </div>

                  <NavButton
                    icon={RefreshCw}
                    label="Edit Rubrics"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const response = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          }
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          if (data.code === 200 && data.data) {
                            const questions = data.data.questions || [data.data];
                            setExamQuestions(questions);
                            setShowRubricModal(true);
                          }
                        } else {
                          showToast('Failed to load questions', 'error');
                        }
                      } catch (error) {
                        showToast('Error loading questions: ' + error.message, 'error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    variant="secondary"
                  />

                  <NavButton
                    icon={batchEvaluating ? Loader : PlayCircle}
                    label={getProgressIndicator()}
                    onClick={handleEvaluateAll}
                    disabled={batchEvaluating || stats.pending === 0}
                    variant="success"
                  />

                  <NavButton
                    icon={batchEvaluating ? Loader : RefreshCw}
                    label={getReevaluateIndicator()}
                    onClick={performReevaluateSelected}
                    disabled={publishing || batchEvaluating || selectedCount === 0}
                    variant="secondary"
                  />

                  <NavButton
                    icon={publishing ? Loader : CheckCircle}
                    label={getPublishIndicator()}
                    onClick={handlePublishSelected}
                    disabled={publishing || selectedCount === 0}
                    variant="primary"
                  />
                </div>

                {/* Right side intentionally empty for now (selection handled via table checkbox) */}
              </div>

              {batchEvaluating && (
                <BatchProcessingIndicator 
                  completed={evaluationProgress.completed} 
                  total={evaluationProgress.total} 
                />
              )}
              
            </motion.div>

            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden mt-4 pb-2">
              {loading ? (
                <LoadingView />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={handleRetry}
                />
              ) : students.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {viewMode === 'list' ? (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden min-w-0"
                    >
                      <div className="overflow-x-auto max-w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3.5 w-12">
                                <input
                                  type="checkbox"
                                  ref={selectAllCheckboxRef}
                                  checked={selectableFilteredStudents.length > 0 && allFilteredSelected}
                                  onChange={toggleSelectAllFiltered}
                                  disabled={selectableFilteredStudents.length === 0 || publishing || loading}
                                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer disabled:cursor-not-allowed"
                                  aria-label="Select all visible students"
                                />
                              </th>
                              {[
                                { key: 'student_name', label: 'Student' },
                                { key: 'roll_number', label: 'Roll Number' },
                                { key: 'status', label: 'Upload Status' },
                                { key: 'marks_obtained', label: 'Score' },
                                { key: 'evaluation_status', label: 'Status' },
                                { key: 'actions', label: 'Actions' }
                              ].map((column) => (
                                <th
                                  key={column.key}
                                  onClick={() => column.key !== 'actions' && handleSort(column.key)}
                                  className={`px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none
                                    ${column.key === sortConfig.key ? 'text-accent' : 'text-gray-500'}`}
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>{column.label}</span>
                                    {renderSortIndicator(column.key)}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                              {filteredStudents.map((student, index) => {
                                const hasResults = hasEvaluationResults(student);
                                const isInProgress = isEvaluationInProgress(student);
                                // Row status badge: completed when marks exist, otherwise inProgress/pending
                                const status = hasResults
                                  ? 'completed'
                                  : isInProgress
                                    ? 'inProgress'
                                    : 'pending';
                                const hasError = evaluationError[student.enrollment_id];

                                // Treat any non-'not_uploaded' status as having an uploaded answer sheet
                                const hasUpload = student.status && student.status !== 'not_uploaded';

                                // Per-row evaluate button: enable when there is an upload and this row is not currently in progress or locked by batch
                                const canEvaluate = hasUpload && !isInProgress && !batchEvaluating;
                                const canReevaluate = hasResults && !isInProgress && !batchEvaluating && !publishing;

                                return (
                                  <motion.tr
                                    key={student.enrollment_id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.1 + (index * 0.03) }}
                                    className="hover:bg-gray-50 group"
                                    whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                                  >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedEnrollmentIds.has(student.enrollment_id)}
                                        onChange={() => toggleSelectedEnrollment(student.enrollment_id)}
                                        disabled={!isStudentSelectable(student)}
                                        className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent disabled:cursor-not-allowed"
                                        aria-label={`Select ${student.student_name}`}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-medium shadow-sm group-hover:shadow-md transition-shadow mr-3">
                                          {student.student_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors">
                                            {student.student_name}
                                          </div>
                                          {student.email && (
                                            <div className="text-xs text-gray-500">{student.email}</div>
                                          )}
                                          {student.recheck_requested && (
                                            <div className="text-xs text-amber-700 font-medium flex items-center mt-1">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              Recheck requested
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                        {student.roll_number}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <span className="text-xs">
                                        {getUploadedBy(student)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {hasResults ? (
                                        <div className="flex items-center">
                                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${student.max_marks > 0 ? (student.marks_obtained / student.max_marks) * 100 : 0}%` }}
                                              transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
                                              className={`h-2 rounded-full ${student.marks_obtained >= 60 ? 'bg-accent/80' :
                                                'bg-accent/40'
                                                }`}
                                            />
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {student.marks_obtained}
                                            {student.max_marks ? ` / ${student.max_marks}` : ''}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-500 italic">
                                          {isInProgress ? (
                                            <span className="text-accent flex items-center">
                                              <Loader className="w-3 h-3 mr-1 animate-spin" />
                                              Processing
                                            </span>
                                          ) : batchEvaluating ? (
                                            <span className="text-accent flex items-center">
                                              <Clock className="w-3 h-3 mr-1" />
                                              Batch processing
                                            </span>
                                          ) : hasError ? (
                                            <span className="text-rose-600 flex items-center">
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              Error
                                            </span>
                                          ) : (
                                            "Not evaluated"
                                          )}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <StatusBadge status={status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      {hasResults ? (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          {student.recheck_requested && (
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => handleViewRecheckRequest(student)}
                                              className="inline-flex items-center px-3 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
                                            >
                                              <Eye className="w-4 h-4 mr-1.5" />
                                              View Recheck
                                            </motion.button>
                                          )}
                                          {isInProgress || batchEvaluating ? (
                                            <motion.button
                                              whileHover={{}}
                                              whileTap={{}}
                                              disabled
                                              className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-wait w-full sm:w-auto"
                                            >
                                              <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                                              Processing...
                                            </motion.button>
                                          ) : (
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => handleViewResults(student)}
                                              className="inline-flex items-center px-3 py-1.5 border border-accent/20 text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
                                            >
                                              <Eye className="w-4 h-4 mr-1.5" />
                                              View Results
                                            </motion.button>
                                          )}

                                          {/** Per-row Re-evaluate button hidden; use top toolbar Re-evaluate Selected instead */}
                                          {false && (
                                            <motion.button
                                              whileHover={canReevaluate ? { scale: 1.05 } : {}}
                                              whileTap={canReevaluate ? { scale: 0.95 } : {}}
                                              onClick={() => canReevaluate && handleEvaluate(student)}
                                              disabled={!canReevaluate}
                                              className={`inline-flex items-center px-3 py-1.5 border rounded-lg transition-colors shadow-sm hover:shadow-md w-full sm:w-auto
                                                ${!canReevaluate ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-accent/20 text-accent bg-accent/10 hover:bg-accent/20'}`}
                                            >
                                              <RefreshCw className="w-4 h-4 mr-1.5" />
                                              Re-evaluate
                                            </motion.button>
                                          )}
                                          <motion.button
                                            whileHover={isInProgress || batchEvaluating ? {} : { scale: 1.05 }}
                                            whileTap={isInProgress || batchEvaluating ? {} : { scale: 0.95 }}
                                            onClick={() => {
                                              if (isInProgress || batchEvaluating) return;
                                              setHistoryEnrollmentId(student.enrollment_id);
                                              setShowHistoryModal(true);
                                            }}
                                            disabled={isInProgress || batchEvaluating}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-colors shadow-sm w-full sm:w-auto
                                              ${isInProgress || batchEvaluating
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'border border-accent/20 text-accent bg-accent/10 hover:bg-accent/20'}`}
                                          >
                                            <History className="w-4 h-4 mr-1.5" />
                                            View History
                                          </motion.button>
                                        </div>
                                      ) : student.status !== 'not_uploaded' ? (
                                        <motion.button
                                          whileHover={canEvaluate ? { scale: 1.05 } : {}}
                                          whileTap={canEvaluate ? { scale: 0.95 } : {}}
                                          onClick={() => canEvaluate && handleEvaluate(student)}
                                          disabled={!canEvaluate}
                                          className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:shadow-md
                                            ${isInProgress
                                              ? 'bg-accent/10 text-accent cursor-wait'
                                              : batchEvaluating
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : !canEvaluate
                                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                  : hasError
                                                    ? 'bg-amber-500/80 text-white hover:bg-amber-600/80'
                                                    : 'bg-accent text-white hover:bg-accent/90'
                                            }`}
                                        >
                                          {isInProgress ? (
                                            <>
                                              <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                                              Processing...
                                            </>
                                          ) : batchEvaluating ? (
                                            <>
                                              <Clock className="w-4 h-4 mr-1.5" />
                                              Batch in Progress
                                            </>
                                          ) : !canEvaluate ? (
                                            <>
                                              <XCircle className="w-4 h-4 mr-1.5" />
                                              Cannot Evaluate
                                            </>
                                          ) : hasError ? (
                                            <>
                                              <RefreshCw className="w-4 h-4 mr-1.5" />
                                              Retry
                                            </>
                                          ) : (
                                            <>
                                              <PlayCircle className="w-4 h-4 mr-1.5" />
                                              Evaluate
                                            </>
                                          )}
                                        </motion.button>
                                      ) : (
                                        <span className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                                          <XCircle className="w-4 h-4 mr-1.5" />
                                          Not Uploaded
                                        </span>
                                      )}
                                    </td>
                                  </motion.tr>
                                );
                              })}
                            </AnimatePresence>
                            {filteredStudents.length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                  <div className="flex flex-col items-center">
                                    <Search className="w-10 h-10 text-gray-300 mb-3" />
                                    <p>No students match your search criteria</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      {filteredStudents.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm"
                        >
                          <div className="flex flex-col items-center">
                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              No students match your search criteria. Try adjusting your filters.
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        filteredStudents.map((student, index) => (
                          <StudentGridItem
                            key={student.enrollment_id || index}
                            student={student}
                            index={index}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      
      <AnimatePresence>
        {showRecheckWindowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!publishing) {
                setShowRecheckWindowModal(false);
                setRecheckWindowError('');
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Set Recheck Window</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    After this time, students will no longer be able to submit recheck requests for the published results.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!publishing) {
                      setShowRecheckWindowModal(false);
                      setRecheckWindowError('');
                    }
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recheck window (in hours)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={recheckWindowHours}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        setRecheckWindowHours(isNaN(value) ? '' : value);
                        setRecheckWindowError('');
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">hours</span>
                  </div>
                  {recheckWindowError && (
                    <div className="mt-1 flex items-center text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>{recheckWindowError}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5" />
                  <p>
                    You can change this window later only by republishing. Make sure this gives students enough time to raise valid concerns.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!publishing) {
                      setShowRecheckWindowModal(false);
                      setRecheckWindowError('');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={publishing}
                  onClick={async () => {
                    const hours = typeof recheckWindowHours === 'number' ? recheckWindowHours : parseInt(recheckWindowHours, 10);
                    if (!hours || hours <= 0) {
                      setRecheckWindowError('Please enter a valid number of hours greater than 0.');
                      return;
                    }
                    setRecheckWindowError('');
                    setShowRecheckWindowModal(false);
                    await performPublishSelected(hours);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg text-white flex items-center gap-2 ${
                    publishing ? 'bg-accent/70 cursor-not-allowed' : 'bg-accent hover:bg-accent/90'
                  }`}
                >
                  {publishing && <Loader className="w-4 h-4 animate-spin" />}
                  <span>Confirm & Publish</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showRubricModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <Loader className="w-8 h-8 animate-spin text-accent" />
            </div>
          </div>
        }>
          <RubricModal
            isOpen={showRubricModal}
            onClose={() => {
              setShowRubricModal(false);
              setExamQuestions([]);
            }}
            examId={examId}
            questions={examQuestions}
            onSave={async (data) => {
              showToast('Rubrics updated successfully! You can now re-evaluate students.', 'success');
              setShowRubricModal(false);
              setExamQuestions([]);
              return data;
            }}
          />
        </Suspense>
      )}

      {showHistoryModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <Loader className="w-8 h-8 animate-spin text-accent" />
            </div>
          </div>
        }>
          <EvaluationHistoryModal
            isOpen={showHistoryModal}
            onClose={() => {
              setShowHistoryModal(false);
              setHistoryEnrollmentId(null);
            }}
            examId={examId}
            enrollmentId={historyEnrollmentId}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExamEvaluation;
