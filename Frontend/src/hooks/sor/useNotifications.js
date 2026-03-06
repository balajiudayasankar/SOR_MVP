import { useState, useEffect, useCallback } from 'react';
import notificationService from '../../services/sor/notificationService';
import { NOTIFICATION_POLL_INTERVAL } from '../../constants/sor/sorConstants';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data || 0);
    } catch { /* silent poll */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAllNotifications();
      setNotifications(res.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const markAsRead = async (ids) => {
    try {
      await notificationService.markAsRead(ids);
      fetchUnreadCount();
      fetchNotifications();
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.notificationId);
    if (unreadIds.length) await markAsRead(unreadIds);
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, NOTIFICATION_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllRead };
};

export default useNotifications;
