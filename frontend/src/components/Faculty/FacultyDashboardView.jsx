import React, { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';
import { coursesApi } from '../../services/api';
import toast from 'react-hot-toast';
import FacultyKPICards from './FacultyKPICards';
import MyCourses from './My Courses';

export const FeesSection = ({ courses }) => {
    const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (selectedCourse) fetchFeeStatus();
    }, [selectedCourse]);

    const fetchFeeStatus = async () => {
        try {
            const response = await coursesApi.getCourseStudents(selectedCourse);
            if (response.data.success) {
                // Mocking fee data as it might not be in student object directly
                setStudents(response.data.data.map(s => ({
                    ...s,
                    total: 50000,
                    paid: Math.floor(Math.random() * 50000),
                    status: ['Paid', 'Partial', 'Pending'][Math.floor(Math.random() * 3)]
                })));
            }
        } catch (error) {
            toast.error('Failed to load fee status');
        }
    };

    const filteredStudents = students.filter(s => filter === 'All' || s.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-primary" /> Student Fee Overview
                </h2>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none"
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
                    </select>
                    <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                        {['All', 'Paid', 'Partial', 'Pending'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Fees</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Paid</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pending</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/30">
                                    <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
                                    <td className="px-6 py-4 text-gray-600 font-bold">₹{student.total.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">₹{student.paid.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">₹{(student.total - student.paid).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${student.status === 'Paid' ? 'bg-green-100 text-green-700' : student.status === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}
                                        `}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-gray-50/50 flex justify-end">
                    <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                        <Download size={14} /> Export Fee Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const FacultyDashboardView = ({ stats, loading, courses, setActiveSection }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FacultyKPICards stats={stats} loading={loading} />
            <MyCourses courses={courses} setActiveSection={setActiveSection} />
        </div>
    );
};

export default FacultyDashboardView;
