import { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink, Shield, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, notificationApi } from '../../../services/api';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getAll();
      setNotifications(response.data.content || []);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update notifications.'));
    }
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      await notificationApi.markAsRead(notification.id);
      setNotifications((items) => items.map((item) => (
        item.id === notification.id ? { ...item, read: true } : item
      )));
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const iconFor = (type) => {
    switch (type) {
      case 'SECURITY':
        return <Shield size={20} />;
      case 'SUCCESS':
        return <CheckCircle size={20} />;
      case 'WARNING':
        return <AlertTriangle size={20} />;
      case 'INFO':
        return <Info size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Notifications</h1>
          <p>Security alerts, course updates, reminders, and platform activity.</p>
        </div>
        <button className="btn-secondary" onClick={markAllAsRead}>
          <Check size={18} />
          Mark all read
        </button>
      </header>

      {message && <div className={styles.message}>{message}</div>}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <Bell size={42} />
          <h2>No notifications yet</h2>
          <p>Your activity feed will appear here as courses, sessions, and account events happen.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`${styles.item} ${notification.read ? '' : styles.unread}`}
              onClick={() => openNotification(notification)}
            >
              <span className={styles.icon}>{iconFor(notification.type)}</span>
              <span className={styles.body}>
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
              </span>
              <span className={styles.meta}>
                {new Date(notification.createdAt).toLocaleString()}
                {notification.link && <ExternalLink size={14} />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
