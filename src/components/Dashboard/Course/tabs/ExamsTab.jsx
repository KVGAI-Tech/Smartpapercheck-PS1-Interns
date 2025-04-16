/* 
  When i click on enrollments a popup should open with the list of enrollments in the course (students enrolled in the course) and professor should be able to deselect any student from the list
  and then click on submit button to save the changes.
  There should be a checkbox near a student name to select the student and a button to deselect the student.
  There should be a submit button to save the changes.
  There should be a cancel button to close the popup.
  There should be a search bar to search for a student.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2,
  ChevronRight, Calendar, Upload,
  Users, PlayCircle, X, AlertCircle, CheckCircle,
  Check, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadQnAModal from '../modals/UploadQnAModal';
import RubricModal from '../modals/RubricModal';
import { API_BASE_URL } from '../../../../BaseURL';
const ExamEvaluation = React.lazy(() => import('../modals/ExamEvaluation'));
const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
    </motion.div>
  );
};

const StepDot = ({ number, isActive, isCompleted, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ 
        scale: isActive ? 1.1 : 1,
        boxShadow: isActive 
          ? '0 0 0 6px rgba(59, 130, 246, 0.15)' 
          : isCompleted 
            ? '0 0 0 4px rgba(16, 185, 129, 0.15)' 
            : '0 0 0 4px rgba(229, 231, 235, 0.6)'
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        duration: 0.3
      }}
      className={`w-14 h-14 rounded-full flex items-center justify-center text-base 
        font-semibold cursor-pointer transition-all duration-300 
        ${isActive 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25' 
          : isCompleted 
            ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-2 border-green-500' 
            : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-blue-300'
        }`}
    >
      {isCompleted ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
        >
          <Check className="w-6 h-6" />
        </motion.div>
      ) : (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {number}
        </motion.span>
      )}
    </motion.div>
  </motion.button>
);

const StepConnector = ({ isActive, isCompleted }) => (
  <div className="flex-1 px-2 sm:px-6 flex items-center">
    <div className="w-full relative h-2 rounded-full bg-gray-100 overflow-hidden">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ 
          width: isCompleted ? "100%" : isActive ? "50%" : "0%" 
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`absolute inset-0 h-full rounded-full 
          ${isCompleted 
            ? 'bg-gradient-to-r from-green-400 to-green-500' 
            : 'bg-gradient-to-r from-blue-400 to-blue-500'
          }`}
      />
    </div>
  </div>
);

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
    const formData = new FormData();
    formData.append('zip_file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/exams/${courseId}/exams/${examId}/upload-answers`, {
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
      await onUpload(data);
      onClose();
    } catch (error) {
      console.error('Error uploading answers:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
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
              className={`mb-6 relative ${dragActive ? 'ring-2 ring-blue-500' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8
                text-center hover:border-blue-500 transition-colors">
                <div className="mb-4">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your ZIP file here, or
                  </p>
                  <label className="inline-block px-4 py-2 bg-blue-50 text-blue-600
                    rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
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
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mb-4 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors disabled:bg-blue-300
                  disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  onStartEvaluation,
}) => {
  const [activeStep, setActiveStep] = useState(0);
    
  const steps = [
    { 
      label: 'Upload Q&A', 
      description: 'Upload your question paper',
      icon: Upload,
      action: () => onUploadQnA(exam.id) 
    },
    { 
      label: 'Generate Rubrics', 
      description: 'Create marking criteria',
      icon: CheckCircle,
      action: () => onGenerateRubrics(exam.id) 
    },
    { 
      label: 'Upload Answer Sheets', 
      description: 'Upload student answer files',
      icon: Upload,
      action: () => onUploadAnswers(exam.id) 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 hover:shadow-lg"
    >
      <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-50">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-semibold text-gray-900">{exam.exam_name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(exam.date || Date.now()).toLocaleDateString()}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <span className="font-medium">{exam.full_marks || exam.maxMarks || 100} marks</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGetEnrollments(exam.id)}
            className="px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 
              rounded-lg flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Enrollments</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartEvaluation(exam.id)}
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700
              rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Evaluation</span>
          </motion.button>

          <div className="flex items-center gap-2 ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(exam)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg
                hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(exam)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg
                hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-10 bg-gradient-to-b from-white to-gray-50">
        
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <StepDot
                  number={index + 1}
                  isActive={activeStep === index}
                  isCompleted={index < activeStep}
                  onClick={() => {
                    setActiveStep(index);
                    step.action();
                  }}
                />
                {index < steps.length - 1 && (
                  <StepConnector
                    isActive={activeStep > index}
                    isCompleted={index < activeStep - 1}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-4"
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  className="p-3 bg-blue-50 rounded-full mb-2" 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-blue-600" })}
                </motion.div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {steps[activeStep].label}
                </h4>
                <p className="text-sm text-gray-500">
                  {steps[activeStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={steps[activeStep].action}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-full flex items-center gap-2
              shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-300"
          >
            {React.createElement(steps[activeStep].icon, { className: "w-4 h-4" })}
            <span>{steps[activeStep].label}</span>
          </motion.button>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 transform rotate-180" />
            </motion.button>
            <div className="text-sm text-gray-500">
              Step {activeStep + 1} of {steps.length}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EnrollmentsModal = ({ isOpen, onClose, examId, courseId, onEnrollmentChange }) => {
  const [students, setStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && examId && courseId) {
      fetchData();
    }
  }, [isOpen, examId, courseId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch course students
      const studentsResponse = await fetch(`${API_BASE_URL}/professors/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }

      const studentsData = await studentsResponse.json();
      if (studentsData.code !== 200) {
        throw new Error(studentsData.message || 'Failed to fetch students');
      }

      // Filter out invalid students and transform data
      const validStudents = (studentsData.data || [])
        .filter(student => student && student.student_id && student.student_name)
        .map(student => ({
          id: student.student_id,
          name: student.student_name
        }));

      setStudents(validStudents);

      // Fetch exam enrollments
      const enrollmentsResponse = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!enrollmentsResponse.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollmentsData = await enrollmentsResponse.json();
      if (enrollmentsData.code !== 200) {
        throw new Error(enrollmentsData.message || 'Failed to fetch enrollments');
      }

      // Create set of enrolled student IDs
      const enrolledIds = new Set(
        (enrollmentsData.data || [])
          .filter(enrollment => enrollment && enrollment.student_id)
          .map(enrollment => enrollment.student_id)
      );

      setEnrolledStudents(enrolledIds);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStudent = async (studentId) => {
    setIsLoading(true);
    setError('');
    try {
      const isEnrolled = enrolledStudents.has(studentId);
      await onEnrollmentChange(studentId, !isEnrolled);
      
      // Update local state
      setEnrolledStudents(prev => {
        const newSet = new Set(prev);
        if (isEnrolled) {
          newSet.delete(studentId);
        } else {
          newSet.add(studentId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling student enrollment:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeselectAll = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Remove all students from exam
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove all enrollments');
      }

      const data = await response.json();
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to remove all enrollments');
      }

      setEnrolledStudents(new Set());
      
      // Notify parent component
      if (onEnrollmentChange) {
        onEnrollmentChange(null, false);
      }
    } catch (error) {
      console.error('Error removing all enrollments:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return student.name.toLowerCase().includes(query) || 
           student.id.toLowerCase().includes(query);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Enrollments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && students.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No students found in this course.
          </div>
        )}

        {!isLoading && students.length > 0 && (
          <>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {filteredStudents.length} students found
                </span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-red-600 hover:text-red-700"
                  disabled={isLoading || enrolledStudents.size === 0}
                >
                  Deselect All
                </button>
              </div>
              <div className="space-y-2">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={enrolledStudents.has(student.id)}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStudent(student.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      {enrolledStudents.has(student.id) ? 'Deselect' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            Done
          </button>
        </div>
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
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnswerUploadModal, setShowAnswerUploadModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [currentExamQuestions, setCurrentExamQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedExamForEvaluation, setSelectedExamForEvaluation] = useState(null);
  const [questionsHaveRubrics, setQuestionsHaveRubrics] = useState({});
  const [showRecheckRequests, setShowRecheckRequests] = useState(false);
  const [selectedExamForRecheck, setSelectedExamForRecheck] = useState(null);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [selectedExamForEnrollments, setSelectedExamForEnrollments] = useState(null);

  useEffect(() => {
    if (!courseId) {
      console.error('CourseId is undefined in ExamsTab component');
      showToast('Error: Course ID is missing. Some features may not work correctly.', 'error');
    } else {
      console.log(`ExamsTab initialized with courseId: ${courseId}`);
    }
  }, [courseId]);

  const filteredExams = exams.filter(exam =>
    exam.exam_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  }, []);

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
      return data;
    } catch (error) {
      showToast(error.message || 'Failed to save rubric', 'error');
      throw error;
    }
  };

  const handleStartEvaluation = async (examId) => {
    try {
      if (!examId) {
        throw new Error('Exam ID is missing');
      }
      
      showToast('Preparing evaluation...', 'success');
      
      setSelectedExamForEvaluation(examId);
      setShowEvaluation(true);
      
    } catch (error) {
      console.error('Error starting evaluation:', error);
      showToast(error.message || 'Failed to start evaluation', 'error');
    }
  };

  const handleGetEnrollments = async (examId) => {
    setSelectedExamForEnrollments(examId);
    setShowEnrollmentsModal(true);
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
    } catch (error) {
      console.error('Error updating enrollment:', error);
      showToast(error.message || 'Failed to update enrollment', 'error');
    }
  };

  const handleUploadClick = async (examId) => {
    if (!examId) {
      showToast('Error: Exam ID is missing', 'error');
      return;
    }
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
            max_marks: 10,
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <nav className="flex items-center gap-2 text-sm">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Courses
          </motion.button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            CS F111
          </motion.button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-blue-600 font-medium">Exams</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-300 text-gray-700"
            />
          </div>

          <div className="flex items-center gap-3">                                    
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
                rounded-xl hover:bg-blue-700 transition-all duration-300
                shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              Create Exam
            </motion.button>
          </div>
        </div>

        <motion.div
          layout
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredExams.map((exam) => (
              <motion.div
                key={exam.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ExamCard
                  exam={exam}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUploadQnA={handleUploadClick}
                  onGenerateRubrics={handleGenerateRubrics}
                  onUploadAnswers={handleAnswerUpload}
                  onGetEnrollments={handleGetEnrollments}
                  onStartEvaluation={handleStartEvaluation}
                  onViewRecheckRequests={handleViewRecheckRequests}
                />
              </motion.div>
            ))}

            {filteredExams.length === 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 
                  p-12 text-center"
              >
                <div className="flex flex-col items-center max-w-sm mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-gray-50 rounded-full flex items-center 
                      justify-center mb-4"
                  >
                    <Search className="w-8 h-8 text-gray-400" />
                  </motion.div>
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onAdd}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                        text-white rounded-xl hover:bg-blue-700 transition-all duration-300
                        shadow-sm hover:shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                      Create First Exam
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />

        <UploadQnAModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedExamId(null);
            setExistingQuestions([]);
          }}
          examId={selectedExamId}
          existingQuestions={existingQuestions}
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
          onSave={handleRubricSave}
        />

        <AnswerUploadModal
          isOpen={showAnswerUploadModal}
          onClose={() => {
            setShowAnswerUploadModal(false);
            setSelectedExamId(null);
          }}
          examId={selectedExamId}
          courseId={courseId}
          onUpload={async (data) => {
            showToast('Answer sheets uploaded successfully', 'success');
            return data;
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
        />
      </motion.div>

      {showEvaluation && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="min-h-screen p-6">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <ExamEvaluation
                examId={selectedExamForEvaluation}
                courseId={courseId}
                onClose={() => {
                  setShowEvaluation(false);
                  setSelectedExamForEvaluation(null);
                }}
                onEvaluateSubmission={async (examId, enrollmentId) => {
                  try {
                    if (!examId || !enrollmentId) {
                      showToast('Error: Missing parameters for evaluation', 'error');
                      return { status: 'failed', message: 'Missing parameters' };
                    }
                    
                    const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${enrollmentId}`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({}) 
                    });

                    if (!response.ok) {
                      throw new Error(`API call failed with status ${response.status}`);
                    } 
                    
                    const data = await response.json();
                    if (data.code === 200) {
                      showToast('Evaluation completed successfully', 'success');
                      return data.data;
                    } else {
                      throw new Error(data.message || 'Evaluation failed');
                    }
                  } catch (error) {
                    console.error('Error evaluating submission:', error);
                    showToast(error.message || 'Failed to evaluate submission', 'error');
                    
                    return { 
                      status: 'failed', 
                      message: error.message || 'Failed to evaluate submission'
                    };
                  }
                }}
              />
            </React.Suspense>
          </div>
        </div>
      )}
      {showRecheckRequests && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="min-h-screen p-6">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <ProfessorRecheckRequests
                examId={selectedExamForRecheck}
                courseId={courseId}
                onClose={() => {
                  setShowRecheckRequests(false);
                  setSelectedExamForRecheck(null);
                }}
              />
            </React.Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default ExamsTab;