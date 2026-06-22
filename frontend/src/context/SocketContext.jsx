import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('🔌 Socket connected in Context:', newSocket.id);
            // Join user-specific room and role/dept rooms
            newSocket.emit('join_room', {
                user_id: user.id,
                role: user.role,
                department: user.student_dept || user.faculty_dept,
                semester: user.current_semester
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
