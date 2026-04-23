import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import styles from './CreateCourse.module.css';

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    difficulty: 'BEGINNER',
    duration: '',
    lessons: []
  });
  const navigate = useNavigate();

  const handleAddLesson = () => {
    const newLesson = { title: '', content: '', orderIndex: course.lessons.length };
    setCourse({ ...course, lessons: [...course.lessons, newLesson] });
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...course.lessons];
    updatedLessons[index][field] = value;
    setCourse({ ...course, lessons: updatedLessons });
  };

  const handleRemoveLesson = (index) => {
    const updatedLessons = course.lessons.filter((_, i) => i !== index);
    setCourse({ ...course, lessons: updatedLessons });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Course Created:', course);
    // Logic to save to backend
    navigate('/courses');
  };

  return (
    <div className={`container ${styles.createPage}`}>
      <h1 className={styles.title}>Create New Course</h1>
      
      <form className={`glass-panel ${styles.form}`} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Course Title</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="e.g. Master React in 30 Days"
            value={course.title}
            onChange={(e) => setCourse({...course, title: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea 
            className={styles.textarea} 
            placeholder="What will students learn in this course?"
            value={course.description}
            onChange={(e) => setCourse({...course, description: e.target.value})}
            required
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Price ($)</label>
            <input 
              type="number" 
              className={styles.input} 
              placeholder="49.99"
              value={course.price}
              onChange={(e) => setCourse({...course, price: e.target.value})}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Duration</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. 10 hours"
              value={course.duration}
              onChange={(e) => setCourse({...course, duration: e.target.value})}
              required
            />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Difficulty Level</label>
            <select 
              className={styles.select}
              value={course.difficulty}
              onChange={(e) => setCourse({...course, difficulty: e.target.value})}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div style={{marginTop: 'var(--space-md)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h3 style={{fontFamily: 'var(--font-display)'}}>Lessons</h3>
            <button type="button" onClick={handleAddLesson} className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem'}}>
              <Plus size={18} /> Add Lesson
            </button>
          </div>

          {course.lessons.map((lesson, index) => (
            <div key={index} className="glass-panel" style={{padding: 'var(--space-md)', marginBottom: '1rem', position: 'relative'}}>
              <button type="button" onClick={() => handleRemoveLesson(index)} style={{position: 'absolute', right: '1rem', top: '1rem', color: 'var(--color-accent)'}}>
                <Trash2 size={18} />
              </button>
              <div className={styles.formGroup} style={{marginBottom: '1rem'}}>
                <label className={styles.label}>Lesson Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g. Introduction to React"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Content / Notes</label>
                <textarea 
                  className={styles.textarea} 
                  style={{minHeight: '80px'}}
                  placeholder="Lesson notes..."
                  value={lesson.content}
                  onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: 'var(--space-xl)'}}>
          <button type="button" onClick={() => navigate('/courses')} className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <X size={18} /> Cancel
          </button>
          <button type="submit" className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Save size={18} /> Create Course
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
