import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import CourseManagement from '../../components/Admin/CourseManagement';

const CoursesPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <CourseManagement isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default CoursesPage;
