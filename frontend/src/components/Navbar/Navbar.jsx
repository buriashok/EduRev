import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Menu, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'Live Classes', path: '/live-classes' },
  { label: 'Community', path: '/forum' },
];

const getDashboardPath = (role) => (role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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
          {publicLinks.map((link) => (
            <Link key={link.path} to={link.path} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.mobileToggle} onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

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
          {publicLinks.map((link) => (
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
