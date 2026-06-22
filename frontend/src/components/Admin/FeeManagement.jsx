import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { feesApi, usersApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FeeManagement = ({ isDashboard = false }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [students, setStudents] = useState([]);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form states
    const [txForm, setTxForm] = useState({
        student_id: '',
        amount: '',
        fee_type: 'tuition',
        status: 'pending'
    });

    useEffect(() => {
        fetchFees();
        if (!isDashboard) {
            fetchStudents();
        }
    }, [filterStatus]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const params = filterStatus !== 'all' ? { status: filterStatus } : {};
            const response = await feesApi.getAll(params);
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching fees:', error);
            toast.error('Failed to load fee transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await usersApi.getAll({ role: 'student', is_active: true });
            const list = response.data.data || [];
            setStudents(list);
            if (list.length > 0) {
                setTxForm(prev => ({ ...prev, student_id: list[0].id }));
            }
        } catch (error) {
            console.error('Error fetching students for fees:', error);
        }
    };

    const handleOpenAddTx = () => {
        fetchStudents();
        setTxForm({
            student_id: students.length > 0 ? String(students[0].id) : '',
            amount: '',
            fee_type: 'tuition',
            status: 'pending'
        });
        setIsAddModalOpen(true);
    };

    const handleAddTxSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!txForm.student_id) {
                toast.error('Please select a student');
                return;
            }
            await feesApi.createTransaction({
                student_id: parseInt(txForm.student_id),
                amount: parseFloat(txForm.amount),
                fee_type: txForm.fee_type,
                status: txForm.status
            });
            toast.success('Transaction added successfully');
            setIsAddModalOpen(false);
            fetchFees();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add transaction');
        }
    };

    const handleStatusChange = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'pending' ? 'paid' : currentStatus === 'paid' ? 'failed' : 'paid';
        try {
            await feesApi.updateStatus(id, nextStatus);
            toast.success(`Status updated to ${nextStatus}`);
            fetchFees();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteTx = async (id) => {
        if (window.confirm('Are you sure you want to delete this fee transaction record?')) {
            try {
                await feesApi.deleteTransaction(id);
                toast.success('Transaction record deleted successfully');
                fetchFees();
            } catch (error) {
                toast.error('Failed to delete transaction record');
            }
        }
    };

    const handleDownloadReceipt = async (id) => {
        try {
            const response = await feesApi.getReceipt(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    const displayedTransactions = isDashboard ? transactions.slice(0, 5) : transactions;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-primary" />
                    Fee Management
                </h2>
                {isDashboard ? (
                    <Link to="/admin/fees" className="text-sm text-primary hover:underline font-bold">
                        See More Fees →
                    </Link>
                ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none text-gray-700 min-h-[44px] cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <button 
                            onClick={handleOpenAddTx}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px] cursor-pointer"
                        >
                            <Plus size={18} />
                            Add Transaction
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto custom-scrollbar-h">
                <table className="w-full text-left hidden md:table">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Student</th>
                            <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                            <th className="px-6 py-4 whitespace-nowrap">Type</th>
                            <th className="px-6 py-4 whitespace-nowrap">Date</th>
                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
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
                        ) : displayedTransactions.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                        ) : (
                            displayedTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900">{tx.student_name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{tx.enrollment_id}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-900">₹{tx.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded">{tx.fee_type}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-500">
                                        {tx.created_at ? format(new Date(tx.created_at), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => !isDashboard && handleStatusChange(tx.id, tx.status)}
                                            disabled={isDashboard}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors select-none ${
                                                tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                            } ${!isDashboard ? 'hover:brightness-95 cursor-pointer' : ''}`}
                                            title={isDashboard ? '' : 'Click to toggle status'}
                                        >
                                            {tx.status === 'paid' ? <CheckCircle size={12} /> : tx.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                            {tx.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleDownloadReceipt(tx.id)}
                                                className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                                                title="Download Receipt"
                                            >
                                                <Download size={18} />
                                            </button>
                                            {!isDashboard && (
                                                <button
                                                    onClick={() => handleDeleteTx(tx.id)}
                                                    className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse"></div>
                        ))
                    ) : displayedTransactions.map((tx) => (
                        <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-bold text-gray-900 leading-tight">{tx.student_name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.enrollment_id}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-bold text-primary">₹{tx.amount.toLocaleString()}</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase mt-1 ${tx.status === 'paid' ? 'text-emerald-500' :
                                            tx.status === 'pending' ? 'text-amber-500' : 'text-rose-500'
                                        }`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Type</p>
                                    <p className="text-sm font-bold text-gray-700 capitalize">{tx.fee_type}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                                    <p className="text-sm font-bold text-gray-700">{tx.created_at ? format(new Date(tx.created_at), 'dd MMM yyyy') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownloadReceipt(tx.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary/5 text-primary rounded-xl font-bold text-sm min-h-[44px] hover:bg-primary/10 cursor-pointer"
                                >
                                    <Download size={18} />
                                    Receipt
                                </button>
                                {!isDashboard && (
                                    <button
                                        onClick={() => handleDeleteTx(tx.id)}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-xl min-h-[44px] cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isDashboard && transactions.length > 5 && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/20">
                    <Link to="/admin/fees" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-all">
                        See More Fees (Total {transactions.length}) →
                    </Link>
                </div>
            )}

            {/* Add Transaction Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Add Fee Transaction</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTxSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Select Student</label>
                                <select
                                    value={txForm.student_id}
                                    onChange={(e) => setTxForm({ ...txForm, student_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                >
                                    <option value="">Select Student...</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.full_name} ({s.enrollment_id})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="e.g. 5000"
                                    value={txForm.amount}
                                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Fee Type</label>
                                    <select
                                        value={txForm.fee_type}
                                        onChange={(e) => setTxForm({ ...txForm, fee_type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="tuition">Tuition Fee</option>
                                        <option value="exam">Exam Fee</option>
                                        <option value="library">Library Fee</option>
                                        <option value="other">Other Fee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1.5 uppercase">Status</label>
                                    <select
                                        value={txForm.status}
                                        onChange={(e) => setTxForm({ ...txForm, status: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                                >
                                    Save Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
