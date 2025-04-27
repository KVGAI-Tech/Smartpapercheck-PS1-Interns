import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

const INSTRUCTOR_ROLES = [
  { value: 'Professor', label: 'Professor' },
  { value: 'Associate Professor', label: 'Associate Professor' },
  { value: 'Assistant Professor', label: 'Assistant Professor' },
  { value: 'Visiting Faculty', label: 'Visiting Faculty' }
];

const InstructorForm = ({ 
  initialData = null,
  onSubmit = () => {},
  onClose = () => {}
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    office: '',
    officeHours: '',
    expertise: '',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: '',
        email: '',
        role: '',
        office: '',
        officeHours: '',
        expertise: '',
        ...initialData
      });
    }
  }, [initialData]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.office && formData.office.length > 100) {
      newErrors.office = 'Office location must be less than 100 characters';
    }

    if (formData.officeHours && formData.officeHours.length > 100) {
      newErrors.officeHours = 'Office hours must be less than 100 characters';
    }

    if (formData.expertise && formData.expertise.length > 500) {
      newErrors.expertise = 'Expertise must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      
      const submitData = {
        ...formData,
        email: formData.email.toLowerCase()
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{errors.submit}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
          required
          placeholder="Enter instructor's full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
          required
          placeholder="Enter instructor's email address"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role *
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.role ? 'border-red-300' : 'border-gray-300'}`}
          required
        >
          <option value="">Select Role</option>
          {INSTRUCTOR_ROLES.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.role}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Office Location
        </label>
        <input
          type="text"
          name="office"
          value={formData.office}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.office ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="e.g., Room 301, CS Building"
        />
        {errors.office && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.office}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Office Hours
        </label>
        <input
          type="text"
          name="officeHours"
          value={formData.officeHours}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.officeHours ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="e.g., Mon-Wed 2-4 PM"
        />
        {errors.officeHours && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.officeHours}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Areas of Expertise
        </label>
        <textarea
          name="expertise"
          value={formData.expertise}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.expertise ? 'border-red-300' : 'border-gray-300'}`}
          rows={3}
          placeholder="Enter areas of expertise, separated by commas"
        />
        {errors.expertise && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.expertise}
          </p>
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
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Instructor' : 'Add Instructor'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default InstructorForm;