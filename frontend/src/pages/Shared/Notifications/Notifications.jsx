import { useEffect, useState } from 'react';
import { Bell, Check, ExternalLink, Shield, Info, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, notificationApi } from '../../../services/api';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const navigate = useNavigate();

  const filterParams = {
    all: {},
    unread: { unreadOnly: true },
    security: { type: 'SECURITY' },
    warning: { type: 'WARNING' },
  };

  const fetchNotifications = async (page = 0, filter = activeFilter) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await notificationApi.getAll(page, filterParams[filter] || {});
      setNotifications(response.data.content || []);
      setPageInfo({
        number: response.data.number || 0,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      });
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    fetchNotifications(0, filter);
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update notifications.'));
    }
  };

  const deleteNotification = async (event, notification) => {
    event.stopPropagation();
    try {
      await notificationApi.delete(notification.id);
      setNotifications((items) => items.filter((item) => item.id !== notification.id));
      setPageInfo((current) => ({
        ...current,
        totalElements: Math.max(0, current.totalElements - 1),
      }));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete notification.'));
    }
  };

  const clearRead = async () => {
    try {
      const response = await notificationApi.deleteRead();
      setMessage(`${response.data.deletedCount || 0} read notifications cleared.`);
      await fetchNotifications(0, activeFilter);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to clear read notifications.'));
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
        <div className={styles.headerActions}>
          <button className="btn-secondary" onClick={clearRead}>
            <Trash2 size={18} />
            Clear read
          </button>
          <button className="btn-secondary" onClick={markAllAsRead}>
            <Check size={18} />
            Mark all read
          </button>
        </div>
      </header>

      <div className={styles.filterBar}>
        {[
          ['all', 'All'],
          ['unread', 'Unread'],
          ['security', 'Security'],
          ['warning', 'Warnings'],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={activeFilter === value ? styles.activeFilter : ''}
            onClick={() => changeFilter(value)}
          >
            {label}
          </button>
        ))}
        <span>{pageInfo.totalElements} total</span>
      </div>

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
            <div
              role="button"
              tabIndex={0}
              key={notification.id}
              className={`${styles.item} ${notification.read ? '' : styles.unread}`}
              onClick={() => openNotification(notification)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openNotification(notification);
              }}
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
              <span
                role="button"
                tabIndex={0}
                className={styles.deleteAction}
                onClick={(event) => deleteNotification(event, notification)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') deleteNotification(event, notification);
                }}
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 size={16} />
              </span>
            </div>
          ))}
        </div>
      )}

      {pageInfo.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className="btn-secondary"
            disabled={pageInfo.number === 0}
            onClick={() => fetchNotifications(pageInfo.number - 1)}
          >
            Previous
          </button>
          <span>Page {pageInfo.number + 1} of {pageInfo.totalPages}</span>
          <button
            type="button"
            className="btn-secondary"
            disabled={pageInfo.number >= pageInfo.totalPages - 1}
            onClick={() => fetchNotifications(pageInfo.number + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
