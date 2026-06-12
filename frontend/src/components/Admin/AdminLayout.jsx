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
    <div className="flex h-screen bg-gray-50 dark:bg-navy-900 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-white dark:bg-navy-800 border-r border-gray-200 dark:border-navy-700 flex flex-col z-30`}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-gray-200 dark:border-navy-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">E</div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">EntitySYS</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold mx-auto">E</div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500 hidden lg:block"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700'}
              `}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-20 bg-gray-800 text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-navy-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between px-6 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-700 text-gray-500 lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserCircle size={28} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-navy-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
