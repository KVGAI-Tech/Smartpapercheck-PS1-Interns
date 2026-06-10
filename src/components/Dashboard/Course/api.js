import { API_BASE_URL } from '../../../BaseURL';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    const apiUrl = `${API_BASE_URL}${endpoint}`;
    console.log('Fetching from:', apiUrl);
    const response = await fetch(apiUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...(!options.formData ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Request failed with status ${response.status}` 
      }));
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
  if (!courseId) {
    throw new Error('Course ID is required');
  }
  try {
    // Single-course endpoint: avoids downloading the entire active (and archived)
    // course list just to locate one course. One round-trip instead of one/two
    // full-list fetches.
    const response = await fetchApi(`/professors/courses/${courseId}`);
    if (response && response.data) {
      return response;
    }
    throw new Error('Course not found');
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
    const { courseId, name, email, roll_number, batch, tut_section } = data;
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    return fetchApi(`/professors/students?course_id=${courseId}`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        roll_number: roll_number || '',
        batch: batch || '',
        tut_section: tut_section || ''
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

export const getConductExamAnalytics = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/analytics`);
};

export const getConductExamResults = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/results`);
};

export const getConductExamStudentAnswers = async (examId, studentId) => {
  if (!examId || !studentId) {
    throw new Error('Exam ID and Student ID are required');
  }
  return fetchApi(`/exams/${examId}/students/${studentId}/answers`);
};

export const getConductExamQuestions = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/question-answer`);
};

export const createExam = async (courseId, data) => {
  if (!courseId || !data) {
    throw new Error('Course ID and exam data are required');
  }
  if (data.exam_type === 'conduct') {
    return fetchApi(`/professors/courses/${courseId}/conduct-exams`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  const payload = {
    ...data,
    exam_type: data.exam_type === 'portal_mcq' ? 'conduct' : data.exam_type,
    conduct_variant: data.exam_type === 'portal_mcq' ? 'portal_mcq' : data.conduct_variant,
  };

  return fetchApi(`/professors/courses/${courseId}/exams`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const publishConductExam = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/publish`, {
    method: 'POST',
  });
};

export const getSubjectiveConductSubmissions = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/submissions`);
};

export const getSubjectiveConductSubmissionDetail = async (submissionId) => {
  if (!submissionId) {
    throw new Error('Submission ID is required');
  }
  return fetchApi(`/exams/conduct-exams/submissions/${submissionId}`);
};

export const evaluateSubjectiveConductSubmission = async (submissionId, answers) => {
  if (!submissionId) {
    throw new Error('Submission ID is required');
  }
  return fetchApi(`/exams/conduct-exams/submissions/${submissionId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
};

export const addConductExamQuestion = async (examId, questionData) => {
  if (!examId || !questionData) {
    throw new Error('Exam ID and question data are required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/questions`, {
    method: 'POST',
    body: JSON.stringify(questionData),
  });
};

export const updateConductQuestion = async (examId, questionId, questionData) => {
  if (!examId || !questionId || !questionData) {
    throw new Error('Exam ID, question ID and question data are required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(questionData),
  });
};



export const listConductExamQuestions = async (examId) => {
  if (!examId) {
    throw new Error('Exam ID is required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/questions`);
};

export const deleteConductExamQuestion = async (examId, questionId) => {
  if (!examId || !questionId) {
    throw new Error('Exam ID and question ID are required');
  }
  return fetchApi(`/exams/${examId}/conduct-exams/questions/${questionId}`, {
    method: 'DELETE',
  });
};

export const deleteExamQuestion = async (examId, questionNumber) => {
  if (!examId || !questionNumber) {
    throw new Error('Exam ID and question number are required');
  }
  return fetchApi(`/exams/${examId}/questions/${questionNumber}`, {
    method: 'DELETE',
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

export const pollUploadStatus = (uploadId, onProgress, onComplete, onError) => {
  if (!uploadId) {
    throw new Error('Upload ID is required');
  }
  const MAX_DURATION_MS = 20 * 60 * 1000; // 20 minutes
  const startedAt = Date.now();
  
  const pollInterval = setInterval(async () => {
    try {
      if (Date.now() - startedAt >= MAX_DURATION_MS) {
        clearInterval(pollInterval);
        onError('Upload is taking longer than expected. Please check again shortly.');
        return;
      }

      const response = await checkUploadStatus(uploadId);
      if (response.data.status === 'completed') {
        clearInterval(pollInterval);
        onComplete(response.data);
      } else if (response.data.status === 'failed') {
        clearInterval(pollInterval);
        onError(response.data.error_message || 'Upload failed');
      } else if (response.data.status === 'processing') {
        onProgress?.(response.data.processed_count || 0);
      }
    } catch (error) {
      // Keep polling on transient failures.
      console.warn('Upload status poll error, retrying:', error);
    }
  }, 2000);

  return () => clearInterval(pollInterval);
};

export const updateStudent = async (data) => {
  if (!data || !data.id) {
    throw new Error('Student ID is required for update');
  }
  if (!data.courseId) {
    throw new Error('Course ID is required for update');
  }
  if (!data.name || !data.email) {
    throw new Error('Invalid student data');
  }
  const { id, courseId, name, email, roll_number, batch, tut_section } = data;
  
  return fetchApi(`/professors/courses/${courseId}/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name,
      email,
      roll_number: roll_number || '',
      batch: batch || '',
      tut_section: tut_section || ''
    })
  });
};
export const getFinalizedExamPapers = async () => {
  return fetchApi('/exam-papers');
};

export const importExamPaper = async (examId, paperId) => {
  return fetchApi(`/exams/${examId}/import-paper/${paperId}`, {
    method: 'POST'
  });
};
