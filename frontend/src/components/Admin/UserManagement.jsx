import React, { useState, useEffect } from 'react';
import {
    Search,
    UserPlus,
    Users,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    UserX,
    CheckCircle,
    Download,
    Upload
} from 'lucide-react';
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';
import UserModal from './UserModal';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const tabs = [
        { id: 'all', label: 'All Users', icon: '📋' },
        { id: 'student', label: 'Students', icon: '🎓' },
        { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
        { id: 'admin', label: 'Admins', icon: '👑' },
        { id: 'inactive', label: 'Inactive', icon: '🚫' },
    ];

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let response;

            if (activeTab === 'student') {
                // Pass is_active explicitly so inactive students don't appear here
                response = await usersApi.getAll({ role: 'student', is_active: true });

            } else if (activeTab === 'faculty') {
                response = await usersApi.getAll({ role: 'faculty', is_active: true });

            } else if (activeTab === 'admin') {
                response = await usersApi.getAll({ role: 'admin', is_active: true });

            } else if (activeTab === 'inactive') {
                // ✅ This now works — backend reads is_active='false' and returns
                // only rows WHERE u.is_active = 0
                response = await usersApi.getAll({ is_active: false });

            } else {
                // 'all' tab — active users only by default.
                // Change to is_active: 'all' if you want to show everyone here.
                response = await usersApi.getAll({ is_active: true });
            }
            // setLoading(true);
            // let response;
            // if (activeTab === 'student') {
            //     response = await usersApi.getStudents();
            // } else if (activeTab === 'faculty') {
            //     response = await usersApi.getFaculty();
            // } else if (activeTab === 'inactive') {
            //     response = await usersApi.getAll({ is_active: false });
            // } else if (activeTab === 'admin') {
            //     response = await usersApi.getAll({ role: 'admin' });
            // } else {
            //     response = await usersApi.getAll();
            // }
            setUsers(response.data.data || []);
            // setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            // setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.enrollment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-primary" />
                        User Management
                    </h2>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2"> */}
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold min-h-[44px]">
                            <Upload size={18} />
                            Import
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold min-h-[44px]">
                            <Download size={18} />
                            Export
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-lg shadow-primary/20 min-h-[44px]"
                        >
                            <UserPlus size={18} />
                            Add User
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto no-scrollbar custom-scrollbar-h">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-h-[40px]
 ${activeTab === tab.id
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800 '}
 `}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters & Search */}
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all min-h-[44px] text-gray-900"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-white transition-all text-sm font-bold min-h-[44px]">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Table / Card View */}
            <div className="overflow-x-auto custom-scrollbar-h">
                {/* Desktop & Tablet Table */}
                <table className="w-full text-left hidden md:table">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">User</th>
                            <th className="px-6 py-4 whitespace-nowrap">Role / Dept</th>
                            <th className="px-6 py-4 whitespace-nowrap">ID / Semester</th>
                            <th className="px-6 py-4 whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="px-6 py-4">
                                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                {user.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase mb-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <p className="text-xs text-gray-600">{user.department || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.enrollment_id || user.employee_id || 'N/A'}
                                        </p>
                                        {user.current_semester && (
                                            <p className="text-xs text-gray-500">Semester {user.current_semester}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.is_active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                                        try {
                                                            await usersApi.delete(user.id);
                                                            toast.success('User deleted successfully');
                                                            fetchUsers();
                                                        } catch (error) {
                                                            toast.error('Failed to delete user');
                                                        }
                                                    }
                                                }}
                                                className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button className="p-2.5 text-gray-400 hover:text-gray-600 rounded-xl transition-all min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse"></div>
                        ))
                    ) : filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                                    {user.full_name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{user.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role / Dept</p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {user.role} - {user.department || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID / Semester</p>
                                    <p className="text-sm font-bold text-gray-700">
                                        {user.enrollment_id || user.employee_id || 'N/A'}
                                        {user.current_semester ? ` (S${user.current_semester})` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all min-h-[44px]"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure?')) {
                                            try {
                                                await usersApi.delete(user.id);
                                                toast.success('Deleted');
                                                fetchUsers();
                                            } catch (error) {
                                                toast.error('Failed');
                                            }
                                        }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm transition-all min-h-[44px]"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onRefresh={fetchUsers}
            />
        </div>
    );
};

export default UserManagement;
