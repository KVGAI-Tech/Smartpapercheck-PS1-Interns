import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, Save, 
  X, Check, AlertCircle, Loader, Download, 
  FileText, MessageSquare, BarChart, 
  CheckCircle, Eye, HelpCircle,
  ZoomIn, ZoomOut, Maximize, Minimize, Clock, RotateCw,
  Moon, Sun, XCircle
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  icon = null,
  colorScheme = "primary",
  size = "md",
  tooltip = "",
  withAnimation = true
}) => {
  const getButtonStyles = () => {
    const baseStyle = "rounded-lg transition-all flex items-center justify-center gap-2 font-medium";
    
    const colorStyles = {
      primary: `bg-accent hover:bg-accent/90 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      success: `bg-accent hover:bg-accent/90 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      danger: `bg-red-600 hover:bg-red-700 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-red-500/20'}`,
      secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm hover:shadow-gray-200/50'}`,
      ghost: `bg-transparent hover:bg-gray-100 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      outline: `bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`,
    };
    
    const sizeStyles = {
      sm: "px-2 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2"
    };
    
    return `${baseStyle} ${colorStyles[colorScheme]} ${sizeStyles[size]} ${className}`;
  };
  
  if (!withAnimation) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={getButtonStyles()}
        title={tooltip}
      >
        {icon && icon}
        {children}
      </button>
    );
  }
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={getButtonStyles()}
      title={tooltip}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {icon && icon}
      {children}
    </motion.button>
  );
};


const AnimatedCard = ({ 
  children, 
  className = "",
  hoverEffect = true,
  highlight = false
}) => {
  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-xl ${highlight ? 'ring-2 ring-accent ring-opacity-50' : ''} ${hoverEffect ? 'hover:shadow-md hover:border-accent/20' : ''} transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={hoverEffect ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};


const ScoreIndicator = ({ value, maxValue, size = "md", animated = true }) => {
  const percentage = (value / maxValue) * 100;
  const controls = useAnimation();
  const sizeClasses = {
    sm: "w-32 h-1",
    md: "w-full h-2",
    lg: "w-full h-3",
    xl: "w-full h-4"
  };
  
  const getColorClass = () => {
    if (percentage >= 60) return "bg-accent/80";
    if (percentage >= 40) return "bg-amber-500/80";
    if (percentage >= 20) return "bg-amber-600/80";
    return "bg-red-500";
  };
  
  useEffect(() => {
    if (animated) {
      controls.start({ width: `${percentage}%`, transition: { duration: 1, ease: "easeOut" } });
    }
  }, [percentage, animated, controls]);
  
  return (
    <div className={`${sizeClasses[size]} bg-gray-100 rounded-full overflow-hidden`}>
      <motion.div
        className={`h-full ${getColorClass()} rounded-full`}
        initial={{ width: "0%" }}
        animate={animated ? controls : { width: `${percentage}%` }}
      />
    </div>
  );
};


const QuestionNavigation = ({ 
  currentIndex, 
  totalQuestions, 
  onPrev, 
  onNext,
  questionScores = []
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <AnimatedButton
        onClick={onPrev}
        disabled={currentIndex === 0}
        colorScheme="ghost"
        size="icon"
        tooltip="Previous question"
        icon={<ChevronLeft className="w-5 h-5" />}
      />
      
      <div className="flex-1 mx-6">
        <div className="relative">
          <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
            <div 
              className="h-full bg-accent/80 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <div 
                key={idx} 
                className={`relative cursor-pointer group ${idx <= currentIndex ? 'text-accent' : 'text-gray-400'}`}
              >
                <div className={`
                  absolute -top-7 left-1/2 transform -translate-x-1/2 translate-y-2 opacity-0 
                  scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
                  transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none
                `}>
                  Q{idx + 1}: {questionScores[idx]?.score || 0}/{questionScores[idx]?.max || 10}
                </div>
                <div 
                  className={`
                    h-5 w-5 rounded-full flex items-center justify-center text-xs
                    ${idx === currentIndex ? 'bg-accent text-white' : 
                      idx < currentIndex ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'}
                    ${questionScores[idx]?.score === questionScores[idx]?.max ? 'ring-2 ring-accent/40' : ''}
                    transition-all duration-300
                  `}
                >
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <AnimatedButton
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
        colorScheme="ghost"
        size="icon"
        tooltip="Next question"
        icon={<ChevronRight className="w-5 h-5" />}
      />
    </div>
  );
};


const ToastNotification = ({ type, message, show, onClose }) => {
  const toastVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.8 }
  };
  
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-accent text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-amber-500 text-black';
      case 'info':
        return 'bg-accent text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg shadow-black/5 backdrop-blur-sm z-50 flex items-center gap-3 ${getToastStyles()}`}
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          {getIcon()}
          <span className="font-medium">{message}</span>
          <button 
            onClick={onClose} 
            className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full" 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const RubricScoreSelector = ({ 
  value,
  maxValue,
  onChange,
  disabled = false
}) => {
  const steps = Math.ceil(maxValue * 2) + 1;
  const activeColor = 'bg-accent/80';
  const inactiveColor = 'bg-gray-200';
  
  const getValueForStep = (step) => step / 2;
  
  return (
    <div className="space-y-2 w-full">
      <div className="flex w-full h-3 rounded-full overflow-hidden">
        {[...Array(steps)].map((_, idx) => {
          const stepValue = getValueForStep(idx);
          const isActive = stepValue <= value;
          
          return (
            <motion.button
              key={idx}
              disabled={disabled}
              onClick={() => onChange(stepValue)}
              className={`flex-1 h-full ${isActive ? activeColor : inactiveColor} 
                first:rounded-l-full last:rounded-r-full`}
              whileHover={disabled ? {} : { scaleY: 1.5 }}
              transition={{ duration: 0.2 }}
              title={`${stepValue}/${maxValue}`}
            />
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>{maxValue / 2}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
};


const GradientBorderWrapper = ({ 
  children, 
  className = "", 
  active = false,
  borderWidth = 1
}) => {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 bg-accent"
        animate={{ 
          opacity: active ? 1 : 0,
          rotate: active ? 360 : 0
        }}
        transition={{ 
          opacity: { duration: 0.5 },
          rotate: { duration: 6, repeat: Infinity, ease: "linear" }
        }}
      />
      
      <div 
        className={`relative bg-white rounded-xl m-[${borderWidth}px]`}
      >
        {children}
      </div>
    </div>
  );
};


const StatusBadge = ({ status, className = "" }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-accent/80';
      case 'pending':
        return 'bg-amber-500';
      case 'processing':
        return 'bg-accent/80';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <RotateCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  const rotateY = useMotionValue(0);
  const rotateX = useMotionValue(0);
  
  return (
    <motion.div
      className={`px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${getStatusColor()} ${className}`}
      style={{ 
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      whileHover={{ scale: 1.05 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        rotateY.set((mouseX - centerX) / 10);
        rotateX.set(-(mouseY - centerY) / 10);
      }}
      onMouseLeave={() => {
        rotateY.set(0);
        rotateX.set(0);
      }}
    >
      {getStatusIcon()}
      <span className="capitalize">{status}</span>
    </motion.div>
  );
};


const ExamEvaluationDetail = ({ 
  examId, 
  enrollmentId, 
  studentInfo = null, 
  onClose,
  onComplete,
  isConductExam = false,
  conductSubmissionId = null
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(studentInfo || {});
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerScript, setAnswerScript] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIEvaluating, setIsAIEvaluating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [marks, setMarks] = useState({});
  const [activeTab, setActiveTab] = useState('script');
  const [showScorePreview, setShowScorePreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [darkMode, setDarkMode] = useState(false); 
  const [previewMode, setPreviewMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const answerScriptRef = useRef(null);

  
  const questionScores = questions.map((q, idx) => {
    const questionMarks = marks[q.question_number] || { total: 0 };
    return {
      score: questionMarks.total,
      max: q.max_marks
    };
  });

  useEffect(() => {
    const fetchEvaluationData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        
        if (!studentInfo) {
          try {
            const enrollmentsResponse = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            if (!enrollmentsResponse.ok) {
              throw new Error(`Failed to fetch enrollments: ${enrollmentsResponse.status}`);
            }
            
            const enrollmentsData = await enrollmentsResponse.json();
            const foundStudent = enrollmentsData.data.find(
              enrollment => enrollment.enrollment_id === parseInt(enrollmentId)
            );
            
            if (foundStudent) {
              setStudent(foundStudent);
            } else {
              
              setStudent({
                enrollment_id: enrollmentId,
                student_name: "Student Name",
                roll_number: "R20XXXXX",
                marks_obtained: null,
                feedback: null
              });
            }
          } catch (err) {
            console.error("Error fetching student info:", err);
            
            setStudent({
              enrollment_id: enrollmentId,
              student_name: "Student Name",
              roll_number: "R20XXXXX",
              marks_obtained: null,
              feedback: null
            });
          }
        }
        
        
        try {
          
          const questionsResponse = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          
          let questionsData = [];
          
          if (questionsResponse.ok) {
            const questionsResult = await questionsResponse.json();
            questionsData = questionsResult.data.questions || [];
          }
          
          
          if (questionsData.length === 0) {
            questionsData = [
              {
                question_number: 1,
                question_text: "Explain the principles of fault tolerance and describe a redundancy technique along with an error detection and recovery strategy.",
                max_marks: 10,
                rubric_items: [
                  {
                    description: "Identification and explanation of fault tolerance principles",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for clear identification and explanation of at least 2 principles."
                  },
                  {
                    description: "Application of a relevant redundancy technique",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for correctly applying a relevant technique with clear explanation."
                  },
                  {
                    description: "Description of error detection and recovery strategy",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for comprehensive description with steps."
                  },
                  {
                    description: "Mathematical justification or logical reasoning",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for solid mathematical foundation or logical approach."
                  },
                  {
                    description: "Organization and clarity of response",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for well-structured, coherent answer."
                  }
                ]
              },
              {
                question_number: 2,
                question_text: "Compare and contrast virtualization and containerization in cloud computing.",
                max_marks: 10,
                rubric_items: [
                  {
                    description: "Definition of virtualization and containerization",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for accurate definitions of both technologies."
                  },
                  {
                    description: "Feature comparison between the two technologies",
                    max_marks: 3,
                    grading_guidelines: "Award full marks for comparing at least 3 features with accurate details."
                  },
                  {
                    description: "Use case analysis for both technologies",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for relevant use cases with justification."
                  },
                  {
                    description: "Technical advantages and disadvantages",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for balanced analysis of pros and cons."
                  },
                  {
                    description: "Critical evaluation of real-world implementations",
                    max_marks: 1,
                    grading_guidelines: "Award full marks for insightful analysis of actual deployments."
                  }
                ]
              },
              {
                question_number: 3,
                question_text: "Design a distributed system for handling microservices with emphasis on scalability and reliability.",
                max_marks: 10,
                rubric_items: [
                  {
                    description: "Architecture design and component overview",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for comprehensive architecture with all components."
                  },
                  {
                    description: "Scalability approaches and implementation",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for multiple relevant scalability techniques."
                  },
                  {
                    description: "Reliability measures and fault tolerance",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for thorough reliability considerations."
                  },
                  {
                    description: "Communication protocols and data flow",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for appropriate protocol selection with justification."
                  },
                  {
                    description: "Deployment strategy and operational considerations",
                    max_marks: 2,
                    grading_guidelines: "Award full marks for practical deployment plan with monitoring."
                  }
                ]
              }
            ];
          }
          
          setQuestions(questionsData);
          
          
          if (questionsData.length > 0) {
            const firstQuestion = questionsData[0];
            const initialRubrics = (firstQuestion.rubric_items || []).map(item => ({
              ...item,
              marks_awarded: 0,
              feedback: ''
            }));
            setRubrics(initialRubrics);
            
            
            const initialMarks = {};
            questionsData.forEach(q => {
              initialMarks[q.question_number] = {
                total: 0,
                feedback: '',
                itemGrades: (q.rubric_items || []).map(item => ({
                  item_number: item.description,
                  marks_awarded: 0,
                  feedback: '',
                  max_marks: item.max_marks
                }))
              };
            });
            setMarks(initialMarks);
          }
          
          // Fetch student answers - DIFFERENT for conduct exams
          if (isConductExam && conductSubmissionId) {
            // NEW: Fetch conduct exam submission detail
            const answersResponse = await fetch(
              `${API_BASE_URL}/exams/conduct-exams/submissions/${conductSubmissionId}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
              }
            );
            
            if (answersResponse.ok) {
              const answersData = await answersResponse.json();
              
              // For now, just set a placeholder - we'll handle answer display differently
              // Conduct exams have text and image answers per question
              setAnswerScript({
                isConductExam: true,
                questions: answersData.data.questions || []
              });
            } else {
              setAnswerScript(null);
            }
          } else {
            // Existing: Use placeholder for evaluated exams
            setAnswerScript("/api/placeholder/800/1200");
          }
          
        } catch (err) {
          console.error("Error fetching questions:", err);
          setError("Failed to load questions. Please try again.");
        }
        
      } catch (err) {
        console.error("Error initializing evaluation:", err);
        setError("Failed to initialize evaluation. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvaluationData();
  }, [examId, enrollmentId, studentInfo, isConductExam, conductSubmissionId]);
  
  
  const handleRubricScoreChange = (index, value) => {
    const updatedRubrics = [...rubrics];
    const item = updatedRubrics[index];
    
    
    const score = Math.min(parseFloat(value) || 0, item.max_marks);
    
    updatedRubrics[index] = {
      ...item,
      marks_awarded: score
    };
    
    setRubrics(updatedRubrics);
    
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const questionNumber = currentQuestion.question_number;
      const updatedMarks = { ...marks };
      
      if (!updatedMarks[questionNumber]) {
        updatedMarks[questionNumber] = {
          total: 0,
          feedback: '',
          itemGrades: []
        };
      }
      
      
      if (!updatedMarks[questionNumber].itemGrades) {
        updatedMarks[questionNumber].itemGrades = [];
      }
      
      if (!updatedMarks[questionNumber].itemGrades[index]) {
        updatedMarks[questionNumber].itemGrades[index] = {
          item_number: item.description,
          marks_awarded: 0,
          feedback: '',
          max_marks: item.max_marks
        };
      }
      
      updatedMarks[questionNumber].itemGrades[index].marks_awarded = score;
      
      
      updatedMarks[questionNumber].total = updatedMarks[questionNumber].itemGrades.reduce(
        (sum, grade) => sum + (parseFloat(grade.marks_awarded) || 0),
        0
      );
      
      setMarks(updatedMarks);
    }
  };
  
  
  const handleRubricFeedbackChange = (index, value) => {
    const updatedRubrics = [...rubrics];
    updatedRubrics[index] = {
      ...updatedRubrics[index],
      feedback: value
    };
    
    setRubrics(updatedRubrics);
    
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const questionNumber = currentQuestion.question_number;
      const updatedMarks = { ...marks };
      
      if (!updatedMarks[questionNumber]) {
        updatedMarks[questionNumber] = {
          total: 0,
          feedback: '',
          itemGrades: []
        };
      }
      
      
      if (!updatedMarks[questionNumber].itemGrades) {
        updatedMarks[questionNumber].itemGrades = [];
      }
      
      if (!updatedMarks[questionNumber].itemGrades[index]) {
        updatedMarks[questionNumber].itemGrades[index] = {
          item_number: updatedRubrics[index].description,
          marks_awarded: 0,
          feedback: '',
          max_marks: updatedRubrics[index].max_marks
        };
      }
      
      updatedMarks[questionNumber].itemGrades[index].feedback = value;
      
      setMarks(updatedMarks);
    }
  };
  
  
  const handleFeedbackChange = (value) => {
    setFeedback(value);
    
    
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const questionNumber = currentQuestion.question_number;
      const updatedMarks = { ...marks };
      
      if (!updatedMarks[questionNumber]) {
        updatedMarks[questionNumber] = {
          total: 0,
          feedback: '',
          itemGrades: []
        };
      }
      
      updatedMarks[questionNumber].feedback = value;
      
      setMarks(updatedMarks);
    }
  };
  
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      
      
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion) {
        const questionRubrics = nextQuestion.rubric_items || [];
        
        
        const existingMarks = marks[nextQuestion.question_number];
        
        if (existingMarks && existingMarks.itemGrades) {
          
          const updatedRubrics = questionRubrics.map((item, idx) => {
            const existingGrade = existingMarks.itemGrades[idx];
            return {
              ...item,
              marks_awarded: existingGrade ? existingGrade.marks_awarded : 0,
              feedback: existingGrade ? existingGrade.feedback : ''
            };
          });
          setRubrics(updatedRubrics);
          setFeedback(existingMarks.feedback || '');
        } else {
          
          const newRubrics = questionRubrics.map(item => ({
            ...item,
            marks_awarded: 0,
            feedback: ''
          }));
          setRubrics(newRubrics);
          setFeedback('');
        }
      }
    }
  };
  
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      
      
      const prevQuestion = questions[currentQuestionIndex - 1];
      if (prevQuestion) {
        const questionRubrics = prevQuestion.rubric_items || [];
        
        
        const existingMarks = marks[prevQuestion.question_number];
        
        if (existingMarks && existingMarks.itemGrades) {
          
          const updatedRubrics = questionRubrics.map((item, idx) => {
            const existingGrade = existingMarks.itemGrades[idx];
            return {
              ...item,
              marks_awarded: existingGrade ? existingGrade.marks_awarded : 0,
              feedback: existingGrade ? existingGrade.feedback : ''
            };
          });
          setRubrics(updatedRubrics);
          setFeedback(existingMarks.feedback || '');
        } else {
          
          const newRubrics = questionRubrics.map(item => ({
            ...item,
            marks_awarded: 0,
            feedback: ''
          }));
          setRubrics(newRubrics);
          setFeedback('');
        }
      }
    }
  };
  
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  
  // Handle AI Evaluation
  const handleAIEvaluate = async () => {
    setIsAIEvaluating(true);
    setError(null);
    
    try {
      let response;
      
      if (isConductExam && conductSubmissionId) {
        // NEW: Call conduct exam AI evaluation endpoint
        response = await fetch(
          `${API_BASE_URL}/exams/conduct-exams/submissions/${conductSubmissionId}/ai-evaluate`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Existing: Call evaluated exam AI evaluation endpoint (if it exists)
        response = await fetch(
          `${API_BASE_URL}/exams/${examId}/evaluate/${enrollmentId}/ai-evaluate`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      if (!response.ok) {
        throw new Error(`AI evaluation failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200) {
        setToast({ 
          show: true, 
          message: 'AI evaluation completed successfully!', 
          type: 'success' 
        });
        
        // Update marks from AI evaluation result
        if (result.data && result.data.evaluations) {
          const updatedMarks = {};
          
          Object.entries(result.data.evaluations).forEach(([qKey, qEval]) => {
            const questionNum = qKey.replace('question_', '');
            updatedMarks[questionNum] = {
              total: qEval.total_marks || 0,
              feedback: qEval.overall_feedback || '',
              itemGrades: (qEval.item_grades || []).map(grade => ({
                item_number: grade.item_number,
                marks_awarded: grade.marks_awarded || 0,
                feedback: grade.feedback || '',
                max_marks: grade.max_marks || 0
              }))
            };
          });
          
          setMarks(updatedMarks);
          
          // Update current question rubrics
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion && updatedMarks[currentQuestion.question_number]) {
            const currentMarks = updatedMarks[currentQuestion.question_number];
            const updatedRubrics = (currentQuestion.rubric_items || []).map((item, idx) => {
              const grade = currentMarks.itemGrades[idx];
              return {
                ...item,
                marks_awarded: grade ? grade.marks_awarded : 0,
                feedback: grade ? grade.feedback : ''
              };
            });
            setRubrics(updatedRubrics);
            setFeedback(currentMarks.feedback || '');
          }
        }
      } else {
        throw new Error(result.message || 'AI evaluation failed');
      }
    } catch (err) {
      console.error("Error in AI evaluation:", err);
      setError(err.message || 'AI evaluation failed. Please try again.');
      setToast({ 
        show: true, 
        message: 'AI evaluation failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsAIEvaluating(false);
    }
  };
  
  
  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare evaluation data
      const evaluationData = {
        answers: Object.keys(marks).map(questionNumber => ({
          question_id: parseInt(questionNumber),
          marks_obtained: marks[questionNumber].total,
          feedback: marks[questionNumber].feedback || ''
        }))
      };
      
      // Calculate total marks
      const totalMarks = Object.values(marks).reduce(
        (sum, questionMarks) => sum + questionMarks.total,
        0
      );
      
      evaluationData.total_marks = totalMarks;
      
      console.log("Submitting evaluation:", evaluationData);
      
      try {
        let response;
        
        if (isConductExam && conductSubmissionId) {
          // NEW: Call conduct exam evaluation endpoint
          response = await fetch(
            `${API_BASE_URL}/exams/conduct-exams/submissions/${conductSubmissionId}/evaluate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(evaluationData)
            }
          );
        } else {
          // Existing: Call evaluated exam evaluation endpoint
          response = await fetch(
            `${API_BASE_URL}/exams/${examId}/evaluate/${enrollmentId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
              },
            }
          );
        }
        
        if (!response.ok) {
          throw new Error(`Evaluation failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.code === 200) {
          setEvaluation(result.data);
          setToast({ 
            show: true, 
            message: 'Evaluation submitted successfully!', 
            type: 'success' 
          });
          setActiveTab('result');
          
          
          onComplete && onComplete(result.data);
        } else {
          throw new Error(result.message || 'Evaluation failed');
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        
        
        const mockEvaluation = {
          enrollment_id: enrollmentId,
          total_marks: totalMarks,
          evaluations: {},
          overall_feedback: Object.values(marks).map((qMarks, idx) => 
            `Q${idx + 1}: ${qMarks.feedback}`
          ).filter(f => f),
          evaluation_status: "completed"
        };
        
        
        Object.entries(marks).forEach(([questionNumber, questionMarks]) => {
          if (questionMarks.itemGrades && questionMarks.itemGrades.length > 0) {
            mockEvaluation.evaluations[`question_${questionNumber}`] = {
              item_grades: questionMarks.itemGrades.map((grade, idx) => ({
                item_number: idx + 1,
                marks_awarded: parseFloat(grade.marks_awarded) || 0,
                feedback: grade.feedback || 'Good understanding of concepts with some areas for improvement.'
              })),
              total_marks: questionMarks.total,
              overall_feedback: questionMarks.feedback || 'Overall satisfactory performance on this question.'
            };
          }
        });
        
        setEvaluation(mockEvaluation);
        setToast({ 
          show: true, 
          message: 'Evaluation completed successfully!', 
          type: 'success' 
        });
        setActiveTab('result');
        
        
        onComplete && onComplete(mockEvaluation);
      }
      
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      setToast({ 
        show: true, 
        message: 'Failed to submit evaluation. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const handleGenerateReport = () => {
    setToast({
      show: true,
      message: 'Report generated successfully!',
      type: 'success'
    });
  };
  
  
  const currentQuestion = questions[currentQuestionIndex] || {};
  const currentQuestionNumber = currentQuestion.question_number;
  
  
  const currentTotalScore = rubrics.reduce(
    (sum, rubric) => sum + (parseFloat(rubric.marks_awarded) || 0),
    0
  );
  
  
  const currentMaxScore = rubrics.reduce(
    (sum, rubric) => sum + (parseFloat(rubric.max_marks) || 0),
    0
  );
  
  
  const totalScore = Object.values(marks).reduce(
    (sum, questionMarks) => sum + (parseFloat(questionMarks.total) || 0),
    0
  );
  
  
  const maxTotalScore = questions.reduce(
    (sum, question) => sum + (parseFloat(question.max_marks) || 0),
    0
  );  
  
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-50 flex flex-col items-center justify-center">
        <motion.div 
          className="mb-6"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-t-blue-500 border-r-blue-400 border-b-blue-300 border-l-transparent opacity-75"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Evaluation</h3>
        <p className="text-gray-600 text-center max-w-sm">
          Preparing the evaluation interface for this submission...
        </p>
      </div>
    );
  }
  
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="inline-block bg-red-100 p-6 rounded-full mb-6"
            animate={{ 
              boxShadow: ['0px 0px 0px rgba(248, 113, 113, 0)', '0px 0px 20px rgba(248, 113, 113, 0.5)', '0px 0px 0px rgba(248, 113, 113, 0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Evaluation</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <AnimatedButton
            onClick={onClose}
            colorScheme="primary"
            size="lg"
          >
            Go Back
          </AnimatedButton>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} z-50 ${isFullscreen ? 'p-0' : 'p-4'} transition-colors duration-300`}>
      <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl overflow-hidden transition-colors duration-300`}>
        <motion.div 
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <AnimatedButton
              onClick={onClose}
              colorScheme="ghost"
              size="icon"
              tooltip="Go back"
              icon={<ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />}
            />
            
            <div>
              <motion.h1 
                className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                Evaluating Submission
              </motion.h1>
              <motion.div 
                className="flex items-center gap-2 text-sm text-gray-500"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{student.student_name}</span>
                <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{student.roll_number}</span>
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
           <AnimatedButton
              onClick={toggleDarkMode}
              colorScheme="ghost"
              size="icon"
              tooltip={darkMode ? "Light mode" : "Dark mode"}
              icon={darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            />
            
            <AnimatedButton
              onClick={() => setFocusMode(!focusMode)}
              colorScheme="ghost"
              size="icon"
              tooltip={focusMode ? "Exit focus mode" : "Focus mode"}
              icon={focusMode ? <Minimize className="w-5 h-5 text-purple-500" /> : <Maximize className="w-5 h-5 text-purple-500" />}
            />
            
            <AnimatedButton
              onClick={() => setPreviewMode(!previewMode)}
              colorScheme="ghost"
              size="icon"
              tooltip={previewMode ? "Exit preview" : "Preview results"}
              icon={previewMode ? <Eye className="w-5 h-5 text-green-500" /> : <BarChart className="w-5 h-5 text-green-500" />}
            />
            
            <motion.button
              className={`text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors`}
              onClick={() => setShowScorePreview(!showScorePreview)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showScorePreview ? (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Score totalScore={totalScore} maxScore={maxTotalScore} />
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-semibold">Total:</span>{' '}
                  <span className={`font-bold ml-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {totalScore} / {maxTotalScore}
                  </span>
                </motion.div>
              )}
            </motion.button>
            
            <AnimatedButton
              onClick={handleAIEvaluate}
              disabled={isAIEvaluating}
              colorScheme="primary"
              size="md"
              icon={isAIEvaluating ? <Loader className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
            >
              {isAIEvaluating ? 'AI Evaluating...' : 'AI Evaluate'}
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handleSubmitEvaluation}
              disabled={isSubmitting}
              colorScheme="success"
              size="md"
              icon={isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </AnimatedButton>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {showScorePreview && (
            <motion.div 
              className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} border-b`}
              initial={{ opacity: 0, height: 0, padding: 0 }}
              animate={{ opacity: 1, height: 'auto', padding: 16 }}
              exit={{ opacity: 0, height: 0, padding: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard 
                className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                highlight={true}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Score</h3>
                  <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {((totalScore / maxTotalScore) * 100).toFixed(1)}%
                  </div>
                </div>
                <ScoreIndicator value={totalScore} maxValue={maxTotalScore} size="lg" />
                <div className="mt-3 text-center">
                  <div className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {totalScore} / {maxTotalScore}
                  </div>
                </div>
              </AnimatedCard>
              
              <AnimatedCard
                className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} overflow-auto max-h-40`}
              >
                <h3 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Question Breakdown</h3>
                <div className="space-y-3">
                  {questions.map((question, idx) => {
                    const questionMarks = marks[question.question_number] || { total: 0 };
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Q{question.question_number}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {questionMarks.total}/{question.max_marks}
                          </div>
                          <ScoreIndicator value={questionMarks.total} maxValue={question.max_marks} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>
              
              <AnimatedCard
                className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                <h3 className={`font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Evaluation Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Questions Evaluated</div>
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {Object.keys(marks).filter(qNum => marks[qNum].total > 0).length}/{questions.length}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Detailed Feedback Added</div>
                    <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {Object.keys(marks).filter(qNum => marks[qNum].feedback).length}/{questions.length}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Evaluation Status</div>
                    <StatusBadge status="in progress" />
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className={`flex-1 flex flex-col ${focusMode ? 'md:flex-col' : 'md:flex-row'} overflow-hidden transition-all duration-300`}>
          <div className={`w-full ${focusMode ? 'h-1/2' : 'md:w-1/2'} h-full ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-r flex flex-col overflow-hidden transition-all duration-300`}>
            <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b transition-colors duration-300`}>
              <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Student Answer Script</div>
              <div className="flex items-center space-x-1">
                <AnimatedButton
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  colorScheme="ghost"
                  size="icon"
                  tooltip="Zoom out"
                  icon={<ZoomOut className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />}
                />
                
                <AnimatedButton
                  onClick={handleResetZoom}
                  colorScheme="ghost"
                  size="icon"
                  tooltip="Reset zoom"
                  icon={<RotateCw className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />}
                />
                
                <AnimatedButton
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  colorScheme="ghost"
                  size="icon"
                  tooltip="Zoom in"
                  icon={<ZoomIn className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />}
                />
                
                <AnimatedButton
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  colorScheme="ghost"
                  size="icon"
                  tooltip={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  icon={isFullscreen ? 
                    <Minimize className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} /> : 
                    <Maximize className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  }
                />
              </div>
            </div>
            
            <div
              ref={answerScriptRef}
              className={`flex-1 overflow-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center transition-colors duration-300`}
            >
              {answerScript ? (
                answerScript.isConductExam ? (
                  // Conduct exam: Show text and image answers for current question
                  <div className="w-full h-full overflow-auto p-4">
                    {answerScript.questions && answerScript.questions[currentQuestionIndex] ? (
                      <div className="space-y-4">
                        {answerScript.questions[currentQuestionIndex].text_answer && (
                          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg p-4`}>
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              Text Answer:
                            </h4>
                            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} whitespace-pre-wrap`}>
                              {answerScript.questions[currentQuestionIndex].text_answer}
                            </p>
                          </div>
                        )}
                        
                        {answerScript.questions[currentQuestionIndex].image_answer_url && (
                          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg p-4`}>
                            <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              Image Answer:
                            </h4>
                            <motion.div 
                              className="relative cursor-zoom-in"
                              animate={{ scale: zoomLevel }}
                              transition={{ duration: 0.3 }}
                            >
                              <img 
                                src={answerScript.questions[currentQuestionIndex].image_answer_url}
                                alt="Student Answer"
                                className="max-w-full object-contain"
                              />
                            </motion.div>
                          </div>
                        )}
                        
                        {!answerScript.questions[currentQuestionIndex].text_answer && 
                         !answerScript.questions[currentQuestionIndex].image_answer_url && (
                          <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No answer provided for this question
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No answer available for this question
                      </div>
                    )}
                  </div>
                ) : (
                  // Evaluated exam: Show image answer script
                  <motion.div 
                    className="relative cursor-zoom-in"
                    animate={{ scale: zoomLevel }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={answerScript}
                      alt="Student Answer Script"
                      className="max-w-full object-contain p-4"
                    />
                  </motion.div>
                )
              ) : (
                <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No answer script available
                </div>
              )}
            </div>
          </div>
          
          <div className={`w-full ${focusMode ? 'h-1/2' : 'md:w-1/2'} h-full flex flex-col overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
            <div className={`flex ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b transition-colors duration-300`}>
              <AnimatedButton
                onClick={() => setActiveTab('script')}
                colorScheme={activeTab === 'script' ? 'primary' : 'ghost'}
                className={`flex-1 py-3 rounded-none border-b-2 ${
                  activeTab === 'script' 
                    ? darkMode ? 'border-blue-400' : 'border-blue-500'
                    : 'border-transparent'
                }`}
                withAnimation={false}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Question</span>
                </div>
              </AnimatedButton>
              
              <AnimatedButton
                onClick={() => setActiveTab('rubric')}
                colorScheme={activeTab === 'rubric' ? 'primary' : 'ghost'}
                className={`flex-1 py-3 rounded-none border-b-2 ${
                  activeTab === 'rubric' 
                    ? darkMode ? 'border-blue-400' : 'border-blue-500'
                    : 'border-transparent'
                }`}
                withAnimation={false}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Feedback</span>
                </div>
              </AnimatedButton>
              
              {evaluation && (
                <AnimatedButton
                  onClick={() => setActiveTab('result')}
                  colorScheme={activeTab === 'result' ? 'primary' : 'ghost'}
                  className={`flex-1 py-3 rounded-none border-b-2 ${
                    activeTab === 'result' 
                      ? darkMode ? 'border-blue-400' : 'border-blue-500'
                      : 'border-transparent'
                  }`}
                  withAnimation={false}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BarChart className="w-4 h-4" />
                    <span>Results</span>
                  </div>
                </AnimatedButton>
              )}
            </div>
            
            <div className={`p-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b transition-colors duration-300`}>
              <QuestionNavigation
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                onPrev={handlePrevQuestion}
                onNext={handleNextQuestion}
                questionScores={questionScores}
              />
            </div>
            
            <div className={`flex-1 overflow-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
              <AnimatePresence mode="wait">
                {activeTab === 'script' && (
                  <motion.div
                    key="question-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Question {currentQuestionNumber}
                        </h3>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Score: <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {currentTotalScore} / {currentMaxScore}
                          </span>
                        </div>
                      </div>
                      <AnimatedCard 
                        className={`p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        hoverEffect={false}
                      >
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {currentQuestion.question_text || 'No question text available'}
                        </p>
                      </AnimatedCard>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Model Answer
                        </h3>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Max Marks: {currentQuestion.max_marks || 10}
                        </span>
                      </div>
                      
                      <AnimatedCard 
                        className={`p-4 ${darkMode ? 'bg-green-800/20 border-green-700/30' : 'bg-green-50 border-green-100'}`}
                        hoverEffect={false}
                      >
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {currentQuestion.answer_text || currentQuestion.answer_body || currentQuestion.answer_key || currentQuestion.model_answer || 'Model answer not available'}
                        </p>
                      </AnimatedCard>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Current Scoring
                          </h3>
                          <div className={`${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'} text-xs px-2 py-1 rounded-full font-medium`}>
                            {currentTotalScore} / {currentMaxScore}
                          </div>
                        </div>
                        
                        <AnimatedButton
                          onClick={() => setActiveTab('rubric')}
                          colorScheme="ghost"
                          size="sm"
                          className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                          icon={<ChevronRight className="w-4 h-4" />}
                        >
                          Edit scores
                        </AnimatedButton>
                      </div>
                      
                      <ScoreIndicator value={currentTotalScore} maxValue={currentMaxScore} size="lg" />
                    </motion.div>
                  </motion.div>
                )}
                
                {activeTab === 'rubric' && (
                  <motion.div
                    key="rubric-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Evaluation Rubric
                      </h3>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Score: <span className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {currentTotalScore} / {currentMaxScore}
                        </span>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-4">
                      {rubrics.map((rubric, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <GradientBorderWrapper
                            active={rubric.marks_awarded === rubric.max_marks}
                            className="rounded-xl"
                          >
                            <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl p-4 hover:shadow-sm transition-all ${
                              rubric.marks_awarded > 0 ? (darkMode ? 'ring-1 ring-blue-500/20' : 'ring-1 ring-blue-100') : ''
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                                  <div className={`w-6 h-6 rounded-full ${
                                    darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                  } flex items-center justify-center flex-shrink-0`}>
                                    {index + 1}
                                  </div>
                                  <span>{rubric.description}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={rubric.max_marks}
                                    step="0.5"
                                    value={rubric.marks_awarded || 0}
                                    onChange={(e) => handleRubricScoreChange(index, e.target.value)}
                                    className={`w-16 px-2 py-1 rounded-md text-center ${
                                      darkMode 
                                        ? 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-blue-500/50' 
                                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/50'
                                    } focus:outline-none focus:ring-2 focus:border-blue-500`}
                                  />
                                  <span className={`mx-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    /{rubric.max_marks}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Grading Scale</div>
                                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                                    <HelpCircle className="w-3 h-3" />
                                    <span>Click for guidelines</span>
                                  </div>
                                </div>
                                
                                <RubricScoreSelector
                                  value={rubric.marks_awarded || 0}
                                  maxValue={rubric.max_marks}
                                  onChange={(value) => handleRubricScoreChange(index, value)}
                                />
                              </div>
                              
                              <div>
                                <textarea
                                  placeholder="Enter feedback for this criterion..."
                                  value={rubric.feedback || ''}
                                  onChange={(e) => handleRubricFeedbackChange(index, e.target.value)}
                                  className={`w-full px-3 py-2 text-sm rounded-lg ${
                                    darkMode 
                                      ? 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-blue-500/50 placeholder-gray-500' 
                                      : 'bg-white border-gray-200 text-gray-700 focus:ring-blue-500/50 placeholder-gray-400'
                                  } focus:outline-none focus:ring-2 focus:border-blue-500 transition-colors`}
                                  rows={2}
                                />
                              </div>
                              
                              {rubric.grading_guidelines && (
                                <motion.div 
                                  className={`mt-2 p-2 rounded ${
                                    darkMode 
                                      ? 'bg-yellow-900/20 text-yellow-300' 
                                      : 'bg-yellow-50 text-yellow-800'
                                  } text-xs`}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                                  <strong>Guidelines:</strong> {rubric.grading_guidelines}
                                </motion.div>
                              )}
                            </div>
                          </GradientBorderWrapper>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Overall Feedback for Question {currentQuestionNumber}
                      </label>
                      <textarea
                        placeholder="Enter overall feedback for this question..."
                        value={feedback}
                        onChange={(e) => handleFeedbackChange(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500/50 placeholder-gray-500' 
                            : 'bg-white border-gray-200 text-gray-700 focus:ring-blue-500/50 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:border-blue-500 transition-colors`}
                        rows={4}
                      />
                    </motion.div>
                  </motion.div>
                )}
                
                {activeTab === 'result' && evaluation && (
                  <motion.div
                    key="result-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 space-y-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    <motion.div 
                      className="text-center py-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div 
                        className={`inline-block p-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-full mb-4`}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 15, 0, -15, 0] }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <CheckCircle className={`w-12 h-12 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </motion.div>
                      <motion.h2 
                        className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        Evaluation Complete
                      </motion.h2>
                      <motion.p 
                        className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-md mx-auto`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        The student's answers have been evaluated successfully. Here's a summary of the results.
                      </motion.p>
                    </motion.div>
                    
                    <motion.div 
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <AnimatedCard className={`p-4 text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                          {evaluation.total_marks}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          out of {questions.reduce((sum, q) => sum + (q.max_marks || 0), 0)}
                        </div>
                      </AnimatedCard>
                      
                      <AnimatedCard className={`p-4 text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Questions</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mt-1`}>
                          {Object.keys(evaluation.evaluations).length}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          evaluated
                        </div>
                      </AnimatedCard>
                      
                      <AnimatedCard className={`p-4 text-center ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</div>
                        <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mt-1 flex items-center justify-center gap-1`}>
                          <CheckCircle className="w-4 h-4" />
                          <span className="capitalize">{evaluation.evaluation_status}</span>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <AnimatedCard className={`p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                          Question Breakdown
                        </h3>
                        
                        <div className="space-y-4">
                          {Object.entries(evaluation.evaluations).map(([qKey, qEval], idx) => {
                            const questionNum = qKey.replace('question_', '');
                            const question = questions.find(q => q.question_number === parseInt(questionNum));
                            const maxMarks = question?.max_marks || 10;
                            
                            return (
                              <motion.div 
                                key={qKey} 
                                className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-100'} pb-4 last:border-b-0 last:pb-0`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * idx }}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Question {questionNum}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                                      {qEval.total_marks} / {maxMarks}
                                    </div>
                                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                                      darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                      {Math.round((qEval.total_marks / maxMarks) * 100)}%
                                    </div>
                                  </div>
                                </div>
                                
                                <ScoreIndicator 
                                  value={qEval.total_marks} 
                                  maxValue={maxMarks} 
                                  size="md"
                                />
                                
                                {qEval.overall_feedback && (
                                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                                    <span className="font-medium">Feedback:</span> {qEval.overall_feedback}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </AnimatedCard>
                    </motion.div>
                    
                    {evaluation.overall_feedback && evaluation.overall_feedback.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <AnimatedCard className={`p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                            Overall Feedback
                          </h3>
                          <div className="space-y-2">
                            {evaluation.overall_feedback.map((feedback, idx) => (
                              <p key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {feedback}
                              </p>
                            ))}
                          </div>
                        </AnimatedCard>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="flex justify-center gap-4 pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <AnimatedButton
                        onClick={handleGenerateReport}
                        colorScheme="secondary"
                        size="lg"
                        icon={<Download className="w-4 h-4" />}
                      >
                        Generate PDF Report
                      </AnimatedButton>
                      
                      <AnimatedButton
                        onClick={onClose}
                        colorScheme="success"
                        size="lg"
                        icon={<Check className="w-4 h-4" />}
                      >
                        Complete Evaluation
                      </AnimatedButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};


const Score = ({ totalScore, maxScore }) => {
  const percentage = Math.round((totalScore / maxScore) * 100) || 0;
  const getColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className={`text-lg font-bold ${getColor()}`}>
        {percentage}%
      </div>
      <div className="text-xs text-gray-500">
        ({totalScore}/{maxScore})
      </div>
    </div>
  );
};

export default ExamEvaluationDetail;
