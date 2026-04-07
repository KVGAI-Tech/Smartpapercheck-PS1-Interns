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
