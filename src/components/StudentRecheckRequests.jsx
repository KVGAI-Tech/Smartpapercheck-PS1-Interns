import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  History,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../BaseURL";
import axios from "axios";

// Filter dropdown component
const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
      >
        <span className="text-sm text-gray-700">
          {label}: <span className="font-medium">{value}</span>
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                option === value
                  ? "bg-green-50 text-green-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Status badge component
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

// Course section component
const CourseSection = ({ course, requests }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <History className="w-5 h-5 text-green-600" />
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
                    <tr key={index} className="hover:bg-gray-50">
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
                        <Link
                          to={`/student/history/${course.id}/exam/${request.examId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
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

const StudentRecheckRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");

  // Mock data for courses with recheck requests
  const [coursesWithRequests, setCoursesWithRequests] = useState([
    {
      id: "cs101",
      name: "Computer Programming",
      code: "CS101",
      semester: "Fall 2023",
      requests: [
        {
          id: "req1",
          examId: "exam1",
          examTitle: "Mid-term Examination",
          examType: "Mid-term",
          reason: "Question 3 partial credit review",
          status: "approved",
          submittedDate: "Oct 15, 2023",
        },
        {
          id: "req2",
          examId: "exam2",
          examTitle: "Final Examination",
          examType: "Final",
          reason: "Incorrect marking in algorithm section",
          status: "pending",
          submittedDate: "Dec 20, 2023",
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
          examId: "exam3",
          examTitle: "Graph Theory Assignment",
          examType: "Assignment",
          reason: "Implementation logic review",
          status: "pending",
          submittedDate: "Feb 10, 2024",
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
          examId: "exam4",
          examTitle: "Final Project",
          examType: "Project",
          reason: "Model accuracy calculation",
          status: "rejected",
          submittedDate: "Mar 5, 2024",
        },
        {
          id: "req5",
          examId: "exam5",
          examTitle: "Neural Networks Quiz",
          examType: "Quiz",
          reason: "Backpropagation calculation error",
          status: "approved",
          submittedDate: "Feb 25, 2024",
        },
      ],
    },
  ]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/students/courses`)
      .then((res) => {
        console.log(res.data);
        setCoursesWithRequests(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Filter options
  const statusOptions = ["All Status", "Pending", "Approved", "Rejected"];
  const semesterOptions = [
    "All Semesters",
    "Spring 2024",
    "Fall 2023",
    "Spring 2023",
  ];

  // Filter the courses and requests based on search query and filters
  const filteredCourses = coursesWithRequests
    .filter((course) => {
      // Filter by semester
      if (
        selectedSemester !== "All Semesters" &&
        course.semester !== selectedSemester
      ) {
        return false;
      }

      // Filter course requests by status
      const filteredRequests = course.requests.filter((request) => {
        // Filter by status
        if (
          selectedStatus !== "All Status" &&
          request.status.toLowerCase() !== selectedStatus.toLowerCase()
        ) {
          return false;
        }

        // Filter by search query
        const matchesSearch =
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      });

      // Only include courses that have matching requests
      return filteredRequests.length > 0;
    })
    .map((course) => ({
      ...course,
      requests: course.requests.filter((request) => {
        // Filter by status
        if (
          selectedStatus !== "All Status" &&
          request.status.toLowerCase() !== selectedStatus.toLowerCase()
        ) {
          return false;
        }

        // Filter by search query
        const matchesSearch =
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      }),
    }));

  // Calculate total requests
  const totalRequests = filteredCourses.reduce(
    (total, course) => total + course.requests.length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recheck Requests</h1>
          <p className="text-gray-500">
            View and track your recheck requests by course and exam
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full md:w-auto"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-900">{totalRequests}</span>{" "}
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
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div>
          {filteredCourses.map((course, index) => (
            <CourseSection
              key={index}
              course={course}
              requests={course.requests}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recheck Requests Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery ||
            selectedStatus !== "All Status" ||
            selectedSemester !== "All Semesters"
              ? "Try adjusting your filters or search query to find what you're looking for."
              : "You haven't submitted any recheck requests yet. When you do, they'll appear here."}
          </p>
        </div>
      )}

      {totalRequests > 0 && (
        <div className="flex justify-center">
          <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download All Requests</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentRecheckRequests;
