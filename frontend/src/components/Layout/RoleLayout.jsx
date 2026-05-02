import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Bot } from 'lucide-react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AiMentor from '../AiMentor/AiMentor';
import NotificationPanel from '../Notifications/NotificationPanel';
import { notificationApi } from '../../services/api';
import styles from './RoleLayout.module.css';

const RoleLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && location.pathname === '/') {
      if (user.role === 'INSTRUCTOR') navigate('/dashboard');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        setUnreadCount(response.data.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();
  }, [user]);

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner" /></div>;

  // Public paths where we want the landing page experience
  const publicPaths = ['/', '/login', '/register', '/courses', '/reset-password', '/verify-email', '/maintenance'];
  const isPublic = publicPaths.includes(location.pathname);

  // If not logged in, or on a public page, show the standard Navbar + Footer layout
  if (!user || isPublic) {
    return (
      <div className={styles.publicLayout}>
        <Navbar />
        <main className={styles.mainContent}>{children}</main>
        {location.pathname === '/' && <Footer />}
        <AiMentor />
      </div>
    );
  }

  // Role-based Layout (with Sidebar)
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.dashboardContent}>
        <header className={styles.topBar}>
          <div className={styles.search}>
            <Bot size={18} />
            <span>EduBot is ready with {user.role.toLowerCase()} support</span>
          </div>
          <div className={styles.actions}>
            <span className={styles.roleBadge}>{user.role}</span>
            <div className={styles.notificationHost}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Open notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onUnreadUpdate={setUnreadCount}
              />
            </div>
          </div>
        </header>
        <main className={styles.innerContent}>
          {children}
        </main>
        <AiMentor />
      </div>
    </div>
  );
};

export default RoleLayout;
