import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    UserPlus,
    Calendar,
    FileText
} from 'lucide-react';
import { coursesApi } from '../../services/api';
import toast from 'react-hot-toast';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await coursesApi.getAll();
            setCourses(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="text-primary" />
                    Course Management
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm min-h-[44px] text-gray-900"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px]">
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar-h">
                <table className="w-full text-left hidden md:table">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Code</th>
                            <th className="px-6 py-4 whitespace-nowrap">Course Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Dept / Sem</th>
                            <th className="px-6 py-4 whitespace-nowrap">Credits</th>
                            <th className="px-6 py-4 whitespace-nowrap">Enrollments</th>
                            <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-4">
                                        <div className="h-10 bg-gray-100 rounded-lg"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                                            {course.course_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900">{course.course_name}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-xs font-bold text-gray-700">{course.department}</p>
                                        <p className="text-[10px] text-gray-500">Semester {course.semester}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-700">{course.credits}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{course.enrolled_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Enrollments">
                                                <UserPlus size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Exams">
                                                <Calendar size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Materials">
                                                <FileText size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse"></div>
                        ))
                    ) : filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded block w-fit mb-1">
                                        {course.course_code}
                                    </span>
                                    <p className="font-bold text-gray-900 leading-tight">{course.course_name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Credits</p>
                                    <p className="text-sm font-bold text-gray-700">{course.credits}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dept / Sem</p>
                                    <p className="text-sm font-bold text-gray-700">{course.department} (S{course.semester})</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrolled</p>
                                    <p className="text-sm font-bold text-gray-700">{course.enrolled_count || 0} Students</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <button className="flex items-center justify-center p-3 bg-gray-50 text-gray-600 rounded-xl transition-all min-h-[44px]">
                                    <UserPlus size={18} />
                                </button>
                                <button className="flex items-center justify-center p-3 bg-gray-50 text-gray-600 rounded-xl transition-all min-h-[44px]">
                                    <Calendar size={18} />
                                </button>
                                <button className="flex items-center justify-center p-3 bg-gray-50 text-gray-600 rounded-xl transition-all min-h-[44px]">
                                    <FileText size={18} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm min-h-[44px]">
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm min-h-[44px]">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;
