import api from './api';

export const studentService = {
    // Dashboard Stats
    getDashboardStats: () => api.get('/student/dashboard'),

    // Admission details
    getAdmissionDetails: () => api.get('/student/admission'),

    // Exams
    getAvailableExams: () => api.get('/student/exams/available'),
    registerExam: (examId) => api.post('/student/exams/register', { exam_id: examId }),
    getHallTicket: (examId) => api.get(`/student/exams/hall-ticket/${examId}`),

    // Attendance
    getAttendanceRecords: () => api.get('/student/attendance/student'),
    getAttendanceSummary: () => api.get('/student/attendance/student/summary'),

    // Grades / Results
    getGrades: () => api.get('/student/grades/student'),
    getGradesSummary: () => api.get('/student/grades/student/summary'),

    // LMS / Course Materials
    getCourseMaterials: (courseId) => {
        const params = courseId ? { course_id: courseId } : {};
        return api.get('/student/courses/materials', { params });
    },

    // Chat / Community
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (id, type) => api.get(`/chat/messages/${id}`, { params: { type } }),
    sendMessage: (targetId, message, type) => api.post('/chat/send', { target_id: targetId, message, type })
};

export default studentService;
