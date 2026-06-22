import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureCard } from './StudentComponents';

const StudentAttendanceCard = () => {
    return (
        <FeatureCard
            icon={CheckCircle}
            title="Attendance"
            description="Track your regular attendance and leaves"
            link="/attendance"
            comingSoon
            extra={
                <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                        <span className="text-gray-500">Attendance</span>
                        <span className="text-secondary">85%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-secondary rounded-full"
                        ></motion.div>
                    </div>
                </div>
            }
        />
    );
};

export default StudentAttendanceCard;
