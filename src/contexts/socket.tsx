"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SocketContext, SocketContextType } from './socket-context';
import { server } from '../redux/constants';

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        // Derive socket URL from the environment or default to backend origin
        const envServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
        const defaultBackend = envServerUrl ? envServerUrl.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000';
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || defaultBackend;

        const socketInstance = io(socketUrl, {
            transports: ['polling', 'websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('Socket.IO connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected:', reason);
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            setIsConnected(false);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            toast.success('Connection restored');
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('Socket.IO reconnection failed');
            toast.error('Failed to reconnect to server');
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const joinAdminRoom = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('join:admin');
            console.log('Joined admin room');
        }
    }, [socket, isConnected]);

    const leaveAdminRoom = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('leave:admin');
            console.log('Left admin room');
        }
    }, [socket, isConnected]);

    const value: SocketContextType = {
        socket,
        isConnected,
        joinAdminRoom,
        leaveAdminRoom,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
