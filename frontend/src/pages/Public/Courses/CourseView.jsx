import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  Award,
  ChevronRight,
  Lock
} from 'lucide-react';
import { courseApi, progressApi, certificateApi, getErrorMessage } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './CourseView.module.css';

import Confetti from '../../../components/Confetti/Confetti';

const CourseView = () => {
  const { user } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchCertificate = async () => {
    try {
      const res = await certificateApi.getMyCertificates();
      const cert = res.data.find(c => c.course.id === parseInt(courseId));
      if (cert) setCertificate(cert);
    } catch (error) {
      console.error('Failed to load certificate', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          courseApi.getById(courseId),
          progressApi.get(courseId)
        ]);
        
        setCourse(courseRes.data);
        setCompletedLessonIds(new Set(progressRes.data.completedLessonIds));
        
        if (courseRes.data.lessons?.length > 0) {
          setCurrentLesson(courseRes.data.lessons[0]);
        }
        await fetchCertificate();
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load course content.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleLessonComplete = async () => {
    if (!currentLesson || isCompleting) return;
    
    setIsCompleting(true);
    try {
      await progressApi.completeLesson(courseId, currentLesson.id);
      setCompletedLessonIds(prev => new Set([...prev, currentLesson.id]));
      
      const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1]);
      } else {
        // Last lesson completed!
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        await fetchCertificate();
      }
    } catch (error) {
      console.error('Failed to mark lesson complete', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
    </div>
  );

  if (!course) return (
    <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>Course not found</h1>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className={styles.courseView}>
      {showConfetti && <Confetti />}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/courses')}>
            <ArrowLeft size={16} /> Courses
          </button>
          <h2>{course.title}</h2>
          <div className={styles.progressSection}>
             <div className={styles.progressRow}>
               <span>{Math.round((completedLessonIds.size / course.lessons.length) * 100)}% Complete</span>
               <span>{completedLessonIds.size}/{course.lessons.length}</span>
             </div>
             <div className={styles.progressBar}><div className={styles.progressFill} style={{width: `${(completedLessonIds.size / course.lessons.length) * 100}%`}}></div></div>
          </div>
        </div>

        <nav className={styles.lessonList}>
          {course.lessons?.map((lesson, idx) => (
            <button 
              key={lesson.id}
              className={`${styles.lessonItem} ${currentLesson?.id === lesson.id ? styles.active : ''}`}
              onClick={() => setCurrentLesson(lesson)}
            >
              <div className={styles.lessonOrder}>{String(idx + 1).padStart(2, '0')}</div>
              <div className={styles.lessonInfo}>
                <span className={styles.lessonTitle}>{lesson.title}</span>
                <span className={styles.lessonMeta}>15m • Video</span>
              </div>
              <div className={styles.lessonStatus}>
                {completedLessonIds.has(lesson.id) ? (
                  <CheckCircle2 size={16} className={styles.completedIcon} />
                ) : (
                  <Circle size={16} className={styles.todoIcon} />
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <main className={styles.main}>
        {currentLesson ? (
          <div className={styles.content}>
            <div className={styles.videoArea}>
               {(!user && !currentLesson.preview) ? (
                  <div className={styles.locked}>
                    <Lock size={48} />
                    <h2>Enroll to Unlock</h2>
                    <p>This lesson is only available for students enrolled in this course.</p>
                    <Link to="/checkout" state={{ course }} className="btn-primary">Enroll Now</Link>
                  </div>
               ) : (
                 <div className={styles.playerWrapper}>
                    <iframe
                      src={getYoutubeEmbedUrl(currentLesson.videoUrl) || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                      title="Lesson Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                 </div>
               )}
            </div>

            <div className={styles.textContent}>
              <div className={styles.contentHeader}>
                <h1>{currentLesson.title}</h1>
                <div className={styles.actions}>
                  <button 
                    className={completedLessonIds.has(currentLesson.id) ? styles.completedBtn : styles.completeBtn}
                    onClick={handleLessonComplete}
                    disabled={isCompleting || completedLessonIds.has(currentLesson.id)}
                  >
                    {completedLessonIds.has(currentLesson.id) ? 'Completed' : 'Mark as Done'}
                  </button>
                  {currentLesson.quizId && (
                    <button className="btn-secondary" onClick={() => navigate(`/quiz/${currentLesson.quizId}`)}>Take Quiz</button>
                  )}
                </div>
              </div>
              <div 
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>This lesson covers the fundamental concepts of the topic. Please follow the video instructions for practical exercises.</p>' }}
              />
              
              {certificate && (
                <div className={`glass-panel ${styles.certCard}`}>
                  <Award size={48} color="#f59e0b" />
                  <div>
                    <h3>Congratulations!</h3>
                    <p>You have earned your certificate for this course.</p>
                  </div>
                  <button className="btn-primary" onClick={() => navigate(`/certificate/${certificate.id}`)}>View Certificate</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-center" style={{height: '100%'}}>
            <p>Select a lesson from the sidebar to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseView;
