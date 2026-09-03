import React from 'react';
import { User, Phone, Users, MapPin } from 'lucide-react';

const StudentEditForm = ({ formData, setFormData }) => {
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
                    <Users size={14} className="text-primary" /> Parent Phone
                </label>
                <input
                    type="tel"
                    value={formData.parent_phone || ''}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    placeholder="Enter parent contact number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
            <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    <MapPin size={14} className="text-primary" /> Permanent Address
                </label>
                <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter permanent address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium min-h-[80px]"
                />
            </div>
        </div>
    );
};

export default StudentEditForm;
