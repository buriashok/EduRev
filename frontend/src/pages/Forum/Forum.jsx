import React from 'react';
import { MessageSquare, User, Clock, Plus } from 'lucide-react';
import styles from './Forum.module.css';

const MOCK_DISCUSSIONS = [
  { id: 1, title: 'How to handle JWT expiration in React?', author: 'David Smith', replies: 12, time: '2 hours ago' },
  { id: 2, title: 'Best practices for PostgreSQL indexing', author: 'Emily Blunt', replies: 8, time: '5 hours ago' },
  { id: 3, title: 'Career advice for full-stack developers', author: 'Michael Jordan', replies: 25, time: '1 day ago' }
];

const Forum = () => {
  return (
    <div className={`container ${styles.forumPage}`}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)'}}>
        <h1 style={{fontSize: '2.5rem'}}>Discussion Forums</h1>
        <button className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Plus size={18} /> New Discussion
        </button>
      </div>

      <div className={styles.list}>
        {MOCK_DISCUSSIONS.map(disc => (
          <div key={disc.id} className={`glass-panel ${styles.discussionCard} animate-fade-in`}>
            <div>
              <h2 className={styles.title}>{disc.title}</h2>
              <div className={styles.meta}>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><User size={14} /> {disc.author}</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Clock size={14} /> {disc.time}</span>
              </div>
            </div>
            <div className={styles.replies}>
              <MessageSquare size={16} style={{display: 'inline', marginRight: '0.4rem'}} />
              {disc.replies} replies
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;
