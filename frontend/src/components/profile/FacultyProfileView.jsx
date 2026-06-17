import React from 'react';
import { 
    Mail, 
    Phone, 
    IdCard, 
    BookOpen, 
    GraduationCap, 
    Briefcase, 
    Calendar,
    Award
} from 'lucide-react';

const FacultyProfileView = ({ user, profile }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const InfoCard = ({ icon: Icon, label, value, color = "text-primary" }) => (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:border-primary/20 hover:bg-white group">
            <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-gray-700">{value || 'Not Provided'}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Professional Information */}
            <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Briefcase size={14} /> Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard 
                        icon={IdCard} 
                        label="Employee ID" 
                        value={profile?.employee_id} 
                        color="text-indigo-600"
                    />
                    <InfoCard 
                        icon={BookOpen} 
                        label="Department" 
                        value={profile?.department} 
                        color="text-purple-600"
                    />
                    <InfoCard 
                        icon={Briefcase} 
                        label="Designation" 
                        value={profile?.sub_role === 'Other' ? profile?.sub_role_custom : profile?.sub_role} 
                        color="text-amber-600"
                    />
                </div>
            </section>

            {/* Academic & Contact Information */}
            <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Award size={14} /> Qualifications & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard 
                        icon={GraduationCap} 
                        label="Qualification" 
                        value={profile?.qualification} 
                        color="text-emerald-600"
                    />
                    <InfoCard 
                        icon={Mail} 
                        label="Email Address" 
                        value={user?.email} 
                        color="text-rose-600"
                    />
                    <InfoCard 
                        icon={Phone} 
                        label="Mobile Number" 
                        value={user?.phone} 
                        color="text-blue-600"
                    />
                    <InfoCard 
                        icon={Calendar} 
                        label="Joining Date" 
                        value={formatDate(profile?.joining_date)} 
                        color="text-orange-600"
                    />
                </div>
            </section>

            {/* Account Information */}
            <section>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Calendar size={14} /> Account Activity
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                            <p className="text-lg font-black text-gray-800">{formatDate(user?.created_at)}</p>
                        </div>
                        <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold border border-primary/20">
                            Faculty Member
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FacultyProfileView;
