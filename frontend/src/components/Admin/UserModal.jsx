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
            if (error.response?.data?.errors) {
                const errorMsgs = error.response.data.errors.map(err => err.msg || err.path + ': ' + err.msg).join(', ');
                toast.error(`Validation Error: ${errorMsgs}`);
            } else {
                toast.error(error.response?.data?.message || 'Failed to save user');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="bg-white w-full sm:max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom sm:slide-in-from-center duration-300"
            >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 truncate">
                            {user ? 'Edit User Profile' : 'Register New User'}
                        </h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5 shrink-0 truncate">
                            {user ? `UID: ${user.id}` : 'EntitySYS Access Control'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-200 rounded-xl transition-all text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
                    {/* Role Selection */}
                    {!user && (
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Select Account Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['student', 'faculty', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`
 py-3 px-2 rounded-2xl border-2 transition-all capitalize text-sm font-bold min-h-[48px]
 ${role === r
                                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                : 'border-gray-100 text-gray-500 hover:border-gray-200'}
 `}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Personal Information</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Full Name</label>
                                <input
                                    required
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@entitysys.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase">Phone Number</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                />
                            </div>
                            {!user && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium">8+ characters, uppercase, lowercase & a number</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role Specific Info */}
                    <div className="space-y-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                            {role === 'student' ? 'Academic Records' : role === 'faculty' ? 'Employment Profile' : 'Access Permissions'}
                        </label>

                        {role === 'student' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Enrollment ID</label>
                                    <input
                                        name="enrollment_id"
                                        value={formData.enrollment_id}
                                        onChange={handleChange}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px] cursor-pointer"
                                    >
                                        {['CSE', 'EE', 'EC', 'Mechanical', 'Civil'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Current Semester</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="8"
                                        name="current_semester"
                                        value={formData.current_semester}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Emergency Contact</label>
                                    <input
                                        name="parent_phone"
                                        value={formData.parent_phone}
                                        onChange={handleChange}
                                        placeholder="Parent's phone"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Permanent Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Enter complete address"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {role === 'faculty' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Employee ID</label>
                                    <input
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleChange}
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px] cursor-pointer"
                                    >
                                        {['CSE', 'EE', 'EC', 'Mechanical', 'Civil'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Sub Role</label>
                                    <select
                                        name="sub_role"
                                        value={formData.sub_role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px] cursor-pointer"
                                    >
                                        {['Lecturer', 'Supervisor', 'Librarian', 'Other'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.sub_role === 'Other' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase">Custom Designation</label>
                                        <input
                                            name="sub_role_custom"
                                            value={formData.sub_role_custom}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Qualifications</label>
                                    <input
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleChange}
                                        placeholder="M.Tech, PhD"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Joining Date</label>
                                    <input
                                        type="date"
                                        name="joining_date"
                                        value={formData.joining_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900 min-h-[48px] cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {role === 'admin' && (
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                                <AlertCircle className="text-amber-500 shrink-0" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-amber-800">Admin Privileges</p>
                                    <p className="text-xs text-amber-600 mt-1 leading-relaxed font-medium">Administrators have full access to system configuration and user management. Ensure this account is granted only to authorized personnel.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0 pb-safe sm:pb-6">
                    <button
                        onClick={onClose}
                        className="order-2 sm:order-1 px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all min-h-[48px] rounded-2xl hover:bg-gray-100"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="order-1 sm:order-2 flex items-center justify-center gap-2 px-10 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/25 disabled:opacity-50 min-h-[48px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save size={20} />
                                {user ? 'Save Profile' : 'Create Account'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
