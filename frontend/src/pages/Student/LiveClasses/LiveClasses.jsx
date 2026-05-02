import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, UserRound, Video, Plus, X, PlayCircle, CheckCircle2 } from 'lucide-react';
import { getErrorMessage, liveClassApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './LiveClasses.module.css';

const LiveClasses = () => {
  const { user } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', description: '', startTime: '', meetingLink: '', maxCapacity: 20 });
  const [message, setMessage] = useState('');
  const [referenceNow] = useState(() => Date.now());

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const response = await liveClassApi.getUpcoming();
      setLiveClasses(response.data);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to load live classes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await liveClassApi.create(newClass);
      setMessage('Session scheduled successfully!');
      setShowForm(false);
      setNewClass({ title: '', description: '', startTime: '', meetingLink: '', maxCapacity: 20 });
      fetchLiveClasses();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to schedule session.'));
    }
  };

  const upcomingThreshold = useMemo(() => new Date(referenceNow + 24 * 60 * 60 * 1000), [referenceNow]);

  const handleJoin = async (id) => {
    try {
      const response = await liveClassApi.join(id);
      if (response.data?.meetingLink) {
        window.open(response.data.meetingLink, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not open the live class link.'));
    }
  };

  const handleRegister = async (id) => {
    if (!user) {
      setMessage('Please sign in to register for live classes.');
      return;
    }
    try {
      await liveClassApi.register(id);
      setLiveClasses(curr => curr.map(item => {
        if (item.id === id) {
          return { ...item, registeredUsers: [...(item.registeredUsers || []), user] };
        }
        return item;
      }));
      setMessage('Registered successfully! You will receive a reminder before the class starts.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to register for the class.'));
    }
  };

  return (
    <div className={`container ${styles.livePage}`}>
      <div className={styles.header}>
        <div className="section-heading">
          <h1>Live classes that keep learning human</h1>
          <p>Join workshops, mentor hours, and focused sessions with clear timing and one-click access.</p>
        </div>
        {user?.role === 'INSTRUCTOR' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Schedule Session
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleCreateSession} className={`glass-panel ${styles.creationForm} animate-scale-in`}>
            <div className={styles.formHeader}>
              <h2>Schedule Live Session</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Session Title</label>
                <input 
                  type="text" 
                  value={newClass.title} 
                  onChange={e => setNewClass({...newClass, title: e.target.value})} 
                  placeholder="e.g. Advanced System Design Q&A"
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Start Time</label>
                <input 
                  type="datetime-local" 
                  value={newClass.startTime} 
                  onChange={e => setNewClass({...newClass, startTime: e.target.value})} 
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Meeting Link (Zoom/Google Meet)</label>
                <input 
                  type="url" 
                  value={newClass.meetingLink} 
                  onChange={e => setNewClass({...newClass, meetingLink: e.target.value})} 
                  placeholder="https://meet.google.com/..."
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Capacity</label>
                <input 
                  type="number" 
                  value={newClass.maxCapacity} 
                  onChange={e => setNewClass({...newClass, maxCapacity: e.target.value})} 
                  min="1"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea 
                value={newClass.description} 
                onChange={e => setNewClass({...newClass, description: e.target.value})} 
                rows="3"
                placeholder="What will students learn in this session?"
              />
            </div>

            <button type="submit" className="btn-primary">Confirm & Publish</button>
          </form>
        </div>
      )}

      {message && <div className={styles.message}>{message}</div>}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '280px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className={styles.grid}>
          {liveClasses.length === 0 ? (
            <div className={`glass-panel ${styles.emptyState}`}>
              <Video size={40} />
              <h3>No live classes scheduled yet</h3>
              <p>New mentor sessions will appear here as soon as they are published.</p>
            </div>
          ) : (
            liveClasses.map((item) => {
              const startsSoon = new Date(item.startTime) <= upcomingThreshold;
              const isRegistered = item.registeredUsers?.some(u => u.id === user?.id);
              const isInstructor = user?.id === item.instructor?.id;

              return (
                <article key={item.id} className={`glass-panel ${styles.classCard} animate-fade-in`}>
                  <div className={styles.cardHeader}>
                    <span className={`status-pill ${item.completed ? 'secondary' : (startsSoon ? 'success' : 'warning')}`}>
                      <CalendarDays size={14} />
                      {item.completed ? 'Finished' : (startsSoon ? 'Starting soon' : 'Upcoming')}
                    </span>
                    {isRegistered && <span className={styles.registeredBadge}><CheckCircle2 size={12} /> Registered</span>}
                  </div>

                  <h2 className={styles.classTitle}>{item.title}</h2>
                  <p className={styles.description}>{item.description || 'Instructor-led session with time for guided questions and discussion.'}</p>

                  <div className={styles.meta}>
                    <div className={styles.metaItem}><UserRound size={16} /> {item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Guest mentor'}</div>
                    <div className={styles.metaItem}><Clock3 size={16} /> {new Date(item.startTime).toLocaleString()}</div>
                  </div>

                  <div className={styles.actions}>
                    {item.completed ? (
                      item.recordingUrl ? (
                        <button className="btn-secondary" onClick={() => window.open(item.recordingUrl, '_blank')}>
                          <PlayCircle size={16} />
                          Watch Recording
                        </button>
                      ) : (
                        <button className="btn-secondary" disabled>Recording coming soon</button>
                      )
                    ) : (
                      <>
                        {!isRegistered && !isInstructor && (
                          <button className="btn-primary" onClick={() => handleRegister(item.id)}>
                            Register Now
                          </button>
                        )}
                        {(isRegistered || isInstructor) && (
                          <button className="btn-primary" onClick={() => handleJoin(item.id)}>
                            Join Room
                            <ArrowRight size={16} />
                          </button>
                        )}
                        {isInstructor && (
                          <button className="btn-secondary" onClick={() => window.location.href = `/instructor/live-classes/${item.id}`}>
                            Manage
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
