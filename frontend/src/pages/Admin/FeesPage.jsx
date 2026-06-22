import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import FeeManagement from '../../components/Admin/FeeManagement';

const FeesPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <FeeManagement isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default FeesPage;
