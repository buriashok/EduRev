import { Activity, BookOpen, Clock3, TrendingUp, GraduationCap, PlayCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Recommendations from '../../components/Recommendations/Recommendations';
import styles from './Dashboard.module.css';

const StudentDashboard = ({ user, stats, enrolledCourses, loadingCourses }) => {
  const navigate = useNavigate();

  const studentCards = [
    { label: 'Enrolled', value: stats.coursesEnrolled || 0, icon: BookOpen },
    { label: 'Certificates', value: stats.certificatesEarned || 0, icon: GraduationCap },
    { label: 'Avg. Score', value: stats.averageScore || '0%', icon: Star },
    { label: 'Study Time', value: stats.activeTime || '0h', icon: Clock3 },
  ];

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.statsGrid}>
        {studentCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`glass-panel ${styles.statCard} animate-fade-in`}>
              <div className={styles.statIcon}><Icon size={22} /></div>
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
          <div className="flex-center" style={{ padding: '2rem' }}><div className="spinner" /></div>
        ) : enrolledCourses.length > 0 ? (
          <div className={styles.courseGrid}>
            {enrolledCourses.map((course) => (
              <div key={course.id} className={`glass-panel ${styles.enrolledCard} animate-fade-in`}>
                <div className={styles.courseInfo}>
                  <div className="badge">{course.difficulty}</div>
                  <h3>{course.title}</h3>
                  <p>{course.description?.substring(0, 80)}...</p>
                </div>
                <button className={`btn-primary ${styles.continueBtn}`} onClick={() => navigate(`/learn/${course.id}`)}>
                  <PlayCircle size={18} />
                  Resume Session
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyEnrolled}>
            <BookOpen size={48} />
            <p>Ready to start your journey? Enroll in a course to see it here.</p>
            <button className="btn-secondary" onClick={() => navigate('/courses')}>Browse Catalog</button>
          </div>
        )}
      </div>

      <Recommendations />
    </div>
  );
};

export default StudentDashboard;
