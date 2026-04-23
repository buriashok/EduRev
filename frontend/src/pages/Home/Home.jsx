import { Link } from 'react-router-dom';
import { Sparkles, Video, BrainCircuit, GraduationCap } from 'lucide-react';
import Recommendations from '../../components/Recommendations/Recommendations';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div>
      <section className={styles.heroSection}>
        <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(31, 111, 235, 0.15)', padding: '0.5rem 1rem', borderRadius: '999px', color: 'var(--color-accent)', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: '500' }}>
            <Sparkles size={16} /> Welcome to the EDU-Revolution
          </div>
          <h1 className={styles.title}>Unlock Your Potential with AI-Powered Learning</h1>
          <p className={styles.subtitle}>
            Experience personalized learning paths, interactive live classes, and intelligent assessments tailored just for you.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/courses" className="btn-primary">Explore Courses</Link>
            <Link to="/live-classes" className="btn-secondary">Join Live Class</Link>
          </div>
        </div>
      </section>

      <section className={`container ${styles.featuresSection}`}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Platform Features</h2>
        <div className={styles.featuresGrid}>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}><BrainCircuit size={32} /></div>
            <h3 className={styles.featureTitle}>AI-Driven Paths</h3>
            <p className={styles.featureDesc}>Get personalized course recommendations based on your goals and past performance.</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}><Video size={32} /></div>
            <h3 className={styles.featureTitle}>Interactive Live Classes</h3>
            <p className={styles.featureDesc}>Join real-time lectures with seamless video conferencing and attendance tracking.</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}><GraduationCap size={32} /></div>
            <h3 className={styles.featureTitle}>Smart Grading</h3>
            <p className={styles.featureDesc}>Receive instant feedback on assignments and quizzes powered by predictive analytics.</p>
          </div>
        </div>

        <Recommendations />
      </section>
    </div>
  );
};

export default Home;
