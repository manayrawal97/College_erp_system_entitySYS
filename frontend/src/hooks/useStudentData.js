import { useState, useEffect } from 'react';
import studentService from '../services/studentService';

export const useStudentData = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await studentService.getDashboardStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching student stats:', err);
            setError('Failed to fetch dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refresh: fetchStats };
};

export default useStudentData;
