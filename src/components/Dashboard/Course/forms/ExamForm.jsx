import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, FileText } from 'lucide-react';
import { fetchMasterExams } from '../../MasterExams/masterExamApi';

const ExamForm = ({ 
  initialData = null,
  onSubmit,
  onClose,
  allowMasterSelection = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    exam_name: initialData?.exam_name || '',
    full_marks: initialData?.full_marks || '',
    exam_type: initialData?.exam_type || 'evaluated',
    is_active: initialData?.is_active ?? false,
    allow_recheck: true,
    max_recheck_attempts: 1,
    master_exam_id: null
  });

  const [useMasterExam, setUseMasterExam] = useState(false);
  const [masterExamsList, setMasterExamsList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  useEffect(() => {
    if (allowMasterSelection && useMasterExam && masterExamsList.length === 0) {
      setLoadingMasters(true);
      fetchMasterExams()
        .then(setMasterExamsList)
        .catch(err => setError('Failed to load master exams: ' + err.message))
        .finally(() => setLoadingMasters(false));
    }
  }, [allowMasterSelection, useMasterExam, masterExamsList.length]);

  const handleMasterExamSelect = (e) => {
    const selectedId = e.target.value;
    const selectedMaster = masterExamsList.find(m => m.id.toString() === selectedId);
    if (selectedMaster) {
      setFormData(prev => ({
        ...prev,
        master_exam_id: selectedMaster.id,
        exam_name: selectedMaster.exam_name,
        full_marks: selectedMaster.full_marks,
        exam_type: selectedMaster.exam_type || 'evaluated'
      }));
    } else {
      setFormData(prev => ({ ...prev, master_exam_id: null }));
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      exam_type: newType,
      // If creating a new exam, keep is_active false. If editing, preserve the value.
      is_active: initialData ? prev.is_active : false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exam_name || !formData.full_marks  === '') {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {!initialData && allowMasterSelection && (
          <div className="flex gap-4 p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={!useMasterExam} 
                onChange={() => setUseMasterExam(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Create New Exam</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={useMasterExam} 
                onChange={() => setUseMasterExam(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-500" />
                Use Master Exam
              </span>
            </label>
          </div>
        )}

        {allowMasterSelection && useMasterExam && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Master Exam *
            </label>
            <select
              required={useMasterExam}
              onChange={handleMasterExamSelect}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
              disabled={loadingMasters}
            >
              <option value="">{loadingMasters ? 'Loading...' : 'Choose a Master Exam'}</option>
              {masterExamsList.map(m => (
                <option key={m.id} value={m.id}>
                  {m.exam_name} ({m.exam_type === 'conduct' ? 'MCQ' : 'Evaluated'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Name *
          </label>
          <input
            type="text"
            value={formData.exam_name}
            onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${useMasterExam ? 'bg-gray-100' : ''}`}
            required
            disabled={useMasterExam}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Marks *
          </label>
          <input
            type="number"
            value={formData.full_marks}
            onChange={(e) => setFormData(prev => ({ ...prev, full_marks: parseFloat(e.target.value) }))}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${useMasterExam ? 'bg-gray-100' : ''}`}
            min="1"
            step="0.1"
            required
            disabled={useMasterExam}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Type *
          </label>
          <select
            value={formData.exam_type}
            onChange={handleTypeChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${useMasterExam ? 'bg-gray-100' : ''}`}
            required
            disabled={useMasterExam}
          >
            <option value="evaluated">Evaluated Exam</option>
            <option value="conduct">Portal MCQ Exam</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Evaluated exams use the current answer-sheet workflow. Portal MCQ exams happen directly in this portal.
          </p>
        </div>

        {formData.exam_type === 'conduct' && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <label className="inline-flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(formData.is_active)}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              Set portal exam active now (students can attempt only when active)
            </label>
          </div>
        )}

      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Exam' : 'Create Exam'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
