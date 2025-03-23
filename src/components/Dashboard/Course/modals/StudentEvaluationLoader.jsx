import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Download, Share,
  FileText, MessageSquare, BarChart, CheckCircle, Bookmark,
  AlertCircle, Loader, User, Mail, Hash, Award, ThumbsUp, ThumbsDown,
  ZoomIn, ZoomOut, RefreshCw, ExternalLink, Eye, EyeOff, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';

const getSafeImageUrl = (url) => {
  if (!url) return null;
  
  if (url.startsWith('data:') || 
      url.startsWith('blob:') || 
      url.startsWith('/api/placeholder')) {
    return url;
  }
  
  if (url.toLowerCase().endsWith('.pdf')) {
    return "/api/placeholder/800/1200";
    
  }
  
  return url;
};

const PDFViewer = ({ url, onZoomIn, onZoomOut, onZoomReset, zoomLevel }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const handleError = () => {
    console.error("Failed to load PDF:", url);
    setError(true);
    setLoading(false);
  };
  
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Unable to load document</h3>
        <p className="text-gray-300 mb-6 max-w-md">
          The document could not be loaded due to access restrictions or CORS policy.
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open in new window</span>
        </a>
      </div>
    );
  }
  
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
            <p className="text-white">Loading document...</p>
          </div>
        </div>
      )}
      <div 
        className="transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <img
          src={getSafeImageUrl(url)}
          alt="Student Answer Sheet"
          className="max-w-full object-contain shadow-2xl rounded-lg"
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
      
      <div className="absolute bottom-6 right-6 flex bg-gray-900 bg-opacity-80 p-2 rounded-full shadow-xl">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom out"
          disabled={zoomLevel <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomReset}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors mx-1"
          title="Reset zoom"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Zoom in"
          disabled={zoomLevel >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${getColor()}`}
      />
    </div>
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

const FeedbackBadge = ({ type, count }) => {
  return (
    <div className={`
      inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
      ${type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
    `}>
      {type === 'positive' ? (
        <ThumbsUp className="w-3 h-3 mr-1" />
      ) : (
        <ThumbsDown className="w-3 h-3 mr-1" />
      )}
      <span>{count}</span>
    </div>
  );
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPDFControls, setShowPDFControls] = useState(false);

  const pageTransition = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };
  
  useEffect(() => {
    const fetchStudentEvaluation = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/feedback/${enrollmentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include'
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
          },
          mode: 'cors',
          credentials: 'include'
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
        item_grades: edits.items.map((item) => ({
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
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'include'
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
            item_grades: edits.items.map((item) => ({
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
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Loading evaluation</h3>
          <p className="text-gray-500">Please wait while we fetch the student's work...</p>
        </div>
      </motion.div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md px-6"
        >
          <div className="inline-block bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Failed to Load Evaluation</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }
  
  const currentQuestion = getCurrentQuestion();
  const currentEvaluation = getCurrentEvaluation();
  const questionNumber = currentQuestion?.question_number || 1;
  
  return (
    <div className={`fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
      >
        <div className="flex items-start">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors self-start"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </motion.button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Student Evaluation</h1>
            {studentData?.student && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1"
              >
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
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span className="font-medium">
              <AnimatedCounter value={studentData?.marks_obtained || 0} />
            </span>
            <span className="text-blue-500">/</span>
            <span>{getCurrentQuestion()?.max_marks || 10}</span>
          </motion.div>
          
          <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download evaluation"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share evaluation"
            >
              <Share className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden border-r border-gray-200 ${isFullscreen ? 'md:w-full' : ''}`}
          onMouseEnter={() => setShowPDFControls(true)}
          onMouseLeave={() => setShowPDFControls(false)}
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Student Answer Sheet
            </h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: showPDFControls ? 1 : 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </motion.div>
          </div>
          
          <div
            ref={answerSheetRef}
            className="flex-1 overflow-auto bg-gradient-to-b from-gray-800 to-gray-900"
            onScroll={handleScroll}
          >
            {answerSheetUrl ? (
              <PDFViewer
                url={answerSheetUrl}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                zoomLevel={zoomLevel}
              />
            ) : (
              <div className="text-center p-8 text-gray-400">
                No answer sheet available
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-white ${isFullscreen ? 'hidden md:hidden' : ''}`}
          >
            <div className="flex border-b border-gray-200">
              {[
                { id: 'question', label: 'Question', icon: <FileText className="w-4 h-4" /> },
                { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'stats', label: 'Statistics', icon: <BarChart className="w-4 h-4" /> }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ backgroundColor: tab.id === activeTab ? '' : 'rgba(0,0,0,0.02)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                  text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Previous question"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= questions.length - 1}
                className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                  text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Next question"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'question' && (
                  <motion.div
                    key="question-tab"
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <span>Question {questionNumber}</span>
                        <span className="text-sm text-gray-500 font-normal rounded-full bg-gray-100 px-2 py-0.5">
                          {currentQuestion?.domain || 'General'}
                        </span>
                      </h3>
                      
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-gray-700">{currentQuestion?.question_text || 'No question text available'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900">Question Image</h4>
                        </div>
                        <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                          {currentQuestion?.question_file_url ? (
                            <img
                              src={getSafeImageUrl(currentQuestion.question_file_url)}
                              alt={`Question ${questionNumber}`}
                              className="max-h-full object-contain rounded shadow-sm"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/400/300";
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <FileText className="w-10 h-10 mb-2" />
                              <span className="text-sm">No image available</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900">Answer Key</h4>
                        </div>
                        <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden p-2">
                          {currentQuestion?.answer_file_url ? (
                            <img
                              src={getSafeImageUrl(currentQuestion.answer_file_url)}
                              alt={`Answer for Question ${questionNumber}`}
                              className="max-h-full object-contain rounded shadow-sm"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/400/300";
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <FileText className="w-10 h-10 mb-2" />
                              <span className="text-sm">No image available</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                    
                    {currentEvaluation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-800">Scoring Summary</h4>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-blue-600">
                              {currentEvaluation.total_marks} / {currentQuestion?.max_marks || 10}
                            </div>
                            <div className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {formatPercentage(currentEvaluation.total_marks, currentQuestion?.max_marks || 10)}
                            </div>
                          </div>
                        </div>
                        
                        {currentEvaluation.overall_feedback && (
                          <div>
                            <h5 className="text-xs uppercase text-blue-600 font-medium mb-1">Overall Feedback</h5>
                            <div className="text-sm text-gray-700 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                              {currentEvaluation.overall_feedback}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'feedback' && (
                  <motion.div
                    key="feedback-tab"
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    {currentEvaluation ? (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between"
                        >
                          <h3 className="text-lg font-medium text-gray-900">
                            Feedback & Assessment
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={saveFeedback}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-all disabled:opacity-50 shadow-sm"
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
                          </motion.button>
                        </motion.div>
                        
                        <div className="space-y-5">
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                          >
                            <label className="block text-sm font-medium text-gray-700">
                              Overall Feedback
                            </label>
                            <textarea
                              value={feedbackEdits[`question_${questionNumber}`]?.overall || ''}
                              onChange={(e) => handleFeedbackChange(`question_${questionNumber}`, e.target.value)}
                              placeholder="Enter overall feedback for this question..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              rows={4}
                            />
                          </motion.div>
                          
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-4"
                          >
                            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                              Assessment Criteria
                            </h4>
                            
                            {currentEvaluation.item_grades?.map((item, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 3) }}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-sm">
                                      {item.item_number}
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      Criterion {item.item_number}
                                    </h5>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-blue-600 mr-2">
                                      {item.marks_awarded} points
                                    </span>
                                    <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(item.marks_awarded / 10) * 100}%` }}
                                      ></div>
                                    </div>
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
                              </motion.div>
                            ))}
                            
                            {(!currentEvaluation.item_grades || currentEvaluation.item_grades.length === 0) && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center py-8 bg-gray-50 rounded-lg"
                              >
                                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                  <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No assessment criteria available</p>
                              </motion.div>
                            )}
                          </motion.div>
                          
                          {currentEvaluation.improvement_suggestions && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="space-y-2"
                            >
                              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4 text-yellow-500" />
                                Improvement Suggestions
                              </h4>
                              <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                                {currentEvaluation.improvement_suggestions}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                      >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <MessageSquare className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Feedback Available</h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                          There is no feedback available for this question yet.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          Add Feedback
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'stats' && (
                  <motion.div
                    key="stats-tab"
                    variants={pageTransition}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <motion.h3 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-medium text-gray-900 flex items-center gap-2"
                    >
                      <BarChart className="w-5 h-5 text-blue-500" />
                      <span>Performance Statistics</span>
                    </motion.h3>
                    
                    {currentEvaluation ? (
                      <div className="space-y-6">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          {[
                            {
                              label: "Score",
                              value: currentEvaluation.total_marks,
                              max: currentQuestion?.max_marks || 10,
                              color: "from-blue-500 to-blue-600",
                              icon: <Award className="w-5 h-5 text-blue-50" />
                            },
                            {
                              label: "Percentage",
                              value: `${Math.round((currentEvaluation.total_marks / (currentQuestion?.max_marks || 10)) * 100)}%`,
                              color: "from-green-500 to-green-600",
                              icon: <CheckCircle className="w-5 h-5 text-green-50" />
                            },
                            {
                              label: "Criteria",
                              value: currentEvaluation.item_grades?.length || 0,
                              color: "from-purple-500 to-purple-600",
                              icon: <Filter className="w-5 h-5 text-purple-50" />
                            }
                          ].map((stat, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * (i + 1) }}
                              className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex justify-center mb-2">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                                  {stat.icon}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">{stat.label}</div>
                              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 mt-1">
                                {typeof stat.value === 'number' ? 
                                  <AnimatedCounter value={stat.value} /> : 
                                  stat.value
                                }
                              </div>
                              {stat.max && (
                                <div className="text-xs text-gray-500 mt-1">
                                  out of {stat.max}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-blue-500" />
                            <span>Score Breakdown</span>
                          </h4>
                          
                          {currentEvaluation.item_grades?.map((item, index) => {
                            const maxItemMarks = 10; 
                            const percentage = (item.marks_awarded / maxItemMarks) * 100;
                            
                            const getBarColor = () => {
                              if (percentage >= 80) return 'bg-green-500';
                              if (percentage >= 60) return 'bg-blue-500';
                              if (percentage >= 40) return 'bg-yellow-500';
                              return 'bg-red-500';
                            };
                            
                            return (
                              <motion.div 
                                key={index} 
                                className="mb-4 last:mb-0"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * (index + 4) }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="text-sm text-gray-700 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
                                      {item.item_number}
                                    </div>
                                    <span>Criterion {item.item_number}</span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.marks_awarded} / {maxItemMarks}
                                  </div>
                                </div>
                                
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${getBarColor()}`}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                          
                          {(!currentEvaluation.item_grades || currentEvaluation.item_grades.length === 0) && (
                            <div className="text-center py-6">
                              <p className="text-sm text-gray-500">No assessment criteria available</p>
                            </div>
                          )}
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Search className="w-4 h-4 text-blue-500" />
                              <span>Strengths & Weaknesses</span>
                            </h4>
                            
                            <div className="flex gap-2">
                              <FeedbackBadge type="positive" count={3} />
                              <FeedbackBadge type="negative" count={3} />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg shadow-sm"
                            >
                              <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                                <ThumbsUp className="w-4 h-4" />
                                <span>Strengths</span>
                              </h5>
                              <ul className="text-sm text-green-700 space-y-1 pl-6 list-disc">
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  Strong problem-solving approach
                                </motion.li>
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 }}
                                >
                                  Good mathematical foundation
                                </motion.li>
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 }}
                                >
                                  Clear presentation of work
                                </motion.li>
                              </ul>
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg shadow-sm"
                            >
                              <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4" />
                                <span>Areas for Improvement</span>
                              </h5>
                              <ul className="text-sm text-red-700 space-y-1 pl-6 list-disc">
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 }}
                                >
                                  Some calculation errors
                                </motion.li>
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 }}
                                >
                                  Needs more step-by-step explanations
                                </motion.li>
                                <motion.li 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.9 }}
                                >
                                  Could improve organization of solutions
                                </motion.li>
                              </ul>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                      >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <BarChart className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Statistics Available</h3>
                        <p className="text-gray-500 max-w-md mx-auto px-4">
                          Statistics will be available after evaluation is complete.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
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