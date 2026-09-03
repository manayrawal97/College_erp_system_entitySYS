import React, { useState } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import NewPasswordForm from '../common/NewPasswordForm';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    useBodyScrollLock(isOpen);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (formData) => {
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        setLoading(true);
        try {
            const response = await authApi.changePassword({
                current_password: formData.currentPassword,
                new_password: formData.newPassword
            });
            if (response.data.success) {
                toast.success('Password updated successfully');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overscroll-contain">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Security Setting</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update your login credentials</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <NewPasswordForm 
                                onSubmit={handleChangePassword}
                                loading={loading}
                                buttonText="Confirm Change"
                                showCurrentPassword={true}
                            />
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 pb-8">
                            <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100/50">
                                <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                                    Securing your account is our priority. Ensure your new password is not shared with anyone.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
