import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock3, X } from 'lucide-react';

import { API_BASE_URL } from '../../../BaseURL';

const AttachExamModal = ({ isOpen, onClose, onSubmit, documentTitle, isSubmitting }) => {
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    exam_name: documentTitle || '',
    start_time: '',
    duration_minutes: '',
    is_active: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      course_id: '',
      exam_name: documentTitle || '',
      start_time: '',
      duration_minutes: '',
      is_active: false,
    });
  }, [documentTitle, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await fetch(`${API_BASE_URL}/professors/courses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || data.detail || 'Failed to load courses');
        }
        if (!cancelled) {
          setCourses(Array.isArray(data?.data) ? data.data : []);
        }
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setIsLoadingCourses(false);
      }
    };
    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.course_id) return;
    await onSubmit({
      ...formData,
      course_id: Number(formData.course_id),
      duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
      start_time: formData.start_time || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attach Exam to Course</h3>
            <p className="mt-1 text-sm text-gray-500">Create a live course exam from this published document.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Course</label>
            <select
              value={formData.course_id}
              onChange={(event) => setFormData((prev) => ({ ...prev, course_id: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            >
              <option value="">{isLoadingCourses ? 'Loading courses...' : 'Select a course'}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_name} ({course.course_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Exam Name</label>
            <input
              type="text"
              value={formData.exam_name}
              onChange={(event) => setFormData((prev) => ({ ...prev, exam_name: event.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Start Time</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(event) => setFormData((prev) => ({ ...prev, start_time: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, duration_minutes: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            Activate exam immediately
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Attaching...' : 'Attach to Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttachExamModal;
