import React, { useState, useEffect } from 'react';
import { Video, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { liveClassApi } from '../../services/api';
import styles from './LiveClasses.module.css';

const LiveClasses = () => {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await liveClassApi.getUpcoming();
        setLiveClasses(response.data);
      } catch (error) {
        console.error('Failed to fetch live classes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClasses();
  }, []);
  return (
    <div className={`container ${styles.livePage}`}>
      <h1 className={styles.title}>Live Lectures & Webinars</h1>
      
      {loading ? (
        <div className="flex-center" style={{height: '300px'}}><div className="spinner"></div></div>
      ) : (
        <div className={styles.grid}>
          {liveClasses.length === 0 ? (
            <p style={{color: 'var(--color-text-muted)', textAlign: 'center', gridColumn: 'span 3'}}>No live classes scheduled at the moment.</p>
          ) : (
            liveClasses.map(item => (
              <div key={item.id} className={`glass-panel ${styles.classCard} animate-fade-in`}>
                <div className={`${styles.status} ${new Date(item.startTime) < new Date() ? styles.live : styles.upcoming}`}>
                  {new Date(item.startTime) < new Date() && <div className={styles.liveDot}></div>}
                  {new Date(item.startTime) < new Date() ? 'LIVE' : 'UPCOMING'}
                </div>
                
                <h2 className={styles.classTitle}>{item.title}</h2>
                
                <div className={styles.meta}>
                  <div className={styles.metaItem}><User size={16} /> {item.instructor ? `${item.instructor.firstName} ${item.instructor.lastName}` : 'Guest Speaker'}</div>
                  <div className={styles.metaItem}><Clock size={16} /> {new Date(item.startTime).toLocaleString()}</div>
                </div>

                <button className="btn-primary" style={{marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
                  {new Date(item.startTime) < new Date() ? 'Join Now' : 'Set Reminder'} <ArrowRight size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
