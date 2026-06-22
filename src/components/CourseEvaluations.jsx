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
import { getExamVariant } from './examTypeUtils';

const ExamCard = ({ 
  id, 
  student_id,
  exam_id,
  exam_name,
  full_marks,
  exam_mode,
  exam_type,
  conduct_variant,
  exam_is_active,
  marks_obtained,
  start_time,
  end_time,
  duration,
  recheck_requested,
  allow_recheck,
  upload_status,
  evaluation_status,
  conduct_submission_status,
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const examVariant = getExamVariant({ exam_mode, exam_type, conduct_variant });

  const getSubjectiveConductAvailability = () => {
    const now = Date.now();
    const startMs = start_time ? new Date(start_time).getTime() : null;
    const endMs = end_time ? new Date(end_time).getTime() : null;

    // For conduct exams, only check time window (no is_active check)
    if (startMs && now < startMs) return 'not_started';
    if (endMs && now > endMs) return 'expired';
    return 'live';
  };
  
  const getStatus = () => {
    if (recheck_requested) return 'recheck_requested';
    if (evaluation_status === 'evaluated') return 'evaluated';

    if (examVariant === 'portal_mcq' && upload_status === 'submitted') return 'submitted';
    if (examVariant === 'portal_mcq' && !exam_is_active) return 'inactive';
    if (examVariant === 'portal_mcq') return 'ready';
    if (examVariant === 'conduct') {
      if (conduct_submission_status === 'submitted' || conduct_submission_status === 'auto_submitted') {
        return 'submitted';
      }
      return getSubjectiveConductAvailability();
    }
    if (upload_status === 'not_uploaded') return 'not_uploaded';
    return 'pending';
  };
  
  const status = getStatus();
  const isOpenDisabled = status === 'inactive' || status === 'not_started' || status === 'expired';
  
  const getStatusColor = () => {
    switch(status) {
      case 'evaluated': return 'text-accent bg-accent/10';
      case 'pending': return 'text-amber-700 bg-amber-50';
      case 'recheck_requested': return 'text-accent bg-accent/5';
      case 'ready': return 'text-blue-700 bg-blue-50';
      case 'inactive': return 'text-gray-700 bg-gray-100';
      case 'submitted': return 'text-green-700 bg-green-50';
      case 'live': return 'text-blue-700 bg-blue-50';
      case 'not_started': return 'text-gray-700 bg-gray-100';
      case 'expired': return 'text-red-700 bg-red-50';
      case 'not_uploaded': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'evaluated': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'recheck_requested': return <History className="w-4 h-4" />;
      case 'ready': return <Clock className="w-4 h-4" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      case 'submitted': return <CheckCircle className="w-4 h-4" />;
      case 'live': return <Clock className="w-4 h-4" />;
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'not_uploaded': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'evaluated': return 'Evaluated';
      case 'pending': return 'Pending';
      case 'recheck_requested': return 'Recheck Requested';
      case 'ready': return 'Ready';
      case 'inactive': return 'Inactive';
      case 'submitted': return 'Submitted';
      case 'live': return 'Live';
      case 'not_started': return 'Not Started';
      case 'expired': return 'Expired';
      case 'not_uploaded': return 'Not Uploaded';
      default: return status;
    }
  };

  const handleViewDetails = () => {
    if (!exam_id || !id) {
      console.error('Missing exam ID or enrollment ID:', { exam_id, enrollment_id: id });
      return;
    }

    // Subjective conduct exams go directly to the exam session page unless evaluated
    if (examVariant === 'conduct' && status !== 'evaluated' && status !== 'recheck_requested') {
      navigate(`/student/exams/${exam_id}/conduct`);
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
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-accent/10 rounded-lg">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{exam_name}</h3>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              {exam_type && <p>Type: {examVariant === 'portal_mcq' || examVariant === 'conduct' ? 'Online Exam' : 'Offline Exam'}</p>}
              {examVariant === 'portal_mcq' && <p>Availability: {exam_is_active ? 'Active' : 'Inactive'}</p>}
              {examVariant === 'conduct' && <p>Window: {getStatusText()}</p>}
              {duration && <p>Duration: {formatDuration(duration)}</p>}
              {start_time && <p>Exam Date: {formatDate(start_time)}</p>}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {status === 'evaluated' && marks_obtained !== null && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Score</span>
            <span className="font-medium text-gray-900">{marks_obtained}/{full_marks}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${(marks_obtained/full_marks) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleViewDetails}
            disabled={isOpenDisabled}
            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${
              isOpenDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-accent hover:text-accent/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            {(examVariant === 'portal_mcq' || examVariant === 'conduct') ? 'Open Exam' : 'View Details'}
          </button>
          {status === 'evaluated' && (
            <button className="px-3 py-1.5 text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
        {allow_recheck && status === 'evaluated' && !recheck_requested && (
          <button className="px-3 py-1.5 text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1 whitespace-nowrap">
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
        setExams([]);
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
        <Loader className="w-8 h-8 text-accent animate-spin mb-4" />
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
        <button 
          onClick={() => navigate('/student/evaluations')}
          className="flex items-center text-gray-600 hover:text-accent mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Courses
        </button>
        
        <div className="text-sm bg-accent/5 text-accent px-4 py-2 rounded-lg">
          <center><p>{exams?.length || 0} Exams Available</p></center>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
          {}
        </div>
      </div>

      {exams && exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <ExamCard 
              key={exam.id} 
              id={exam.id} 
              student_id={exam.student_id}
              exam_id={exam.exam_id}
              exam_name={exam.exam_name}
              full_marks={exam.full_marks}
              exam_mode={exam.exam_mode}
              exam_type={exam.exam_type}
              conduct_variant={exam.conduct_variant}
              exam_is_active={exam.exam_is_active}
              marks_obtained={exam.marks_obtained}
              start_time={exam.start_time}
              end_time={exam.end_time}
              duration={exam.duration}
              recheck_requested={exam.recheck_requested || false}
              allow_recheck={exam.allow_recheck || false}
              upload_status={exam.upload_status || 'pending'}
              evaluation_status={exam.evaluation_status || null}
              conduct_submission_status={exam.conduct_submission_status || null}
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
