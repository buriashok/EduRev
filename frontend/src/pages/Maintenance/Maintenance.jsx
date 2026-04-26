import React from 'react';
import { Settings, Hammer, Clock } from 'lucide-react';
import styles from './Maintenance.module.css';

const Maintenance = () => {
  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.card} animate-fade-in`}>
        <div className={styles.iconWrapper}>
          <Settings size={48} className={styles.gearIcon} />
          <Hammer size={32} className={styles.hammerIcon} />
        </div>
        <h1>We'll Be Back Soon</h1>
        <p>
          EduRev is currently undergoing scheduled maintenance to improve your learning experience.
          We apologize for the inconvenience.
        </p>
        <div className={styles.etaBox}>
          <Clock size={18} />
          <span>Estimated time: ~30 minutes</span>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => window.location.reload()}
        >
          Check Status
        </button>
      </div>
    </div>
  );
};

export default Maintenance;
