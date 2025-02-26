import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Eye,
  Download,
  Loader,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '../../../../BaseURL';
const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EvaluationStatus = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const StudentAnswerCard = ({ student, onViewEvaluation }) => (
  <Card className="hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">{student.student_name.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{student.student_name}</h4>
            <p className="text-sm text-gray-500">{student.roll_number}</p>
          </div>
        </div>
        <StatusBadge status={student.evaluation_status || 'pending'} />
      </div>

      <div className="mt-4 space-y-2">
        {student.marks_obtained !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Marks Obtained:</span>
            <span className="font-medium text-gray-900">{student.marks_obtained}</span>
          </div>
        )}
        
        <button
          onClick={() => onViewEvaluation(student)}
          className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 
            transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Evaluation
        </button>
      </div>
    </CardContent>
  </Card>
);

const EvaluationModal = ({ isOpen, onClose, evaluation, student }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Evaluation Details</h3>
            <p className="text-sm text-gray-500 mt-1">{student.student_name} ({student.roll_number})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Total Marks: {evaluation.total_marks}</h4>
                <p className="text-sm text-gray-500">Evaluation Status: {evaluation.evaluation_status}</p>
              </div>
            </div>

            {Object.entries(evaluation.evaluations).map(([questionNumber, data]) => (
              <div key={questionNumber} className="bg-gray-50 rounded-lg p-6">
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Question {questionNumber.split('_')[1]}
                </h5>
                
                <div className="space-y-4">
                  {data.item_grades.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Item {item.item_number}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {item.marks_awarded} marks
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.feedback}</p>
                    </div>
                  ))}

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h6 className="font-medium text-gray-900 mb-2">Overall Feedback</h6>
                    <p className="text-sm text-gray-600">{data.overall_feedback}</p>
                    
                    {data.improvement_suggestions && (
                      <div className="mt-4">
                        <h6 className="font-medium text-gray-900 mb-2">Suggestions for Improvement</h6>
                        <p className="text-sm text-gray-600">{data.improvement_suggestions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ExamEvaluation = ({ examId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, [examId]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/enrollments/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      setStudents(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvaluation = async (student) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/evaluate/${student.enrollment_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }

      const data = await response.json();
      setSelectedEvaluation(data.data);
      setSelectedStudent(student);
      setShowEvaluation(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      student.evaluation_status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Exam Evaluations</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and review student evaluations</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <StudentAnswerCard
            key={student.enrollment_id}
            student={student}
            onViewEvaluation={handleViewEvaluation}
          />
        ))}
      </div>

      <EvaluationModal
        isOpen={showEvaluation}
        onClose={() => {
          setShowEvaluation(false);
          setSelectedEvaluation(null);
          setSelectedStudent(null);
        }}
        evaluation={selectedEvaluation}
        student={selectedStudent}
      />
    </div>
  );
};

export default ExamEvaluation;