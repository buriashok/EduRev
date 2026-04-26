import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Menu, Sparkles, X, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../Notifications/NotificationPanel';
import { notificationApi } from '../../services/api';
import styles from './Navbar.module.css';

const getLinks = (role) => {
  if (!role) return [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
  ];

  if (role === 'STUDENT') return [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    { label: 'Live Classes', path: '/live-classes' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Community', path: '/forum' },
  ];

  if (role === 'INSTRUCTOR') return [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Create Course', path: '/instructor/create-course' },
    { label: 'Live Sessions', path: '/live-classes' }, // They can create here
    { label: 'User Analytics', path: '/admin/dashboard' }, // Re-using analytics
  ];

  if (role === 'ADMIN') return [
    { label: 'System Control', path: '/admin/dashboard' },
    { label: 'Courses', path: '/courses' },
    { label: 'Settings', path: '/settings' },
  ];

  return [];
};

const getDashboardPath = (role) => (role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        try {
          const res = await notificationApi.getUnreadCount();
          setUnreadCount(res.data.count);
        } catch (err) {
          console.error('Failed to fetch unread count', err);
        }
      };

      fetchUnread();
      const interval = setInterval(fetchUnread, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.container}`}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <BookOpen size={18} />
          </div>
          <div>
            <strong>EduRev</strong>
            <span>Skill-first learning</span>
          </div>
        </Link>

        <div className={styles.links}>
          {getLinks(user?.role).map((link) => (
            <Link key={link.path} to={link.path} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.mobileToggle} onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {user && (
            <div className={styles.notificationWrapper}>
              <button 
                className={`${styles.iconBtn} ${notificationsOpen ? styles.active : ''}`}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              <NotificationPanel 
                isOpen={notificationsOpen} 
                onClose={() => setNotificationsOpen(false)} 
                onUnreadUpdate={setUnreadCount}
              />
            </div>
          )}

          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.profile} onClick={() => setDropdownOpen((value) => !value)}>
                <img src={user.profileImage || `https://ui-avatars.com/api/?background=0f62fe&color=fff&name=${encodeURIComponent(user.firstName || 'U')}`} alt={user.firstName || 'User'} />
                <div className={styles.profileText}>
                  <strong>{user.firstName}</strong>
                  <span>{user.role}</span>
                </div>
                <ChevronDown size={16} className={styles.chevron} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <button onClick={() => handleNavigate(getDashboardPath(user?.role))}>Dashboard</button>
                  <button onClick={() => handleNavigate('/settings')}>Settings</button>
                  <button onClick={() => handleNavigate('/settings/sessions')}>Sessions</button>
                  <hr />
                  <button onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.signupBtn}>
                <Sparkles size={16} />
                Start Learning
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {getLinks(user?.role).map((link) => (
            <Link key={link.path} to={link.path} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className={styles.mobileAuth}>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Create Account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
