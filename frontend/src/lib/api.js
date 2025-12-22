/**
 * API Client
 * 
 * Centralized API client using Axios for all backend communication.
 * Automatically handles JWT token injection and 401 redirects.
 * 
 * Exports: authAPI, leadsAPI, userAPI, dodoAPI, marketplaceAPI, adminAPI
 */

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
  sendVerification: () => api.post('/auth/send-verification'),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Leads API
export const leadsAPI = {
  getLeads: () => api.get('/leads'),
  getStats: () => api.get('/leads/stats'),
  updateLead: (id, source, data) => api.patch(`/leads/update?id=${id}&source=${source}`, data),
  exportCSV: (source) => api.get(`/leads/export?source=${source || 'all'}`, { responseType: 'blob' }),
};

// User API
export const userAPI = {
  updatePlan: (plan_type) => api.patch('/user/plan', { plan_type }),
  distributeLeads: () => api.post('/user/leads/distribute'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  getTrialStatus: () => api.get('/user/trial-status'),
};

// Dodo Payments API
export const dodoAPI = {
  createCheckout: (plan, userId, useTrial = false) => api.post('/dodo/checkout', { plan, userId, useTrial }),
  cancelSubscription: () => api.post('/dodo/cancel'),
};

// Legacy Stripe API (deprecated - kept for reference)
// export const stripeAPI = {
//   createCheckout: (planId) => api.post('/stripe/checkout', { planId }),
// };

// Marketplace API
export const marketplaceAPI = {
  getLeads: (params) => api.get('/marketplace', { params }),
  purchaseLead: (leadId) => api.post('/marketplace/purchase', { leadId }),
  createCheckout: (leadId) => api.post('/marketplace/checkout', { leadId }),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateUserPlan: (userId, plan_type) => api.patch('/admin/users', { userId, plan_type }),
  updateUser: (userId, updateData) => api.patch('/admin/users', { userId, ...updateData }),
  getLeads: () => api.get('/admin/leads'),
  createLead: (singleLead) => api.post('/admin/leads', { singleLead }),
  updateLead: (data) => api.put('/admin/leads', data),
  uploadCSV: (csvData) => api.post('/admin/leads', { csvData }),
  uploadMappedCSV: (mappedData) => api.post('/admin/leads', { mappedData }),
  deleteLead: (leadId) => api.delete('/admin/leads', { data: { leadId } }),
  bulkDeleteLeads: (leadIds) => api.delete('/admin/leads/bulk', { data: { leadIds } }),
  distributeLeads: (params = {}) => api.post('/admin/distribute', params),
  // Marketplace admin
  getMarketplaceLeads: () => api.get('/admin/marketplace'),
  createMarketplaceLead: (singleLead) => api.post('/admin/marketplace', { singleLead }),
  updateMarketplaceLead: (data) => api.put('/admin/marketplace', data),
  uploadMarketplaceCSV: (csvData) => api.post('/admin/marketplace', { csvData }),
  deleteMarketplaceLead: (leadId) => api.delete('/admin/marketplace', { data: { leadId } }),
  // Wholesalers admin
  getWholesalers: () => api.get('/admin/wholesalers'),
  // Email templates admin
  getEmailTemplates: () => api.get('/admin/email-templates'),
  createEmailTemplate: (data) => api.post('/admin/email-templates', data),
  updateEmailTemplate: (data) => api.patch('/admin/email-templates', data),
  deleteEmailTemplate: (id) => api.delete('/admin/email-templates', { data: { id } }),
  sendTestEmail: (template_id, email) => api.post('/admin/email-templates/test', { template_id, email }),
  // Email automations admin
  getEmailAutomations: () => api.get('/admin/email-automations'),
  createEmailAutomation: (data) => api.post('/admin/email-automations', data),
  updateEmailAutomation: (data) => api.patch('/admin/email-automations', data),
  deleteEmailAutomation: (id) => api.delete('/admin/email-automations', { data: { id } }),
  // Lead enrichment
  enrichLeads: (leadIds, limit) => api.post('/admin/enrich-leads', { leadIds, limit }),
};
