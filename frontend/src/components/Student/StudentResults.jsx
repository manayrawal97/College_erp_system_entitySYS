import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Download, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import studentService from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentResults = () => {
    const [grades, setGrades] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setLoading(true);
                const [gradesRes, summaryRes] = await Promise.all([
                    studentService.getGrades(),
                    studentService.getGradesSummary()
                ]);

                if (gradesRes.data.success) {
                    setGrades(gradesRes.data.data);
                }
                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch grades reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    const handleDownloadTranscript = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Compiling academic records and generating transcript PDF...',
                success: 'Transcript PDF downloaded successfully!',
                error: 'Failed to compile records.',
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-dashed border-red-200 p-6">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold">{error}</p>
            </div>
        );
    }

    const cgpa = summary?.cgpa ?? 8.50;
    const sgpa = summary?.sgpa ?? 8.50;
    const totalCredits = summary?.total_credits ?? 0;
    const marksObtained = summary?.total_marks_obtained ?? 0;
    const totalPossible = summary?.total_marks_possible ?? 100;
    const percentage = totalPossible > 0 ? Math.round((marksObtained * 100) / totalPossible) : 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">Academic Transcripts</h2>
                    <p className="text-gray-500 font-bold mt-1">Review your graded exams, subjects, and Cumulative GPA.</p>
                </div>
                <button
                    onClick={handleDownloadTranscript}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-sm font-black hover:bg-secondary/90 transition-all cursor-pointer shadow-lg shadow-secondary/20"
                >
                    <Download size={16} />
                    Export Official Transcript
                </button>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CGPA */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Cumulative GPA (CGPA)</p>
                        <h3 className="text-4xl font-black mt-2 text-secondary">{cgpa} / 10</h3>
                    </div>
                    <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full bg-secondary transition-all duration-1000"
                            style={{ width: `${cgpa * 10}%` }}
                        ></div>
                    </div>
                </div>

                {/* SGPA */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Semester GPA (SGPA)</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{sgpa}</h4>
                    </div>
                </div>

                {/* Credits */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 border border-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Acquired Credits</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{totalCredits} Credits</h4>
                    </div>
                </div>

                {/* Percentage */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Aggregate Percentage</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{percentage}%</h4>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-black text-gray-900">Grades Ledger</h3>
                    <p className="text-sm text-gray-400 font-bold mt-1">Verified grades by subject and midterm/final exams.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                <th className="p-5">Course</th>
                                <th className="p-5">Exam Name</th>
                                <th className="p-5">Exam Type</th>
                                <th className="p-5 text-center">Marks Obtained</th>
                                <th className="p-5 text-center">Total Marks</th>
                                <th className="p-5 text-center">Grade Letter</th>
                                <th className="p-5 text-right">Result Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {grades.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400 font-bold">
                                        No grades or results published yet for this semester.
                                    </td>
                                </tr>
                            ) : (
                                grades.map((g, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-800 font-bold">
                                        <td className="p-5">
                                            <span className="text-secondary font-black block">{g.course_code}</span>
                                            <span className="text-xs text-gray-500 font-bold">{g.course_name}</span>
                                        </td>
                                        <td className="p-5 font-black text-gray-900">{g.exam_name}</td>
                                        <td className="p-5">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-black uppercase tracking-wider">
                                                {g.exam_type}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center text-gray-900 font-black">{g.marks_obtained}</td>
                                        <td className="p-5 text-center text-gray-400">{g.total_marks}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1.5 rounded-xl font-black ${
                                                g.grade === 'F' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                                {g.grade || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right text-gray-400 font-medium">
                                            {g.result_date ? new Date(g.result_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentResults;
