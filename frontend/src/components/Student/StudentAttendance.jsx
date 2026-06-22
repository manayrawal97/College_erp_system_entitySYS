import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';

const StudentAttendance = () => {
    const { records, summary, loading, error } = useAttendance();

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

    const overallPercentage = summary?.overall_percentage ?? 85.00;
    const totalPresent = summary?.total_present ?? 0;
    const totalAbsent = summary?.total_absent ?? 0;
    const totalClasses = summary?.total_classes ?? 0;
    const totalLate = summary?.total_late ?? 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Attendance Logs</h2>
                <p className="text-gray-500 font-bold mt-1">Monitor your class presence and requirements.</p>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Overall Attendance */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Overall Attendance</p>
                        <h3 className={`text-4xl font-black mt-2 ${overallPercentage < 75 ? 'text-red-600' : 'text-secondary'}`}>
                            {overallPercentage}%
                        </h3>
                    </div>
                    <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${overallPercentage < 75 ? 'bg-red-500' : 'bg-secondary'}`}
                            style={{ width: `${overallPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Present Classes */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Attended Classes</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{totalPresent} Periods</h4>
                    </div>
                </div>

                {/* Absent Classes */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Absent Classes</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{totalAbsent} Periods</h4>
                    </div>
                </div>

                {/* Late Classes */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Late Arrivals</p>
                        <h4 className="text-2xl font-black text-gray-900 mt-1">{totalLate} Periods</h4>
                    </div>
                </div>
            </div>

            {/* Attendance Danger Indicator */}
            {overallPercentage < 75 && (
                <div className="p-5 bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl flex items-start gap-4 animate-pulse">
                    <AlertTriangle size={24} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-black text-base">Low Attendance Warning!</h4>
                        <p className="text-sm font-bold mt-1">
                            Your overall attendance is currently {overallPercentage}%, which is below the mandatory university threshold of 75%. 
                            Please contact your department supervisor to discuss eligibility for semester exams.
                        </p>
                    </div>
                </div>
            )}

            {/* Subject wise Breakdown Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-black text-gray-900">Subject-wise Summary</h3>
                    <p className="text-sm text-gray-400 font-bold mt-1">Individual performance stats across all enrolled courses.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                <th className="p-5">Course Code</th>
                                <th className="p-5">Course Title</th>
                                <th className="p-5 text-center">Total Classes</th>
                                <th className="p-5 text-center text-emerald-600">Present</th>
                                <th className="p-5 text-center text-rose-600">Absent</th>
                                <th className="p-5 text-center text-amber-600">Late</th>
                                <th className="p-5 text-right">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400 font-bold">
                                        No courses or attendance records logged.
                                    </td>
                                </tr>
                            ) : (
                                records.map((rec) => (
                                    <tr key={rec.course_code} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-800 font-bold">
                                        <td className="p-5 text-secondary font-black">{rec.course_code}</td>
                                        <td className="p-5 font-black text-gray-900">{rec.course_name}</td>
                                        <td className="p-5 text-center">{rec.total_classes}</td>
                                        <td className="p-5 text-center text-emerald-600">{rec.present_count}</td>
                                        <td className="p-5 text-center text-rose-600">{rec.absent_count}</td>
                                        <td className="p-5 text-center text-amber-600">{rec.late_count}</td>
                                        <td className="p-5 text-right">
                                            <span className={`px-3 py-1.5 rounded-xl font-black ${
                                                rec.percentage < 75 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                                {rec.percentage}%
                                            </span>
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

export default StudentAttendance;
