import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPasswordForm = ({ onNext }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authApi.forgotPassword(email);
            if (response.data.success) {
                toast.success('OTP sent to your email');
                onNext(email);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 p-8 glass rounded-3xl shadow-2xl"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your email to receive a 6-digit OTP
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
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@university.edu"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Sending OTP...
                        </>
                    ) : (
                        'Send OTP Code'
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default ForgotPasswordForm;
