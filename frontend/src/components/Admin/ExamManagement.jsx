import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Calendar, Award, Trash2, Edit2, X, Check, Save } from 'lucide-react';
import { gradesApi, coursesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ExamManagement = ({ isDashboard = false }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    // Modal states
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    // Exam form states
    const [examForm, setExamForm] = useState({
        course_id: '',
        exam_name: '',
        exam_date: '',
        total_marks: '100',
        exam_type: 'midterm'
    });

    // Grade management states
    const [gradesList, setGradesList] = useState([]);
    const [gradesLoading, setGradesLoading] = useState(false);
    const [editedGrades, setEditedGrades] = useState({}); // { studentId: marks }

    useEffect(() => {
        fetchExams();
        fetchCourses();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await gradesApi.getExams();
            setExams(response.data.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await coursesApi.getAll();
            const list = response.data.data || [];
            setCourses(list);
            if (list.length > 0) {
                setExamForm(prev => ({ ...prev, course_id: list[0].id }));
            }
        } catch (error) {
            console.error('Error fetching courses for exam:', error);
        }
    };

    const handleOpenAddExam = () => {
        setSelectedExam(null);
        setExamForm({
            course_id: courses.length > 0 ? String(courses[0].id) : '',
            exam_name: '',
            exam_date: '',
            total_marks: '100',
            exam_type: 'midterm'
        });
        setIsExamModalOpen(true);
    };

    const handleOpenEditExam = (exam) => {
        setSelectedExam(exam);
        // Date formatting to YYYY-MM-DD for input date type
        const rawDate = exam.exam_date ? new Date(exam.exam_date) : new Date();
        const dateString = rawDate.toISOString().split('T')[0];

        setExamForm({
            course_id: String(exam.course_id),
            exam_name: exam.exam_name || '',
            exam_date: dateString,
            total_marks: String(exam.total_marks || '100'),
            exam_type: exam.exam_type || 'midterm'
        });
        setIsExamModalOpen(true);
    };

    const handleExamSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!examForm.course_id) {
                toast.error('Please select a course');
                return;
            }

            const data = {
                ...examForm,
                course_id: parseInt(examForm.course_id),
                total_marks: parseInt(examForm.total_marks)
            };

            if (selectedExam) {
                // Update
                await gradesApi.updateExam(selectedExam.id, data);
                toast.success('Exam updated successfully');
            } else {
                // Create
                await gradesApi.createExam(data);
                toast.success('Exam created successfully');
            }
            setIsExamModalOpen(false);
            fetchExams();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save exam');
        }
    };

    const handleDeleteExam = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam and all associated student grades? This action is permanent!')) {
            try {
                await gradesApi.deleteExam(id);
                toast.success('Exam deleted successfully');
                fetchExams();
            } catch (error) {
                toast.error('Failed to delete exam');
            }
        }
    };

    // Grade entry handling
    const handleOpenGrades = async (exam) => {
        setSelectedExam(exam);
        setIsGradeModalOpen(true);
        setGradesLoading(true);
        setEditedGrades({});
        try {
            // First fetch the students enrolled in this course to build full grades list
            const studentsResponse = await coursesApi.getCourseStudents(exam.course_id);
            const students = studentsResponse.data.data || [];

            // Then fetch the already entered grades
            const gradesResponse = await gradesApi.getGrades(exam.id);
            const grades = gradesResponse.data.data || [];

            // Merge them so we show all enrolled students, with marks if they exist
            const mergedList = students.map(student => {
                const gradeRecord = grades.find(g => g.student_id === student.id);
                return {
                    student_id: student.id,
                    student_name: student.full_name,
                    enrollment_id: student.enrollment_id,
                    grade_id: gradeRecord ? gradeRecord.id : null,
                    marks_obtained: gradeRecord ? gradeRecord.marks_obtained : ''
                };
            });

            setGradesList(mergedList);
        } catch (error) {
            console.error('Error fetching grades:', error);
            toast.error('Failed to load student grades list');
        } finally {
            setGradesLoading(false);
        }
    };

    const handleGradeChange = (studentId, value) => {
        setEditedGrades(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveGrades = async () => {
        const studentGradesToUpload = [];
        
        // Loop through all entries and construct array
        for (const record of gradesList) {
            const val = editedGrades[record.student_id];
            if (val !== undefined && val !== '') {
                const num = parseFloat(val);
                if (isNaN(num) || num < 0 || num > selectedExam.total_marks) {
                    toast.error(`Marks for ${record.student_name} must be between 0 and ${selectedExam.total_marks}`);
                    return;
                }
                studentGradesToUpload.push({
                    student_id: record.student_id,
                    marks_obtained: num
                });
            }
        }

        if (studentGradesToUpload.length === 0) {
            toast.error('No changes to save');
            return;
        }

        try {
            setGradesLoading(true);
            await gradesApi.bulkUploadGrades({
                exam_id: selectedExam.id,
                grades: studentGradesToUpload
            });
            toast.success('Grades updated successfully');
            setIsGradeModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload grades');
        } finally {
            setGradesLoading(false);
        }
    };

    const displayedExams = isDashboard ? exams.slice(0, 4) : exams;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-primary" />
                    Exam Management
                </h2>
                {isDashboard ? (
                    <Link to="/admin/exams" className="text-sm text-primary hover:underline font-bold">
                        See More Exams →
                    </Link>
                ) : (
                    <button 
                        onClick={handleOpenAddExam}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px] cursor-pointer"
                    >
                        <Plus size={18} />
                        Create Exam
                    </button>
                )}
            </div>

            <div className="overflow-x-auto custom-scrollbar-h">
                <table className="w-full text-left hidden md:table">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Exam Name</th>
                            <th className="px-6 py-4 whitespace-nowrap">Course</th>
                            <th className="px-6 py-4 whitespace-nowrap">Date</th>
                            <th className="px-6 py-4 whitespace-nowrap">Total Marks</th>
                            <th className="px-6 py-4 whitespace-nowrap">Type</th>
                            <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-lg"></div></td>
                                </tr>
                            ))
                        ) : displayedExams.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                                    No exams scheduled.
                                </td>
                            </tr>
                        ) : (
                            displayedExams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900">{exam.exam_name}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-xs font-bold text-gray-700">{exam.course_name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{exam.course_code}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Calendar size={14} className="text-primary" />
                                            {exam.exam_date ? format(new Date(exam.exam_date), 'MMM dd, yyyy') : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{exam.total_marks}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase text-gray-600">
                                            {exam.exam_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => handleOpenGrades(exam)}
                                                className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer" 
                                                title="Manage Grades"
                                            >
                                                <Award size={18} />
                                            </button>
                                            {!isDashboard && (
                                                <>
                                                    <button 
                                                        onClick={() => handleOpenEditExam(exam)}
                                                        className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer" 
                                                        title="Edit Exam"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteExam(exam.id)}
                                                        className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer" 
                                                        title="Delete Exam"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
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
                    ) : displayedExams.map((exam) => (
                        <div key={exam.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 leading-tight truncate">{exam.exam_name}</p>
                                    <p className="text-xs font-bold text-primary mt-1">{exam.course_name}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                                        {exam.exam_type}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Exam Date</p>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                        <Calendar size={14} className="text-primary" />
                                        {exam.exam_date ? format(new Date(exam.exam_date), 'dd MMM yyyy') : 'N/A'}
                                    </div>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Max Marks</p>
                                    <p className="text-sm font-bold text-gray-700">{exam.total_marks}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => handleOpenGrades(exam)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm min-h-[44px] cursor-pointer"
                                >
                                    <Award size={16} /> Grades
                                </button>
                                {!isDashboard && (
                                    <>
                                        <button 
                                            onClick={() => handleOpenEditExam(exam)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm min-h-[44px] cursor-pointer"
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteExam(exam.id)}
                                            className="flex items-center justify-center p-3 bg-rose-50 text-rose-600 rounded-xl min-h-[44px] cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isDashboard && exams.length > 4 && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/20">
                    <Link to="/admin/exams" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-all">
                        See More Exams (Total {exams.length}) →
                    </Link>
                </div>
            )}

            {/* Create/Edit Exam Modal */}
            {isExamModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{selectedExam ? 'Edit Exam Schedule' : 'Create Exam'}</h3>
                            <button onClick={() => setIsExamModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleExamSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Select Course</label>
                                <select
                                    value={examForm.course_id}
                                    onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Exam Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mid Term Exam 2026"
                                    value={examForm.exam_name}
                                    onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Max Marks</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={examForm.total_marks}
                                        onChange={(e) => setExamForm({ ...examForm, total_marks: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Exam Type</label>
                                    <select
                                        value={examForm.exam_type}
                                        onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="midterm">Mid Term</option>
                                        <option value="final">Final Exam</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="assignment">Assignment</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Exam Date</label>
                                <input
                                    type="date"
                                    required
                                    value={examForm.exam_date}
                                    onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsExamModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                                >
                                    Save Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Grades Modal */}
            {isGradeModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Manage Student Grades</h3>
                                <p className="text-xs font-medium text-gray-500">{selectedExam?.exam_name} ({selectedExam?.course_name})</p>
                            </div>
                            <button onClick={() => setIsGradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {gradesLoading && gradesList.length === 0 ? (
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : gradesList.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 font-medium">
                                    No students enrolled in this course to grade.
                                </div>
                            ) : (
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3">Student Name</th>
                                                <th className="px-6 py-3">Enrollment ID</th>
                                                <th className="px-6 py-3 text-right">Marks (Max {selectedExam?.total_marks})</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {gradesList.map((record) => {
                                                const currentVal = editedGrades[record.student_id] !== undefined
                                                    ? editedGrades[record.student_id]
                                                    : record.marks_obtained;
                                                return (
                                                    <tr key={record.student_id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-3.5 font-bold text-gray-900">{record.student_name}</td>
                                                        <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">{record.enrollment_id}</td>
                                                        <td className="px-6 py-3.5 text-right">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={selectedExam?.total_marks}
                                                                step="0.5"
                                                                value={currentVal}
                                                                onChange={(e) => handleGradeChange(record.student_id, e.target.value)}
                                                                placeholder="Enter marks"
                                                                className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-right text-sm text-gray-900 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                            <button
                                type="button"
                                disabled={gradesLoading}
                                onClick={() => setIsGradeModalOpen(false)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={gradesLoading || gradesList.length === 0}
                                onClick={handleSaveGrades}
                                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer disabled:opacity-50"
                            >
                                <Save size={16} />
                                {gradesLoading ? 'Saving...' : 'Save Grades'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManagement;
