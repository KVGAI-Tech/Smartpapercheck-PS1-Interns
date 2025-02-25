import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2,
  ChevronRight, Calendar, Upload,
  Users, PlayCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadQnAModal from '../modals/UploadQnAModal';
import RubricModal from '../modals/RubricModal';

const API_BASE_URL = 'https://api.whyujjwal.com';

const StepDot = ({ number, isActive, isCompleted, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-12 h-12 rounded-full flex items-center justify-center text-base 
      cursor-pointer shadow-sm transition-all duration-300 ease-out 
      ${isActive ? 'bg-blue-500 text-white scale-110 shadow-lg' :
        isCompleted ? 'bg-green-100 text-green-600 border-2 border-green-500' :
          'bg-white text-gray-400 border-2 border-gray-200 hover:border-blue-300'
      }`}
  >
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {number}
    </motion.span>
  </motion.div>
);

const StepConnector = ({ isActive, isCompleted }) => (
  <div className="flex-1 px-6">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5 }}
      className={`h-0.5 origin-left transition-all duration-300 ease-out 
        ${isCompleted ? 'bg-green-500' :
          isActive ? 'bg-blue-500' :
            'bg-gray-200'
        }`}
    />
  </div>
);

const AnswerUploadModal = ({ isOpen, onClose, examId, onUpload }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
    if (droppedFile && droppedFile.type === 'application/zip') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid ZIP file');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/zip') {
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

    setIsUploading(true);
    const formData = new FormData();
    formData.append('zip_file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/upload-answers`, {
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
      onUpload(data);
      onClose();
    } catch (error) {
      setError(error.message);
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
                      accept=".zip"
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
                className="text-red-500 text-sm mb-4"
              >
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
                disabled={isUploading || !file}
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
  onStartEvaluation
}) => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    { label: 'Upload Q&A', action: () => onUploadQnA(exam.id) },
    { label: 'Generate Rubrics', action: () => onGenerateRubrics(exam.id) },
    { label: 'Upload Answer Sheets', action: () => onUploadAnswers(exam.id) }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        transition-all duration-300 hover:shadow-lg"
    >
      <div className="p-6 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-semibold text-gray-900">{exam.exam_name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(exam.date || Date.now()).toLocaleDateString()}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <span className="font-medium">{exam.full_marks} marks</span>
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

      <div className="px-16 py-10">
        <div className="flex items-center justify-center">
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
        <div className="text-center mt-6">
          <motion.span
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-gray-600"
          >
            {steps[activeStep].label}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const ExamsTab = ({
  exams = [],
  searchQuery = '',
  onSearchChange = () => { },
  onAdd = () => { },
  onEdit = () => { },
  onDelete = () => { },
  onUploadQnA = () => { },
  onGenerateRubrics = () => { },
  onUploadAnswers = () => { }
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnswerUploadModal, setShowAnswerUploadModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [existingQuestions, setExistingQuestions] = useState([]);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [currentExamQuestions, setCurrentExamQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredExams = exams.filter(exam =>
    exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchExamQuestions = async (examId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }

      const data = await response.json();
      return data.data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  };

  const handleQnAUpload = async (examId, formData) => {
    if (!examId) {
      throw new Error('Exam ID is required');
    }
    
    if (!formData) {
      throw new Error('Form data is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  };

  const handleUploadClick = async (examId) => {
    setIsLoading(true);
    try {
      const questions = await fetchExamQuestions(examId);
      setExistingQuestions(questions);
      setSelectedExamId(examId);
      setShowUploadModal(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      setExistingQuestions([]);
      setSelectedExamId(examId);
      setShowUploadModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerUpload = async (examId) => {
    setSelectedExamId(examId);
    setShowAnswerUploadModal(true);
  };

  const handleGetEnrollments = async (examId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/enrollments/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch enrollments: ${response.status}`);
      }

      const data = await response.json();
      console.log('Enrollments:', data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleStartEvaluation = async (examId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to start evaluation: ${response.status}`);
      }

      const data = await response.json();
      console.log('Evaluation started:', data);
    } catch (error) {
      console.error('Error starting evaluation:', error);
    }
  };

  const handleGenerateRubrics = async (examId) => {
    setIsLoading(true);
    try {
      const questions = await fetchExamQuestions(examId);
      if (questions && questions.length > 0) {
        setCurrentExamQuestions(questions);
        setSelectedExamId(examId);
        setShowRubricModal(true);
      } else {
        throw new Error('No questions found for this exam');
      }
    } catch (error) {
      console.error('Error loading questions for rubrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRubricSave = async (rubricData) => {
    try {
      console.log('Rubric saved:', rubricData);
    } catch (error) {
      console.error('Error saving rubric:', error);
    }
  };

  return (
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

      <UploadQnAModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedExamId(null);
          setExistingQuestions([]);
        }}
        examId={selectedExamId}
        existingQuestions={existingQuestions}
        onSubmit={handleQnAUpload}
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
        onUpload={(data) => {
          console.log('Answers uploaded:', data);
        }}
      />
    </motion.div>
  );
};

export default ExamsTab;