import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus, Pin, Trash2, Edit2, X } from 'lucide-react';
import { noticesApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const NoticeManagement = ({ isDashboard = false }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);

    // Notice form state
    const [noticeForm, setNoticeForm] = useState({
        title: '',
        content: '',
        target_role: 'all',
        is_pinned: false
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await noticesApi.getAll();
            setNotices(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notices:', error);
            toast.error('Failed to load notices');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddNotice = () => {
        setSelectedNotice(null);
        setNoticeForm({
            title: '',
            content: '',
            target_role: 'all',
            is_pinned: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditNotice = (notice) => {
        setSelectedNotice(notice);
        setNoticeForm({
            title: notice.title || '',
            content: notice.content || '',
            target_role: notice.target_role || 'all',
            is_pinned: !!notice.is_pinned
        });
        setIsModalOpen(true);
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedNotice) {
                // Update
                await noticesApi.update(selectedNotice.id, noticeForm);
                toast.success('Notice updated successfully');
            } else {
                // Create
                await noticesApi.create(noticeForm);
                toast.success('Notice posted successfully');
            }
            setIsModalOpen(false);
            fetchNotices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post notice');
        }
    };

    const handleTogglePin = async (notice) => {
        try {
            await noticesApi.pin(notice.id);
            toast.success(notice.is_pinned ? 'Notice unpinned' : 'Notice pinned');
            fetchNotices();
        } catch (error) {
            toast.error('Failed to update pin status');
        }
    };

    const handleDeleteNotice = async (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            try {
                await noticesApi.delete(id);
                toast.success('Notice deleted successfully');
                fetchNotices();
            } catch (error) {
                toast.error('Failed to delete notice');
            }
        }
    };

    // Sort pinned notices to the top
    const sortedNotices = [...notices].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    const displayedNotices = isDashboard ? sortedNotices.slice(0, 4) : sortedNotices;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="text-primary" />
                    Notice Board
                </h2>
                {isDashboard ? (
                    <Link to="/admin/notices" className="text-sm text-primary hover:underline font-bold">
                        See More Notices →
                    </Link>
                ) : (
                    <button 
                        onClick={handleOpenAddNotice}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px] cursor-pointer"
                    >
                        <Plus size={18} />
                        Post Notice
                    </button>
                )}
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {loading ? (
                    [...Array(2)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse"></div>
                    ))
                ) : displayedNotices.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 font-medium">
                        No notices posted yet.
                    </div>
                ) : (
                    displayedNotices.map((notice) => (
                        <div key={notice.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group flex flex-col h-full hover:border-gray-200 transition-colors">
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
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {notice.created_at ? format(new Date(notice.created_at), 'PPP') : 'Just now'}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 leading-tight pr-6">{notice.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1">{notice.content}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border-2 border-white shadow-sm">
                                        {notice.posted_by_name?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">{notice.posted_by_name || 'Admin'}</span>
                                </div>
                                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleTogglePin(notice)}
                                        className={`p-2 text-gray-400 hover:text-primary transition-all rounded-lg hover:bg-white min-h-[36px] min-w-[36px] cursor-pointer ${
                                            notice.is_pinned ? 'text-primary' : ''
                                        }`} 
                                        title={notice.is_pinned ? 'Unpin' : 'Pin'}
                                    >
                                        <Pin size={14} fill={notice.is_pinned ? 'currentColor' : 'none'} />
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEditNotice(notice)}
                                        className="p-2 text-gray-400 hover:text-amber-500 transition-all rounded-lg hover:bg-white min-h-[36px] min-w-[36px] cursor-pointer" 
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteNotice(notice.id)}
                                        className="p-2 text-gray-400 hover:text-rose-500 transition-all rounded-lg hover:bg-white min-h-[36px] min-w-[36px] cursor-pointer" 
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isDashboard && notices.length > 4 && (
                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/20">
                    <Link to="/admin/notices" className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-all">
                        See More Notices (Total {notices.length}) →
                    </Link>
                </div>
            )}

            {/* Post/Edit Notice Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{selectedNotice ? 'Edit Notice' : 'Post Notice'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleNoticeSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notice Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. End Semester Exam Schedule"
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notice Content</label>
                                <textarea
                                    required
                                    placeholder="Write your announcement details here (minimum 10 characters)..."
                                    value={noticeForm.content}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 min-h-[120px]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Target Audience</label>
                                <select
                                    value={noticeForm.target_role}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, target_role: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900"
                                >
                                    <option value="all">Everyone (All)</option>
                                    <option value="student">Students Only</option>
                                    <option value="faculty">Faculty Only</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_pinned"
                                    checked={noticeForm.is_pinned}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="is_pinned" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Pin this notice to the top</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                                >
                                    {selectedNotice ? 'Save Changes' : 'Post Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeManagement;
