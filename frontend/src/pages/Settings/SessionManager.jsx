import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { getErrorMessage, userApi } from '../../services/api';
import styles from './SessionManager.module.css';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await userApi.getSessions();
        setSessions(response.data);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load active sessions.'));
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    try {
      await userApi.revokeSession(id);
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to revoke the selected session.'));
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <h1>Active sessions</h1>
        <p className={styles.subtitle}>Review where your account is active and remove anything you do not recognize.</p>
        {message && <div className={styles.message}>{message}</div>}

        {loading ? (
          <div className="flex-center" style={{ minHeight: '240px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className={styles.sessionList}>
            {sessions.map((session, index) => (
              <div key={session.id} className={`glass-card ${styles.sessionCard}`}>
                <div className={styles.info}>
                  <div className={styles.deviceIcon}>{index === 0 ? 'Current' : 'Device'}</div>
                  <div>
                    <h3>
                      {session.deviceInfo || 'Unknown device'} {index === 0 && <span className={styles.currentTag}>This Device</span>}
                    </h3>
                    <p>{session.location || 'Location unavailable'} | {session.ipAddress || 'IP unavailable'}</p>
                    <span className={styles.lastActive}>
                      Last active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Recently'}
                    </span>
                  </div>
                </div>
                {index !== 0 && (
                  <button onClick={() => handleRevoke(session.id)} className="btn-outline">Revoke access</button>
                )}
              </div>
            ))}

            {!sessions.length && !loading && (
              <div className={`glass-card ${styles.sessionCard}`}>
                <p className={styles.lastActive}>No active sessions found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SessionManager;
