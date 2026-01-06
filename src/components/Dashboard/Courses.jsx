import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseModal } from "./Course/modals/CourseModal";
import { useAuth } from "../AuthContext";

import { API_BASE_URL } from "../../BaseURL";

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token found");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
};

const CourseCard = ({ course, onEdit, onRemove, index, userRole }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = (e) => {
    if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
      return;
    }
    if (userRole === "professor") {
      navigate(`/courses/${course.id}` , {
        state: {
          courseName: course.course_name,
          courseCode: course.course_code,
        },
      });
    } else {
      navigate(`/student/evaluations/${course.id}`);
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {course.course_code || "No Code"}
            </h3>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.is_active
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {course.is_active ? "Active" : "Inactive"}
            </motion.span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            {course.course_name}
          </h4>
        </div>

        {userRole === "professor" && (
          <div className="relative ml-4" ref={dropdownRef}>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </motion.button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden"
                >
                  <motion.button
                    whileHover={{ backgroundColor: "#F3F4F6" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(course);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit Course</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ backgroundColor: "#FEF2F2" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(course);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Course</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">
            {formatDate(course.start_date)} - {formatDate(course.end_date)}
          </span>
        </div>
        {course.semester && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">Semester:</span> {course.year}-
            {course.semester}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <AnimatePresence>
          {(isHovered || course.is_active) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-sm text-accent hover:text-accent font-medium flex items-center group"
            >
              View Details
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Toast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white z-50`}
        >
          {type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CourseCardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-1/4 mt-auto animate-pulse"></div>
  </motion.div>
);

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  courseName,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0] }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4"
              >
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </motion.div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Course
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{courseName}</span>? This action
                cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Courses = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showToast, setShowToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [userRole]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const endpoint =
        userRole === "professor"
          ? "/professors/courses"
          : "/students/courses";
      const response = await fetchApi(endpoint);
      setCourses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseData) => {
    setCourses((prev) => [...prev, courseData]);
    showToastMessage("Course added successfully", "success");
  };

  const handleUpdateCourse = async (courseData) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === courseData.id ? courseData : course))
    );
    showToastMessage("Course updated successfully", "success");
  };

  const handleRemoveCourse = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    try {
      await fetchApi(`/professors/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });

      setCourses((prev) =>
        prev.filter((course) => course.id !== courseToDelete.id)
      );
      showToastMessage("Course deleted successfully", "success");
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      showToastMessage(`Failed to delete course: ${err.message}`, "error");
    }
  };

  const showToastMessage = (message, type = "success") => {
    setShowToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setShowToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;

    const courseName = (course.course_name || "").toLowerCase();
    const courseCode = (course.course_code || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return courseName.includes(query) || courseCode.includes(query);
  });

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center bg-white rounded-xl p-8 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: [0, 10, 0] }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4"
      >
        <BookOpen className="h-10 w-10 text-accent" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Courses Yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Get started by adding your first course. Courses help you organize your
        teaching materials and students.
      </p>
      {userRole === "professor" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>Create First Course</span>
        </motion.button>
      )}
    </motion.div>
  );

  const NoResultsState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 p-6 rounded-xl text-center"
    >
      <Search className="mx-auto h-10 w-10 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        No Matching Courses
      </h3>
      <p className="text-gray-600 mb-4">
        No courses match your search for "
        <span className="font-medium">{searchQuery}</span>".
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSearchQuery("")}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent"
      >
        Clear Search
      </motion.button>
    </motion.div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <CourseCardSkeleton key={index} index={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 p-6 rounded-xl text-center"
        >
          <AlertTriangle className="mx-auto h-10 w-10 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Courses
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchCourses}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </motion.button>
        </motion.div>
      );
    }

    if (courses.length === 0) {
      return <EmptyState />;
    }

    if (filteredCourses.length === 0 && searchQuery) {
      return <NoResultsState />;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCourses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            userRole={userRole}
            onEdit={(course) => {
              setSelectedCourse(course);
              setShowAddModal(true);
            }}
            onRemove={handleRemoveCourse}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex-1 max-w-2xl"
          >
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              type="text"
              placeholder="Search courses by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 bg-white shadow-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSearchQuery("");
                fetchCourses();
              }}
              className="flex items-center gap-2 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </motion.div>
        </div>
        {userRole === "professor" && (
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedCourse(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 py-3 px-4 bg-accent text-white rounded-lg shadow-md hover:shadow-lg hover:bg-accent/90 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </motion.button>
          </div>
        )}
      </div>

      {renderContent()}

      {userRole === "professor" && (
        <CourseModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          onSubmit={selectedCourse ? handleUpdateCourse : handleAddCourse}
          isEditing={!!selectedCourse}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={confirmDeleteCourse}
        courseName={courseToDelete?.course_name || "this course"}
      />

      <Toast
        show={showToast.show}
        message={showToast.message}
        type={showToast.type}
        onClose={() => setShowToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Courses;
