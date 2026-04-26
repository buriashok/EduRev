import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, BookOpen, ArrowLeft, Loader2, Award } from 'lucide-react';
import { courseApi, progressApi, certificateApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './CourseView.module.css';

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
      
      // Auto-advance to next lesson if available
      const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1]);
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className={styles.courseView}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size(20) />
          <span>Back to Dashboard</span>
        </button>
        <div className={styles.progressInfo}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(completedLessonIds.size / (course.lessons?.length || 1)) * 100}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {completedLessonIds.size} / {course.lessons?.length} lessons completed
          </span>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Course Content</h3>
            <span className="badge">{course.difficulty}</span>
          </div>
          <nav className={styles.lessonList}>
            {course.lessons?.map((lesson, index) => (
              <button 
                key={lesson.id}
                className={`${styles.lessonItem} ${currentLesson?.id === lesson.id ? styles.active : ''}`}
                onClick={() => setCurrentLesson(lesson)}
              >
                <div className={styles.lessonStatus}>
                  {completedLessonIds.has(lesson.id) ? (
                    <CheckCircle2 size={18} className={styles.completedIcon} />
                  ) : (
                    <Circle size={18} className={styles.todoIcon} />
                  )}
                </div>
                <div className={styles.lessonInfo}>
                  <span className={styles.lessonOrder}>Lesson {index + 1}</span>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          {currentLesson ? (
            <div className={styles.lessonContent}>
              <div className={styles.videoContainer}>
                {(!user && !currentLesson.preview) ? (
                  <div className={styles.lockedOverlay}>
                    <div className={`glass-panel ${styles.lockedCard}`}>
                      <PlayCircle size={48} />
                      <h2>Premium Content</h2>
                      <p>This lesson is restricted to enrolled students. Sign in to start learning!</p>
                      <button className="btn-primary" onClick={() => navigate('/login')}>Sign in to Join</button>
                    </div>
                  </div>
                ) : currentLesson.videoUrl ? (
                  getYoutubeEmbedUrl(currentLesson.videoUrl) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                      title={currentLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className={styles.videoPlayer}
                    ></iframe>
                  ) : (
                    <video 
                      controls 
                      src={currentLesson.videoUrl} 
                      className={styles.videoPlayer}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.videoOverlay}>
                      <PlayCircle size={64} />
                      <p>Video content for "{currentLesson.title}" would play here.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.textDetails}>
                <h1>{currentLesson.title}</h1>
                <div className={styles.lessonMetadata}>
                   <span><BookOpen size={16} /> 15 mins reading</span>
                </div>
                <div 
                  className={styles.lessonBody}
                  dangerouslySetInnerHTML={{ __html: currentLesson.content || 'This lesson contains technical documentation and practical exercises.' }}
                />
                
                <div className={styles.footer} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    className={`btn-primary ${styles.completeBtn}`}
                    onClick={handleLessonComplete}
                    disabled={isCompleting || completedLessonIds.has(currentLesson.id)}
                  >
                    {isCompleting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : completedLessonIds.has(currentLesson.id) ? (
                      <>Completed <CheckCircle2 size={18} /></>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>

                  {currentLesson.quizId && (
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/quiz/${currentLesson.quizId}`)}
                    >
                      Take Quiz
                    </button>
                  )}

                  {certificate && (
                    <button 
                      className="btn-primary"
                      onClick={() => navigate(`/certificate/${certificate.id}`)}
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                    >
                      <Award size={18} />
                      Download Certificate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-center" style={{ height: '100%' }}>
              <p>Select a lesson to begin learning.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CourseView;
