import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, UserRound, Video, PlayCircle, CheckCircle2 } from 'lucide-react';
import { getErrorMessage, liveClassApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './LiveClasses.module.css';

const LiveClasses = () => {
  const { user } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [referenceNow] = useState(() => Date.now());

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await liveClassApi.getUpcoming();
        setLiveClasses(response.data);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load live classes.'));
      } finally {
        setLoading(false);
      }
    };

    fetchLiveClasses();
  }, []);

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
      <div className="section-heading">
        <h1>Live classes that keep learning human</h1>
        <p>Join workshops, mentor hours, and focused sessions with clear timing and one-click access.</p>
      </div>

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
