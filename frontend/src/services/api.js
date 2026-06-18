import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
 baseURL: API_BASE_URL,
 headers: {
 'Content-Type': 'application/json',
 },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
 (config) => {
 const token = storage.getToken();
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// Dashboard endpoints (Moved up for visibility)
export const dashboardApi = {
    getStats: () => api.get('/dashboard/stats'),
};

// Auth endpoints
export const authApi = {
 login: (credentials) => api.post('/auth/login', credentials),
 register: (userData) => api.post('/auth/register', userData),
 getMe: () => api.get('/auth/me'),
 forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
 verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
 resetPassword: (data) => api.post('/auth/reset-password', data),
 changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Users endpoints
export const usersApi = {
 getAll: (params) => api.get('/users', { params }),
 getById: (id) => api.get(`/users/${id}`),
 getProfile: () => api.get(`/users/profile?t=${Date.now()}`),
 create: (userData) => api.post('/users', userData),
 update: (id, userData) => api.put(`/users/${id}`, userData),
 delete: (id) => api.delete(`/users/${id}`),
 getStudents: (params) => api.get('/users', { params: { ...params, role: 'student' } }),
 getFaculty: (params) => api.get('/users', { params: { ...params, role: 'faculty' } }),
};

// Courses endpoints
export const coursesApi = {
 getAll: (params) => api.get('/courses', { params }),
 getById: (id) => api.get(`/courses/${id}`),
 create: (courseData) => api.post('/courses', courseData),
 update: (id, courseData) => api.put(`/courses/${id}`, courseData),
 delete: (id) => api.delete(`/courses/${id}`),
 enrollStudent: (id, data) => api.post(`/courses/${id}/enroll`, data),
 removeEnrollment: (id, data) => api.delete(`/courses/${id}/enroll`, { data }),
 assignFaculty: (data) => api.post('/courses/assign', data),
 getFacultyCourses: () => api.get('/courses/faculty'),
 getCourseStudents: (id) => api.get(`/courses/${id}/students`),
};

// Notices endpoints
export const noticesApi = {
 getAll: (params) => api.get('/notices', { params }),
 getById: (id) => api.get(`/notices/${id}`),
 create: (noticeData) => api.post('/notices', noticeData),
 update: (id, noticeData) => api.put(`/notices/${id}`, noticeData),
 delete: (id) => api.delete(`/notices/${id}`),
 pin: (id) => api.post(`/notices/${id}/pin`),
 getFacultyNotices: () => api.get('/notices/faculty'),
};

// Exams & Grades endpoints
export const gradesApi = {
 getExams: (params) => api.get('/grades/exams', { params }),
 createExam: (data) => api.post('/grades/exams', data),
 updateExam: (id, data) => api.put(`/grades/exams/${id}`, data),
 deleteExam: (id) => api.delete(`/grades/exams/${id}`),
 getGrades: (examId) => api.get(`/grades/exams/${examId}/grades`),
 bulkUploadGrades: (data) => api.post('/grades/bulk', data),
 updateGrade: (id, data) => api.put(`/grades/${id}`, data),
};

// Fees endpoints
export const feesApi = {
 getAll: (params) => api.get('/fees/transactions', { params }),
 getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
 createTransaction: (data) => api.post('/fees/pay', data),
 updateStatus: (id, status) => api.put(`/fees/transactions/${id}`, { status }),
 getReceipt: (id) => api.get(`/fees/receipt/${id}`, { responseType: 'blob' }),
};

// Attendance endpoints
export const attendanceApi = {
 getAll: (params) => api.get('/attendance', { params }),
 mark: (data) => api.post('/attendance/mark', data),
 getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
 getCourseAttendance: (courseId) => api.get(`/attendance/course/${courseId}`),
};

// Reports endpoints
export const reportsApi = {
 exportStudents: (data) => api.post('/reports/students', data, { responseType: 'blob' }),
 exportAttendance: (data) => api.post('/reports/attendance', data, { responseType: 'blob' }),
 exportFees: (data) => api.post('/reports/fees', data, { responseType: 'blob' }),
 exportGrades: (data) => api.post('/reports/grades', data, { responseType: 'blob' }),
};

export default api;
