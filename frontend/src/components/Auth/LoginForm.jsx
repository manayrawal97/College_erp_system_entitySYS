import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateEmail } from '../../utils/validators';
import PasswordInput from './PasswordInput';
import { motion } from 'framer-motion';

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const validate = (values) => {
        const errors = {};
        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!validateEmail(values.email)) {
            errors.email = 'Invalid email address';
        }
        if (!values.password) {
            errors.password = 'Password is required';
        }
        return errors;
    };

    const { values, errors, touched, handleChange, handleBlur, isValid } = useFormValidation(
        { email: '', password: '', rememberMe: false },
        validate
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid()) return;

        setIsLoading(true);
        try {
            const user = await login({ email: values.email, password: values.password });

            // Role-based redirection
            if (user.role === 'student') {
                navigate('/student/dashboard');
            } else if (user.role === 'faculty') {
                navigate('/faculty/dashboard');
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            // Error handled by AuthContext toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 p-8 glass rounded-3xl shadow-2xl"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Please enter your details to sign in
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="name@university.edu"
                                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm ${touched.email && errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 '
                                    }`}
                            />
                        </div>
                        {touched.email && errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <PasswordInput
                        label="Password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        touched={touched.password}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="rememberMe"
                            name="rememberMe"
                            type="checkbox"
                            checked={values.rememberMe}
                            onChange={handleChange}
                            className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link
                            to="/forgot-password"
                            className="font-medium text-secondary hover:text-accent transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                    to="/register"
                    className="font-medium text-secondary hover:text-accent transition-colors"
                >
                    Create an account
                </Link>
            </p>
        </motion.div>
    );
};

export default LoginForm;
