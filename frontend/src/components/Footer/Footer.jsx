import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <p>© {currentYear} EduRev. All rights reserved.</p>
          <p className={styles.copyright}>Copyright by Buri Ashok Kumar</p>
          <div className={styles.links}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
