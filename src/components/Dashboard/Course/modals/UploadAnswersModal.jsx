import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  X, Upload, FileArchive, CheckCircle, AlertTriangle,
  Folder, FolderOpen, Image, AlertCircle, Loader2, Search, ChevronDown, Check, Clipboard, Trash2, Maximize, Minimize
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../../BaseURL';

const UploadAnswersModal = ({ isOpen, onClose, courseId, examId, onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('single');
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [singleStudents, setSingleStudents] = useState([]);
  const [singleQuestions, setSingleQuestions] = useState([]);
  const [isSingleUploading, setIsSingleUploading] = useState(false);
  const [singleStudentListSearch, setSingleStudentListSearch] = useState('');
  const [selectedSingleQuestionNumber, setSelectedSingleQuestionNumber] = useState(null);

  // Multi-student upload state — each entry holds its own student + per-question files
  const makeEntry = () => ({ entryId: Date.now() + Math.random(), studentId: '', studentSearch: '', filesByQuestion: {}, dropdownOpen: false, highlightIndex: 0 });
  const [studentEntries, setStudentEntries] = useState([makeEntry()]);
  const [activeEntryId, setActiveEntryId] = useState(studentEntries?.[0]?.entryId);
  const [activeQuestionForPaste, setActiveQuestionForPaste] = useState(null); // { entryId, qn }

  const studentSearchInputRefs = useRef({});
  const singleQuestionFileInputRefs = useRef({});
  const objectUrlMapRef = useRef(new Map());
  const dropZoneRefs = useRef({});

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
    const readApiError = async (resp, fallbackMessage) => {
      const raw = await resp.text().catch(() => '');
      let json = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      return {
        json,
        message: json?.message || json?.detail || raw || fallbackMessage,
      };
    };

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

        const { json, message } = await readApiError(resp, `Upload failed for student ${job.studentId} Q${qn}`);
        if (!resp.ok || json?.code !== 200) {
          throw new Error(message);
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

        const { json, message } = await readApiError(resp, `Clear failed for student ${job.studentId} Q${qn}`);
        if (!resp.ok || json?.code !== 200) {
          throw new Error(message);
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
    handleClose();
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

  const API_FALLBACK_MAX_BYTES = 10 * 1024 * 1024;
  const isLikelyS3CorsError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toLowerCase();
    return (
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('cors') ||
      message.includes('preflight') ||
      code === 'err_network'
    );
  };

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
      if (zipFile.size > API_FALLBACK_MAX_BYTES && isLikelyS3CorsError(e)) {
        throw new Error(
          'Direct ZIP upload to S3 was blocked by bucket CORS for this site, and this ZIP is too large for the API fallback. Please allow this domain in the S3 bucket CORS policy or increase the API upload size limit.'
        );
      }

      // Fallback: use existing backend upload endpoint for smaller uploads.
      const formData = new FormData();
      formData.append('zip_file', zipFile);

      let uploadResp;
      try {
        uploadResp = await axios.post(
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
      } catch (uploadError) {
        const status = Number(uploadError?.response?.status || 0);
        if (status === 413) {
          throw new Error(
            'The ZIP is larger than the server upload limit (413 Request Entity Too Large). Direct S3 upload also failed, likely because the bucket CORS policy does not allow this domain.'
          );
        }
        throw uploadError;
      }

      const uploadJson = uploadResp?.data;
      if (uploadJson.code !== 200 || !uploadJson.data?.zip_key) {
        throw new Error(uploadJson.message || 'Failed to upload ZIP');
      }

      zipKey = uploadJson.data.zip_key;
    }

    toast.loading('Starting background processing of uploaded answers...', { id: loadingToast });

    // Step 2: start async processing of the uploaded ZIP from S3
    const processResp = await fetch(
      `${API_BASE_URL}/celery/${courseId}/exams/${examId}/process-answers`,
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
  setActiveTab('single');
  setIsFullscreen(false);
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
  setSingleStudentListSearch('');
  setSelectedSingleQuestionNumber(null);
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
      const filesList = e?.clipboardData?.files;
      
      let files = [];
      if (filesList && filesList.length > 0) {
        files = Array.from(filesList).filter((f) => String(f?.type || '').startsWith('image/'));
      }
      
      if (files.length === 0 && items.length > 0) {
        const imageItems = items.filter((it) => it && it.kind === 'file' && String(it.type || '').startsWith('image/'));
        files = imageItems
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
      }

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

  const handleUploadComplete = (status, finalProgress) => {
    setIsProcessing(false);
    
    if (finalProgress) {
      setProcessingProgress(prev => ({
        ...prev,
        ...finalProgress,
        stage: 'completed',
        studentsProcessed: finalProgress.studentsTotal || prev?.studentsTotal || 0
      }));
    }

    const total = finalProgress?.studentsTotal || processingProgress?.studentsTotal || 0;
    const failed = finalProgress?.totalFailed || processingProgress?.totalFailed || 0;
    const successCount = total - failed;

    if (failed === 0) {
      toast.success(`Upload complete: ${total} student answer sheets processed successfully!`);
    } else if (successCount > 0) {
      toast.warning(`Partial success: ${successCount} processed, ${failed} failed.`);
    } else {
      toast.error(`Upload failed: All ${failed} student imports encountered errors.`);
    }

    // Auto-close after a short delay for visual confirmation
    setTimeout(() => {
      if (onUploadSuccess) {
        try {
          onUploadSuccess({ 
            mode: 'bulk', 
            job_id: processingJobId, 
            status, 
            progress: finalProgress || processingProgress,
            autoClosed: true 
          });
        } catch (err) {
          console.error('[UploadAnswersModal] onUploadSuccess callback error:', err);
        }
      }
      handleClose();
    }, 2000);
  };

  useEffect(() => {
  const handleEscKey = (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  document.addEventListener('keydown', handleEscKey);
  return () => {
    document.removeEventListener('keydown', handleEscKey);
  };
}, [isFullscreen]);

// Listen for background processing progress over WebSocket once processing has started
useEffect(() => {
  if (!isOpen || !isProcessing || !processingJobId) return;

  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn('[UploadAnswersModal] No auth token for WebSocket');
    return;
  }

  // Connect to professor notifications WebSocket (same as DashboardLayout)
  // This is where the backend publishes job updates via notifications_manager
  let wsUrl;
  try {
    const base = new URL(API_BASE_URL);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    base.pathname = `${base.pathname.replace(/\/+$/, '')}/exams/ws/professor/notifications`;
    base.search = `?token=${encodeURIComponent(token)}`;
    wsUrl = base.toString();
  } catch {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    wsUrl = `${wsBase}/exams/ws/professor/notifications?token=${encodeURIComponent(token)}`;
  }

  let socket;
  try {
    socket = new WebSocket(wsUrl);
    console.log('[UploadAnswersModal] Connecting to WebSocket:', wsUrl);
  } catch (e) {
    console.error('[UploadAnswersModal] Failed to open WebSocket:', e);
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

  socket.onopen = () => {
    console.log('[UploadAnswersModal] WebSocket connected');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[UploadAnswersModal] Received WebSocket message:', data);
      
      // Listen for job updates (published by notifications_manager)
      if (data?.event === 'job_update' && data?.job?.id === processingJobId) {
        const job = data.job;
        const status = String(job?.status || '').toLowerCase();
        const progress = job?.progress;
        
        console.log('[UploadAnswersModal] Job update received:', { status, progress });
        
        // Update stage
        if (status) {
          setProcessingStage(status);
        }
        
        // Update progress from job document
        if (progress) {
          const newProgress = {
            studentsTotal: progress.total_students || progress.students_total || progress.total || 0,
            studentsProcessed: progress.processed_students || progress.students_processed || progress.completed || 0,
            totalFiles: progress.total_files || 0,
            processedFiles: progress.processed_files || 0,
            totalFailed: progress.failed || 0,
            stage: progress.stage || status
          };
          console.log('[UploadAnswersModal] Updating progress:', newProgress);
          setProcessingProgress(newProgress);
        }
        
        // Handle completion
        if (status === 'completed' || status === 'completed_with_errors') {
          console.log('[UploadAnswersModal] Job completed via WebSocket');
          handleUploadComplete(status, newProgress);
        }
        
        // Handle failure
        if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
          console.log('[UploadAnswersModal] Job failed:', job?.error);
          setIsProcessing(false);
          const errMsg = job?.error ? String(job.error) : 'Processing failed.';
          toast.error(errMsg);
        }
      }
    } catch (err) {
      console.error('[UploadAnswersModal] Error parsing WebSocket message:', err);
    }
  };

  socket.onerror = (err) => {
    console.error('[UploadAnswersModal] WebSocket error:', err);
  };

  socket.onclose = () => {
    console.log('[UploadAnswersModal] WebSocket closed');
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
}, [isOpen, isProcessing, processingJobId]);

// Poll job status as a fallback (robust even if WebSocket progress doesn't arrive)
useEffect(() => {
  if (!isOpen || !isProcessing || !processingJobId) return;

  let isCancelled = false;
  const startedAt = Date.now();
  const timeoutMs = 15 * 60 * 1000; // 15 minutes total watchdog (increased for large batches)
  const pendingFailFastMs = 45 * 1000; // if job never leaves pending, fail fast
  const runningNoProgressFailFastMs = 5 * 60 * 1000; // if running but no WS progress seen, fail fast (increased to 5 min)
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
      // Update progress from job document if available (fallback for WebSocket failures)
      const jobProgress = job?.progress;
      if (jobProgress) {
        const newProgress = {
          studentsTotal: jobProgress.total_students || jobProgress.students_total || jobProgress.total || 0,
          studentsProcessed: jobProgress.processed_students || jobProgress.students_processed || jobProgress.completed || 0,
          totalFiles: jobProgress.total_files || 0,
          processedFiles: jobProgress.processed_files || 0,
          totalFailed: jobProgress.failed || 0,
          stage: jobProgress.stage || status
        };
        console.log('[UploadAnswersModal] Polling: Updating progress:', newProgress);
        setProcessingProgress(newProgress);
        if (jobProgress.stage) setProcessingStage(jobProgress.stage);
      }

      const localStart = processingJobStartedAt || startedAt;
      const hasAnyProgress =
        (!!processingProgress &&
          (Number(processingProgress.studentsTotal) > 0 || Number(processingProgress.totalProcessed) > 0)) ||
        (jobProgress && jobProgress.students_total > 0);

      if (!hasAnyProgress && Date.now() - localStart > runningNoProgressFailFastMs) {
        console.error('[UploadAnswersModal] Timeout: No progress after', runningNoProgressFailFastMs, 'ms');
        setIsProcessing(false);
        toast.error('Processing is taking too long without progress updates. Please check backend logs and try again.');
        return;
      }

      if (status === 'completed' || status === 'completed_with_errors') {
        console.log('[UploadAnswersModal] Job completed via Polling');
        handleUploadComplete(status, {
          studentsTotal: jobProgress?.total_students || jobProgress?.students_total || 0,
          studentsProcessed: jobProgress?.processed_students || jobProgress?.students_processed || 0,
          totalFailed: jobProgress?.failed || 0
        });
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
    toast.success('Answer sheets imported. Use Evaluate All to start AI grading for pending submissions.');
    // Trigger dashboard refresh so enrollments show updated status
    if (onUploadSuccess) {
      try { onUploadSuccess({ mode: 'bulk', job_id: processingJobId, status: 'completed' }); } catch { /* ignore */ }
    }
  }
}, [processingProgress]);

const hasAnySingleJobs = (studentEntries || []).some((e) => {
  if (!e?.studentId) return false;
  const vals = Object.values(e?.filesByQuestion || {});
  return vals.some((arr) => Array.isArray(arr) && arr.length > 0);
});

if (!isOpen) return null;

return (
  <div className={`fixed inset-0 !m-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm ${isFullscreen ? '' : 'px-4 py-4'}`}>
    <div
      className={`bg-white shadow-2xl w-full overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 max-w-none max-h-none rounded-none' : 'rounded-2xl max-w-6xl max-h-[92vh]'}`}
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
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            type="button"
          >
            {isFullscreen ? <Minimize className="w-5 h-5 text-gray-500" /> : <Maximize className="w-5 h-5 text-gray-500" />}
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 min-h-0 p-6 ${activeTab === 'single' ? 'overflow-hidden' : 'overflow-y-auto'}`} style={activeTab === 'single' ? { display: 'flex', flexDirection: 'column' } : {}}>
        <div className="mb-4">
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'single' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Single Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'bulk' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {!uploadResults ? (
          <>
            {activeTab === 'bulk' && (isUploading || isProcessing || processingProgress) && (
              <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  {(processingProgress?.stage === 'completed' || processingProgress?.stage === 'completed_with_errors') ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {isUploading
                        ? 'Uploading ZIP...'
                        : processingProgress?.stage === 'unzipping'
                          ? 'Processing ZIP...'
                          : processingProgress?.stage === 'parsing'
                            ? 'Identifying students...'
                            : (processingProgress?.stage === 'syncing_to_database' || processingProgress?.stage === 'processing')
                              ? 'Processing students...'
                              : (processingProgress?.stage === 'completed' || processingProgress?.stage === 'completed_with_errors')
                                ? 'Import completed successfully'
                                : 'Starting answer processing...'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-8">
                  {/* ZIP Progress Bar (Uploading or Unzipping) */}
                  {(isUploading || processingProgress?.stage === 'unzipping') && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                        <span>
                          {isUploading ? 'Upload Progress' : 'Extracting Files'}
                          {processingProgress?.totalFiles ? `: ${processingProgress.processedFiles} / ${processingProgress.totalFiles}` : ''}
                        </span>
                        <span>{isUploading ? `${uploadProgress || 0}%` : `${Math.round(((processingProgress?.processedFiles || 0) / Math.max(processingProgress?.totalFiles || 1, 1)) * 100)}%`}</span>
                      </div>
                      <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{
                            width: isUploading
                              ? `${uploadProgress || 0}%`
                              : `${((processingProgress?.processedFiles || 0) / Math.max(processingProgress?.totalFiles || 1, 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Parsing Stage Message */}
                  {processingProgress?.stage === 'parsing' && (
                    <div className="flex items-center gap-2 text-[11px] text-green-700 font-medium py-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Found {processingProgress.studentsTotal} students in ZIP</span>
                    </div>
                  )}

                  {/* Students Processing Progress Bar */}
                  {(processingProgress?.stage === 'syncing_to_database' || processingProgress?.stage === 'processing' || (processingProgress?.stage === 'completed' || processingProgress?.stage === 'completed_with_errors')) && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                        <span>
                          Students Processed: {processingProgress?.studentsProcessed || 0} / {processingProgress?.studentsTotal || 0}
                        </span>
                        <span className="text-red-500">
                          {processingProgress?.totalFailed > 0 ? `Failed: ${processingProgress.totalFailed}` : ''}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-300"
                          style={{
                            width: `${((processingProgress?.studentsProcessed || 0) / Math.max(processingProgress?.studentsTotal || 1, 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 pt-1">
                    {processingProgress?.stage === 'completed' || processingProgress?.stage === 'completed_with_errors'
                      ? 'Answer sheets imported. Use Evaluate All to start AI grading.'
                      : 'You can keep this window open to monitor progress. Large exams may take a few minutes.'}
                  </p>
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
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6" style={{ height: 0, flexGrow: 1 }}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">Students</div>
                    <div className="text-xs text-gray-500 mt-0.5">Select a student to upload their answers.</div>
                    <div className="mt-3 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={singleStudentListSearch}
                        onChange={(e) => setSingleStudentListSearch(e.target.value)}
                        placeholder="Search by name / roll / email"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-2">
                    <div className="space-y-2">
                      {(() => {
                        const active = getActiveEntry();
                        const list = getFilteredStudents(singleStudentListSearch);
                        if (!list.length) {
                          return (
                            <div className="px-3 py-3 text-sm text-gray-500">No matching students.</div>
                          );
                        }
                        return list.slice(0, 200).map((s) => {
                          const isActive = String(active?.studentId || '') === String(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                const entry = getActiveEntry() || studentEntries?.[0];
                                if (!entry) return;
                                updateEntry(entry.entryId, { studentId: String(s.id), studentSearch: getStudentLabel(s) });
                              }}
                              className={`w-full text-left rounded-xl border transition-colors px-3 py-3 flex items-start gap-3 ${isActive ? 'border-accent bg-accent/10' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                              <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${isActive ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700'}`}>
                                {(String(s?.roll_number || s?.rollNumber || '').slice(-2) || 'S')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">{getStudentLabel(s)}</p>
                                  {isActive && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{s?.email ? String(s.email) : ''}</p>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>


                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">
                  <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="text-sm text-gray-500">Uploading for</div>
                    <div className="text-lg font-semibold text-gray-900 truncate">
                      {(() => {
                        const active = getActiveEntry();
                        return active?.studentSearch || 'Select a student';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">For each question below, drag/drop or click to upload answer images.</div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {(() => {
                      const active = getActiveEntry();

                      if (!active?.studentId) {
                        return (
                          <div className="p-6">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                              Select a student to begin uploading answers.
                            </div>
                          </div>
                        );
                      }

                      const sorted = (singleQuestions || [])
                        .slice()
                        .sort((a, b) => (Number(a.question_number) || 0) - (Number(b.question_number) || 0));

                      if (!sorted.length) {
                        return (
                          <div className="p-6 text-sm text-gray-500">No questions found for this exam.</div>
                        );
                      }

                      return (
                        <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
                          {sorted.map((q) => {
                            const qn = String(q.question_number);
                            const isActivePaste = activeQuestionForPaste?.entryId === active.entryId && activeQuestionForPaste?.qn === qn;
                            const questionFiles = active.filesByQuestion?.[qn] || [];

                            return (
                              <div key={qn} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                {/* Question header */}
                                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                      <span className="text-sm font-bold text-accent">Q{qn}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                      {q?.question_text ? (
                                        <p className="text-base text-gray-800 font-medium leading-relaxed">{q.question_text}</p>
                                      ) : (
                                        <p className="text-base text-gray-500 italic">Question {qn}</p>
                                      )}
                                    </div>
                                    {questionFiles.length > 0 && (
                                      <span className="flex-shrink-0 text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {questionFiles.length} image{questionFiles.length > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Per-question upload area */}
                                <div className="p-4 space-y-3">
                                  {/* Drop zone — click activates paste target, drag-drop still works */}
                                  <div
                                    ref={(el) => {
                                      dropZoneRefs.current[`${active.entryId}-${qn}`] = el;
                                    }}
                                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target) setIsDragging(false); }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDragging(false);
                                      const files = Array.from(e.dataTransfer.files || []).filter((f) => String(f?.type || '').startsWith('image/'));
                                      if (!files.length) { toast.error('Please drop image files only'); return; }
                                      appendFilesToEntryQuestion(active.entryId, qn, files);
                                    }}
                                    onClick={(e) => {
                                      setActiveQuestionForPaste({ entryId: active.entryId, qn });
                                      setSelectedSingleQuestionNumber(qn);
                                      e.currentTarget.focus();
                                    }}
                                    className={`border-2 border-dashed rounded-xl px-4 py-8 transition-all duration-200 cursor-pointer text-center ${
                                      isActivePaste
                                        ? 'border-accent bg-accent/5'
                                        : 'border-gray-200 hover:border-accent/40 hover:bg-accent/5'
                                    }`}
                                    role="button"
                                    tabIndex={0}
                                    style={{ outline: 'none' }}
                                  >
                                    <Upload className={`w-8 h-8 mx-auto mb-3 ${isActivePaste ? 'text-accent' : 'text-gray-400'}`} />
                                    <p className="text-sm text-gray-600">
                                      {isActivePaste
                                        ? <span className="font-medium text-accent">Paste target active — press Ctrl+V to paste</span>
                                        : 'Drag & drop images here, or use the buttons below'}
                                    </p>
                                  </div>

                                  {/* Two action buttons: paste + upload */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        setActiveQuestionForPaste({ entryId: active.entryId, qn });
                                        setSelectedSingleQuestionNumber(qn);
                                        dropZoneRefs.current[`${active.entryId}-${qn}`]?.focus();
                                      }}
                                      className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                                        isActivePaste
                                          ? 'border-accent bg-accent/10 text-accent'
                                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Clipboard className="w-4 h-4" />
                                      {isActivePaste ? 'Paste target active (Ctrl+V)' : 'Set paste target'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveQuestionForPaste({ entryId: active.entryId, qn });
                                        setSelectedSingleQuestionNumber(qn);
                                        const ref = singleQuestionFileInputRefs.current?.[`${active.entryId}-${qn}`];
                                        ref?.click?.();
                                      }}
                                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Upload className="w-4 h-4" />
                                      Upload images
                                    </button>
                                  </div>

                                  {questionFiles.length > 0 && (
                                    <>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-700">{questionFiles.length} image(s) selected</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            questionFiles.forEach((f) => revokeObjectUrlForFile(f));
                                            updateEntry(active.entryId, { filesByQuestion: { ...active.filesByQuestion, [qn]: [] } });
                                          }}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          Clear
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                        {questionFiles.map((f, idx) => (
                                          <div key={`${f.name}-${idx}`} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                            <div className="relative aspect-[4/3] bg-gray-50">
                                              <img
                                                src={getObjectUrlForFile(f)}
                                                alt={f?.name || `Q${qn} page ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                              />
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeFileFromEntryQuestion(active.entryId, qn, idx); }}
                                                className="absolute top-1 right-1 p-1 rounded bg-white/90 hover:bg-white border border-gray-200 shadow-sm"
                                                aria-label="Remove image"
                                              >
                                                <Trash2 className="w-3 h-3 text-gray-700" />
                                              </button>
                                            </div>
                                            <div className="px-2 py-1">
                                              <div className="text-[10px] text-gray-500 truncate">{f?.name || 'Image'}</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  <input
                                    ref={(el) => {
                                      if (!el) return;
                                      singleQuestionFileInputRefs.current[`${active.entryId}-${qn}`] = el;
                                    }}
                                    type="file"
                                    accept="image/png,image/jpg,image/jpeg"
                                    multiple
                                    onChange={(e) => {
                                      const files = e.target.files ? Array.from(e.target.files) : [];
                                      appendFilesToEntryQuestion(active.entryId, qn, files);
                                      e.target.value = '';
                                    }}
                                    className="hidden"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
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
