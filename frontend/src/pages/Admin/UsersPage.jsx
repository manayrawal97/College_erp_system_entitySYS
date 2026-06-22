import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import UserManagement from '../../components/Admin/UserManagement';

const UsersPage = () => {
    return (
        <AdminLayout>
            <div className="pb-10">
                <UserManagement isDashboard={false} />
            </div>
        </AdminLayout>
    );
};

export default UsersPage;
