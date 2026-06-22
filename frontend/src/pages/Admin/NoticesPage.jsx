import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import NoticeManagement from '../../components/Admin/NoticeManagement';

const NoticesPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <NoticeManagement isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default NoticesPage;
