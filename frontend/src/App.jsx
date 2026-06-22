import { Routes, Route } from"react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from"./Pages/Landing/LandingPage";
import LoginPage from"./Pages/Auth/LoginPage";
import RegisterPage from"./Pages/Auth/RegisterPage";
import ForgotPasswordPage from"./Pages/Auth/ForgotPasswordPage";
import StudentDashboard from"./Pages/Student/StudentDashboard";
import AdmissionPage from "./Pages/Student/AdmissionPage";
import ExamPortalPage from "./Pages/Student/ExamPortalPage";
import AttendancePage from "./Pages/Student/AttendancePage";
import ResultsPage from "./Pages/Student/ResultsPage";
import CommunityPage from "./Pages/Student/CommunityPage";
import LMSPage from "./Pages/Student/LMSPage";
import { SocketProvider } from "./context/SocketContext";
import AdminDashboard from"./Pages/Admin/AdminDashboard";
import UsersPage from "./Pages/Admin/UsersPage";
import CoursesPage from "./Pages/Admin/CoursesPage";
import NoticesPage from "./Pages/Admin/NoticesPage";
import ExamsPage from "./Pages/Admin/ExamsPage";
import FeesPage from "./Pages/Admin/FeesPage";
import ReportsPage from "./Pages/Admin/ReportsPage";
import FacultyDashboard from "./Pages/Faculty/FacultyDashboard";
import ProfilePage from "./Pages/Profile/ProfilePage";
import ProtectedRoute from"./components/Auth/ProtectedRoute";

const PlaceholderPage = ({ title }) => (
 <div className="min-h-screen flex items-center justify-center bg-gray-100">
 <h1 className="text-4xl font-bold text-primary">{title} Page Coming Soon</h1>
 </div>
);

const App = () => {
 return (
 <AuthProvider>
 <SocketProvider>
 <div className="min-h-screen bg-white">
 <Toaster position="top-right" reverseOrder={false} />
 <Routes>
 {/* Public Routes */}
 <Route path="/" element={<LandingPage />} />
 
 {/* Auth Routes */}
 <Route path="/login" element={<LoginPage />} />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/forgot-password" element={<ForgotPasswordPage />} />

 {/* Role-based Login Redirects (Legacy support) */}
 <Route path="/student-login" element={<LoginPage />} />
 <Route path="/faculty-login" element={<LoginPage />} />
 <Route path="/admin-login" element={<LoginPage />} />

 {/* Content Routes */}
 <Route path="/about" element={<PlaceholderPage title="About" />} />
 <Route path="/students" element={<PlaceholderPage title="Students" />} />
 <Route path="/faculty" element={<PlaceholderPage title="Faculty" />} />
 <Route path="/career" element={<PlaceholderPage title="Career" />} />
 <Route path="/alumni" element={<PlaceholderPage title="Alumni" />} />
 <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
 <Route path="/inquiry" element={<PlaceholderPage title="Inquiry" />} />

 {/* Dashboard (Protected - Example) */}
 <Route 
 path="/dashboard" 
 element={
 <ProtectedRoute>
 <PlaceholderPage title="Dashboard" />
 </ProtectedRoute>
 } 
 />

 {/* Student Routes */}
 <Route 
 path="/student/dashboard" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <StudentDashboard />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/admission" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <AdmissionPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/exams" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <ExamPortalPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/attendance" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <AttendancePage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/results" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <ResultsPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/community" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <CommunityPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/student/lms" 
 element={
 <ProtectedRoute allowedRoles={['student']}>
 <LMSPage />
 </ProtectedRoute>
 } 
 />

 {/* Faculty Routes */}
 <Route 
 path="/faculty/dashboard" 
 element={
 <ProtectedRoute allowedRoles={['faculty']}>
 <FacultyDashboard />
 </ProtectedRoute>
 } 
 />

 {/* Admin Routes */}
 <Route 
 path="/admin/dashboard" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <AdminDashboard />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/users" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <UsersPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/courses" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <CoursesPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/notices" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <NoticesPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/exams" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <ExamsPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/fees" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <FeesPage />
 </ProtectedRoute>
 } 
 />
 <Route 
 path="/admin/reports" 
 element={
 <ProtectedRoute allowedRoles={['admin']}>
 <ReportsPage />
 </ProtectedRoute>
 } 
 />

 {/* Unified Profile Route */}
 <Route 
 path="/profile" 
 element={
 <ProtectedRoute>
 <ProfilePage />
 </ProtectedRoute>
 } 
 />
 </Routes>
 </div>
 </SocketProvider>
 </AuthProvider>
 );
};

export default App;
