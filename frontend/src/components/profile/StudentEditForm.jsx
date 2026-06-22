import React from 'react';

const StudentEditForm = ({ formData, setFormData }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">👨‍🎓 Full Name</label>
                <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">📱 Mobile Number</label>
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
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">👨‍👩‍👦 Parent Phone</label>
                <input
                    type="tel"
                    value={formData.parent_phone || ''}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    placeholder="Enter parent contact number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm text-gray-900 font-medium"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">📍 Permanent Address</label>
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
