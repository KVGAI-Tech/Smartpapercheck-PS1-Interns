import React, { useState, useEffect } from 'react';
import { X, History, TrendingUp, TrendingDown, Calendar, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../../BaseURL';

const EvaluationHistoryModal = ({ isOpen, onClose, examId, enrollmentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (isOpen && examId && enrollmentId) {
      fetchHistory();
    }
  }, [isOpen, examId, enrollmentId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/exams/${examId}/enrollments/${enrollmentId}/evaluation-history`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200) {
        setHistoryData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch evaluation history');
      }
    } catch (error) {
      console.error('Error fetching evaluation history:', error);
      setError(error.message || 'Failed to load evaluation history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMarkChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMarkChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Evaluation History</h2>
              <p className="text-sm text-gray-500">Track mark changes across rubric updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading evaluation history...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to Load History</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : historyData ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {historyData.student_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Total Evaluations: {historyData.evaluation_count}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Previous Total</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {historyData.previous_total_marks || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Current Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {historyData.current_total_marks || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Change</p>
                    <div className={`flex items-center gap-2 text-2xl font-bold ${getMarkChangeColor(historyData.total_mark_change)}`}>
                      {getMarkChangeIcon(historyData.total_mark_change)}
                      <span>
                        {historyData.total_mark_change >= 0 ? '+' : ''}
                        {historyData.total_mark_change || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Question-wise History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Question-wise Evaluation History
                </h3>

                {Object.entries(historyData.history_by_question || {}).map(([key, question]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Question Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Question {question.question_number}
                        </h4>
                        <div className={`flex items-center gap-2 font-semibold ${getMarkChangeColor(question.mark_change)}`}>
                          {getMarkChangeIcon(question.mark_change)}
                          <span>
                            {question.mark_change >= 0 ? '+' : ''}
                            {question.mark_change} marks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Current Evaluation */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                            Current Evaluation
                          </h5>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {question.current_marks} marks
                          </span>
                        </div>
                        
                        {question.current_evaluation && (
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <p className="text-sm text-gray-700 mb-3">
                              {question.current_evaluation.overall_feedback || 'No feedback available'}
                            </p>
                            
                            {question.current_evaluation.item_grades && question.current_evaluation.item_grades.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-600 uppercase">Rubric Items:</p>
                                {question.current_evaluation.item_grades.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-start text-sm bg-white rounded p-2">
                                    <span className="text-gray-700 flex-1">{item.feedback || `Item ${item.item_number}`}</span>
                                    <span className="font-medium text-purple-600 ml-2">{item.marks_awarded} marks</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Previous Evaluations */}
                      {question.evaluation_history && question.evaluation_history.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            Previous Evaluations ({question.evaluation_history.length})
                          </h5>
                          
                          <div className="space-y-3">
                            {question.evaluation_history.map((evaluation, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(evaluation.evaluated_at)}</span>
                                  </div>
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium">
                                    {evaluation.total_marks} marks
                                  </span>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                  {evaluation.overall_feedback || 'No feedback available'}
                                </p>
                                
                                {evaluation.item_grades && evaluation.item_grades.length > 0 && (
                                  <div className="space-y-1">
                                    {evaluation.item_grades.map((item, itemIdx) => (
                                      <div key={itemIdx} className="flex justify-between items-start text-xs bg-white rounded p-2">
                                        <span className="text-gray-600 flex-1">{item.feedback || `Item ${item.item_number}`}</span>
                                        <span className="font-medium text-gray-700 ml-2">{item.marks_awarded}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No evaluation history available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EvaluationHistoryModal;
