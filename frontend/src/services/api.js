import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error?.response?.data === 'string') {
    return error.response.data;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  return fallbackMessage;
};

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/api/auth/');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  verifyOtpLogin: (data) => api.post('/api/auth/login/verify-otp', data),
  register: (data) => api.post('/api/auth/register', data),
  verifyEmail: (params) => api.get('/api/auth/verify-email', { params }),
  logout: () => api.post('/api/auth/logout', {}),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

export const userApi = {
  getMe: () => api.get('/api/users/me'),
  getMyCourses: () => api.get('/api/users/me/courses'),
  updateProfile: (data) => api.put('/api/users/me', data),
  getSessions: () => api.get('/api/users/me/sessions'),
  getLoginHistory: () => api.get('/api/users/me/login-history'),
  revokeSession: (sessionId) => api.delete(`/api/users/me/sessions/${sessionId}`),
  deactivateAccount: () => api.post('/api/users/me/deactivate'),
  updatePassword: (data) => api.post('/api/users/me/password', data),
  exportData: () => api.get('/api/users/me/export'),
  uploadAvatar: async (file) => {
    const profileImage = await fileToDataUrl(file);
    return api.put('/api/users/me', { profileImage });
  },
};

export const adminApi = {
  getUsers: () => api.get('/api/users/admin/users'),
  updateUser: (userId, data) => api.patch(`/api/users/admin/users/${userId}`, data),
  forceLogout: (userId) => api.post(`/api/users/admin/users/${userId}/force-logout`),
  impersonate: (userId) => api.post(`/api/users/admin/users/${userId}/impersonate`),
  getAuditLogs: () => api.get('/api/users/admin/audit-logs'),
  importUsers: (csvContent) => api.post('/api/users/admin/import', { csvContent }),
  deleteUser: (userId) => api.delete(`/api/users/admin/users/${userId}`),
  getCourses: () => api.get('/api/courses'),
  deleteCourse: (courseId) => api.delete(`/api/courses/${courseId}`),
  updateCourseStatus: (courseId, status) => api.patch(`/api/courses/${courseId}/status`, { status }),
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings) => api.post('/api/admin/settings', settings),
};

export const quizApi = {
  getByLesson: (lessonId) => api.get(`/api/quizzes/lesson/${lessonId}`),
  submit: (quizId, answers) => api.post(`/api/quizzes/${quizId}/submit`, answers),
  getById: (id) => api.get(`/api/quizzes/${id}`),
};

export const analyticsApi = {
  getPlatform: () => api.get('/api/analytics/platform'),
  getUser: () => api.get('/api/analytics/user'),
  getAdmin: () => api.get('/api/analytics/admin'),
  getInstructor: () => api.get('/api/analytics/instructor'),
};

export const instructorApi = {
  getMyCourses: () => api.get('/api/instructor/courses'),
  getCourseStudents: (courseId) => api.get(`/api/instructor/courses/${courseId}/students`),
  getAllMyStudents: () => api.get('/api/instructor/students'),
  getEarnings: () => api.get('/api/instructor/earnings'),
  getAnalytics: () => api.get('/api/instructor/analytics'),
};

export const courseApi = {
  getAll: () => api.get('/api/courses'),
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  getRecommendations: () => api.get('/api/courses/recommendations'),
  getReviews: (courseId) => api.get(`/api/courses/${courseId}/reviews`),
  submitReview: (courseId, data) => api.post(`/api/courses/${courseId}/reviews`, data),
};

export const liveClassApi = {
  getUpcoming: () => api.get('/api/live-classes/upcoming'),
  getMine: () => api.get('/api/live-classes/mine'),
  getById: (id) => api.get(`/api/live-classes/${id}`),
  register: (id) => api.post(`/api/live-classes/${id}/register`),
  getRegistrations: (id) => api.get(`/api/live-classes/${id}/registrations`),
  complete: (id, recordingUrl) => api.post(`/api/live-classes/${id}/complete`, { recordingUrl }),
  join: (id) => api.post(`/api/live-classes/${id}/join`),
  create: (data) => api.post('/api/live-classes', data),
};

export const discussionApi = {
  getAll: () => api.get('/api/discussions'),
  getByCourse: (courseId) => api.get(`/api/discussions/course/${courseId}`),
  create: (data) => api.post('/api/discussions', data),
  getMessages: (id) => api.get(`/api/discussions/${id}/messages`),
  postMessage: (id, data) => api.post(`/api/discussions/${id}/messages`, data),
};


export const certificateApi = {
  getMyCertificates: () => api.get('/api/certificates/my'),
  getById: (id) => api.get(`/api/certificates/${id}`),
  verify: (uniqueId) => api.get(`/api/certificates/verify/${uniqueId}`),
};

export const eduApi = {
  getRequests: () => api.get('/api/edu-revolution/requests'),
  getCertificates: () => api.get('/api/edu-revolution/certificates'),
  submitRequest: (data) => api.post('/api/edu-revolution/requests', data),
  getAllRequests: () => api.get('/api/edu-revolution/admin/requests'),
  updateRequestStatus: (id, status) => api.patch(`/api/edu-revolution/admin/requests/${id}`, { status }),
};

export const aiApi = {
  chat: (message, context) => api.post('/api/ai/chat', { message, context }),
  getHistory: () => api.get('/api/ai/history'),
};

export const leaderboardApi = {
  get: () => api.get('/api/leaderboard'),
};

export const progressApi = {
  get: (courseId) => api.get(`/api/progress/${courseId}`),
  completeLesson: (courseId, lessonId) => api.post(`/api/progress/${courseId}/lessons/${lessonId}/complete`),
};

export const paymentApi = {
  createIntent: (courseId) => api.post(`/api/payments/create-intent/${courseId}`),
  confirm: (courseId, paymentIntentId) => api.post(`/api/payments/confirm/${courseId}`, { paymentIntentId }),
};

export const notificationApi = {
  getAll: (page = 0) => api.get('/api/notifications', { params: { page } }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
};

export { getErrorMessage };
export default api;
