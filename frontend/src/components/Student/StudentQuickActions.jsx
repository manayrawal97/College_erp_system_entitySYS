import React from 'react';
import { Target, Users, BookOpen, FileBadge, Briefcase } from 'lucide-react';
import { FeatureCard } from './StudentComponents';
import StudentAttendanceCard from './StudentAttendanceCard';

const StudentQuickActions = () => {
    return (
        <div className="area-cards space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-3 h-10 bg-secondary rounded-full"></div>
                    Quick Actions
                </h2>
            </div>
            {/* Breakpoints Card Columns: Mobile=1, Tablet=2, Desktop=3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <FeatureCard
                    icon={FileBadge}
                    title="Admission"
                    description="Your admission status and verified documents"
                    link="/admission-details"
                    comingSoon
                />
                <FeatureCard
                    icon={Briefcase}
                    title="Exam Portal"
                    description="Registration, fee payment, and hall tickets"
                    link="/exam-forms"
                    comingSoon
                />
                <StudentAttendanceCard />
                <FeatureCard
                    icon={Target}
                    title="Results"
                    description="Grades, transcripts, and semester marks"
                    link="/marks"
                    comingSoon
                    extra={
                        <div className="mt-2">
                            <span className="text-[11px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">CGPA: 8.5 / 10</span>
                        </div>
                    }
                />
                <FeatureCard
                    icon={Users}
                    title="Community"
                    description="Chat with batchmates and join study groups"
                    link="/classmates"
                    comingSoon
                />
                <FeatureCard
                    icon={BookOpen}
                    title="LMS"
                    description="Access course materials and assignments"
                    link="/courses"
                    comingSoon
                />
            </div>
        </div>
    );
};

export default StudentQuickActions;
