import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password })
};

export const workItemsAPI = {
  getAll: () => api.get('/work-items'),
  getById: (id) => api.get(`/work-items/${id}`),
  create: (data) => api.post('/work-items', data),
  update: (id, data) => api.put(`/work-items/${id}`, data),
  delete: (id) => api.delete(`/work-items/${id}`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const usersAPI = {
  getAll: () => api.get('/users')
};

export const statsAPI = {
  getActivity: (params) => api.get('/stats/activity', { params })
};

export default api;

