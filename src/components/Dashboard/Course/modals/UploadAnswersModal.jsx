import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  X, Upload, FileArchive, CheckCircle, AlertTriangle,
  Folder, FolderOpen, Image, AlertCircle, Loader2, Search, ChevronDown, Check, Clipboard, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../../BaseURL';

const UploadAnswersModal = ({ isOpen, onClose, courseId, examId, onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('bulk');
  const [zipFile, setZipFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingJobId, setProcessingJobId] = useState(null);
  const [processingJobStartedAt, setProcessingJobStartedAt] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [currentProcessingRoll, setCurrentProcessingRoll] = useState(null);
  const [processingStage, setProcessingStage] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [singleStudents, setSingleStudents] = useState([]);
  const [singleQuestions, setSingleQuestions] = useState([]);
  const [isSingleUploading, setIsSingleUploading] = useState(false);

  // Multi-student upload state — each entry holds its own student + per-question files
  const makeEntry = () => ({ entryId: Date.now() + Math.random(), studentId: '', studentSearch: '', filesByQuestion: {}, dropdownOpen: false, highlightIndex: 0 });
  const [studentEntries, setStudentEntries] = useState([makeEntry()]);
  const [activeEntryId, setActiveEntryId] = useState(studentEntries?.[0]?.entryId);
  const [activeQuestionForPaste, setActiveQuestionForPaste] = useState(null); // { entryId, qn }

  const studentSearchInputRefs = useRef({});
  const singleQuestionFileInputRefs = useRef({});
  const objectUrlMapRef = useRef(new Map());

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }
    setZipFile(file);
    setUploadResults(null);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const fetchStudentsAndQuestionsForSingle = async () => {
    if (!courseId || !examId) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const studentsResp = await fetch(`${API_BASE_URL}/professors/courses/${courseId}/students`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (studentsResp.ok) {
      const studentsJson = await studentsResp.json();
      const students = Array.isArray(studentsJson?.data) ? studentsJson.data : Array.isArray(studentsJson?.data?.students) ? studentsJson.data.students : [];
      setSingleStudents(students);
    }

    const questionsResp = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (questionsResp.ok) {
      const questionsJson = await questionsResp.json();
      const questions = Array.isArray(questionsJson?.data?.questions) ? questionsJson.data.questions : [];
      setSingleQuestions(questions);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab !== 'single') return;

    fetchStudentsAndQuestionsForSingle().catch((e) => {
      console.error('Failed to fetch single upload data:', e);
      toast.error(e?.message || 'Failed to load students/questions');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, courseId, examId]);

  const getStudentLabel = (s) => {
    const name = s?.user_name || s?.name || s?.student_name || '';
    const roll = s?.roll_number || s?.rollNumber || '';
    if (name && roll) return `${name} (${roll})`;
    if (name) return name;
    if (roll) return roll;
    return 'Unknown Student';
  };

  const getFilteredStudents = (search) => {
    const q = (search || '').trim().toLowerCase();
    return (singleStudents || []).filter((s) => {
      if (!q) return true;
      const name = String(s?.user_name || s?.name || s?.student_name || '').toLowerCase();
      const roll = String(s?.roll_number || s?.rollNumber || '').toLowerCase();
      const email = String(s?.user_email || s?.email || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || email.includes(q);
    });
  };

  // Helpers to mutate individual student entries
  const updateEntry = (entryId, patch) =>
    setStudentEntries(prev => prev.map(e => e.entryId === entryId ? { ...e, ...patch } : e));

  const getActiveEntry = () => (studentEntries || []).find((e) => e.entryId === activeEntryId) || (studentEntries || [])[0];

  const addNewEntry = () => {
    const entry = makeEntry();
    setStudentEntries((prev) => ([...(prev || []), entry]));
    setActiveEntryId(entry.entryId);
    setTimeout(() => {
      try {
        studentSearchInputRefs.current?.[String(entry.entryId)]?.focus?.();
      } catch {
        // ignore
      }
    }, 0);
  };

  const removeEntry = (entryId) => {
    setStudentEntries((prev) => {
      const next = (prev || []).filter((e) => e.entryId !== entryId);
      const safe = next.length ? next : [makeEntry()];
      return safe;
    });
    setActiveEntryId((cur) => {
      if (cur !== entryId) return cur;
      const remaining = (studentEntries || []).filter((e) => e.entryId !== entryId);
      return remaining.length ? remaining[0].entryId : undefined;
    });
    setActiveQuestionForPaste((cur) => {
      if (!cur) return cur;
      if (cur.entryId !== entryId) return cur;
      return null;
    });
  };

  const appendFilesToEntryQuestion = (entryId, qn, files) => {
    const nextFiles = (files || []).filter(Boolean);
    if (!nextFiles.length) return;
    setStudentEntries(prev => prev.map(e => {
      if (e.entryId !== entryId) return e;
      const key = String(qn);
      const prevArr = Array.isArray(e.filesByQuestion?.[key]) ? e.filesByQuestion[key] : [];
      return { ...e, filesByQuestion: { ...e.filesByQuestion, [key]: [...prevArr, ...nextFiles] } };
    }));
  };

  const removeFileFromEntryQuestion = (entryId, qn, idx) => {
    setStudentEntries(prev => prev.map(e => {
      if (e.entryId !== entryId) return e;
      const key = String(qn);
      const arr = Array.isArray(e.filesByQuestion?.[key]) ? e.filesByQuestion[key] : [];
      const removed = arr[idx];
      if (removed) revokeObjectUrlForFile(removed);
      return { ...e, filesByQuestion: { ...e.filesByQuestion, [key]: arr.filter((_, i) => i !== idx) } };
    }));
  };

  const getObjectUrlForFile = (file) => {
    if (!file) return '';
    const map = objectUrlMapRef.current;
    const existing = map.get(file);
    if (existing) return existing;
    const url = URL.createObjectURL(file);
    map.set(file, url);
    return url;
  };

const revokeObjectUrlForFile = (file) => {
  const map = objectUrlMapRef.current;
  const url = map.get(file);
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    map.delete(file);
  }
};

  // (entry-based file helpers are used for multi-student upload)

const handleSingleUpload = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast.error('Authentication required');
    return;
  }

  const jobs = (studentEntries || [])
    .map((e) => {
      const studentId = String(e?.studentId || '').trim();
      const entries = Object.entries(e?.filesByQuestion || {}).filter(([, files]) => Array.isArray(files) && files.length > 0);
      return {
        entryId: e.entryId,
        studentId,
        entries,
      };
    })
    .filter((j) => j.studentId && j.entries.length > 0);

  if (!jobs.length) {
    toast.error('Add at least one student and upload at least one question page.');
    return;
  }

  setIsSingleUploading(true);
  const loadingToast = toast.loading('Uploading answer pages...');

  try {
    const results = [];
    for (const job of jobs) {
      const uploadedQuestionNumbers = new Set(job.entries.map(([qn]) => String(qn)));

      for (const [qn, files] of job.entries) {
        const formData = new FormData();
        (files || []).forEach((f) => formData.append('files', f));

        const resp = await fetch(
          `${API_BASE_URL}/exams/${courseId}/exams/${examId}/students/${job.studentId}/questions/${qn}/answer-pages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        const json = await resp.json().catch(() => null);
        if (!resp.ok || json?.code !== 200) {
          const msg = json?.message || json?.detail || `Upload failed for student ${job.studentId} Q${qn}`;
          throw new Error(msg);
        }

        results.push({ studentId: job.studentId, questionNumber: qn, data: json?.data });
      }

      // Clear any questions not uploaded for this student in this run.
      // This makes single-upload behave like a full replace per student.
      for (const q of (singleQuestions || [])) {
        const qn = String(q?.question_number);
        if (!qn) continue;
        if (uploadedQuestionNumbers.has(qn)) continue;

        const resp = await fetch(
          `${API_BASE_URL}/exams/${courseId}/exams/${examId}/students/${job.studentId}/questions/${qn}/answer-pages/clear`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json = await resp.json().catch(() => null);
        if (!resp.ok || json?.code !== 200) {
          const msg = json?.message || json?.detail || `Clear failed for student ${job.studentId} Q${qn}`;
          throw new Error(msg);
        }

        results.push({ studentId: job.studentId, questionNumber: qn, cleared: true, data: json?.data });
      }
    }

    toast.success('Answer pages uploaded successfully.', { id: loadingToast });
    setStudentEntries([makeEntry()]);
    setActiveQuestionForPaste(null);
    if (onUploadSuccess) {
      onUploadSuccess({ mode: 'single', results });
    }
  } catch (e) {
    console.error('Single upload failed:', e);
    toast.error(e?.message || 'Failed to upload answer pages', { id: loadingToast });
  } finally {
    setIsSingleUploading(false);
  }
};

const handleUpload = async () => {
  if (!zipFile) {
    toast.error('Please select a ZIP file first');
    return;
  }

  setIsUploading(true);
  // Reset any stale progress from previous runs
  setProcessingProgress(null);
  setUploadProgress(0);
  setIsProcessing(false);
  setProcessingJobId(null);
  setProcessingJobStartedAt(null);
  const loadingToast = toast.loading('Uploading answer sheets...');

  try {
    let zipKey = null;

    // Step 1: try presigned direct-to-S3 upload (fast path)
    try {
      const presignResp = await fetch(
        `${API_BASE_URL}/exams/${courseId}/exams/${examId}/answers-zip-presign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_name: zipFile.name,
            content_type: zipFile.type || 'application/zip',
            file_size_bytes: zipFile.size,
          }),
        }
      );

      if (!presignResp.ok) {
        throw new Error(`Presign failed: ${presignResp.status}`);
      }

      const presignJson = await presignResp.json();
      const upload = presignJson?.data?.upload;
      const presignedKey = presignJson?.data?.zip_key;
      if (presignJson?.code !== 200 || !upload?.url || !upload?.fields || !presignedKey) {
        throw new Error(presignJson?.message || 'Invalid presign response');
      }

      const s3Form = new FormData();
      Object.entries(upload.fields).forEach(([k, v]) => s3Form.append(k, v));
      s3Form.append('file', zipFile);

      await axios.post(upload.url, s3Form, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent?.total || zipFile.size;
          const loaded = progressEvent?.loaded || 0;
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            setUploadProgress(Math.min(100, Math.max(0, percent)));
          }
        },
      });

      // Verify server-side that the object exists (handles S3 CORS/opaque edge cases)
      const verifyResp = await fetch(
        `${API_BASE_URL}/exams/${courseId}/exams/${examId}/answers-zip-exists?zip_key=${encodeURIComponent(presignedKey)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!verifyResp.ok) {
        throw new Error(`Verify failed: ${verifyResp.status}`);
      }

      const verifyJson = await verifyResp.json();
      if (verifyJson?.code !== 200 || !verifyJson?.data?.exists) {
        throw new Error('Uploaded ZIP not found in S3');
      }

      zipKey = presignedKey;
    } catch (e) {
      // Safe fallback: use existing backend upload endpoint
      const formData = new FormData();
      formData.append('zip_file', zipFile);

      const uploadResp = await axios.post(
        `${API_BASE_URL}/exams/${courseId}/exams/${examId}/upload-answers-zip`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent?.total || zipFile.size;
            const loaded = progressEvent?.loaded || 0;
            if (total > 0) {
              const percent = Math.round((loaded / total) * 100);
              setUploadProgress(Math.min(100, Math.max(0, percent)));
            }
          },
        },
      );

      const uploadJson = uploadResp?.data;
      if (uploadJson.code !== 200 || !uploadJson.data?.zip_key) {
        throw new Error(uploadJson.message || 'Failed to upload ZIP');
      }

      zipKey = uploadJson.data.zip_key;
    }

    toast.loading('Starting background processing of uploaded answers...', { id: loadingToast });

    // Step 2: start async processing of the uploaded ZIP from S3
    const processResp = await fetch(
      `${API_BASE_URL}/exams/${courseId}/exams/${examId}/process-uploaded-answers-async`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zip_key: zipKey }),
      }
    );

    if (!processResp.ok) {
      throw new Error(`Processing failed to start: ${processResp.status}`);
    }

    const processJson = await processResp.json();
    if (processJson.code === 202 && processJson.data?.job_id) {
      toast.success(
        'Answer processing started in background. You can continue while we process the ZIP.',
        { id: loadingToast }
      );

      // Remember that processing is in progress so we can listen for WebSocket updates
      setIsProcessing(true);
      setProcessingJobId(processJson.data.job_id);
      setProcessingJobStartedAt(Date.now());
      setProcessingStage('preprocessing');

      if (onUploadSuccess) {
        onUploadSuccess(processJson.data);
      }
    } else {
      throw new Error(processJson.message || 'Failed to start background processing');
    }
  } catch (error) {
    console.error('Upload/processing error:', error);
    toast.error('Failed to upload or process answer sheets: ' + (error.message || 'Unknown error'), {
      id: loadingToast,
    });
  } finally {
    setIsUploading(false);
  }
};

const handleClose = () => {
  setActiveTab('bulk');
  setZipFile(null);
  setIsProcessing(false);
  setProcessingJobId(null);
  setProcessingJobStartedAt(null);
  setProcessingProgress(null);
  setUploadProgress(null);
  setCurrentProcessingRoll(null);
  setProcessingStage(null);
  setUploadResults(null);
  setSingleStudents([]);
  setSingleQuestions([]);
  setIsSingleUploading(false);
  setStudentEntries([makeEntry()]);
  setActiveEntryId(undefined);
  setActiveQuestionForPaste(null);
  onClose();
};

useEffect(() => {
  return () => {
    try {
      const map = objectUrlMapRef.current;
      for (const url of map.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
      map.clear();
    } catch {
      // ignore
    }
  };
}, []);

useEffect(() => {
  if (!isOpen || activeTab !== 'single') return;

  const onPaste = (e) => {
    try {
      if (!activeQuestionForPaste) return;
      const entry = (studentEntries || []).find((x) => x.entryId === activeQuestionForPaste.entryId);
      if (!entry?.studentId) return;
      const items = Array.from(e?.clipboardData?.items || []);
      const imageItems = items.filter((it) => it && it.kind === 'file' && String(it.type || '').startsWith('image/'));
      if (!imageItems.length) return;

      const files = imageItems
        .map((it, idx) => {
          const f = it.getAsFile();
          if (!f) return null;
          const ext = (f.type && f.type.includes('/')) ? f.type.split('/')[1] : 'png';
          const nextName = `clipboard-${Date.now()}-${idx + 1}.${ext}`;
          try {
            return new File([f], nextName, { type: f.type });
          } catch {
            return f;
          }
        })
        .filter(Boolean);

      if (!files.length) return;
      e.preventDefault();
      appendFilesToEntryQuestion(activeQuestionForPaste.entryId, activeQuestionForPaste.qn, files);
      toast.success(`Added ${files.length} image(s) from clipboard to Q${activeQuestionForPaste.qn}`);
    } catch (err) {
      console.error('Paste handler failed:', err);
    }
  };

  window.addEventListener('paste', onPaste);
  return () => window.removeEventListener('paste', onPaste);
}, [isOpen, activeTab, activeQuestionForPaste, studentEntries]);

// Listen for background processing progress over WebSocket once processing has started
useEffect(() => {
  if (!isOpen || !examId || !isProcessing) return;

  let wsUrl;
  try {
    const base = new URL(API_BASE_URL);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    // exams router is typically mounted at /api/exams, and websocket path is /ws/exams/{exam_id}/progress
    base.pathname = `${base.pathname.replace(/\/+$/, '')}/exams/ws/exams/${examId}/progress`;
    base.search = '';
    wsUrl = base.toString();
  } catch {
    const httpBase = API_BASE_URL.replace(/^https?/, 'ws');
    wsUrl = `${httpBase}/exams/ws/exams/${examId}/progress`;
  }

  let socket;
  try {
    socket = new WebSocket(wsUrl);
  } catch (e) {
    console.error('Failed to open progress WebSocket:', e);
    return;
  }

  const pingInterval = setInterval(() => {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send('ping');
      }
    } catch {
      // ignore
    }
  }, 25000);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data?.event === 'upload_progress' && Number(data.exam_id) === Number(examId)) {
        setProcessingProgress({
          studentsTotal: data.students_total,
          studentsProcessed: data.students_processed,
          totalProcessed: data.total_processed,
          totalFailed: data.total_failed,
        });
        if (typeof data?.current_roll_number !== 'undefined') {
          setCurrentProcessingRoll(data.current_roll_number);
        }
        if (typeof data?.stage !== 'undefined') {
          setProcessingStage(data.stage);
        }
      }
    } catch (err) {
      console.error('Error parsing progress message:', err);
    }
  };

  socket.onerror = (err) => {
    console.error('Progress WebSocket error:', err);
  };

  return () => {
    try {
      clearInterval(pingInterval);
    } catch {
      // ignore
    }
    try {
      socket && socket.close();
    } catch {
      // ignore
    }
  };
}, [isOpen, examId, isProcessing]);

// Poll job status as a fallback (robust even if WebSocket progress doesn't arrive)
useEffect(() => {
  if (!isOpen || !isProcessing || !processingJobId) return;

  let isCancelled = false;
  const startedAt = Date.now();
  const timeoutMs = 4 * 60 * 1000; // 4 minutes total watchdog
  const pendingFailFastMs = 45 * 1000; // if job never leaves pending, fail fast
  const runningNoProgressFailFastMs = 2 * 60 * 1000; // if running but no WS progress seen, fail fast
  const intervalMs = 3000;

  const poll = async () => {
    try {
      const resp = await fetch(
        `${API_BASE_URL}/exams/professor/jobs/answers-processing/${processingJobId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!resp.ok) {
        throw new Error(`Job status fetch failed: ${resp.status}`);
      }

      const json = await resp.json();
      if (isCancelled) return;

      const job = json?.data;
      const status = String(job?.status || '').toLowerCase();
      const jobStartedRaw = job?.started_at || job?.startedAt || job?.started;
      const jobStartedMs = jobStartedRaw ? new Date(jobStartedRaw).getTime() : NaN;

      if (status) {
        setProcessingStage(status);
      }

      // If the job never actually starts, treat it as a failure instead of spinning forever.
      if (status === 'pending') {
        const localStart = processingJobStartedAt || startedAt;
        if (Date.now() - localStart > pendingFailFastMs && !Number.isFinite(jobStartedMs)) {
          setIsProcessing(false);
          toast.error('Processing did not start on the server. Please try uploading again.');
          return;
        }
      }

      // If the job is running but we never receive progress events, fail fast with a clear error.
      if (status === 'running') {
        const localStart = processingJobStartedAt || startedAt;
        const hasAnyProgress =
          !!processingProgress &&
          (Number(processingProgress.studentsTotal) > 0 || Number(processingProgress.totalProcessed) > 0);
        if (!hasAnyProgress && Date.now() - localStart > runningNoProgressFailFastMs) {
          setIsProcessing(false);
          toast.error('Processing is taking too long without progress updates. Please try again.');
          return;
        }
      }

      if (status === 'completed' || status === 'completed_with_errors') {
        setIsProcessing(false);
        toast.success('Answer sheets processing completed.');
        return;
      }

      if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
        setIsProcessing(false);
        const errMsg = job?.error ? String(job.error) : 'Processing failed.';
        toast.error(errMsg);
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        setIsProcessing(false);
        toast.error('Processing is taking too long. Please try again.');
      }
    } catch (e) {
      if (isCancelled) return;
      console.error('Polling job status failed:', e);
      // Keep polling; transient failures are possible (network, server restart)
      if (Date.now() - startedAt > timeoutMs) {
        setIsProcessing(false);
        toast.error('Processing status could not be confirmed (timeout). Please try again.');
      }
    }
  };

  poll();
  const interval = setInterval(poll, intervalMs);

  return () => {
    isCancelled = true;
    clearInterval(interval);
  };
}, [isOpen, isProcessing, processingJobId, processingJobStartedAt, processingProgress]);

// When progress reaches 100%, mark processing as completed and notify the user
useEffect(() => {
  if (!processingProgress) return;

  const { studentsTotal, studentsProcessed } = processingProgress;
  if (studentsTotal && studentsProcessed >= studentsTotal) {
    // Stop listening as an active processing run
    setIsProcessing(false);
    toast.success('Answer sheets processing completed.');
  }
}, [processingProgress]);

const hasAnySingleJobs = (studentEntries || []).some((e) => {
  if (!e?.studentId) return false;
  const vals = Object.values(e?.filesByQuestion || {});
  return vals.some((arr) => Array.isArray(arr) && arr.length > 0);
});

if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col m-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 bg-accent/10 rounded-xl flex-shrink-0">
            <FileArchive className="w-6 h-6 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">Upload Answer Sheets</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload a single <span className="font-medium text-gray-700">.zip</span> with student folders and per-question images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'bulk' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Bulk Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Single Upload
            </button>
          </div>
        </div>

        {!uploadResults ? (
          <>
            {activeTab === 'bulk' && (isUploading || isProcessing || processingProgress) && (
              <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  {processingProgress && processingProgress.studentsTotal &&
                    processingProgress.studentsProcessed >= processingProgress.studentsTotal ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {isUploading
                        ? 'Uploading ZIP and starting answer processing...'
                        : processingProgress &&
                          processingProgress.studentsTotal &&
                          processingProgress.studentsProcessed >= processingProgress.studentsTotal
                          ? 'Answer processing completed.'
                          : 'Processing uploaded answer sheets in the background...'}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      You can keep this window open to monitor progress. Large exams may take a few minutes.
                    </p>
                    {!isUploading && isProcessing && processingStage === 'preprocessing' && (
                      <p className="text-[11px] text-gray-700 mt-1">
                        Preparing ZIP for processing...
                      </p>
                    )}
                    {!isUploading && isProcessing && currentProcessingRoll && (
                      <p className="text-[11px] text-gray-700 mt-1">
                        Currently processing roll number: <span className="font-semibold">{currentProcessingRoll}</span>
                      </p>
                    )}
                    {isUploading && typeof uploadProgress === 'number' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                          <span>Upload progress: {uploadProgress}%</span>
                          <span>{zipFile ? `${(zipFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                        </div>
                        <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {(processingProgress || isProcessing) && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                          <span>
                            Students processed: {processingProgress?.studentsProcessed || 0}
                            {processingProgress?.studentsTotal ? ` / ${processingProgress.studentsTotal}` : ''}
                          </span>
                          <span>
                            Failed: {processingProgress?.totalFailed || 0}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-300"
                            style={{
                              width:
                                processingProgress?.studentsTotal && processingProgress.studentsTotal > 0
                                  ? `${Math.min(
                                    100,
                                    ((processingProgress?.studentsProcessed || 0) / processingProgress.studentsTotal) * 100,
                                  ).toFixed(0)}%`
                                  : '0%',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bulk' ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <FolderOpen className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">ZIP structure (required)</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Keep the folder names consistent so the system can match student IDs and question numbers.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-accent/10 to-white border-b border-gray-200">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                          <FileArchive className="w-4 h-4 text-accent" />
                          <span>Example</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/70 border border-gray-200 text-gray-600">zip tree</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 font-mono text-xs overflow-auto">
                        <div className="space-y-1 text-gray-700">
                          <div className="flex items-center gap-2">
                            <FileArchive className="w-4 h-4 text-accent" />
                            <span className="font-semibold">answers.zip</span>
                          </div>
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-amber-600" />
                              <span className="font-medium text-gray-800">├── student_id-1/</span>
                            </div>
                            <div className="ml-8 space-y-1">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-amber-500" />
                                <span>│   ├── Ans1/</span>
                              </div>
                              <div className="ml-12 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Image className="w-3 h-3 text-emerald-600" />
                                  <span>│   │   ├── Ans1-1.png</span>
                                  <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q1 • page 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Image className="w-3 h-3 text-emerald-600" />
                                  <span>│   │   └── Ans1-2.png</span>
                                  <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q1 • page 2</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-amber-500" />
                                <span>│   ├── Ans2/</span>
                              </div>
                              <div className="ml-12">
                                <div className="flex items-center gap-2">
                                  <Image className="w-3 h-3 text-emerald-600" />
                                  <span>│   │   └── Ans2-1.png</span>
                                  <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Q2 • page 1</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-amber-600" />
                              <span className="font-medium text-gray-800">└── student_id-2/</span>
                            </div>
                            <div className="ml-8">
                              <span className="text-gray-400">...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">Rules</h4>
                          <ul className="mt-2 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Folder: <code className="bg-white px-2 py-0.5 rounded text-xs">student_id-{'{number}'}</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Question folder: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2</code>…</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>File name: <code className="bg-white px-2 py-0.5 rounded text-xs">Ans1-1.png</code>, <code className="bg-white px-2 py-0.5 rounded text-xs">Ans2-1.jpg</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>Supported: PNG, JPG, JPEG</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-red-700">Missing question folder = Question unattempted</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${isDragging
                      ? 'border-accent bg-accent/5'
                      : zipFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-accent/40 hover:bg-accent/5'
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {zipFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <FileArchive className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{zipFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setZipFile(null)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-accent' : 'text-gray-400'}`} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {isDragging ? 'Drop ZIP file here' : 'Upload Answer Sheets ZIP'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag and drop your ZIP file here, or click to browse
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2.5 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md"
                        >
                          Choose ZIP File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Students</div>
                      <div className="text-xs text-gray-500 mt-0.5">Add multiple students and upload their answers in one go.</div>
                      <p className="text-xs text-gray-500 mt-0.5">Select 1 or more images per question. Upload will replace existing pages for that question.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addNewEntry}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Add student
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(studentEntries || []).map((e, idx) => {
                      const active = e.entryId === (activeEntryId || studentEntries?.[0]?.entryId);
                      return (
                        <div
                          key={e.entryId}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${active ? 'border-accent bg-accent/5' : 'border-gray-200 bg-white'}`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveEntryId(e.entryId)}
                            className="text-xs font-medium text-gray-900 max-w-[220px] truncate"
                            title={e.studentId ? e.studentSearch : `Student ${idx + 1}`}
                          >
                            {e.studentId ? (e.studentSearch || `Student ${idx + 1}`) : `Student ${idx + 1}`}
                          </button>
                          {(studentEntries || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEntry(e.entryId)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              aria-label="Remove student"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
                    const active = getActiveEntry();
                    if (!active) return null;
                    const list = getFilteredStudents(active.studentSearch);
                    return (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select student</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="w-4 h-4" />
                          </div>
                          <input
                            ref={(el) => {
                              studentSearchInputRefs.current[String(active.entryId)] = el;
                            }}
                            type="text"
                            value={active.studentSearch}
                            onChange={(ev) => {
                              updateEntry(active.entryId, { studentSearch: ev.target.value, dropdownOpen: true, highlightIndex: 0, studentId: '' });
                            }}
                            onFocus={() => updateEntry(active.entryId, { dropdownOpen: true })}
                            onBlur={() => setTimeout(() => updateEntry(active.entryId, { dropdownOpen: false }), 120)}
                            placeholder="Search by name / roll number / email"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                          <button
                            type="button"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => updateEntry(active.entryId, { dropdownOpen: !active.dropdownOpen })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle student dropdown"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                          {active.dropdownOpen && (
                            <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                              <div className="max-h-64 overflow-auto">
                                {list.length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-gray-500">No matching students.</div>
                                ) : (
                                  list.slice(0, 50).map((s, idx) => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onMouseDown={(ev) => ev.preventDefault()}
                                      onClick={() => updateEntry(active.entryId, { studentId: String(s.id), studentSearch: getStudentLabel(s), dropdownOpen: false })}
                                      className="w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 text-sm hover:bg-gray-50"
                                    >
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{getStudentLabel(s)}</div>
                                        <div className="text-xs text-gray-500 truncate">{s?.email ? String(s.email) : ''}</div>
                                      </div>
                                      {String(active.studentId) === String(s.id) && (
                                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                                      )}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Select a student for the active tab above. Then upload per-question pages below.</div>
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Upload pages per question</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Select 1 or more images per question. Upload will replace existing pages for that question.</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {(!singleQuestions || singleQuestions.length === 0) ? (
                      <div className="text-sm text-gray-500">No questions found for this exam.</div>
                    ) : (
                      singleQuestions
                        .slice()
                        .sort((a, b) => (Number(a.question_number) || 0) - (Number(b.question_number) || 0))
                        .map((q) => {
                          const qn = q.question_number;
                          const active = getActiveEntry();
                          const selectedFiles = active?.filesByQuestion?.[String(qn)] || [];
                          const isPasteTarget =
                            !!activeQuestionForPaste &&
                            activeQuestionForPaste.entryId === active?.entryId &&
                            String(activeQuestionForPaste.qn) === String(qn);

                          return (
                            <div
                              key={qn}
                              className={`rounded-xl border p-4 transition-colors ${isPasteTarget ? 'border-accent bg-accent/5' : 'border-gray-200 bg-white'}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold text-gray-900">Q{qn}</div>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedFiles.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                      {selectedFiles.length ? `${selectedFiles.length} image(s)` : 'No images'}
                                    </span>
                                  </div>
                                  {q.question_text && (
                                    <div className="text-xs text-gray-600 mt-1 line-clamp-3">{q.question_text}</div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!active?.studentId) {
                                        toast.error('Please select a student first');
                                        return;
                                      }
                                      setActiveQuestionForPaste({ entryId: active.entryId, qn });
                                      toast.success(`Now pasting to Q${qn}. Press Ctrl+V to paste images.`);
                                    }}
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${isPasteTarget ? 'bg-white border-accent text-accent' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                    title="Set as paste target"
                                  >
                                    <Clipboard className="w-4 h-4" />
                                    Paste here
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const ref = singleQuestionFileInputRefs.current?.[`${active?.entryId || 'na'}-${String(qn)}`];
                                      ref?.click?.();
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent transition-colors"
                                  >
                                    <Upload className="w-4 h-4" />
                                    Add images
                                  </button>
                                </div>
                              </div>

                              <input
                                ref={(el) => {
                                  const active = getActiveEntry();
                                  singleQuestionFileInputRefs.current[`${active?.entryId || 'na'}-${String(qn)}`] = el;
                                }}
                                type="file"
                                accept="image/png,image/jpg,image/jpeg"
                                multiple
                                onChange={(e) => {
                                  const files = e.target.files ? Array.from(e.target.files) : [];
                                  const active = getActiveEntry();
                                  if (!active?.studentId) {
                                    toast.error('Please select a student first');
                                    e.target.value = '';
                                    return;
                                  }
                                  appendFilesToEntryQuestion(active.entryId, qn, files);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />

                              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {selectedFiles.length === 0 ? (
                                  <div className="col-span-full rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-start gap-3">
                                      <Image className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-800">Add pages for Q{qn}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Use “Add images” or click “Paste here” and press Ctrl+V.</div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  selectedFiles.map((f, idx) => (
                                    <div key={`${f.name}-${idx}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                      <div className="relative aspect-[4/3] bg-gray-50">
                                        <img
                                          src={getObjectUrlForFile(f)}
                                          alt={f?.name || `Q${qn} page ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const active = getActiveEntry();
                                            if (!active) return;
                                            removeFileFromEntryQuestion(active.entryId, qn, idx);
                                          }}
                                          className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 hover:bg-white border border-gray-200 shadow-sm"
                                          aria-label="Remove image"
                                        >
                                          <Trash2 className="w-4 h-4 text-gray-700" />
                                        </button>
                                      </div>
                                      <div className="px-3 py-2">
                                        <div className="text-xs font-medium text-gray-800 truncate">{f?.name || 'Image'}</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">{Math.max(0, (f?.size || 0) / 1024).toFixed(0)} KB</div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Upload Results */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">✅ Upload Complete</h3>
                  <p className="text-sm text-gray-600">
                    Processed {uploadResults.total_processed} students
                    {uploadResults.total_failed > 0 && `, ${uploadResults.total_failed} failed`}
                  </p>
                </div>
              </div>
            </div>

            {uploadResults.warnings && uploadResults.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">⚠️ Warnings:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {uploadResults.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempted
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unattempted
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {uploadResults.processed?.map((student, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.roll_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                            {student.attempted_questions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${student.unattempted_questions > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {student.unattempted_questions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${student.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setUploadResults(null)}
              className="w-full px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!uploadResults && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isUploading || isSingleUploading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          {activeTab === 'bulk' ? (
            <button
              onClick={handleUpload}
              disabled={!zipFile || isUploading || isProcessing}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Answer Sheets
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSingleUpload}
              disabled={isSingleUploading || !hasAnySingleJobs}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSingleUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Pages
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default UploadAnswersModal;
