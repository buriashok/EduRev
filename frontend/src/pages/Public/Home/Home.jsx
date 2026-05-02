import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Award, Zap, ShieldCheck, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Marquee from '../../../components/Marquee/Marquee';
import ImageSlider from '../../../components/ImageSlider/ImageSlider';
import { useAuth } from '../../../context/AuthContext';
import { analyticsApi } from '../../../services/api';
import styles from './Home.module.css';

// Importing generated images (absolute paths for the demo)
const banner1 = '/C:/Users/buria/.gemini/antigravity/brain/aafbf1d9-5ddf-4ca2-9aeb-14e616358c4e/edtech_banner_1_1777194437635.png';
const banner2 = '/C:/Users/buria/.gemini/antigravity/brain/aafbf1d9-5ddf-4ca2-9aeb-14e616358c4e/edtech_banner_2_1777194460069.png';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, courses: 0, instructors: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getPublicStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats');
      }
    };
    fetchStats();
  }, []);

  const sliderImages = [
    { url: banner1, title: 'Master the Future of Tech', description: 'Join 50,000+ students learning the most in-demand skills from industry experts.' },
    { url: banner2, title: 'Expert-Led Live Sessions', description: 'Interact directly with mentors from top tech companies in real-time workshops.' },
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section with Slider */}
      <section className={styles.hero}>
        <div className="container">
          <ImageSlider images={sliderImages} />
        </div>
      </section>

      {/* Trust Bar */}
      <section className={styles.trustBar}>
        <div className="container">
          <p className={styles.trustLabel}>Trusted by teams at</p>
          <Marquee items={['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple', 'Spotify', 'Uber']} />
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} animate-up stagger-1`}>
              <h3>10k+</h3>
              <p>Active Learners</p>
            </div>
            <div className={`${styles.statCard} animate-up stagger-2`}>
              <h3>45+</h3>
              <p>Expert Mentors</p>
            </div>
            <div className={`${styles.statCard} animate-up stagger-3`}>
              <h3>98%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className="section-heading">
            <span className="badge">Why EduRev?</span>
            <h1>Everything you need to level up</h1>
            <p>Our platform is built by engineers for engineers, focusing on what actually matters in the industry.</p>
          </div>

          <div className={styles.featureGrid}>
            <div className={`glass-panel ${styles.featureCard} animate-up stagger-1`}>
              <div className={styles.iconBox}><Zap size={24} /></div>
              <h3>Fast-Track Learning</h3>
              <p>Skip the fluff with our curated learning paths designed for speed and retention.</p>
            </div>
            <div className={`glass-panel ${styles.featureCard} animate-up stagger-2`}>
              <div className={styles.iconBox}><Users size={24} /></div>
              <h3>Active Community</h3>
              <p>Join specialized forums and groups to discuss projects and get peer reviews.</p>
            </div>
            <div className={`glass-panel ${styles.featureCard} animate-up stagger-3`}>
              <div className={styles.iconBox}><Award size={24} /></div>
              <h3>Verified Certificates</h3>
              <p>Earn industry-recognized certificates for every track you successfully complete.</p>
            </div>
            <div className={`glass-panel ${styles.featureCard} animate-up stagger-4`}>
              <div className={styles.iconBox}><ShieldCheck size={24} /></div>
              <h3>Lifetime Access</h3>
              <p>Once you join a course, you have permanent access to all future updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={`glass-panel ${styles.ctaContent}`}>
            <div className={styles.ctaText}>
              <h2>Ready to start your journey?</h2>
              <p>Join thousands of professionals already accelerating their careers.</p>
            </div>
            <div className={styles.ctaBtns}>
              {!user ? (
                <Link to="/register" className="btn-primary">
                  Create Free Account <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/courses" className="btn-outline">Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact} id="contact">
        <div className="container">
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <h1>Get in touch</h1>
              <p>Have questions about our programs or need technical support? We're here to help.</p>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Mail size={20} />
                  <span>support@edurev.com</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={20} />
                  <span>+1 (555) 000-1234</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin size={20} />
                  <span>123 Innovation Drive, Silicon Valley, CA</span>
                </div>
              </div>
            </div>

            <form className={`glass-panel ${styles.contactForm}`}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Name</label>
                  <input type="text" placeholder="John Doe" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Subject</label>
                <select>
                  <option>General Inquiry</option>
                  <option>Course Support</option>
                  <option>Business Partnership</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
