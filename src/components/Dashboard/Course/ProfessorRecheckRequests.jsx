import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  FileText,
  User,
  SortAsc,
  X,
  Loader,
  Check,
  BarChart
} from 'lucide-react';
import { API_BASE_URL } from '../../../BaseURL';


const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
      >
        <span className="text-sm text-gray-700">
          {label}: <span className="font-medium">{value}</span>
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                option === value
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon;

  switch (status.toLowerCase()) {
    case "approved":
      bgColor = "bg-green-50";
      textColor = "text-green-600";
      icon = <CheckCircle className="w-3 h-3" />;
      break;
    case "rejected":
      bgColor = "bg-red-50";
      textColor = "text-red-600";
      icon = <XCircle className="w-3 h-3" />;
      break;
    case "pending":
    default:
      bgColor = "bg-yellow-50";
      textColor = "text-yellow-600";
      icon = <Clock className="w-3 h-3" />;
      break;
  }

  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
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
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
    </motion.div>
  );
};


const CourseSection = ({ course, requests, onViewRequest, expandedByDefault = false }) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{course.name}</h3>
            <p className="text-sm text-gray-500">
              {course.code} • {course.semester}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {requests.length} Requests
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((request, index) => (
                    <motion.tr 
                      key={index} 
                      className="hover:bg-gray-50"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                            {request.studentName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {request.studentName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {request.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.examTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.examType}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {request.reason}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.submittedDate}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onViewRequest(course.id, request)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                          <Eye size={16} />
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const StatsCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const ProfessorRecheckRequests = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  
  const [coursesWithRequests, setCoursesWithRequests] = useState([
    {
      id: "cs101",
      name: "Computer Programming",
      code: "CS101",
      semester: "Fall 2023",
      requests: [
        {
          id: "req1",
          studentName: "Alice Johnson",
          studentId: "2023001",
          examId: "exam1",
          examTitle: "Mid-term Examination",
          examType: "Mid-term",
          reason: "Question 3 partial credit review",
          status: "pending",
          submittedDate: "Oct 15, 2023",
          annotations: 3
        },
        {
          id: "req2",
          studentName: "Bob Smith",
          studentId: "2023002",
          examId: "exam2",
          examTitle: "Final Examination",
          examType: "Final",
          reason: "Incorrect marking in algorithm section",
          status: "pending",
          submittedDate: "Dec 20, 2023",
          annotations: 2
        },
      ],
    },
    {
      id: "ds201",
      name: "Data Structures",
      code: "DS201",
      semester: "Spring 2024",
      requests: [
        {
          id: "req3",
          studentName: "Charlie Davis",
          studentId: "2023003",
          examId: "exam3",
          examTitle: "Graph Theory Assignment",
          examType: "Assignment",
          reason: "Implementation logic review",
          status: "approved",
          submittedDate: "Feb 10, 2024",
          annotations: 1
        },
      ],
    },
    {
      id: "ml301",
      name: "Machine Learning",
      code: "ML301",
      semester: "Spring 2024",
      requests: [
        {
          id: "req4",
          studentName: "Diana Miller",
          studentId: "2023004",
          examId: "exam4",
          examTitle: "Final Project",
          examType: "Project",
          reason: "Model accuracy calculation",
          status: "rejected",
          submittedDate: "Mar 5, 2024",
          annotations: 4
        },
        {
          id: "req5",
          studentName: "Ethan Brown",
          studentId: "2023005",
          examId: "exam5",
          examTitle: "Neural Networks Quiz",
          examType: "Quiz",
          reason: "Backpropagation calculation error",
          status: "pending",
          submittedDate: "Feb 25, 2024",
          annotations: 2
        },
      ],
    },
  ]);

  
  useEffect(() => {
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  
  const statusOptions = ["All Status", "Pending", "Approved", "Rejected"];
  const semesterOptions = [
    "All Semesters",
    "Spring 2024",
    "Fall 2023",
    "Spring 2023",
  ];
  
  
  const courseOptions = ["All Courses", ...new Set(coursesWithRequests.map(course => course.name))];

  
  const totalRequests = coursesWithRequests.reduce(
    (total, course) => total + course.requests.length, 0
  );
  
  const pendingRequests = coursesWithRequests.reduce(
    (total, course) => total + course.requests.filter(req => req.status.toLowerCase() === 'pending').length, 0
  );
  
  const approvedRequests = coursesWithRequests.reduce(
    (total, course) => total + course.requests.filter(req => req.status.toLowerCase() === 'approved').length, 0
  );
  
  const rejectedRequests = coursesWithRequests.reduce(
    (total, course) => total + course.requests.filter(req => req.status.toLowerCase() === 'rejected').length, 0
  );

  
  const filteredCourses = coursesWithRequests
    .filter((course) => {
      
      if (
        selectedSemester !== "All Semesters" &&
        course.semester !== selectedSemester
      ) {
        return false;
      }

      
      if (
        selectedCourse !== "All Courses" &&
        course.name !== selectedCourse
      ) {
        return false;
      }

      
      const filteredRequests = course.requests.filter((request) => {
        
        if (
          selectedStatus !== "All Status" &&
          request.status.toLowerCase() !== selectedStatus.toLowerCase()
        ) {
          return false;
        }

        
        const matchesSearch =
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.studentId.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      });

      
      return filteredRequests.length > 0;
    })
    .map((course) => ({
      ...course,
      requests: course.requests.filter((request) => {
        
        if (
          selectedStatus !== "All Status" &&
          request.status.toLowerCase() !== selectedStatus.toLowerCase()
        ) {
          return false;
        }

        
        const matchesSearch =
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.studentId.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      }),
    }));

  
  const filteredTotalRequests = filteredCourses.reduce(
    (total, course) => total + course.requests.length, 0
  );

  const handleViewRequest = (courseId, request) => {
    
    console.log("Navigating to recheck detail:", courseId, request.id);
    
    
    if (!courseId || !request.id) {
      showToast("Unable to view request details. Missing information.", "error");
      return;
    }
    
    
    navigate(`/professor/recheck-requests`, { 
      state: { request, courseId }
    });
    
    
    showToast("Loading request details...", "success");
  };  
  
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  
  const handleBulkApprove = () => {
    
    showToast('Bulk approve is not implemented in this demo', 'error');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Loading requests</h3>
          <p className="text-gray-500">Please wait while we fetch the recheck requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="inline-block bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Failed to Load Requests</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recheck Requests</h1>
          <p className="text-gray-500">
            Review and respond to student recheck requests
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Requests" 
          value={totalRequests} 
          icon={FileText} 
          color="text-white" 
          bgColor="bg-blue-600" 
        />
        <StatsCard 
          title="Pending" 
          value={pendingRequests} 
          icon={Clock} 
          color="text-white" 
          bgColor="bg-yellow-500" 
        />
        <StatsCard 
          title="Approved" 
          value={approvedRequests} 
          icon={CheckCircle} 
          color="text-white" 
          bgColor="bg-green-500" 
        />
        <StatsCard 
          title="Rejected" 
          value={rejectedRequests} 
          icon={XCircle} 
          color="text-white" 
          bgColor="bg-red-500" 
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">{filteredTotalRequests}</span>{" "}
          requests across{" "}
          <span className="font-medium text-gray-900">
            {filteredCourses.length}
          </span>{" "}
          courses
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />

          <FilterDropdown
            label="Semester"
            options={semesterOptions}
            value={selectedSemester}
            onChange={setSelectedSemester}
          />

          <FilterDropdown
            label="Course"
            options={courseOptions}
            value={selectedCourse}
            onChange={setSelectedCourse}
          />

          <button className="p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div>
          {pendingRequests > 0 && (
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span>You have {pendingRequests} pending requests to review</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkApprove}
                className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
              >
                View Pending
              </motion.button>
            </div>
          )}

          {filteredCourses.map((course, index) => (
            <CourseSection
              key={index}
              course={course}
              requests={course.requests}
              onViewRequest={handleViewRequest}
              expandedByDefault={index === 0}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recheck Requests Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery ||
            selectedStatus !== "All Status" ||
            selectedSemester !== "All Semesters" ||
            selectedCourse !== "All Courses"
              ? "Try adjusting your filters or search query to find what you're looking for."
              : "There are no recheck requests to review at this time."}
          </p>
        </motion.div>
      )}

      {filteredTotalRequests > 0 && (
        <div className="flex justify-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <BarChart className="w-4 h-4" />
            <span>View Analytics</span>
          </motion.button>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default ProfessorRecheckRequests;