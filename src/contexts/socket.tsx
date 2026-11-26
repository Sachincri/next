"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SocketContext, SocketContextType } from './socket-context';
import { server } from '../redux/constants';
import { useAppSelector } from '../redux/hooks';

interface SocketProviderProps {
    children: React.ReactNode;
}

const PRODUCTION_FALLBACK_SOCKET_URL = 'https://server-i8py.onrender.com';

const normalizeSocketBaseUrl = (rawUrl?: string): string | null => {
    const trimmed = rawUrl?.trim();
    if (!trimmed) return null;
    if (trimmed === '/' && typeof window !== 'undefined') {
        return window.location.origin;
    }
    try {
        const parsed = new URL(trimmed);
        if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
            return null;
        }
        const cleanPath = parsed.pathname.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
        return `${parsed.origin}${cleanPath}`;
    } catch {
        return null;
    }
};

const resolveSocketUrl = (): string => {
    const candidates = [
        process.env.NEXT_PUBLIC_SOCKET_URL,
        process.env.NEXT_PUBLIC_API_URL,
        process.env.NEXT_PUBLIC_SERVER_URL,
    ];

    for (const candidate of candidates) {
        const resolved = normalizeSocketBaseUrl(candidate);
        if (resolved) return resolved;
    }

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:5000';
        }
        return PRODUCTION_FALLBACK_SOCKET_URL;
    }

    return 'http://localhost:5000';
};

const fetchSocketToken = async (
    signal?: AbortSignal
): Promise<{ token?: string; unauthorized?: boolean }> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const onExternalAbort = () => controller.abort();
    signal?.addEventListener('abort', onExternalAbort, { once: true });

    try {
        const response = await fetch(`${server}/auth/socket-token`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
            return { unauthorized: true };
        }
        if (!response.ok) {
            return {};
        }

        const payload = await response.json();
        const token = payload?.data?.token;
        return typeof token === 'string' && token ? { token } : {};
    } catch {
        return {};
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', onExternalAbort);
    }
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const hasConnectedOnceRef = useRef(false);

    const { isAuthenticated, user } = useAppSelector((state) => state.user);
    const userId = (user as any)?._id || (user as any)?.id || null;
    const userRole = user?.role;

    useEffect(() => {
        if (!isAuthenticated || !userId) {
            setSocket(null);
            setIsConnected(false);
            hasConnectedOnceRef.current = false;
            return;
        }

        const effectAbort = new AbortController();
        const socketUrl = resolveSocketUrl();

        const socketInstance = io(socketUrl, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            tryAllTransports: true,
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 15000,
            timeout: 20000,
            auth: async (cb) => {
                const { token, unauthorized } = await fetchSocketToken(effectAbort.signal);
                if (effectAbort.signal.aborted) {
                    return;
                }
                if (unauthorized) {
                    // Stop futile retries when session cookie is missing/expired.
                    socketInstance.io.opts.reconnection = false;
                    socketInstance.disconnect();
                    return;
                }
                cb(token ? { token } : {});
            },
        });

        socketInstance.on('connect', () => {
            if (effectAbort.signal.aborted) return;
            setIsConnected(true);

            if (userRole === 'admin') {
                socketInstance.emit('join:admin');
            }

            if (hasConnectedOnceRef.current) {
                toast.success('Connection restored');
            }
            hasConnectedOnceRef.current = true;
        });

        socketInstance.on('disconnect', () => {
            if (effectAbort.signal.aborted) return;
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            if (effectAbort.signal.aborted) return;
            console.warn('Socket.IO connection error:', error.message);
            setIsConnected(false);
        });

        socketInstance.connect();
        setSocket(socketInstance);

        return () => {
            effectAbort.abort();
            socketInstance.removeAllListeners();
            socketInstance.disconnect();
            setIsConnected(false);
            setSocket(null);
        };
    }, [isAuthenticated, userId, userRole]);

    const joinAdminRoom = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('join:admin');
        }
    }, [socket, isConnected]);

    const leaveAdminRoom = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('leave:admin');
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
