import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Clock, Edit, Trash2, Pin, Paperclip, Download, AlertCircle } from 'lucide-react';
import { noticesApi, uploadApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Notices = ({ courses, socketRef }) => {
    const { user } = useAuthContext();
    const [notices, setNotices] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [loadingNotices, setLoadingNotices] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form inputs state
    const [scope, setScope] = useState('course'); // 'course' or 'department'
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        target_course_id: courses[0]?.id || '',
        target_dept: user?.faculty_dept || 'CSE',
        target_semester: '', // empty = all semesters
        is_urgent: false
    });

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const departments = ['CSE', 'EE', 'EC', 'Mechanical', 'Civil'];

    useEffect(() => {
        fetchNotices();
    }, []);

    // Sockets listener for real-time notices updates
    useEffect(() => {
        if (socketRef && socketRef.current) {
            const socket = socketRef.current;

            socket.on('new_notice', (notice) => {
                // Prepend new notice, but filter duplicates
                setNotices(prev => {
                    if (prev.find(n => n.id === notice.id)) return prev;
                    return [notice, ...prev];
                });
                toast.success('New Announcement Posted!');
            });

            socket.on('notice_pinned_status', (data) => {
                setNotices(prev => prev.map(n => n.id === data.id ? { ...n, is_pinned: data.is_pinned } : n));
            });

            socket.on('notice_updated', (data) => {
                setNotices(prev => prev.map(n => n.id === data.id ? { ...n, ...data } : n));
            });

            socket.on('notice_deleted', (data) => {
                setNotices(prev => prev.filter(n => n.id !== data.id));
            });

            return () => {
                socket.off('new_notice');
                socket.off('notice_pinned_status');
                socket.off('notice_updated');
                socket.off('notice_deleted');
            };
        }
    }, [socketRef]);

    const fetchNotices = async () => {
        try {
            setLoadingNotices(true);
            const response = await noticesApi.getFacultyNotices();
            if (response.data.success) {
                setNotices(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load notices');
        } finally {
            setLoadingNotices(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are supported.');
                e.target.value = null;
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size exceeds the 10MB limit.');
                e.target.value = null;
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            let fileUrl = null;
            if (selectedFile) {
                setUploadingFile(true);
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await uploadApi.uploadPDF(formData);
                if (uploadRes.data.success) {
                    fileUrl = uploadRes.data.file_url;
                } else {
                    toast.error('File upload failed. Notice not posted.');
                    setUploadingFile(false);
                    return;
                }
            }

            const noticeData = {
                title: newNotice.title,
                content: newNotice.content,
                target_role: 'student',
                target_course_id: scope === 'course' ? parseInt(newNotice.target_course_id) : null,
                target_dept: scope === 'department' ? newNotice.target_dept : null,
                target_semester: scope === 'department' && newNotice.target_semester !== '' ? parseInt(newNotice.target_semester) : null,
                file_url: fileUrl,
                is_urgent: newNotice.is_urgent
            };

            const response = await noticesApi.create(noticeData);
            if (response.data.success) {
                toast.success('Notice posted successfully!');
                setIsCreating(false);
                setSelectedFile(null);
                setNewNotice({
                    title: '',
                    content: '',
                    target_course_id: courses[0]?.id || '',
                    target_dept: user?.faculty_dept || 'CSE',
                    target_semester: '',
                    is_urgent: false
                });
                fetchNotices();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to post notice');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleTogglePin = async (id) => {
        try {
            const response = await noticesApi.pin(id);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchNotices();
            }
        } catch (error) {
            toast.error('Failed to change pinned status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            const response = await noticesApi.delete(id);
            if (response.data.success) {
                toast.success('Notice deleted successfully');
                fetchNotices();
            }
        } catch (error) {
            toast.error('Failed to delete notice');
        }
    };

    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

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
                        <button onClick={() => { setIsCreating(false); setSelectedFile(null); }}><X size={20} className="text-gray-400" /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notice Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                    placeholder="e.g. MST Schedule Update"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Target Scope</label>
                                <select
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                >
                                    <option value="course">Specific Course</option>
                                    <option value="department">Department Wide</option>
                                </select>
                            </div>

                            {scope === 'course' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Target Course</label>
                                    <select
                                        value={newNotice.target_course_id}
                                        onChange={(e) => setNewNotice({ ...newNotice, target_course_id: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                    >
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Dept</label>
                                        <select
                                            value={newNotice.target_dept}
                                            onChange={(e) => setNewNotice({ ...newNotice, target_dept: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                        >
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Semester</label>
                                        <select
                                            value={newNotice.target_semester}
                                            onChange={(e) => setNewNotice({ ...newNotice, target_semester: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                        >
                                            <option value="">All Semesters</option>
                                            {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content</label>
                            <textarea
                                required
                                value={newNotice.content}
                                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] font-medium"
                                placeholder="Write your notice announcement details here..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Attach PDF Document (Optional)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                            </div>
                            <div className="flex items-center gap-2 sm:justify-end">
                                <input
                                    type="checkbox"
                                    id="urgent"
                                    checked={newNotice.is_urgent}
                                    onChange={(e) => setNewNotice({ ...newNotice, is_urgent: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="urgent" className="text-sm font-bold text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} /> Mark as Urgent (Broadcasting popup notification)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                            <button
                                type="button"
                                onClick={() => { setIsCreating(false); setSelectedFile(null); }}
                                className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploadingFile}
                                className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50"
                            >
                                {uploadingFile ? 'Uploading file...' : 'Post Notice'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingNotices ? (
                    <div className="col-span-full py-16 text-center text-gray-500 font-bold">Loading notices board...</div>
                ) : notices.length > 0 ? (
                    notices.map(notice => (
                        <div
                            key={notice.id}
                            className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group
                                ${notice.is_pinned ? 'border-primary/40 bg-primary/[0.01]' : 'border-gray-100'}
                            `}
                        >
                            {notice.is_urgent && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 text-white flex items-center justify-center rotate-45 translate-x-8 -translate-y-8 text-[10px] font-bold uppercase tracking-tighter">
                                    Urgent
                                </div>
                            )}
                            <div className="flex items-start justify-between mb-4">
                                <div className="pr-12">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                        {notice.title}
                                        {Boolean(notice.is_pinned) && <Pin size={14} className="text-primary fill-primary" />}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {notice.course_code && (
                                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                Course: {notice.course_code}
                                            </span>
                                        )}
                                        {notice.target_dept && (
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                Dept: {notice.target_dept} {notice.target_semester ? `Sem ${notice.target_semester}` : 'All Semesters'}
                                            </span>
                                        )}
                                        {!notice.course_code && !notice.target_dept && (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                College Wide
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Clock size={12} /> {new Date(notice.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleTogglePin(notice.id)}
                                        title={notice.is_pinned ? 'Unpin Announcement' : 'Pin Announcement'}
                                        className={`p-2 rounded-lg transition-colors ${notice.is_pinned ? 'text-primary bg-primary/5 hover:bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
                                    >
                                        <Pin size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        title="Delete Announcement"
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4 whitespace-pre-line">
                                {notice.content}
                            </p>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                        BY
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold">Posted by You</span>
                                </div>
                                
                                {notice.file_url ? (
                                    <a
                                        href={`${backendUrl}${notice.file_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark bg-primary/5 px-3 py-1.5 rounded-xl transition-all"
                                    >
                                        <Paperclip size={12} /> Attachment PDF
                                    </a>
                                ) : (
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">No Attachment</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Bell size={48} className="mx-auto text-gray-200 mb-4 animate-bounce" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Notices Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Create your first announcement notice to share updates with your students.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notices;
