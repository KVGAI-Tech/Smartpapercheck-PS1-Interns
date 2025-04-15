import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, Plus, Edit2, Trash2,
  Users, AlertCircle, Loader 
} from 'lucide-react';
import { studentApi } from './studentApi';
import { StudentImportModal } from '../modals/ImportModal';

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
  onImport = () => {}
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (externalStudents) {
      setStudents(externalStudents);
      console.log(externalStudents)
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const fetchedStudents = await studentApi.getStudents(courseId);
        setStudents(fetchedStudents);
        console.log(fetchedStudents);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId, externalStudents]);

  const handleRemoveStudent = async (student) => {
    try {
      await studentApi.removeStudent(courseId, student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
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
            setStudents(updatedStudents);
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      [student.user_name, student.roll_number, student.user_email]
        .some(field => 
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    const matchesSection = selectedSection === 'All sections' || 
      student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center items-center">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
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
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roll Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="relative px-6 py-3 w-20">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.user_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.user_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Batch: {student.batch}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.roll_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {student.tut_section || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.user_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit student"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveStudent(student)}
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-3">
          {sections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="All sections">All sections</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 
              rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload size={20} />
            Import
          </button>
          <button
            onClick={onAdd}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg 
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus size={20} />
            Add Student
          </button>
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