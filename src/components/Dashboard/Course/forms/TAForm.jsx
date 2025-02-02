import React, { useState } from 'react';

const TAForm = ({ initialData, onSubmit, sections }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState(initialData || {
    name: '',
    email: '',
    studentId: '',
    phoneNumber: '',
    sections: [],
    experience: 1,
    department: 'Computer Science',
    cgpa: '',
    availableHours: 10,
    status: 'active'
  });

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\+?[0-9]{10,12}$/;
    return !phone || regex.test(phone.replace(/\s+/g, ''));
  };

  const validateStudentId = (id) => {
    const regex = /^[0-9]{4}[A-Z]{4}[0-9]{4}$/;
    return regex.test(id);
  };

  const createPayload = () => {
    return {
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId,
          phoneNumber: formData.phoneNumber,
          sections: formData.sections,
          experience: formData.experience,
          department: formData.department,
          cgpa: parseFloat(formData.cgpa) || null,
          availableHours: formData.availableHours,
          status: formData.status
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.sections.length === 0) {
      setApiError('Please select at least one section');
      return;
    }

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
        throw new Error(`Failed to submit TA data: ${response.statusText}`);
      }

      const data = await response.json();
      onSubmit(formData, data);

    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e, field, type = 'text') => {
    let value = e.target.value;
    
    if (type === 'number') {
      value = e.target.value === '' ? '' : Number(e.target.value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    setApiError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
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
            placeholder="e.g., 2021A7PS0001"
          />
          {formData.studentId && !validateStudentId(formData.studentId) && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid student ID (e.g., 2021A7PS0001)
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
          />
          {formData.email && !validateEmail(formData.email) && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid email address
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange(e, 'phoneNumber')}
            placeholder="+91 "
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
              ${validatePhone(formData.phoneNumber) ? 'border-gray-300' : 'border-red-300'}`}
          />
          {formData.phoneNumber && !validatePhone(formData.phoneNumber) && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid phone number
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange(e, 'department')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Chemical">Chemical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CGPA
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={formData.cgpa}
            onChange={(e) => handleInputChange(e, 'cgpa', 'number')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter CGPA (0-10)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience (Semesters)
          </label>
          <select
            value={formData.experience}
            onChange={(e) => handleInputChange(e, 'experience', 'number')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num}>{num} semester{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Hours/Week
          </label>
          <input
            type="number"
            min="1"
            max="40"
            value={formData.availableHours}
            onChange={(e) => handleInputChange(e, 'availableHours', 'number')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigned Sections *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sections.map(section => (
            <label key={section} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.sections.includes(section)}
                onChange={(e) => {
                  const updatedSections = e.target.checked
                    ? [...formData.sections, section]
                    : formData.sections.filter(s => s !== section);
                  setFormData({ ...formData, sections: updatedSections });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{section}</span>
            </label>
          ))}
        </div>
        {formData.sections.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Please select at least one section</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange(e, 'status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
            initialData ? 'Update TA' : 'Add TA'
          )}
        </button>
      </div>
    </form>
  );
};

export default TAForm;