import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './api';
import './notifications-bell.css';

function NotificationsBell({ onNavigate, userRole }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      // Backend may return an object; accept either array or {notifications: []}
      const list = Array.isArray(data) ? data : (Array.isArray(data?.notifications) ? data.notifications : []);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await loadNotifications();
    } catch (error) {
      // Silently ignore 403/404 errors (notification doesn't belong to user or not found)
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        console.log(`[Notifications] Notification ${id} not found or inaccessible, refreshing list`);
        await loadNotifications();
      } else {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
    setLoading(false);
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read first
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate based on notification type
    switch (notif.type) {
      case 'appointment':
      case 'appointment_reminder':
      case 'appointment_change':
      case 'appointment_accepted':
      case 'appointment_rejected':
        onNavigate('appointments');
        break;
      case 'message':
        // Navigate to messages - the related_id is the message_id
        onNavigate('messages', { messageId: notif.related_id });
        break;
      case 'recommendation':
        // Navigate to home/dashboard to see recommendations
        onNavigate('home');
        break;
      case 'meal_plan':
        // Navigate to meal plan view
        onNavigate('meal-plan');
        break;
      default:
        // Default to home for unknown types
        onNavigate('home');
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'appointment_reminder': return '⏰';
      case 'appointment_change': return '📝';
      case 'appointment_accepted': return '✅';
      case 'appointment_rejected': return '❌';
      case 'message': return '💬';
      case 'recommendation': return '📋';
      case 'meal_plan': return '🍽️';
      default: return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notifications-bell">
      <button 
        className="bell-button" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="bell-backdrop" onClick={() => setIsOpen(false)} />
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead} 
                  disabled={loading}
                  className="mark-all-btn"
                >
                  {loading ? 'Marcando...' : 'Marcar todas'}
                </button>
              )}
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="notif-icon">{getNotificationIcon(notif.type)}</div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-time">{formatTime(notif.created_at)}</span>
                    </div>
                    {!notif.is_read && <div className="unread-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationsBell;
