import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    UserPlus,
    X
} from 'lucide-react';
import { coursesApi, usersApi } from '../../services/api';
import toast from 'react-hot-toast';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const CourseManagement = ({ isDashboard = false }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    useBodyScrollLock(isCourseModalOpen || isAssignModalOpen);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [facultyList, setFacultyList] = useState([]);

    // Course form states
    const [courseForm, setCourseForm] = useState({
        course_code: '',
        course_name: '',
        department: 'CSE',
        semester: '1',
        credits: '3',
        description: ''
    });

    // Assignment form states
    const [assignForm, setAssignForm] = useState({
        faculty_id: '',
        section: 'A',
        academic_year: '2026-2027'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await coursesApi.getAll();
            setCourses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await usersApi.getAll({ role: 'faculty', is_active: true });
            const list = response.data.data || [];
            setFacultyList(list);
            if (list.length > 0) {
                setAssignForm(prev => ({ ...prev, faculty_id: list[0].id }));
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
            toast.error('Failed to load faculty list');
        }
    };

    const handleOpenAddCourse = () => {
        setSelectedCourse(null);
        setCourseForm({
            course_code: '',
            course_name: '',
            department: 'CSE',
            semester: '1',
            credits: '3',
            description: ''
        });
        setIsCourseModalOpen(true);
    };

    const handleOpenEditCourse = (course) => {
        setSelectedCourse(course);
        setCourseForm({
            course_code: course.course_code || '',
            course_name: course.course_name || '',
            department: course.department || 'CSE',
            semester: String(course.semester || '1'),
            credits: String(course.credits || '3'),
            description: course.description || ''
        });
        setIsCourseModalOpen(true);
    };

    const handleOpenAssignFaculty = (course) => {
        setSelectedCourse(course);
        fetchFaculty();
        setAssignForm({
            faculty_id: course.faculty_id ? String(course.faculty_id) : '',
            section: course.section || 'A',
            academic_year: course.academic_year || '2026-2027'
        });
        setIsAssignModalOpen(true);
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCourse) {
                // Update
                await coursesApi.update(selectedCourse.id, {
                    ...courseForm,
                    semester: parseInt(courseForm.semester),
                    credits: parseInt(courseForm.credits)
                });
                toast.success('Course updated successfully');
            } else {
                // Create
                await coursesApi.create({
                    ...courseForm,
                    semester: parseInt(courseForm.semester),
                    credits: parseInt(courseForm.credits)
                });
                toast.success('Course created successfully');
            }
            setIsCourseModalOpen(false);
            fetchCourses();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to save course';
            toast.error(errorMsg);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!assignForm.faculty_id) {
                toast.error('Please select a faculty member');
                return;
            }
            await coursesApi.assignFaculty({
                course_id: selectedCourse.id,
                faculty_id: parseInt(assignForm.faculty_id),
                section: assignForm.section,
                academic_year: assignForm.academic_year
            });
            toast.success('Faculty assigned successfully');
            setIsAssignModalOpen(false);
            fetchCourses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign faculty');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await coursesApi.delete(id);
                toast.success('Course deactivated successfully');
                fetchCourses();
            } catch (error) {
                toast.error('Failed to delete course');
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedCourses = isDashboard ? filteredCourses.slice(0, 4) : filteredCourses;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isDashboard ? (
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-primary" />
                        Course Management
                    </h2>
                    <Link to="/admin/courses" className="text-sm text-primary hover:underline font-bold">
                        See More Courses →
                    </Link>
                </div>
            ) : (
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
                        <button 
                            onClick={handleOpenAddCourse}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px] cursor-pointer"
                        >
                            <Plus size={18} />
                            Add Course
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto custom-scrollbar-h">
                <table className="w-full text-left hidden md:table">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Code</th>
                            <th className="px-6 py-4 whitespace-nowrap">Course Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Dept / Sem</th>
                            <th className="px-6 py-4 whitespace-nowrap">Credits</th>
                            <th className="px-6 py-4 whitespace-nowrap">Faculty / Section</th>
                            <th className="px-6 py-4 whitespace-nowrap">Enrollments</th>
                            {!isDashboard && <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={isDashboard ? 6 : 7} className="px-6 py-4">
                                        <div className="h-10 bg-gray-100 rounded-lg"></div>
                                    </td>
                                </tr>
                            ))
                        ) : displayedCourses.length === 0 ? (
                            <tr>
                                <td colSpan={isDashboard ? 6 : 7} className="px-6 py-12 text-center text-gray-500 font-medium">
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            displayedCourses.map((course) => (
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
                                        {course.faculty_name ? (
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{course.faculty_name}</p>
                                                <p className="text-[10px] text-gray-500">Section {course.section || 'A'} ({course.academic_year})</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{course.enrolled_count || 0}</span>
                                        </div>
                                    </td>
                                    {!isDashboard && (
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleOpenAssignFaculty(course)}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer" 
                                                    title="Assign Faculty"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEditCourse(course)}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer" 
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
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
                    ) : displayedCourses.map((course) => (
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Faculty</p>
                                    <p className="text-sm font-bold text-gray-700 truncate">{course.faculty_name || 'Unassigned'}</p>
                                </div>
                            </div>

                            {!isDashboard && (
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => handleOpenAssignFaculty(course)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm min-h-[44px]"
                                    >
                                        <UserPlus size={16} /> Assign
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEditCourse(course)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm min-h-[44px]"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm min-h-[44px]"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {isDashboard && filteredCourses.length > 4 && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/20">
                    <Link to="/admin/courses" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-all">
                        See More Courses (Total {filteredCourses.length}) →
                    </Link>
                </div>
            )}

            {/* Course Add/Edit Modal */}
            {isCourseModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overscroll-contain">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{selectedCourse ? 'Edit Course' : 'Add Course'}</h3>
                            <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Course Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CSE-101"
                                    value={courseForm.course_code}
                                    onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Data Structures & Algorithms"
                                    value={courseForm.course_name}
                                    onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Department</label>
                                    <select
                                        value={courseForm.department}
                                        onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="CSE">CSE</option>
                                        <option value="EE">EE</option>
                                        <option value="EC">EC</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Credits</label>
                                    <select
                                        value={courseForm.credits}
                                        onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Semester</label>
                                <select
                                    value={courseForm.semester}
                                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                >
                                    {[...Array(8)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    placeholder="Enter course description..."
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 min-h-[80px]"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCourseModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                                >
                                    Save Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Faculty Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overscroll-contain">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Assign Faculty to Course</h3>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Select Faculty Member</label>
                                <select
                                    value={assignForm.faculty_id}
                                    onChange={(e) => setAssignForm({ ...assignForm, faculty_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                >
                                    <option value="">Select Faculty...</option>
                                    {facultyList.map((f) => (
                                        <option key={f.id} value={f.id}>{f.full_name} ({f.department || 'General'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Section</label>
                                    <select
                                        value={assignForm.section}
                                        onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                        <option value="C">Section C</option>
                                        <option value="D">Section D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Academic Year</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2026-2027"
                                        value={assignForm.academic_year}
                                        onChange={(e) => setAssignForm({ ...assignForm, academic_year: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;
