import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import ExamManagement from '../../components/Admin/ExamManagement';

const ExamsPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <ExamManagement isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default ExamsPage;
