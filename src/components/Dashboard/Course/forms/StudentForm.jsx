import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

const StudentForm = ({ 
  initialData = null,
  sections = [], 
  onSubmit = () => {},
  onClose = () => {}
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    batch: '',
    tut_section: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.user_name || '',
        roll_number: initialData.roll_number || '',
        email: initialData.user_email || '',
        batch: initialData.batch || '',
        tut_section: initialData.tut_section || '',
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
    }

    if (!formData.roll_number) {
      newErrors.roll_number = 'Roll number is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.batch) {
      newErrors.batch = 'Batch is required';
    }

    if (!formData.tut_section) {
      newErrors.tut_section = 'Section is required';
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
        name: formData.name,
        email: formData.email,
        roll_number: formData.roll_number,
        batch: formData.batch,
        tut_section: formData.tut_section
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
          placeholder="Enter student's full name"
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
          Roll Number *
        </label>
        <input
          type="text"
          name="roll_number"
          value={formData.roll_number}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.roll_number ? 'border-red-300' : 'border-gray-300'}`}
          required
          placeholder="Enter roll number"
        />
        {errors.roll_number && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.roll_number}
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
          placeholder="Enter student's email address"
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
          Batch *
        </label>
        <input
          type="text"
          name="batch"
          value={formData.batch}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.batch ? 'border-red-300' : 'border-gray-300'}`}
          required
          placeholder="Enter batch (e.g., 2024)"
        />
        {errors.batch && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.batch}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section *
        </label>
        <input
          type="text"
          name="tut_section"
          value={formData.tut_section}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
            ${errors.tut_section ? 'border-red-300' : 'border-gray-300'}`}
          required
          placeholder="Enter section (e.g., T1)"
        />
        {errors.tut_section && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.tut_section}
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
            <span>{initialData ? 'Update Student' : 'Add Student'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;