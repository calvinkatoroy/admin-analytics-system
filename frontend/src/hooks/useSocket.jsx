// frontend/src/hooks/useSocket.js

import { useState, useEffect } from 'react';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveStats, setLiveStats] = useState({
    onlineUsers: Math.floor(Math.random() * 10) + 1, // Random number 1-10
    timestamp: new Date()
  });

  useEffect(() => {
    // Simulate live updates every 30 seconds
    const interval = setInterval(() => {
      setLiveStats({
        onlineUsers: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date()
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    socket: null,
    isConnected: false, // Disabled for now
    liveStats
  };
};