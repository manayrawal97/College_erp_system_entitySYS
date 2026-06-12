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
        response = await usersApi.getStudents();
      } else if (activeTab === 'faculty') {
        response = await usersApi.getFaculty();
      } else if (activeTab === 'inactive') {
        response = await usersApi.getAll({ is_active: false });
      } else if (activeTab === 'admin') {
        response = await usersApi.getAll({ role: 'admin' });
      } else {
        response = await usersApi.getAll();
      }
      setUsers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
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
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-navy-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Users className="text-primary" />
            User Management
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-navy-600 transition-all text-sm font-medium">
              <Upload size={18} />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-navy-600 transition-all text-sm font-medium">
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-medium shadow-lg shadow-primary/20"
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-navy-900 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white dark:bg-navy-700 text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-gray-50/50 dark:bg-navy-900/50 border-b border-gray-100 dark:border-navy-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-navy-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-navy-800 transition-all text-sm">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-navy-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role / Dept</th>
              <th className="px-6 py-4">ID / Semester</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-4">
                    <div className="h-12 bg-gray-100 dark:bg-navy-700 rounded-xl"></div>
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
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase mb-1 ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.department || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.enrollment_id || user.employee_id || 'N/A'}
                    </p>
                    {user.current_semester && (
                      <p className="text-xs text-gray-500">Semester {user.current_semester}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
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
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
