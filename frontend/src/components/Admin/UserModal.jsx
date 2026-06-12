import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    // Student fields
    enrollment_id: '',
    department: 'CSE',
    current_semester: 1,
    parent_phone: '',
    address: '',
    // Faculty fields
    employee_id: '',
    sub_role: 'Lecturer',
    sub_role_custom: '',
    qualification: '',
    joining_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setFormData({ ...formData, ...user });
    } else {
      resetForm();
    }
  }, [user, isOpen]);

  const resetForm = () => {
    setRole('student');
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      enrollment_id: '',
      department: 'CSE',
      current_semester: 1,
      parent_phone: '',
      address: '',
      employee_id: '',
      sub_role: 'Lecturer',
      sub_role_custom: '',
      qualification: '',
      joining_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...formData, role };
      
      if (user) {
        await usersApi.update(user.id, payload);
        toast.success('User updated successfully');
      } else {
        await usersApi.create(payload);
        toast.success('User created successfully');
      }
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between bg-gray-50/50 dark:bg-navy-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-sm text-gray-500">Fill in the details below to {user ? 'update' : 'create'} a user account.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-navy-700 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Role Selection */}
          {!user && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">User Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['student', 'faculty', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`
                      py-2 px-4 rounded-xl border-2 transition-all capitalize text-sm font-bold
                      ${role === r 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-gray-100 dark:border-navy-700 text-gray-500 hover:border-gray-200'}
                    `}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            {!user && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            )}
          </div>

          {/* Role Specific Info */}
          <div className="pt-4 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              {role === 'student' ? 'Student Profile Details' : role === 'faculty' ? 'Faculty Profile Details' : 'Admin Details'}
            </h3>

            {role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Enrollment ID</label>
                  <input
                    required
                    name="enrollment_id"
                    value={formData.enrollment_id}
                    onChange={handleChange}
                    placeholder="ENR20240001"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {['CSE', 'EE', 'EC', 'Mechanical', 'Civil'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Current Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    name="current_semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Parent Phone</label>
                  <input
                    name="parent_phone"
                    value={formData.parent_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  ></textarea>
                </div>
              </div>
            )}

            {role === 'faculty' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Employee ID</label>
                  <input
                    required
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    placeholder="EMP0001"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {['CSE', 'EE', 'EC', 'Mechanical', 'Civil'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Sub Role</label>
                  <select
                    name="sub_role"
                    value={formData.sub_role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {['Lecturer', 'Supervisor', 'Librarian', 'Other'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {formData.sub_role === 'Other' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Custom Role</label>
                    <input
                      name="sub_role_custom"
                      value={formData.sub_role_custom}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Qualification</label>
                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="M.Tech, PhD"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Joining Date</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (
              <>
                <Save size={18} />
                {user ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
