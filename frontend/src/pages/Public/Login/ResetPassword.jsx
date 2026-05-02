import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { authApi, getErrorMessage } from '../../../services/api';
import styles from './Login.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword({ email, token, newPassword });
      setMessage(response.data.message || 'Password reset successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Unable to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon} />
          <span>EduRev</span>
        </div>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Create a fresh password for {email || 'your account'}.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>New password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.icon} />
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.subtitle}>{message}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading || !email || !token}>
            {loading ? 'Updating...' : 'Set new password'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        <p className={styles.footer}>
          Back to <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
