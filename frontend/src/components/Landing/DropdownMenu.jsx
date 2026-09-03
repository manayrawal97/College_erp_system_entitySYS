import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiArrowRight, HiOutlineSparkles } from 'react-icons/hi';
import { Landmark, BookOpen, GraduationCap, FlaskConical, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dropdownMenuData } from '../../data/dropdownMenuData';

const renderMenuIcon = (iconName) => {
    const props = { size: 16, className: 'shrink-0' };
    switch (iconName) {
        case 'landmark':
            return <Landmark {...props} />;
        case 'book':
            return <BookOpen {...props} />;
        case 'graduation':
            return <GraduationCap {...props} />;
        case 'research':
            return <FlaskConical {...props} />;
        case 'trophy':
            return <Trophy {...props} />;
        default:
            return <Sparkles {...props} />;
    }
};

const DropdownMenu = () => {
    const [activeMenu, setActiveMenu] = useState(null);

    return (
        <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-[80px] z-40 hidden lg:block shadow-sm">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between py-1">
                    <ul className="flex space-x-1">
                        {dropdownMenuData.map((menu, index) => (
                            <li
                                key={index}
                                className="relative"
                                onMouseEnter={() => setActiveMenu(index)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <button className={`flex items-center space-x-2 px-5 py-4 font-bold text-xs tracking-wider uppercase transition-all duration-200 rounded-xl ${activeMenu === index ? 'text-blue-600 bg-blue-50/70' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}>
                                    <span className={activeMenu === index ? 'text-blue-600' : 'text-slate-500'}>{renderMenuIcon(menu.icon)}</span>
                                    <span>{menu.title}</span>
                                    <HiChevronDown className={`transition-transform duration-200 text-slate-400 ${activeMenu === index ? 'rotate-180 text-blue-600' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {activeMenu === index && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute left-0 w-96 bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/90 p-5 z-50 top-full mt-1"
                                        >
                                            <div className="mb-3 pb-3 border-b border-slate-100 flex items-center justify-between">
                                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center">
                                                    <HiOutlineSparkles className="mr-1.5 text-blue-600" />
                                                    {menu.title} Sections
                                                </p>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">IIT Bombay</span>
                                            </div>

                                            <div className="space-y-1">
                                                {menu.items.map((item, i) => (
                                                    <Link
                                                        key={i}
                                                        to={item.path}
                                                        onClick={() => setActiveMenu(null)}
                                                        className="p-3 text-slate-800 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-all block group/item border border-transparent hover:border-blue-100"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-sm text-slate-900 group-hover/item:text-blue-600 transition-colors">
                                                                {item.name}
                                                            </span>
                                                            <HiArrowRight className="text-slate-400 opacity-0 group-hover/item:opacity-100 transform translate-x-[-6px] group-hover/item:translate-x-0 transition-all text-xs" />
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-1">
                                                            {item.desc}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center space-x-3 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200/60">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Admissions Open 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropdownMenu;
