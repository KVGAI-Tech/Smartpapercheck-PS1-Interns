import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, Plus, Edit2, Trash2,
  Mail, Users, Clock, BookOpen, AlertCircle,
  BadgeCheck, Check
} from 'lucide-react';
import TAForm from '../forms/TAForm';
import { Modal } from '../shared/Modal';
import ImportModal from '../modals/ImportModal';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import Toast from '../shared/Toast';

import {
  getCourseTAs,
  addTA,
  removeTA,
  uploadTAs,
  pollUploadStatus
} from '../api';

const TATab = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTA, setSelectedTA] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadTAs();
  }, [courseId]);

  const loadTAs = async () => {
    try {
      setLoading(true);
      const data = await getCourseTAs(courseId);
      setTeachingAssistants(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false }), 3000);
  };

  const handleAdd = async (data) => {
    try {
      const newTA = await addTA(courseId, data);
      setTeachingAssistants(prev => [...prev, newTA]);
      showToast('Teaching Assistant added successfully');
      setShowAddModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedTA) return;

    try {
      await removeTA(courseId, selectedTA.id);
      setTeachingAssistants(prev => prev.filter(ta => ta.id !== selectedTA.id));
      showToast('Teaching Assistant removed successfully');
      setShowDeleteModal(false);
      setSelectedTA(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleImport = async (file) => {
    try {
      setUploadStatus('uploading');
      const { uploadId } = await uploadTAs(courseId, file);

      pollUploadStatus(
        uploadId,
        (status) => {
          setUploadStatus('processing');
        },
        async () => {
          setUploadStatus('completed');
          await loadTAs(); 
          showToast('Teaching Assistants imported successfully');
          setShowImportModal(false);
        },
        (error) => {
          setUploadStatus('failed');
          showToast(error.message, 'error');
        }
      );
    } catch (err) {
      setUploadStatus('failed');
      showToast(err.message, 'error');
    }
  };

  const getFilteredTAs = () => {
    if (!searchQuery) return teachingAssistants;

    return teachingAssistants.filter(ta => {
      const searchFields = [
        ta.user_name,
        ta.user_email,
        ta.department,
        ta.details
      ].filter(Boolean);

      return searchFields.some(field => 
        field.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !teachingAssistants.length) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const filteredTAs = getFilteredTAs();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search teaching assistants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={20} />
            Import
          </button>
          
          <button
            onClick={() => {
              setSelectedTA(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add TA
          </button>
        </div>
      </div>

      {filteredTAs.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name & Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="relative px-6 py-3 w-20">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTAs.map((ta) => (
                <tr key={ta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {ta.user_name?.charAt(0)?.toUpperCase() || 'T'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ta.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ta.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {ta.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {ta.details || 'No additional details'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTA(ta);
                          setShowAddModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit TA"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTA(ta);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove TA"
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teaching assistants found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding TAs to this course</p>
            <button
              onClick={() => {
                setSelectedTA(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add First TA
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedTA(null);
        }}
        title={selectedTA ? 'Edit Teaching Assistant' : 'Add Teaching Assistant'}
      >
        <TAForm
          initialData={selectedTA}
          courseId={courseId}
          onSubmit={handleAdd}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTA(null);
          }}
        />
      </Modal>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        type="Teaching Assistants"
        allowedTypes={['text/csv']}
        maxSize={5 * 1024 * 1024}
        uploadStatus={uploadStatus}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTA(null);
        }}
        onConfirm={handleDelete}
        title="Remove Teaching Assistant"
        message={`Are you sure you want to remove ${selectedTA?.user_name || 'this teaching assistant'}? They will no longer have access to this course.`}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default TATab;