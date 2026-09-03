import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiArrowLeft,
    HiExternalLink,
    HiCheckCircle,
    HiAcademicCap,
    HiUserGroup,
    HiLightningBolt,
    HiOfficeBuilding,
    HiLibrary,
    HiBriefcase
} from 'react-icons/hi';
import { getFeatureDataByKey, featureCardsData } from '../../data/featureCardsData';

const iconMap = {
    'active-students': HiAcademicCap,
    'faculty-experts': HiUserGroup,
    'smart-ai': HiLightningBolt,
    'regional-campuses': HiOfficeBuilding,
    'programs': HiLibrary,
    'placement-rate': HiBriefcase
};

const FeatureDetailPage = () => {
    const { key } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Deduce feature key from route path if param isn't explicitly passed
    const pathKey = key || location.pathname.replace('/', '');
    const data = getFeatureDataByKey(pathKey);
    const IconComponent = iconMap[data.id] || HiAcademicCap;

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-900 pt-28 pb-20 px-6 relative overflow-hidden">
            {/* Background Decorative Ambient Mesh */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 via-purple-100/30 to-transparent rounded-full blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 via-indigo-50/30 to-transparent rounded-full blur-[140px] pointer-events-none"></div>

            <div className="container mx-auto max-w-5xl relative z-10">
                {/* Navigation Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 px-4 py-2 rounded-full mb-8 transition-all shadow-sm group"
                >
                    <HiArrowLeft className="group-hover:-translate-x-1 transition-transform text-slate-500" />
                    <span className="font-semibold text-sm">Back to Home</span>
                </button>

                {/* Hero Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl p-8 md:p-12 mb-10 border border-slate-200/80 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-widest mb-4 border border-blue-200/60">
                                {data.badge}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                                {data.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 font-medium">
                                {data.subtitle}
                            </p>
                        </div>

                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br ${data.color} text-white shadow-lg shrink-0`}>
                            <IconComponent className="text-4xl md:text-5xl" />
                        </div>
                    </div>

                    <p className="mt-8 pt-6 border-t border-slate-100 text-slate-600 text-lg leading-relaxed max-w-4xl font-normal">
                        {data.description}
                    </p>
                </motion.div>

                {/* Key Metrics Grid */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <span>Key Statistical Highlights</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {data.keyMetrics.map((metric, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                            >
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                                    {metric.label}
                                </p>
                                <p className="text-2xl font-black text-slate-900">
                                    {metric.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Detailed Features & Highlights */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        <span>Detailed Institutional Impact</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.highlights.map((highlight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-start space-x-4 hover:border-slate-300 transition-all"
                            >
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5 border border-emerald-100">
                                    <HiCheckCircle className="text-xl" />
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium text-base">
                                    {highlight}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Source Verification & Actions */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-1.5">Verified Official Institutional Data</h3>
                        <p className="text-slate-300 text-sm font-normal">
                            This data is sourced directly from official IIT Bombay public records (iitb.ac.in) for EntitySYS benchmark mapping.
                        </p>
                    </div>
                    <a
                        href={data.iitbLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md shrink-0 text-sm"
                    >
                        <span>Visit IIT Bombay Portal</span>
                        <HiExternalLink className="text-lg text-slate-700" />
                    </a>
                </div>

                {/* Other Features Navigation */}
                <div className="mt-16 pt-10 border-t border-slate-200">
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-5">Explore Other Institutional Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                        {Object.values(featureCardsData).map((feat) => {
                            const isSelected = feat.id === data.id;
                            return (
                                <button
                                    key={feat.id}
                                    onClick={() => navigate(`/${feat.id}`)}
                                    className={`p-4 rounded-2xl text-left border transition-all ${isSelected
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                                        : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <p className={`text-[11px] font-bold uppercase tracking-wider truncate mb-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                        {feat.title}
                                    </p>
                                    <p className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                        {feat.count}{feat.suffix}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureDetailPage;
