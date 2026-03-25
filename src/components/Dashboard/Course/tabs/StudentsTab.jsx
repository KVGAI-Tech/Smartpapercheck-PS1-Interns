import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, Plus, Edit2, Trash2,
  Users, AlertCircle, Loader 
} from 'lucide-react';
import { studentApi } from './studentApi'; 
import { StudentImportModal } from '../modals/ImportModal';
import { API_BASE_URL } from '../../../../BaseURL';

// Create a local storage service for students
const studentsStorageService = {
  saveStudents: (courseId, students) => {
    if (!courseId || !students || !Array.isArray(students)) return;
    try {
      localStorage.setItem(`course_${courseId}_students`, JSON.stringify(students));
    } catch (error) {
      console.error('Failed to save students to localStorage:', error);
    }
  },
  
  getStudents: (courseId) => {
    if (!courseId) return [];
    try {
      const saved = localStorage.getItem(`course_${courseId}_students`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get students from localStorage:', error);
      return [];
    }
  }
};

const StudentsTab = ({
  courseId, 
  students: externalStudents = null,
  sections = [],
  searchQuery = '',
  selectedSection = 'All sections',
  onSearchChange = () => {},
  onSectionChange = () => {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleExportStudents = () => {
    try {
      if (!courseId) throw new Error('Course ID is required');

      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      const url = `${API_BASE_URL}/professors/courses/${courseId}/students/export?token=${encodeURIComponent(token)}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = `course_${courseId}_students.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export students:', err);
    }
  };

  // Function to update students list and also save to storage
  const updateAndSaveStudents = (newStudents) => {
    setStudents(newStudents);
    studentsStorageService.saveStudents(courseId, newStudents);
  };

  useEffect(() => {
    if (externalStudents) {
      updateAndSaveStudents(externalStudents);
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }
      
      // First try to get cached students to show immediately
      const cachedStudents = studentsStorageService.getStudents(courseId);
      if (cachedStudents.length > 0) {
        setStudents(cachedStudents);
      }
      
      try {
        setLoading(true);
        const fetchedStudents = await studentApi.getStudents(courseId);
        console.log("Fetched students:", fetchedStudents);
        
        if (Array.isArray(fetchedStudents)) {
          updateAndSaveStudents(fetchedStudents);
          setError(null);
        } else {
          console.error("Unexpected students data format:", fetchedStudents);
          setError('Received invalid data format from server');
          if (!cachedStudents.length) {
            setStudents([]);
          }
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message || 'Failed to load students');
        if (!cachedStudents.length) {
          setStudents([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId, externalStudents]);

  useEffect(() => {
    setSelectedStudentIds((prev) => {
      const ids = new Set();
      const validIds = new Set((students || []).map((s) => s.id));
      prev.forEach((id) => {
        if (validIds.has(id)) ids.add(id);
      });
      return ids;
    });
  }, [students]);

  const handleRemoveStudent = async (student) => {
    try {
      await studentApi.removeStudent(courseId, student.id);
      const updatedStudents = students.filter(s => s.id !== student.id);
      updateAndSaveStudents(updatedStudents);
      onDelete && onDelete(student);
    } catch (err) {
      console.error('Failed to remove student:', err.message);
    }
  };

  const handleImportStudents = async (file) => {
    try {
      setUploadStatus('uploading');
      const result = await studentApi.uploadStudents(courseId, file);
      
      setUploadStatus('processing');
      studentApi.pollUploadStatus(
        result.upload_id,
        (processedCount) => {
          console.log(`Processed: ${processedCount}`);
        },
        async () => {
          setUploadStatus('completed');
          try {
            const updatedStudents = await studentApi.getStudents(courseId);
            updateAndSaveStudents(updatedStudents);
            setTimeout(() => {
              setShowImportModal(false);
              setUploadStatus(null);
            }, 2000);
          } catch (err) {
            console.error('Failed to refresh students:', err.message);
          }
        },
        (error) => {
          console.error('Import failed:', error);
          setUploadStatus('failed');
        }
      );
    } catch (err) {
      console.error('Failed to import students:', err.message);
      setUploadStatus('failed');
    }
  };

  // Add a new function to handle adding a student
  const handleAddStudent = async (studentData) => {
    try {
      const newStudent = await studentApi.addStudent({
        ...studentData,
        courseId
      });
      const updatedStudents = [...students, newStudent];
      updateAndSaveStudents(updatedStudents);
      return newStudent;
    } catch (err) {
      console.error('Failed to add student:', err.message);
      throw err;
    }
  };

  // Add a new function to handle updating a student
  const handleUpdateStudent = async (studentData) => {
    try {
      const updatedStudent = await studentApi.updateStudent(studentData);
      const updatedStudents = students.map(s => 
        s.id === updatedStudent.id ? updatedStudent : s
      );
      updateAndSaveStudents(updatedStudents);
      return updatedStudent;
    } catch (err) {
      console.error('Failed to update student:', err.message);
      throw err;
    }
  };

  // Override the onAdd prop to use our handler that updates the stored list
  const handleOnAdd = () => {
    onAdd((studentData) => handleAddStudent(studentData));
  };

  // Override the onEdit prop to use our handler that updates the stored list
  const handleOnEdit = (student) => {
    onEdit(student, (studentData) => handleUpdateStudent(studentData));
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      [student.user_name, student.roll_number, student.user_email]
        .filter(field => typeof field === 'string') 
        .some(field => field.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSection = selectedSection === 'All sections' || 
      student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const totalStudentCount = students.length;
  const visibleStudentCount = filteredStudents.length;

  const getSortableValue = (student, key) => {
    switch (key) {
      case 'name':
        return student.user_name ?? '';
      case 'roll_number':
        return student.roll_number ?? '';
      case 'tut_section':
        return student.tut_section ?? '';
      case 'email':
        return student.user_email ?? '';
      default:
        return '';
    }
  };

  const sortedStudents = (() => {
    if (!sortConfig.key) return filteredStudents;

    const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filteredStudents].sort((a, b) => {
      const aVal = getSortableValue(a, sortConfig.key);
      const bVal = getSortableValue(b, sortConfig.key);

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * directionMultiplier;
      }

      return String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * directionMultiplier;
    });
  })();

  const visibleStudentIds = sortedStudents.map((student) => student.id);
  const allVisibleSelected =
    visibleStudentIds.length > 0 &&
    visibleStudentIds.every((id) => selectedStudentIds.has(id));

  const toggleSelectAllVisible = () => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleStudentIds.forEach((id) => next.delete(id));
      } else {
        visibleStudentIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedStudentIds.size) return;
    const confirmed = window.confirm(
      `Delete ${selectedStudentIds.size} student${selectedStudentIds.size > 1 ? 's' : ''}? This cannot be undone.`
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    const idsToDelete = Array.from(selectedStudentIds);
    const remaining = [];
    const failed = [];

    await Promise.allSettled(
      idsToDelete.map(async (id) => {
        const student = students.find((s) => s.id === id);
        if (!student) return;
        try {
          await studentApi.removeStudent(courseId, id);
        } catch (err) {
          failed.push(student);
        }
      })
    );

    const failedIds = new Set(failed.map((s) => s.id));
    students.forEach((student) => {
      if (!selectedStudentIds.has(student.id) || failedIds.has(student.id)) {
        remaining.push(student);
      }
    });

    updateAndSaveStudents(remaining);
    setSelectedStudentIds(new Set(failedIds));
    setBulkDeleting(false);
  };

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSortChange = (value) => {
    if (!value) {
      setSortConfig({ key: null, direction: 'asc' });
      return;
    }
    setSortConfig((prev) => ({
      key: value,
      direction: prev.key === value ? prev.direction : 'asc',
    }));
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return (
      <span className="ml-1 text-[10px] text-gray-400">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center">
            <Loader className="w-8 h-8 text-accent animate-spin" />
            <span className="ml-3 text-gray-600">Loading students...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading students
            </h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
          </div>
        </div>
      );
    }

    if (!students.length) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Get started by adding students to this course
            </p>
            <button
              onClick={handleOnAdd}
              className="flex items-center gap-2 px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent"
            >
              <Plus size={20} />
              Add First Student
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full sm:min-w-[720px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-2 sm:px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all students"
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => requestSort('name')}
                    className="inline-flex items-center hover:text-gray-700"
                  >
                    Student Details
                    {renderSortIndicator('name')}
                  </button>
                </th>

                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => requestSort('roll_number')}
                    className="inline-flex items-center hover:text-gray-700"
                  >
                    Roll Number
                    {renderSortIndicator('roll_number')}
                  </button>
                </th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => requestSort('tut_section')}
                    className="inline-flex items-center hover:text-gray-700"
                  >
                    Section
                    {renderSortIndicator('tut_section')}
                  </button>
                </th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => requestSort('email')}
                    className="inline-flex items-center hover:text-gray-700"
                  >
                    Email
                    {renderSortIndicator('email')}
                  </button>
                </th>
                <th scope="col" className="relative px-2 sm:px-6 py-3 w-16 sm:w-20">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(student.id)}
                      onChange={() => toggleSelectStudent(student.id)}
                      aria-label={`Select ${student.user_name || 'student'}`}
                      className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-normal sm:whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="hidden sm:flex h-10 w-10 rounded-full bg-accent/10 items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {student.user_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="sm:ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.user_name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.roll_number}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent">
                      {student.tut_section || 'Unassigned'}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-normal sm:whitespace-nowrap break-all sm:break-normal text-sm text-gray-500">
                    {student.user_email}
                  </td>
                  <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-0.5 sm:space-x-2">
                      <button
                        onClick={() => handleOnEdit(student)}

                        className="p-1 sm:p-1.5 text-accent hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Edit student"
                      >
                        <Edit2 size={14} className="sm:hidden" />
                        <Edit2 size={16} className="hidden sm:block" />
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student)}
                        className="p-1 sm:p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove student"
                      >
                        <Trash2 size={14} className="sm:hidden" />
                        <Trash2 size={16} className="hidden sm:block" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 min-w-0 max-w-3xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {sections.length > 0 && (
              <select
                value={selectedSection}
                onChange={(e) => onSectionChange(e.target.value)}
                className="h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent"
                disabled={loading}
              >
                <option value="All sections">All sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            )}
            <select
              value={sortConfig.key || ''}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent"
              disabled={loading}
            >
              <option value="">Sort by</option>
              <option value="name">Name</option>
              <option value="roll_number">Roll Number</option>
              <option value="tut_section">Section</option>
              <option value="email">Email</option>
            </select>
            <button
              onClick={handleBulkDelete}
              disabled={loading || bulkDeleting || selectedStudentIds.size === 0}
              className="h-11 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bulk Delete
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              disabled={loading}
              className="h-11 px-4 flex items-center justify-center gap-2 text-gray-700 bg-white border border-gray-300 
                rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              Import
            </button>
            <button
              onClick={handleExportStudents}
              disabled={loading}
              className="h-11 px-4 flex items-center justify-center gap-2 text-gray-700 bg-white border border-gray-300 
                rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              Export
            </button>
            <button
              onClick={handleOnAdd}
              disabled={loading}
              className="h-11 px-4 flex items-center justify-center gap-2 text-white bg-accent rounded-lg 
                hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Add Student
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{totalStudentCount}</span>
            <span>students</span>
            <span className="text-xs text-gray-400">Showing {visibleStudentCount}</span>
          </div>
          {selectedStudentIds.size > 0 && (
            <div className="text-xs text-gray-500">
              {selectedStudentIds.size} selected
            </div>
          )}
        </div>
      </div>

      {renderContent()}

      <StudentImportModal 
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setUploadStatus(null);
        }}
        onImport={handleImportStudents}
        courseId={courseId}
        uploadStatus={uploadStatus}
      />
    </div>
  );
};

export default StudentsTab;
