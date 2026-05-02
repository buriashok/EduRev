import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Clock3, 
  Search, 
  Filter, 
  Code2, 
  Database, 
  Cloud, 
  Cpu, 
  Star 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseApi, getErrorMessage } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './Courses.module.css';

// Using generated placeholders
const reactImg = '/C:/Users/buria/.gemini/antigravity/brain/aafbf1d9-5ddf-4ca2-9aeb-14e616358c4e/course_placeholder_react_1777194662997.png';
const pythonImg = '/C:/Users/buria/.gemini/antigravity/brain/aafbf1d9-5ddf-4ca2-9aeb-14e616358c4e/course_placeholder_python_1777194684044.png';

const Categories = [
  { id: 'ALL', label: 'All', icon: <Filter size={18} /> },
  { id: 'WEB', label: 'Web Dev', icon: <Code2 size={18} /> },
  { id: 'DATA', label: 'Data & AI', icon: <Database size={18} /> },
  { id: 'CLOUD', label: 'Cloud', icon: <Cloud size={18} /> },
  { id: 'SYSTEM', label: 'Systems', icon: <Cpu size={18} /> },
];

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState('ALL');
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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesDifficulty = difficulty === 'ALL' || course.difficulty === difficulty;
      const matchesSearch = `${course.title} ${course.description}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'ALL' || (course.category && course.category === activeCategory);
      return matchesDifficulty && matchesSearch && matchesCategory;
    });
  }, [courses, difficulty, searchTerm, activeCategory]);

  return (
    <div className={styles.coursesPage}>
      {/* Header Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <span className="badge">Curated Learning</span>
              <h1>Elevate your skills with elite technical tracks</h1>
              <p>Practical, concise, and structured for real-world impact.</p>
            </div>
            
            <div className={styles.searchBar}>
              <div className={styles.inputWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input 
                  type="text" 
                  placeholder="Search for your next skill..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className={styles.categoryStrip}>
        <div className="container">
          <div className={styles.categories}>
            {Categories.map(cat => (
              <button 
                key={cat.id} 
                className={`${styles.catBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container">
        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.gridHeader}>
              <h2>{filteredCourses.length} Courses Found</h2>
            </div>

            <div className={styles.grid}>
              {filteredCourses.map((course, idx) => (
                <article key={course.id} className={`glass-panel ${styles.courseCard} animate-up`} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={styles.cardImage}>
                    <img src={course.title.toLowerCase().includes('python') ? pythonImg : reactImg} alt="Course" />
                    <span className={styles.diffBadge}>{course.difficulty}</span>
                    <div className={styles.rating}>
                      <Star size={12} fill="currentColor" />
                      <span>{Number(course.averageRating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.title}>{course.title}</h3>
                    <p className={styles.desc}>{course.description}</p>
                    
                    <div className={styles.meta}>
                      <div className={styles.metaItem}>
                        <Clock3 size={14} />
                        <span>{course.duration || '12h 45m'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BarChart3 size={14} />
                        <span>{course.reviewCount || 0} reviews</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.price}>
                        <span className={styles.currency}>₹</span>
                        <span className={styles.amount}>{Number(course.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                      
                      {(!user || user.role === 'STUDENT') && (
                        <Link to="/checkout" state={{ course }} className={styles.enrollBtn}>
                          Enroll <ArrowRight size={16} />
                        </Link>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Link to={`/learn/${course.id}`} className={styles.enrollBtn}>
                          Access <ArrowRight size={16} />
                        </Link>
                      )}
                      {user?.role === 'INSTRUCTOR' && (
                        <span className={styles.ownerTag}>My Course</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className={styles.empty}>
                <Search size={48} />
                <p>No courses found matching your criteria.</p>
                <button onClick={() => {setSearchTerm(''); setDifficulty('ALL');}} className="btn-secondary">Clear Filters</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
