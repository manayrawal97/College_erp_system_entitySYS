import React from 'react';
import {
    BookOpen,
    Users,
    CalendarCheck,
    GraduationCap,
    Clock,
    Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const KPI_CONFIG = [
    { key: 'coursesCount',    title: 'Assigned Courses', icon: BookOpen,      color: 'bg-blue-500',   trend: 'Active',   trendUp: true  },
    { key: 'studentsCount',   title: 'Total Students',   icon: Users,         color: 'bg-purple-500', trend: 'Enrolled', trendUp: true  },
    { key: 'attendanceRate',  title: 'Avg Attendance',   icon: CalendarCheck, color: 'bg-emerald-500',trend: 'Today',    trendUp: true  },
    { key: 'pendingGrades',   title: 'Pending Grades',   icon: GraduationCap, color: 'bg-orange-500', trend: 'To Action',trendUp: false },
    { key: 'upcomingExams',   title: 'Upcoming Exams',   icon: Clock,         color: 'bg-rose-500',   trend: 'Scheduled',trendUp: true  },
    { key: 'noticesCount',    title: 'Active Notices',   icon: Bell,          color: 'bg-amber-500',  trend: 'Latest',   trendUp: true  },
];

const KPICard = ({ title, value, icon: Icon, color, trend, trendUp, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-gray-800">{value}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const FacultyKPICards = ({ stats, loading }) => {
    const formatValue = (key, value) => {
        if (loading || value === undefined || value === null) return '...';
        if (key === 'attendanceRate' && typeof value === 'number') return `${value}%`;
        return value.toLocaleString();
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {KPI_CONFIG.map((config, index) => {
                const { key, ...rest } = config;
                return (
                    <KPICard
                        key={key}
                        {...rest}
                        value={formatValue(key, stats?.[key])}
                        index={index}
                    />
                );
            })}
        </div>
    );
};

export default FacultyKPICards;
