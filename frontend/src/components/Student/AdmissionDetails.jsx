import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Award, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import studentService from '../../services/studentService';

const AdmissionDetails = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await studentService.getAdmissionDetails();
                if (response.data.success) {
                    setDetails(response.data.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch admission details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-red-50 rounded-3xl border border-dashed border-red-200 p-6">
                <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-bold">{error}</p>
            </div>
        );
    }

    const {
        full_name, email, phone, enrollment_id,
        department, current_semester, address,
        parent_phone, admission_date, status, document_status
    } = details || {};

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 max-w-4xl mx-auto">
            {/* Header / Status Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-gray-100 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">Admission Dossier</h2>
                    <p className="text-gray-500 font-bold mt-1">Official University Enrollment Status</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${
                        status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                        Status: {status}
                    </span>
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl text-xs font-black uppercase tracking-wider">
                        Docs: {document_status}
                    </span>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
                        <User className="text-secondary h-5 w-5" />
                        Personal Information
                    </h3>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Full Name</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{full_name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Email Address</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Mobile Number</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{phone || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Phone size={18} className="text-rose-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-rose-400 font-black uppercase tracking-wider">Parent Phone</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{parent_phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Academic Enrollment */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Award className="text-secondary h-5 w-5" />
                        Academic & Program Details
                    </h3>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Award size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Enrollment ID</p>
                            <p className="text-base font-black text-secondary mt-0.5">{enrollment_id}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Award size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Academic Program</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{department} Engineering</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Current Semester</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">{current_semester} Semester</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Date of Admission</p>
                            <p className="text-base font-bold text-gray-800 mt-0.5">
                                {admission_date ? new Date(admission_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Permanent Residential Address</p>
                        <p className="text-base font-bold text-gray-800 mt-1 leading-relaxed">{address || 'No address logged.'}</p>
                    </div>
                </div>
            </div>

            {/* Verified Footer */}
            <div className="mt-10 p-5 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-100 text-emerald-800 text-sm font-bold">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <span>All documents have been verified and processed by the registrar board.</span>
            </div>
        </div>
    );
};

export default AdmissionDetails;
