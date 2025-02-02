import React, { useState } from 'react';

const StudentForm = ({ initialData, onSubmit, sections }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState(initialData || {
    name: '',
    studentId: '',
    email: '',
    section: sections[0]
  });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateStudentId = (id) => {
    const regex = /^[0-9]{4}[A-Z]{2}[0-9]{4}$/;
    return regex.test(id);
  };

  const createPayload = () => {
    return {
          name: formData.name,
          studentId: formData.studentId,
          email: formData.email,
          section: formData.section
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
        throw new Error(`Failed to submit student data: ${response.statusText}`);
      }

      const data = await response.json();
      onSubmit(formData, data);

    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    setApiError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange(e, 'name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student ID *
        </label>
        <input
          type="text"
          value={formData.studentId}
          onChange={(e) => handleInputChange(e, 'studentId')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${!formData.studentId || validateStudentId(formData.studentId) 
              ? 'border-gray-300' 
              : 'border-red-300'}`}
          required
          pattern="[0-9]{4}[A-Z]{2}[0-9]{4}"
          placeholder="e.g., 2024CS1234"
        />
        {formData.studentId && !validateStudentId(formData.studentId) && (
          <p className="mt-1 text-sm text-red-500">
            Please enter a valid student ID (e.g., 2024CS1234)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange(e, 'email')}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${!formData.email || validateEmail(formData.email) 
              ? 'border-gray-300' 
              : 'border-red-300'}`}
          required
          pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
        />
        {formData.email && !validateEmail(formData.email) && (
          <p className="mt-1 text-sm text-red-500">
            Please enter a valid email address
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section *
        </label>
        <select
          value={formData.section}
          onChange={(e) => handleInputChange(e, 'section')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          {sections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${isSubmitting ? 'bg-blue-400' : ''}`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            initialData ? 'Update Student' : 'Add Student'
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;