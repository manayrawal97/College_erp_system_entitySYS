import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { usersApi } from '../../services/api';
import UserProfile from '../../components/common/UserProfile';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { logout } = useAuthContext();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await usersApi.getProfile();
            if (response.data.success) {
                setUserData(response.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile information');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] font-sans pb-20">
            {/* Header / Top Bar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">E</div>
                        <span className="text-lg font-black text-gray-900 tracking-tight">EntitySYS</span>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all font-bold text-sm"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">My Profile</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Manage your personal and academic information</p>
                </div>

                <UserProfile userData={userData} loading={loading} onRefresh={fetchProfile} />
            </main>
        </div>
    );
};

export default ProfilePage;
