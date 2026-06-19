import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, CalendarCheck, GraduationCap, Bell, MessageSquare, User, LogOut,
    ChevronDown, X, Menu, Edit } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { coursesApi, dashboardApi } from '../../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

import FacultyDashboardView, { FeesSection } from '../../components/Faculty/FacultyDashboardView';
import Attendance from '../../components/Faculty/Attendance';
import Grades from '../../components/Faculty/Grades';
import Notices from '../../components/Faculty/Notices';
import Community from '../../components/Faculty/Community';
import MyCourses from '../../components/Faculty/My Courses';

const FacultyDashboard = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!loading && courses.length > 0) {
            // Setup Socket.io for Faculty
            const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
            socketRef.current = io(socketUrl, {
                auth: { token: localStorage.getItem('token') }
            });

            socketRef.current.on('connect', () => {
                socketRef.current.emit('join_room', {
                    role: 'faculty',
                    department: user?.faculty_dept,
                    course_ids: courses.map(c => c.id)
                });
            });

            return () => {
                if (socketRef.current) socketRef.current.disconnect();
            };
        }
    }, [courses, loading, user]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [coursesRes, statsRes] = await Promise.all([
                coursesApi.getFacultyCourses(),
                dashboardApi.getStats()
            ]);

            if (coursesRes.data.success) {
                setCourses(coursesRes.data.data);
            }

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        try {
            const statsRes = await dashboardApi.getStats();
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'F';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // Render Section Content
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <FacultyDashboardView
                        stats={stats}
                        loading={loading}
                        courses={courses}
                        setActiveSection={setActiveSection}
                        selectedCourseId={selectedCourseId}
                        setSelectedCourseId={setSelectedCourseId}
                    />
                );
            case 'attendance':
                return <Attendance courses={courses} preselectedCourseId={selectedCourseId} onSaved={refreshStats} />;
            case 'grades':
                return <Grades courses={courses} preselectedCourseId={selectedCourseId} onSaved={refreshStats} />;
            case 'notices':
                return <Notices courses={courses} socketRef={socketRef} preselectedCourseId={selectedCourseId} />;
            case 'fees':
                return <FeesSection courses={courses} />;
            case 'community':
                return <Community socketRef={socketRef} courses={courses} />;
            case 'my-courses':
                return (
                    <MyCourses
                        courses={courses}
                        setActiveSection={setActiveSection}
                        selectedCourseId={selectedCourseId}
                        setSelectedCourseId={setSelectedCourseId}
                    />
                );
            default:
                return <div className="text-center py-20 text-gray-500">Section {activeSection} coming soon</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left Side: Logo */}
                        <div className="flex items-center gap-2">
                            <Link to="/faculty/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">E</div>
                                <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">EntitySYS</span>
                            </Link>
                        </div>

                        {/* Center: Navigation Links (Desktop) */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                                { id: 'grades', label: 'Grades', icon: GraduationCap },
                                { id: 'notices', label: 'Notices', icon: Bell },
                                { id: 'community', label: 'Community', icon: MessageSquare },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                        ${activeSection === item.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </button>
                            ))}
                            <div className="relative group ml-1">
                                <button
                                    onClick={() => setActiveSection('my-courses')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSection === 'my-courses' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <BookOpen size={18} />
                                    My Courses
                                    <ChevronDown size={14} />
                                </button>
                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    {courses.map(course => (
                                        <button
                                            key={course.id}
                                            onClick={() => setActiveSection('my-courses')}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                                        >
                                            {course.course_code} - {course.course_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </nav>

                        {/* Right Side: Profile & Notifications */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <div className="hidden sm:block text-right">
                                        <p className="text-xs font-bold text-gray-900 leading-tight">{user?.full_name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight">{user?.role}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {getInitials(user?.full_name)}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <>
                                        {/* Global Click-away Backdrop */}
                                        <div
                                            className="fixed inset-0 z-[100]"
                                            onClick={() => setIsProfileOpen(false)}
                                        ></div>

                                        <div className="absolute top-full right-0 mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[110]">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{user?.email}</p>
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        navigate('/profile');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all font-medium text-left"
                                                >
                                                    <User size={18} className="text-gray-400 group-hover:text-primary" /> My Profile
                                                </button>
                                                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium text-left">
                                                    <Edit size={18} className="text-gray-400" /> Settings
                                                </button>
                                                <div className="h-px bg-gray-50 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-left"
                                                >
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600 lg:hidden"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                            { id: 'grades', label: 'Grades', icon: GraduationCap },
                            { id: 'notices', label: 'Notices', icon: Bell },
                            { id: 'community', label: 'Community', icon: MessageSquare },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold
                                    ${activeSection === item.id
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-50'}
                                `}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>

            {/* Bottom Nav for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                {[
                    { id: 'dashboard', icon: LayoutDashboard },
                    { id: 'attendance', icon: CalendarCheck },
                    { id: 'grades', icon: GraduationCap },
                    { id: 'community', icon: MessageSquare },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`p-2 rounded-xl transition-all ${activeSection === item.id ? 'bg-primary text-white' : 'text-gray-400'}`}
                    >
                        <item.icon size={22} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FacultyDashboard;




// import React, { useState, useEffect, useRef } from 'react';
// import {
//     LayoutDashboard,
//     BookOpen,
//     CalendarCheck,
//     GraduationCap,
//     Bell,
//     MessageSquare,
//     User,
//     LogOut,
//     ChevronDown,
//     Search,
//     MoreVertical,
//     Clock,
//     Users,
//     CheckCircle,
//     AlertCircle,
//     Download,
//     Upload,
//     Send,
//     Plus,
//     Filter,
//     X,
//     Menu,
//     Trash2,
//     Edit,
//     Paperclip,
//     CreditCard
// } from 'lucide-react';
// import { useAuthContext } from '../../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import {
//     coursesApi,
//     attendanceApi,
//     gradesApi,
//     feesApi,
//     noticesApi,
//     dashboardApi
// } from '../../services/api';
// import toast from 'react-hot-toast';
// import { storage } from '../../utils/storage';
// import FacultyKPICards from '../../components/Faculty/FacultyKPICards';

// const FacultyDashboard = () => {
//     const { user, logout } = useAuthContext();
//     const navigate = useNavigate();
//     const [activeSection, setActiveSection] = useState('dashboard');
//     const [stats, setStats] = useState(null);
//     const [courses, setCourses] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isProfileOpen, setIsProfileOpen] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//     useEffect(() => {
//         fetchInitialData();
//     }, []);

//     const fetchInitialData = async () => {
//         try {
//             setLoading(true);
//             const [coursesRes, statsRes] = await Promise.all([
//                 coursesApi.getFacultyCourses(),
//                 dashboardApi.getStats()
//             ]);

//             if (coursesRes.data.success) {
//                 setCourses(coursesRes.data.data);
//             }

//             if (statsRes.data.success) {
//                 setStats(statsRes.data.data);
//             }
//         } catch (error) {
//             console.error('Error fetching dashboard data:', error);
//             toast.error('Failed to load dashboard statistics');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     const getInitials = (name) => {
//         if (!name) return 'F';
//         return name.split(' ').map(n => n[0]).join('').toUpperCase();
//     };

//     const CoursesOverview = () => (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-gray-900">My Assigned Courses</h2>
//                 <button className="text-primary font-medium hover:underline text-sm">View All</button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {courses.length > 0 ? courses.map((course) => (
//                     <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/30 transition-colors group">
//                         <div className="p-6">
//                             <div className="flex justify-between items-start mb-4">
//                                 <div>
//                                     <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                                         <BookOpen size={18} className="text-primary" />
//                                         {course.course_code} - {course.course_name}
//                                     </h3>
//                                     <p className="text-gray-500 text-sm mt-1">
//                                         Department: {course.department} | Section: {course.section || 'A'} | Semester: {course.semester}
//                                     </p>
//                                 </div>
//                                 <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
//                                     Active
//                                 </span>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4 my-6">
//                                 <div className="bg-gray-50 p-3 rounded-xl">
//                                     <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Students</p>
//                                     <p className="text-lg font-bold text-gray-900">{course.student_count || 0}/60</p>
//                                 </div>
//                                 <div className="bg-gray-50 p-3 rounded-xl">
//                                     <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Avg Attendance</p>
//                                     <p className="text-lg font-bold text-gray-900">{course.attendance_rate || '82%'}</p>
//                                 </div>
//                             </div>

//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => setActiveSection('attendance')}
//                                     className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors"
//                                 >
//                                     Mark Attendance
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveSection('grades')}
//                                     className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
//                                 >
//                                     Enter Grades
//                                 </button>
//                                 <button className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
//                                     <MoreVertical size={16} />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )) : (
//                     <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
//                         <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
//                         <p className="text-gray-500 font-medium">No courses assigned yet.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     // Render Section Content
//     const renderContent = () => {
//         switch (activeSection) {
//             case 'dashboard':
//                 return (
//                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//                         <FacultyKPICards stats={stats} loading={loading} />
//                         <CoursesOverview />
//                     </div>
//                 );
//             case 'attendance':
//                 return <AttendanceSection courses={courses} />;
//             case 'grades':
//                 return <GradesSection courses={courses} />;
//             case 'notices':
//                 return <NoticesSection courses={courses} />;
//             case 'fees':
//                 return <FeesSection courses={courses} />;
//             case 'community':
//                 return <CommunitySection />;
//             default:
//                 return <div className="text-center py-20 text-gray-500">Section {activeSection} coming soon</div>;
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
//             {/* Navbar */}
//             <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-16">
//                         {/* Left Side: Logo */}
//                         <div className="flex items-center gap-2">
//                             {/* <Link to="/dashboard" className="flex items-center gap-2"> */}
//                             <Link to="/faculty/dashboard" className="flex items-center gap-2">
//                                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">E</div>
//                                 <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">EntitySYS</span>
//                             </Link>
//                         </div>

//                         {/* Center: Navigation Links (Desktop) */}
//                         <nav className="hidden lg:flex items-center gap-1">
//                             {[
//                                 { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//                                 { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//                                 { id: 'grades', label: 'Grades', icon: GraduationCap },
//                                 { id: 'notices', label: 'Notices', icon: Bell },
//                                 { id: 'community', label: 'Community', icon: MessageSquare },
//                             ].map((item) => (
//                                 <button
//                                     key={item.id}
//                                     onClick={() => setActiveSection(item.id)}
//                                     className={`
//                                         flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
//                                         ${activeSection === item.id
//                                             ? 'bg-primary/10 text-primary'
//                                             : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
//                                     `}
//                                 >
//                                     <item.icon size={18} />
//                                     {item.label}
//                                 </button>
//                             ))}
//                             <div className="relative group ml-1">
//                                 <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
//                                     <BookOpen size={18} />
//                                     My Courses
//                                     <ChevronDown size={14} />
//                                 </button>
//                                 <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
//                                     {courses.map(course => (
//                                         <button
//                                             key={course.id}
//                                             className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
//                                         >
//                                             {course.course_code} - {course.course_name}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </nav>

//                         {/* Right Side: Profile & Notifications */}
//                         <div className="flex items-center gap-2 sm:gap-4">
//                             <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
//                                 <Bell size={20} />
//                                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
//                             </button>

//                             <div className="relative">
//                                 <button
//                                     onClick={() => setIsProfileOpen(!isProfileOpen)}
//                                     className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
//                                 >
//                                     <div className="hidden sm:block text-right">
//                                         <p className="text-xs font-bold text-gray-900 leading-tight">{user?.full_name}</p>
//                                         <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight">{user?.role}</p>
//                                     </div>
//                                     <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
//                                         {getInitials(user?.full_name)}
//                                     </div>
//                                 </button>

//                                 {isProfileOpen && (
//                                     <>
//                                         {/* Global Click-away Backdrop */}
//                                         <div 
//                                             className="fixed inset-0 z-[100]" 
//                                             onClick={() => setIsProfileOpen(false)}
//                                         ></div>
                                        
//                                         <div className="absolute top-full right-0 mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[110]">
//                                             <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
//                                                 <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
//                                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{user?.email}</p>
//                                             </div>
//                                             <div className="p-1">
//                                                 <button 
//                                                     onClick={() => {
//                                                         setIsProfileOpen(false);
//                                                         navigate('/profile');
//                                                     }}
//                                                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all font-medium text-left"
//                                                 >
//                                                     <User size={18} className="text-gray-400 group-hover:text-primary" /> My Profile
//                                                 </button>
//                                                 <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium text-left">
//                                                     <Edit size={18} className="text-gray-400" /> Settings
//                                                 </button>
//                                                 <div className="h-px bg-gray-50 my-1"></div>
//                                                 <button
//                                                     onClick={handleLogout}
//                                                     className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-left"
//                                                 >
//                                                     <LogOut size={18} /> Logout
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </>
//                                 )}
//                             </div>

//                                 {/* <AnimatePresence>
//                                     {isProfileOpen && (
//                                         <motion.div
//                                             initial={{ opacity: 0, y: 15, scale: 0.95 }}
//                                             animate={{ opacity: 1, y: 0, scale: 1 }}
//                                             exit={{ opacity: 0, y: 15, scale: 0.95 }}
//                                             className="absolute right-0 mt-4 w-72 bg-white shadow-2xl rounded-3xl p-4 border border-gray-100 z-[110]"
//                                         >
//                                             <div className="p-4 bg-gray-50 rounded-2xl mb-4">
//                                                 <p className="font-black text-gray-900 truncate">{user.full_name}</p>
//                                                 <p className="text-xs text-gray-500 font-bold truncate mt-1">{user.email}</p>
//                                             </div>
//                                             <div className="space-y-1">
//                                                 <Link to="/profile" className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600">
//                                                     <User className="h-5 w-5 text-secondary" /> <span>My Profile</span>
//                                                 </Link>
//                                                 <Link to="/settings" className="flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600">
//                                                     <Settings className="h-5 w-5 text-secondary" /> <span>Settings</span>
//                                                 </Link>
//                                                 <div className="border-t border-gray-100 my-3 pt-3">
//                                                     <button
//                                                         onClick={handleLogout}
//                                                         className="w-full flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-colors text-sm font-black"
//                                                     >
//                                                         <LogOut className="h-5 w-5" /> <span>Logout</span>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence> */}

//                             </div>

//                             {/* Mobile Menu Toggle */}
//                             <button
//                                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                                 className="p-2 text-gray-600 lg:hidden"
//                             >
//                                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//                             </button>
//                         </div>
//                     </div>

//                 {/* Mobile Navigation */}
//                 {isMobileMenuOpen && (
//                     <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2">
//                         {[
//                             { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//                             { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
//                             { id: 'grades', label: 'Grades', icon: GraduationCap },
//                             { id: 'notices', label: 'Notices', icon: Bell },
//                             { id: 'community', label: 'Community', icon: MessageSquare },
//                         ].map((item) => (
//                             <button
//                                 key={item.id}
//                                 onClick={() => {
//                                     setActiveSection(item.id);
//                                     setIsMobileMenuOpen(false);
//                                 }}
//                                 className={`
//                                     flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold
//                                     ${activeSection === item.id
//                                         ? 'bg-primary text-white'
//                                         : 'text-gray-600 hover:bg-gray-50'}
//                                 `}
//                             >
//                                 <item.icon size={20} />
//                                 {item.label}
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </header>

//             {/* Main Content Area */}
//             <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
//                 {loading ? (
//                     <div className="flex flex-col items-center justify-center py-20">
//                         <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//                         <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
//                     </div>
//                 ) : (
//                     renderContent()
//                 )}
//             </main>

//             {/* Bottom Nav for Mobile */}
//             <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
//                 {[
//                     { id: 'dashboard', icon: LayoutDashboard },
//                     { id: 'attendance', icon: CalendarCheck },
//                     { id: 'grades', icon: GraduationCap },
//                     { id: 'community', icon: MessageSquare },
//                 ].map((item) => (
//                     <button
//                         key={item.id}
//                         onClick={() => setActiveSection(item.id)}
//                         className={`p-2 rounded-xl transition-all ${activeSection === item.id ? 'bg-primary text-white' : 'text-gray-400'}`}
//                     >
//                         <item.icon size={22} />
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // --- Sub-Section Components ---

// const AttendanceSection = ({ courses }) => {
//     const [selectedCourse, setSelectedCourse] = useState('');
//     const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [attendanceData, setAttendanceData] = useState({});

//     useEffect(() => {
//         if (courses.length > 0 && !selectedCourse) {
//             setSelectedCourse(courses[0].id);
//         }
//     }, [courses]);

//     useEffect(() => {
//         if (selectedCourse) fetchStudents();
//     }, [selectedCourse]);

//     const fetchStudents = async () => {
//         try {
//             setLoading(true);
//             const response = await coursesApi.getCourseStudents(selectedCourse);
//             if (response.data.success) {
//                 setStudents(response.data.data);
//                 // Initialize attendance data as present for all
//                 const initial = {};
//                 response.data.data.forEach(s => {
//                     initial[s.id] = 'Present';
//                 });
//                 setAttendanceData(initial);
//             }
//         } catch (error) {
//             toast.error('Failed to load students');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleStatusChange = (studentId, status) => {
//         setAttendanceData(prev => ({ ...prev, [studentId]: status }));
//     };

//     const markAll = (status) => {
//         const updated = {};
//         students.forEach(s => { updated[s.id] = status; });
//         setAttendanceData(updated);
//     };

//     const saveAttendance = async () => {
//         try {
//             const data = {
//                 course_id: selectedCourse,
//                 date,
//                 attendance: Object.entries(attendanceData).map(([student_id, status]) => ({
//                     student_id,
//                     status,
//                     remarks: ''
//                 }))
//             };
//             const response = await attendanceApi.mark(data);
//             if (response.data.success) {
//                 toast.success('Attendance marked successfully');
//             }
//         } catch (error) {
//             toast.error('Failed to save attendance');
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in fade-in duration-500">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                     <CalendarCheck className="text-primary" /> Mark Attendance
//                 </h2>
//                 <div className="flex items-center gap-3">
//                     <select
//                         value={selectedCourse}
//                         onChange={(e) => setSelectedCourse(e.target.value)}
//                         className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
//                     >
//                         {courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
//                     </select>
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
//                     />
//                 </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//                 <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
//                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{students.length} Students Listed</span>
//                     <div className="flex gap-2">
//                         <button onClick={() => markAll('Present')} className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">MARK ALL PRESENT</button>
//                         <button onClick={() => markAll('Absent')} className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">MARK ALL ABSENT</button>
//                     </div>
//                 </div>
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="bg-gray-50/50">
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Remarks</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {students.map((student) => (
//                                 <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
//                                     <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
//                                     <td className="px-6 py-4 text-gray-500 text-sm font-medium">{student.enrollment_id || 'ENR202400' + student.id}</td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex gap-1">
//                                             {['Present', 'Absent', 'Late', 'Excused'].map(status => (
//                                                 <button
//                                                     key={status}
//                                                     onClick={() => handleStatusChange(student.id, status)}
//                                                     className={`
//                                                         px-3 py-1 rounded-lg text-[10px] font-bold transition-all
//                                                         ${attendanceData[student.id] === status
//                                                             ? (status === 'Present' ? 'bg-green-600 text-white' : status === 'Absent' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white')
//                                                             : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
//                                                     `}
//                                                 >
//                                                     {status.toUpperCase()}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <input type="text" placeholder="Add note..." className="bg-transparent border-none text-sm text-gray-500 focus:ring-0 w-full" />
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 <div className="p-6 bg-gray-50/30 flex justify-end">
//                     <button
//                         onClick={saveAttendance}
//                         className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
//                     >
//                         <CheckCircle size={18} /> Save Attendance
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const GradesSection = ({ courses }) => {
//     const [step, setStep] = useState(1);
//     const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
//     const [selectedExam, setSelectedExam] = useState('MST 1');
//     const [students, setStudents] = useState([]);
//     const [grades, setGrades] = useState({});

//     const exams = ['MST 1', 'MST 2', 'Semester Exam', 'Quiz', 'Assignment'];

//     const handleFetchStudents = async () => {
//         if (!selectedCourse) return;
//         try {
//             const response = await coursesApi.getCourseStudents(selectedCourse);
//             if (response.data.success) {
//                 setStudents(response.data.data);
//                 const initial = {};
//                 response.data.data.forEach(s => {
//                     initial[s.id] = { marks: '', grade: '' };
//                 });
//                 setGrades(initial);
//                 setStep(2);
//             }
//         } catch (error) {
//             toast.error('Failed to load students');
//         }
//     };

//     const calculateGrade = (marks) => {
//         const m = parseInt(marks);
//         if (isNaN(m)) return '';
//         if (m >= 90) return 'A+';
//         if (m >= 80) return 'A';
//         if (m >= 70) return 'B+';
//         if (m >= 60) return 'B';
//         if (m >= 50) return 'C';
//         return 'F';
//     };

//     const handleMarksChange = (studentId, marks) => {
//         setGrades(prev => ({
//             ...prev,
//             [studentId]: { marks, grade: calculateGrade(marks) }
//         }));
//     };

//     const saveGrades = async () => {
//         try {
//             const data = {
//                 course_id: selectedCourse,
//                 exam_type: selectedExam,
//                 grades: Object.entries(grades).map(([student_id, g]) => ({
//                     student_id,
//                     marks: g.marks,
//                     grade: g.grade
//                 }))
//             };
//             const response = await gradesApi.bulkUploadGrades(data);
//             if (response.data.success) {
//                 toast.success('Grades published successfully');
//                 setStep(1);
//             }
//         } catch (error) {
//             toast.error('Failed to save grades');
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in fade-in duration-500">
//             <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                 <GraduationCap className="text-primary" /> Grade Management
//             </h2>

//             {step === 1 ? (
//                 <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
//                     <h3 className="text-lg font-bold text-gray-900 mb-6">Select Course & Exam</h3>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Course</label>
//                             <select
//                                 value={selectedCourse}
//                                 onChange={(e) => setSelectedCourse(e.target.value)}
//                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
//                             >
//                                 {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Exam Type</label>
//                             <select
//                                 value={selectedExam}
//                                 onChange={(e) => setSelectedExam(e.target.value)}
//                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
//                             >
//                                 {exams.map(e => <option key={e} value={e}>{e}</option>)}
//                             </select>
//                         </div>
//                         <button
//                             onClick={handleFetchStudents}
//                             className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all mt-4"
//                         >
//                             Proceed to Grade Entry
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//                     <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
//                         <div>
//                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selectedExam} - </span>
//                             <span className="text-sm font-bold text-primary">{courses.find(c => c.id == selectedCourse)?.course_name}</span>
//                         </div>
//                         <div className="flex gap-2">
//                             <button className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
//                                 <Download size={16} /> Template
//                             </button>
//                             <button className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
//                                 <Upload size={16} /> Upload CSV
//                             </button>
//                         </div>
//                     </div>
//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead>
//                                 <tr className="bg-gray-50/50">
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Enrollment ID</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Marks (100)</th>
//                                     <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Grade</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {students.map((student) => (
//                                     <tr key={student.id} className="hover:bg-gray-50/30">
//                                         <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
//                                         <td className="px-6 py-4 text-gray-500 text-sm font-medium">{student.enrollment_id || 'ENR202400' + student.id}</td>
//                                         <td className="px-6 py-4">
//                                             <input
//                                                 type="number"
//                                                 value={grades[student.id]?.marks}
//                                                 onChange={(e) => handleMarksChange(student.id, e.target.value)}
//                                                 className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
//                                             />
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className={`
//                                                 font-bold px-3 py-1 rounded-lg text-xs
//                                                 ${grades[student.id]?.grade === 'F' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
//                                             `}>
//                                                 {grades[student.id]?.grade || '--'}
//                                             </span>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     <div className="p-6 bg-gray-50/30 flex justify-between">
//                         <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-700">Back</button>
//                         <button
//                             onClick={saveGrades}
//                             className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
//                         >
//                             Publish Results
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// const FeesSection = ({ courses }) => {
//     const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
//     const [students, setStudents] = useState([]);
//     const [filter, setFilter] = useState('All');

//     useEffect(() => {
//         if (selectedCourse) fetchFeeStatus();
//     }, [selectedCourse]);

//     const fetchFeeStatus = async () => {
//         try {
//             const response = await coursesApi.getCourseStudents(selectedCourse);
//             if (response.data.success) {
//                 // Mocking fee data as it might not be in student object directly
//                 setStudents(response.data.data.map(s => ({
//                     ...s,
//                     total: 50000,
//                     paid: Math.floor(Math.random() * 50000),
//                     status: ['Paid', 'Partial', 'Pending'][Math.floor(Math.random() * 3)]
//                 })));
//             }
//         } catch (error) {
//             toast.error('Failed to load fee status');
//         }
//     };

//     const filteredStudents = students.filter(s => filter === 'All' || s.status === filter);

//     return (
//         <div className="space-y-6 animate-in fade-in duration-500">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                     <CreditCard className="text-primary" /> Student Fee Overview
//                 </h2>
//                 <div className="flex items-center gap-3">
//                     <select
//                         value={selectedCourse}
//                         onChange={(e) => setSelectedCourse(e.target.value)}
//                         className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none"
//                     >
//                         {courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
//                     </select>
//                     <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
//                         {['All', 'Paid', 'Partial', 'Pending'].map(f => (
//                             <button
//                                 key={f}
//                                 onClick={() => setFilter(f)}
//                                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
//                             >
//                                 {f}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="bg-gray-50/50">
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Fees</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Paid</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pending</th>
//                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {filteredStudents.map((student) => (
//                                 <tr key={student.id} className="hover:bg-gray-50/30">
//                                     <td className="px-6 py-4 font-bold text-gray-900">{student.full_name}</td>
//                                     <td className="px-6 py-4 text-gray-600 font-bold">₹{student.total.toLocaleString()}</td>
//                                     <td className="px-6 py-4 text-green-600 font-bold">₹{student.paid.toLocaleString()}</td>
//                                     <td className="px-6 py-4 text-red-600 font-bold">₹{(student.total - student.paid).toLocaleString()}</td>
//                                     <td className="px-6 py-4">
//                                         <span className={`
//                                             px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
//                                             ${student.status === 'Paid' ? 'bg-green-100 text-green-700' : student.status === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}
//                                         `}>
//                                             {student.status}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 <div className="p-4 bg-gray-50/50 flex justify-end">
//                     <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
//                         <Download size={14} /> Export Fee Report
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const NoticesSection = ({ courses }) => {
//     const [notices, setNotices] = useState([]);
//     const [isCreating, setIsCreating] = useState(false);
//     const [newNotice, setNewNotice] = useState({
//         title: '',
//         content: '',
//         course_id: courses[0]?.id || '',
//         is_urgent: false
//     });

//     useEffect(() => {
//         fetchNotices();
//     }, []);

//     const fetchNotices = async () => {
//         try {
//             const response = await noticesApi.getFacultyNotices();
//             if (response.data.success) {
//                 setNotices(response.data.data);
//             }
//         } catch (error) {
//             toast.error('Failed to load notices');
//         }
//     };

//     const handleCreate = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await noticesApi.create(newNotice);
//             if (response.data.success) {
//                 toast.success('Notice posted successfully');
//                 setIsCreating(false);
//                 fetchNotices();
//             }
//         } catch (error) {
//             toast.error('Failed to post notice');
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in fade-in duration-500">
//             <div className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
//                     <Bell className="text-primary" /> Notice Management
//                 </h2>
//                 <button
//                     onClick={() => setIsCreating(true)}
//                     className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
//                 >
//                     <Plus size={18} /> Create Notice
//                 </button>
//             </div>

//             {isCreating && (
//                 <div className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-xl animate-in zoom-in-95 duration-200">
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-lg font-bold text-gray-900">Post New Notice</h3>
//                         <button onClick={() => setIsCreating(false)}><X size={20} className="text-gray-400" /></button>
//                     </div>
//                     <form onSubmit={handleCreate} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notice Title</label>
//                                 <input
//                                     type="text"
//                                     required
//                                     value={newNotice.title}
//                                     onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
//                                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                                     placeholder="e.g. MST Schedule Update"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Target Course</label>
//                                 <select
//                                     value={newNotice.course_id}
//                                     onChange={(e) => setNewNotice({ ...newNotice, course_id: e.target.value })}
//                                     className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                                 >
//                                     {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
//                                 </select>
//                             </div>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Content</label>
//                             <textarea
//                                 required
//                                 value={newNotice.content}
//                                 onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
//                                 className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px]"
//                                 placeholder="Write your notice here..."
//                             ></textarea>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 id="urgent"
//                                 checked={newNotice.is_urgent}
//                                 onChange={(e) => setNewNotice({ ...newNotice, is_urgent: e.target.checked })}
//                                 className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
//                             />
//                             <label htmlFor="urgent" className="text-sm font-bold text-red-600">Mark as Urgent (Send Notification)</label>
//                         </div>
//                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
//                             <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
//                             <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark">Post Notice</button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {notices.length > 0 ? notices.map(notice => (
//                     <div key={notice.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
//                         {notice.is_urgent && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 text-white flex items-center justify-center rotate-45 translate-x-8 -translate-y-8 text-[10px] font-bold uppercase tracking-tighter">Urgent</div>}
//                         <div className="flex items-start justify-between mb-4">
//                             <div>
//                                 <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{notice.title}</h3>
//                                 <div className="flex items-center gap-3 mt-1">
//                                     <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">{notice.course_code || 'CS301'}</span>
//                                     <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Clock size={12} /> {new Date(notice.created_at).toLocaleDateString()}</span>
//                                 </div>
//                             </div>
//                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg"><Edit size={16} /></button>
//                                 <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
//                             </div>
//                         </div>
//                         <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{notice.content}</p>
//                         <div className="flex justify-between items-center pt-4 border-t border-gray-50">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">SA</div>
//                                 <span className="text-xs text-gray-500 font-medium">By You</span>
//                             </div>
//                             <button className="text-xs font-bold text-primary hover:underline">Read More</button>
//                         </div>
//                     </div>
//                 )) : (
//                     <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
//                         <Bell size={48} className="mx-auto text-gray-200 mb-4" />
//                         <h3 className="text-lg font-bold text-gray-900 mb-1">No Notices Yet</h3>
//                         <p className="text-gray-500 max-w-sm mx-auto">Create your first notice to share important updates with your students.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// const CommunitySection = () => {
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [message, setMessage] = useState('');
//     const chatEndRef = useRef(null);

//     const conversations = [
//         { id: 'g1', name: 'CS301 - DBMS Group', type: 'group', lastMsg: 'John Doe: Professor, when is the assignment due?', time: '10:30 AM', unread: 3 },
//         { id: 'u1', name: 'John Doe', type: 'personal', lastMsg: 'Thank you for the clarification!', time: 'Yesterday', unread: 0 },
//         { id: 'u2', name: 'Jane Smith', type: 'personal', lastMsg: 'I have a doubt in normalization.', time: 'Monday', unread: 1 },
//         { id: 'g2', name: 'EE201 - Circuit Group', type: 'group', lastMsg: 'Mark: Labs are cancelled today.', time: 'Last Week', unread: 0 },
//         { id: 'u3', name: 'HOD (CSE)', type: 'personal', lastMsg: 'Please submit the monthly report.', time: 'Yesterday', unread: 0 },
//     ];

//     const messages = [
//         { id: 1, sender: 'John Doe', text: 'Professor, I have a doubt regarding the project architecture.', time: '10:25 AM', isMe: false },
//         { id: 2, sender: 'You', text: 'Sure John, let me know which part is confusing.', time: '10:27 AM', isMe: true },
//         { id: 3, sender: 'John Doe', text: 'The relationship between Student and Enrollment tables, should it be 1:M?', time: '10:28 AM', isMe: false },
//         { id: 4, sender: 'You', text: 'Yes, a student can have multiple enrollments across different semesters.', time: '10:30 AM', isMe: true },
//     ];

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [selectedChat, messages]);

//     return (
//         <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
//             {/* Sidebar: Conversations */}
//             <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
//                 <div className="p-4 border-b border-gray-50">
//                     <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                         <input
//                             type="text"
//                             placeholder="Search chats..."
//                             className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                         />
//                     </div>
//                 </div>
//                 <div className="flex-1 overflow-y-auto custom-scrollbar">
//                     {conversations.map(chat => (
//                         <button
//                             key={chat.id}
//                             onClick={() => setSelectedChat(chat)}
//                             className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selectedChat?.id === chat.id ? 'bg-primary/5' : ''}`}
//                         >
//                             <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold ${chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'}`}>
//                                 {chat.name[0]}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <div className="flex justify-between items-center">
//                                     <h4 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h4>
//                                     <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.time}</span>
//                                 </div>
//                                 <div className="flex justify-between items-center mt-1">
//                                     <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
//                                     {chat.unread > 0 && <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{chat.unread}</span>}
//                                 </div>
//                             </div>
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Chat Area */}
//             <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex bg-gray-50/50' : 'flex'}`}>
//                 {selectedChat ? (
//                     <>
//                         {/* Chat Header */}
//                         <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                                 <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-500"><X size={20} /></button>
//                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'}`}>
//                                     {selectedChat.name[0]}
//                                 </div>
//                                 <div>
//                                     <h3 className="text-sm font-bold text-gray-900">{selectedChat.name}</h3>
//                                     <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
//                                 </div>
//                             </div>
//                             <div className="flex gap-2">
//                                 <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><Users size={20} /></button>
//                                 <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><MoreVertical size={20} /></button>
//                             </div>
//                         </div>

//                         {/* Messages */}
//                         <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9fc] custom-scrollbar">
//                             {messages.map(msg => (
//                                 <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
//                                     <div className={`max-w-[70%] space-y-1`}>
//                                         {!msg.isMe && <p className="text-[10px] font-bold text-gray-500 ml-1">{msg.sender}</p>}
//                                         <div className={`
//                                             px-4 py-3 rounded-2xl text-sm shadow-sm
//                                             ${msg.isMe
//                                                 ? 'bg-primary text-white rounded-tr-none shadow-primary/10'
//                                                 : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}
//                                         `}>
//                                             {msg.text}
//                                         </div>
//                                         <p className={`text-[10px] text-gray-400 ${msg.isMe ? 'text-right mr-1' : 'ml-1'}`}>{msg.time}</p>
//                                     </div>
//                                 </div>
//                             ))}
//                             <div ref={chatEndRef} />
//                         </div>

//                         {/* Chat Input */}
//                         <div className="p-4 bg-white border-t border-gray-100">
//                             <form
//                                 onSubmit={(e) => {
//                                     e.preventDefault();
//                                     if (message.trim()) {
//                                         // Logic to send message via socket
//                                         setMessage('');
//                                     }
//                                 }}
//                                 className="flex items-center gap-3"
//                             >
//                                 <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
//                                 <input
//                                     type="text"
//                                     value={message}
//                                     onChange={(e) => setMessage(e.target.value)}
//                                     placeholder="Type your message here..."
//                                     className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
//                                 />
//                                 <button
//                                     type="submit"
//                                     className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
//                                 >
//                                     <Send size={20} />
//                                 </button>
//                             </form>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
//                         <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
//                             <MessageSquare size={40} />
//                         </div>
//                         <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
//                         <p className="text-gray-500 max-w-sm">Select a conversation from the left to start chatting with students or faculty groups.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default FacultyDashboard;

