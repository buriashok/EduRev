import { useEffect, useState } from 'react';
import { Loader2, MessageSquareMore, Plus, Send, User } from 'lucide-react';
import { discussionApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Forum.module.css';

const Forum = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchDiscussions = async () => {
      try {
        const response = await discussionApi.getAll();
        if (mounted) {
          setDiscussions(response.data);
        }
      } catch (error) {
        if (mounted) {
          setMessage(getErrorMessage(error, 'Failed to load discussions.'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDiscussions();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim()) {
      return;
    }

    try {
      const response = await discussionApi.create({ title: newTitle.trim() });
      setDiscussions((current) => [response.data, ...current]);
      setNewTitle('');
      setMessage('');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Please sign in to create a discussion.'));
    }
  };

  return (
    <div className={`container ${styles.forumPage}`}>
      <div className={styles.header}>
        <div className="section-heading">
          <h1>Community conversations</h1>
          <p>Ask questions, share progress, and keep the learning loop active between lessons and live sessions.</p>
        </div>

        <div className={`glass-panel ${styles.composeBox}`}>
          <div className={styles.composeHeader}>
            <span className="badge"><Plus size={14} /> Start a topic</span>
            <span className={styles.helperText}>{user ? 'Signed in and ready to post' : 'Sign in to start a discussion'}</span>
          </div>
          <div className={styles.composeRow}>
            <input
              type="text"
              placeholder="What would you like to discuss?"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <button className="btn-primary" onClick={handleCreateDiscussion}>
              <Send size={16} />
              Post
            </button>
          </div>
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '280px' }}>
          <Loader2 className={styles.loader} size={40} />
        </div>
      ) : (
        <div className={styles.list}>
          {discussions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <MessageSquareMore size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
              <h3>No discussions yet</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Be the first learner to open a thread.</p>
            </div>
          ) : (
            discussions.map((disc) => (
              <article key={disc.id} className={`glass-panel ${styles.discussionCard} animate-fade-in`}>
                <div>
                  <h2 className={styles.title}>{disc.title}</h2>
                  <div className={styles.meta}>
                    <span><User size={14} /> {disc.author ? `${disc.author.firstName} ${disc.author.lastName}` : 'Community member'}</span>
                    <span>{disc.createdAt ? new Date(disc.createdAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
                <div className={styles.replies}>
                  <MessageSquareMore size={16} />
                  {disc.messages ? disc.messages.length : 0} replies
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Forum;
