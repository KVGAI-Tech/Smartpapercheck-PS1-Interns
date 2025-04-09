import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, Plus, MoreVertical, Download,
  Users, Pencil, Trash2, School, Calendar, X, CheckCircle,
  BookOpen, Loader, Filter, ArrowRight, AlertTriangle, RefreshCw, ChevronDown
} from 'lucide-react';

import { API_BASE_URL } from '../../BaseURL';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
};

const pop = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};


const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

const CourseCard = ({ course, onEdit, onRemove, index }) => {
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
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.course_code || 'No Code'}</h3>
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                course.is_active 
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              {course.is_active ? 'Active' : 'Inactive'}
            </motion.span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">{course.course_name}</h4>
        </div>
        
        <div className="relative ml-4" ref={dropdownRef}>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDropdown(!showDropdown)}
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
                  onClick={() => {
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
                  onClick={() => {
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
            <span className="font-medium">Semester:</span> {course.year}-{course.semester}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <AnimatePresence>
          {(isHovered || course.is_active) && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
            >
              View Details 
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CourseModal = ({ isOpen, onClose, course, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({
    course_code: course?.course_code || '',
    course_name: course?.course_name || '',
    start_date: course?.start_date?.split('T')[0] || '',
    end_date: course?.end_date?.split('T')[0] || '',
    year: course?.year || new Date().getFullYear(),
    semester: course?.semester || '1',
    is_active: course?.is_active !== undefined ? course.is_active : true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        course_code: course?.course_code || '',
        course_name: course?.course_name || '',
        start_date: course?.start_date?.split('T')[0] || '',
        end_date: course?.end_date?.split('T')[0] || '',
        year: course?.year || new Date().getFullYear(),
        semester: course?.semester || '1',
        is_active: course?.is_active !== undefined ? course.is_active : true
      });
      setTouched({});
      setError('');
    }
  }, [isOpen, course]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.course_code.trim() && !isEditing) {
      newErrors.course_code = 'Course code is required';
    }
    
    if (!formData.course_name.trim()) {
      newErrors.course_name = 'Course name is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    return Object.keys(newErrors).length > 0 ? newErrors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    const formErrors = validateForm();
    if (formErrors) {
      setError('Please fix the form errors');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      let response;
      if (isEditing) {
        response = await fetchApi(`/professors/courses/${course.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetchApi('/professors/courses', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      onSubmit(response.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-xl font-semibold"
              >
                {isEditing ? 'Edit Course' : 'Add New Course'}
              </motion.h2>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 overflow-hidden"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="text"
                    name="course_code"
                    value={formData.course_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      touched.course_code && !formData.course_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="e.g., CS F111"
                    required
                  />
                  {touched.course_code && !formData.course_code && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      Course code is required
                    </motion.p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    touched.course_name && !formData.course_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  placeholder="e.g., Computer Programming"
                  required
                />
                {touched.course_name && !formData.course_name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    Course name is required
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      touched.start_date && !formData.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    required
                  />
                  {touched.start_date && !formData.start_date && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      Start date is required
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      (touched.end_date && (!formData.end_date || (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)))) 
                      ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    required
                  />
                  {touched.end_date && !formData.end_date && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      End date is required
                    </motion.p>
                  )}
                  {touched.end_date && formData.end_date && formData.start_date && 
                    new Date(formData.end_date) <= new Date(formData.start_date) && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      End date must be after start date
                    </motion.p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is-active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is-active" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              )}

              <motion.div 
                className="flex justify-end gap-3 pt-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Course' : 'Add Course'}</span>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white z-50`}
        >
          {type === 'success' ? (
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
    className="bg-white rounded-xl p-6 shadow-sm h-full"
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


const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, courseName }) => {
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
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Course</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{courseName}</span>? 
                This action cannot be undone.
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchApi('/professors/courses');
      setCourses(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseData) => {
    setCourses(prev => [...prev, courseData]);
    showToastMessage('Course added successfully', 'success');
  };

  const handleUpdateCourse = async (courseData) => {
    setCourses(prev => prev.map(course => 
      course.id === courseData.id ? courseData : course
    ));
    showToastMessage('Course updated successfully', 'success');
  };

  const handleRemoveCourse = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    try {
      await fetchApi(`/professors/courses/${courseToDelete.id}`, { 
        method: 'DELETE' 
      });
      
      setCourses(prev => prev.filter(course => course.id !== courseToDelete.id));
      showToastMessage('Course deleted successfully', 'success');
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      showToastMessage(`Failed to delete course: ${err.message}`, 'error');
    }
  };

  const showToastMessage = (message, type = 'success') => {
    setShowToast({
      show: true,
      message,
      type
    });
    
    
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    
    const courseName = (course.course_name || '').toLowerCase();
    const courseCode = (course.course_code || '').toLowerCase();
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
        className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4"
      >
        <BookOpen className="h-10 w-10 text-blue-600" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Get started by adding your first course. Courses help you organize your teaching materials and students.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Plus className="w-5 h-5 mr-2" />
        <span>Create First Course</span>
      </motion.button>
    </motion.div>
  );

  
  const NoResultsState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 p-6 rounded-xl text-center"
    >
      <Search className="mx-auto h-10 w-10 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">No Matching Courses</h3>
      <p className="text-gray-600 mb-4">
        No courses match your search for "<span className="font-medium">{searchQuery}</span>".
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSearchQuery('')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Courses</h3>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Courses</h1>
            <p className="text-gray-500">Manage your courses and teaching assistants</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedCourse(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-medium">Add Course</span>
          </motion.button>
        </motion.div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex-1 max-w-2xl"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                type="text"
                placeholder="Search courses by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
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
                  setSearchQuery('');
                  fetchCourses();
                }}
                className="flex items-center gap-2 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {renderContent()}
      </div>

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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={confirmDeleteCourse}
        courseName={courseToDelete?.course_name || 'this course'}
      />

      <Toast
        show={showToast.show}
        message={showToast.message}
        type={showToast.type}
        onClose={() => setShowToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Courses;