import { API_BASE_URL } from '../BaseURL';


export const examsApi = {
  
  getCourseExams: async (courseId) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/courses/${courseId}/exams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to load exams. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching course exams:', error);
      throw error;
    }
  },
  
  
  getExamDetails: async (examId, enrollmentId) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${examId}/answer-sheets/${enrollmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to load exam details. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw error;
    }
  },
  
  
  submitRecheckRequest: async (examId, data) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/request-recheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to submit recheck request. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting recheck request:', error);
      throw error;
    }
  },
  
  
  getCourses: async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to load courses. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },
  
  
  getRecheckHistory: async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/recheck-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to load recheck history. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching recheck history:', error);
      throw error;
    }
  }
};

export default {
  examsApi
};