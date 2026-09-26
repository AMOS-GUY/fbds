import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();
  
  useEffect(() => {
    if (!token || !user) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }
    
    // Initialize Socket.io client
    const newSocket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:5000', {
      auth: { token },
      transports: ['websocket']
    });
    
    // Join user-specific room
    newSocket.emit('join:user', user.id);
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};