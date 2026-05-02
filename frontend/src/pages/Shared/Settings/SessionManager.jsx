import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, Globe, Shield, Trash2, RefreshCcw } from 'lucide-react';
import { getErrorMessage, userApi } from '../../../services/api';
import styles from './SessionManager.module.css';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await userApi.getSessions();
      setSessions(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to load active sessions.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    try {
      await userApi.revokeSession(id);
      setSessions((current) => current.filter((session) => session.id !== id));
      setMessage({ type: 'success', text: 'Session revoked successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to revoke the selected session.') });
    }
  };

  const getDeviceIcon = (deviceInfo = '') => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('phone') || info.includes('mobile') || info.includes('android') || info.includes('iphone')) return <Smartphone size={24} />;
    if (info.includes('tablet') || info.includes('ipad')) return <Tablet size={24} />;
    return <Monitor size={24} />;
  };

  return (
    <div className={styles.manager}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Shield className={styles.titleIcon} size={32} />
          <div>
            <h1>Security Sessions</h1>
            <p>Manage your active logins and connected devices.</p>
          </div>
        </div>
        <button onClick={fetchSessions} className="btn-secondary" disabled={loading}>
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {message.text && (
        <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className={styles.sessionGrid}>
          {sessions.map((session, index) => (
            <div key={session.id} className={`glass-panel ${styles.sessionCard} ${index === 0 ? styles.current : ''} animate-up`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.cardMain}>
                <div className={styles.iconWrapper}>
                  {getDeviceIcon(session.deviceInfo)}
                </div>
                <div className={styles.details}>
                  <div className={styles.deviceInfo}>
                    <h3>{session.deviceInfo || 'Web Browser'}</h3>
                    {index === 0 && <span className={styles.currentBadge}>This Device</span>}
                  </div>
                  <div className={styles.locationInfo}>
                    <Globe size={14} />
                    <span>{session.location || 'Unknown Location'}</span>
                    <span className={styles.dot}>•</span>
                    <span>{session.ipAddress || '0.0.0.0'}</span>
                  </div>
                  <div className={styles.timeInfo}>
                    Started: {session.lastActive ? new Date(session.lastActive).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardActions}>
                {index !== 0 ? (
                  <button onClick={() => handleRevoke(session.id)} className={styles.revokeBtn} title="Revoke access">
                    <Trash2 size={18} />
                    <span>Revoke Access</span>
                  </button>
                ) : (
                  <span className={styles.activeLabel}>Active Now</span>
                )}
              </div>
            </div>
          ))}

          {!sessions.length && (
            <div className={`glass-panel ${styles.emptyState}`}>
              <Shield size={48} opacity={0.2} />
              <p>No active sessions found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;
