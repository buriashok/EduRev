import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookOpen, BrainCircuit, GraduationCap, PlayCircle, Users, Video } from 'lucide-react';
import Marquee from '../../components/Marquee/Marquee';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../services/api';
import styles from './Home.module.css';

const partnerLogos = ['Google', 'Microsoft', 'Adobe', 'AWS', 'Atlassian', 'Notion', 'Shopify', 'Stripe'];

const featuredCourses = [
  {
    title: 'Productive React Interfaces',
    category: 'Frontend',
    description: 'Ship modern React apps with reusable UI systems, API workflows, and production-level patterns.',
    meta: '18 modules • 7 projects',
  },
  {
    title: 'Spring Boot Career Track',
    category: 'Backend',
    description: 'Build secure REST APIs, dashboards, and data layers with a clean Java + Spring stack.',
    meta: '22 modules • 5 capstones',
  },
  {
    title: 'AI Tools For Professionals',
    category: 'Applied AI',
    description: 'Use practical AI workflows for research, writing, analysis, and team productivity.',
    meta: '12 modules • 3 workshops',
  },
];

const experienceCards = [
  {
    icon: BookOpen,
    title: 'Compact learning paths',
    copy: 'Short, sequenced modules help learners stay consistent without getting lost in oversized courses.',
  },
  {
    icon: Video,
    title: 'Live mentor sessions',
    copy: 'Office hours, feedback clinics, and cohort sessions keep the experience human and practical.',
  },
  {
    icon: BrainCircuit,
    title: 'Project-first progress',
    copy: 'Learners leave with outcomes they can show, not just videos they watched.',
  },
];

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getPlatform();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch platform stats', error);
      }
    };
    fetchStats();
  }, []);

  const quickStats = [
    { value: `${stats.totalUsers > 1000 ? (stats.totalUsers/1000).toFixed(1) + 'k' : stats.totalUsers}+`, label: 'active learners' },
    { value: `${stats.totalCourses}+`, label: 'curated tracks' },
    { value: `${stats.totalEnrollments}+`, label: 'total enrollments' },
  ];

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroLayout}`}>
          <div className={`${styles.heroCopy} animate-fade-in`}>
            <span className="badge shimmer"><BadgeCheck size={14} /> Trusted by focused learners and instructors</span>
            <h1 className="animate-up">{user ? `Welcome back, ${user.firstName}!` : 'Build career-ready skills with a calmer, smarter learning platform.'}</h1>
            <p className="animate-up stagger-1">
              {user 
                ? 'Ready to continue your journey? Pick up where you left off and hit your weekly learning targets.'
                : 'EduRev combines practical courses, live coaching, guided community support, and clean progress tracking into one compact experience.'}
            </p>

            <div className={`${styles.heroActions} animate-up stagger-2`}>
              {user ? (
                <Link to="/dashboard" className="btn-primary">
                  Go to My Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="btn-primary">
                  Start Free Journey
                  <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/courses" className="btn-outline">
                <PlayCircle size={18} />
                Explore Courses
              </Link>
            </div>

            <div className={`${styles.statRow} animate-up stagger-3`}>
              {quickStats.map((item) => (
                <div key={item.label} className={styles.statCard}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.heroVisual} animate-scale-in stagger-2`}>
            <div className={`${styles.heroPanel} hover-lift`}>
              <div className={styles.heroPanelTop}>
                <span className="badge"><GraduationCap size={14} /> Learning sprint</span>
                <span className={styles.panelTime}>Updated weekly</span>
              </div>
              <h3>Today’s learning board</h3>
              <div className={styles.progressBlock}>
                <div>
                  <span>Frontend Systems</span>
                  <strong>78%</strong>
                </div>
                <div className={styles.progressBar}>
                  <div className="animate-shimmer" style={{ width: '78%' }} />
                </div>
              </div>
              <div className={styles.heroChecklist}>
                <div><Users size={16} /> Join live feedback room at 7:00 PM</div>
                <div><BookOpen size={16} /> Finish component architecture module</div>
                <div><BadgeCheck size={16} /> Publish your mini project review</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`container ${styles.logoStrip} animate-fade-in stagger-4`}>
          <Marquee items={partnerLogos} />
        </div>
      </section>

      <section className={`${styles.valueSection} animate-fade-in`}>
        <div className="container">
          <div className="section-heading">
            <h2>Designed to feel lighter, clearer, and easier to stick with</h2>
            <p>
              We trimmed away clutter so learners can focus on momentum, clarity, and visible progress across every screen.
            </p>
          </div>

          <div className={styles.valueGrid}>
            {experienceCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className={`glass-panel ${styles.valueCard} animate-up hover-lift stagger-${idx + 1}`}>
                  <div className={styles.valueIcon}>
                    <Icon size={22} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.featuredSection} animate-fade-in`}>
        <div className="container">
          <div className={styles.featuredHeader}>
            <div className="section-heading">
              <h2>Featured tracks</h2>
              <p>Professional, compact learning experiences that combine lessons, practice, and feedback.</p>
            </div>
            <Link to="/courses" className="btn-secondary">Browse all courses</Link>
          </div>

          <div className={styles.courseGrid}>
            {featuredCourses.map((course, idx) => (
              <article key={course.title} className={`${styles.courseCard} animate-up hover-lift stagger-${idx + 1}`}>
                <span className="badge">{course.category}</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className={styles.courseFooter}>
                  <span>{course.meta}</span>
                  <Link to="/courses">
                    View track
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
