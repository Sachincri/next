"use client";

import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

export interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinAdminRoom: () => void;
    leaveAdminRoom: () => void;
}

const defaultSocketContext: SocketContextType = {
    socket: null,
    isConnected: false,
    joinAdminRoom: () => { },
    leaveAdminRoom: () => { },
};

export const SocketContext = createContext<SocketContextType>(defaultSocketContext);

export const useSocket = () => {
    return useContext(SocketContext);
};
