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
  updateLead: (id, source, data) => api.patch(`/leads/update?id=${id}&source=${source}`, data),
};

// User API
export const userAPI = {
  updatePlan: (plan_type) => api.patch('/user/plan', { plan_type }),
  distributeLeads: () => api.post('/user/leads/distribute'),
};

// Dodo Payments API
export const dodoAPI = {
  createCheckout: (plan, userId) => api.post('/dodo/checkout', { plan, userId }),
};

// Legacy Stripe API (deprecated - kept for reference)
// export const stripeAPI = {
//   createCheckout: (planId) => api.post('/stripe/checkout', { planId }),
// };

// Marketplace API
export const marketplaceAPI = {
  getLeads: (filters) => api.get('/marketplace', { params: filters }),
  purchaseLead: (leadId) => api.post('/marketplace/purchase', { leadId }),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateUserPlan: (userId, plan_type) => api.patch('/admin/users', { userId, plan_type }),
  updateUser: (userId, updateData) => api.patch('/admin/users', { userId, ...updateData }),
  getLeads: () => api.get('/admin/leads'),
  createLead: (singleLead) => api.post('/admin/leads', { singleLead }),
  uploadCSV: (csvData) => api.post('/admin/leads', { csvData }),
  uploadMappedCSV: (mappedData) => api.post('/admin/leads', { mappedData }),
  deleteLead: (leadId) => api.delete('/admin/leads', { data: { leadId } }),
  bulkDeleteLeads: (leadIds) => api.delete('/admin/leads/bulk', { data: { leadIds } }),
  distributeLeads: (params = {}) => api.post('/admin/distribute', params),
  // Marketplace admin
  getMarketplaceLeads: () => api.get('/admin/marketplace'),
  createMarketplaceLead: (singleLead) => api.post('/admin/marketplace', { singleLead }),
  uploadMarketplaceCSV: (csvData) => api.post('/admin/marketplace', { csvData }),
  deleteMarketplaceLead: (leadId) => api.delete('/admin/marketplace', { data: { leadId } }),
};
