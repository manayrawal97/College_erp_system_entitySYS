import React, { useState } from 'react';
import { GraduationCap, Download, Upload } from 'lucide-react';
import { coursesApi, gradesApi } from '../../services/api';
import toast from 'react-hot-toast';

const Grades = ({ courses }) => {
    const [step, setStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
    const [selectedExam, setSelectedExam] = useState('MST 1');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({});

    const exams = ['MST 1', 'MST 2', 'Semester Exam', 'Quiz', 'Assignment'];

    const handleFetchStudents = async () => {
        if (!selectedCourse) return;
        try {
            const response = await coursesApi.getCourseStudents(selectedCourse);
            if (response.data.success) {
                setStudents(response.data.data);
                const initial = {};
                response.data.data.forEach(s => {
                    initial[s.id] = { marks: '', grade: '' };
                });
                setGrades(initial);
                setStep(2);
            }
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    const calculateGrade = (marks) => {
        const m = parseInt(marks);
        if (isNaN(m)) return '';
        if (m >= 90) return 'A+';
        if (m >= 80) return 'A';
        if (m >= 70) return 'B+';
        if (m >= 60) return 'B';
        if (m >= 50) return 'C';
        return 'F';
    };

    const handleMarksChange = (studentId, marks) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { marks, grade: calculateGrade(marks) }
        }));
    };

    const saveGrades = async () => {
        try {
            const data = {
                course_id: selectedCourse,
                exam_type: selectedExam,
                grades: Object.entries(grades).map(([student_id, g]) => ({
                    student_id,
                    marks: g.marks,
                    grade: g.grade
                }))
            };
            const response = await gradesApi.bulkUploadGrades(data);
            if (response.data.success) {
                toast.success('Grades published successfully');
                setStep(1);
            }
        } catch (error) {
            toast.error('Failed to save grades');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="text-primary" /> Grade Management
            </h2>

            {step === 1 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Select Course & Exam</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exam Type</label>
                            <select
                                value={selectedExam}
                                onChange={(e) => setSelectedExam(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {exams.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleFetchStudents}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all mt-4"
                        >
                            Proceed to Grade Entry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selectedExam} - </span>
                            <span className="text-sm font-bold text-primary">{courses.find(c => c.id == selectedCourse)?.course_name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
                                <Download size={16} /> Template
                            </button>
                            <button className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
                                <Upload size={16} /> Upload CSV
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Marks (100)</th>
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
                                                value={grades[student.id]?.marks || ''}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
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
                    <div className="p-6 bg-gray-50/30 flex justify-between">
                        <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
                        <button
                            onClick={saveGrades}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                        >
                            Publish Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grades;
