import { useEffect, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../../../services/api';
import styles from './Leaderboard.module.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await leaderboardApi.get();
        setLeaders(res.data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
    </div>
  );

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className={styles.titleArea}>
           <h1>Global Leaderboard</h1>
           <p>Compete with the top learners across the EduRev community.</p>
        </div>
        <div className={styles.iconBox}>
          <Trophy size={48} color="#f59e0b" />
        </div>
      </header>

      <div className={styles.board}>
        <div className={styles.boardHeader}>
          <span>Rank</span>
          <span>Learner</span>
          <span>Level</span>
          <span>Experience</span>
        </div>
        <div className={styles.list}>
          {leaders.map((user, index) => (
            <div key={index} className={`${styles.row} ${index < 3 ? styles.topThree : ''}`}>
              <div className={styles.rank}>
                {index === 0 && <Medal color="#f59e0b" size={20} />}
                {index === 1 && <Medal color="#94a3b8" size={20} />}
                {index === 2 && <Medal color="#b45309" size={20} />}
                {index > 2 && <span>{index + 1}</span>}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user.name.charAt(0)}
                </div>
                <strong>{user.name}</strong>
              </div>
              <div className={styles.level}>
                <span className="badge">Lvl {user.level}</span>
              </div>
              <div className={styles.xp}>
                <strong>{user.xp.toLocaleString()}</strong>
                <span>XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
