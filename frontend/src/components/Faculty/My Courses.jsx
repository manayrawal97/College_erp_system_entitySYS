import React, { useState } from 'react';
import { BookOpen, Users, GraduationCap, CalendarCheck, Bell, X, Mail, Phone, ExternalLink } from 'lucide-react';
import { coursesApi } from '../../services/api';
import toast from 'react-hot-toast';

const MyCourses = ({ courses, setActiveSection, selectedCourseId, setSelectedCourseId }) => {
    const [viewStudentsModal, setViewStudentsModal] = useState(null); // holds course object if open
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const handleOpenStudentsModal = async (course) => {
        setViewStudentsModal(course);
        setStudents([]);
        try {
            setLoadingStudents(true);
            const response = await coursesApi.getCourseStudents(course.id);
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleAction = (section, courseId) => {
        if (setSelectedCourseId) {
            setSelectedCourseId(courseId);
        }
        setActiveSection(section);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">My Assigned Courses</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {courses.length} Assigned
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.length > 0 ? courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-colors group flex flex-col justify-between">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={18} className="text-primary" />
                                        {course.course_code} - {course.course_name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1 font-bold">
                                        Department: {course.department} | Section: {course.section || 'A'} | Semester: {course.semester}
                                    </p>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Active
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 my-6">
                                <button
                                    onClick={() => handleOpenStudentsModal(course)}
                                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl text-left border border-gray-50 group/card transition-all"
                                >
                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                                        <Users size={12} /> Students Enrolled
                                    </p>
                                    <p className="text-xl font-black text-gray-800 flex items-center gap-1.5 mt-1">
                                        {course.enrolled_count || 0}
                                        <ExternalLink size={14} className="text-primary opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                    </p>
                                </button>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-50">
                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Avg Attendance</p>
                                    <p className="text-xl font-black text-gray-800 mt-1">85%</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/20 flex flex-wrap gap-2">
                            <button
                                onClick={() => handleAction('attendance', course.id)}
                                className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <CalendarCheck size={14} /> Attendance
                            </button>
                            <button
                                onClick={() => handleAction('grades', course.id)}
                                className="flex-1 border border-gray-200 bg-white text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <GraduationCap size={14} /> Grades
                            </button>
                            <button
                                onClick={() => handleAction('notices', course.id)}
                                className="px-3 border border-gray-200 bg-white text-gray-500 rounded-xl hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                                title="Post Announcement Notice"
                            >
                                <Bell size={14} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-3 animate-pulse" />
                        <p className="text-gray-500 font-bold text-sm">No courses assigned to you yet.</p>
                    </div>
                )}
            </div>

            {/* Students List Modal */}
            {viewStudentsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                        <div className="px-6 py-4 bg-primary text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">{viewStudentsModal.course_code} - Enrolled Students</h3>
                                <p className="text-xs text-primary-light font-bold mt-0.5">{viewStudentsModal.course_name}</p>
                            </div>
                            <button
                                onClick={() => setViewStudentsModal(null)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingStudents ? (
                                <div className="text-center py-12 text-gray-500 font-bold">Loading course enrollment records...</div>
                            ) : students.length > 0 ? (
                                <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50/20">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm font-semibold">{student.enrollment_id}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {student.email}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {student.phone || 'N/A'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 font-medium">No students are active in this course.</div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">Total: {students.length} Students Enrolled</span>
                            <button
                                onClick={() => setViewStudentsModal(null)}
                                className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
