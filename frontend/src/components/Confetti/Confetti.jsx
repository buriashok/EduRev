import React, { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)],
      size: 5 + Math.random() * 10,
      rotation: Math.random() * 360
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className={styles.container}>
      {particles.map(p => (
        <div 
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
