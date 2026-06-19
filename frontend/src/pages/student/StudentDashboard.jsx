import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    LogOut,
    User,
    Settings,
    Lock,
    Download,
    ExternalLink,
    Briefcase,
    Users,
    CheckCircle,
    Target,
    BookOpen,
    HelpCircle,
    FileBadge,
    Loader2,
    ChevronDown,
    Menu,
    X,
    AlertCircle,
    Clock,
    Calendar
} from 'lucide-react';
import { io } from 'socket.io-client';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { noticesApi } from '../../services/api';
import Footer from '../../components/Landing/Footer.jsx';
import toast from 'react-hot-toast';
// import { NoticeManagement } from '../../components/Admin/NoticeManagement.jsx';

// --- Sub-components ---

const ComingSoonBadge = () => (
    <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 shadow-sm z-10">
        COMING SOON
    </span>
);

const FeatureCard = ({ icon: Icon, title, description, link, comingSoon, extra }) => {
    const handleClick = (e) => {
        if (comingSoon) {
            e.preventDefault();
            toast('This feature will be available soon!', {
                icon: '⏳',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative p-6 bg-white rounded-3xl shadow-md border border-gray-100 group transition-all hover:shadow-xl flex flex-col h-full"
        >
            {comingSoon && <ComingSoonBadge />}
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-secondary">
                <Icon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{description}</p>

            {extra && <div className="mb-4">{extra}</div>}

            <Link
                to={link}
                onClick={handleClick}
                className="inline-flex items-center text-secondary font-black text-sm hover:gap-3 transition-all mt-auto"
            >
                {comingSoon ? 'Learn More' : 'Access Now'} <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
        </motion.div>
    );
};

const NoticeSkeleton = () => (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 mb-4 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
);

const StudentDashboard = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notices, setNotices] = useState([]);
    const [noticesLoading, setNoticesLoading] = useState(true);
    const [noticesError, setNoticesError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        fetchNotices();

        // Setup Socket.io
        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        socketRef.current = io(socketUrl, {
            auth: { token: localStorage.getItem('token') }
        });

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_room', {
                role: 'student',
                department: user.student_dept,
                semester: user.current_semester
            });
        });

        socketRef.current.on('new_notice', (newNotice) => {
            setNotices(prev => [newNotice, ...prev]);
            toast('New Announcement!', { icon: '🔔' });
        });

        socketRef.current.on('notice_updated', (updatedData) => {
            setNotices(prev => prev.map(n => n.id === updatedData.id ? { ...n, ...updatedData } : n));
        });

        socketRef.current.on('notice_deleted', (data) => {
            setNotices(prev => prev.filter(n => n.id !== data.id));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [activeCategory]);

    const fetchNotices = async () => {
        try {
            setNoticesLoading(true);
            setNoticesError(null);
            const response = await noticesApi.getAll({
                category: activeCategory === 'all' ? undefined : activeCategory,
                limit: 50
            });
            // Handle the different response structure between API and fallback
            const noticeData = response.data.data || response.data.notices || response.data;
            setNotices(Array.isArray(noticeData) ? noticeData : []);
        } catch (error) {
            console.error('Failed to fetch notices:', error);
            setNoticesError('Unable to load announcements. Please check your connection.');
        } finally {
            setNoticesLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateStr) => {
        try {
            return format(new Date(dateStr), 'MMMM d, yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    const getRelativeTime = (dateStr) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch (e) {
            return '';
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto mb-4" />
                    <p className="text-gray-600 font-black">Connecting to EntitySYS...</p>
                </div>
            </div>
        );
    }

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen selection:bg-secondary selection:text-white">
            <div className="bg-[#F8FAFC] transition-colors duration-300 min-h-screen flex flex-col">

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
                                <button className="flex items-center space-x-2 text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest">
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
                                <button className="flex items-center space-x-2 text-sm font-black text-gray-600 hover:text-secondary transition-colors uppercase tracking-widest">
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
                            <button className="relative p-2.5 text-gray-500 hover:text-secondary transition-colors bg-gray-50 rounded-xl">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">0</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden">
                                        {getInitials(user.full_name)}
                                    </div>
                                    <span className="hidden md:block text-sm font-black text-gray-900">{user.full_name}</span>
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
                                                <p className="font-black text-gray-900 truncate">{user.full_name}</p>
                                                <p className="text-xs text-gray-500 font-bold truncate mt-1">{user.email}</p>
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
                                                        className="w-full flex items-center space-x-4 p-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-colors text-sm font-black"
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
                                className="lg:hidden p-2.5 bg-gray-50 rounded-xl text-gray-600"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Main Content --- */}
                <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 flex-grow">
                    {/* Responsive Layout Grid using CSS Areas for precision mobile ordering */}
                    <div className="dashboard-grid">

                        {/* Welcome Section */}
                        <div className="area-welcome mb-6 md:mb-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 md:p-10 bg-gradient-premium rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
                            >
                                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                                <div className="absolute -left-10 -top-10 w-32 h-32 bg-secondary/20 rounded-full blur-[50px]"></div>

                                <div className="relative z-10">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">
                                        Student Dashboard
                                    </span>
                                    <h1 className="text-3xl lg:text-5xl font-black mb-3 leading-tight tracking-tighter">
                                        Welcome, <br className="hidden sm:block" /> {user.full_name.split(' ')[0]}! 👋
                                    </h1>
                                    <p className="text-blue-100 text-sm lg:text-lg font-bold mb-8 opacity-90">
                                        Your academic progress at a glance.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Semester</p>
                                            <p className="font-black text-lg">{user.current_semester || 'N/A'} Semester</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Enrollment ID</p>
                                            <p className="font-black text-lg">{user.enrollment_id || 'N/A'}</p>
                                        </div>
                                        <div className="sm:col-span-2 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Department</p>
                                            <p className="font-black text-lg lg:text-xl">{user.student_dept || 'Computer Science Engineering'}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Notice Board Column */}
                        <div className="area-notices mb-6 md:mb-0">
                            <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 h-full border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            <Bell className="h-6 w-6 text-secondary" />
                                            Notice Board
                                        </h2>
                                        <p className="text-sm text-gray-500 font-bold mt-1">Real-time academic updates</p>
                                    </div>

                                    {/* Category Filter Tabs */}
                                    <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 self-start">
                                        {['all', 'College', 'Exam', 'Event'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat.toLowerCase())}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all relative ${activeCategory === cat.toLowerCase()
                                                        ? 'text-white'
                                                        : 'text-gray-500 hover:text-gray-900 '
                                                    }`}
                                            >
                                                {activeCategory === cat.toLowerCase() && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute inset-0 bg-secondary rounded-xl shadow-lg shadow-secondary/30"
                                                    />
                                                )}
                                                <span className="relative z-10">{cat.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notices List - Fully Scrollable */}
                                <div className="space-y-5 flex-grow overflow-y-auto pr-3 custom-scrollbar min-h-[400px]">
                                    <AnimatePresence mode="popLayout">
                                        {noticesLoading ? (
                                            [1, 2, 3, 4].map(i => <NoticeSkeleton key={i} />)
                                        ) : noticesError ? (
                                            <div className="text-center py-20 bg-red-50 rounded-[2rem] border-2 border-dashed border-red-100">
                                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                                <p className="text-red-600 font-black mb-4">{noticesError}</p>
                                                <button
                                                    onClick={fetchNotices}
                                                    className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                                                >
                                                    Retry Loading
                                                </button>
                                            </div>
                                        ) : notices.length > 0 ? (
                                            notices.map((notice, index) => (
                                                <motion.div
                                                    key={notice.id || index}
                                                    initial={{ opacity: 0, x: 30 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => setSelectedNotice(notice)}
                                                    className={`p-6 bg-white rounded-3xl border transition-all cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden ${index === 0 ? 'border-secondary/50 ring-2 ring-secondary/5' : 'border-gray-100 '
                                                        }`}
                                                >
                                                    {index === 0 && (
                                                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-secondary text-white text-[9px] font-black rounded-bl-2xl uppercase tracking-widest shadow-sm">
                                                            Latest
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${notice.category === 'Exam' ? 'bg-rose-50 text-rose-600 border-rose-100 ' :
                                                                    notice.category === 'Event' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 ' :
                                                                        notice.category === 'College' ? 'bg-amber-50 text-amber-600 border-amber-100 ' :
                                                                            'bg-emerald-50 text-emerald-600 border-emerald-100 '
                                                                }`}>
                                                                {notice.category || 'NOTICE'}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                                                                <Clock className="h-3 w-3" />
                                                                {getRelativeTime(notice.created_at || notice.date)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(notice.created_at || notice.date)}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-secondary transition-colors leading-tight">
                                                        {notice.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-5 font-medium leading-relaxed">
                                                        {notice.content}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-xs font-black text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
                                                            Read Full Notice <X className="h-3 w-3 rotate-180" />
                                                        </span>
                                                        {notice.file_url && (
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                                <Download className="h-3.5 w-3.5" />
                                                                PDF ATTACHED
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                                                    <Bell className="h-10 w-10 text-gray-200" />
                                                </div>
                                                <h4 className="text-lg font-black text-gray-900 mb-2">No Notices Available</h4>
                                                <p className="text-sm text-gray-400 font-bold">All caught up! Check back later for updates.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards Section */}
                        <div className="area-cards space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <div className="w-3 h-10 bg-secondary rounded-full"></div>
                                    Quick Actions
                                </h2>
                            </div>
                            {/* Breakpoints Card Columns: Mobile=1, Tablet=2, Desktop=3 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                <FeatureCard
                                    icon={FileBadge}
                                    title="Admission"
                                    description="Your admission status and verified documents"
                                    link="/admission-details"
                                    comingSoon
                                />
                                <FeatureCard
                                    icon={Briefcase}
                                    title="Exam Portal"
                                    description="Registration, fee payment, and hall tickets"
                                    link="/exam-forms"
                                    comingSoon
                                />
                                <FeatureCard
                                    icon={CheckCircle}
                                    title="Attendance"
                                    description="Track your regular attendance and leaves"
                                    link="/attendance"
                                    comingSoon
                                    extra={
                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                                                <span className="text-gray-500">Attendance</span>
                                                <span className="text-secondary">85%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '85%' }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-secondary rounded-full"
                                                ></motion.div>
                                            </div>
                                        </div>
                                    }
                                />
                                <FeatureCard
                                    icon={Target}
                                    title="Results"
                                    description="Grades, transcripts, and semester marks"
                                    link="/marks"
                                    comingSoon
                                    extra={
                                        <div className="mt-2">
                                            <span className="text-[11px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">CGPA: 8.5 / 10</span>
                                        </div>
                                    }
                                />
                                <FeatureCard
                                    icon={Users}
                                    title="Community"
                                    description="Chat with batchmates and join study groups"
                                    link="/classmates"
                                    comingSoon
                                />
                                <FeatureCard
                                    icon={BookOpen}
                                    title="LMS"
                                    description="Access course materials and assignments"
                                    link="/courses"
                                    comingSoon
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- Notice Detail Modal --- */}
                <AnimatePresence>
                    {selectedNotice && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedNotice(null)}
                                className="absolute inset-0 bg-navy/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                            >
                                <div className="p-8 md:p-12">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="space-y-4">
                                            <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                                {selectedNotice.category || 'Announcement'}
                                            </span>
                                            <h2 className="text-3xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                                                {selectedNotice.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" /> {formatDate(selectedNotice.created_at || selectedNotice.date)}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" /> {getRelativeTime(selectedNotice.created_at || selectedNotice.date)}
                                                </span>
                                                {selectedNotice.posted_by_name && (
                                                    <span className="flex items-center gap-2 text-secondary">
                                                        <User className="h-4 w-4" /> Posted by {selectedNotice.posted_by_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedNotice(null)}
                                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
                                        >
                                            <X className="h-6 w-6 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="prose max-w-none mb-10">
                                        <p className="text-gray-600 leading-[1.6] font-bold text-base md:text-lg">
                                            {selectedNotice.content}
                                        </p>
                                    </div>

                                    {selectedNotice.file_url && (
                                        <a
                                            href={`${backendUrl}${selectedNotice.file_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-5 w-full p-6 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50/80 transition-all group cursor-pointer"
                                        >
                                            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                                <FileBadge className="h-8 w-8" />
                                            </div>
                                            <div className="text-left flex-grow">
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-wider">View / Download Attachment</p>
                                                <p className="text-xs text-emerald-600 font-bold mt-1">
                                                    {selectedNotice.file_url.split('/').pop() || `Notice_Doc_${selectedNotice.id}.pdf`}
                                                </p>
                                            </div>
                                            <Download className="h-6 w-6 text-emerald-500" />
                                        </a>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-6 md:p-8 flex justify-end gap-4">
                                    <button
                                        onClick={() => setSelectedNotice(null)}
                                        className="px-10 py-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        CLOSE
                                    </button>
                                    <button
                                        className="px-10 py-4 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/30"
                                    >
                                        SHARE
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* --- Mobile Sidebar Menu --- */}
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
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400"><X /></button>
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
                                            className="flex items-center space-x-4 text-red-500 font-black text-xl"
                                        >
                                            <LogOut className="h-6 w-6" /> <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <Footer />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
 .dashboard-grid {
 display: grid;
 grid-template-areas:"welcome""notices""cards";
 grid-template-columns: 1fr;
 }

 @media (min-width: 768px) {
 .dashboard-grid {
 grid-template-areas:"welcome notices""cards notices";
 grid-template-columns: 40% 60%;
 gap: 1.5rem 2.5rem;
 }
 }

 @media (min-width: 1024px) {
 .dashboard-grid {
 grid-template-areas:"welcome notices""cards notices";
 grid-template-columns: 50% 50%;
 gap: 1.5rem 2.5rem;
 }
 }

 .area-welcome { grid-area: welcome; }
 .area-notices { grid-area: notices; }
 .area-cards { grid-area: cards; }

 .custom-scrollbar::-webkit-scrollbar {
 width: 5px;
 }
 .custom-scrollbar::-webkit-scrollbar-track {
 background: transparent;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb {
 background: #e2e8f0;
 border-radius: 20px;
 }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
 background: #cbd5e1;
 }
 
 @media (max-width: 768px) {
 .container {
 padding-left: 1rem;
 padding-right: 1rem;
 }
 }
 `}} />
        </div>
    );
};

export default StudentDashboard;
