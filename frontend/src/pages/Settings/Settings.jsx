import { useState, useEffect, useRef } from 'react';
import { getErrorMessage, userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Settings.module.css';
import { Save, User, Bell, Shield, CreditCard, Camera, Download, Trash2, Key } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
    profileImage: '',
    twoFactorEnabled: false,
    twoFactorMethod: 'EMAIL',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
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
          profileImage: response.data.profileImage || '',
          twoFactorEnabled: Boolean(response.data.twoFactorEnabled ?? response.data.isTwoFactorEnabled),
          twoFactorMethod: response.data.twoFactorMethod || 'EMAIL',
        });
      } catch {
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const response = await userApi.uploadAvatar(file);
      setFormData(prev => ({ ...prev, profileImage: response.data.profileImage }));
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to upload avatar') });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userApi.updateProfile(formData);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setSaving(true);
    try {
      await userApi.updatePassword(passwordData);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to update password') });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await userApi.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edurev-data-${user.firstName.toLowerCase()}.json`;
      a.click();
      setMessage({ type: 'success', text: 'Data export started!' });
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to export data') });
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure? This will disable your account.')) return;
    setSaving(true);
    try {
      await userApi.deactivateAccount();
      await logout();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Failed to deactivate account') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '80vh' }}><div className="spinner" /></div>;

  return (
    <div className={styles.settingsContainer}>
      <aside className={styles.sidebar}>
        <button 
          className={`${styles.sidebarItem} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> Profile
        </button>
        <button 
          className={`${styles.sidebarItem} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={18} /> Security
        </button>
        <button 
          className={`${styles.sidebarItem} ${activeTab === 'account' ? styles.active : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <Shield size={18} /> Account
        </button>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h1>
          <p>Manage your {activeTab} preferences and data.</p>
        </header>

        {message.text && (
          <div className={`${styles.alert} ${message.type === 'success' ? styles.success : styles.error} animate-fade-in`}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <section className={styles.section}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
                  <img src={formData.profileImage || `https://ui-avatars.com/api/?background=0f62fe&color=fff&name=${encodeURIComponent(formData.firstName)}`} alt="Avatar" />
                  <div className={styles.avatarOverlay}>
                    <Camera size={20} />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                <div>
                  <h3>Your Avatar</h3>
                  <p>Click to upload a new profile picture.</p>
                </div>
              </div>

              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us about yourself..." />
              </div>
              <div className={styles.inputGroup}>
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </section>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <section className={styles.section}>
              <h3>Update Password</h3>
              <div className={styles.inputGroup}>
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>New Password</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
              </div>
            </section>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Key size={18} /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {activeTab === 'account' && (
          <div className={styles.form}>
            <section className={styles.section}>
              <h3>Data & Privacy</h3>
              <div className={styles.card}>
                <div>
                  <strong>Export My Data</strong>
                  <p>Download all your course progress and personal information in JSON format.</p>
                </div>
                <button type="button" className="btn-secondary" onClick={handleExportData}>
                  <Download size={18} /> Download
                </button>
              </div>

              <div className={styles.card} style={{ borderColor: 'var(--color-error)' }}>
                <div>
                  <strong style={{ color: 'var(--color-error)' }}>Deactivate Account</strong>
                  <p>Disable your account access. This action can be undone by contacting support.</p>
                </div>
                <button type="button" className="btn-outline" onClick={handleDeactivate} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                  <Trash2 size={18} /> Deactivate
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
