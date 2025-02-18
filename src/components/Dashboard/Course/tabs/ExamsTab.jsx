import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2,
  ChevronRight, Calendar
} from 'lucide-react';
import UploadQnAModal from '../modals/UploadQnAModal';
import RubricModal from '../modals/RubricModal';

const API_BASE_URL = 'http://43.205.184.7:8000';

const StepDot = ({ number, isActive, isCompleted }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
    transition-all duration-300 ease-out ${isActive ? 'bg-blue-100 text-blue-600 scale-110' :
      isCompleted ? 'bg-blue-50 text-blue-600' :
        'bg-gray-100 text-gray-400'
    }`}>
    {number}
  </div>
);

const StepConnector = ({ isActive, isCompleted }) => (
  <div className="flex-1 px-4">
    <div className={`h-[1px] transition-all duration-300 ease-out ${isCompleted ? 'bg-blue-200' :
        isActive ? 'bg-blue-100' :
          'bg-gray-200'
      }`} />
  </div>
);

const ExamCard = ({
  exam,
  onEdit,
  onDelete,
  onUploadQnA,
  onGenerateRubrics,
  onUploadAnswers
}) => {
  const steps = [
    { label: 'Upload Q&A', action: () => onUploadQnA(exam.id) },
    { label: 'Generate Rubrics', action: () => onGenerateRubrics(exam.id) }, 
    { label: 'Upload Answer Sheets', action: () => onUploadAnswers(exam.id) }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden
      transition-all duration-300 hover:shadow-md">
      <div className="p-4 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-6">
          <h3 className="text-lg font-semibold text-gray-900">{exam.exam_name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(exam.date || Date.now()).toLocaleDateString()}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <span>{exam.full_marks} marks</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(exam)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg
              hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(exam)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg
              hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-12 py-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <StepDot
                  number={index + 1}
                  isActive={true}
                  isCompleted={false}
                />
                <button
                  onClick={step.action}
                  className="mt-4 text-sm font-medium transition-all duration-300
                    text-blue-600 hover:text-blue-700"
                >
                  {step.label}
                </button>
              </div>
              {index < steps.length - 1 && (
                <StepConnector
                  isActive={true} 
                  isCompleted={false}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
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
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <button className="text-gray-500 hover:text-gray-700">Courses</button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <button className="text-gray-500 hover:text-gray-700">CS F111</button>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-300"
          />
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
            rounded-lg hover:bg-blue-700 transition-all duration-300
            shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-5 h-5" />
          Create Exam
        </button>
      </div>

      <div className="space-y-4">
        {filteredExams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onEdit={onEdit}
            onDelete={onDelete}
            onUploadQnA={handleUploadClick}
            onGenerateRubrics={handleGenerateRubrics}
            onUploadAnswers={onUploadAnswers}
          />
        ))}

        {filteredExams.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 
            p-12 text-center">
            <div className="flex flex-col items-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center 
                justify-center mb-4">
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                    text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Create First Exam
                </button>
              )}
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ExamsTab;