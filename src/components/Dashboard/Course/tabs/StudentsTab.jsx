import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Search, Plus, Upload, Trash2, 
  Edit2, AlertCircle, Loader2 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from './studentApi';
import { API_BASE_URL } from '../../../../BaseURL';
import { StudentImportModal } from '../modals/ImportModal';

// Memoized Student Row Component
const StudentRow = React.memo(({ 
  student, 
  isSelected, 
  onToggle, 
  onEdit, 
  onDelete, 
  onUpdate 
}) => {
  return (
    <tr className="group hover:bg-gray-50/80 transition-colors">
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(student.id)}
          className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent accent-accent cursor-pointer"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/10">
            <span className="text-sm font-bold text-accent uppercase">{student.name?.charAt(0) || '?'}</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{student.name}</span>
        </div>
      </td>
      <td className="p-4">
        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded tracking-wide uppercase">
          {student.roll_number || 'N/A'}
        </span>
      </td>
      <td className="p-4">
        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
          student.section ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'
        }`}>
          {student.section || 'Unassigned'}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-500 font-medium">{student.email}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(student, onUpdate)}
            className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(student)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const StudentsTab = ({
  courseId, 
  sections = [],
  searchQuery = '',
  selectedSection = 'All sections',
  onSearchChange = () => {},
  onSectionChange = () => {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Simple query for all students
  const {
    data: allStudents = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['students', courseId],
    queryFn: () => studentApi.getStudents(courseId),
    enabled: !!courseId,
  });

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

  const handleRemoveStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.name} from this course?`)) return;
    try {
      await studentApi.removeStudent(courseId, student.id);
      refetch();
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
        (processedCount) => console.log(`Processed: ${processedCount}`),
        async () => {
          setUploadStatus('completed');
          refetch();
          setTimeout(() => {
            setShowImportModal(false);
            setUploadStatus(null);
          }, 2000);
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

  const handleAddStudent = async (studentData) => {
    try {
      const newStudent = await studentApi.addStudent({ ...studentData, courseId });
      refetch();
      return newStudent;
    } catch (err) {
      console.error('Failed to add student:', err.message);
      throw err;
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      const updatedStudent = await studentApi.updateStudent(studentData);
      refetch();
      return updatedStudent;
    } catch (err) {
      console.error('Failed to update student:', err.message);
      throw err;
    }
  };

  // Use useCallback if passing to memoized components for better stability
  const toggleSelectStudent = React.useCallback((id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  
  // Filtering & Search
  const filteredStudents = useMemo(() => {
    let results = allStudents;
    if (selectedSection !== 'All sections') {
      results = results.filter(student => student.section === selectedSection);
    }
    if (searchQuery) {
      const lSearch = searchQuery.toLowerCase();
      results = results.filter(s => 
        s.name?.toLowerCase().includes(lSearch) || 
        s.email?.toLowerCase().includes(lSearch) || 
        s.roll_number?.toLowerCase().includes(lSearch)
      );
    }
    return results;
  }, [allStudents, selectedSection, searchQuery]);

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return filteredStudents;
    const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;
    return [...filteredStudents].sort((a, b) => {
      const aVal = a[sortConfig.key === 'name' ? 'name' : sortConfig.key] || '';
      const bVal = b[sortConfig.key === 'name' ? 'name' : sortConfig.key] || '';
      return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * directionMultiplier;
    });
  }, [filteredStudents, sortConfig]);

  const toggleSelectAllVisible = () => {
    const visibleIds = sortedStudents.map(s => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedStudentIds.has(id));
    
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach(id => next.delete(id));
      else visibleIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedStudentIds.size) return;
    if (!window.confirm(`Delete ${selectedStudentIds.size} students? This cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      await Promise.allSettled(
        Array.from(selectedStudentIds).map(id => studentApi.removeStudent(courseId, id))
      );
      refetch();
      setSelectedStudentIds(new Set());
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSortChange = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading your students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 p-10 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load students</h3>
        <p className="text-red-700 mb-6">{error.message}</p>
        <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search students by name, email, or roll number..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-4 focus:ring-accent/10 focus:border-accent focus:bg-white transition-all text-sm font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {sections.length > 0 && (
              <select
                value={selectedSection}
                onChange={(e) => onSectionChange(e.target.value)}
                className="h-12 px-4 bg-gray-50 border-gray-200 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-sm font-medium"
              >
                <option value="All sections">All Sections</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <button
              onClick={handleBulkDelete}
              disabled={selectedStudentIds.size === 0 || bulkDeleting}
              className="h-12 px-4 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 disabled:opacity-40 disabled:grayscale transition-all flex items-center gap-2"
            >
              {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
              Bulk Delete ({selectedStudentIds.size})
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="h-12 px-4 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
            >
              <Upload size={18} />
              Import
            </button>
            <button
              onClick={handleExportStudents}
              className="h-12 px-4 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
            >
              <Upload size={18} />
              Export
            </button>
            <button
              onClick={() => onAdd((data) => handleAddStudent(data))}
              className="h-12 px-6 flex items-center gap-2 text-white bg-accent rounded-xl hover:bg-accent hover:shadow-lg hover:shadow-accent/20 font-bold text-sm transition-all active:scale-95"
            >
              <Plus size={20} />
              Add Student
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-gray-400" />
              <span className="text-gray-900 font-bold">{allStudents.length}</span> Total Students
            </span>
            {selectedStudentIds.size > 0 && (
              <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-md text-xs font-bold">
                {selectedStudentIds.size} selected
              </span>
            )}
          </div>
          {sortConfig.key && (
            <span className="text-xs">
              Sorted by <span className="text-gray-900 font-bold uppercase">{sortConfig.key}</span> ({sortConfig.direction})
            </span>
          )}
        </div>
      </div>

      {allStudents.length === 0 && !isLoading ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : "Start by importing a CSV file or adding students manually."}
          </p>
          <button onClick={() => setShowImportModal(true)} className="px-8 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all">
            Import Student List
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={sortedStudents.length > 0 && sortedStudents.every(s => selectedStudentIds.has(s.id))}
                      onChange={toggleSelectAllVisible}
                      className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent accent-accent cursor-pointer"
                    />
                  </th>
                  {[
                    { key: 'name', label: 'Student Details' },
                    { key: 'roll_number', label: 'Roll Number' },
                    { key: 'tut_section', label: 'Section' },
                    { key: 'email', label: 'Email Address' }
                  ].map(col => (
                    <th 
                      key={col.key} 
                      onClick={() => handleSortChange(col.key)}
                      className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-accent transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        {sortConfig.key === col.key ? (
                          <span className="text-accent">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedStudents.map(student => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    isSelected={selectedStudentIds.has(student.id)}
                    onToggle={toggleSelectStudent}
                    onEdit={onEdit}
                    onDelete={handleRemoveStudent}
                    onUpdate={handleUpdateStudent}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
