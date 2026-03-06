import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../../hooks/sor/useNotifications';
import '../../../styles/sor/components/NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef(null);
  const navigate        = useNavigate();

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead([n.notificationId]);
    setOpen(false);
    navigate('/sor/notifications');
  };

  const getNotifIcon = (type) => {
    if (!type) return '🔵';
    const t = type.toLowerCase();
    if (t.includes('approv')) return '🟢';
    if (t.includes('reject')) return '🔴';
    if (t.includes('revision')) return '🟡';
    return '🔵';
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="sor-bell-wrapper" ref={dropdownRef}>
      <button className="sor-bell-btn" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span className="sor-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="sor-bell-dropdown">
          <div className="sor-bell-header">
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-link btn-sm p-0" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="sor-bell-list">
            {notifications.length === 0 ? (
              <div className="sor-bell-empty">No notifications</div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div key={n.notificationId}
                  className={`sor-bell-item ${!n.isRead ? 'sor-bell-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}>
                  <span className="sor-bell-item__icon">{getNotifIcon(n.type)}</span>
                  <div className="sor-bell-item__content">
                    <div className="sor-bell-item__msg">{n.message}</div>
                    <div className="sor-bell-item__time">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="sor-bell-footer">
            <button className="btn btn-link btn-sm"
              onClick={() => { setOpen(false); navigate('/sor/notifications'); }}>
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
