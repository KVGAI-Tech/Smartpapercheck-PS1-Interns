import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search, Plus, MoreVertical, Download,
  Users, Pencil, Trash2, School, Calendar, X, CheckCircle,
  BookOpen
} from 'lucide-react';

import { API_BASE_URL } from '../../BaseURL';
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
    
const CourseCard = ({ course, onEdit, onRemove }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDropdown(false);
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.course_code}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              course.course_status === 'ACTIVE' 
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-50 text-gray-600'
            }`}>
              {course.course_status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">{course.course_name}</h4>
        </div>
        
        <div className="relative ml-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
              <button
                onClick={() => {
                  onEdit(course);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Course</span>
              </button>
              <button
                onClick={() => {
                  onRemove(course);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Course</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">
            {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {isHovered && course.course_status === 'ACTIVE' && (
        <button
          onClick={() => navigate(`/courses/${course.id}`)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Details →
        </button>
      )}
    </div>
  );
};

const CourseModal = ({ isOpen, onClose, course, onSubmit, isEditing }) => {
  const [formData, setFormData] = useState({
    course_code: course?.course_code || '',
    course_name: course?.course_name || '',
    start_date: course?.start_date?.split('T')[0] || '',
    end_date: course?.end_date?.split('T')[0] || '',
    year: new Date().getFullYear(),
    semester: '1',
    course_status: course?.course_status || 'INACTIVE'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.course_status}
                onChange={(e) => setFormData({ ...formData, course_status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : isEditing ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showToast, setShowToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
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
    setShowToast({
      show: true,
      message: 'Course added successfully',
      type: 'success'
    });
    setTimeout(() => setShowToast({ show: false }), 3000);
  };

  const handleUpdateCourse = async (courseData) => {
    setCourses(prev => prev.map(course => 
      course.id === courseData.id ? courseData : course
    ));
    setShowToast({
      show: true,
      message: 'Course updated successfully',
      type: 'success'
    });
    setTimeout(() => setShowToast({ show: false }), 3000);
  };

  const filteredCourses = courses.filter(course =>
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-500">Manage your courses and teaching assistants</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Course
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={(course) => {
                setSelectedCourse(course);
                setShowAddModal(true);
              }}
              onRemove={(course) => {
              }}
            />
          ))}
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

        {showToast.show && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {showToast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;