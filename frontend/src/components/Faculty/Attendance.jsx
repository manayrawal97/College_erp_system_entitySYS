import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle } from 'lucide-react';
import { coursesApi, attendanceApi } from '../../services/api';
import toast from 'react-hot-toast';

const Attendance = ({ courses }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(courses[0].id);
        }
    }, [courses]);

    useEffect(() => {
        if (selectedCourse) fetchStudents();
    }, [selectedCourse]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await coursesApi.getCourseStudents(selectedCourse);
            if (response.data.success) {
                setStudents(response.data.data);
                // Initialize attendance data as present for all
                const initial = {};
                response.data.data.forEach(s => {
                    initial[s.id] = 'Present';
                });
                setAttendanceData(initial);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => { updated[s.id] = status; });
        setAttendanceData(updated);
    };

    const saveAttendance = async () => {
        try {
            const data = {
                course_id: selectedCourse,
                date,
                attendance: Object.entries(attendanceData).map(([student_id, status]) => ({
                    student_id,
                    status,
                    remarks: ''
                }))
            };
            const response = await attendanceApi.mark(data);
            if (response.data.success) {
                toast.success('Attendance marked successfully');
            }
        } catch (error) {
            toast.error('Failed to save attendance');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarCheck className="text-primary" /> Mark Attendance
                </h2>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
                    </select>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{students.length} Students Listed</span>
                    <div className="flex gap-2">
                        <button onClick={() => markAll('Present')} className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">MARK ALL PRESENT</button>
                        <button onClick={() => markAll('Absent')} className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">MARK ALL ABSENT</button>
                    </div>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading students...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">{student.enrollment_id || 'ENR202400' + student.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(student.id, status)}
                                                        className={`
                                                            px-3 py-1 rounded-lg text-[10px] font-bold transition-all
                                                            ${attendanceData[student.id] === status
                                                                ? (status === 'Present' ? 'bg-green-600 text-white' : status === 'Absent' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white')
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                                                        `}
                                                    >
                                                        {status.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="text" placeholder="Add note..." className="bg-transparent border-none text-sm text-gray-500 focus:ring-0 w-full" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="p-6 bg-gray-50/30 flex justify-end">
                    <button
                        onClick={saveAttendance}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> Save Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
