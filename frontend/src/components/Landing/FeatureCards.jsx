import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineAcademicCap,
    HiOutlineUserGroup,
    HiOutlineLibrary,
    HiOutlineBriefcase,
    HiOutlineOfficeBuilding,
    HiOutlineLightningBolt,
    HiArrowRight,
    HiX,
    HiExternalLink,
    HiCheckCircle
} from 'react-icons/hi';
import { featureCardsData } from '../../data/featureCardsData';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const Counter = ({ value, suffix = "", duration = 2 }) => {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true });

    useEffect(() => {
        if (isInView) {
            const numericValue = parseInt(value.toString().replace(/[^0-9]/g, ''));
            if (isNaN(numericValue)) {
                setCount(value);
                return;
            }

            let start = 0;
            const end = numericValue;
            let totalMiliseconds = duration * 1000;
            let incrementTime = (totalMiliseconds / end);

            let timer = setInterval(() => {
                start += Math.ceil(end / 100);
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, incrementTime > 10 ? incrementTime : 10);

            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    const displayValue = typeof count === 'number' ? count.toLocaleString() : count;
    return <span ref={nodeRef}>{displayValue}{suffix}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, link, count, suffix, index, color, onCardClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            onClick={onCardClick}
            className="group relative cursor-pointer"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] shadow-xl group-hover:shadow-2xl transition-all duration-500"></div>
            <div className={`absolute -inset-px bg-gradient-to-br ${color} rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

            <div className="relative p-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${color} text-white`}>
                    <Icon className="text-3xl" />
                </div>

                <div className="mb-4">
                    <h3 className="text-4xl font-black text-primary mb-1 tracking-tighter">
                        <Counter value={count} suffix={suffix} />
                    </h3>
                    <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
                </div>

                <p className="text-gray-500 leading-relaxed mb-8 flex-1 font-medium">
                    {description}
                </p>

                <div className="inline-flex items-center space-x-2 font-bold text-primary group-hover:text-secondary transition-colors">
                    <span>Explore Details</span>
                    <HiArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
};

const FeatureCards = () => {
    const navigate = useNavigate();
    const [selectedFeature, setSelectedFeature] = useState(null);

    const features = [
        {
            id: "active-students",
            icon: HiOutlineAcademicCap,
            count: "10000",
            suffix: "+",
            title: "Active Students",
            description: "Driving digital excellence and personalized learning pathways for every student.",
            link: "/students",
            color: "from-blue-500 to-cyan-400"
        },
        {
            id: "faculty-experts",
            icon: HiOutlineUserGroup,
            count: "500",
            suffix: "+",
            title: "Faculty Experts",
            description: "Empowering educators with world-class administrative and research tools.",
            link: "/faculty",
            color: "from-purple-500 to-pink-400"
        },
        {
            id: "smart-ai",
            icon: HiOutlineLightningBolt,
            count: "Smart",
            suffix: "",
            title: "AI Administration",
            description: "Automated decision-making and real-time analytics for modern governance.",
            link: "/admin-demo",
            color: "from-emerald-500 to-teal-400"
        },
        {
            id: "regional-campuses",
            icon: HiOutlineOfficeBuilding,
            count: "5",
            suffix: "+",
            title: "Regional Campuses",
            description: "Connected infrastructure ensuring unified experiences across all locations.",
            link: "/campuses",
            color: "from-amber-500 to-orange-400"
        },
        {
            id: "programs",
            icon: HiOutlineLibrary,
            count: "50",
            suffix: "+",
            title: "Programs",
            description: "Diverse academic portfolio spanning UG, PG, and specialized research.",
            link: "/courses",
            color: "from-indigo-500 to-blue-400"
        },
        {
            id: "placement-rate",
            icon: HiOutlineBriefcase,
            count: "95",
            suffix: "%",
            title: "Placement Rate",
            description: "Strategic partnerships with industry leaders for global career opportunities.",
            link: "/placements",
            color: "from-rose-500 to-red-400"
        }
    ];

    const activeData = selectedFeature ? featureCardsData[selectedFeature] : null;

    useBodyScrollLock(Boolean(selectedFeature && activeData));

    return (
        <section className="section-padding bg-slate-50 relative overflow-hidden" id="features">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] -ml-48 -mb-48"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mb-20">
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-secondary font-black uppercase tracking-widest text-sm mb-4"
                    >
                        Institutional Impact
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight"
                    >
                        Measuring Success through <br />
                        <span className="text-gradient">Real-world Data.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            {...feature}
                            index={index}
                            onCardClick={() => setSelectedFeature(feature.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Interactive Feature Data Modal */}
            <AnimatePresence>
                {selectedFeature && activeData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeature(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>

                        {/* Modal Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/90 z-10 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedFeature(null)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                            >
                                <HiX className="text-xl" />
                            </button>

                            {/* Badge & Title */}
                            <div className="mb-6">
                                <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-200/60">
                                    {activeData.badge}
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                    {activeData.title}
                                </h3>
                                <p className="text-slate-600 font-medium mt-1 text-sm sm:text-base">
                                    {activeData.subtitle}
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-slate-600 text-base leading-relaxed mb-8 font-normal">
                                {activeData.description}
                            </p>

                            {/* Key Metrics */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4">
                                    Official Metrics & Figures
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeData.keyMetrics.map((metric, i) => (
                                        <div key={i} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                                            <p className="text-xs text-slate-500 font-semibold">{metric.label}</p>
                                            <p className="text-xl font-black text-slate-900 mt-1">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="mb-8">
                                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4">
                                    Key Institutional Highlights
                                </h4>
                                <div className="space-y-3">
                                    {activeData.highlights.map((h, i) => (
                                        <div key={i} className="flex items-start space-x-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
                                            <HiCheckCircle className="text-emerald-600 text-lg shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-700 font-medium leading-normal">{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                                <button
                                    onClick={() => {
                                        setSelectedFeature(null);
                                        navigate(`/${activeData.id}`);
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors text-center"
                                >
                                    Open Full Detail Page
                                </button>

                                <a
                                    href={activeData.iitbLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-sm text-white flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <span>Verify on iitb.ac.in</span>
                                    <HiExternalLink className="text-base text-slate-300" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FeatureCards;
