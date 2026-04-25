import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, getErrorMessage } from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, verifyOtp, pendingOtp } = useAuth();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    if (pendingOtp?.email) {
      const result = await verifyOtp(otp);
      if (!result.success) {
        setError(result.message);
      }
      setLoading(false);
      return;
    }

    const result = await login(formData);
    if (!result.success) {
      setError(result.message);
    } else if (result.requiresOtp) {
      setNotice(result.message || 'Enter the OTP sent to your email.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.forgotPassword({ email: forgotEmail });
      setNotice(response.data.message || 'Reset instructions sent if the email exists.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Failed to start password reset.'));
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

        <h1 className={styles.title}>{pendingOtp?.email ? 'Verify your sign in' : 'Sign in to continue learning'}</h1>
        <p className={styles.subtitle}>
          {pendingOtp?.email
            ? `Enter the one-time code sent to ${pendingOtp.email}.`
            : 'Use your account to access courses, sessions, and your progress dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!pendingOtp?.email ? (
            <>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.icon} />
                  <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.icon} />
                  <input type="password" name="password" placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange} required />
                </div>
              </div>

              <label className={styles.footer} style={{ justifyContent: 'space-between', width: '100%' }}>
                <span>
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} /> Remember me
                </span>
                <button type="button" className={styles.link} onClick={() => setShowForgotPassword((value) => !value)}>
                  Forgot password?
                </button>
              </label>
            </>
          ) : (
            <div className={styles.inputGroup}>
              <label>One-time password</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.icon} />
                <input type="text" name="otp" placeholder="6-digit code" value={otp} onChange={(event) => setOtp(event.target.value)} required />
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {notice && <p className={styles.subtitle}>{notice}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : pendingOtp?.email ? 'Verify OTP' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Reset email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.icon} />
                <input type="email" placeholder="you@example.com" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} required />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              Send reset link
            </button>
          </form>
        )}

        <p className={styles.footer}>
          Need an account? <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
