import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we have a token (authenticated request failed)
    // Don't redirect on login/register failures
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Leads API
export const leadsAPI = {
  getLeads: () => api.get('/leads'),
  getStats: () => api.get('/leads/stats'),
  updateLead: (id, data) => api.patch(`/leads/update?id=${id}`, data),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateUserPlan: (userId, plan_type) => api.patch('/admin/users', { userId, plan_type }),
  getLeads: () => api.get('/admin/leads'),
  createLead: (singleLead) => api.post('/admin/leads', { singleLead }),
  uploadCSV: (csvData) => api.post('/admin/leads', { csvData }),
  distributeLeads: () => api.post('/admin/distribute'),
};
