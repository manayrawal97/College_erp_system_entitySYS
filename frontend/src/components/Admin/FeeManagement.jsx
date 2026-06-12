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
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <CreditCard className="text-primary" />
          Fee Management
        </h2>
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl text-sm font-medium outline-none"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium">
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-navy-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4"><div className="h-10 bg-gray-50 dark:bg-navy-900 rounded-lg"></div></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No transactions found.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{tx.student_name}</p>
                    <p className="text-[10px] text-gray-400">{tx.enrollment_id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">₹{tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{tx.fee_type}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.status === 'paid' ? <CheckCircle size={10} /> : tx.status === 'pending' ? <Clock size={10} /> : <AlertCircle size={10} />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDownloadReceipt(tx.id)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                      title="Download Receipt"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeManagement;
