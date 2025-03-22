import { API_BASE_URL } from '../../../BaseURL';
export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(!options.formData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.detail || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const getCourseDetails = async (courseId) => {
  try {
    const response = await fetchApi(`/professors/courses`);
    if (!response || !response.data) {
      throw new Error('Invalid response data');
    }
    const course = response.data.find(c => c.id.toString() === courseId.toString());
    if (!course) {
      throw new Error('Course not found');
    }
    return {
      code: 200,
      message: "Course retrieved successfully",
      data: course
    };
  } catch (error) {
    console.error('Error getting course details:', error);
    throw error;
  }
};

export const getCourseStudents = async (courseId) => {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    return fetchApi(`/professors/courses/${courseId}/students`);
  };
  
  export const addStudent = async (data) => {
    if (!data || !data.name || !data.email) {
      throw new Error('Invalid student data');
    }
    const { courseId, name, email, roll_number, batch } = data;
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    return fetchApi(`/professors/students?course_id=${courseId}`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        roll_number: roll_number || '',
        batch: batch || ''
      })
    });
  };
    export const removeStudent = async (courseId, studentId) => {
    if (!courseId || !studentId) {
      throw new Error('Course ID and Student ID are required');
    }
    return fetchApi(`/professors/courses/${courseId}/students/${studentId}`, {
      method: 'DELETE'
    });
  };
  
  export const uploadStudents = async (courseId, file) => {
    if (!courseId || !file) {
      throw new Error('Course ID and file are required');
    }
    const formData = new FormData();
    formData.append('student_list', file);
    return fetchApi(`/professors/courses/${courseId}/upload-students`, {
      method: 'POST',
      formData: true,
      body: formData
    });
  };
  
    
export const getCourseTAs = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }
  const response = await fetchApi(`/professors/courses/${courseId}/tas`);
  return response.data || [];
};

export const addTA = async (courseId, data) => {
  if (!courseId || !data) {
    throw new Error('Course ID and TA data are required');
  }
  if (!data.name || !data.email || !data.department) {
    throw new Error('Name, email, and department are required for TA');
  }
  const response = await fetchApi(`/professors/tas?course_id=${courseId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.data;
};

export const removeTA = async (courseId, taId) => {
  if (!courseId || !taId) {
    throw new Error('Course ID and TA ID are required');
  }
  await fetchApi(`/professors/courses/${courseId}/tas/${taId}`, {
    method: 'DELETE'
  });
  return true;
};

export const uploadTAs = async (courseId, file) => {
  if (!courseId || !file) {
    throw new Error('Course ID and file are required');
  }
  const formData = new FormData();
  formData.append('ta_list', file);
  const response = await fetchApi(`/professors/courses/${courseId}/tas/upload`, {
    method: 'POST',
    formData: true,
    body: formData
  });
  return response;
};

export const getCourseExams = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }
  return fetchApi(`/professors/courses/${courseId}/exams`);
};

export const createExam = async (courseId, data) => {
  if (!courseId || !data) {
    throw new Error('Course ID and exam data are required');
  }
  return fetchApi(`/professors/courses/${courseId}/exams/`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const uploadCourseHandout = async (courseId, file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  const formData = new FormData();
  formData.append('course_handout', file);
  return fetchApi(`/professors/courses/${courseId}/handout`, {
    method: 'POST',
    formData: true,
    body: formData
  });
};

export const checkUploadStatus = async (uploadId) => {
  if (!uploadId) {
    throw new Error('Upload ID is required');
  }
  return fetchApi(`/professors/uploads/${uploadId}`);
};

export const pollUploadStatus = (uploadId, onComplete, onError) => {
  if (!uploadId) {
    throw new Error('Upload ID is required');
  }
  let attempts = 0;
  const MAX_ATTEMPTS = 30;
  
  const pollInterval = setInterval(async () => {
    try {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollInterval);
        onError('Upload status check timed out');
        return;
      }

      const response = await checkUploadStatus(uploadId);
      if (response.data.status === 'completed') {
        clearInterval(pollInterval);
        onComplete(response.data);
      } else if (response.data.status === 'failed') {
        clearInterval(pollInterval);
        onError(response.data.error_message || 'Upload failed');
      }
    } catch (error) {
      clearInterval(pollInterval);
      onError(error.message);
    }
  }, 2000);

  return () => clearInterval(pollInterval);
};