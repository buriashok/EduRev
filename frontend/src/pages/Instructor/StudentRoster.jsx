import { useState, useEffect } from 'react';
import { Users, Mail, BookOpen, Search, Download, ExternalLink } from 'lucide-react';
import { instructorApi, getErrorMessage } from '../../services/api';
import styles from './Instructor.module.css';

const StudentRoster = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await instructorApi.getAllMyStudents();
        setStudents(res.data);
      } catch (err) {
        setMessage(getErrorMessage(err, 'Failed to load students.'));
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.rosterPage}>
      <header className={styles.header}>
        <div>
          <h1>Student Roster</h1>
          <p>Manage and track all students enrolled in your courses.</p>
        </div>
        <button className="btn-secondary">
          <Download size={18} /> Export List
        </button>
      </header>

      <div className={`glass-panel ${styles.searchBar}`}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className={`glass-panel ${styles.tableWrapper}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Enrolled Courses</th>
                <th>Last Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className={styles.studentInfo}>
                      <img src={`https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`} alt="Avatar" />
                      <strong>{student.firstName} {student.lastName}</strong>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <div className={styles.courseBadges}>
                      {student.enrolledCourseTitles?.slice(0, 2).map((t, i) => (
                        <span key={i} className="badge">{t}</span>
                      ))}
                      {student.enrolledCourseTitles?.length > 2 && (
                        <span className={styles.more}>+{student.enrolledCourseTitles.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td>{student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <button className={styles.actionBtn} title="View Details">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className={styles.empty}>
              <Users size={48} opacity={0.2} />
              <p>No students found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRoster;
