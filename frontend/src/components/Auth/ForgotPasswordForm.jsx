import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { authApi } from '../../services/api';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateEmail } from '../../utils/validators';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPasswordForm = () => {
 const [isLoading, setIsLoading] = useState(false);
 const [isSent, setIsSent] = useState(false);

 const validate = (values) => {
 const errors = {};
 if (!values.email) {
 errors.email = 'Email is required';
 } else if (!validateEmail(values.email)) {
 errors.email = 'Invalid email address';
 }
 return errors;
 };

 const { values, errors, touched, handleChange, handleBlur, isValid } = useFormValidation(
 { email: '' },
 validate
 );

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!isValid()) return;

 setIsLoading(true);
 try {
 await authApi.forgotPassword(values.email);
 setIsSent(true);
 toast.success('Reset link sent to your email!');
 } catch (error) {
 toast.error(error.response?.data?.message || 'Failed to send reset link');
 } finally {
 setIsLoading(false);
 }
 };

 if (isSent) {
 return (
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl text-center"
 >
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
 <Send className="h-6 w-6 text-green-600" />
 </div>
 <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
 <p className="mt-2 text-sm text-gray-600">
 We've sent a password reset link to <span className="font-semibold">{values.email}</span>.
 </p>
 <div className="mt-8">
 <Link 
 to="/login" 
 className="btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold w-full inline-block"
 >
 Back to Login
 </Link>
 </div>
 <button 
 onClick={() => setIsSent(false)}
 className="mt-4 text-sm text-secondary hover:text-accent font-medium"
 >
 Didn't receive email? Try again
 </button>
 </motion.div>
 );
 }

 return (
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl"
 >
 <div className="text-center">
 <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
 <p className="mt-2 text-sm text-gray-600">
 Enter your email and we'll send you a link to reset your password.
 </p>
 </div>

 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Email Address
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
 <input
 type="email"
 name="email"
 value={values.email}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder="name@university.edu"
 className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 ${
 touched.email && errors.email ? 'border-red-500' : 'border-gray-300 '
 }`}
 />
 </div>
 {touched.email && errors.email && (
 <p className="text-xs text-red-500 mt-1">{errors.email}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
 >
 {isLoading ? (
 <>
 <Loader2 className="animate-spin h-5 w-5" />
 Sending Link...
 </>
 ) : (
 'Send Reset Link'
 )}
 </button>

 <Link 
 to="/login" 
 className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-secondary transition-colors"
 >
 <ArrowLeft className="h-4 w-4" />
 Back to Login
 </Link>
 </form>
 </motion.div>
 );
};

export default ForgotPasswordForm;
