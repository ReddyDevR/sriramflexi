import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import soundManager from '../utils/soundAlerts';
import { startTabTitleAlert, stopTabTitleAlert } from '../utils/tabTitleManager';
import { API_BASE_URL } from '../config/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveCounters, setLiveCounters] = useState({
    newOrders: 0,
    pendingPayments: 0,
    pendingRequests: 0,
    unreadAdminNotifications: 0
  });

  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    const socketInstance = io(`${API_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to Sri Ramu Digital backend:', socketInstance.id);
      setIsConnected(true);

      if (user) {
        socketInstance.emit('authenticate', {
          userId: user._id,
          role: user.role
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.warn('⚡ Socket disconnected. Attempting automatic reconnection...');
      setIsConnected(false);
    });

    // Admin real-time alerts
    socketInstance.on('admin:new-order', (data) => {
      console.log('🔔 Admin received new order alert:', data);
      if (data.sound === 'ORDER') {
        soundManager.playOrderAlert();
      }
      setActiveAlert({
        type: 'ORDER',
        title: `New Order: #${data.orderId}`,
        message: `${data.customerName} submitted an order for ₹${data.amount}`,
        orderId: data.orderId,
        timestamp: Date.now()
      });
      startTabTitleAlert('New Order Received', 1);
    });

    socketInstance.on('admin:payment-submitted', (data) => {
      console.log('💳 Admin received payment verification alert:', data);
      if (data.sound === 'PAYMENT') {
        soundManager.playPaymentAlert();
      }
      setActiveAlert({
        type: 'PAYMENT',
        title: `Payment Submitted: #${data.orderId}`,
        message: `${data.customerName} submitted ₹${data.amount} via ${data.paymentMode}`,
        orderId: data.orderId,
        timestamp: Date.now()
      });
      startTabTitleAlert('Payment Verification Alert', 1);
    });

    socketInstance.on('admin:request-alert', (data) => {
      console.log('📩 Admin received request alert:', data);
      if (data.sound === 'REQUEST') {
        soundManager.playRequestAlert();
      }
      setActiveAlert({
        type: 'REQUEST',
        title: `Urgent Request: #${data.requestId}`,
        message: `Customer submitted an urgent request/cancellation`,
        requestId: data.requestId,
        timestamp: Date.now()
      });
      startTabTitleAlert('Urgent Request Alert', 1);
    });

    // Real-time live counters update
    socketInstance.on('admin:live-counters', (counters) => {
      setLiveCounters(counters);
    });

    // Reconnection missed sync handler
    socketInstance.on('sync:response', ({ notifications, counters }) => {
      console.log('🔄 Reconnect sync complete. Catchup notifications:', notifications.length);
      if (counters) setLiveCounters(counters);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Re-authenticate socket when user changes role
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('authenticate', {
        userId: user._id,
        role: user.role
      });
    }
  }, [user, socket, isConnected]);

  const dismissAlert = () => {
    setActiveAlert(null);
    stopTabTitleAlert();
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      liveCounters,
      activeAlert,
      dismissAlert
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
