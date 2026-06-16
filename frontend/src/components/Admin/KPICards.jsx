import React from 'react';
import {
    Users,
    UserCheck,
    GraduationCap,
    BookOpen,
    ClipboardList,
    AlertCircle,
    Calendar,
    Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const KPI_CONFIG = [
    { key: 'totalUsers',       title: 'Total Users',       icon: Users,         color: 'bg-blue-500',   trend: '+12%',     trendUp: true  },
    { key: 'totalStudents',    title: 'Total Students',    icon: GraduationCap, color: 'bg-indigo-500', trend: '+5%',      trendUp: true  },
    { key: 'totalFaculty',     title: 'Total Faculty',     icon: UserCheck,     color: 'bg-emerald-500',trend: '+2%',      trendUp: true  },
    { key: 'activeCourses',    title: 'Active Courses',    icon: BookOpen,      color: 'bg-amber-500',  trend: '0%',       trendUp: true  },
    { key: 'totalEnrollments', title: 'Total Enrollments', icon: ClipboardList, color: 'bg-purple-500', trend: '+18%',     trendUp: true  },
    { key: 'pendingFees',      title: 'Pending Fees',      icon: AlertCircle,   color: 'bg-rose-500',   trend: '-8%',      trendUp: false },
    { key: 'totalExams',       title: 'Total Exams',       icon: Calendar,      color: 'bg-orange-500', trend: 'Upcoming', trendUp: true  },
    { key: 'activeNotices',    title: 'Active Notices',    icon: Bell,          color: 'bg-pink-500',   trend: 'Live',     trendUp: true  },
];

const KPICard = ({ title, value, icon: Icon, color, trend, trendUp, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const KPICards = ({ stats }) => {
    const formatValue = (key, value) => {
        if (value === undefined || value === null) return '...';
        if (key === 'pendingFees') {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumSignificantDigits: 3
            }).format(value);
        }
        return value.toLocaleString();
    };

    const displayData = KPI_CONFIG.map(config => ({
        ...config,
        value: formatValue(config.key, stats?.[config.key])
    }));

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {displayData.map((kpi, index) => (
                <KPICard key={kpi.title} {...kpi} index={index} />
            ))}
        </div>
    );
};

export default KPICards;
