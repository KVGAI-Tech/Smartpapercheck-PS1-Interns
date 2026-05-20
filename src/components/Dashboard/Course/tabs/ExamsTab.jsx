import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Plus, Edit2, Trash2,
  ChevronRight, Calendar, Upload,
  Users, PlayCircle, X, AlertCircle, CheckCircle, BarChart3,
  Check, History, Loader2, Layout, FileText, Brain, ClipboardList, ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { studentApi } from './studentApi';
import UploadQnAModal from '../modals/UploadQnAModal';
import RubricModal from '../modals/RubricModal';
import UploadAnswersModal from '../modals/UploadAnswersModal';
import { API_BASE_URL } from '../../../../BaseURL';
import { getExamVariant, isPortalMcqExam, isSubjectiveConductExam } from '../../../examTypeUtils';

const formatExamDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all duration-300 ${
        type === 'success' ? 'bg-accent text-white' : 'bg-red-500 text-white'
      } ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
    </div>
  );
};

const DEFAULT_ONLINE_SECURITY_CONFIG = {
  require_fullscreen: true,
  require_camera: true,
  track_tab_switching: true,
  disable_copy_paste: true,
  auto_submit_on_violation: false,
  violation_limit: 5,
};

const normalizeSecurityConfig = (config = {}) => ({
  ...DEFAULT_ONLINE_SECURITY_CONFIG,
  ...(config || {}),
  violation_limit: Math.max(1, Number(config?.violation_limit || DEFAULT_ONLINE_SECURITY_CONFIG.violation_limit)),
});

const OnlineExamSecurityModal = ({
  exam,
  onClose,
  onSave,
  saving = false,
}) => {
  const [config, setConfig] = useState(() => normalizeSecurityConfig(exam?.online_exam_security_config));

  useEffect(() => {
    setConfig(normalizeSecurityConfig(exam?.online_exam_security_config));
  }, [exam]);

  if (!exam) return null;

  const updateConfig = (key, value) => {
    setConfig((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              Online Exam Security
            </div>
            <h3 className="text-xl font-black text-gray-900">{exam.exam_name}</h3>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Defaults are enabled for all online exams. Change these only when this exam needs a different policy.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['require_fullscreen', 'Require fullscreen'],
              ['require_camera', 'Require camera preview'],
              ['track_tab_switching', 'Track tab switching'],
              ['disable_copy_paste', 'Restrict copy/paste'],
              ['auto_submit_on_violation', 'Auto-submit at limit'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(config[key])}
                  onChange={(event) => updateConfig(key, event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <label className="block text-xs font-black uppercase tracking-[0.16em] text-gray-500">
              Violation warning limit
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.violation_limit}
              onChange={(event) => updateConfig('violation_limit', event.target.value === '' ? '' : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(exam, normalizeSecurityConfig(config))}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-black text-white shadow-sm transition hover:bg-accent/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Security
          </button>
        </div>
      </div>
    </div>
  );
};

  const StepDot = ({ number, isActive, isCompleted, onClick }) => (
    <button
      onClick={onClick}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center text-base 
        font-semibold cursor-pointer transition-all duration-300 transform hover:scale-110
        ${isActive 
          ? 'bg-accent text-white shadow-md' 
          : isCompleted 
            ? 'bg-accent/10 text-accent border-2 border-accent' 
            : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-accent/30'
        }`}
    >
      {isCompleted ? (
        <Check className="w-6 h-6" />
      ) : (
        <span>{number}</span>
      )}
    </button>
  );
  const StepConnector = ({ isActive, isCompleted }) => (
    <div className="flex-1 px-2 sm:px-6 flex items-center">
      <div className="w-full relative h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`absolute inset-0 h-full rounded-full transition-all duration-500 ease-in-out
            ${isCompleted 
              ? 'bg-accent w-full' 
              : isActive 
                ? 'bg-accent/70 w-1/2'
                : 'w-0'
            }`}
        />
      </div>
    </div>
  );
  
  
  const EditExamModal = ({ isOpen, onClose, exam, onSave }) => {
    const [examName, setExamName] = useState('');
    const [fullMarks, setFullMarks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  
    useEffect(() => {
      if (isOpen && exam) {
        setExamName(exam.exam_name || '');
        setFullMarks(exam.full_marks || exam.maxMarks || '');
        setError('');
      }
    }, [isOpen, exam]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!examName.trim()) {
        setError('Exam name is required');
        return;
      }
      
      if (!fullMarks || fullMarks <= 0) {
        setError('Please enter valid marks');
        return;
      }
  
      setIsLoading(true);
      setError('');
  
      try {
        await onSave({
          ...exam,
          exam_name: examName.trim(),
          full_marks: parseInt(fullMarks)
        });
        onClose();
      } catch (error) {
        setError(error.message || 'Failed to update exam');
      } finally {
        setIsLoading(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
        <div
          className="bg-white rounded-xl p-6 max-w-md w-full m-4 shadow-xl transform transition-all duration-300 scale-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Exam</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="Enter exam name"
                disabled={isLoading}
                required
              />
            </div>
  
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Marks
              </label>
              <input
                type="number"
                value={fullMarks}
                onChange={(e) => setFullMarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="Enter total marks"
                min="1"
                disabled={isLoading}
                required
              />
            </div>
  
            {error && (
              <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
  
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
                  transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-accent text-white rounded-lg 
                  hover:bg-accent transition-colors disabled:bg-accent/40
                  disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Update Exam
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const AnswerUploadModal = ({ isOpen, onClose, examId, courseId, onUpload }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
  
    useEffect(() => {
      if (isOpen && !courseId) {
        console.error('CourseId is undefined in AnswerUploadModal');
        setError('Course ID is missing. Please try again or contact support.');
      }
    }, [isOpen, courseId]);
  
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && (droppedFile.type === 'application/zip' || droppedFile.name.endsWith('.zip'))) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid ZIP file');
      }
    };
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile && (selectedFile.type === 'application/zip' || selectedFile.name.endsWith('.zip'))) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid ZIP file');
        setFile(null);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        setError('Please select a file');
        return;
      }
  
    if (!courseId) {
      setError('Course ID is missing. Please try again or contact support.');
      return;
    }

    const API_FALLBACK_MAX_BYTES = 10 * 1024 * 1024;
    const isLikelyS3CorsError = (error) => {
      const message = String(error?.message || '').toLowerCase();
      return (
        message.includes('failed to fetch') ||
        message.includes('cors') ||
        message.includes('preflight') ||
        message.includes('network')
      );
    };
  
      setIsUploading(true);

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
                file_name: file.name,
                content_type: file.type || 'application/zip',
                file_size_bytes: file.size,
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
          s3Form.append('file', file);

          const s3Resp = await fetch(upload.url, {
            method: 'POST',
            body: s3Form,
          });

          if (!s3Resp.ok) {
            throw new Error(`S3 upload failed: ${s3Resp.status}`);
          }

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
          if (file.size > API_FALLBACK_MAX_BYTES && isLikelyS3CorsError(e)) {
            throw new Error(
              'Direct ZIP upload to S3 was blocked by bucket CORS for this site, and this ZIP is too large for the API fallback. Please allow https://smartpapercheck.com in the S3 bucket CORS policy or increase the API upload size limit.'
            );
          }

          // Fallback: use existing backend upload endpoint for smaller uploads.
          const formData = new FormData();
          formData.append('zip_file', file);

          const uploadResp = await fetch(
            `${API_BASE_URL}/exams/${courseId}/exams/${examId}/upload-answers-zip`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: formData,
            }
          );

          if (!uploadResp.ok) {
            if (uploadResp.status === 413) {
              throw new Error(
                'The ZIP is larger than the server upload limit (413 Request Entity Too Large). Direct S3 upload also failed, likely because the bucket CORS policy does not allow https://smartpapercheck.com.'
              );
            }
            throw new Error(`Upload failed: ${uploadResp.status}`);
          }

          const uploadJson = await uploadResp.json();
          if (uploadJson.code !== 200 || !uploadJson.data?.zip_key) {
            throw new Error(uploadJson.message || 'Failed to upload ZIP');
          }

          zipKey = uploadJson.data.zip_key;
        }

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
        await onUpload(processJson);
        onClose();
      } catch (error) {
        console.error('Error uploading/processing answers:', error);
        setError(error.message || 'Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-xl p-6 max-w-md w-full m-4 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Upload Answer Sheets</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div
              className={`mb-6 relative transition-all ${dragActive ? 'ring-2 ring-accent' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8
                text-center hover:border-accent transition-colors">
                <div className="mb-4">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your ZIP file here, or
                  </p>
                  <label className="inline-block px-4 py-2 bg-accent/10 text-accent
                    rounded-lg cursor-pointer hover:bg-accent/20 transition-colors">
                    Browse Files
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {file && (
                  <div className="text-sm text-gray-600 mt-2">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
  
            {error && (
              <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
  
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg
                  transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !file || !courseId}
                className="px-4 py-2 bg-accent text-white rounded-lg 
                  hover:bg-accent transition-colors disabled:bg-accent/40
                  disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const ExamCard = ({
    exam,
    onEdit,
    onDelete,
    onUploadQnA,
    onGenerateRubrics,
    onUploadAnswers,
    onGetEnrollments,
    onReviewPortalAttempts,
    onStartEvaluation,
    onToggleExamActive,
    onOpenSecurity,
    isTogglingActive = false,
    initialStep = 0,
    onStepChange,
  }) => {
    const [activeStep, setActiveStep] = useState(Math.min(2, initialStep || 0));
    const [showTooltip, setShowTooltip] = useState(false);
    const examVariant = getExamVariant(exam);
    const isPortalExam = examVariant === 'portal_mcq';
    const isSubjectiveConduct = examVariant === 'conduct';

    useEffect(() => {
      setActiveStep(Math.min(2, initialStep || 0));
    }, [initialStep]);

    const allStepsCompleted = Number(initialStep || 0) >= 3;

    const steps = [
      {
        label: isPortalExam ? 'Build MCQ Questions' : isSubjectiveConduct ? 'Build Subjective Questions' : 'Upload Q&A',
        description: isPortalExam ? 'Create portal MCQ questions and options' : isSubjectiveConduct ? 'Create and edit subjective questions' : 'Upload your question paper',
        icon: Upload,
        action: () => onUploadQnA(exam.id)
      },
      {
        label: isPortalExam ? 'Activation' : 'Generate Rubrics',
        description: isPortalExam ? `Current: ${exam?.is_active ? 'Active' : 'Inactive'}` : 'Create marking criteria',
        icon: CheckCircle,
        action: () => (isPortalExam ? onToggleExamActive(exam) : onGenerateRubrics(exam.id))
      },
      {
        label: isPortalExam ? 'Track Attempts' : isSubjectiveConduct ? 'Review Submissions' : 'Upload Answer Sheets',
        description: isPortalExam ? 'Review enrollments and submissions' : isSubjectiveConduct ? 'Grade submitted conduct exam answers' : 'Upload student answer files',
        icon: Upload,
        action: () => (isPortalExam ? onReviewPortalAttempts(exam.id) : isSubjectiveConduct ? onStartEvaluation(exam) : onUploadAnswers(exam.id))
      }
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100
        transition-all duration-300 hover:shadow-lg">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all bg-accent/10 text-accent cursor-help hover:bg-accent hover:text-white group shadow-sm"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {isPortalExam ? <ClipboardList className="w-5 h-5 transition-transform group-hover:scale-110" /> : 
                   isSubjectiveConduct ? <FileText className="w-5 h-5 transition-transform group-hover:scale-110" /> : 
                   <Brain className="w-5 h-5 transition-transform group-hover:scale-110" />}
                </div>

                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg shadow-2xl whitespace-nowrap pointer-events-none border border-white/10"
                    >
                      <span className="relative z-10">{isPortalExam || isSubjectiveConduct ? 'Online Exam' : 'Offline Exam'}</span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-gray-900/95" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {exam.exam_name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatExamDate(exam.created_at || exam.start_time || exam.date)}
                  </div>
                  <div className="w-px h-3 bg-gray-300 hidden sm:block" />
                  <span className="font-semibold text-gray-600">{exam.full_marks || exam.maxMarks || 100} marks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => onGetEnrollments(exam.id)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 
                rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="sm:hidden">Enroll</span>
              <span className="hidden sm:inline">Manage Enrollments</span>
            </button>
            <button
              onClick={() => onStartEvaluation(exam)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-white bg-accent hover:bg-accent/90
                rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Evaluate</span>
            </button>
            {(isPortalExam || isSubjectiveConduct) && (
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenSecurity(exam)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-bold text-accent transition hover:bg-accent/10 sm:flex-none"
                  title="Online exam security settings"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Security
                </button>
                <label className={`inline-flex flex-1 items-center justify-center gap-3 rounded-lg border px-3 py-2 transition-colors sm:flex-none sm:px-4 ${
                  isTogglingActive ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                } ${exam?.is_active ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <span className="text-sm font-medium">
                    {exam?.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(exam?.is_active)}
                    disabled={isTogglingActive}
                    onChange={() => onToggleExamActive(exam)}
                    className="sr-only"
                  />
                  <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    exam?.is_active ? 'bg-green-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      exam?.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 sm:ml-2">
              <button
                onClick={() => onEdit(exam)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg
                  hover:bg-gray-50 transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(exam)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg
                  hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-10 bg-white">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-8">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <StepDot
                    number={index + 1}
                    isActive={!allStepsCompleted && activeStep === index}
                    isCompleted={allStepsCompleted ? true : index < activeStep}
                    onClick={() => {
                      setActiveStep(index);
                      if (onStepChange) {
                        onStepChange(index);
                      }
                      step.action();
                    }}
                  />
                  {index < steps.length - 1 && (
                    <StepConnector
                      isActive={activeStep > index}
                      isCompleted={allStepsCompleted ? true : index < activeStep}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div key={activeStep} className="text-center mb-4 transition-all duration-300">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-accent/10 rounded-full mb-2 transform transition-all">
                  {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6 text-accent' })}
                </div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {steps[activeStep].label}
                </h4>
                <p className="text-sm text-gray-500">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>

            <button
              onClick={steps[activeStep].action}
              className="mt-4 px-6 py-2.5 bg-accent text-white rounded-full flex items-center gap-2
                shadow-md hover:shadow-lg hover:bg-accent transition-all duration-300 transform hover:scale-105"
            >
              {React.createElement(steps[activeStep].icon, { className: 'w-4 h-4' })}
              <span>{steps[activeStep].label}</span>
            </button>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  const nextStep = Math.max(0, activeStep - 1);
                  setActiveStep(nextStep);
                  if (onStepChange) {
                    onStepChange(nextStep);
                  }
                }}
                disabled={activeStep === 0}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50
                  disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 transform rotate-180" />
              </button>
              <div className="text-sm text-gray-500">
                Step {activeStep + 1} of {steps.length}
              </div>
              <button
                onClick={() => {
                  const nextStep = Math.min(steps.length - 1, activeStep + 1);
                  setActiveStep(nextStep);
                  if (onStepChange) {
                    onStepChange(nextStep);
                  }
                }}
                disabled={activeStep === steps.length - 1}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50
                  disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const EnrollmentsModal = ({ isOpen, onClose, examId, courseId, onEnrollmentChange }) => {
    if (!isOpen) return null;

    const [enrolledStudents, setEnrolledStudents] = useState(new Set());
    const [tempEnrolledStudents, setTempEnrolledStudents] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
    const [error, setError] = useState('');
    const [enrollmentDetails, setEnrollmentDetails] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});

    // Debounce search input
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query for students (reverted from infinite to simple)
    const {
      data: studentsData = [],
      isLoading: isLoadingStudents,
      error: studentQueryError,
      refetch: refetchStudents
    } = useQuery({
      queryKey: ['course-students', courseId],
      queryFn: () => studentApi.getStudents(courseId),
      enabled: isOpen && !!courseId,
      staleTime: 5 * 60 * 1000, // Issue 3: Add caching
    });

    const filteredStudents = useMemo(() => {
      let students = Array.isArray(studentsData) ? studentsData : (studentsData?.students || []);
      if (debouncedSearch) {
        const lSearch = debouncedSearch.toLowerCase();
        students = students.filter(s => 
          s.name?.toLowerCase().includes(lSearch) || 
          s.user_name?.toLowerCase().includes(lSearch) ||
          s.email?.toLowerCase().includes(lSearch) ||
          s.user_email?.toLowerCase().includes(lSearch) ||
          s.roll_number?.toLowerCase().includes(lSearch)
        );
      }
      return students;
    }, [studentsData, debouncedSearch]);

    const allStudentsInCourse = useMemo(() => {
      // For now, we'll use the loaded students. 
      // In a real scenario, we might need a separate API to get all IDs.
      return filteredStudents;
    }, [filteredStudents]);

    const getStudentDetails = useCallback((studentId) => {
      return (enrollmentDetails || []).find(e => e.student_id === studentId) || {};
    }, [enrollmentDetails]);

    const handleSelectAllInCourse = useCallback(() => {
      // This is a simplified version that selects all LOADED students.
      const allIds = filteredStudents.map(s => s.id);
      setTempEnrolledStudents(new Set(allIds));
    }, [filteredStudents]);

    const handleSubmit = async () => {
      setIsFetchingMetadata(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            student_ids: Array.from(tempEnrolledStudents),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to sync enrollments');
        }

        await fetchEnrollments();
        if (onEnrollmentChange) onEnrollmentChange();
        onClose();
      } catch (err) {
        console.error('Error syncing enrollments:', err);
        setError(err.message);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    useEffect(() => {
      if (isOpen && examId) {
        fetchEnrollments();
        // Since useInfiniteQuery handles its own fetching, we don't need a manual refetch here
        // unless we want to reset the search or similar.
      }
    }, [isOpen, examId]);

    const fetchEnrollments = async () => {
      setIsFetchingMetadata(true);
      setError('');
      try {
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!enrollmentsResponse.ok) throw new Error('Failed to fetch enrollments');

        const enrollmentsData = await enrollmentsResponse.json();
        if (enrollmentsData.code !== 200) throw new Error(enrollmentsData.message || 'Failed to fetch enrollments');

        let allEnrollments = [];
        let counts = {};
        
        const rawData = enrollmentsData.data;
        if (Array.isArray(rawData)) {
          rawData.forEach(item => {
            if (item?.enrollments) {
              allEnrollments = [...allEnrollments, ...item.enrollments];
              if (item.status_counts) counts = item.status_counts;
            } else if (item?.student_id) {
              allEnrollments.push(item);
            }
          });
        } else if (rawData?.enrollments) {
          allEnrollments = rawData.enrollments;
          counts = rawData.status_counts || {};
        }

        setEnrollmentDetails(allEnrollments);
        setStatusCounts(counts);

        const enrolledIds = new Set(
          allEnrollments
            .filter(e => e?.student_id || e?.id)
            .map(e => e.student_id || e.id)
        );

        setEnrolledStudents(enrolledIds);
        setTempEnrolledStudents(new Set(enrolledIds));
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError(err.message);
      } finally {
        setIsFetchingMetadata(false);
      }
    };

    // Memoized Enrollment Row Component
    const EnrollmentRow = React.memo(({ 
      student, 
      details, 
      isEnrolled, 
      onToggle 
    }) => {
      return (
        <div
          className={`group flex items-center justify-between p-4 hover:bg-gray-50 transition-all ${
            isEnrolled ? 'bg-accent/[0.02]' : ''
          }`}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnrolled}
                onChange={() => onToggle(student.id)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center">
                <Check className={`w-3.5 h-3.5 text-white transition-opacity ${isEnrolled ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </label>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 border border-accent/10">
              <span className="text-sm font-bold text-accent">
                {student.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{student.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {student.roll_number && (
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    Roll: {student.roll_number}
                  </span>
                )}
                <span className="text-xs text-gray-500 truncate max-w-[150px]">{student.email}</span>
                {details.status && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    details.status === 'evaluated' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {details.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          {details.marks_obtained !== null && details.marks_obtained !== undefined && (
            <div className="ml-4 px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm text-sm font-bold text-gray-700">
              {details.marks_obtained}/{details.max_marks || 0}
            </div>
          )}
        </div>
      );
    });

    const handleToggleStudentCell = React.useCallback((studentId) => {
      setTempEnrolledStudents(prev => {
        const newSet = new Set(prev);
        if (newSet.has(studentId)) {
          newSet.delete(studentId);
        } else {
          newSet.add(studentId);
        }
        return newSet;
      });
    }, []);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Enrollments</h2>
              <p className="text-sm text-gray-500">Select students to enroll in this exam</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              disabled={isFetchingMetadata}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {Object.keys(statusCounts).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Not Uploaded', count: statusCounts.not_uploaded, color: 'text-gray-600', bg: 'bg-gray-100' },
                  { label: 'Uploaded', count: statusCounts.uploaded, count_key: 'uploaded', color: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Evaluated', count: statusCounts.evaluated, color: 'text-accent', bg: 'bg-accent/10' },
                  { label: 'Recheck', count: statusCounts.recheck_requested, color: 'text-blue-700', bg: 'bg-blue-50' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} ${stat.color} p-3 rounded-xl text-center border border-white/50 shadow-sm`}>
                    <div className="text-lg font-bold">{stat.count || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Search & Bulk Actions */}
            <div className="sticky top-0 z-10 bg-white pb-4 space-y-3">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100/50 border border-transparent focus:border-accent focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all text-sm"
                  disabled={isFetchingMetadata}
                />
              </div>
              
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => tempEnrolledStudents.has(s.id))}
                      onChange={() => {
                        const visibleIds = filteredStudents.map(s => s.id);
                        const allVisibleSelected = visibleIds.every(id => tempEnrolledStudents.has(id));
                        setTempEnrolledStudents(prev => {
                          const next = new Set(prev);
                          if (allVisibleSelected) visibleIds.forEach(id => next.delete(id));
                          else visibleIds.forEach(id => next.add(id));
                          return next;
                        });
                      }}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Select All Visible</span>
                  </label>
                </div>
                <button 
                  onClick={handleSelectAllInCourse}
                  className="text-xs font-bold text-accent hover:bg-accent/5 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  Select All {allStudentsInCourse.length} Students
                </button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent mb-4"></div>
                  <p className="text-sm">Loading students...</p>
                </div>
              ) : studentQueryError ? (
                <div className="text-center py-12 bg-red-50 rounded-2xl border border-dashed border-red-200">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-medium">Error loading students</p>
                  <button onClick={() => refetchStudents()} className="text-xs text-red-600 font-bold mt-2 hover:underline">
                    Try again
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No students found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                  {filteredStudents.map(student => (
                    <EnrollmentRow
                      key={student.id}
                      student={student}
                      details={getStudentDetails(student.id)}
                      isEnrolled={tempEnrolledStudents.has(student.id)}
                      onToggle={handleToggleStudentCell}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm font-bold text-gray-600">
              {tempEnrolledStudents.size} <span className="font-medium text-gray-400">selected</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                disabled={isFetchingMetadata}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-accent/20 active:scale-95 transition-all disabled:bg-accent/40 disabled:scale-100 flex items-center gap-2 shadow-md shadow-accent/10"
                disabled={isFetchingMetadata}
              >
                {isFetchingMetadata ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const ConductAttemptsModal = ({ isOpen, onClose, examId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);

    useEffect(() => {
      if (!isOpen || !examId) return;

      const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
          const pageSize = 200;
          let page = 1;
          let totalPages = 1;
          const allEnrollments = [];

          while (page <= totalPages) {
            const enrollmentsResp = await fetch(
              `${API_BASE_URL}/exams/${examId}/enrollments/list?include_evaluations=false&page=${page}&page_size=${pageSize}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
              }
            );

            if (!enrollmentsResp.ok) {
              throw new Error(`Failed to fetch enrollments: ${enrollmentsResp.status}`);
            }

            const enrollmentsJson = await enrollmentsResp.json();
            if (enrollmentsJson?.code !== 200) {
              throw new Error(enrollmentsJson?.message || 'Failed to fetch enrollments');
            }

            const pageEnrollments = enrollmentsJson?.data?.enrollments || [];
            allEnrollments.push(...pageEnrollments);
            totalPages = Number(enrollmentsJson?.data?.pagination?.total_pages || 1);
            page += 1;
          }

          const questionsResp = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          if (!questionsResp.ok) {
            throw new Error(`Failed to fetch questions: ${questionsResp.status}`);
          }

          const questionsJson = await questionsResp.json();

          const nextEnrollments = allEnrollments.filter((item) => isPortalMcqExam(item));
          const nextQuestions = questionsJson?.data?.questions || (
            questionsJson?.data?.question_number ? [questionsJson.data] : []
          );

          setEnrollments(nextEnrollments);
          setQuestions(nextQuestions);
          if (nextEnrollments.length > 0) {
            setSelectedEnrollmentId(nextEnrollments[0].id);
          } else {
            setSelectedEnrollmentId(null);
          }
        } catch (err) {
          setError(err.message || 'Failed to load portal exam attempts');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [isOpen, examId]);

    if (!isOpen) return null;

    const selectedEnrollment = enrollments.find((item) => item.id === selectedEnrollmentId) || null;
    const answersByQuestion = {};
    for (const answer of selectedEnrollment?.conduct_submission?.answers_by_question || []) {
      answersByQuestion[String(answer.question_number)] = answer;
    }

    const submittedCount = enrollments.filter(
      (item) => item?.conduct_submission?.status === 'submitted'
    ).length;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-7xl h-[88vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Portal MCQ Attempts</h2>
              <p className="text-sm text-gray-500 mt-1">
                {submittedCount}/{enrollments.length} students submitted
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-4">
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr]">
              <div className="border-r border-gray-200 overflow-y-auto">
                {enrollments.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No enrollments found for this portal exam.</div>
                ) : (
                  <div className="p-3 space-y-2">
                    {enrollments.map((enrollment) => {
                      const isSelected = enrollment.id === selectedEnrollmentId;
                      const submission = enrollment.conduct_submission || {};
                      const isSubmitted = submission.status === 'submitted';
                      return (
                        <button
                          key={enrollment.id}
                          type="button"
                          onClick={() => setSelectedEnrollmentId(enrollment.id)}
                          className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                            isSelected ? 'border-accent bg-accent/10' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-sm text-gray-900 truncate">{enrollment.student_name}</div>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                              isSubmitted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isSubmitted ? 'Submitted' : 'Pending'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Roll: {enrollment.roll_number || '-'}
                          </div>
                          <div className="text-xs text-gray-600 mt-2">
                            Attempted: {submission.attempted_questions || 0}/{submission.total_questions || questions.length}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="overflow-y-auto p-5">
                {!selectedEnrollment ? (
                  <div className="text-sm text-gray-500">Select a student to view responses.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                      <div className="text-lg font-semibold text-gray-900">{selectedEnrollment.student_name}</div>
                      <div className="text-sm text-gray-600 mt-1">Roll: {selectedEnrollment.roll_number || '-'}</div>
                    </div>

                    {questions.map((question, index) => {
                      const qn = question.question_number;
                      const answer = answersByQuestion[String(qn)] || {};
                      const selectedOptionId = answer.selected_option_id;
                      const correctOptionIds = question.correct_option_ids || [];
                      return (
                        <div key={qn} className="rounded-xl border border-gray-200 p-4 bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase text-gray-500">Question {index + 1}</p>
                              <h4 className="text-sm font-semibold text-gray-900 mt-1">
                                {question.question_text || `Question ${qn}`}
                              </h4>
                            </div>
                            <div className="text-sm font-medium text-gray-600">{question.max_marks || 0} marks</div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {(question.mcq_options || []).map((option) => {
                              const isSelected = selectedOptionId === option.option_id;
                              const isCorrect = correctOptionIds.includes(option.option_id);
                              return (
                                <div
                                  key={option.option_id}
                                  className={`rounded-lg border px-3 py-3 ${
                                    isSelected && isCorrect ? 'border-green-300 bg-green-50' :
                                    isSelected ? 'border-blue-300 bg-blue-50' :
                                    isCorrect ? 'border-green-200 bg-green-50/60' :
                                    'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-gray-800">{option.option_id}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                      {isSelected && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Selected</span>}
                                      {isCorrect && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Correct</span>}
                                    </div>
                                  </div>
                                  {option.option_body && (
                                    <div
                                      className="mt-2 text-sm text-gray-700"
                                      dangerouslySetInnerHTML={{ __html: option.option_body }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-3 text-sm text-gray-700">
                            <span className="font-medium">Marks awarded:</span> {answer.marks_awarded ?? 0}
                          </div>
                          {question.reason_required && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-700">Reason</div>
                              <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                {answer.reason_text || 'No reason submitted'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const ExamsTab = ({
    exams = [],
    courseId, 
    searchQuery = '',
    onSearchChange = () => { },
    onAdd = () => { },
    onEdit = () => { },
    onDelete = () => { },
    onEvaluate = () => { },
    onRefresh = () => { },
    students = [],
  }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAnswerUploadModal, setShowAnswerUploadModal] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState('evaluated');
    const [existingQuestions, setExistingQuestions] = useState([]);
    const [showRubricModal, setShowRubricModal] = useState(false);
    const [currentExamQuestions, setCurrentExamQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [questionsHaveRubrics, setQuestionsHaveRubrics] = useState({});
    const [showRecheckRequests, setShowRecheckRequests] = useState(false);
    const [selectedExamForRecheck, setSelectedExamForRecheck] = useState(null);
    const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
    const [selectedExamForEnrollments, setSelectedExamForEnrollments] = useState(null);
    const [showConductAttemptsModal, setShowConductAttemptsModal] = useState(false);
    const [selectedExamForConductAttempts, setSelectedExamForConductAttempts] = useState(null);
    const [togglingExamId, setTogglingExamId] = useState(null);
    const [selectedSecurityExam, setSelectedSecurityExam] = useState(null);
    const [savingSecurity, setSavingSecurity] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExamForEdit, setSelectedExamForEdit] = useState(null);
    const [examSteps, setExamSteps] = useState({});

    const showToast = useCallback((message, type = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    }, []);
  
    useEffect(() => {
      if (!courseId) {
        console.error('CourseId is undefined in ExamsTab component');
        showToast('Error: Course ID is missing. Some features may not work correctly.', 'error');
        return;
      }

      // Hydrate examSteps from localStorage so progress persists across reloads
      try {
        const stored = localStorage.getItem(`course_${courseId}_exam_steps`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setExamSteps(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load exam steps from localStorage:', err);
      }
    }, [courseId, showToast]);

    useEffect(() => {
      if (!Array.isArray(exams)) return;

      setExamSteps((prev) => {
        const updated = { ...prev };

        exams.forEach((exam) => {
          if (!exam || !exam.id) return;
          const examVariant = getExamVariant(exam);
          const isConductExam = examVariant === 'portal_mcq' || examVariant === 'conduct';

          // Backend may provide derived progress flags; fall back to existing fields
          const backendHasQuestions = exam.has_questions;
          const backendHasRubrics = exam.has_rubrics;
          const backendHasAnswers = exam.has_answers;

          const hasQnA = !!(
            backendHasQuestions ||
            exam.question_pdf_s3_url ||
            exam.golden_pdf_s3_url
          );

          const hasRubrics = !!(
            backendHasRubrics ||
            questionsHaveRubrics[exam.id]
          );
          const isExamActive = Boolean(exam.is_active);

          let derivedProgress = 0;
          if (hasQnA) {
            derivedProgress = 1;
            
            // Fix progress tracking for conduct exams: use hasRubrics for Step 2 if it's a conduct exam,
            // but keep isExamActive for portal_mcq (MCQ) exams.
            const step2Condition = isSubjectiveConductExam(exam) ? hasRubrics : (isPortalMcqExam(exam) ? isExamActive : hasRubrics);
            
            if (step2Condition) {
              derivedProgress = 2;
              if (backendHasAnswers) {
                derivedProgress = 3;
              }
            }
          } else if (backendHasAnswers) {
            // Fallback for cases where answers exist but Q&A is not detected correctly
            derivedProgress = 3;
          }

          const previousStep = prev[exam.id] ?? 0;
          updated[exam.id] = Math.max(previousStep, derivedProgress);
        });

        return updated;
      });
    }, [exams, questionsHaveRubrics]);

    // Persist examSteps whenever they change so the UI progress stays in sync after reload
    useEffect(() => {
      if (!courseId) return;
      try {
        localStorage.setItem(`course_${courseId}_exam_steps`, JSON.stringify(examSteps));
      } catch (err) {
        console.warn('Failed to store exam steps in localStorage:', err);
      }
    }, [courseId, examSteps]);
  
    const filteredExams = exams.filter(exam =>
      exam.exam_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    
    const handleEditExam = (exam) => {
      setSelectedExamForEdit(exam);
      setShowEditModal(true);
    };
  
    
    const handleUpdateExam = async (updatedExam) => {
      try {
        if (!courseId || !updatedExam.id) {
          throw new Error('Course ID or Exam ID is missing');
        }
  
        
        const fullUrl = `${API_BASE_URL}/professors/courses/${courseId}/exams/${updatedExam.id}`;
        
        console.log('Making PUT request to:', fullUrl);
        const updatePayload = {
          exam_name: updatedExam.exam_name,
          full_marks: updatedExam.full_marks,
          exam_type: updatedExam.exam_type,
          conduct_variant: updatedExam.exam_type === 'portal_mcq' ? 'portal_mcq' : undefined,
          is_active: updatedExam.is_active,
          start_time: updatedExam.start_time || undefined,
          end_time: updatedExam.end_time || undefined,
          duration_minutes: updatedExam.duration_minutes || undefined,
        };
        console.log('Request payload:', {
          ...updatePayload,
        });
        
        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        });
  
        console.log('Response status:', response.status);
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.message || `Failed to update exam: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.code === 200) {
          showToast('Exam updated successfully', 'success');
          
          
          if (onRefresh) {
            await onRefresh();
          }
          
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to update exam');
        }
      } catch (error) {
        console.error('Error updating exam:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          showToast('Network error: Please check if the API server supports HTTPS', 'error');
        } else {
          showToast(error.message || 'Failed to update exam', 'error');
        }
        throw error;
      }
    };

    const handleToggleExamActive = async (exam) => {
      try {
        if (!courseId || !exam?.id) {
          throw new Error('Course ID or Exam ID is missing');
        }
        setTogglingExamId(exam.id);

        const fullUrl = `${API_BASE_URL}/professors/courses/${courseId}/exams/${exam.id}`;
        const nextIsActive = !Boolean(exam.is_active);

        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_name: exam.exam_name,
            full_marks: exam.full_marks,
            exam_type: exam.exam_type,
            conduct_variant: exam.conduct_variant,
            is_active: nextIsActive,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to update exam status: ${response.status}`);
        }

        const data = await response.json();
        if (data.code !== 200) {
          throw new Error(data.message || 'Failed to update exam status');
        }

        showToast(`Online exam is now ${nextIsActive ? 'active' : 'inactive'}`, 'success');
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        console.error('Error toggling exam active status:', error);
        showToast(error.message || 'Failed to update exam status', 'error');
      } finally {
        setTogglingExamId(null);
      }
    };

    const handleSaveSecurityConfig = async (exam, securityConfig) => {
      try {
        if (!courseId || !exam?.id) {
          throw new Error('Course ID or Exam ID is missing');
        }
        setSavingSecurity(true);

        const fullUrl = `${API_BASE_URL}/professors/courses/${courseId}/exams/${exam.id}`;
        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_name: exam.exam_name,
            full_marks: exam.full_marks,
            exam_type: exam.exam_type,
            exam_mode: exam.exam_mode,
            conduct_variant: exam.conduct_variant,
            is_active: Boolean(exam.is_active),
            online_exam_security_config: securityConfig,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.detail || `Failed to update security settings: ${response.status}`);
        }

        const data = await response.json();
        if (data.code !== 200) {
          throw new Error(data.message || 'Failed to update security settings');
        }

        showToast('Online exam security settings updated', 'success');
        setSelectedSecurityExam(null);
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        console.error('Error updating online exam security settings:', error);
        showToast(error.message || 'Failed to update security settings', 'error');
      } finally {
        setSavingSecurity(false);
      }
    };
  
    const fetchExamQuestions = useCallback(async (examId) => {
      try {
        if (!examId) {
          throw new Error('Exam ID is missing');
        }
        
        const exam = exams.find(e => Number(e.id) === Number(examId));
        const useConductEndpoint = isSubjectiveConductExam(exam);
        
        const endpoint = useConductEndpoint 
          ? `${API_BASE_URL}/exams/${examId}/conduct-exams/questions`
          : `${API_BASE_URL}/exams/${examId}/question-answer`;
          
        console.log(`[ExamsTab] Fetching questions for exam ${examId} using ${useConductEndpoint ? 'conduct' : 'standard'} endpoint`);
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        });
    
        if (response.status === 404) {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('No questions found')) {
            setQuestionsHaveRubrics(prev => ({
              ...prev,
              [examId]: false
            }));
            return [];
          }
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }
    
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }
    
        const data = await response.json();
        
        if (data.code === 200) {
          let questionsList = [];
          
          if (data.data.questions) {
            questionsList = data.data.questions || [];
          } else if (data.data.question_number) {
            questionsList = [data.data];
          } else if (Array.isArray(data.data)) {
            questionsList = data.data;
          }
          
          console.log(`[ExamsTab] Fetched ${questionsList.length} questions. Checking rubrics...`);
          questionsList.forEach(q => {
             const hasRubric = (q.rubric_items && q.rubric_items.length > 0) || (q.rubric && q.rubric.rubric_items && q.rubric.rubric_items.length > 0);
             if (hasRubric) {
               console.log(`[ExamsTab] Question ${q.question_number} has ${q.rubric_items?.length || q.rubric?.rubric_items?.length} rubric items`);
             }
          });
          
          const hasRubrics = questionsList.some(question => {
            const hasExplicitRubricItems = question.rubric_items && question.rubric_items.length > 0;
            const hasRubricProperty = question.rubric && question.rubric.rubric_items && question.rubric.rubric_items.length > 0;
            return hasExplicitRubricItems || hasRubricProperty;
          });
          
          setQuestionsHaveRubrics(prev => ({
            ...prev,
            [examId]: hasRubrics
          }));
          
          return questionsList;
        } else {
          throw new Error(data.message || 'Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        
        if (error.message && error.message.includes('NotFoundError: No questions found')) {
          showToast('No questions have been uploaded for this exam yet.', 'info');
          return [];
        }
        
        showToast(`Error loading exam questions: ${error.message}`, 'error');
        throw error;
      }
    }, [showToast]);
    
    const handleRubricSave = async (data) => {
      try {
        showToast('Rubric saved successfully', 'success');
        setQuestionsHaveRubrics(prev => ({
          ...prev,
          [selectedExamId]: true
        }));
        if (selectedExamId) {
          setExamSteps(prev => ({
            ...prev,
            [selectedExamId]: Math.max(prev[selectedExamId] ?? 0, 2),
          }));
        }

        // Re-fetch questions so the modal's in-memory state reflects the saved
        // rubrics. Without this, re-opening the modal shows empty rubrics because
        // currentExamQuestions still holds the pre-save data.
        if (selectedExamId) {
          try {
            console.log('[ExamsTab] Refetching questions after rubric save for exam', selectedExamId);
            const refreshed = await fetchExamQuestions(selectedExamId);
            if (refreshed && refreshed.length > 0) {
              const processedQuestions = refreshed.map(question => ({
                ...question,
                rubric_items: question.rubric_items?.length > 0
                  ? question.rubric_items
                  : (question.rubric?.rubric_items || []),
                problem_feedback: question.rubric_items?.length > 0
                  ? (question.problem_feedback || '')
                  : (question.rubric?.problem_feedback || ''),
              }));
              setCurrentExamQuestions(processedQuestions);
              console.log('[ExamsTab] Questions refreshed after save:', processedQuestions.length);
            }
          } catch (fetchErr) {
            // Non-fatal — the save succeeded, just the refresh failed
            console.warn('[ExamsTab] Failed to refresh questions after save:', fetchErr.message);
          }
        }

        if (onRefresh) {
          onRefresh();
        }
        return data;
      } catch (error) {
        showToast(error.message || 'Failed to save rubric', 'error');
        throw error;
      }
    };
  
    const handleStartEvaluation = async (exam) => {
      try {
        if (!exam || !exam.id) {
          throw new Error('Exam ID is missing');
        }
        const examId = exam.id;
        const examVariant = getExamVariant(exam);
        const isPortalExam = examVariant === 'portal_mcq';
        const isSubjectiveConduct = examVariant === 'conduct';
        
        showToast('Preparing evaluation...', 'success');
        
        navigate(
          isPortalExam
            ? `/courses/${courseId}/exams/${examId}/evaluate`
            : isSubjectiveConduct
            ? `/courses/${courseId}/exams/${examId}/conduct-review`
            : `/courses/${courseId}/exams/${examId}/evaluations`,
          {
          state: {
            ...(location.state || {}),
            from: 'exams',
            examName: exam.exam_name || (isPortalExam ? 'MCQ Evaluation' : isSubjectiveConduct ? 'Online Exam Review' : 'Exam Evaluations'),
          },
        });
        
      } catch (error) {
        console.error('Error starting evaluation:', error);
        showToast(error.message || 'Failed to start evaluation', 'error');
      }
    };
  
    const handleGetEnrollments = async (examId) => {
      setSelectedExamForEnrollments(examId);
      setShowEnrollmentsModal(true);
    };

    const handleReviewConductAttempts = async (examId) => {
      setSelectedExamForConductAttempts(examId);
      setShowConductAttemptsModal(true);
    };
  
    const handleEnrollmentChange = async (studentId, isEnrolled) => {
      try {
        if (!selectedExamForEnrollments) {
          throw new Error('No exam selected');
        }
  
        const endpoint = `${API_BASE_URL}/exams/${selectedExamForEnrollments}/enrollments`;
        const response = await fetch(endpoint, {
          method: isEnrolled ? 'POST' : 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ student_id: studentId })
        });
  
        if (!response.ok) {
          throw new Error(`Failed to ${isEnrolled ? 'add' : 'remove'} student`);
        }
  
        const data = await response.json();
        if (data.code !== 200) {
          throw new Error(data.message || `Failed to ${isEnrolled ? 'add' : 'remove'} student`);
        }
  
        showToast(`Student ${isEnrolled ? 'added to' : 'removed from'} exam successfully`, 'success');
        return true;
      } catch (error) {
        console.error('Error updating enrollment:', error);
        showToast(error.message || 'Failed to update enrollment', 'error');
        throw error;
      }
    };
  
    const handleUploadClick = async (examId) => {
      if (!examId) {
        showToast('Error: Exam ID is missing', 'error');
        return;
      }
      const selectedExam = exams.find((exam) => Number(exam.id) === Number(examId));
      setIsLoading(true);
      try {
        let questions = [];
        try {
          const response = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            }
          });
          if (response.status === 404) {
            console.log('No existing questions found for this exam');
          } else if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Failed to fetch questions" }));
            throw new Error(errorData.detail || `Failed to fetch questions: ${response.status}`);
          } else {
            const data = await response.json();
            if (data.code === 200) {
              if (data.data.questions) {
                questions = data.data.questions || [];
              } else if (data.data.question_number) {
                questions = [data.data];
              }
            }
          }
        } catch (error) {
          if (!error.message.includes('Questions not found')) {
            console.error('Error loading questions:', error);
            showToast('Failed to load existing questions. You can still upload a new question paper.', 'error');
          }
        }
        setExistingQuestions(questions);
        setSelectedExamId(examId);
        setSelectedExamType(isPortalMcqExam(selectedExam) ? 'conduct' : (selectedExam.exam_type === 'conduct' && (selectedExam.conduct_variant === 'subjective' || selectedExam.conduct_variant === 'hybrid')) ? 'subjective_conduct' : 'evaluated');
        setShowUploadModal(true);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleAnswerUpload = async (examId) => {
      if (!examId) {
        showToast('Error: Exam ID is missing', 'error');
        return;
      }
      
      setSelectedExamId(examId);
      setShowAnswerUploadModal(true);
    };
  
    const handleGenerateRubrics = async (examId) => {
      if (!examId) {
        showToast('Error: Exam ID is missing', 'error');
        return;
      }
      
      setIsLoading(true);
      try {
        let questions = [];
        try {
          questions = await fetchExamQuestions(examId);
        } catch (error) {
          console.error('Error loading questions for rubrics:', error);
          showToast('Failed to load questions. Creating empty rubric template.', 'error');
          
          questions = [
            { 
              question_number: 1, 
              question_text: "Question 1 (API unavailable)", 
              max_marks: 0, // Will be set from actual exam data when available
              domain: "Math" 
            }
          ];
        }
        
        if (questions && questions.length > 0) {
          const processedQuestions = questions.map(question => {
            const hasDirectRubricItems = question.rubric_items && question.rubric_items.length > 0;
            
            const hasRubricProperty = question.rubric && 
                                     question.rubric.rubric_items && 
                                     question.rubric.rubric_items.length > 0;
            
            return {
              ...question,
              rubric_items: hasDirectRubricItems ? question.rubric_items : 
                           (hasRubricProperty ? question.rubric.rubric_items : []),
              problem_feedback: hasDirectRubricItems ? question.problem_feedback :
                              (hasRubricProperty ? question.rubric.problem_feedback : '')
            };
          });
          
          setCurrentExamQuestions(processedQuestions);
          setSelectedExamId(examId);
          setShowRubricModal(true);
        } else {
          showToast('No questions found. Please upload a question paper first.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleUploadQuestionAndAnswerPdfs = async (examId, questionPdf, goldenPdf) => {
      try {
        if (!examId) {
          showToast('Error: Exam ID is missing', 'error');
          return false;
        }
        
        if (questionPdf) {
          const questionFormData = new FormData();
          questionFormData.append('question_pdf', questionPdf);
          
          const questionResponse = await fetch(`${API_BASE_URL}/exams/${examId}/question-pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: questionFormData
          });
          
          if (!questionResponse.ok) {
            throw new Error(`Question PDF upload failed: ${questionResponse.status}`);
          }
          
          showToast('Question PDF uploaded successfully', 'success');
          setExamSteps(prev => ({
            ...prev,
            [examId]: Math.max(prev[examId] ?? 0, 1),
          }));

          if (onRefresh) {
            onRefresh();
          }
        }
        
        if (goldenPdf) {
          const goldenFormData = new FormData();
          goldenFormData.append('golden_pdf', goldenPdf);
          
          const goldenResponse = await fetch(`${API_BASE_URL}/exams/${examId}/golden-pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: goldenFormData
          });
          
          if (!goldenResponse.ok) {
            throw new Error(`Golden PDF upload failed: ${goldenResponse.status}`);
          }
          
          showToast('Golden answer PDF uploaded successfully', 'success');
          setExamSteps(prev => ({
            ...prev,
            [examId]: Math.max(prev[examId] ?? 0, 1),
          }));

          if (onRefresh) {
            onRefresh();
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error uploading PDFs:', error);
        showToast(error.message || 'Failed to upload PDF files', 'error');
        return false;
      }
    };
  
    
    const handleViewRecheckRequests = (examId) => {
      setSelectedExamForRecheck(examId);
      setShowRecheckRequests(true);
      showToast('Loading recheck requests...', 'success');
    };
  
    return (
      <>
        <div className="space-y-6 opacity-100 transition-opacity duration-1000">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-2xl min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl
                  focus:ring-2 focus:ring-accent focus:border-transparent
                  transition-all duration-300 text-gray-700"
              />
            </div>
  
            <div className="flex items-center gap-3 w-full sm:w-auto">                                    
              <button
                onClick={onAdd}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white
                  rounded-xl hover:bg-accent transition-all duration-300
                  shadow-sm hover:shadow-md focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                Create Exam
              </button>
            </div>
          </div>
  
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="transition-all duration-300">
                <ExamCard
                  exam={exam}
                  onEdit={handleEditExam}
                  onDelete={onDelete}
                  onUploadQnA={handleUploadClick}
                  onGenerateRubrics={handleGenerateRubrics}
                  onUploadAnswers={handleAnswerUpload}
                  onGetEnrollments={handleGetEnrollments}
                  onReviewPortalAttempts={handleReviewConductAttempts}
                  onStartEvaluation={handleStartEvaluation}
                  onToggleExamActive={handleToggleExamActive}
                  onOpenSecurity={setSelectedSecurityExam}
                  isTogglingActive={togglingExamId === exam.id}
                  initialStep={examSteps[exam.id] ?? 0}
                  onStepChange={(step) => {
                    if (!exam || !exam.id) return;
                    setExamSteps(prev => ({
                      ...prev,
                      [exam.id]: step,
                    }));
                  }}
                  onViewRecheckRequests={handleViewRecheckRequests}
                />
              </div>
            ))}
  
            {filteredExams.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 
                p-12 text-center">
                <div className="flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center 
                    justify-center mb-4 transform transition-all duration-500 scale-100">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No exams found
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {searchQuery
                      ? 'Try adjusting your search terms or filters'
                      : 'Get started by creating your first exam'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={onAdd}
                      className="flex items-center gap-2 px-4 py-2 bg-accent 
                        text-white rounded-xl hover:bg-accent transition-all duration-300
                        shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Exam
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
  
          <Toast
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
  
          {}
          <EditExamModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedExamForEdit(null);
            }}
            exam={selectedExamForEdit}
            onSave={handleUpdateExam}
          />

          <AnimatePresence>
            {selectedSecurityExam && (
              <OnlineExamSecurityModal
                exam={selectedSecurityExam}
                saving={savingSecurity}
                onClose={() => setSelectedSecurityExam(null)}
                onSave={handleSaveSecurityConfig}
              />
            )}
          </AnimatePresence>
  
          <UploadQnAModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedExamId(null);
              setSelectedExamType('evaluated');
              setExistingQuestions([]);
            }}
            examId={selectedExamId}
            examType={selectedExamType}
            existingQuestions={existingQuestions}
            exam={exams?.find(e => e.id === selectedExamId) || null}
            isMasterAttached={exams?.find(e => e.id === selectedExamId)?.is_master_attached || false}
            onRefresh={onRefresh}
            onSubmit={async (examId, formData) => {
              try {
                if (!examId) {
                  showToast('Error: Exam ID is missing', 'error');
                  throw new Error('Exam ID is missing');
                }
                
                if (formData.get('golden_pdf') || formData.get('question_pdf')) {
                  return await handleUploadQuestionAndAnswerPdfs(
                    examId,
                    formData.get('question_pdf'),
                    formData.get('golden_pdf')
                  );
                }
                
                const response = await fetch(`${API_BASE_URL}/exams/${examId}/upload`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                  },
                  body: formData
                });
  
                if (!response.ok) {
                  throw new Error(`Upload failed: ${response.status}`);
                }
                const data = await response.json();
                if (data.code === 200) {
                  showToast('Question paper uploaded successfully', 'success');

                  setExamSteps(prev => ({
                    ...prev,
                    [examId]: Math.max(prev[examId] ?? 0, 1),
                  }));

                  if (onRefresh) {
                    onRefresh();
                  }

                  return data;
                } else {
                  throw new Error(data.message || 'Upload failed');
                }
              } catch (error) {
                console.error('Error uploading question paper:', error);
                showToast(error.message || 'Failed to upload question paper', 'error');
                throw error;
              }
            }}
          />
          <RubricModal
            isOpen={showRubricModal}
            onClose={() => {
              setShowRubricModal(false);
              setSelectedExamId(null);
              setCurrentExamQuestions([]);
            }}
            examId={selectedExamId}
            questions={currentExamQuestions}
            isMasterAttached={exams?.find(e => e.id === selectedExamId)?.is_master_attached || false}
            onSave={handleRubricSave}
          />
  
          <UploadAnswersModal
            isOpen={showAnswerUploadModal}
            onClose={() => {
              setShowAnswerUploadModal(false);
              setSelectedExamId(null);
            }}
            examId={selectedExamId}
            courseId={courseId}
            onUploadSuccess={(data) => {
              showToast('Answer sheets uploaded successfully', 'success');
              if (selectedExamId) {
                setExamSteps(prev => ({
                  ...prev,
                  [selectedExamId]: Math.max(prev[selectedExamId] ?? 0, 3),
                }));
              }
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
  
          <EnrollmentsModal
            isOpen={showEnrollmentsModal}
            onClose={() => {
              setShowEnrollmentsModal(false);
              setSelectedExamForEnrollments(null);
            }}
            examId={selectedExamForEnrollments}
            courseId={courseId}
            onEnrollmentChange={handleEnrollmentChange}
            students={students}
          />

          <ConductAttemptsModal
            isOpen={showConductAttemptsModal}
            onClose={() => {
              setShowConductAttemptsModal(false);
              setSelectedExamForConductAttempts(null);
            }}
            examId={selectedExamForConductAttempts}
          />
        </div>
  
      </>
    );
  };
  
  export default ExamsTab;
