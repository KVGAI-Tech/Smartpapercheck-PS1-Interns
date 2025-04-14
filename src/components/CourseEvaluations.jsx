import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  History,
  ExternalLink
} from 'lucide-react';

const ExamCard = ({ 
  id,
  title, 
  type, 
  date, 
  score, 
  maxScore, 
  status, 
  canRequestRecheck,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const getStatusColor = () => {
    switch(status) {
      case 'evaluated':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'recheck_requested':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'evaluated':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'recheck_requested':
        return <History className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleViewDetails = () => {
    navigate(`/student/evaluations/${courseId}/exam/${id}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{type}</p>
            <p className="text-sm text-gray-600 mt-2">Date: {date}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{status === 'recheck_requested' ? 'Recheck Requested' : status}</span>
        </div>
      </div>

      {status === 'evaluated' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Score</span>
            <span className="font-medium text-gray-900">{score}/{maxScore}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(score/maxScore) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={handleViewDetails}
            className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          {status === 'evaluated' && (
            <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
        {canRequestRecheck && status === 'evaluated' && (
          <button className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
            <History className="w-4 h-4" />
            Request Recheck
          </button>
        )}
      </div>
    </div>
  );
};

const CourseEvaluations = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExam, setSelectedExam] = useState(null);

  
  const courseDetails = {
    code: 'CS F111',
    name: 'Computer Programming',
    instructor: 'Dr. John Smith',
    semester: 'Fall 2023'
  };

  const examTypes = ['All', 'Quiz', 'Assignment', 'Mid-term', 'Final'];

  const exams = [
    {
      id: 1,
      title: 'Mid-term Examination',
      type: 'Mid-term',
      date: 'Oct 15, 2023',
      score: 85,
      maxScore: 100,
      status: 'evaluated',
      feedback: 'Good understanding of concepts',
      canRequestRecheck: true
    },
    {
      id: 2,
      title: 'Programming Assignment 2',
      type: 'Assignment',
      date: 'Oct 10, 2023',
      score: 92,
      maxScore: 100,
      status: 'recheck_requested',
      feedback: 'Excellent code quality',
      canRequestRecheck: false
    },
    {
      id: 3,
      title: 'Quiz 3',
      type: 'Quiz',
      date: 'Oct 5, 2023',
      score: 0,
      maxScore: 20,
      status: 'pending',
      canRequestRecheck: false
    }
  ];

  const filteredExams = selectedType === 'All' 
    ? exams 
    : exams.filter(exam => exam.type === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <button 
          onClick={() => navigate('/student/evaluations')}
          className="flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Courses
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{courseDetails.name}</h1>
            <p className="text-gray-500 mt-1">{courseDetails.code} • {courseDetails.semester}</p>
            <p className="text-gray-600 mt-2">Instructor: {courseDetails.instructor}</p>
          </div>
          <button 
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            <ExternalLink className="w-5 h-5" />
            Course Details
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200">
        {examTypes.map((type) => (
          <button
            key={type}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              selectedType === type 
                ? 'text-green-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setSelectedType(type)}
          >
            {type}
            {selectedType === type && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredExams.map((exam) => (
          <ExamCard 
            key={exam.id} 
            {...exam}
            onViewDetails={() => setSelectedExam(exam)}
          />
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No evaluations found</h3>
          <p className="text-gray-500">There are no {selectedType.toLowerCase()} evaluations yet</p>
        </div>
      )}
    </div>
  );
};

export default CourseEvaluations;