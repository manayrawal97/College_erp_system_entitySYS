import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, Clock, Calendar, X, Download } from 'lucide-react';
import { NoticeSkeleton } from './StudentComponents';

const StudentNoticeBoard = ({
    notices,
    noticesLoading,
    noticesError,
    activeCategory,
    setActiveCategory,
    setSelectedNotice,
    fetchNotices,
    formatDate,
    getRelativeTime
}) => {
    return (
        <div className="area-notices mb-6 md:mb-0">
            <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 h-full border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Bell className="h-6 w-6 text-secondary" />
                            Notice Board
                        </h2>
                        <p className="text-sm text-gray-500 font-bold mt-1">Real-time academic updates</p>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 self-start">
                        {['all', 'College', 'Exam', 'Event'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat.toLowerCase())}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all relative cursor-pointer ${
                                    activeCategory === cat.toLowerCase()
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {activeCategory === cat.toLowerCase() && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-secondary rounded-xl shadow-lg shadow-secondary/30"
                                    />
                                )}
                                <span className="relative z-10">{cat.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notices List - Fully Scrollable */}
                <div className="space-y-5 flex-grow overflow-y-auto pr-3 custom-scrollbar min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {noticesLoading ? (
                            [1, 2, 3, 4].map(i => <NoticeSkeleton key={i} />)
                        ) : noticesError ? (
                            <div className="text-center py-20 bg-red-50 rounded-[2rem] border-2 border-dashed border-red-100">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <p className="text-red-600 font-black mb-4">{noticesError}</p>
                                <button
                                    onClick={fetchNotices}
                                    className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 cursor-pointer"
                                >
                                    Retry Loading
                                </button>
                            </div>
                        ) : notices.length > 0 ? (
                            notices.map((notice, index) => (
                                <motion.div
                                    key={notice.id || index}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedNotice(notice)}
                                    className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden ${
                                        index === 0 ? 'border-secondary/50 ring-2 ring-secondary/5' : 'border-gray-100'
                                    }`}
                                >
                                    {index === 0 && (
                                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-secondary text-white text-[9px] font-black rounded-bl-2xl uppercase tracking-widest shadow-sm">
                                            Latest
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${
                                                notice.category === 'Exam' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                notice.category === 'Event' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                notice.category === 'College' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {notice.category || 'NOTICE'}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                                                <Clock className="h-3 w-3" />
                                                {getRelativeTime(notice.created_at || notice.date)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(notice.created_at || notice.date)}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-secondary transition-colors leading-tight">
                                        {notice.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">
                                        {notice.content}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs font-black text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read Full Notice <X className="h-3 w-3 rotate-180" />
                                        </span>
                                        {notice.file_url && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                <Download className="h-3.5 w-3.5" />
                                                PDF ATTACHED
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                                    <Bell className="h-10 w-10 text-gray-200" />
                                </div>
                                <h4 className="text-lg font-black text-gray-900 mb-2">No Notices Available</h4>
                                <p className="text-sm text-gray-400 font-bold">All caught up! Check back later for updates.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentNoticeBoard;
