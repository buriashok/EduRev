import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './AiMentor.module.css';

const AiMentor = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: 'Hi! I am EduBot. How can I help you with your learning journey today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();

  // Determine context based on URL
  const getContext = () => {
    if (location.pathname.includes('/learn/')) return 'Course Lesson';
    if (location.pathname.includes('/quiz/')) return 'Quiz Practice';
    if (location.pathname.includes('/dashboard')) return 'User Dashboard';
    return 'General Browsing';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await aiApi.getHistory();
        if (response.data && response.data.length > 0) {
          const history = response.data.map(msg => ({
            role: msg.fromUser ? 'user' : 'bot',
            text: msg.content
          }));
          setChat(history);
        }
      } catch (error) {
        console.error('Failed to load chat history', error);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiApi.chat(userMessage, getContext());
      setChat(prev => [...prev, { role: 'bot', text: response.data.response }]);
    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <button className={styles.fab} onClick={() => setIsOpen(true)}>
        <Bot size={28} />
        <span className={styles.fabTooltip}>Ask EduBot</span>
      </button>
    );
  }

  return (
    <div className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ''} animate-fade-in`}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.botIcon}><Bot size={20} /></div>
          <div>
            <strong>EduBot</strong>
            <span className={styles.status}>Online Mentor</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)}><X size={18} /></button>
        </div>
      </header>

      {!isMinimized && (
        <>
          <div className={styles.messages} ref={scrollRef}>
            {chat.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.role === 'bot' ? styles.botMsg : styles.userMsg}`}>
                <div className={styles.msgIcon}>
                  {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={styles.msgText}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} styles.botMsg`}>
                <div className={styles.typing}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className={styles.inputArea} onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AiMentor;
