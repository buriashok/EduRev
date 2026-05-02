import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BookOpen, Clock3, TrendingUp, Users, ArrowRight, PlayCircle, Plus, GraduationCap } from 'lucide-react';
import Recommendations from '../../../components/Recommendations/Recommendations';
import { analyticsApi, userApi, instructorApi, getErrorMessage } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Dashboard.module.css';

const fallbackStats = {
  totalRevenue: 15400,
  activeStudents: 1250,
  totalCourses: 45,
  completionRate: '78%',
};

import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [instructorAnalytics, setInstructorAnalytics] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return;
        
        let analyticsRes;
        if (user.role === 'ADMIN') {
          analyticsRes = await analyticsApi.getAdmin();
        } else if (user.role === 'INSTRUCTOR') {
          analyticsRes = await analyticsApi.getInstructor();
          const detailedRes = await instructorApi.getAnalytics();
          setInstructorAnalytics(detailedRes.data);
        } else {
          analyticsRes = await analyticsApi.getUser();
        }
        setStats(analyticsRes.data);

        const coursesRes = await userApi.getMyCourses();
        setEnrolledCourses(coursesRes.data);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Dashboard data is temporarily unavailable.'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.role]);

  if (loading) return <div className="flex-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;

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
                <h1>Welcome back, {user?.firstName}</h1>
                <div className={styles.xpWrapper}>
                   <div className={styles.xpBar}>
                      <div className={styles.xpFill} style={{ width: `${((user?.xp % 1000) / 1000) * 100}%` }} />
                   </div>
                   <span className={styles.xpText}>{user?.xp % 1000} / 1000 XP to next level</span>
                </div>
             </div>
          </div>
          <div className={styles.roleTag}>
             <GraduationCap size={16} />
             <span>{user?.role} ACCOUNT</span>
          </div>
        </div>
      </div>

      {message && <div className={styles.infoBanner}>{message}</div>}

      {user?.role === 'STUDENT' && (
        <StudentDashboard 
          user={user} 
          stats={{
            coursesEnrolled: stats.coursesEnrolled,
            certificatesEarned: stats.certificatesEarned,
            averageScore: `${stats.averageScore || 0}%`,
            activeTime: stats.activeTime || '0h'
          }} 
          enrolledCourses={enrolledCourses} 
          loadingCourses={loading} 
        />
      )}

      {(user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && (
        <InstructorDashboard 
          user={user} 
          stats={{
            totalRevenue: user.role === 'ADMIN' ? stats.totalRevenue : stats.courseRevenue,
            activeStudents: user.role === 'ADMIN' ? stats.activeStudents : stats.enrolledStudents,
            totalCourses: user.role === 'ADMIN' ? stats.totalCourses : stats.courseCount,
            completionRate: stats.completionRate || '4.5'
          }} 
          detailedAnalytics={instructorAnalytics}
          myCourses={enrolledCourses} 
          loadingCourses={loading} 
        />
      )}
    </div>
  );
};

export default Dashboard;
