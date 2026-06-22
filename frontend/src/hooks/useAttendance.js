import { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import { useSocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useAttendance = () => {
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socket = useSocketContext();

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError(null);
            const [recordsRes, summaryRes] = await Promise.all([
                studentService.getAttendanceRecords(),
                studentService.getAttendanceSummary()
            ]);
            
            if (recordsRes.data.success) {
                setRecords(recordsRes.data.data);
            }
            if (summaryRes.data.success) {
                setSummary(summaryRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to load attendance records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleAttendanceUpdated = (data) => {
            console.log('⚡ Attendance updated event received:', data);
            toast('Attendance records have been updated!', { icon: '📝' });
            fetchAttendance();
        };

        socket.on('attendance_updated', handleAttendanceUpdated);

        return () => {
            socket.off('attendance_updated', handleAttendanceUpdated);
        };
    }, [socket]);

    return { records, summary, loading, error, refresh: fetchAttendance };
};

export default useAttendance;
