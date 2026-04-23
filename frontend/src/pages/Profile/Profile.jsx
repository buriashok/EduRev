import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import styles from './Profile.module.css';
import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Clock, Camera, Check, Loader2 } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getMe();
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setUpdating(true);
      try {
        await userApi.updateProfile({ ...profile, profileImage: base64String });
        setProfile({ ...profile, profileImage: base64String });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to upload image:', err);
        setError('Upload failed');
      } finally {
        setUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex-center" style={{height: '100vh'}}><div className="spinner"></div></div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div className={styles.error}>No profile found</div>;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=0d1117&color=c9d1d9&size=150`;

  return (
    <div className={`container ${styles.profileContainer}`}>
      <div className={styles.header}>
        <div className={styles.coverImage}></div>
        <div className={styles.profileInfo}>
          <div className={styles.avatarWrapper}>
            <img 
              src={profile.profileImage || defaultAvatar} 
              alt="Avatar" 
              className={styles.avatar}
            />
            <label className={styles.uploadOverlay}>
              {updating ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={updating} />
            </label>
            {success && <div className={styles.successBadge}><Check size={12} /></div>}
          </div>
          <div className={styles.mainDetails}>
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className={styles.role}>{profile.role}</p>
            <div className={styles.meta}>
              <span><Mail size={16} /> {profile.email}</span>
              {profile.phoneNumber && <span><Phone size={16} /> {profile.phoneNumber}</span>}
              {profile.address && <span><MapPin size={16} /> {profile.address}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.sidebar}>
          <div className={`glass-panel ${styles.card}`}>
            <h3>About Me</h3>
            <p className={styles.bio}>{profile.bio || "No bio available. Tell us about yourself!"}</p>
            <button className="btn-secondary" style={{width: '100%', marginTop: '1rem', fontSize: '0.8rem'}}>Edit Bio</button>
          </div>
          <div className={`glass-panel ${styles.card}`}>
            <h3>Account Info</h3>
            <div className={styles.infoRow}>
              <Calendar size={18} />
              <div>
                <label>Joined</label>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={`glass-panel ${styles.card}`}>
            <div className={styles.cardHeader}>
              <h3>Learning Activity</h3>
              <button className="btn-secondary" style={{padding: '0.4rem 0.8rem'}}>View All</button>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <BookOpen size={24} className={styles.statIcon} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>12</span>
                  <span className={styles.statLabel}>Courses Enrolled</span>
                </div>
              </div>
              <div className={styles.statBox}>
                <Award size={24} className={styles.statIcon} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>5</span>
                  <span className={styles.statLabel}>Certificates</span>
                </div>
              </div>
              <div className={styles.statBox}>
                <Clock size={24} className={styles.statIcon} />
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>48h</span>
                  <span className={styles.statLabel}>Learning Time</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`glass-panel ${styles.card}`}>
            <h3>Recent Courses</h3>
            <div className={styles.courseList}>
               <p className={styles.emptyState}>Start your learning journey today!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
