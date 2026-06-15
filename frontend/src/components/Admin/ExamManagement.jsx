import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, Award } from 'lucide-react';
import { gradesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ExamManagement = () => {
 const [exams, setExams] = useState([]);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 fetchExams();
 }, []);

 const fetchExams = async () => {
 try {
 setLoading(true);
 const response = await gradesApi.getExams();
 setExams(response.data.data || []);
 setLoading(false);
 } catch (error) {
 console.error('Error fetching exams:', error);
 toast.error('Failed to load exams');
 setLoading(false);
 }
 };

 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
 <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <FileText className="text-primary" />
 Exam Management
 </h2>
 <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px]">
 <Plus size={18} />
 Create Exam
 </button>
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
 [...Array(2)].map((_, i) => (
 <tr key={i} className="animate-pulse">
 <td colSpan="6" className="px-6 py-4"><div className="h-10 bg-gray-50 rounded-lg"></div></td>
 </tr>
 ))
 ) : exams.length === 0 ? (
 <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No exams scheduled.</td></tr>
 ) : (
 exams.map((exam) => (
 <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap">
 <p className="text-sm font-bold text-gray-900">{exam.exam_name}</p>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <p className="text-xs font-bold text-gray-700">{exam.course_name}</p>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
 <Calendar size={14} className="text-primary" />
 {format(new Date(exam.exam_date), 'MMM dd, yyyy')}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{exam.total_marks}</td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase text-gray-600">
 {exam.exam_type}
 </span>
 </td>
 <td className="px-6 py-4 text-right whitespace-nowrap">
 <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" title="Manage Grades">
 <Award size={18} />
 </button>
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
 ) : exams.map((exam) => (
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
 {format(new Date(exam.exam_date), 'dd MMM yyyy')}
 </div>
 </div>
 <div className="text-right space-y-0.5">
 <p className="text-[10px] font-bold text-gray-400 uppercase">Max Marks</p>
 <p className="text-sm font-bold text-gray-700">{exam.total_marks}</p>
 </div>
 </div>

 <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 min-h-[44px]">
 <Award size={18} />
 Manage Student Grades
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default ExamManagement;
