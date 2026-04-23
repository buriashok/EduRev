import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { courseApi } from '../../services/api';
import styles from './Recommendations.module.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await courseApi.getRecommendations();
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className={styles.container}>
      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem'}}>
        <Sparkles size={24} style={{color: 'var(--color-secondary)'}} />
        <h2 style={{fontSize: '2rem'}}>AI-Powered Recommendations</h2>
      </div>
      
      <div className={styles.grid}>
        {recommendations.map(course => (
          <div key={course.id} className={`glass-panel ${styles.card}`}>
            <span className={styles.badge}>{course.difficulty}</span>
            <h3 className={styles.title}>{course.title}</h3>
            <p className={styles.description}>{course.description}</p>
            <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'fit-content', marginTop: 'auto'}}>
              Learn More <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
