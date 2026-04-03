import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Plus, Edit2, Trash2,
  ChevronRight, Calendar, Upload,
  Users, PlayCircle, X, AlertCircle, CheckCircle, BarChart3,
  Check, History
} from 'lucide-react';
import UploadQnAModal from '../modals/UploadQnAModal';
import RubricModal from '../modals/RubricModal';
import UploadAnswersModal from '../modals/UploadAnswersModal';
import { API_BASE_URL } from '../../../../BaseURL';

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
          // Safe fallback: use existing backend upload endpoint
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
    isTogglingActive = false,
    initialStep = 0,
    onStepChange,
  }) => {
    const [activeStep, setActiveStep] = useState(Math.min(2, initialStep || 0));
    const isConductExam = exam?.exam_type === 'conduct';

    useEffect(() => {
      setActiveStep(Math.min(2, initialStep || 0));
    }, [initialStep]);

    const allStepsCompleted = Number(initialStep || 0) >= 3;

    const steps = [
      {
        label: isConductExam ? 'Build MCQ Questions' : 'Upload Q&A',
        description: isConductExam ? 'Create portal MCQ questions and options' : 'Upload your question paper',
        icon: Upload,
        action: () => onUploadQnA(exam.id)
      },
      {
        label: isConductExam ? 'Activation' : 'Generate Rubrics',
        description: isConductExam ? `Current: ${exam?.is_active ? 'Active' : 'Inactive'}` : 'Create marking criteria',
        icon: CheckCircle,
        action: () => (isConductExam ? onToggleExamActive(exam) : onGenerateRubrics(exam.id))
      },
      {
        label: isConductExam ? 'Track Attempts' : 'Upload Answer Sheets',
        description: isConductExam ? 'Review enrollments and submissions' : 'Upload student answer files',
        icon: Upload,
        action: () => (isConductExam ? onReviewPortalAttempts(exam.id) : onUploadAnswers(exam.id))
      }
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 hover:shadow-lg">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words min-w-0">
              {exam.exam_name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatExamDate(exam.created_at || exam.start_time || exam.date)}
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="font-medium">{exam.full_marks || exam.maxMarks || 100} marks</span>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <span className={`font-medium ${isConductExam ? 'text-blue-700' : 'text-accent'}`}>
                {isConductExam ? 'Portal MCQ' : 'Evaluated'}
              </span>
              {isConductExam && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className={`font-medium ${exam?.is_active ? 'text-green-700' : 'text-gray-600'}`}>
                    {exam?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </>
              )}
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
            {isConductExam && (
              <button
                onClick={() => onStartEvaluation(exam)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-accent bg-accent/10 hover:bg-accent/15
                  rounded-lg flex items-center justify-center gap-2 transition-colors border border-accent/20"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Evaluate</span>
              </button>
            )}
            {!isConductExam && (
              <button
                onClick={() => onStartEvaluation(exam)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-white bg-accent hover:bg-accent
                  rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Evaluate</span>
              </button>
            )}
            {isConductExam && (
              <label className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-3 sm:px-4 py-2 rounded-lg border transition-colors ${
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
                      isCompleted={allStepsCompleted ? true : index < activeStep - 1}
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
  
  const EnrollmentsModal = ({ isOpen, onClose, examId, courseId, onEnrollmentChange, students = [] }) => {
    const [enrolledStudents, setEnrolledStudents] = useState(new Set());
    const [tempEnrolledStudents, setTempEnrolledStudents] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [enrollmentDetails, setEnrollmentDetails] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [localStudents, setLocalStudents] = useState([]);
  
    
    useEffect(() => {
      if (courseId) {
        try {
          const storedStudents = localStorage.getItem(`course_${courseId}_students`);
          if (storedStudents) {
            setLocalStudents(JSON.parse(storedStudents));
          }
        } catch (error) {
          console.error("Error loading students from localStorage:", error);
        }
      }
    }, [courseId]);
  
    
    const combinedStudents = useMemo(() => {
      
      if (students && students.length > 0) {
        return students;
      }
      
      
      if (localStudents && localStudents.length > 0) {
        return localStudents.map(student => ({
          id: student.id,
          name: student.user_name || `Student ${student.id}`,
          email: student.user_email,
          roll_number: student.roll_number
        }));
      }
      
      
      const studentsFromEnrollments = enrollmentDetails
        .filter(enrollment => enrollment && (enrollment.student_name || enrollment.student_id))
        .map(enrollment => ({
          id: enrollment.student_id || enrollment.id,
          name: enrollment.student_name || `Student ${enrollment.student_id || enrollment.id}`
        }));
        
      return studentsFromEnrollments;
    }, [students, localStudents, enrollmentDetails]);
    
    
    const filteredStudents = useMemo(() => {
      const query = searchQuery.toLowerCase();
      return combinedStudents.filter(student => 
        (student.name && student.name.toLowerCase().includes(query)) || 
        (student.email && student.email.toLowerCase().includes(query)) ||
        (student.roll_number && student.roll_number.toLowerCase().includes(query)) ||
        String(student.id).toLowerCase().includes(query)
      );
    }, [combinedStudents, searchQuery]);
  
    useEffect(() => {
      if (isOpen && examId) {
        fetchEnrollments();
      }
    }, [isOpen, examId]);
  
    
    useEffect(() => {
      if (isOpen) {
        setTempEnrolledStudents(new Set(enrolledStudents));
      }
    }, [isOpen, enrolledStudents]);
  
    const fetchEnrollments = async () => {
      setIsLoading(true);
      setError('');
      try {
        
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'omit'
        });
  
        if (!enrollmentsResponse.ok) {
          throw new Error('Failed to fetch enrollments');
        }
  
        const enrollmentsData = await enrollmentsResponse.json();
        console.log("Raw enrollment data:", enrollmentsData);
        
        if (enrollmentsData.code !== 200) {
          throw new Error(enrollmentsData.message || 'Failed to fetch enrollments');
        }
  
        
        let allEnrollments = [];
        let counts = {};
        
        if (Array.isArray(enrollmentsData.data)) {
          
          enrollmentsData.data.forEach(item => {
            if (item && Array.isArray(item.enrollments)) {
              allEnrollments = [...allEnrollments, ...item.enrollments];
              if (item.status_counts) {
                counts = item.status_counts;
              }
            } 
            
            else if (item && item.student_id) {
              allEnrollments.push(item);
            }
          });
        } 
        
        else if (enrollmentsData.data && Array.isArray(enrollmentsData.data.enrollments)) {
          allEnrollments = enrollmentsData.data.enrollments;
          if (enrollmentsData.data.status_counts) {
            counts = enrollmentsData.data.status_counts;
          }
        }
        
        else if (enrollmentsData.data && enrollmentsData.data.student_id) {
          allEnrollments = [enrollmentsData.data];
        }
        
        console.log('Processed enrollment details:', allEnrollments);
        console.log('Status counts:', counts);
        
        
        if (allEnrollments.length === 0) {
          console.warn("No enrollments extracted from data. Using raw data as fallback.");
          
          if (Array.isArray(enrollmentsData.data)) {
            allEnrollments = enrollmentsData.data;
          } else if (enrollmentsData.data) {
            allEnrollments = [enrollmentsData.data];
          }
        }
        
        setEnrollmentDetails(allEnrollments);
        setStatusCounts(counts || {});
  
        
        const enrolledIds = new Set(
          allEnrollments
            .filter(enrollment => enrollment && (enrollment.student_id || enrollment.id))
            .map(enrollment => enrollment.student_id || enrollment.id)
        );
  
        setEnrolledStudents(enrolledIds);
        setTempEnrolledStudents(new Set(enrolledIds));
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleToggleStudent = (studentId) => {
      setTempEnrolledStudents(prev => {
        const newSet = new Set(prev);
        if (newSet.has(studentId)) {
          newSet.delete(studentId);
        } else {
          newSet.add(studentId);
        }
        return newSet;
      });
    };
  
    const handleSubmit = async () => {
      setIsLoading(true);
      setError('');
      try {
        
        const studentsToAdd = Array.from(tempEnrolledStudents).filter(id => !enrolledStudents.has(id));
        
        
        const studentsToRemove = Array.from(enrolledStudents).filter(id => !tempEnrolledStudents.has(id));
        
        
        for (const studentId of studentsToAdd) {
          await onEnrollmentChange(studentId, true);
        }
        
        
        for (const studentId of studentsToRemove) {
          await onEnrollmentChange(studentId, false);
        }
        
        
        setEnrolledStudents(new Set(tempEnrolledStudents));
        
        onClose();
      } catch (error) {
        console.error('Error updating enrollments:', error);
        setError(error.message || 'Failed to update enrollments');
      } finally {
        setIsLoading(false);
      }
    };
  
    
    const getStudentDetails = (studentId) => {
      const details = enrollmentDetails.find(e => String(e.student_id) === String(studentId)) || {};
      
      
      if (tempEnrolledStudents.has(studentId) && !details.status) {
        return { ...details, status: 'not_uploaded' };
      }
      
      return details;
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Enrollments</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          )}
  
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
  
          {!isLoading && Object.keys(statusCounts).length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-accent/10 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-accent">{statusCounts.not_uploaded || 0}</div>
                <div className="text-xs text-gray-500">Not Uploaded</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-amber-700">{statusCounts.uploaded || 0}</div>
                <div className="text-xs text-gray-500">Uploaded</div>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-accent">{statusCounts.evaluated || 0}</div>
                <div className="text-xs text-gray-500">Evaluated</div>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg text-center">
                <div className="text-lg font-semibold text-accent">{statusCounts.recheck_requested || 0}</div>
                <div className="text-xs text-gray-500">Recheck Requested</div>
              </div>
            </div>
          )}
          
  
          {!isLoading && combinedStudents.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No students found in this course.
            </div>
          )}
  
          {!isLoading && combinedStudents.length > 0 && (
            <>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
  
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {filteredStudents.length} students found
                  </span>
                </div>
                <div className="space-y-1 rounded-lg border border-gray-200 overflow-hidden bg-white">
                  {filteredStudents.map(student => {
                    const details = getStudentDetails(student.id);
                    const isEnrolled = tempEnrolledStudents.has(student.id);
                    
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 ${
                          isEnrolled ? 'bg-accent/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={isEnrolled}
                            onChange={() => handleToggleStudent(student.id)}
                            className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                          />
                          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-accent">
                              {student.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              {student.roll_number && <span className="px-2 py-0.5 bg-gray-100 rounded-full">Roll: {student.roll_number}</span>}
                              {student.email && <span className="truncate max-w-[200px]">{student.email}</span>}
                              {details.status && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  details.status === 'evaluated' ? 'bg-accent/10 text-accent' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {details.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {details.marks_obtained !== null && details.marks_obtained !== undefined && (
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                              {details.marks_obtained}/{details.max_marks || 0}
                            </div>
                          )}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
  
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent disabled:bg-accent/40 font-medium shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
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

          const nextEnrollments = allEnrollments.filter(
            (item) => String(item?.exam_type || '').toLowerCase() === 'conduct'
          );
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

      console.log(`ExamsTab initialized with courseId: ${courseId}`);

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
          const isConductExam = exam.exam_type === 'conduct';

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
            if (isConductExam ? isExamActive : hasRubrics) {
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
        console.log('Request payload:', {
          exam_name: updatedExam.exam_name,
          full_marks: updatedExam.full_marks,
          exam_type: updatedExam.exam_type,
          is_active: updatedExam.is_active,
        });
        
        const response = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exam_name: updatedExam.exam_name,
            full_marks: updatedExam.full_marks,
            exam_type: updatedExam.exam_type,
            is_active: updatedExam.is_active,
          })
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

        showToast(`Portal exam is now ${nextIsActive ? 'active' : 'inactive'}`, 'success');
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
  
    const fetchExamQuestions = useCallback(async (examId) => {
      try {
        if (!examId) {
          throw new Error('Exam ID is missing');
        }
        
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
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
          }
          
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
        const isConductExam = exam.exam_type === 'conduct';
        
        showToast('Preparing evaluation...', 'success');
        
        navigate(
          isConductExam
            ? `/courses/${courseId}/exams/${examId}/evaluate`
            : `/courses/${courseId}/exams/${examId}/evaluations`,
          {
          state: {
            ...(location.state || {}),
            from: 'exams',
            examName: exam.exam_name || (isConductExam ? 'MCQ Evaluation' : 'Exam Evaluations'),
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
        setSelectedExamType(selectedExam?.exam_type || 'evaluated');
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
            isMasterAttached={exams?.find(e => e.id === selectedExamId)?.is_master_attached || false}
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
