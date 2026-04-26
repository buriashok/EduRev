import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Clock3, TrendingUp, Users, ArrowRight, PlayCircle, Plus, GraduationCap } from 'lucide-react';
import Recommendations from '../../components/Recommendations/Recommendations';
import { analyticsApi, userApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Dashboard.module.css';

const fallbackStats = {
  totalRevenue: 15400,
  activeStudents: 1250,
  totalCourses: 45,
  completionRate: '78%',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(fallbackStats);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        if (user?.role === 'ADMIN') {
          const response = await analyticsApi.getAdmin();
          setStats(response.data);
          return;
        }

        if (user?.role === 'INSTRUCTOR') {
          const response = await analyticsApi.getInstructor();
          setStats({
            totalRevenue: response.data.courseRevenue,
            activeStudents: response.data.enrolledStudents,
            totalCourses: 1,
            completionRate: `${Math.round(response.data.averageRating * 20)}%`,
          });
          return;
        }

        if (user?.role === 'STUDENT') {
          const response = await analyticsApi.getUser();
          setStats({
            coursesEnrolled: response.data.coursesEnrolled,
            certificatesEarned: response.data.certificatesEarned,
            averageScore: `${response.data.averageScore}%`,
            activeTime: '0h' // Placeholder for future time tracking
          });
          return;
        }
      } catch (error) {
        setMessage(getErrorMessage(error, 'Showing default dashboard insights for now.'));
      }
    };

    loadAnalytics();
  }, [user?.role]);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const response = await userApi.getMyCourses();
        setEnrolledCourses(response.data);
      } catch (error) {
        console.error('Failed to load enrolled courses', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (user) fetchEnrolled();
  }, [user]);

  const cards = useMemo(() => {
    if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
      return [
        { label: 'Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
        { label: 'Learners', value: Number(stats.activeStudents).toLocaleString(), icon: Users },
        { label: 'Courses', value: Number(stats.totalCourses).toLocaleString(), icon: BookOpen },
        { label: 'Completion', value: `${stats.completionRate}`, icon: Activity },
      ];
    }
    return [
      { label: 'Enrolled', value: stats.coursesEnrolled || 0, icon: BookOpen },
      { label: 'Certificates', value: stats.certificatesEarned || 0, icon: GraduationCap },
      { label: 'Avg. Score', value: stats.averageScore || '0%', icon: TrendingUp },
      { label: 'Study Time', value: stats.activeTime || '0h', icon: Clock3 },
    ];
  }, [stats, user?.role]);

  return (
    <div className={`container ${styles.dashboardPage}`}>
      <div className="section-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div className={styles.levelBadge}>
                <span className={styles.levelLabel}>Level</span>
                <span className={styles.levelValue}>{user?.level || 1}</span>
             </div>
             <div>
                <h1>{user ? `Welcome back, ${user.firstName}` : 'Learning dashboard'}</h1>
                <div className={styles.xpWrapper}>
                   <div className={styles.xpBar}>
                      <div className={styles.xpFill} style={{ width: `${((user?.xp % 1000) / 1000) * 100}%` }} />
                   </div>
                   <span className={styles.xpText}>{user?.xp % 1000} / 1000 XP to next level</span>
                </div>
             </div>
          </div>
          {user?.role === 'INSTRUCTOR' && (
            <button 
              className="btn-primary" 
              onClick={() => navigate('/instructor/create-course')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} />
              Create New Course
            </button>
          )}
        </div>
      </div>

      {message && <div className={styles.infoBanner}>{message}</div>}

      <div className={styles.statsGrid}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`glass-panel ${styles.statCard} animate-fade-in`}>
              <div className={styles.statIcon}>
                <Icon size={22} />
              </div>
              <div className={styles.statValue}>{card.value}</div>
              <div className={styles.statLabel}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.learningSection}>
        <div className={styles.sectionHeader}>
          <h2>Continue Learning</h2>
          <span className={styles.courseCount}>{enrolledCourses.length} active tracks</span>
        </div>
        
        {loadingCourses ? (
          <div className="flex-center" style={{ padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className={styles.courseGrid}>
            {enrolledCourses.map((course) => (
              <div key={course.id} className={`glass-panel ${styles.enrolledCard} animate-fade-in`}>
                <div className={styles.courseInfo}>
                  <div className="badge">{course.difficulty}</div>
                  <h3>{course.title}</h3>
                  <div className={styles.progressRow}>
                    <div className={styles.dashboardProgressBar}>
                      <div className={styles.dashboardProgressFill} style={{ width: '0%' }} />
                    </div>
                    <span className={styles.progressPercent}>0%</span>
                  </div>
                </div>
                <button 
                  className={`btn-primary ${styles.continueBtn}`}
                  onClick={() => navigate(`/learn/${course.id}`)}
                >
                  <PlayCircle size={18} />
                  Continue
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyEnrolled}>
            <BookOpen size={48} />
            <p>You haven't enrolled in any courses yet.</p>
            <button className="btn-secondary" onClick={() => navigate('/courses')}>Browse Catalog</button>
          </div>
        )}
      </div>

      <Recommendations />
    </div>
  );
};

export default Dashboard;
