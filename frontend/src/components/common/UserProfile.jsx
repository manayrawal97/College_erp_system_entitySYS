import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Key, Edit3 } from 'lucide-react';
import StudentProfileView from '../profile/StudentProfileView';
import FacultyProfileView from '../profile/FacultyProfileView';

const UserProfile = ({ userData, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Fetching Profile Data...</p>
            </div>
        );
    }

    if (!userData) return null;

    const { user, profile } = userData;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Avatar Area */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center lg:sticky lg:top-24"
            >
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                        {getInitials(user?.full_name)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 text-gray-500 hover:text-primary transition-colors hover:scale-110">
                        <Edit3 size={18} />
                    </button>
                </div>

                <div className="mt-6 space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">{user?.full_name}</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {user?.role}
                        </span>
                        {user?.is_active && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">
                                <Shield size={10} fill="currentColor" /> Verified
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-gray-50 my-8"></div>

                <div className="w-full space-y-3">
                    <button className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                        <Edit3 size={18} /> Edit Profile
                    </button>
                    <button className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all border border-gray-100 active:scale-95">
                        <Key size={18} /> Change Password
                    </button>
                </div>
            </motion.div>

            {/* Right Column: Detailed Info */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-8 bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-xl shadow-gray-200/50"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <User size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Profile Information</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Personal & Academic Records</p>
                    </div>
                </div>

                {user?.role === 'student' ? (
                    <StudentProfileView user={user} profile={profile} />
                ) : user?.role === 'faculty' ? (
                    <FacultyProfileView user={user} profile={profile} />
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold">No profile records found for this role.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UserProfile;
