import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Trash2, Edit2, Archive, Users } from 'lucide-react';
import { noticesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesApi.getAll();
      setNotices(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Bell className="text-primary" />
          Notice Board
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium shadow-lg shadow-primary/20">
          <Plus size={18} />
          Post Notice
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-50 dark:bg-navy-900 rounded-2xl animate-pulse"></div>
          ))
        ) : notices.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-gray-500">
            No notices posted yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="p-5 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700 relative group">
              {notice.is_pinned && (
                <div className="absolute top-4 right-4 text-primary">
                  <Pin size={18} fill="currentColor" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  notice.target_role === 'student' ? 'bg-green-100 text-green-700' :
                  notice.target_role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {notice.target_role || 'All'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {format(new Date(notice.created_at), 'PPP')}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">{notice.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{notice.content}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-navy-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                    {notice.posted_by_name?.charAt(0) || 'A'}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{notice.posted_by_name || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-primary transition-all rounded-lg hover:bg-white" title="Pin">
                    <Pin size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-amber-500 transition-all rounded-lg hover:bg-white" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-rose-500 transition-all rounded-lg hover:bg-white" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;
