import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Singleton socket instance
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

export const useSocketEvent = (eventName: string, callback: (data: any) => void) => {
  useEffect(() => {
    socket.on(eventName, callback);
    
    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};
