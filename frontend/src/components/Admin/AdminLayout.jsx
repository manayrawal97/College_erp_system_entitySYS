import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
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
    UserCircle
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
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden overscroll-contain"
                    onClick={() => setIsSidebarOpen(true)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 lg:relative
                    ${isSidebarOpen ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-[280px] lg:w-64'}
                    transition-all duration-300 ease-in-out
                    bg-white border-r border-gray-100 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.01)] overflow-x-hidden
                `}
            >
                {/* Sidebar Header */}
                <div className={`flex border-b border-gray-100 transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                        ? 'flex-col items-center gap-4 py-5 h-auto' 
                        : 'items-center justify-between p-4 h-16'
                }`}>
                    {/* Logo Block */}
                    <Link 
                        to="/admin/dashboard"
                        title={isSidebarOpen ? "EntitySYS Admin" : undefined}
                        className={`flex items-center cursor-pointer transition-all duration-300 ease-in-out ${
                            isSidebarOpen ? 'flex-col justify-center' : 'gap-3 pl-2'
                        }`}
                    >
                        {/* Logo Icon */}
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md shadow-primary/20 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            E
                        </div>
                        {/* Logo Text */}
                        {!isSidebarOpen && (
                            <div className="flex flex-col transition-all duration-300 ease-in-out overflow-hidden max-w-[180px] opacity-100">
                                <span className="text-lg font-bold text-gray-900 leading-tight whitespace-nowrap tracking-tight">EntitySYS</span>
                                <span className="text-[10px] font-semibold text-gray-400 tracking-wider leading-none mt-0.5 whitespace-nowrap">Admin Panel</span>
                            </div>
                        )}
                    </Link>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 border border-transparent hover:border-gray-100 shadow-sm transition-all duration-300 shrink-0 ${
                            isSidebarOpen ? 'order-first' : ''
                        }`}
                    >
                        <X size={18} className="lg:hidden" />
                        <Menu size={18} className="hidden lg:block" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(true) }}
                            title={isSidebarOpen ? item.name : undefined}
                            className={({ isActive }) => `
                                flex items-center rounded-xl transition-all duration-200 group relative
                                ${isSidebarOpen 
                                    ? 'w-11 h-11 justify-center mx-auto p-0' 
                                    : 'w-full p-2.5 px-3.5 gap-3'}
                                ${isActive
                                    ? 'bg-primary/[0.05] text-primary font-semibold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Indicator Bar */}
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary transition-all duration-300 ease-in-out ${
                                        isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
                                    }`} />
                                    
                                    <item.icon size={20} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
                                    
                                    {!isSidebarOpen && (
                                        <span className="text-sm transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap max-w-[200px] opacity-100">
                                            {item.name}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Profile & Logout Section at Bottom */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/30 space-y-1.5 overflow-x-hidden">
                    {/* User Profile Card */}
                    <div 
                        onClick={() => navigate('/profile')}
                        title={isSidebarOpen ? user?.full_name : undefined}
                        className={`flex items-center rounded-xl hover:bg-gray-100/60 transition-all duration-200 cursor-pointer overflow-hidden ${
                            isSidebarOpen 
                                ? 'w-11 h-11 justify-center mx-auto p-0' 
                                : 'w-full p-2 gap-2.5'
                        }`}
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        {/* Info */}
                        {!isSidebarOpen && (
                            <div className="flex flex-col transition-all duration-300 ease-in-out overflow-hidden max-w-[150px] opacity-100">
                                <span className="text-sm font-semibold text-gray-800 truncate leading-tight">{user?.full_name || 'Admin'}</span>
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate leading-none mt-0.5">{user?.role || 'Administrator'}</span>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        title={isSidebarOpen ? 'Logout' : undefined}
                        className={`flex items-center rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-medium cursor-pointer ${
                            isSidebarOpen 
                                ? 'w-11 h-11 justify-center mx-auto p-0' 
                                : 'w-full p-2 px-2.5 gap-2.5'
                        }`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isSidebarOpen && (
                            <span className="transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-sm max-w-[150px] opacity-100">
                                Logout
                            </span>
                        )}
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
