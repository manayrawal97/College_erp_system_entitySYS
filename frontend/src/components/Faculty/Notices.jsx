import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Clock, Edit, Trash2 } from 'lucide-react';
import { noticesApi } from '../../services/api';
import toast from 'react-hot-toast';

const Notices = ({ courses }) => {
    const [notices, setNotices] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        course_id: courses[0]?.id || '',
        is_urgent: false
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const response = await noticesApi.getFacultyNotices();
            if (response.data.success) {
                setNotices(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load notices');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await noticesApi.create(newNotice);
            if (response.data.success) {
                toast.success('Notice posted successfully');
                setIsCreating(false);
                setNewNotice({
                    title: '',
                    content: '',
                    course_id: courses[0]?.id || '',
                    is_urgent: false
                });
                fetchNotices();
            }
        } catch (error) {
            toast.error('Failed to post notice');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="text-primary" /> Notice Management
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Create Notice
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Post New Notice</h3>
                        <button onClick={() => setIsCreating(false)}><X size={20} className="text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notice Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. MST Schedule Update"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Target Course</label>
                                <select
                                    value={newNotice.course_id}
                                    onChange={(e) => setNewNotice({ ...newNotice, course_id: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content</label>
                            <textarea
                                required
                                value={newNotice.content}
                                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
                                placeholder="Write your notice here..."
                            ></textarea>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="urgent"
                                checked={newNotice.is_urgent}
                                onChange={(e) => setNewNotice({ ...newNotice, is_urgent: e.target.checked })}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="urgent" className="text-sm font-bold text-red-600">Mark as Urgent (Send Notification)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
                            <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark">Post Notice</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.length > 0 ? notices.map(notice => (
                    <div key={notice.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        {notice.is_urgent && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 text-white flex items-center justify-center rotate-45 translate-x-8 -translate-y-8 text-[10px] font-bold uppercase tracking-tighter">Urgent</div>}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{notice.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">{notice.course_code || 'CS301'}</span>
                                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Clock size={12} /> {new Date(notice.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"><Edit size={16} /></button>
                                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{notice.content}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">SA</div>
                                <span className="text-xs text-gray-500 font-medium">By You</span>
                            </div>
                            <button className="text-xs font-bold text-primary hover:underline">Read More</button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Bell size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Notices Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Create your first notice to share important updates with your students.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
