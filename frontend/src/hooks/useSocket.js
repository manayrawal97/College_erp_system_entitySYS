import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = (event, callback) => {
    const socket = useSocketContext();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, callback);

        return () => {
            socket.off(event, callback);
        };
    }, [socket, event, callback]);

    return socket;
};

export default useSocket;
