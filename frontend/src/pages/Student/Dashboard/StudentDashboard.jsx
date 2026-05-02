import { 
  Activity, 
  BookOpen, 
  Clock3, 
  GraduationCap, 
  PlayCircle, 
  Star, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Recommendations from '../../../components/Recommendations/Recommendations';
import styles from './Dashboard.module.css';

const StudentDashboard = ({ user, stats, enrolledCourses, loadingCourses }) => {
  const navigate = useNavigate();

  const studentCards = [
    { label: 'Active Courses', value: stats.coursesEnrolled || 0, icon: BookOpen, color: '#4f46e5' },
    { label: 'Certificates', value: stats.certificatesEarned || 0, icon: GraduationCap, color: '#10b981' },
    { label: 'Average Score', value: stats.averageScore || '0%', icon: Star, color: '#f59e0b' },
    { label: 'Learning Streak', value: '12 Days', icon: Flame, color: '#ef4444' },
  ];

  return (
    <div className={styles.studentDashboard}>
      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        {studentCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`glass-panel ${styles.statCard} animate-up`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon} style={{ background: `${card.color}15`, color: card.color }}>
                  <Icon size={20} />
                </div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
              <div className={styles.statValue}>{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Learning Progress */}
        <div className={styles.learningSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleWithIcon}>
              <Activity size={24} color="var(--color-primary)" />
              <h2>Continue Learning</h2>
            </div>
            <button onClick={() => navigate('/courses')} className={styles.viewAll}>Explore Courses <ArrowRight size={14} /></button>
          </div>
          
          {loadingCourses ? (
            <div className="flex-center" style={{ padding: '4rem' }}><div className="spinner" /></div>
          ) : enrolledCourses.length > 0 ? (
            <div className={styles.courseStack}>
              {enrolledCourses.map((course, idx) => (
                <div key={course.id} className={`glass-panel ${styles.courseRow} animate-up`} style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}>
                  <div className={styles.courseMain}>
                    <div className={styles.courseIcon}>
                      <PlayCircle size={24} />
                    </div>
                    <div className={styles.courseInfo}>
                      <h3>{course.title}</h3>
                      <div className={styles.courseMeta}>
                        <span className="badge">{course.difficulty}</span>
                        <span className={styles.dot}>•</span>
                        <span>Next: Lesson 04 - Advanced Logic</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.courseProgress}>
                    <div className={styles.miniProgress}>
                      <div className={styles.fill} style={{ width: '45%' }} />
                    </div>
                    <span>45%</span>
                  </div>

                  <button className="btn-primary" onClick={() => navigate(`/learn/${course.id}`)}>
                    Resume
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><BookOpen size={48} /></div>
              <h3>Start your learning journey</h3>
              <p>You haven't enrolled in any courses yet. Browse our catalog to find a track that fits your goals.</p>
              <button className="btn-primary" onClick={() => navigate('/courses')}>Browse Catalog</button>
            </div>
          )}
        </div>

        {/* Right Column: Side Info */}
        <aside className={styles.sideContent}>
          {/* Achievements */}
          <div className={`glass-panel ${styles.sideCard}`}>
            <h3>Achievements</h3>
            <div className={styles.achievementList}>
              <div className={styles.achievementItem}>
                <div className={styles.achIcon} style={{ background: '#f59e0b20', color: '#f59e0b' }}><Trophy size={16} /></div>
                <div className={styles.achInfo}>
                  <strong>Early Bird</strong>
                  <span>Completed 5 lessons before 9 AM</span>
                </div>
              </div>
              <div className={styles.achievementItem}>
                <div className={styles.achIcon} style={{ background: '#10b98120', color: '#10b981' }}><CheckCircle2 size={16} /></div>
                <div className={styles.achInfo}>
                  <strong>Logic Master</strong>
                  <span>Scored 100% on 3 Quizzes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Live Classes */}
          <div className={`glass-panel ${styles.sideCard}`}>
            <h3>Upcoming Workshops</h3>
            <div className={styles.workshopList}>
              <div className={styles.workshopItem}>
                <div className={styles.dateBox}>
                  <span className={styles.day}>28</span>
                  <span className={styles.month}>APR</span>
                </div>
                <div className={styles.workshopInfo}>
                  <strong>Backend Architecture</strong>
                  <span>With Mentor Alex • 6:00 PM</span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/live-classes')} className={styles.sideAction}>View Schedule</button>
          </div>

          <Recommendations compact />
        </aside>
      </div>
    </div>
  );
};

export default StudentDashboard;
