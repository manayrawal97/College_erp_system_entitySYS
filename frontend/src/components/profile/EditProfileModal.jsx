import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Edit3, Loader2 } from 'lucide-react';
import StudentEditForm from './StudentEditForm';
import FacultyEditForm from './FacultyEditForm';
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const EditProfileModal = ({ isOpen, onClose, userData, onRefresh }) => {
    useBodyScrollLock(isOpen);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        parent_phone: '',
        address: '',
        qualification: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && userData) {
            setFormData({
                full_name: userData.user?.full_name || '',
                phone: userData.user?.phone || '',
                parent_phone: userData.profile?.parent_phone || '',
                address: userData.profile?.address || '',
                qualification: userData.profile?.qualification || ''
            });
        }
    }, [isOpen, userData]);

    if (!isOpen || !userData) return null;

    const { user } = userData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: phone formats
        const phoneRegex = /^[+]?[0-9]{8,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
            return toast.error('Please enter a valid mobile number.');
        }
        if (user.role === 'student' && formData.parent_phone && !phoneRegex.test(formData.parent_phone.replace(/[\s-()]/g, ''))) {
            return toast.error('Please enter a valid parent contact number.');
        }

        try {
            setSubmitting(true);
            const response = await usersApi.update(user.id, formData);
            if (response.data.success) {
                toast.success('Profile updated successfully!');
                onRefresh();
                onClose();
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile information.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overscroll-contain">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-navy/60 backdrop-blur-xs"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Edit3 size={16} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">Edit Profile</h3>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest leading-relaxed">
                                Update your personal details below. Note: restricted academic parameters can only be altered by an system administrator.
                            </p>
                            
                            {user.role === 'student' ? (
                                <StudentEditForm formData={formData} setFormData={setFormData} />
                            ) : user.role === 'faculty' ? (
                                <FacultyEditForm formData={formData} setFormData={setFormData} />
                            ) : (
                                <div className="py-6 text-center text-gray-400 font-bold">
                                    No form editable parameters configured for this profile role.
                                </div>
                            )}
                        </div>

                        {/* Footer buttons */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl font-black text-xs hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-70"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditProfileModal;
