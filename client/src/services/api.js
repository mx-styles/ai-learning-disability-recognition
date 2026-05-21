import axios from 'axios';

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  return 'http://localhost:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let unauthorizedHandler = null;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler(error);
    }
    return Promise.reject(error);
  }
);

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const setApiToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('auth_token');
};

const storedToken = getStoredToken();
if (storedToken) {
  setApiToken(storedToken);
}

// Student API
export const studentAPI = {
  getAll: (params) => apiClient.get('/students', { params }),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getHistory: (id) => apiClient.get(`/students/${id}/history`),
};

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  listUsers: () => apiClient.get('/auth/users'),
  createUser: (data) => apiClient.post('/auth/users', data),
  updateUser: (id, data) => apiClient.put(`/auth/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/auth/users/${id}`),
};

// Assessment API
export const assessmentAPI = {
  start: (data) => apiClient.post('/assessments/start', data),
  submitTask: (sessionId, data) => apiClient.post(`/assessments/${sessionId}/task`, data),
  complete: (sessionId) => apiClient.post(`/assessments/${sessionId}/complete`),
  getSession: (sessionId) => apiClient.get(`/assessments/${sessionId}`),
  getTaskDefinitions: (disabilityCategory) => 
    apiClient.get(`/assessments/tasks/${disabilityCategory}`),
};

// Analysis API
export const analysisAPI = {
  process: (sessionId) => apiClient.post(`/analysis/process/${sessionId}`),
  getResults: (sessionId) => apiClient.get(`/analysis/session/${sessionId}/results`),
  getStudentProgress: (studentId) => apiClient.get(`/analysis/student/${studentId}/progress`),
  ruleScreen: (data) => apiClient.post('/analysis/rule-screen', data),
  getDashboardOverview: () => apiClient.get('/analysis/dashboard-overview'),
};

// Recommendation API
export const recommendationAPI = {
  getSessionRecommendations: (sessionId) => 
    apiClient.get(`/recommendations/session/${sessionId}`),
  getDisabilityRecommendation: (sessionId, disabilityCategory) =>
    apiClient.get(`/recommendations/session/${sessionId}/${disabilityCategory}`),
};

// Report API
export const reportAPI = {
  generateSessionPDF: (sessionId) => 
    apiClient.get(`/reports/session/${sessionId}/pdf`, { responseType: 'blob' }),
  generateProgressPDF: (studentId) => 
    apiClient.get(`/reports/student/${studentId}/progress-pdf`, { responseType: 'blob' }),
  exportSessionData: (sessionId) => 
    apiClient.get(`/reports/session/${sessionId}/export`, { responseType: 'blob' })
};

// Health check
export const healthCheck = () => apiClient.get('/health');

export default apiClient;
