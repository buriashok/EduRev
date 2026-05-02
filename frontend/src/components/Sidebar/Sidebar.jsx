import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Trophy, 
  MessageSquare, 
  Video, 
  Settings, 
  ShieldAlert,
  BarChart3,
  PlusCircle,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinks = (role) => {
    switch (role) {
      case 'STUDENT':
        return [
          { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
          { label: 'My Courses', icon: <BookOpen size={20} />, path: '/courses' },
          { label: 'Live Classes', icon: <Video size={20} />, path: '/live-classes' },
          { label: 'Leaderboard', icon: <Trophy size={20} />, path: '/leaderboard' },
          { label: 'Community', icon: <MessageSquare size={20} />, path: '/forum' },
        ];
      case 'INSTRUCTOR':
        return [
          { label: 'Management', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
          { label: 'Create Course', icon: <PlusCircle size={20} />, path: '/instructor/create-course' },
          { label: 'Live Sessions', icon: <Video size={20} />, path: '/instructor/live-sessions' },
          { label: 'Student Roster', icon: <Users size={20} />, path: '/instructor/students' },
          { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
        ];
      case 'ADMIN':
        return [
          { label: 'System Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
          { label: 'User Management', icon: <Users size={20} />, path: '/admin/users' },
          { label: 'Course Catalog', icon: <BookOpen size={20} />, path: '/courses' },
          { label: 'Platform Settings', icon: <Settings size={20} />, path: '/settings' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(user?.role);

  if (!user || links.length === 0) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <BookOpen size={18} />
          </div>
          <strong>EduRev</strong>
        </Link>
      </div>

      <nav className={styles.nav}>
        <span className={styles.sectionLabel}>Main Menu</span>
        {links.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link to="/settings" className={styles.settingsLink}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <div className={styles.userCard}>
          <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}`} alt="User" />
          <div className={styles.userInfo}>
            <strong>{user.firstName}</strong>
            <span>{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
