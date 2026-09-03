import React from 'react';
import { motion } from 'framer-motion';

const StudentWelcome = ({ user }) => {
    if (!user) return null;
    const firstName = user.full_name ? user.full_name.split(' ')[0] : '';
    
    return (
        <div className="area-welcome mb-6 md:mb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 bg-gradient-premium rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
            >
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-secondary/20 rounded-full blur-[50px]"></div>

                <div className="relative z-10">
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">
                        Student Dashboard
                    </span>
                    <h1 className="text-3xl lg:text-5xl font-black mb-3 leading-tight tracking-tighter">
                        Welcome, <br className="hidden sm:block" /> {firstName}!
                    </h1>
                    <p className="text-blue-100 text-sm lg:text-lg font-bold mb-8 opacity-90">
                        Your academic progress at a glance.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Semester</p>
                            <p className="font-black text-lg">{user.current_semester || 'N/A'} Semester</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Enrollment ID</p>
                            <p className="font-black text-lg">{user.enrollment_id || 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Department</p>
                            <p className="font-black text-lg lg:text-xl">{user.student_dept || 'Computer Science Engineering'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentWelcome;
