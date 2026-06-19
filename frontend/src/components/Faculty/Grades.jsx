import React, { useState, useEffect } from 'react';
import { GraduationCap, Download, Upload, Plus, ChevronLeft } from 'lucide-react';
import { coursesApi, gradesApi } from '../../services/api';
import toast from 'react-hot-toast';

const Grades = ({ courses, preselectedCourseId, onSaved }) => {
    const [step, setStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState(() => {
        if (preselectedCourseId && preselectedCourseId !== 'null' && preselectedCourseId !== 'undefined') {
            return String(preselectedCourseId);
        }
        if (courses.length > 0) {
            return String(courses[0].id);
        }
        return '';
    });
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({});
    
    // Exam creation state
    const [isCreatingExam, setIsCreatingExam] = useState(false);
    const [newExam, setNewExam] = useState({
        exam_name: '',
        exam_date: new Date().toISOString().split('T')[0],
        total_marks: 100,
        exam_type: 'midterm'
    });

    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (preselectedCourseId && preselectedCourseId !== 'null' && preselectedCourseId !== 'undefined') {
            setSelectedCourse(String(preselectedCourseId));
        } else if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(String(courses[0].id));
        }
    }, [courses, preselectedCourseId]);

    useEffect(() => {
        if (selectedCourse && selectedCourse !== 'null' && selectedCourse !== 'undefined') {
            fetchExams();
        } else {
            setExams([]);
            setSelectedExam('');
        }
    }, [selectedCourse]);

    const fetchExams = async () => {
        try {
            setLoadingExams(true);
            const response = await gradesApi.getExams({ course_id: selectedCourse });
            if (response.data.success) {
                setExams(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedExam(response.data.data[0].id);
                } else {
                    setSelectedExam('');
                }
            }
        } catch (error) {
            toast.error('Failed to load exams');
        } finally {
            setLoadingExams(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        const courseId = parseInt(selectedCourse);
        if (!selectedCourse || isNaN(courseId)) {
            toast.error('Please select a valid course first');
            return;
        }
        try {
            const data = {
                course_id: courseId,
                exam_name: newExam.exam_name,
                exam_date: newExam.exam_date,
                total_marks: parseInt(newExam.total_marks),
                exam_type: newExam.exam_type
            };
            const response = await gradesApi.createExam(data);
            if (response.data.success) {
                toast.success('Exam created successfully');
                setIsCreatingExam(false);
                setNewExam({
                    exam_name: '',
                    exam_date: new Date().toISOString().split('T')[0],
                    total_marks: 100,
                    exam_type: 'midterm'
                });
                // Re-fetch exams and set newly created as selected
                const res = await gradesApi.getExams({ course_id: selectedCourse });
                if (res.data.success) {
                    setExams(res.data.data);
                    setSelectedExam(response.data.data.id);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create exam');
        }
    };

    const handleProceed = async () => {
        if (!selectedCourse || !selectedExam) {
            toast.error('Please select both a course and an exam');
            return;
        }
        try {
            setLoadingStudents(true);
            
            // 1. Fetch students enrolled in course
            const studentsRes = await coursesApi.getCourseStudents(selectedCourse);
            // 2. Fetch existing grades for this exam
            const gradesRes = await gradesApi.getGrades(selectedExam);

            if (studentsRes.data.success && gradesRes.data.success) {
                const studentsList = studentsRes.data.data;
                const existingGrades = gradesRes.data.data;

                setStudents(studentsList);

                // Map existing grades
                const initialGrades = {};
                studentsList.forEach(s => {
                    const found = existingGrades.find(g => g.student_id === s.id);
                    if (found) {
                        initialGrades[s.id] = {
                            marks: found.marks_obtained !== null ? String(found.marks_obtained) : '',
                            grade: found.grade || ''
                        };
                    } else {
                        initialGrades[s.id] = { marks: '', grade: '' };
                    }
                });

                setGrades(initialGrades);
                setStep(2);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load student lists or grades');
        } finally {
            setLoadingStudents(false);
        }
    };

    const currentExamDetails = exams.find(e => e.id == selectedExam);

    const calculateGrade = (marks, totalMarks = 100) => {
        const m = parseFloat(marks);
        if (isNaN(m) || m < 0) return '';
        const percentage = (m / totalMarks) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'F';
    };

    const handleMarksChange = (studentId, marks) => {
        const totalMarks = currentExamDetails?.total_marks || 100;
        const val = parseFloat(marks);
        if (val > totalMarks) {
            toast.error(`Marks cannot exceed total marks (${totalMarks})`);
            return;
        }
        setGrades(prev => ({
            ...prev,
            [studentId]: { marks, grade: calculateGrade(marks, totalMarks) }
        }));
    };

    const saveGrades = async () => {
        try {
            setPublishing(true);
            const data = {
                exam_id: parseInt(selectedExam),
                grades: Object.entries(grades)
                    .filter(([_, g]) => g.marks !== '')
                    .map(([student_id, g]) => ({
                        student_id: parseInt(student_id),
                        marks_obtained: parseFloat(g.marks)
                    }))
            };

            if (data.grades.length === 0) {
                toast.error('Please enter marks for at least one student');
                setPublishing(false);
                return;
            }

            const response = await gradesApi.bulkUploadGrades(data);
            if (response.data.success) {
                toast.success('Grades published successfully!');
                setStep(1);
                if (onSaved) onSaved();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to publish grades');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="text-primary" /> Grade Management
            </h2>

            {step === 1 ? (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Select Course & Exam</h3>
                            {!isCreatingExam && (
                                <button
                                    onClick={() => setIsCreatingExam(true)}
                                    className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                                >
                                    <Plus size={14} /> Create Exam
                                </button>
                            )}
                        </div>

                        {isCreatingExam ? (
                            <form onSubmit={handleCreateExam} className="space-y-4">
                                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl space-y-3">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">New Exam Config</h4>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Course</label>
                                            <select
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                required
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="">Select Course</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Exam Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Midterm 1"
                                                value={newExam.exam_name}
                                                onChange={(e) => setNewExam({ ...newExam, exam_name: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Exam Type</label>
                                            <select
                                                value={newExam.exam_type}
                                                onChange={(e) => setNewExam({ ...newExam, exam_type: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                                            >
                                                <option value="midterm">Midterm</option>
                                                <option value="final">Final Exam</option>
                                                <option value="quiz">Quiz</option>
                                                <option value="assignment">Assignment</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Marks</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={newExam.total_marks}
                                                onChange={(e) => setNewExam({ ...newExam, total_marks: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Exam Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={newExam.exam_date}
                                                onChange={(e) => setNewExam({ ...newExam, exam_date: e.target.value })}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingExam(false)}
                                            className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-1.5 text-xs bg-primary text-white hover:bg-primary-dark rounded-lg font-bold"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Course</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Scheduled Exam</label>
                                    <select
                                        value={selectedExam}
                                        onChange={(e) => setSelectedExam(e.target.value)}
                                        disabled={loadingExams || exams.length === 0}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-55"
                                    >
                                        {loadingExams ? (
                                            <option>Loading exams...</option>
                                        ) : exams.length === 0 ? (
                                            <option value="">No exams scheduled yet (Click Create Exam)</option>
                                        ) : (
                                            exams.map(e => <option key={e.id} value={e.id}>{e.exam_name} ({e.exam_type.toUpperCase()} - {e.total_marks} Marks)</option>)
                                        )}
                                    </select>
                                </div>
                                <button
                                    onClick={handleProceed}
                                    disabled={loadingStudents || !selectedExam}
                                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all mt-4 disabled:opacity-50"
                                >
                                    {loadingStudents ? 'Loading Students...' : 'Proceed to Grade Entry'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam: </span>
                            <span className="text-sm font-bold text-primary mr-3">{currentExamDetails?.exam_name}</span>
                            <span className="text-xs text-gray-400 font-bold bg-white border border-gray-100 rounded-md px-2 py-0.5 uppercase tracking-wider">
                                Max Marks: {currentExamDetails?.total_marks}
                            </span>
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 bg-white border border-gray-100 rounded-lg px-3 py-1.5"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-36">Marks Obtained</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/30">
                                        <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">{student.enrollment_id || 'ENR202400' + student.id}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max={currentExamDetails?.total_marks || 100}
                                                value={grades[student.id]?.marks || ''}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                font-bold px-3 py-1 rounded-lg text-xs
                                                ${grades[student.id]?.grade === 'F' ? 'bg-red-50 text-red-600' : grades[student.id]?.grade ? 'bg-green-50 text-green-600' : 'text-gray-400'}
                                            `}>
                                                {grades[student.id]?.grade || '--'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-gray-50/30 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-bold">
                            {Object.values(grades).filter(g => g.marks !== '').length} of {students.length} students graded
                        </span>
                        <button
                            onClick={saveGrades}
                            disabled={publishing}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {publishing ? 'Publishing...' : 'Publish Results'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grades;
