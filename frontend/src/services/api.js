import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const courseApi = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (course) => api.post('/courses', course),
  getRecommendations: () => api.get('/courses/recommendations'),
};

export const eduApi = {
  getRequests: () => api.get('/edu/requests'),
  createRequest: (request) => api.post('/edu/requests', request),
  getCertificates: () => api.get('/edu/certificates'),
  generateCertificate: (courseId) => api.post(`/edu/certificates/generate/${courseId}`),
};

export const liveClassApi = {
  getUpcoming: () => api.get('/live-classes/upcoming'),
  getById: (id) => api.get(`/live-classes/${id}`),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
};

export default api;
