import React, { useEffect } from 'react';
import useNotifications from '../../../hooks/sor/useNotifications';
import Breadcrumb from '../../../components/common/Breadcrumb';
import '../../../styles/sor/pages/NotificationList.css';




const getNotifIconClass = (type) => {
  if (!type) return { icon: 'bi-bell-fill', cls: 'nl-icon--blue' };
  const t = type.toLowerCase();
  if (t.includes('approv'))   return { icon: 'bi-check-circle-fill',   cls: 'nl-icon--green'  };
  if (t.includes('reject'))   return { icon: 'bi-x-circle-fill',       cls: 'nl-icon--red'    };
  if (t.includes('revision')) return { icon: 'bi-arrow-repeat',        cls: 'nl-icon--amber'  };
  if (t.includes('expedit'))  return { icon: 'bi-lightning-charge-fill', cls: 'nl-icon--purple' };
  if (t.includes('sent'))     return { icon: 'bi-send-fill',           cls: 'nl-icon--teal'   };
  return { icon: 'bi-bell-fill', cls: 'nl-icon--blue' };
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};




const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = (n) => {
    if (!n.isRead) markAsRead([n.notificationId]);
  };

  const readCount = notifications.length - unreadCount;

  return (
    <div className="nl-page">

      {}
      <div className="nl-page-header">
        <div>
          <h4 className="nl-page-title">
            Notifications
            {unreadCount > 0 && (
              <span className="nl-unread-badge">{unreadCount} unread</span>
            )}
          </h4>
          <p className="nl-page-subtitle">All SOR system notifications</p>
        </div>
        <div className="nl-header-actions">
          {unreadCount > 0 && (
            <button className="nl-btn nl-btn--outline" onClick={markAllRead}>
              <i className="bi bi-check2-all"></i>
              Mark All Read
            </button>
          )}
          <button className="nl-btn nl-btn--ghost" onClick={fetchNotifications}>
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>
      </div>

      {}
      <div className="nl-stats-strip">
        <div className="nl-stat-item">
          <div className="nl-stat-icon nl-stat-icon--total">
            <i className="bi bi-bell-fill"></i>
          </div>
          <div className="nl-stat-body">
            <span className="nl-stat-value">{notifications.length}</span>
            <span className="nl-stat-label">Total</span>
          </div>
        </div>

        <div className="nl-stat-sep" />

        <div className="nl-stat-item">
          <div className="nl-stat-icon nl-stat-icon--unread">
            <i className="bi bi-bell-slash-fill"></i>
          </div>
          <div className="nl-stat-body">
            <span className="nl-stat-value nl-stat-value--red">{unreadCount}</span>
            <span className="nl-stat-label">Unread</span>
          </div>
        </div>

        <div className="nl-stat-sep" />

        <div className="nl-stat-item">
          <div className="nl-stat-icon nl-stat-icon--read">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="nl-stat-body">
            <span className="nl-stat-value nl-stat-value--green">{readCount}</span>
            <span className="nl-stat-label">Read</span>
          </div>
        </div>
      </div>

      {}
      <div className="nl-card">

        {}
        <div className="nl-card__header">
          <div className="nl-card__header-left">
            <i className="bi bi-bell-fill"></i>
            <span>Activity Feed</span>
            {unreadCount > 0 && (
              <span className="nl-header-pill">{unreadCount} new</span>
            )}
          </div>
          {loading && (
            <div className="nl-inline-spinner" role="status" aria-label="Loading" />
          )}
        </div>

        {}
        {loading ? (
          <div className="nl-loading-body">
            <div className="nl-loading-spinner" role="status" aria-label="Loading" />
            <p className="nl-loading-text">Loading notifications...</p>
          </div>

        ) : notifications.length === 0 ? (
          <div className="nl-empty-state">
            <div className="nl-empty-state__icon">
              <i className="bi bi-bell-slash"></i>
            </div>
            <h5 className="nl-empty-state__title">No Notifications Yet</h5>
            <p className="nl-empty-state__desc">
              You will see offer updates and approval requests here.
            </p>
          </div>

        ) : (
          <div className="nl-feed">
            {notifications.map((n, index) => {
              const { icon, cls } = getNotifIconClass(n.type);
              return (
                <div
                  key={n.notificationId}
                  className={`nl-item ${!n.isRead ? 'nl-item--unread' : ''}`}
                  onClick={() => handleMarkRead(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleMarkRead(n)}
                  title={!n.isRead ? 'Click to mark as read' : ''}
                >
                  {}
                  {!n.isRead && <div className="nl-item__unread-bar" />}

                  {}
                  <div className={`nl-item__icon ${cls}`}>
                    <i className={`bi ${icon}`}></i>
                  </div>

                  {}
                  <div className="nl-item__body">
                    <p className="nl-item__message">{n.message}</p>
                    {n.offerNumber && (
                      <span className="nl-item__ref">
                        <i className="bi bi-file-earmark-text"></i>
                        {n.offerNumber}
                      </span>
                    )}
                    <span
                      className="nl-item__time"
                      title={formatFullDate(n.createdAt)}
                    >
                      <i className="bi bi-clock"></i>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  {}
                  <div className="nl-item__status">
                    {!n.isRead ? (
                      <span className="nl-unread-dot" title="Unread" />
                    ) : (
                      <i className="bi bi-check2 nl-read-tick" title="Read"></i>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {}
        {notifications.length > 0 && (
          <div className="nl-card__footer">
            <i className="bi bi-info-circle"></i>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
            {unreadCount > 0 && ` — ${unreadCount} unread`}
          </div>
        )}

      </div>
    </div>
  );
};

export default NotificationList;
