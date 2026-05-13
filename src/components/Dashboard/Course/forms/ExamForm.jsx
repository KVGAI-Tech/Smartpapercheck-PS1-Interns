import React, { useState } from 'react';
import { AlertCircle, Loader, Plus, Trash2, Brain, ClipboardList, FileText } from 'lucide-react';

import { getExamVariant } from '../../../examTypeUtils';

const toDatetimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  
  // Return the datetime as-is for datetime-local input (no timezone conversion)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fromDatetimeLocalToISO = (datetimeLocalValue) => {
  if (!datetimeLocalValue) return null;
  
  // NO TIMEZONE CONVERSION - Send datetime as-is to backend
  // Backend will treat it as IST (naive datetime)
  // Input: "2026-04-17T13:00" -> Output: "2026-04-17T13:00:00" (no Z suffix)
  
  const [datePart, timePart] = datetimeLocalValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Create ISO string WITHOUT 'Z' suffix (naive datetime, treated as IST by backend)
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  return isoString;
};



const ExamForm = ({
  initialData = null,
  onSubmit,
  onClose,
}) => {
  const initialExamType = initialData ? getExamVariant(initialData) : 'evaluated';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    exam_name: initialData?.exam_name || '',
    full_marks: initialData?.full_marks || '',
    exam_type: initialExamType,
    is_active: initialData?.is_active ?? (initialExamType === 'conduct' ? true : false),
    allow_recheck: true,
    max_recheck_attempts: 1,
    start_time: toDatetimeLocalValue(initialData?.start_time),
    end_time: toDatetimeLocalValue(initialData?.end_time),
    duration_minutes: initialData?.duration || '',
  });

  const isSubjectiveConduct = formData.exam_type === 'conduct';
  const isPortalMcq = formData.exam_type === 'portal_mcq';

  const handleTypeChange = (e) => {
      const newType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      exam_type: newType,
      is_active: newType === 'conduct' ? true : (initialData ? prev.is_active : false),
    }));
  };

  // Questions state removed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.exam_name.trim() || formData.full_marks === '' || Number.isNaN(Number(formData.full_marks))) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      exam_name: formData.exam_name.trim(),
      full_marks: Number(formData.full_marks),
      exam_type: formData.exam_type,
      exam_mode: formData.exam_type === 'conduct' ? 'online' : 'offline',
      is_active: Boolean(formData.is_active),
      allow_recheck: formData.allow_recheck,
      max_recheck_attempts: formData.max_recheck_attempts,
    };

    if (isPortalMcq) {
      payload.conduct_variant = 'portal_mcq';
    }

    if (isSubjectiveConduct) {
      if (!formData.start_time || !formData.end_time) {
        setError('Start time and end time are required for conduct exams');
        return;
      }

      // NO TIMEZONE CONVERSION - Send datetime as-is (treated as IST by backend)
      const startISO = fromDatetimeLocalToISO(formData.start_time);
      const endISO = fromDatetimeLocalToISO(formData.end_time);
      
      if (!startISO || !endISO) {
        setError('Invalid date/time format');
        return;
      }
      
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);
      
      // Validate: end must be after start
      if (endDate <= startDate) {
        setError('End time must be after start time. Please check your selected times.');
        return;
      }
      
      // Validate: at least 30 minutes duration
      const durationMinutes = (endDate - startDate) / (1000 * 60);
      if (durationMinutes < 30) {
        setError('Exam duration must be at least 30 minutes');
        return;
      }

      payload.start_time = startISO;
      payload.end_time = endISO;
      payload.duration_minutes = formData.duration_minutes === '' ? null : Number(formData.duration_minutes);
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(payload);
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
            onChange={(e) => setFormData((prev) => ({ ...prev, exam_name: e.target.value }))}
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
            onChange={(e) => setFormData((prev) => ({ ...prev, full_marks: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Exam Type *
          </label>
          <div className="exam-type-container">
            {[
              {
                value: 'evaluated',
                label: 'Offline Exam',
                icon: Brain
              },
              {
                value: 'conduct',
                label: 'Online Exam',
                icon: FileText
              }
            ].map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.value}
                  className={`exam-card ${formData.exam_type === type.value ? 'active' : ''}`}
                  onClick={() => {
                    const newType = type.value;
                    setFormData((prev) => ({
                      ...prev,
                      exam_type: newType,
                      is_active: newType === 'conduct' ? true : (initialData ? prev.is_active : false),
                    }));
                  }}
                >
                  <div className="exam-card-icon">
                    <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div className="exam-card-title">{type.label}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Offline exams keep the current answer-sheet workflow. Online exams stay fully inside the portal.
          </p>
        </div>

        {isPortalMcq && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <label className="inline-flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(formData.is_active)}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              Publish this portal exam now
            </label>
          </div>
        )}

        {isSubjectiveConduct && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time (IST) *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            {formData.start_time && formData.end_time && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Exam Window (IST):</strong> {
                    (() => {
                      // NO CONVERSION - Display times as-is (IST)
                      const startISO = fromDatetimeLocalToISO(formData.start_time);
                      const endISO = fromDatetimeLocalToISO(formData.end_time);
                      
                      if (!startISO || !endISO) return 'Invalid times';
                      
                      const start = new Date(startISO);
                      const end = new Date(endISO);
                      const duration = Math.round((end - start) / (1000 * 60));
                      
                      if (end <= start) {
                        return <span className="text-red-600">⚠️ End time must be after start time!</span>;
                      }
                      
                      return `${duration} minutes (${Math.floor(duration / 60)}h ${duration % 60}m)`;
                    })()
                  }
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  All times are in Indian Standard Time (IST) - No timezone conversions
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. If set, each student’s attempt is capped by this duration even before the global end time.
              </p>
            </div>
          </>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
