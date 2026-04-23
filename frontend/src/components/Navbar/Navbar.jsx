import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Globe, User, LogOut, Settings as SettingsIcon, 
  ChevronDown, Book, Award, Video, Shield, HelpCircle, Sun, Moon 
} from 'lucide-react';
import { userApi } from '../../services/api';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchProfile = async () => {
        try {
          const response = await userApi.getMe();
          setProfile(response.data);
        } catch (err) {
          console.error('Failed to fetch navbar profile:', err);
        }
      };
      fetchProfile();
    }
  }, [isLoggedIn]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    navigate('/login');
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${profile?.firstName || 'User'}+${profile?.lastName || ''}&background=0d1117&color=c9d1d9`;

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <BookOpen className={styles.logoIcon} size={28} />
          EduRev
        </Link>
        
        <div className={styles.navLinks}>
          <Link to="/courses" className={styles.navLink}>Courses</Link>
          <Link to="/live-classes" className={styles.navLink}>Live</Link>
          <Link to="/forum" className={styles.navLink}>Community</Link>
          <Link to="/edu-revolution" className={styles.navLink}>EDU-Rev</Link>
        </div>

        <div className={styles.navActions}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className={styles.langBtn}>
            <Globe size={18} /> EN
          </button>
          
          {isLoggedIn ? (
            <div className={styles.profileWrapper}>
              <div className={styles.profileTrigger}>
                <img 
                  src={profile?.profileImage || defaultAvatar} 
                  alt="Avatar" 
                  className={styles.navbarAvatar}
                />
                <ChevronDown size={14} className={styles.chevron} />
              </div>
              
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownHeader}>
                   <img src={profile?.profileImage || defaultAvatar} alt="" className={styles.headerAvatar} />
                   <div className={styles.headerInfo}>
                      <span className={styles.userName}>{profile?.firstName} {profile?.lastName}</span>
                      <span className={styles.userEmail}>{profile?.email}</span>
                   </div>
                </div>

                <div className={styles.divider} />

                <Link to="/profile" className={styles.dropdownItem}>
                  <User size={16} /> Your profile
                </Link>
                <Link to="/courses" className={styles.dropdownItem}>
                  <Book size={16} /> Your courses
                </Link>
                <Link to="/edu-revolution" className={styles.dropdownItem}>
                  <Award size={16} /> Your certificates
                </Link>
                <Link to="/live-classes" className={styles.dropdownItem}>
                  <Video size={16} /> Live sessions
                </Link>

                <div className={styles.divider} />

                <Link to="/profile" className={styles.dropdownItem}>
                  <SettingsIcon size={16} /> Settings
                </Link>
                <Link to="#" className={styles.dropdownItem}>
                  <Shield size={16} /> Security
                </Link>

                <div className={styles.divider} />

                <button onClick={handleLogout} className={styles.logoutItem}>
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
