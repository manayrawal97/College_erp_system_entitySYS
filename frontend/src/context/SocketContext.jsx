import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if user logs out
            if (socketRef.connect) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            setConnected(true);
            // Join role-based room and course rooms
            socket.emit('join_room', {
                role: user.role,
                course_ids: user.course_ids || [],
            });
        });

        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, user?.id]); // reconnect only if user changes

    const subscribe = (event, handler) => {
        if (!socketRef.current) return () => { };
        socketRef.current.on(event, handler);
        return () => socketRef.current?.off(event, handler);
    };

    const emit = (event, data) => {
        socketRef.current?.emit(event, data);
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, subscribe, emit }}>
            {children}
        </SocketContext.Provider>
    );
}