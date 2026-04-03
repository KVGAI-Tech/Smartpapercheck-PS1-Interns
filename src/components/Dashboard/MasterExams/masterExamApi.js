import { API_BASE_URL } from '../../../BaseURL';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json',
});

const parseJsonSafely = async (response) => response.json().catch(() => ({}));

const throwApiError = async (response, fallbackMessage) => {
  const err = await parseJsonSafely(response);
  throw new Error(err.message || err.detail || fallbackMessage);
};

export const fetchMasterExams = async () => {
  const response = await fetch(`${API_BASE_URL}/master-exams/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch master exams');
  const data = await response.json();
  return data?.data || [];
};

export const createMasterExam = async (examData) => {
  const response = await fetch(`${API_BASE_URL}/master-exams/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });
  if (!response.ok) await throwApiError(response, 'Failed to create master exam');
  const data = await response.json();
  return data?.data;
};

export const updateMasterExam = async (examId, examData) => {
  const response = await fetch(`${API_BASE_URL}/master-exams/${examId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(examData),
  });
  if (!response.ok) await throwApiError(response, 'Failed to update master exam');
  const data = await response.json();
  return data?.data;
};

export const deleteMasterExam = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams/${examId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to delete master exam');
  return true;
};

export const getMasterExamQuestions = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams/${examId}/questions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) return { questions: [], total_questions: 0 };
    throw new Error('Failed to fetch questions');
  }
  const data = await response.json();
  return data?.data || { questions: [], total_questions: 0 };
};

export const fetchMasterExamFolderContents = async (parentId = null) => {
  const query = parentId != null ? `?parent_id=${encodeURIComponent(parentId)}` : '';
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch folder contents');
  const data = await response.json();
  return data?.data || { parent_id: parentId, breadcrumbs: [], items: [] };
};

export const createMasterExamFolder = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/folder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to create folder');
  const data = await response.json();
  return data?.data;
};

export const createMasterExamNodeExam = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/exam`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to create exam');
  const data = await response.json();
  return data?.data;
};

export const renameMasterExamNode = async (nodeId, name) => {
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/${nodeId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) await throwApiError(response, 'Failed to rename item');
  const data = await response.json();
  return data?.data;
};

export const deleteMasterExamNode = async (nodeId) => {
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/${nodeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to delete item');
  return true;
};

export const moveMasterExamNode = async (nodeId, newParentId) => {
  const response = await fetch(`${API_BASE_URL}/master-exam-nodes/${nodeId}/move`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_parent_id: newParentId }),
  });
  if (!response.ok) await throwApiError(response, 'Failed to move item');
  const data = await response.json();
  return data?.data;
};
