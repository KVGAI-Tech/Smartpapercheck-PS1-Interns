import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Download, Share,
  FileText, MessageSquare, BarChart, CheckCircle, Bookmark,
  AlertCircle, Loader, User, Mail, Hash, Award, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';

const StudentEvaluationLoader = ({ 
  examId, 
  enrollmentId, 
  onClose,
  onSaveFeedback = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerSheetUrl, setAnswerSheetUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [activeTab, setActiveTab] = useState('question'); 
  const answerSheetRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackEdits, setFeedbackEdits] = useState({});
  const [showToast, setShowToast] = useState({ visible: false, message: '', type: 'success' });

  
  useEffect(() => {
    const fetchStudentEvaluation = async () => {
      setLoading(true);
      try {
        
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch evaluation: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code === 200) {
          setStudentData(data.data);
          setAnswerSheetUrl(data.data.answer_sheet_url);
          
          
          const initialFeedback = {};
          Object.entries(data.data.evaluations || {}).forEach(([qKey, qEval]) => {
            initialFeedback[qKey] = {
              overall: qEval.overall_feedback || '',
              items: qEval.item_grades?.map(grade => ({
                ...grade,
                editedFeedback: grade.feedback
              })) || []
            };
          });
          
          setFeedbackEdits(initialFeedback);
          
          
          await fetchQuestions();
        } else {
          throw new Error(data.message || 'Failed to load student evaluation');
        }
      } catch (error) {
        console.error("Error fetching student evaluation:", error);
        setError(error.message || "Failed to load student evaluation");
        
        
        createMockData();
      } finally {
        setLoading(false);
      }
    };
    
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/question-answer`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200) {
          setQuestions(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to load questions');
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        
      }
    };
    
    const createMockData = () => {
      
      const mockStudent = {
        student: {
          name: "Bhanu G",
          roll_number: "2022CHX1111",
          email: "f20221683@pilani.bits-pilani.ac.in"
        },
        marks_obtained: 4.2,
        answer_sheet_url: "/api/placeholder/800/1200", 
        evaluations: {
          "question_1": {
            item_grades: [
              {
                item_number: 1,
                marks_awarded: 1.5,
                feedback: "The student correctly identified the circuit components and set up the problem properly. However, the explanation of the initial conditions and problem setup could have been clearer."
              },
              {
                item_number: 2,
                marks_awarded: 1.5,
                feedback: "The mathematical approach is mostly correct, but there are some calculation errors that affect the final result. The determinant method used is valid, but the execution could be cleaner."
              },
              {
                item_number: 3,
                marks_awarded: 1.2,
                feedback: "The explanation is somewhat structured, but lacks clarity in some steps. More detailed justifications and step-by-step reasoning would improve readability and understanding."
              }
            ],
            total_marks: 4.2,
            overall_feedback: "The student demonstrated a good understanding of the problem and applied the correct methodology. However, some calculations contained errors, and the explanation could have been clearer.",
            improvement_suggestions: "The student should carefully verify calculations to avoid errors and present the solution in a more structured manner. Adding more explanations between steps would enhance clarity."
          }
        },
        evaluation_status: "completed"
      };
      
      setStudentData(mockStudent);
      setAnswerSheetUrl("/api/placeholder/800/1200");
      
      
      const mockQuestions = [
        {
          question_number: 1,
          question_text: "Find current i(t) and voltage v(t) in the circuit shown below. Given i(0) = 5 A.",
          max_marks: 6.0,
          domain: "Electrical",
          question_file_url: "/api/placeholder/400/300",
          answer_file_url: "/api/placeholder/400/300"
        }
      ];
      
      setQuestions(mockQuestions);
      
      
      const initialFeedback = {};
      Object.entries(mockStudent.evaluations || {}).forEach(([qKey, qEval]) => {
        initialFeedback[qKey] = {
          overall: qEval.overall_feedback || '',
          items: qEval.item_grades?.map(grade => ({
            ...grade,
            editedFeedback: grade.feedback
          })) || []
        };
      });
      
      setFeedbackEdits(initialFeedback);
    };
    
    fetchStudentEvaluation();
  }, [examId, enrollmentId]);
  
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions.length - 1)) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  
  const getCurrentQuestion = () => {
    if (!questions.length) return null;
    return questions[currentQuestionIndex];
  };
  
  
  const getCurrentEvaluation = () => {
    if (!studentData?.evaluations) return null;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;
    
    return studentData.evaluations[`question_${currentQuestion.question_number}`] || null;
  };
  
  
  const handleFeedbackChange = (questionKey, value) => {
    setFeedbackEdits(prev => ({
      ...prev,
      [questionKey]: {
        ...prev[questionKey],
        overall: value
      }
    }));
  };
  
  const handleItemFeedbackChange = (questionKey, itemIndex, value) => {
    setFeedbackEdits(prev => {
      const newItems = [...(prev[questionKey]?.items || [])];
      if (newItems[itemIndex]) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          editedFeedback: value
        };
      }
      
      return {
        ...prev,
        [questionKey]: {
          ...prev[questionKey],
          items: newItems
        }
      };
    });
  };
  
  
  const saveFeedback = async () => {
    setIsSaving(true);
    try {
      
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion) {
        throw new Error('No question selected');
      }
      
      const questionKey = `question_${currentQuestion.question_number}`;
      const edits = feedbackEdits[questionKey];
      
      if (!edits) {
        throw new Error('No edits to save');
      }
      
      const payload = {
        exam_id: examId,
        enrollment_id: enrollmentId,
        question_number: currentQuestion.question_number,
        overall_feedback: edits.overall,
        item_grades: edits.items.map((item, index) => ({
          item_number: item.item_number,
          feedback: item.editedFeedback,
          marks_awarded: item.marks_awarded
        }))
      };
      
      
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/update-feedback/${enrollmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save feedback: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to save feedback');
      }
      
      
      setStudentData(prev => {
        if (!prev) return prev;
        
        const updatedEvaluations = { ...prev.evaluations };
        if (updatedEvaluations[questionKey]) {
          updatedEvaluations[questionKey] = {
            ...updatedEvaluations[questionKey],
            overall_feedback: edits.overall,
            item_grades: edits.items.map((item, index) => ({
              ...item,
              feedback: item.editedFeedback
            }))
          };
        }
        
        return {
          ...prev,
          evaluations: updatedEvaluations
        };
      });
      
      
      onSaveFeedback(payload);
      
      
      setShowToast({
        visible: true,
        message: 'Feedback saved successfully',
        type: 'success'
      });
      
      
      setTimeout(() => {
        setShowToast({ visible: false, message: '', type: 'success' });
      }, 3000);
    } catch (error) {
      console.error("Error saving feedback:", error);
      setShowToast({
        visible: true,
        message: error.message || 'Failed to save feedback',
        type: 'error'
      });
      
      
      setTimeout(() => {
        setShowToast({ visible: false, message: '', type: 'success' });
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  const handleScroll = () => {
    if (answerSheetRef.current) {
      setScrollPosition(answerSheetRef.current.scrollTop);
    }
  };
  
  
  const formatPercentage = (value, max) => {
    if (!max) return '0%';
    return `${Math.round((value / max) * 100)}%`;
  };

  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading student evaluation...</p>
        </div>
      </div>
    );
  }
  
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-block bg-red-100 p-4 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Evaluation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  
  const currentQuestion = getCurrentQuestion();
  const currentEvaluation = getCurrentEvaluation();
  const questionNumber = currentQuestion?.question_number || 1;
  
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start">
          <button
            onClick={onClose}
            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Student Evaluation</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
              {studentData?.student && (
                <>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{studentData.student.name}</span>
                  </div>
                  <div className="hidden sm:block text-gray-300">•</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>{studentData.student.roll_number}</span>
                  </div>
                  <div className="hidden sm:block text-gray-300">•</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{studentData.student.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Award className="w-4 h-4" />
            <span className="font-medium">{studentData?.marks_obtained || 0}</span>
            <span className="text-blue-500">/</span>
            <span>{getCurrentQuestion()?.max_marks || 10}</span>
          </div>
          
          <button
            onClick={() => {}}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download evaluation"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {}}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share evaluation"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden border-r border-gray-200">
          <div className="bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-sm font-medium">Student Answer Sheet</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Zoom out"
                disabled={zoomLevel <= 0.5}
              >
                -
              </button>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Zoom in"
                disabled={zoomLevel >= 3}
              >
                +
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Reset zoom"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div
            ref={answerSheetRef}
            className="flex-1 overflow-auto bg-gray-700 flex items-center justify-center"
            onScroll={handleScroll}
          >
            {answerSheetUrl ? (
              <div
                className="relative p-4 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={answerSheetUrl}
                  alt="Student Answer Sheet"
                  className="max-w-full object-contain shadow-lg"
                />
                
                {annotations.map((annotation, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-red-500 bg-red-500/10"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      width: `${annotation.width}%`,
                      height: `${annotation.height}%`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-400">
                No answer sheet available
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-white">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('question')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'question'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Question</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart className="w-4 h-4" />
                <span>Statistics</span>
              </div>
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Previous question"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex >= questions.length - 1}
              className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Next question"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'question' && (
                <motion.div
                  key="question-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <span>Question {questionNumber}</span>
                      <span className="text-sm text-gray-500 font-normal">
                        ({currentQuestion?.domain || 'General'})
                      </span>
                    </h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{currentQuestion?.question_text || 'No question text available'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Question Image</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {currentQuestion?.question_file_url ? (
                          <img
                            src={currentQuestion.question_file_url}
                            alt={`Question ${questionNumber}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">No image available</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Answer Key</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {currentQuestion?.answer_file_url ? (
                          <img
                            src={currentQuestion.answer_file_url}
                            alt={`Answer for Question ${questionNumber}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">No image available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {currentEvaluation && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-900">Scoring</h4>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-blue-600">
                            {currentEvaluation.total_marks} / {currentQuestion?.max_marks || 10}
                          </div>
                          <div className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {formatPercentage(currentEvaluation.total_marks, currentQuestion?.max_marks || 10)}
                          </div>
                        </div>
                      </div>
                      
                      {currentEvaluation.overall_feedback && (
                        <div>
                          <h5 className="text-xs uppercase text-gray-500 font-medium mb-1">Overall Feedback</h5>
                          <p className="text-sm text-gray-700 p-3 bg-white rounded-lg">{currentEvaluation.overall_feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'feedback' && (
                <motion.div
                  key="feedback-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {currentEvaluation ? (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Feedback & Assessment
                        </h3>
                        <button
                          onClick={saveFeedback}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Save Feedback</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Overall Feedback
                          </label>
                          <textarea
                            value={feedbackEdits[`question_${questionNumber}`]?.overall || ''}
                            onChange={(e) => handleFeedbackChange(`question_${questionNumber}`, e.target.value)}
                            placeholder="Enter overall feedback for this question..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows={4}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">Assessment Criteria</h4>
                          
                          {currentEvaluation.item_grades?.map((item, index) => (
                            <div 
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    {item.item_number}
                                    </div>
                                  <h5 className="text-sm font-medium text-gray-900">
                                    Criterion {item.item_number}
                                  </h5>
                                </div>
                                
                                <div className="text-sm font-medium text-blue-600">
                                  {item.marks_awarded} points
                                </div>
                              </div>
                              
                              <div>
                                <textarea
                                  value={feedbackEdits[`question_${questionNumber}`]?.items[index]?.editedFeedback || ''}
                                  onChange={(e) => handleItemFeedbackChange(`question_${questionNumber}`, index, e.target.value)}
                                  placeholder="Enter feedback for this criterion..."
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ))}
                          
                          {(!currentEvaluation.item_grades || currentEvaluation.item_grades.length === 0) && (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500">No assessment criteria available</p>
                            </div>
                          )}
                        </div>
                        
                        {currentEvaluation.improvement_suggestions && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Improvement Suggestions</h4>
                            <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                              {currentEvaluation.improvement_suggestions}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Available</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        There is no feedback available for this question yet.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'stats' && (
                <motion.div
                  key="stats-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    Performance Statistics
                  </h3>
                  
                  {currentEvaluation ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-500">Score</div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">
                            {currentEvaluation.total_marks}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            out of {currentQuestion?.max_marks || 10}
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-500">Percentage</div>
                          <div className="text-2xl font-bold text-green-600 mt-1">
                            {formatPercentage(currentEvaluation.total_marks, currentQuestion?.max_marks || 10)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            of total marks
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-500">Criteria</div>
                          <div className="text-2xl font-bold text-purple-600 mt-1">
                            {currentEvaluation.item_grades?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            assessment items
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Score Breakdown</h4>
                        
                        {currentEvaluation.item_grades?.map((item, index) => {
                          const maxItemMarks = 10; 
                          const percentage = (item.marks_awarded / maxItemMarks) * 100;
                          
                          return (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm text-gray-700">
                                  Criterion {item.item_number}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.marks_awarded} / {maxItemMarks}
                                </div>
                              </div>
                              
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    percentage >= 80 ? 'bg-green-500' : 
                                    percentage >= 60 ? 'bg-blue-500' : 
                                    percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        
                        {(!currentEvaluation.item_grades || currentEvaluation.item_grades.length === 0) && (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-500">No assessment criteria available</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Strengths & Weaknesses</h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                            <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Strengths</span>
                            </h5>
                            <ul className="text-sm text-green-700 space-y-1 pl-6 list-disc">
                              <li>Strong problem-solving approach</li>
                              <li>Good mathematical foundation</li>
                              <li>Clear presentation of work</li>
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                            <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                              <ThumbsDown className="w-4 h-4" />
                              <span>Areas for Improvement</span>
                            </h5>
                            <ul className="text-sm text-red-700 space-y-1 pl-6 list-disc">
                              <li>Some calculation errors</li>
                              <li>Needs more step-by-step explanations</li>
                              <li>Could improve organization of solutions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Statistics will be available after evaluation is complete.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {showToast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentEvaluationLoader;