import React, { useState, useEffect } from 'react';
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
  Loader
} from 'lucide-react';
import { examsApi } from './Student_api';
import Breadcrumbs from './ui/breadcrumbs';

const ExamCard = ({ 
  id, 
  student_id,
  exam_id,
  exam_name,
  full_marks,
  marks_obtained,
  start_time,
  duration,
  recheck_requested,
  allow_recheck,
  upload_status,
  evaluation_status
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const getStatus = () => {
    if (recheck_requested) return 'recheck_requested';
    if (evaluation_status === 'evaluated') return 'evaluated';
    if (upload_status === 'not_uploaded') return 'not_uploaded';
    return 'pending';
  };
  
  const status = getStatus();
  
  const getStatusColor = () => {
    switch(status) {
      case 'evaluated': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'recheck_requested': return 'text-purple-600 bg-purple-50';
      case 'not_uploaded': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'evaluated': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'recheck_requested': return <History className="w-4 h-4" />;
      case 'not_uploaded': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'evaluated': return 'Evaluated';
      case 'pending': return 'Pending';
      case 'recheck_requested': return 'Recheck Requested';
      case 'not_uploaded': return 'Not Uploaded';
      default: return status;
    }
  };

  const handleViewDetails = () => {
    
    if (!exam_id || !id) {
      console.error('Missing exam ID or enrollment ID:', { exam_id, enrollment_id: id });
      return;
    }
    
    
    navigate(`/student/evaluations/${courseId}/exam/${exam_id}?enrollment_id=${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{exam_name}</h3>
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              {duration && <p>Duration: {formatDuration(duration)}</p>}
            </div>
            <p className="text-sm text-gray-600 mt-2">‎ </p>
            <p className="text-sm text-gray-600 mt-2">‎ </p>

          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {status === 'evaluated' && marks_obtained !== null && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Score</span>
            <span className="font-medium text-gray-900">{marks_obtained}/{full_marks}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(marks_obtained/full_marks) * 100}%` }}
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
        {allow_recheck && status === 'evaluated' && !recheck_requested && (
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
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseDetails, setCourseDetails] = useState({
    code: `CS ${courseId}`,
    name: "Computer Programming",
    instructor: 'Dr. John Smith',
    semester: 'Fall 2023'
  });

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        
        if (!courseId) {
          throw new Error('Missing course ID');
        }
        
        const response = await examsApi.getCourseExams(courseId);
        
        if (response && response.code === 200 && response.data) {
          
          
          const examData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.exams || []);
          
          setExams(examData);
          console.log('Exams loaded:', examData);
        } else {
          throw new Error(response?.message || 'Failed to load exams');
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError(err.message || 'Unable to load exams. Please try again later.');
        
        
        setExams([
          {
            id: 394, 
            student_id: 428,
            exam_id: 13,
            marks_obtained: null,
            feedback: null,
            exam_name: "Midterm Exam",
            full_marks: 100,
            start_time: "2025-04-10T09:00:00",
            duration: 90,
            allow_recheck: true,
            recheck_requested: false,
            upload_status: "not_uploaded",
            evaluation_status: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [courseId]);

  const handleTryAgain = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading exams...</p>
      </div>
    );
  }

  if (error && exams.length === 0) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200 max-w-md mx-auto mt-8">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-7 h-7 mr-3" />
          <span className="font-medium text-lg">Unable to Load Exams</span>
        </div>
        <p className="mb-4">{error}</p>
        <button 
          onClick={handleTryAgain}
          className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: 'My Evaluations', to: '/student/evaluations' },
            { label: 'Course', to: courseId ? `/student/evaluations/${courseId}` : '/student/evaluations' },
            { label: 'Exams' },
          ]}
        />
        <button 
          onClick={() => navigate('/student/evaluations')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Courses
        </button>
        
        <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <center><p>{exams?.length || 0} Exams Available</p></center>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
          {}
        </div>
      </div>

      {exams && exams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {exams.map((exam) => (
            <ExamCard 
              key={exam.id} 
              id={exam.id} 
              student_id={exam.student_id}
              exam_id={exam.exam_id}
              exam_name={exam.exam_name}
              full_marks={exam.full_marks}
              marks_obtained={exam.marks_obtained}
              start_time={exam.start_time}
              duration={exam.duration}
              recheck_requested={exam.recheck_requested || false}
              allow_recheck={exam.allow_recheck || false}
              upload_status={exam.upload_status || 'pending'}
              evaluation_status={exam.evaluation_status || null}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no exams available for this course yet. Check back later or contact your instructor for more information.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseEvaluations;