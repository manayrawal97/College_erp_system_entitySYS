import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, FileText, Download, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import studentService from '../../services/studentService';
import toast from 'react-hot-toast';

const StudentExamPortal = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await studentService.getAvailableExams();
            if (response.data.success) {
                setExams(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch available exam schedules.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = (exam) => {
        setSelectedExam(exam);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        try {
            const response = await studentService.registerExam(selectedExam.id);
            if (response.data.success) {
                toast.success('Registration and payment completed successfully!');
                setIsPaymentModalOpen(false);
                setSelectedExam(null);
                fetchExams();
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to complete exam registration.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDownloadHallTicket = async (examId) => {
        try {
            const response = await studentService.getHallTicket(examId);
            if (response.data.success) {
                toast.success('Downloading Hall Ticket PDF...');
                const link = document.createElement('a');
                link.href = response.data.data.hall_ticket_url;
                link.setAttribute('download', `hallticket-${examId}.pdf`);
                document.body.appendChild(link);
                // In demo, we can just log/download.
                toast('Mock Download Triggered', { icon: '📄' });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to fetch hall ticket.');
        }
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
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Exam Registrar</h2>
                <p className="text-gray-500 font-bold mt-1">Enroll for semesters, pay exam fees, and download hall tickets.</p>
            </div>

            {/* Exams Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-black text-gray-900">Available Examination Schedules</h3>
                    <p className="text-sm text-gray-400 font-bold mt-1">Select and register for upcoming program tests.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                <th className="p-5">Course</th>
                                <th className="p-5">Exam Details</th>
                                <th className="p-5 text-center">Exam Date</th>
                                <th className="p-5 text-center">Total Marks</th>
                                <th className="p-5 text-center">Fee Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 font-bold">
                                        No exams scheduled for your enrolled program courses currently.
                                    </td>
                                </tr>
                            ) : (
                                exams.map((ex) => (
                                    <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-800 font-bold">
                                        <td className="p-5">
                                            <span className="text-secondary font-black block">{ex.course_code}</span>
                                            <span className="text-xs text-gray-500 font-bold">{ex.course_name}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-black text-gray-900 block">{ex.exam_name}</span>
                                            <span className="text-xs text-gray-400 capitalize">{ex.exam_type}</span>
                                        </td>
                                        <td className="p-5 text-center text-gray-900">
                                            {ex.exam_date ? new Date(ex.exam_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                        </td>
                                        <td className="p-5 text-center text-gray-900 font-black">{ex.total_marks}</td>
                                        <td className="p-5 text-center">
                                            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                                                ex.fee_status === 'paid' 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {ex.fee_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            {ex.fee_status === 'paid' ? (
                                                <button
                                                    onClick={() => handleDownloadHallTicket(ex.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 rounded-xl text-xs font-black cursor-pointer transition-colors"
                                                >
                                                    <Download size={14} />
                                                    Hall Ticket
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegisterClick(ex)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-white hover:bg-secondary/95 rounded-xl text-xs font-black cursor-pointer transition-all shadow-md shadow-secondary/10"
                                                >
                                                    <DollarSign size={14} />
                                                    Register & Pay
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trial Payment Dialog */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 md:p-8">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <DollarSign size={24} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Mock Payment Gateway</h3>
                            <p className="text-sm text-gray-400 font-bold mt-1">Registrar billing for {selectedExam?.exam_name}</p>

                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl my-6 flex items-start gap-3">
                                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500 font-bold leading-normal">
                                    <span className="text-gray-900 font-black">Trial Gateway Sandbox:</span> No real financial transactions will be made. Clicking continue will mock pay the 500 INR exam registration billing fee in database.
                                </p>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 flex justify-between items-center text-sm font-black text-secondary">
                                    <span>Examination Registration Fee:</span>
                                    <span className="text-base">₹500.00</span>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={paymentLoading}
                                        className="flex-1 py-3 bg-secondary text-white rounded-xl font-black text-sm hover:bg-secondary/95 cursor-pointer shadow-md shadow-secondary/15 flex items-center justify-center gap-1"
                                    >
                                        {paymentLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={16} />
                                                Authorize Pay
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentExamPortal;
