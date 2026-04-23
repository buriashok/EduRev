import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, BarChart, ChevronRight } from 'lucide-react';
import { courseApi } from '../../services/api';
import styles from './Courses.module.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAll();
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    return (difficulty === 'ALL' || course.difficulty === difficulty) &&
           course.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`container ${styles.coursesPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Courses</h1>
        <div style={{position: 'relative', width: '300px'}}>
          <Search style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
          <input 
            type="text" 
            className={styles.select} 
            style={{paddingLeft: '40px', width: '100%'}}
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{height: '300px'}}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className={`glass-panel ${styles.filterBar}`}>
        <div className={styles.filterGroup}>
          <label style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Difficulty</label>
          <select className={styles.select} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredCourses.map(course => (
          <div key={course.id} className={`glass-panel ${styles.courseCard} animate-fade-in`}>
            <div className={styles.thumbnail}>
              <h3>{course.title.split(' ')[0]}</h3>
            </div>
            <div className={styles.content}>
              <h3 className={styles.courseTitle}>{course.title}</h3>
              <p style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{course.description}</p>
              
              <div className={styles.meta}>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  <Clock size={16} /> {course.duration}
                </span>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  <BarChart size={16} /> {course.difficulty}
                </span>
              </div>

              <div className={styles.footer} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem'}}>
                <span className={styles.price}>${course.price}</span>
                <Link to={`/checkout`} className="btn-primary" style={{padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  Enroll Now <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
    </div>
  );
};

export default Courses;
