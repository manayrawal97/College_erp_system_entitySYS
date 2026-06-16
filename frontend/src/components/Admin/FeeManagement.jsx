import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Download, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { feesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FeeManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchFees();
    }, [filterStatus]);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const params = filterStatus !== 'all' ? { status: filterStatus } : {};
            const response = await feesApi.getAll(params);
            setTransactions(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching fees:', error);
            toast.error('Failed to load fee transactions');
            setLoading(false);
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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-primary" />
                    Fee Management
                </h2>
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
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px]">
                        <Plus size={18} />
                        Add Transaction
                    </button>
                </div>
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
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No transactions found.</td></tr>
                        ) : (
                            transactions.map((tx) => (
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
                                        {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {tx.status === 'paid' ? <CheckCircle size={12} /> : tx.status === 'pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => handleDownloadReceipt(tx.id)}
                                            className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            title="Download Receipt"
                                        >
                                            <Download size={18} />
                                        </button>
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
                    ) : transactions.map((tx) => (
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
                                    <p className="text-sm font-bold text-gray-700">{format(new Date(tx.created_at), 'dd MMM yyyy')}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDownloadReceipt(tx.id)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary/5 text-primary rounded-xl font-bold text-sm transition-all min-h-[44px] hover:bg-primary/10"
                            >
                                <Download size={18} />
                                Download PDF Receipt
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeeManagement;
