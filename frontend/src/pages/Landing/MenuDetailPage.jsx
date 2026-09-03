import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiExternalLink, HiCheckCircle, HiAcademicCap, HiSparkles } from 'react-icons/hi';
import { getMenuItemByPath } from '../../data/dropdownMenuData';

const MenuDetailPage = () => {
    const { itemPath } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const currentPath = itemPath ? `/${itemPath}` : location.pathname;
    const itemData = getMenuItemByPath(currentPath);

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-900 pt-28 pb-20 px-6 relative overflow-hidden">
            {/* Background Ambient Gradient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100/40 to-purple-100/30 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-4 py-2 rounded-full mb-8 transition-all shadow-sm group"
                >
                    <HiArrowLeft className="group-hover:-translate-x-1 transition-transform text-slate-500" />
                    <span className="font-semibold text-sm">Back to Home</span>
                </button>

                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl p-8 md:p-12 mb-10 border border-slate-200/80 shadow-xl shadow-slate-200/50"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider border border-blue-200/60 flex items-center">
                            <HiSparkles className="mr-1.5 text-blue-500" />
                            {itemData.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        {itemData.name}
                    </h1>

                    <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
                        {itemData.desc}
                    </p>

                    <div className="pt-6 border-t border-slate-100">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Institutional Detail</h2>
                        <p className="text-slate-700 text-lg leading-relaxed font-normal">
                            {itemData.detail}
                        </p>
                    </div>
                </motion.div>

                {/* Information Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm mb-10">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                        <HiCheckCircle className="text-emerald-500 text-2xl" />
                        <span>Key Highlights & Resources</span>
                    </h2>
                    <ul className="space-y-3 text-slate-600 text-base">
                        <li className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                            <HiAcademicCap className="text-blue-600 text-xl shrink-0" />
                            <span>Official records managed by IIT Bombay Academic Administration.</span>
                        </li>
                        <li className="flex items-center space-x-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                            <HiAcademicCap className="text-blue-600 text-xl shrink-0" />
                            <span>Synchronized with EntitySYS University ERP modules.</span>
                        </li>
                    </ul>
                </div>

                {/* Action Banner */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Official IIT Bombay Portal</h3>
                        <p className="text-slate-300 text-sm">Verify details on the official institute portal (iitb.ac.in).</p>
                    </div>
                    <a
                        href="https://www.iitb.ac.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md shrink-0 text-sm"
                    >
                        <span>Visit iitb.ac.in</span>
                        <HiExternalLink className="text-lg text-slate-700" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MenuDetailPage;
