import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut, User, Settings, ChevronDown, Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import StudentMobileMenu from './StudentMobileMenu';
import Footer from '../Landing/Footer.jsx';

const StudentPageLayout = ({ children }) => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto mb-4" />
                    <p className="text-gray-600 font-black">Loading Page...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen selection:bg-secondary selection:text-white bg-[#F8FAFC]">
            <div className="min-h-screen flex flex-col">
                {/* --- Navbar --- */}
                <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 md:px-8 py-4">
                    <div className="container mx-auto flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/student/dashboard" className="flex items-center space-x-3 group">
                            <div className="w-11 h-11 bg-gradient-premium rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:scale-105 transition-all">
                                E
                            </div>
                            <span className="text-2xl font-black text-primary tracking-tighter">
                                Entity<span className="text-secondary">SYS</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-10">
                            <Link to="/about" className="text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest">About</Link>

                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest cursor-pointer">
                                    <span>Academics</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 translate-y-2 group-hover:translate-y-0">
                                    <Link to="/courses" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Courses</Link>
                                    <Link to="/timetable" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Timetable</Link>
                                    <Link to="/syllabus" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Syllabus</Link>
                                </div>
                            </div>

                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest cursor-pointer">
                                    <span>Student Life</span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 translate-y-2 group-hover:translate-y-0">
                                    <Link to="/clubs" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Clubs</Link>
                                    <Link to="/events" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Events</Link>
                                    <Link to="/campus" className="block px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Campus</Link>
                                </div>
                            </div>

                            <Link to="/contact" className="text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest">Contact</Link>
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-3 md:space-x-5">
                            <button className="relative p-2.5 text-gray-500 hover:text-secondary transition-colors bg-gray-50 rounded-xl cursor-pointer">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">0</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden">
                                        {getInitials(user?.full_name)}
                                    </div>
                                    <span className="hidden md:block text-sm font-black text-gray-900">{user?.full_name}</span>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-72 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 z-[110]"
                                        >
                                            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                                                <p className="font-black text-gray-900 truncate">{user?.full_name}</p>
                                                <p className="text-xs text-gray-500 font-bold truncate mt-1">{user?.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Link to="/profile" className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600">
                                                    <User className="h-5 w-5 text-secondary" /> <span>My Profile</span>
                                                </Link>
                                                <Link to="/settings" className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600">
                                                    <Settings className="h-5 w-5 text-secondary" /> <span>Settings</span>
                                                </Link>
                                                <div className="border-t border-gray-100 my-3 pt-3">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-colors text-sm font-black cursor-pointer"
                                                    >
                                                        <LogOut className="h-5 w-5" /> <span>Logout</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2.5 bg-gray-50 rounded-xl text-gray-600 cursor-pointer"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Page Content --- */}
                <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 flex-grow">
                    {children}
                </main>

                {/* --- Mobile Sidebar Menu --- */}
                <StudentMobileMenu
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    handleLogout={handleLogout}
                />

                <Footer />
            </div>
        </div>
    );
};

export default StudentPageLayout;
