import { Routes, Route } from"react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import LandingPage from"./Pages/Landing/LandingPage";
import LoginPage from"./Pages/Auth/LoginPage";
import RegisterPage from"./Pages/Auth/RegisterPage";
import ForgotPasswordPage from"./Pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from"./Pages/Auth/ResetPasswordPage";
import VerifyOtpPage from"./Pages/Auth/VerifyOtpPage";
import StudentDashboard from"./Pages/Student/StudentDashboard";
import AdminDashboard from"./Pages/Admin/AdminDashboard";
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
 <div className="min-h-screen bg-white">
 <Toaster position="top-right" reverseOrder={false} />
 <Routes>
 {/* Public Routes */}
 <Route path="/" element={<LandingPage />} />
 
 {/* Auth Routes */}
 <Route path="/login" element={<LoginPage />} />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/forgot-password" element={<ForgotPasswordPage />} />
 <Route path="/reset-password" element={<ResetPasswordPage />} />
 <Route path="/verify-otp" element={<VerifyOtpPage />} />

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
 </AuthProvider>
 );
};

export default App;
// >
// </ProtectedRoute>
// } 
// />
// </Routes>
// </div>
// </AuthProvider>
// );
// };

// export default App;
