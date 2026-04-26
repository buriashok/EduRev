import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Clock3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseApi, getErrorMessage } from '../../services/api';
import styles from './Courses.module.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAll();
        setCourses(response.data);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load courses.'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesDifficulty = difficulty === 'ALL' || course.difficulty === difficulty;
        const matchesSearch = `${course.title} ${course.description}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDifficulty && matchesSearch;
      }),
    [courses, difficulty, searchTerm],
  );

  return (
    <div className={`container ${styles.coursesPage}`}>
      <div className={styles.hero}>
        <div className="section-heading">
          <h1>Explore compact, practical learning tracks</h1>
          <p>Discover courses designed for real outcomes: concise lessons, clear difficulty tags, and a faster path to progress.</p>
        </div>

        <div className={styles.controls}>
          <label className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search courses, topics, or outcomes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <select className={styles.select} value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="ALL">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '280px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {message && <div className={styles.message}>{message}</div>}

          <div className={styles.grid}>
            {filteredCourses.map((course) => (
              <article key={course.id} className={`glass-panel ${styles.courseCard} animate-fade-in`}>
                <div className={styles.thumbnail}>
                  <span className="badge">{course.difficulty}</span>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                </div>

                <div className={styles.meta}>
                  <span><Clock3 size={16} /> {course.duration}</span>
                  <span><BarChart3 size={16} /> {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'EduRev mentor'}</span>
                </div>

                <div className={styles.footer}>
                  <strong>₹{Number(course.price || 0).toLocaleString('en-IN')}</strong>
                  <Link to="/checkout" state={{ course }} className="btn-primary">
                    Enroll
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {!filteredCourses.length && <div className={styles.emptyState}>No courses matched your current search.</div>}
        </>
      )}
    </div>
  );
};

export default Courses;
