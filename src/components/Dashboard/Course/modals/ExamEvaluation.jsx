import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { 
  Search, Users, CheckCircle, XCircle, Eye, ArrowLeft, Loader, 
  Clock, AlertTriangle, Filter, ArrowUp, ArrowDown, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';


const StudentEvaluationLoader = lazy(() => import('./StudentEvaluationLoader'));


const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-800', 
      borderColor: 'border-yellow-200',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    completed: { 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-800', 
      borderColor: 'border-green-200',
      icon: <CheckCircle className="w-3 h-3 mr-1" />
    },
    inProgress: { 
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-800', 
      borderColor: 'border-blue-200',
      icon: <Loader className="w-3 h-3 mr-1 animate-spin" />
    },
    failed: { 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-800', 
      borderColor: 'border-red-200',
      icon: <XCircle className="w-3 h-3 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'warning' ? 'bg-yellow-500 text-white' : 
        'bg-blue-500 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : type === 'error' ? (
        <XCircle className="w-5 h-5" />
      ) : type === 'warning' ? (
        <AlertTriangle className="w-5 h-5" />
      ) : (
        <Loader className="w-5 h-5" />
      )}
      <span>{message}</span>
    </motion.div>
  );
};


const ExamEvaluation = ({ examId, courseId, onClose, onEvaluateSubmission }) => {
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
      
      
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.code === 200 && Array.isArray(data.data)) {
        setStudents(data.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setError(error.message || "Failed to load student enrollments");
    } finally {
      setLoading(false);
    }
  }, [examId]);

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
      
      if (!examId) {
        throw new Error('Exam ID is missing');
      }
      
      showToast('Evaluating submission...', 'info');
      
      
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${student.enrollment_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200) {
        
        const updatedStudents = students.map(s => 
          s.enrollment_id === student.enrollment_id 
            ? { 
                ...s, 
                marks_obtained: data.data.total_marks || 0, 
                feedback: data.data.overall_feedback?.join('\n') || '',
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
      showToast(error.message || 'Failed to evaluate submission', 'error');
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
      
      
      for (let i = 0; i < pendingStudents.length; i++) {
        const student = pendingStudents[i];
        
        try {
          
          const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${student.enrollment_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
          });
          
          if (!response.ok) {
            console.warn(`Failed to evaluate student ${student.enrollment_id}: ${response.status}`);
            continue; 
          }
          
          const data = await response.json();
          
          if (data.code === 200) {
            
            setStudents(prev => prev.map(s => 
              s.enrollment_id === student.enrollment_id 
                ? { 
                    ...s, 
                    marks_obtained: data.data.total_marks || 0, 
                    feedback: data.data.overall_feedback?.join('\n') || '',
                    evaluation_status: 'completed'
                  } 
                : s
            ));
          }
          
          
          showToast(`Evaluated ${i + 1} of ${pendingStudents.length} submissions`, 'info');
          
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (err) {
          console.error(`Error evaluating student ${student.enrollment_id}:`, err);
          
        }
      }
      
      showToast('Batch evaluation completed', 'success');
    } catch (error) {
      console.error("Batch evaluation error:", error);
      showToast('Error during batch evaluation', 'error');
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

  
  const handleDetailViewComplete = useCallback((evaluationData) => {
    
    if (evaluationData && detailEnrollmentId) {
      setStudents(prev => prev.map(s => 
        s.enrollment_id === detailEnrollmentId
          ? {
              ...s,
              marks_obtained: evaluationData.total_marks || s.marks_obtained || 0,
              feedback: evaluationData.overall_feedback?.join('\n') || s.feedback || '',
              evaluation_status: 'completed'
            }
          : s
      ));
    }
    
    
    setShowDetailView(false);
    setDetailEnrollmentId(null);
  }, [detailEnrollmentId]);

  
  const LoadingView = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full absolute top-0 animate-ping opacity-30"></div>
      </div>
      <p className="mt-4 text-gray-600 animate-pulse">Loading enrollments...</p>
    </div>
  );

  
  const ErrorState = ({ message, onRetry }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-8 text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        {message || "There was an error loading the student enrollments. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <Loader className="w-4 h-4" />
        Retry
      </button>
    </motion.div>
  );

  
  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 bg-white rounded-xl shadow-sm"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        There are no students enrolled for this exam yet. Once students are enrolled, they will appear here.
      </p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showDetailView ? (
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Loading evaluation details...</p>
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
              
              console.log('Feedback updated:', data);
              
              
              setStudents(prev => prev.map(s => 
                s.enrollment_id === detailEnrollmentId
                  ? {
                      ...s,
                      feedback: data.overall_feedback
                    }
                  : s
              ));
              
              showToast('Feedback saved successfully', 'success');
            }}
          />
        </Suspense>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Exam Evaluations</h1>
            <p className="text-gray-500">Manage and review student submissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-blue-50 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-sm text-blue-700">Total Students</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-green-50 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-sm text-green-700">Evaluated</p>
                <p className="text-xl font-semibold text-gray-900">{stats.evaluated}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-yellow-50 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-purple-50 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-sm text-purple-700">Average Score</p>
                <p className="text-xl font-semibold text-gray-900">{stats.averageScore}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <Eye className="w-5 h-5" />
              </div>
            </motion.div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Evaluated</option>
                  </select>
                  <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEvaluateAll}
                  disabled={batchEvaluating || stats.pending === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg
                    ${batchEvaluating || stats.pending === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'} 
                    transition-all duration-300`}
                >
                  {batchEvaluating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4" />
                  )}
                  <span>{batchEvaluating ? 'Evaluating...' : 'Evaluate All'}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingView />
          ) : error ? (
            <ErrorState 
              message={error}
              onRetry={fetchEnrollments}
            />
          ) : students.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none
                            ${column.key === sortConfig.key ? 'text-blue-600' : ''}`}
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
                        
                        return (
                          <motion.tr 
                            key={student.enrollment_id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.1 + (index * 0.03) }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                                  {student.student_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                                  {student.email && (
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.roll_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {hasResults ? (
                                <div className="flex items-center">
                                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${(student.marks_obtained / 100) * 100}%` }} 
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{student.marks_obtained}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Not evaluated</span>
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
                                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Results
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEvaluate(student)}
                                  disabled={evaluatingStudent?.enrollment_id === student.enrollment_id}
                                  className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-colors
                                    ${evaluatingStudent?.enrollment_id === student.enrollment_id
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                  {evaluatingStudent?.enrollment_id === student.enrollment_id ? (
                                    <>
                                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                                      Evaluating...
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="w-4 h-4 mr-1" />
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
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No students match your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
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