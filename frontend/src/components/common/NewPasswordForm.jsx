import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { Loader2 } from 'lucide-react';

const NewPasswordForm = ({ onSubmit, loading, buttonText = "Update Password", showCurrentPassword = false }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
                {showCurrentPassword && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                required
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('current')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary transition-colors"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            required
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary transition-colors"
                        >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary transition-colors"
                        >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <PasswordStrengthMeter 
                password={formData.newPassword} 
                confirmPassword={formData.confirmPassword} 
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium bg-gradient-premium text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Processing...
                    </>
                ) : buttonText}
            </button>
        </form>
    );
};

export default NewPasswordForm;
