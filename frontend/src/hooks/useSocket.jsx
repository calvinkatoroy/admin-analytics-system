import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveStats, setLiveStats] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time dashboard');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from real-time dashboard');
        setIsConnected(false);
      });

      newSocket.on('live_stats', (data) => {
        setLiveStats(data);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  return {
    socket,
    isConnected,
    liveStats
  };
};