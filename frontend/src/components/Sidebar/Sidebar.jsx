import { BookCopy, LayoutDashboard, Settings, Shield, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const linkMap = {
  STUDENT: [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookCopy },
    { label: 'Profile', path: '/profile', icon: Trophy },
    { label: 'Sessions', path: '/settings/sessions', icon: Shield },
  ],
  INSTRUCTOR: [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookCopy },
    { label: 'Profile', path: '/profile', icon: Trophy },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  ADMIN: [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookCopy },
    { label: 'Profile', path: '/profile', icon: Trophy },
    { label: 'Security', path: '/settings/sessions', icon: Shield },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userLinks = linkMap[user?.role] || linkMap.STUDENT;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <span className={styles.roleTag}>{user?.role || 'LEARNER'}</span>
      </div>
      <nav className={styles.nav}>
        {userLinks.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.path;

          return (
            <Link key={link.path} to={link.path} className={`${styles.link} ${active ? styles.active : ''}`}>
              <span className={styles.icon}>
                <Icon size={18} />
              </span>
              <span className={styles.label}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
