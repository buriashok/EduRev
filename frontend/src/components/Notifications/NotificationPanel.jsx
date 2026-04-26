import { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, Shield, Info, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi, getErrorMessage } from '../../services/api';
import styles from './NotificationPanel.module.css';

const NotificationPanel = ({ isOpen, onClose, onUnreadUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getAll();
      setNotifications(response.data.content);
      const unreadCount = response.data.content.filter(n => !n.read).length;
      if (onUnreadUpdate) onUnreadUpdate(unreadCount);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      // Refresh count
      const countRes = await notificationApi.getUnreadCount();
      if (onUnreadUpdate) onUnreadUpdate(countRes.data.count);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUnreadUpdate) onUnreadUpdate(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SECURITY': return <Shield size={18} className={styles.securityIcon} />;
      case 'SUCCESS': return <CheckCircle size={18} className={styles.successIcon} />;
      case 'WARNING': return <AlertTriangle size={18} className={styles.warningIcon} />;
      case 'INFO': return <Info size={18} className={styles.infoIcon} />;
      default: return <Bell size={18} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panel} ref={panelRef}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        <button className={styles.markAll} onClick={handleMarkAllAsRead}>
          <Check size={14} />
          Mark all as read
        </button>
      </div>

      <div className={styles.content}>
        {loading && notifications.length === 0 ? (
          <div className={styles.empty}>
            <div className="spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={48} className={styles.emptyIcon} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className={styles.iconBox}>
                {getTypeIcon(n.type)}
              </div>
              <div className={styles.body}>
                <div className={styles.itemHeader}>
                  <strong>{n.title}</strong>
                  <span>{formatTime(n.createdAt)}</span>
                </div>
                <p>{n.message}</p>
                {n.link && <span className={styles.actionText}>View details <ExternalLink size={12} /></span>}
              </div>
              {!n.read && <div className={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <button onClick={() => { navigate('/notifications'); onClose(); }}>View all activity</button>
      </div>
    </div>
  );
};

export default NotificationPanel;
