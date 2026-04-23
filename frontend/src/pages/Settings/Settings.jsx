import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import styles from './Settings.module.css';
import { Save, User, Bell, Shield, CreditCard, ExternalLink } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getMe();
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          address: response.data.address || '',
          bio: response.data.bio || '',
          profileImage: response.data.profileImage || ''
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userApi.updateProfile(formData);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarItem + ' ' + styles.active}>
          <User size={20} /> Personal Info
        </div>
        <div className={styles.sidebarItem}>
          <Bell size={20} /> Notifications
        </div>
        <div className={styles.sidebarItem}>
          <Shield size={20} /> Security
        </div>
        <div className={styles.sidebarItem}>
          <CreditCard size={20} /> Billing
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Settings</h1>
          <p>Update your personal information and account settings</p>
        </div>

        {message.text && (
          <div className={styles.alert + ' ' + (message.type === 'success' ? styles.success : styles.error)}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <h3>Profile Information</h3>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="John"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                disabled 
                className={styles.disabledInput}
              />
              <small>Email cannot be changed</small>
            </div>
            <div className={styles.inputGroup}>
              <label>Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Write a short bio about yourself..."
                rows="4"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3>Contact Details</h3>
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="123 Main St, City, Country"
              />
            </div>
          </section>

          <div className={styles.footer}>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
