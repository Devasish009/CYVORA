// Centralized API Client Service for CYVORA Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('cyvora_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error?.message || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const apiService = {
  // Dashboard
  getDashboardSummary: () => fetchAPI('/api/v1/dashboard/summary'),

  // Projects
  getProjects: () => fetchAPI('/api/v1/projects'),
  createProject: (data) => fetchAPI('/api/v1/projects', { method: 'POST', body: JSON.stringify(data) }),
  uploadProjectZip: (formData) => {
    const token = localStorage.getItem('cyvora_auth_token');
    return fetch(`${API_BASE_URL}/api/v1/projects/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Upload failed (${res.status})`);
      }
      return res.json();
    });
  },
  getProjectDetails: (id) => fetchAPI(`/api/v1/projects/${id}`),
  deleteProject: (id) => fetchAPI(`/api/v1/projects/${id}`, { method: 'DELETE' }),
  scanProject: (id) => fetchAPI(`/api/v1/projects/${id}/scan`, { method: 'POST' }),

  // Errors
  getProjectErrors: (projectId, severity = 'ALL') => fetchAPI(`/api/v1/projects/${projectId}/errors?severity=${severity}`),

  // Repairs
  getRepairs: (projectId = '') => fetchAPI(`/api/v1/repairs${projectId ? `?project_id=${projectId}` : ''}`),
  getRepairDetails: (id) => fetchAPI(`/api/v1/repairs/${id}`),
  startRepair: (data) => fetchAPI('/api/v1/repairs', { method: 'POST', body: JSON.stringify(data) }),

  // Test Runs & Activity Logs
  getTestRuns: () => fetchAPI('/api/v1/test-runs'),
  getActivityLogs: () => fetchAPI('/api/v1/activity-logs'),

  // Hindsight Memory
  getHindsightRecords: () => fetchAPI('/api/v1/hindsight/records'),
  recallHindsight: (query) => fetchAPI('/api/v1/hindsight/recall', { method: 'POST', body: JSON.stringify(query) }),
  getHindsightReflect: () => fetchAPI('/api/v1/hindsight/reflect'),

  // Runbooks
  getRunbooks: () => fetchAPI('/api/v1/runbooks'),
  getRunbookDetails: (id) => fetchAPI(`/api/v1/runbooks/${id}`),
};

export default apiService;
