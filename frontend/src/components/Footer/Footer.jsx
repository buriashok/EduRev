import { BookOpen, Globe, Mail, Sparkles } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.content}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <BookOpen size={20} />
          </div>
          <h3>EduRev</h3>
          <p>Modern learning journeys for students, instructors, and teams built on career-ready skills.</p>
        </div>

        <div className={styles.links}>
          <h4 style={{ marginBottom: '0.5rem' }}>Platform</h4>
          <a href="/courses">Explore Courses</a>
          <a href="/live-classes">Live Classes</a>
          <a href="/forum">Community</a>
          <a href="/settings">Account Settings</a>
        </div>

        <div className={styles.meta}>
          <h4 style={{ marginBottom: '0.5rem' }}>Connect</h4>
          <span><Mail size={16} /> support@edurev.local</span>
          <span><Globe size={16} /> Global Learning System</span>
          <span><Sparkles size={16} /> Skill-first Momentum</span>
        </div>

        <p className={styles.copy}>© {currentYear} EduRev. All rights reserved. Designed for professional learners.</p>
      </div>
    </footer>
  );
};

export default Footer;
