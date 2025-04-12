import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { 
  Search, Users, CheckCircle, XCircle, Eye, ArrowLeft, Loader, 
  Clock, AlertTriangle, Filter, ArrowUp, ArrowDown, PlayCircle,
  BarChart, RefreshCw, List, BarChart2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';


const StudentEvaluationLoader = lazy(() => import('./StudentEvaluationLoader'));


const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const pulse = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.03, 1],
    transition: { duration: 2, repeat: Infinity }
  }
};

const shimmer = {
  initial: { backgroundPosition: "-500px 0" },
  animate: { 
    backgroundPosition: ["500px 0", "-500px 0"],
    transition: { 
      repeat: Infinity, 
      duration: 1.5, 
      ease: "linear"
    }
  }
};


const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      bgColor: 'bg-amber-100', 
      textColor: 'text-amber-800', 
      borderColor: 'border-amber-200',
      gradientFrom: 'from-amber-50',
      gradientTo: 'to-amber-100',
      icon: <Clock className="w-3 h-3 mr-1.5" />
    },
    completed: { 
      bgColor: 'bg-emerald-100', 
      textColor: 'text-emerald-800', 
      borderColor: 'border-emerald-200',
      gradientFrom: 'from-emerald-50',
      gradientTo: 'to-emerald-100',
      icon: <CheckCircle className="w-3 h-3 mr-1.5" />
    },
    inProgress: { 
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-800', 
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-blue-100',
      icon: <Loader className="w-3 h-3 mr-1.5 animate-spin" />
    },
    failed: { 
      bgColor: 'bg-rose-100', 
      textColor: 'text-rose-800', 
      borderColor: 'border-rose-200',
      gradientFrom: 'from-rose-50',
      gradientTo: 'to-rose-100',
      icon: <XCircle className="w-3 h-3 mr-1.5" />
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center border shadow-sm
      bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} ${config.textColor} ${config.borderColor}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};


const Toast = ({ show, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getToastStyles = () => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-rose-500 to-red-500',
          icon: <XCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: <Loader className="w-5 h-5" />
        };
    }
  };

  const { bg, icon } = getToastStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 0, x: 100 }}
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 
        ${bg} text-white max-w-md backdrop-blur-sm border border-white/10`}
    >
      <div className="bg-white/20 p-2 rounded-full">
        {icon}
      </div>
      <span className="font-medium">{message}</span>
    </motion.div>
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


const ProgressBar = ({ value, max, color = 'blue' }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  
  const colorStyles = {
    blue: "bg-gradient-to-r from-blue-500 to-indigo-500",
    green: "bg-gradient-to-r from-emerald-500 to-green-500",
    amber: "bg-gradient-to-r from-amber-400 to-yellow-500",
    red: "bg-gradient-to-r from-rose-500 to-red-500",
    purple: "bg-gradient-to-r from-purple-500 to-indigo-500"
  };
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${colorStyles[color]}`}
      />
    </div>
  );
};


const ExamEvaluation = ({ examId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'student_name', direction: 'asc' });
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [batchEvaluating, setBatchEvaluating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailEnrollmentId, setDetailEnrollmentId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); 
  const [pageLoaded, setPageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [evaluationError, setEvaluationError] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!examId) {
        throw new Error('Exam ID is missing');
      }
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 
      
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data && data.code === 200 && Array.isArray(data.data)) {
        
        const formattedStudents = data.data.map(student => ({
          
          enrollment_id: student.id,
          student_id: student.student_id,
          exam_id: student.exam_id,
          student_name: student.student_name,
          roll_number: student.roll_number,
          marks_obtained: student.marks_obtained,
          feedback: student.feedback,
          
          evaluation_status: student.marks_obtained !== null ? 'completed' : 'pending'
        }));
        setStudents(formattedStudents);
      } else {
        throw new Error(`Invalid response format from API: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      
      
      if (error.name === 'AbortError') {
        setError("Request timed out. Please check your network connection and try again.");
      } else if (error.message.includes('NetworkError') || !navigator.onLine) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(error.message || "Failed to load student enrollments. Please try again later.");
      }
      
      
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [examId, retryCount]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredStudents = useMemo(() => {
    let result = [...students];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(student => 
        (student.student_name?.toLowerCase().includes(query)) ||
        (student.roll_number?.toLowerCase().includes(query))
      );
    }
    
    if (statusFilter !== 'all') {
      const isEvaluated = statusFilter === 'completed';
      result = result.filter(student => 
        isEvaluated ? student.marks_obtained !== null : student.marks_obtained === null
      );
    }
    
    result.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [searchQuery, statusFilter, students, sortConfig]);

  const handleEvaluate = async (student) => {
    try {
      setEvaluatingStudent(student);
      setEvaluationError(prev => ({ ...prev, [student.enrollment_id]: null }));
      
      if (!examId) {
        throw new Error('Exam ID is missing');
      }
      
      showToast('Evaluating submission...', 'info');
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 
      
      
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${student.enrollment_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Evaluation failed Please try again.`);
      }

      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        
        if (typeof data.data.total_marks !== 'number') {
          throw new Error('Invalid evaluation data: missing or invalid total marks');
        }
        
        const updatedStudents = students.map(s => 
          s.enrollment_id === student.enrollment_id 
            ? { 
                ...s, 
                marks_obtained: data.data.total_marks || 0, 
                feedback: Array.isArray(data.data.overall_feedback) 
                  ? data.data.overall_feedback.join('\n') 
                  : (data.data.overall_feedback || ''),
                evaluation_status: 'completed'
              } 
            : s
        );
        
        setStudents(updatedStudents);
        
        
        setDetailEnrollmentId(student.enrollment_id);
        setShowDetailView(true);
        
        showToast('Evaluation completed successfully', 'success');
      } else {
        throw new Error(data.message || 'Evaluation process did not complete successfully');
      }
    } catch (error) {
      console.error("Evaluation error:", error);
      
      
      setEvaluationError(prev => ({ 
        ...prev, 
        [student.enrollment_id]: error.message || 'Failed to evaluate submission'
      }));
      
      
      if (error.name === 'AbortError') {
        showToast('Evaluation timed out. The process might be taking longer than expected.', 'error');
      } else if (error.message.includes('NetworkError') || !navigator.onLine) {
        showToast('Network error during evaluation. Please check your connection.', 'error');
      } else {
        showToast(error.message || 'Failed to evaluate submission', 'error');
      }
    } finally {
      setEvaluatingStudent(null);
    }
  };

  const handleEvaluateAll = async () => {
    try {
      const pendingStudents = students.filter(s => s.marks_obtained === null);
      
      if (pendingStudents.length === 0) {
        showToast('No pending submissions to evaluate', 'info');
        return;
      }
      
      setBatchEvaluating(true);
      showToast(`Evaluating ${pendingStudents.length} submissions...`, 'info');
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < pendingStudents.length; i++) {
        const student = pendingStudents[i];
        
        try {
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          
          const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${student.enrollment_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`API error (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          
          if (data.code === 200 && data.data) {
            
            if (typeof data.data.total_marks !== 'number') {
              throw new Error('Invalid evaluation data');
            }
            
            setStudents(prev => prev.map(s => 
              s.enrollment_id === student.enrollment_id 
                ? { 
                    ...s, 
                    marks_obtained: data.data.total_marks || 0, 
                    feedback: Array.isArray(data.data.overall_feedback) 
                      ? data.data.overall_feedback.join('\n') 
                      : (data.data.overall_feedback || ''),
                    evaluation_status: 'completed'
                  } 
                : s
            ));
            
            successCount++;
          } else {
            throw new Error(data.message || 'Evaluation process failed');
          }
          
          
          if (i < pendingStudents.length - 1) {
            showToast(`Evaluated ${i + 1} of ${pendingStudents.length} submissions (${successCount} successful)`, 'info');
          }
          
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (err) {
          console.error(`Error evaluating student ${student.enrollment_id}:`, err);
          failCount++;
          
          
          setEvaluationError(prev => ({ 
            ...prev, 
            [student.enrollment_id]: err.message || 'Failed to evaluate'
          }));
        }
      }
      
      
      if (successCount === pendingStudents.length) {
        showToast('All evaluations completed successfully', 'success');
      } else if (successCount > 0) {
        showToast(`Completed ${successCount} of ${pendingStudents.length} evaluations. ${failCount} failed.`, 
          failCount > successCount ? 'warning' : 'success');
      } else {
        showToast('Failed to complete any evaluations. Please try again later.', 'error');
      }
    } catch (error) {
      console.error("Batch evaluation error:", error);
      showToast('Error during batch evaluation: ' + error.message, 'error');
    } finally {
      setBatchEvaluating(false);
    }
  };

  const hasEvaluationResults = (student) => {
    return student.marks_obtained !== null;
  };

  const handleViewResults = (student) => {
    if (!hasEvaluationResults(student)) {
      showToast('No evaluation results available', 'warning');
      return;
    }
    
    
    setDetailEnrollmentId(student.enrollment_id);
    setShowDetailView(true);
  };

  const stats = useMemo(() => {
    return {
      total: students.length,
      evaluated: students.filter(s => s.marks_obtained !== null).length,
      pending: students.filter(s => s.marks_obtained === null).length,
      averageScore: students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + (s.marks_obtained || 0), 0) / 
            Math.max(1, students.filter(s => s.marks_obtained !== null).length)) 
        : 0
    };
  }, [students]);

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  }, []);

  const LoadingView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative">
        <motion.div 
          className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 border-r-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute inset-0 border-4 border-transparent border-t-blue-300 rounded-full"
          animate={{ rotate: -180 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
      <motion.p 
        className="mt-6 text-gray-600 font-medium"
        animate={{ 
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        Loading student submissions...
      </motion.p>
    </motion.div>
  );

  const ErrorState = ({ message, onRetry }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-8 text-center"
    >
      <motion.div 
        className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        whileHover={{ scale: 1.1 }}
      >
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">Unable to Load Data</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        {message || "There was an error loading the student enrollments. Please try again."}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
      >
        <RefreshCw className="w-5 h-5" />
        Retry
      </motion.button>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-xl shadow-sm"
    >
      <motion.div 
        className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
        whileHover={{ scale: 1.1 }}
      >
        <Users className="w-10 h-10 text-blue-400" />
      </motion.div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">No Students Enrolled</h3>
      <p className="text-gray-500 max-w-md mx-auto px-6">
        There are no students enrolled for this exam yet. Once students are enrolled, they will appear here.
      </p>
    </motion.div>
  );

  const StudentGridItem = ({ student, index }) => {
    const hasResults = hasEvaluationResults(student);
    const status = hasResults ? 'completed' : 'pending';
    const delay = 0.05 * (index % 8); 
    const hasError = evaluationError[student.enrollment_id];
    
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
        whileHover={{ y: -5, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col"
      >
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-lg shadow-md">
              {student.student_name?.charAt(0) || '?'}
            </div>
            <StatusBadge status={status} />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-1">{student.student_name}</h3>
          <p className="text-sm text-gray-500 mb-3">{student.roll_number}</p>
          
          {hasResults ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Score</span>
                <span className="font-medium text-gray-900">{student.marks_obtained}</span>
              </div>
              <ProgressBar 
                value={student.marks_obtained} 
                max={100} 
                color={student.marks_obtained > 80 ? "green" : student.marks_obtained > 60 ? "blue" : "amber"} 
              />
            </div>
          ) : (
            <div className="h-7 mb-4">
              {hasError && (
                <p className="text-xs text-rose-600 italic">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {hasError.length > 50 ? hasError.substring(0, 50) + '...' : hasError}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          {hasResults ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleViewResults(student)}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">View Results</span>
            </motion.button>
          ) : (
            <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleEvaluate(student)}
            disabled={evaluatingStudent?.enrollment_id === student.enrollment_id}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all 
              ${evaluatingStudent?.enrollment_id === student.enrollment_id
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : hasError 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md'
              }`}
          >
            {evaluatingStudent?.enrollment_id === student.enrollment_id ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="font-medium">Evaluating...</span>
              </>
            ) : hasError ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Retry</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span className="font-medium">Evaluate</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

const NavButton = ({ icon: Icon, label, onClick, disabled, variant = "primary" }) => {
  const getStyles = () => {
    switch(variant) {
      case "primary":
        return {
          base: `${disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'}`,
          hover: !disabled && 'hover:scale-105',
          tap: !disabled && 'active:scale-95'
        };
      case "secondary":
        return {
          base: `${disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300'}`,
          hover: !disabled && 'hover:scale-105',
          tap: !disabled && 'active:scale-95'
        };
      case "success":
        return {
          base: `${disabled 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'}`,
          hover: !disabled && 'hover:scale-105',
          tap: !disabled && 'active:scale-95'
        };
      default:
        return {
          base: 'bg-gray-100 text-gray-700',
          hover: !disabled && 'hover:bg-gray-200',
          tap: !disabled && 'active:bg-gray-300'
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <motion.button
      whileHover={styles.hover ? { scale: 1.05 } : {}}
      whileTap={styles.tap ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${styles.base}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

const StatCard = ({ icon: Icon, label, value, color, percentage }) => {
  const gradients = {
    blue: "from-blue-50 to-indigo-50 border-blue-100",
    green: "from-emerald-50 to-green-50 border-emerald-100",
    yellow: "from-amber-50 to-yellow-50 border-amber-100",
    purple: "from-purple-50 to-indigo-50 border-purple-100"
  };

  const iconColors = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-500",
    green: "bg-gradient-to-br from-emerald-500 to-green-500",
    yellow: "bg-gradient-to-br from-amber-500 to-yellow-500",
    purple: "bg-gradient-to-br from-purple-500 to-indigo-500"
  };

  return (
    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className={`bg-gradient-to-br ${gradients[color]} rounded-xl p-6 flex items-center justify-between shadow-sm border`}
    >
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">
            <AnimatedCounter value={value} />
          </p>
          {percentage && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 text-gray-700">
              {percentage}
            </span>
          )}
        </div>
      </div>
      <div className={`w-12 h-12 ${iconColors[color]} text-white rounded-full flex items-center justify-center shadow-md`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

return (
  
  <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    {showDetailView ? (
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen">
          <motion.div 
            className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="mt-6 text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading evaluation details...
          </motion.p>
        </div>
      }>
        <StudentEvaluationLoader
          examId={examId}
          enrollmentId={detailEnrollmentId}
          onClose={() => {
            setShowDetailView(false);
            setDetailEnrollmentId(null);
          }}
          onSaveFeedback={(data) => {
            if (!data) {
              showToast('No feedback data received', 'error');
              return;
            }
            
            try {
              setStudents(prev => prev.map(s => 
                s.enrollment_id === detailEnrollmentId
                  ? {
                      ...s,
                      feedback: typeof data.overall_feedback === 'string' 
                        ? data.overall_feedback 
                        : Array.isArray(data.overall_feedback) 
                          ? data.overall_feedback.join('\n')
                          : s.feedback || ''
                    }
                  : s
              ));
              
              showToast('Feedback saved successfully', 'success');
            } catch (error) {
              console.error('Error saving feedback:', error);
              showToast('Failed to save feedback: ' + error.message, 'error');
            }
          }}
          onError={(errorMessage) => {
            showToast(errorMessage || 'Failed to load evaluation details', 'error');
            setShowDetailView(false);
            setDetailEnrollmentId(null);
          }}
        />
      </Suspense>
    ) : (
      
      <div className="flex flex-col h-full p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: pageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto w-full flex flex-col h-full"
        >
          <div className="flex flex-col gap-2">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-white/50 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span>Exam Evaluations</span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  <Star className="w-3 h-3 mr-1" />
                  <span>AI Powered</span>
                </motion.span>
              </h1>
              <p className="text-gray-500 mt-1">Review and evaluate student submissions with intelligent scoring</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
            <StatCard 
              icon={Users} 
              label="Total Students" 
              value={stats.total} 
              color="blue" 
            />
            <StatCard 
              icon={CheckCircle} 
              label="Evaluated" 
              value={stats.evaluated} 
              color="green" 
              percentage={stats.total ? `${Math.round((stats.evaluated / stats.total) * 100)}%` : "0%"}
            />
            <StatCard 
              icon={Clock} 
              label="Pending" 
              value={stats.pending} 
              color="yellow" 
            />
            <StatCard 
              icon={BarChart} 
              label="Average Score" 
              value={stats.averageScore} 
              color="purple" 
            />
          </div>

          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-4 md:p-6 mt-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Evaluated</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <BarChart2 className="w-5 h-5" />
                  </button>
                </div>
                
                <NavButton
                  icon={PlayCircle}
                  label={batchEvaluating ? 'Evaluating...' : 'Evaluate All'}
                  onClick={handleEvaluateAll}
                  disabled={batchEvaluating || stats.pending === 0}
                  variant="success"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex-1 overflow-auto mt-6 pb-6">
            {loading ? (
              <LoadingView />
            ) : error ? (
              <ErrorState 
                message={error}
                onRetry={handleRetry}
              />
            ) : students.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {viewMode === 'list' ? (
                  <motion.div 
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            {[
                              { key: 'student_name', label: 'Student' },
                              { key: 'roll_number', label: 'Roll Number' },
                              { key: 'marks_obtained', label: 'Score' },
                              { key: 'evaluation_status', label: 'Status' },
                              { key: 'actions', label: 'Actions' }
                            ].map((column) => (
                              <th 
                                key={column.key}
                                onClick={() => column.key !== 'actions' && handleSort(column.key)}
                                className={`px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none
                                  ${column.key === sortConfig.key ? 'text-blue-600' : 'text-gray-500'}`}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>{column.label}</span>
                                  {renderSortIndicator(column.key)}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <AnimatePresence>
                            {filteredStudents.map((student, index) => {
                              const hasResults = hasEvaluationResults(student);
                              const status = hasResults ? 'completed' : 'pending';
                              const hasError = evaluationError[student.enrollment_id];
                              
                              return (
                                <motion.tr 
                                  key={student.enrollment_id || index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ delay: 0.1 + (index * 0.03) }}
                                  className="hover:bg-gray-50 group"
                                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium shadow-sm group-hover:shadow-md transition-shadow mr-3">
                                        {student.student_name?.charAt(0) || '?'}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                          {student.student_name}
                                        </div>
                                        {student.email && (
                                          <div className="text-xs text-gray-500">{student.email}</div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                                      {student.roll_number}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {hasResults ? (
                                      <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3 overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(student.marks_obtained / 100) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
                                            className={`h-2 rounded-full ${
                                              student.marks_obtained >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                              student.marks_obtained >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                              'bg-gradient-to-r from-amber-500 to-yellow-500'
                                            }`}
                                          />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{student.marks_obtained}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500 italic">
                                        {hasError ? (
                                          <span className="text-rose-600 flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Error
                                          </span>
                                        ) : (
                                          "Not evaluated"
                                        )}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {hasResults ? (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleViewResults(student)}
                                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md"
                                      >
                                        <Eye className="w-4 h-4 mr-1.5" />
                                        View Results
                                      </motion.button>
                                    ) : (
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleEvaluate(student)}
                                        disabled={evaluatingStudent?.enrollment_id === student.enrollment_id}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-colors shadow-sm hover:shadow-md
                                          ${evaluatingStudent?.enrollment_id === student.enrollment_id
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : hasError
                                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                          }`}
                                      >
                                        {evaluatingStudent?.enrollment_id === student.enrollment_id ? (
                                          <>
                                            <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                                            Evaluating...
                                          </>
                                        ) : hasError ? (
                                          <>
                                            <RefreshCw className="w-4 h-4 mr-1.5" />
                                            Retry
                                          </>
                                        ) : (
                                          <>
                                            <PlayCircle className="w-4 h-4 mr-1.5" />
                                            Evaluate
                                          </>
                                        )}
                                      </motion.button>
                                    )}
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </AnimatePresence>
                          {filteredStudents.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                  <Search className="w-10 h-10 text-gray-300 mb-3" />
                                  <p>No students match your search criteria</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredStudents.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm"
                      >
                        <div className="flex flex-col items-center">
                          <Search className="w-12 h-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            No students match your search criteria. Try adjusting your filters.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <StudentGridItem 
                          key={student.enrollment_id || index}
                          student={student}
                          index={index}
                        />
                      ))
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    )}
    
    <Toast
      show={toast.show}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  </div>
);
};

export default ExamEvaluation;