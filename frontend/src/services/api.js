// frontend/src/services/api.js
// Updated API Service with ML Endpoints

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== EXISTING API ENDPOINTS =====

export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getProductAnalytics: () => api.get('/analytics/products'),
};

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const aiAPI = {
  query: (question) => api.post('/ai/query', { question }),
  getSuggestions: () => api.get('/ai/suggestions'),
};

export const anomalyAPI = {
  getActiveAnomalies: () => api.get('/anomaly/active'),
  getStats: () => api.get('/anomaly/stats'),
  getTrends: (period = '7d') => api.get(`/anomaly/trends?period=${period}`),
  getConfiguration: () => api.get('/anomaly/config'),
  acknowledge: (anomalyId) => api.post(`/anomaly/acknowledge/${anomalyId}`),
  resolve: (anomalyId, resolution) => api.post(`/anomaly/resolve/${anomalyId}`, { resolution }),
  forceScan: () => api.post('/anomaly/scan'),
  updateThresholds: (thresholds) => api.put('/anomaly/thresholds', { thresholds })
};

export const mlAPI = {
  // Overview and dashboard
  getDashboard: () => api.get('/ml/dashboard'),
  getAllPredictions: () => api.get('/ml/predictions'),
  
  // Specific prediction types
  getChurnPredictions: () => api.get('/ml/predictions/churn'),
  getTrafficForecast: () => api.get('/ml/predictions/traffic'),
  getAnomalyPredictions: () => api.get('/ml/predictions/anomaly'),
  getBehaviorAnalysis: () => api.get('/ml/predictions/behavior'),
  
  // User recommendations
  getUserRecommendations: (userId) => api.get(`/ml/recommendations/${userId}`),
  
  // Model management
  updatePredictions: () => api.post('/ml/predictions/update'),
  trainModels: () => api.post('/ml/models/train'),
  getModelMetrics: () => api.get('/ml/models/metrics'),
};

export const integrationsAPI = {
  getStatus: () => api.get('/integrations/status'),
  getSettings: () => api.get('/integrations/settings'),
  getHistory: () => api.get('/integrations/history'),
  
  // Configuration
  updateEmailConfig: (config) => api.put('/integrations/email/config', config),
  updateSlackWebhook: (data) => api.put('/integrations/slack/webhook', data),
  updateWebhookEndpoint: (data) => api.put('/integrations/webhook/endpoint', data),
  
  // Notifications
  sendTest: (data) => api.post('/integrations/test', data),
  sendManual: (data) => api.post('/integrations/notify', data),
};

export default api;