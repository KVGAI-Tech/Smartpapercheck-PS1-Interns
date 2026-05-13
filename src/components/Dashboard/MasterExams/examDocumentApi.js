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

export const listExamDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch exam documents');
  const data = await response.json();
  return data?.data || [];
};

export const createExamDocument = async (payload = {}) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to create exam document');
  const data = await response.json();
  return data?.data;
};

export const uploadExamDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/exam-documents/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });
  if (!response.ok) await throwApiError(response, 'Failed to upload exam document');
  const data = await response.json();
  return data?.data;
};

export const uploadExamDocumentImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/exam-documents/images/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });
  if (!response.ok) await throwApiError(response, 'Failed to upload exam document image');
  const data = await response.json();
  return data?.data?.url;
};

export const fetchExamDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch exam document');
  const data = await response.json();
  return data?.data;
};

export const updateExamDocument = async (documentId, payload) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to save exam document');
  const data = await response.json();
  return data?.data;
};

export const parseExamDocument = async (documentId, payload = {}) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}/parse`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to parse exam document');
  const data = await response.json();
  return data?.data;
};

export const publishExamDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to publish exam document');
  const data = await response.json();
  return data?.data;
};

export const attachExamDocumentToCourse = async (documentId, payload) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}/attach-to-course`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to attach exam to course');
  const data = await response.json();
  return data?.data;
};

export const deleteExamDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/exam-documents/${documentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to archive exam document');
  return true;
};

// ==========================================
// MASTER EXAMS WORKSPACE API
// ==========================================

export const uploadWorkspaceDocument = async (masterExamId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/${masterExamId}/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: formData,
  });
  if (!response.ok) await throwApiError(response, 'Failed to upload document to workspace');
  const data = await response.json();
  return data?.data;
};

export const fetchWorkspaceDocuments = async (masterExamId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/${masterExamId}/documents`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch workspace documents');
  const data = await response.json();
  return data?.data || [];
};

export const fetchWorkspaceCards = async (masterExamId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/${masterExamId}/cards`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch workspace question cards');
  const data = await response.json();
  return data?.data || [];
};

export const updateWorkspaceCard = async (cardId, payload) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/cards/${cardId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) await throwApiError(response, 'Failed to update question card');
  const data = await response.json();
  return data?.data;
};

export const deleteWorkspaceCard = async (cardId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/cards/${cardId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to delete question card');
  return true;
};

// ==========================================
// NEW: Reorder, Toggle Select, Lock
// ==========================================

export const reorderWorkspaceCards = async (examDocumentId, cardIds) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/${examDocumentId}/cards/reorder`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ card_ids: cardIds }),
  });
  if (!response.ok) await throwApiError(response, 'Failed to reorder cards');
  return true;
};

export const toggleCardSelection = async (cardId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/cards/${cardId}/toggle-select`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to toggle card selection');
  const data = await response.json();
  return data?.data;
};

export const lockMasterExam = async (examDocumentId, examName = null) => {
  const response = await fetch(`${API_BASE_URL}/master-exams-workspace/${examDocumentId}/lock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ exam_name: examName }),
  });
  if (!response.ok) await throwApiError(response, 'Failed to lock master exam');
  const data = await response.json();
  return data?.data;
};

// ==========================================
// MASTER EXAMS (FINALIZED) API
// ==========================================

export const listMasterExams = async () => {
  const response = await fetch(`${API_BASE_URL}/master-exams/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch finalized master exams');
  const data = await response.json();
  return data?.data || [];
};

export const fetchMasterExamQuestions = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/master-exams/${examId}/questions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await throwApiError(response, 'Failed to fetch master exam questions');
  const data = await response.json();
  return data?.data || [];
};
