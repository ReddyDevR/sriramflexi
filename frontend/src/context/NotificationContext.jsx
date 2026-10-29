import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { API_BASE_URL } from '../config/api';

const NotificationContext = createContext();

// Helper to convert base64 VAPID public key for pushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('sri_ramu_token');
      const url = `${API_BASE_URL}/api/notifications?category=${filterCategory}&limit=50`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, filterCategory]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotif = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(c => c + 1);
    };

    socket.on('notification:received', handleNewNotif);
    socket.on('admin:notification', handleNewNotif);

    return () => {
      socket.off('notification:received', handleNewNotif);
      socket.off('admin:notification', handleNewNotif);
    };
  }, [socket]);

  // Check Web Push Permission & Subscription State
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setPushPermission(Notification.permission);
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsPushSubscribed(!!sub);
        });
      }).catch(err => console.log('SW register note:', err.message));
    }
  }, []);

  // Subscribe to Web Push Notifications
  const subscribePushNotification = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Web Push is not supported by your current browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        alert('Notification permission was denied. You will still receive in-app and email updates.');
        return false;
      }

      // Fetch VAPID public key
      const keyRes = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        console.warn('VAPID public key not found on backend');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const convertedKey = urlBase64ToUint8Array(keyData.publicKey);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      // Post subscription to backend
      const token = localStorage.getItem('sri_ramu_token');
      await fetch(`${API_BASE_URL}/api/notifications/push-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          deviceName: navigator.platform || 'Desktop/Mobile'
        })
      });

      setIsPushSubscribed(true);
      return true;
    } catch (e) {
      console.error('Failed to subscribe to Web Push:', e);
      return false;
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (e) {
      console.error('Error marking as read', e);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all as read', e);
    }
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem('sri_ramu_token');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      console.error('Error deleting notification', e);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      filterCategory,
      setFilterCategory,
      isDrawerOpen,
      setIsDrawerOpen,
      isPushSubscribed,
      pushPermission,
      subscribePushNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      fetchNotifications,
      isLoading
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
