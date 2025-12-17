import React, { useState } from 'react';
import { 
  Search, Upload, Plus, Edit2, Trash2,
  Mail, Building, Clock, GraduationCap,
  Users 
} from 'lucide-react';
import { InstructorImportModal } from '../modals/ImportModal';
import { API_BASE_URL } from '../../../../BaseURL';
const InstructorsTab = ({
  courseId,
  instructors = [], 
  searchQuery = '',
  onSearchChange = () => {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onImport = () => {}
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleImportInstructors = async (file) => {
    try {
      setUploadStatus('uploading');
      
      const response = await fetch(`${API_BASE_URL}/api/professors/courses/${courseId}/co-instructors/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append('co_instructor_list', file);
          return formData;
        })(),
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code !== 202) {
        throw new Error(result.message || 'Upload failed');
      }
      
      const uploadId = result.data.upload_id;
      setUploadStatus('processing');
      
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/api/professors/uploads/${uploadId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          
          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }
          
          const statusData = await statusResponse.json();
          
          if (statusData.data.status === 'completed') {
            clearInterval(pollInterval);
            setUploadStatus('completed');
            
            onImport && onImport(file);
            
            setTimeout(() => {
              setShowImportModal(false);
              setUploadStatus(null);
            }, 2000);
            
          } else if (statusData.data.status === 'failed') {
            clearInterval(pollInterval);
            setUploadStatus('failed');
            throw new Error(statusData.data.error_message || 'Import failed');
          }
          
        } catch (error) {
          clearInterval(pollInterval);
          setUploadStatus('failed');
          console.error('Error checking upload status:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error importing instructors:', error);
      setUploadStatus('failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search instructors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end sm:w-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={20} />
            Import
          </button>
          
          <button
            onClick={onAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent"
          >
            <Plus size={20} />
            Add Instructor
          </button>
        </div>
      </div>

      {instructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-accent">
                      {instructor.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{instructor.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500">{instructor.role || 'Instructor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(instructor)}
                    className="p-1.5 text-accent hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    title="Edit instructor"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(instructor)}
                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove instructor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                {instructor.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{instructor.email}</span>
                  </div>
                )}
                {instructor.office && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{instructor.office}</span>
                  </div>
                )}
                {instructor.officeHours && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{instructor.officeHours}</span>
                  </div>
                )}
                {instructor.expertise && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span>{instructor.expertise}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding instructors to this course</p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 text-white bg-accent rounded-lg hover:bg-accent"
            >
              <Plus size={20} />
              Add First Instructor
            </button>
          </div>
        </div>
      )}

      <InstructorImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setUploadStatus(null);
        }}
        onImport={handleImportInstructors}
        courseId={courseId}
        uploadStatus={uploadStatus}
      />
    </div>
  );
};

export default InstructorsTab;