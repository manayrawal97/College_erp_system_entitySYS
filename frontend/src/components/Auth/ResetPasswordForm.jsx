import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import NewPasswordForm from '../common/NewPasswordForm';
import { motion } from 'framer-motion';

const ResetPasswordForm = ({ email, resetToken }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleReset = async (formData) => {
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const response = await authApi.resetPassword({
                email,
                resetToken,
                newPassword: formData.newPassword
            });
            if (response.data.success) {
                toast.success('Password Reset Successful');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset Failed');
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
                <h2 className="text-3xl font-bold text-gray-900">New Password</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Create a strong password for your account
                </p>
            </div>

            <NewPasswordForm 
                onSubmit={handleReset} 
                loading={loading} 
                buttonText="Reset Password" 
            />
        </motion.div>
    );
};

export default ResetPasswordForm;
