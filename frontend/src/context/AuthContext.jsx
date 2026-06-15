import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = storage.getToken();
            if (token) {
                try {
                    const response = await authApi.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    storage.clear();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authApi.login(credentials);
            const { token, user: userData } = response.data;
            storage.setToken(token);
            storage.setUser(userData);
            setUser(userData);
            toast.success('Login successful!');
            return userData;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);
            const { token, user: registeredUser } = response.data;
            storage.setToken(token);
            storage.setUser(registeredUser);
            setUser(registeredUser);
            toast.success('Registration successful!');
            return registeredUser;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        storage.clear();
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
