import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import ReportSection from '../../components/Admin/ReportSection';

const ReportsPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <ReportSection isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default ReportsPage;
