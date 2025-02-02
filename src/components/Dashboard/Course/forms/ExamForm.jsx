import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import EvaluationModal from '../modals/EvaluationModal';

const ExamForm = ({ initialData, onSubmit, instructors, teachingAssistants }) => {
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [formData, setFormData] = useState(initialData || {
    name: '',
    date: '',
    duration: '',
    maxMarks: '',
    type: 'Written',
    syllabus: '',
    status: 'Scheduled',
    questionBreakdown: {
      mcq: 0,
      shortAnswer: 0,
      longAnswer: 0,
      programming: 0,
      debugging: 0
    }
  });

  const createPayload = () => {
    return {
        examDetails: {
          name: formData.name,
          date: formData.date,
          duration: parseInt(formData.duration),
          maxMarks: parseInt(formData.maxMarks),
          type: formData.type,
          syllabus: formData.syllabus,
          status: formData.status
        },
        questionBreakdown: formData.questionBreakdown,
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          totalQuestions: Object.values(formData.questionBreakdown).reduce((a, b) => a + b, 0)
        }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = createPayload();
      
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam data');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      onSubmit(formData);

    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluate = () => {
    setShowEvaluationModal(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Marks *
            </label>
            <input
              type="number"
              value={formData.maxMarks}
              onChange={(e) => setFormData({...formData, maxMarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Written">Written</option>
              <option value="Practical">Practical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Syllabus Coverage
            </label>
            <input
              type="text"
              value={formData.syllabus}
              onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Question Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(formData.type === 'Written' || formData.type === 'Mixed') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MCQ Questions
                  </label>
                  <input
                    type="number"
                    value={formData.questionBreakdown.mcq}
                    onChange={(e) => setFormData({
                      ...formData,
                      questionBreakdown: {
                        ...formData.questionBreakdown,
                        mcq: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Answer Questions
                  </label>
                  <input
                    type="number"
                    value={formData.questionBreakdown.shortAnswer}
                    onChange={(e) => setFormData({
                      ...formData,
                      questionBreakdown: {
                        ...formData.questionBreakdown,
                        shortAnswer: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Answer Questions
                  </label>
                  <input
                    type="number"
                    value={formData.questionBreakdown.longAnswer}
                    onChange={(e) => setFormData({
                      ...formData,
                      questionBreakdown: {
                        ...formData.questionBreakdown,
                        longAnswer: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </>
            )}

            {(formData.type === 'Practical' || formData.type === 'Mixed') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Programming Questions
                  </label>
                  <input
                    type="number"
                    value={formData.questionBreakdown.programming}
                    onChange={(e) => setFormData({
                      ...formData,
                      questionBreakdown: {
                        ...formData.questionBreakdown,
                        programming: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debugging Questions
                  </label>
                  <input
                    type="number"
                    value={formData.questionBreakdown.debugging}
                    onChange={(e) => setFormData({
                      ...formData,
                      questionBreakdown: {
                        ...formData.questionBreakdown,
                        debugging: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {initialData && (
            <button
              type="button"
              onClick={handleEvaluate}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Evaluate</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? 'Submitting...' 
              : initialData ? 'Update Exam' : 'Schedule Exam'
            }
          </button>
        </div>
      </form>

      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        exam={formData}
        instructors={instructors || []}
        teachingAssistants={teachingAssistants || []}
      />
    </>
  );
};

export default ExamForm;