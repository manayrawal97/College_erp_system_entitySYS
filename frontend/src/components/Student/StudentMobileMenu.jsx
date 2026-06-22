import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';

const StudentMobileMenu = ({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleLogout
}) => {
    return (
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 z-[120] bg-navy/60 backdrop-blur-sm lg:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 z-[130] w-80 bg-white p-8 lg:hidden overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center text-white font-black text-xl">E</div>
                                <span className="text-2xl font-black text-primary tracking-tighter italic">EntitySYS</span>
                            </div>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="p-2 bg-gray-50 rounded-xl text-gray-400 cursor-pointer"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Navigation</h4>
                                <ul className="space-y-6">
                                    {['About', 'Courses', 'Timetable', 'Syllabus', 'Clubs', 'Events', 'Campus', 'Contact'].map(item => (
                                        <li key={item}>
                                            <Link
                                                to={`/${item.toLowerCase()}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="text-2xl font-black text-gray-900 hover:text-secondary transition-colors block"
                                            >
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-10 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-4 text-red-500 font-black text-xl cursor-pointer"
                                >
                                    <LogOut className="h-6 w-6" /> <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default StudentMobileMenu;
