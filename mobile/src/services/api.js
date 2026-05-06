/**
 * API Service Layer
 * Connects to the Express backend
 */

// Configure this to your backend URL
const BASE_URL = 'http://localhost:3000/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
});

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  return data;
};

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options,
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Network request failed') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiCall('/auth/me'),
};

// ─── Student API ────────────────────────────────────────────────────────────
export const studentAPI = {
  getStats: () => apiCall('/student/stats'),
  getAttendance: (courseId) => apiCall(`/student/attendance${courseId ? `?courseId=${courseId}` : ''}`),
  getGrades: (semester) => apiCall(`/student/grades${semester ? `?semester=${semester}` : ''}`),
  getAvailableCourses: () => apiCall('/student/available-courses'),
  getMyCourses: () => apiCall('/student/my-courses'),
  registerCourse: (courseId) =>
    apiCall('/student/register-course', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    }),
  getDigitalId: () => apiCall('/student/digital-id'),
  getMaterials: (courseId) => apiCall(`/student/materials${courseId ? `?courseId=${courseId}` : ''}`),
  getFees: () => apiCall('/student/fees'),
};

// ─── Faculty API ────────────────────────────────────────────────────────────
export const facultyAPI = {
  getStats: () => apiCall('/faculty/stats'),
  getMyCourses: () => apiCall('/faculty/courses'),
  getCourseStudents: (courseId) => apiCall(`/faculty/courses/${courseId}/students`),
  markAttendance: (data) =>
    apiCall('/faculty/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAttendance: (courseId, date) =>
    apiCall(`/faculty/attendance/${courseId}${date ? `?date=${date}` : ''}`),
  uploadMaterial: (data) =>
    apiCall('/faculty/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  enterGrades: (data) =>
    apiCall('/faculty/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Admin API ──────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => apiCall('/admin/stats'),
  getUsers: (role, search) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    return apiCall(`/admin/users?${params.toString()}`);
  },
  onboardUser: (data) =>
    apiCall('/admin/onboard-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDepartments: () => apiCall('/admin/departments'),
  createDepartment: (data) =>
    apiCall('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCourses: () => apiCall('/admin/courses'),
  createCourse: (data) =>
    apiCall('/admin/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getFees: () => apiCall('/admin/fees'),
  updateFeeStatus: (data) =>
    apiCall('/admin/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
