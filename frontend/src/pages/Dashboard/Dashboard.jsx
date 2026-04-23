import React from 'react';
import { TrendingUp, Users, BookOpen, DollarSign, Activity } from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={`container ${styles.dashboardPage}`}>
      <h1 className={styles.title}>Admin Analytics Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard} animate-fade-in`}>
          <DollarSign size={32} className="text-primary" style={{color: 'var(--color-primary)'}} />
          <div className={styles.statValue}>$15,400</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        
        <div className={`glass-panel ${styles.statCard} animate-fade-in`}>
          <Users size={32} className="text-secondary" style={{color: 'var(--color-secondary)'}} />
          <div className={styles.statValue}>1,250</div>
          <div className={styles.statLabel}>Active Students</div>
        </div>

        <div className={`glass-panel ${styles.statCard} animate-fade-in`}>
          <BookOpen size={32} className="text-accent" style={{color: 'var(--color-accent)'}} />
          <div className={styles.statValue}>45</div>
          <div className={styles.statLabel}>Total Courses</div>
        </div>

        <div className={`glass-panel ${styles.statCard} animate-fade-in`}>
          <TrendingUp size={32} style={{color: '#10b981'}} />
          <div className={styles.statValue}>78%</div>
          <div className={styles.statLabel}>Completion Rate</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
          <Activity size={24} style={{color: 'var(--color-primary)'}} />
          <h2 style={{fontSize: '1.75rem'}}>Engagement Overview</h2>
        </div>
        <div className={styles.chartPlaceholder}>
          Interactive Charts (Recharts/Chart.js) integration coming soon...
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
