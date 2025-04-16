import React, { useEffect, useState } from "react";
import { Search, BookOpen, ChevronDown, Filter, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../BaseURL";

const CourseCard = ({ id, code, name, instructor, semester, examCount }) => (
  <Link
    to={`/student/evaluations/${id}`}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-100"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <BookOpen className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">{code}</p>
          <p className="text-sm text-gray-600 mt-2">‎ </p>
          <p className="text-sm text-gray-600 mt-2">‎ </p>

        </div>
      </div>
      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
        {examCount || 0} Exams
      </span>
    </div>

    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-gray-500">
        <Calendar className="w-4 h-4" />
        <span>{semester}</span>
      </div>
      <span className="text-green-600 font-medium">View Details →</span>
    </div>
  </Link>
);

const FilterDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:border-green-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-gray-700">
          {label}: {value}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-lg border border-gray-100 z-10 min-w-[180px]">
          {options.map((option) => (
            <button
              key={option}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                option === value ? "bg-green-50 text-green-600 font-medium" : "text-gray-700"
              }`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StudentEvaluations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [sortBy, setSortBy] = useState("Recent");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define all possible semesters and sort options
  const semesters = [
    "All Semesters",
    "Spring 2024",
    "Fall 2023",
    "Spring 2023",
    "Fall 2022",
  ];
  const sortOptions = ["Recent", "Course Code", "Course Name"];

  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/students/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Process the received data
      if (response.data && response.data.code === 200) {
        setCourses(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter and sort courses based on search query, selected semester, and sort option
  const filteredCourses = courses.filter((course) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructor_name && course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by semester
    const matchesSemester =
      selectedSemester === "All Semesters" ||
      (course.semester && `${course.year}-${course.semester}` === selectedSemester);

    return matchesSearch && matchesSemester;
  });

  // Sort filtered courses based on selected sort option
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch(sortBy) {
      case "Course Code":
        return (a.course_code || '').localeCompare(b.course_code || '');
      case "Course Name":
        return (a.course_name || '').localeCompare(b.course_name || '');
      case "Recent":
      default:
        // Sort by start date in descending order (newest first)
        return new Date(b.start_date || 0) - new Date(a.start_date || 0);
    }
  });

  // Handle refresh when there's an error
  const handleRefresh = () => {
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Evaluations</h1>
        <p className="text-gray-500 mt-1">
          View and manage your course evaluations
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by course name, code, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <FilterDropdown
            label="Semester"
            options={semesters}
            value={selectedSemester}
            onChange={setSelectedSemester}
          />

          <FilterDropdown
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />

          <button 
            className="p-2 rounded-lg border border-gray-200 hover:border-green-500 transition-colors"
            onClick={handleRefresh}
            title="Refresh courses"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Error loading courses</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 font-medium flex items-center gap-1 hover:text-red-800"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg h-12 w-12"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                    <div className="h-4 bg-gray-100 rounded w-40 mt-3"></div>
                  </div>
                </div>
                <div className="h-8 w-16 bg-gray-100 rounded-full"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-100 rounded"></div>
                <div className="h-4 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content State - Courses Found */}
      {!loading && !error && sortedCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              code={course.course_code || "N/A"}
              name={course.course_name || "Untitled Course"}
              instructor={course.instructor_name || "Not assigned"}
              semester={`${course.year || "N/A"}-${course.semester || "N/A"}`}
              examCount={course.exam_count || 0}
            />
          ))}
        </div>
      )}

      {/* Empty State - No Courses Found */}
      {!loading && !error && courses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No courses found
          </h3>
          <p className="text-gray-500 mb-4">
            You haven't been enrolled in any courses yet.
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}

      {/* No Results After Filtering */}
      {!loading && !error && courses.length > 0 && sortedCourses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No matching courses
          </h3>
          <p className="text-gray-500 mb-3">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSemester("All Semesters");
            }}
            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentEvaluations;