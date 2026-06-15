import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import KPICards from '../../components/Admin/KPICards';
import UserManagement from '../../components/Admin/UserManagement';
import CourseManagement from '../../components/Admin/CourseManagement';
import NoticeManagement from '../../components/Admin/NoticeManagement';
import ExamManagement from '../../components/Admin/ExamManagement';
import FeeManagement from '../../components/Admin/FeeManagement';
import ReportSection from '../../components/Admin/ReportSection';
import { usersApi, coursesApi, feesApi, noticesApi, gradesApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Simulate data fetch
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard statistics');
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 sm:space-y-12 pb-20">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Admin Control Center</h1>
                    <p className="text-gray-500 text-sm sm:text-base mt-1 font-medium">Comprehensive management of EntitySYS resources and users.</p>
                </div>

                {/* Section 1: KPI Cards */}
                <section>
                    <KPICards stats={stats} />
                </section>

                {/* Section 2: User Management */}
                <section id="users">
                    <UserManagement />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                    {/* Section 3: Course Management */}
                    <section id="courses">
                        <CourseManagement />
                    </section>

                    {/* Section 4: Notice Management */}
                    <section id="notices">
                        <NoticeManagement />
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                    {/* Section 6: Fee Management */}
                    <section id="fees">
                        <FeeManagement />
                    </section>

                    {/* Section 5: Exam Management */}
                    <section id="exams">
                        <ExamManagement />
                    </section>
                </div>

                {/* Section 7: Reports */}
                <section id="reports" className="pt-4">
                    <ReportSection />
                </section>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
