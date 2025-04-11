import React, { useEffect, useState } from "react";
import {
  Search,
  BookOpen,
  ChevronDown,
  Filter,
  SortAsc,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../BaseURL";

const CourseCard = ({ code, name, instructor, semester, examCount }) => (
  <Link
    to={`/student/evaluations/${code}`}
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
          <p className="text-sm text-gray-600 mt-2">Instructor: {instructor}</p>
        </div>
      </div>
      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
        {examCount} Exams
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

const FilterDropdown = ({ label, options, value, onChange }) => (
  <div className="relative">
    <button
      className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 hover:border-green-500 transition-colors"
      onClick={() => onChange(value === options[0] ? options[1] : options[0])}
    >
      <span className="text-sm text-gray-700">
        {label}: {value}
      </span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  </div>
);

const StudentEvaluations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [sortBy, setSortBy] = useState("Recent");
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Mock data - replace with actual API call
  // const courses = [
  //   {
  //     code: 'CS F111',
  //     name: 'Computer Programming',
  //     instructor: 'Dr. John Smith',
  //     semester: 'Fall 2023',
  //     examCount: 3
  //   },
  //   {
  //     code: 'CS F212',
  //     name: 'Data Structures',
  //     instructor: 'Dr. Sarah Johnson',
  //     semester: 'Fall 2023',
  //     examCount: 4
  //   },
  //   {
  //     code: 'CS F318',
  //     name: 'Machine Learning',
  //     instructor: 'Dr. Michael Brown',
  //     semester: 'Spring 2024',
  //     examCount: 2
  //   },
  //   {
  //     code: 'MATH F113',
  //     name: 'Mathematics II',
  //     instructor: 'Dr. Emily Davis',
  //     semester: 'Spring 2024',
  //     examCount: 5
  //   }
  // ];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/students/courses`)
      .then((res) => {
        setCourses(res.data.data);
        setFilteredCourses(
          res.data.data.filter((course) => {
            const matchesSearch =
              course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.instructor
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesSemester =
              selectedSemester === "All Semesters" ||
              course.semester === selectedSemester;

            return matchesSearch && matchesSemester;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const semesters = [
    "All Semesters",
    "Spring 2024",
    "Fall 2023",
    "Spring 2023",
    "Fall 2022",
  ];
  const sortOptions = ["Recent", "Course Code", "Course Name"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Evaluations</h1>
        <p className="text-gray-500 mt-1">
          View and manage your course evaluations
        </p>
      </div>

      {/* Search and Filters */}
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

          <button className="p-2 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <>
          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No courses found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </>
      ) : (
        <p>Fetching courses...</p>
      )}
    </div>
  );
};

export default StudentEvaluations;
