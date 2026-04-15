import { API_BASE_URL } from '../BaseURL';

const resolveApiErrorMessage = async (response, fallbackMessage) => {
  const errorData = await response.json().catch(() => ({}));
  return (
    errorData?.message ||
    errorData?.detail ||
    errorData?.error ||
    fallbackMessage
  );
};

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
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load exams. Please try again later.')
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching course exams:', error);
      throw error;
    }
  },

  getAllExams: async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/students/all-exams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load exams. Please try again later.')
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all exams:', error);
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
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load exam details. Please try again later.')
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw error;
    }
  },

  getConductExamQuestions: async (examId) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-questions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load conducted exam questions.')
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conducted exam questions:', error);
      throw error;
    }
  },

  submitConductExam: async (examId, answers) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to submit conducted exam.')
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting conducted exam:', error);
      throw error;
    }
  },

  startSubjectiveConductExam: async (examId, sessionId) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-exams/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(response, 'Unable to start conduct exam.')
      );
    }

    return response.json();
  },

  getSubjectiveConductExamSession: async (examId, sessionId) => {
    const token = localStorage.getItem('accessToken');
    const url = new URL(`${API_BASE_URL}/students/exams/${examId}/conduct-exams/session`);
    if (sessionId) {
      url.searchParams.set('session_id', sessionId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(response, 'Unable to load conduct exam session.')
      );
    }

    return response.json();
  },

  saveSubjectiveConductAnswers: async (examId, sessionId, answers) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-exams/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ session_id: sessionId, answers }),
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(response, 'Unable to save conduct exam answers.')
      );
    }

    return response.json();
  },

  uploadSubjectiveConductAnswerImage: async (examId, questionId, sessionId, file) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('image_file', file);

    const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-exams/questions/${questionId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(response, 'Unable to upload conduct exam answer image.')
      );
    }

    return response.json();
  },

  submitSubjectiveConductExam: async (examId, sessionId) => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/students/exams/${examId}/conduct-exams/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(
        await resolveApiErrorMessage(response, 'Unable to submit conduct exam.')
      );
    }

    return response.json();
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
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to submit recheck request. Please try again later.')
        );
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
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load courses. Please try again later.')
        );
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
        throw new Error(
          await resolveApiErrorMessage(response, 'Unable to load recheck history. Please try again later.')
        );
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
