import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

const ExamForm = ({ 
  initialData = null,
  onSubmit,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    exam_name: initialData?.exam_name || '',
    full_marks: initialData?.full_marks || '',
    allow_recheck: true,
    max_recheck_attempts: 1
  });

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Name *
          </label>
          <input
            type="text"
            value={formData.exam_name}
            onChange={(e) => setFormData(prev => ({ ...prev, exam_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            step="0.1"
            required
          />
        </div>

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