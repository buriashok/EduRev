import { useState, useEffect } from 'react';
import { Video, Calendar, Users, Clock, Plus, ExternalLink, Trash2, CheckCircle } from 'lucide-react';
import { liveClassApi, getErrorMessage } from '../../services/api';
import styles from './Instructor.module.css';

const MyLiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    startTime: '',
    meetingLink: '',
    maxCapacity: 50
  });

  const fetchSessions = async () => {
    try {
      // Assuming we have an endpoint for instructor-specific sessions
      const res = await liveClassApi.getUpcoming(); // For now, filtering locally or assuming it returns all
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await liveClassApi.create(newSession);
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to create session'));
    }
  };

  return (
    <div className={styles.livePage}>
      <header className={styles.header}>
        <div>
          <h1>My Live Sessions</h1>
          <p>Schedule and manage your interactive workshops.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Schedule Session
        </button>
      </header>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className={styles.sessionGrid}>
          {sessions.map(session => (
            <div key={session.id} className={`glass-panel ${styles.sessionCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.videoIcon}><Video size={20} /></div>
                <span className={`badge ${session.isCompleted ? '' : styles.liveBadge}`}>
                  {session.isCompleted ? 'Completed' : 'Upcoming'}
                </span>
              </div>
              
              <h3>{session.title}</h3>
              <p>{session.description}</p>

              <div className={styles.sessionMeta}>
                <div className={styles.metaItem}>
                  <Calendar size={14} />
                  <span>{new Date(session.startTime).toLocaleDateString()}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock size={14} />
                  <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.metaItem}>
                  <Users size={14} />
                  <span>{session.currentRegistrations || 0} / {session.maxCapacity}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                {!session.isCompleted && (
                  <button className="btn-primary" style={{ width: '100%' }}>
                    Start Session <ExternalLink size={16} />
                  </button>
                )}
                {session.isCompleted && (
                  <div className={styles.completedInfo}>
                    <CheckCircle size={16} /> Recorded
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modal}`}>
            <h2>Schedule New Live Session</h2>
            <form onSubmit={handleCreate}>
              <div className={styles.inputGroup}>
                <label>Title</label>
                <input 
                  type="text" 
                  required 
                  value={newSession.title}
                  onChange={e => setNewSession({...newSession, title: e.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea 
                  required 
                  value={newSession.description}
                  onChange={e => setNewSession({...newSession, description: e.target.value})}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={newSession.startTime}
                    onChange={e => setNewSession({...newSession, startTime: e.target.value})}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Meeting Link</label>
                  <input
                    type="url"
                    required
                    value={newSession.meetingLink}
                    onChange={e => setNewSession({...newSession, meetingLink: e.target.value})}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Capacity</label>
                  <input 
                    type="number" 
                    required 
                    value={newSession.maxCapacity}
                    onChange={e => setNewSession({...newSession, maxCapacity: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.modalBtns}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLiveSessions;
