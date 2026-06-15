import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
 const { user, loading } = useAuth();

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
 <Loader2 className="animate-spin h-10 w-10 text-secondary" />
 </div>
 );
 }

 if (!user) {
 return <Navigate to="/login" replace />;
 }

 if (allowedRoles && !allowedRoles.includes(user.role)) {
 return <Navigate to="/" replace />;
 }

 return children;
};

export default ProtectedRoute;
