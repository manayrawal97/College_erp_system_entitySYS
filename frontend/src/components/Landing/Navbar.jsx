import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt3, HiX, HiChevronDown, HiArrowRight } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    useBodyScrollLock(isOpen);
    const [isScrolled, setIsScrolled] = useState(false);
    const [loginDropdown, setLoginDropdown] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'About', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ];

    const loginOptions = [
        { name: 'Student Portal', path: '/login', desc: 'Grades, attendance & fees' },
        { name: 'Faculty Portal', path: '/login', desc: 'LMS & administration' },
        { name: 'Admin Dashboard', path: '/login', desc: 'System management' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'glass py-3 shadow-xl' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3 group" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-transform shadow-lg">
                            <span className="text-white font-black text-2xl">E</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-primary' : 'text-white'}`}>
                            Entity<span className="text-secondary">SYS</span>
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isScrolled ? 'text-gray-400' : 'text-blue-200'}`}>
                            University ERP
                        </span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`font-semibold text-sm uppercase tracking-wider transition-all hover:text-secondary relative group ${isScrolled ? 'text-primary' : 'text-white'
                                }`}
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                        </Link>
                    ))}

                    {/* Login Dropdown */}
                    <div className="relative"
                        onMouseEnter={() => setLoginDropdown(true)}
                        onMouseLeave={() => setLoginDropdown(false)}>
                        <button
                            className={`flex items-center space-x-2 font-semibold text-sm uppercase tracking-wider transition-all group ${isScrolled ? 'text-primary' : 'text-white'
                                } hover:text-secondary`}
                        >
                            <span>ERP Login</span>
                            <HiChevronDown className={`transition-transform duration-300 ${loginDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {loginDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100"
                                >
                                    <div className="space-y-1">
                                        {loginOptions.map((option) => (
                                            <Link
                                                key={option.name}
                                                to={option.path}
                                                className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                                            >
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-secondary group-hover/item:text-white transition-colors">
                                                    <HiArrowRight />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-primary">{option.name}</p>
                                                    <p className="text-[11px] text-gray-400">{option.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        to="/register"
                        className="bg-primary text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-secondary/20 hover:bg-secondary transition-all transform hover:-translate-y-1"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={`lg:hidden text-3xl transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}
                    onClick={toggleMenu}
                >
                    {isOpen ? <HiX /> : <HiMenuAlt3 />}
                </button>
            </div>

            {/* Mobile Drawer (Simplified for brevity but styled premium) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-0 h-screen w-full bg-primary z-[60] p-8 flex flex-col overscroll-contain"
                    >
                        <div className="flex justify-between items-center mb-16">
                            <span className="text-3xl font-black text-white italic">E-SYS</span>
                            <button onClick={toggleMenu} className="text-4xl text-white">
                                <HiX />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {[
                                { name: 'About', path: '/about' },
                                { name: 'Contact Us', path: '/contact' },
                                { name: 'Student Login', path: '/login' },
                                { name: 'Faculty Login', path: '/login' },
                                { name: 'Admin Login', path: '/login' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="block text-4xl font-bold text-white/50 hover:text-secondary transition-colors"
                                    onClick={toggleMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Link
                                to="/register"
                                onClick={toggleMenu}
                                className="block w-full bg-white text-primary text-center py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
