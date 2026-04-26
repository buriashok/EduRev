import { TrendingUp, Users, BookOpen, Activity, Plus, Edit, UserPlus, Star, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instructorApi } from '../../services/api';
import styles from './Dashboard.module.css';

const InstructorDashboard = ({ user, stats, myCourses, loadingCourses, detailedAnalytics }) => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const handleViewRoster = async (course) => {
    setSelectedCourse(course);
    setLoadingRoster(true);
    try {
      const res = await instructorApi.getCourseStudents(course.id);
      setRoster(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const instructorCards = [
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
    { label: 'Active Students', value: Number(stats.activeStudents || 0).toLocaleString(), icon: Users },
    { label: 'My Courses', value: Number(stats.totalCourses || 0).toLocaleString(), icon: BookOpen },
    { label: 'Avg. Rating', value: stats.completionRate || '4.5', icon: Star },
  ];

  return (
    <div className={styles.dashboardContent}>
      <div className={styles.statsGrid}>
        {instructorCards.map((card) => {
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

      <div className={styles.analyticsSection}>
        <div className={`glass-panel ${styles.analyticsCard} animate-scale-in`}>
          <div className={styles.cardHeader}>
             <h3>Top Performing Courses</h3>
             <TrendingUp size={18} className="text-success" />
          </div>
          <div className={styles.topCoursesList}>
            {detailedAnalytics?.topCourses?.length > 0 ? detailedAnalytics.topCourses.map((course, idx) => (
              <div key={idx} className={styles.courseStatRow}>
                <div className={styles.courseInfo}>
                  <span className={styles.rank}>#{idx + 1}</span>
                  <span className={styles.title}>{course.title}</span>
                </div>
                <div className={styles.progressWrapper}>
                  <div className={styles.studentCount}>{course.students} Students</div>
                  <div className={styles.miniBar}>
                    <div 
                      className={styles.miniFill} 
                      style={{ width: `${(course.students / (detailedAnalytics.totalEnrollments || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            )) : <p className={styles.emptyMsg}>No course data available yet.</p>}
          </div>
        </div>

        <div className={`glass-panel ${styles.analyticsCard} animate-scale-in`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardHeader}>
             <h3>Recent Enrollments</h3>
             <Activity size={18} className="text-primary" />
          </div>
          <div className={styles.recentList}>
            {detailedAnalytics?.recentEnrollments?.length > 0 ? detailedAnalytics.recentEnrollments.map((reg, idx) => (
              <div key={idx} className={styles.regRow}>
                <div className={styles.regInfo}>
                  <strong>{reg.studentName}</strong>
                  <span>enrolled in {reg.courseTitle}</span>
                </div>
                <div className={styles.regDate}>
                  {new Date(reg.date).toLocaleDateString()}
                </div>
              </div>
            )) : <p className={styles.emptyMsg}>No recent enrollments.</p>}
          </div>
        </div>
      </div>

      <div className={styles.managementSection}>
        <div className={styles.sectionHeader}>
          <h2>Course Management</h2>
          <button className="btn-primary" onClick={() => navigate('/instructor/create-course')}>
            <Plus size={18} /> New Course
          </button>
        </div>

        <div className={styles.courseTableWrapper}>
          <table className={styles.courseTable}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.length === 0 ? (
                <tr><td colSpan="4" className={styles.emptyTable}>No courses created yet.</td></tr>
              ) : (
                myCourses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div className={styles.courseCell}>
                        <strong>{course.title}</strong>
                        <span>{course.difficulty}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${course.status === 'APPROVED' ? 'success' : 'warning'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>{course.enrollmentCount || 0}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className="btn-icon" title="Edit"><Edit size={16} /></button>
                        <button className="btn-icon" title="View Students" onClick={() => handleViewRoster(course)}>
                          <UserPlus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourse && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.rosterModal}`}>
            <div className={styles.modalHeader}>
              <h3>Students in "{selectedCourse.title}"</h3>
              <button className="btn-icon" onClick={() => setSelectedCourse(null)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              {loadingRoster ? (
                <div className="flex-center"><div className="spinner" /></div>
              ) : roster.length === 0 ? (
                <p className={styles.emptyMsg}>No students enrolled yet.</p>
              ) : (
                <div className={styles.studentList}>
                  {roster.map(student => (
                    <div key={student.id} className={styles.studentItem}>
                      <div className={styles.studentAvatar}>
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div className={styles.studentInfo}>
                        <strong>{student.firstName} {student.lastName}</strong>
                        <span>{student.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
