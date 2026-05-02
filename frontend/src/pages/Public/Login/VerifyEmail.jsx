import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authApi, getErrorMessage } from '../../../services/api';
import styles from './Login.module.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is missing. Please register again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.verifyEmail({ email, token: otp });
      setSuccess('Email verified successfully! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (apiError) {
      setError(getErrorMessage(apiError, 'Invalid or expired OTP code.'));
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
        <h1 className={styles.title}>Verify your account</h1>
        <p className={styles.subtitle}>
          We've sent a 6-digit code to <strong>{email}</strong>.
        </p>

        {success ? (
          <div className={styles.successBox}>
             <ShieldCheck size={48} color="#10b981" />
             <p>{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Enter 6-digit OTP</label>
              <input
                type="text"
                placeholder="000000"
                maxLength="6"
                className={styles.otpInput}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
            </button>
          </form>
        )}

        <p className={styles.footer}>
          Didn't get it? <Link to="/register" className={styles.link}>Try again</Link> or <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
