import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Bell,
    FileText,
    CreditCard,
    BarChart3,
    LogOut,
    Menu,
    X,
    UserCircle,
    ChevronRight
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'User Management', icon: Users, path: '/admin/users' },
        { name: 'Course Management', icon: BookOpen, path: '/admin/courses' },
        { name: 'Notice Board', icon: Bell, path: '/admin/notices' },
        { name: 'Exams & Grades', icon: FileText, path: '/admin/exams' },
        { name: 'Fee Management', icon: CreditCard, path: '/admin/fees' },
        { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar Overlay (Mobile) */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
 fixed inset-y-0 left-0 z-50 lg:relative
 ${isSidebarOpen ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-[280px] lg:w-64'}
 transition-all duration-300 ease-in-out
 bg-white border-r border-gray-200 flex flex-col
 `}
            >
                <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200">
                    {(isSidebarOpen && window.innerWidth >= 1024) ? (
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold mx-auto">E</div>
                    ) : (
                        <div className="flex items-center gap-2 pl-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">E</div>
                            <span className="text-xl font-bold text-gray-900">EntitySYS</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={20} className="lg:hidden" />
                        <Menu size={20} className="hidden lg:block" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(true) }}
                            className={({ isActive }) => `
 flex items-center gap-3 p-3.5 rounded-xl transition-all group relative
 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'text-gray-600 hover:bg-gray-100 '}
 `}
                        >
                            <item.icon size={22} className="shrink-0" />
                            <span className={`font-medium transition-opacity duration-200 ${isSidebarOpen && window.innerWidth >= 1024 ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                                {item.name}
                            </span>

                            {isSidebarOpen && window.innerWidth >= 1024 && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3.5 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                    >
                        <LogOut size={22} className="shrink-0" />
                        <span className={`${isSidebarOpen && window.innerWidth >= 1024 ? 'lg:hidden' : 'block'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2.5 rounded-xl bg-gray-50 text-gray-600 lg:hidden"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                        <div className="text-right hidden xs:block">
                            <p className="text-sm font-bold text-gray-900 leading-tight">{user?.full_name || 'Admin'}</p>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">{user?.role}</p>
                        </div>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer overflow-hidden shadow-sm"
                            >
                                <UserCircle size={28} />
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsProfileOpen(false)}
                                    ></div>
                                    <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.email}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            <UserCircle size={18} className="text-gray-400" /> My Profile
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-50 mt-1"
                                        >
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-gray-50 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
