import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, X, FileBadge, Download } from 'lucide-react';

const StudentNoticeModal = ({
    selectedNotice,
    setSelectedNotice,
    formatDate,
    getRelativeTime,
    backendUrl
}) => {
    return (
        <AnimatePresence>
            {selectedNotice && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNotice(null)}
                        className="absolute inset-0 bg-navy/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-4">
                                    <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                        {selectedNotice.category || 'Announcement'}
                                    </span>
                                    <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                                        {selectedNotice.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> {formatDate(selectedNotice.created_at || selectedNotice.date)}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" /> {getRelativeTime(selectedNotice.created_at || selectedNotice.date)}
                                        </span>
                                        {selectedNotice.posted_by_name && (
                                            <span className="flex items-center gap-2 text-secondary">
                                                <User className="h-4 w-4" /> Posted by {selectedNotice.posted_by_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all shadow-sm cursor-pointer"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="prose max-w-none mb-10">
                                <p className="text-gray-600 leading-[1.6] font-bold text-base md:text-lg">
                                    {selectedNotice.content}
                                </p>
                            </div>

                            {selectedNotice.file_url && (
                                <a
                                    href={`${backendUrl}${selectedNotice.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-5 w-full p-6 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50/80 transition-all group cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                        <FileBadge className="h-8 w-8" />
                                    </div>
                                    <div className="text-left flex-grow">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-wider">View / Download Attachment</p>
                                        <p className="text-xs text-emerald-600 font-bold mt-1">
                                            {selectedNotice.file_url.split('/').pop() || `Notice_Doc_${selectedNotice.id}.pdf`}
                                        </p>
                                    </div>
                                    <Download className="h-6 w-6 text-emerald-500" />
                                </a>
                            )}
                        </div>
                        <div className="bg-gray-50 p-6 md:p-8 flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                            >
                                CLOSE
                            </button>
                            <button
                                className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/30 cursor-pointer"
                            >
                                SHARE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StudentNoticeModal;
