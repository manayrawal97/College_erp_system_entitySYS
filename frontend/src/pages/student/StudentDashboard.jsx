import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  Lock, 
  Moon, 
  Sun, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  ExternalLink,
  GraduationCap,
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
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { noticesApi } from '../../services/api';
import Footer from '../../components/Landing/Footer.jsx';
import toast from 'react-hot-toast';

// --- Sub-components ---

const ComingSoonBadge = () => (
  <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[12px] font-bold border border-amber-200 shadow-sm">
    Coming Soon
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
      className="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 group transition-all hover:shadow-xl"
    >
      {comingSoon && <ComingSoonBadge />}
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-secondary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{description}</p>
      
      {extra && <div className="mb-4">{extra}</div>}

      <Link
        to={link}
        onClick={handleClick}
        className="inline-flex items-center text-secondary font-bold text-sm hover:gap-2 transition-all"
      >
        {comingSoon ? 'Access' : 'View'} <ExternalLink className="ml-1 h-4 w-4" />
      </Link>
    </motion.div>
  );
};

const NoticeSkeleton = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-3 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const StudentDashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticesPage, setNoticesPage] = useState(1);
  const [hasMoreNotices, setHasMoreNotices] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchNotices();
  }, [activeCategory, noticesPage]);

  const fetchNotices = async () => {
    try {
      setNoticesLoading(true);
      const response = await noticesApi.getNotices({
        category: activeCategory,
        page: noticesPage,
        limit: 5,
        search: searchQuery
      });
      
      const newNotices = response.data.notices;
      if (noticesPage === 1) {
        setNotices(newNotices);
      } else {
        setNotices(prev => [...prev, ...newNotices]);
      }
      setHasMoreNotices(newNotices.length === 5);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      // Mock data if backend is not fully ready
      if (noticesPage === 1) {
        setNotices([
          { 
            id: 1, 
            title: 'End Semester Examination Schedule - June 2024', 
            content: 'The end semester examinations for all departments will commence from June 15th, 2024. Detailed schedule is attached.', 
            category: 'Exam', 
            date: '2024-05-20',
            hasAttachment: true 
          },
          { 
            id: 2, 
            title: 'TechQuest 2024: Annual Technical Symposium', 
            content: 'Registration is now open for TechQuest 2024. Participate in various events including hackathons, paper presentations, and robotic wars.', 
            category: 'Event', 
            date: '2024-05-18' 
          },
          { 
            id: 3, 
            title: 'New Library Timings for Exam Season', 
            content: 'The library will remain open 24/7 from June 1st to June 30th to assist students during their examinations.', 
            category: 'College', 
            date: '2024-05-15' 
          }
        ]);
        setHasMoreNotices(false);
      }
    } finally {
      setNoticesLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setNoticesPage(1);
    fetchNotices();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-bold">Verifying Session...</p>
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
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-navy-dark transition-colors duration-300">
        
        {/* --- Navbar --- */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-navy/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link to="/student/dashboard" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:rotate-3 transition-transform">
                E
              </div>
              <span className="text-2xl font-black text-primary dark:text-white tracking-tighter">
                Entity<span className="text-secondary">SYS</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/about" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors">About</Link>
              
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors">
                  <span>Academics</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 dark:border-gray-700">
                  <Link to="/courses" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Courses</Link>
                  <Link to="/timetable" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Timetable</Link>
                  <Link to="/syllabus" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Syllabus</Link>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors">
                  <span>Student Life</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 dark:border-gray-700">
                  <Link to="/clubs" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Clubs</Link>
                  <Link to="/events" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Events</Link>
                  <Link to="/campus" className="block px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">Campus</Link>
                </div>
              </div>

              <Link to="/#contact" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-secondary transition-colors">Contact</Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-secondary transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-navy">0</span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="hidden md:block text-sm font-bold text-gray-900 dark:text-white">{user.full_name}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-3 border border-gray-100 dark:border-gray-700 z-[60]"
                    >
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Link to="/profile" className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-300">
                          <User className="h-4 w-4" /> <span>My Profile</span>
                        </Link>
                        <Link to="/settings" className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-300">
                          <Settings className="h-4 w-4" /> <span>Settings</span>
                        </Link>
                        <button className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-300 text-left">
                          <Lock className="h-4 w-4" /> <span>Change Password</span>
                        </button>
                        <button 
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-300"
                        >
                          <div className="flex items-center space-x-3">
                            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${isDarkMode ? 'bg-secondary' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
                          </div>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-2 pt-2">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors text-sm font-bold"
                          >
                            <LogOut className="h-4 w-4" /> <span>Logout</span>
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
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* --- Main Content --- */}
        <main className="container mx-auto px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8"
          >
            
            {/* Left Section: Welcome & Feature Cards */}
            <div className="w-full md:w-[40%] lg:w-1/2 space-y-8 order-2 md:order-1">
              
              {/* Welcome Card */}
              <div className="p-8 bg-gradient-premium rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h1 className="text-2xl lg:text-3xl font-black mb-2">Welcome back, {user.full_name.split(' ')[0]}! 👋</h1>
                  <p className="text-blue-100 text-sm lg:text-base font-medium mb-6">Here's what's happening with your academic journey today.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="space-y-1">
                      <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Current Semester</p>
                      <p className="font-bold text-sm">3rd Semester</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Enrollment ID</p>
                      <p className="font-bold text-sm">ENR2024001</p>
                    </div>
                    <div className="sm:col-span-2 md:col-span-1 lg:col-span-2 pt-2 border-t border-white/10 mt-2">
                      <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Department</p>
                      <p className="font-bold text-base lg:text-lg">Computer Science Engineering</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-black mb-6 flex items-center gap-2">
                  <div className="w-2 h-8 bg-secondary rounded-full"></div>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <FeatureCard 
                    icon={FileText} 
                    title="Your Admission Details" 
                    description="View your admission application status and documents" 
                    link="/admission-details"
                    comingSoon
                  />
                  <FeatureCard 
                    icon={Briefcase} 
                    title="Exam Forms" 
                    description="Fill exam forms and pay fees for upcoming examinations" 
                    link="/exam-forms"
                    comingSoon
                  />
                  <FeatureCard 
                    icon={CheckCircle} 
                    title="Attendance" 
                    description="Check your subject-wise attendance percentage" 
                    link="/attendance"
                    comingSoon
                    extra={
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Overall Progress</span>
                          <span className="text-secondary">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    }
                  />
                  <FeatureCard 
                    icon={Target} 
                    title="Marks" 
                    description="View your semester results and grade cards" 
                    link="/marks"
                    comingSoon
                    extra={<span className="text-xs font-black text-secondary bg-secondary/10 px-2 py-1 rounded-md">Current CGPA: 8.5</span>}
                  />
                  <FeatureCard 
                    icon={Users} 
                    title="Connect with Classmates" 
                    description="Chat with batchmates (group & personal)" 
                    link="/classmates"
                    comingSoon
                  />
                  <FeatureCard 
                    icon={HelpCircle} 
                    title="Ask to Teachers" 
                    description="Post doubts and get responses from faculty" 
                    link="/ask-teachers"
                    comingSoon
                  />
                  <FeatureCard 
                    icon={BookOpen} 
                    title="Course and Curriculum" 
                    description="Access syllabus, course materials, and resources" 
                    link="/courses"
                    comingSoon
                  />
                </div>
              </div>
            </div>

            {/* Right Section: Notice Board */}
            <div className="w-full md:w-[60%] lg:w-1/2 order-1 md:order-2">
              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-3xl p-6 lg:p-8 h-full border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-secondary" />
                    Latest Announcements
                  </h2>
                  <div className="relative">
                    <form onSubmit={handleSearch}>
                      <input 
                        type="text" 
                        placeholder="Search notices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all w-full sm:w-64"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </form>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['all', 'College', 'Exam', 'Event', 'Department'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat.toLowerCase()); setNoticesPage(1); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeCategory === cat.toLowerCase()
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Notices List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {noticesLoading && noticesPage === 1 ? (
                      [1, 2, 3].map(i => <NoticeSkeleton key={i} />)
                    ) : notices.length > 0 ? (
                      notices.map((notice, index) => (
                        <motion.div
                          key={notice.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedNotice(notice)}
                          className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-secondary/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              notice.category === 'Exam' ? 'bg-red-100 text-red-600' :
                              notice.category === 'Event' ? 'bg-purple-100 text-purple-600' :
                              notice.category === 'College' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {notice.category}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">{notice.date}</span>
                          </div>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                            {notice.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                            {notice.content}
                          </p>
                          {notice.hasAttachment && (
                            <div className="flex items-center gap-2 text-xs font-bold text-secondary bg-secondary/5 self-start px-2 py-1 rounded-lg">
                              <Download className="h-3 w-3" />
                              Attachment available
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">📭 No notices available</p>
                        <p className="text-xs text-gray-400">Check back later for updates</p>
                      </div>
                    )}
                  </AnimatePresence>

                  {hasMoreNotices && (
                    <button 
                      onClick={() => setNoticesPage(prev => prev + 1)}
                      className="w-full py-4 text-sm font-black text-gray-500 hover:text-secondary transition-colors"
                    >
                      {noticesLoading ? 'Loading more...' : 'Load More Notices'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* --- Notice Detail Modal --- */}
        <AnimatePresence>
          {selectedNotice && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNotice(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
                        {selectedNotice.category}
                      </span>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                        {selectedNotice.title}
                      </h2>
                      <p className="text-sm text-gray-400 font-bold mt-2">Posted on {selectedNotice.date}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedNotice(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      <X className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none mb-8">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      {selectedNotice.content}
                    </p>
                  </div>

                  {selectedNotice.hasAttachment && (
                    <button className="flex items-center gap-3 w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:border-secondary transition-all group">
                      <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                        <FileBadge className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Download PDF Attachment</p>
                        <p className="text-xs text-gray-500">Notice_Attachment_{selectedNotice.id}.pdf</p>
                      </div>
                      <Download className="h-5 w-5 ml-auto text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-end">
                  <button 
                    onClick={() => setSelectedNotice(null)}
                    className="px-8 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Close
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
                className="fixed inset-0 z-[70] bg-black/60 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 z-[80] w-80 bg-white dark:bg-navy p-8 lg:hidden overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-12">
                  <span className="text-2xl font-black text-primary dark:text-white tracking-tighter italic">E-SYS</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400"><X /></button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Navigation</h4>
                    <ul className="space-y-4">
                      {['About', 'Courses', 'Timetable', 'Syllabus', 'Clubs', 'Events', 'Campus'].map(item => (
                        <li key={item}>
                          <Link to={`/${item.toLowerCase()}`} className="text-2xl font-bold text-gray-900 dark:text-white hover:text-secondary transition-colors">{item}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 text-red-500 font-bold text-xl"
                    >
                      <LogOut /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <Footer />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default StudentDashboard;
