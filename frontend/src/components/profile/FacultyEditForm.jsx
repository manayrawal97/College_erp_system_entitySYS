import React from 'react';
import { User, Phone, GraduationCap } from 'lucide-react';

const FacultyEditForm = ({ formData, setFormData }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <User size={14} className="text-primary" /> Full Name
                </label>
                <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Phone size={14} className="text-primary" /> Mobile Number
                </label>
                <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your contact number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <GraduationCap size={14} className="text-primary" /> Qualification
                </label>
                <input
                    type="text"
                    required
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Tech, PhD (Computer)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
        </div>
    );
};

export default FacultyEditForm;
