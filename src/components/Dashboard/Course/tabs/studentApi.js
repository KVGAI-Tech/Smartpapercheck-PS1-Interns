import { fetchApi } from '../api';

const handleApiError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  if (error.status === 'error' && error.message) {
    return new Error(error.message);
  }
  if (error.status_code) {
    return new Error(`Request failed with status ${error.status_code}`);
  }
  return new Error('An unexpected error occurred');
};

export const studentApi = {
  getStudents: async (courseId) => {
    try {
      if (!courseId) throw new Error('Course ID is required');
      const response = await fetchApi(`/professors/courses/${courseId}/students`);
      
      if (response.code === 200 && response.data) {
        console.log("API response:", response);
        return response.data;
      }
      
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  addStudent: async (data) => {
    try {
      if (!data.name || !data.email || !data.roll_number || !data.batch) {
        throw new Error('Please fill in all required fields');
      } 
      const response = await fetchApi('/professors/students', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          roll_number: data.roll_number,
          batch: data.batch,
          tut_section: data.tut_section
        })
      });
      if (response.code === 201 || response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to add student');
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  updateStudent: async (data) => {
    try {
      if (!data.id) {
        throw new Error('Student ID is required for updating');
      }
      if (!data.name || !data.email || !data.roll_number || !data.batch) {
        throw new Error('Please fill in all required fields');
      } 
      
      const response = await fetchApi(`/professors/students/${data.id}`, {
        method: 'PATCH', 
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          roll_number: data.roll_number,
          batch: data.batch,
          tut_section: data.tut_section
        })
      });
      
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update student');
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  removeStudent: async (courseId, studentId) => {
    try {
      if (!courseId || !studentId) {
        throw new Error('Course ID and Student ID are required');
      }
      const response = await fetchApi(`/professors/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE'
      });
      if (response.code === 200) {
        return true;
      }
      throw new Error(response.message || 'Failed to remove student');
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  uploadStudents: async (courseId, file) => {
    try {
      if (!courseId || !file) {
        throw new Error('Course ID and file are required');
      }
      const formData = new FormData();
      formData.append('student_list', file);
      const response = await fetchApi(`/professors/courses/${courseId}/upload-students`, {
        method: 'POST',
        formData: true,
        body: formData
      });
      if (response.code === 202) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to upload students');
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  checkUploadStatus: async (uploadId) => {
    try {
      if (!uploadId) {
        throw new Error('Upload ID is required');
      }
      const response = await fetchApi(`/professors/uploads/${uploadId}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to check upload status');
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  pollUploadStatus: (uploadId, onProgress, onComplete, onError) => {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }
    const MAX_DURATION_MS = 20 * 60 * 1000; // 20 minutes
    const startedAt = Date.now();
    const POLL_INTERVAL = 2000; 
    const pollInterval = setInterval(async () => {
      try {
        if (Date.now() - startedAt >= MAX_DURATION_MS) {
          clearInterval(pollInterval);
          onError(new Error('Upload is taking longer than expected. Please check again shortly.'));
          return;
        }
        const status = await studentApi.checkUploadStatus(uploadId);
        switch (status.status) {
          case 'completed':
            clearInterval(pollInterval);
            onComplete(status);
            break;
          case 'failed':
            clearInterval(pollInterval);
            onError(new Error(status.error_message || 'Upload failed'));
            break;
          case 'processing':
            onProgress?.(status.processed_count || 0);
            break;
          default:
            console.warn('Unknown upload status:', status);
        }
      } catch (error) {
        // Keep polling on transient failures.
        console.warn('Upload status poll error, retrying:', error);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(pollInterval);
  }
};

export default studentApi;
