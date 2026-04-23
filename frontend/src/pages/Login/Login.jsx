import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.data.accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={`glass-panel ${styles.loginCard} animate-fade-in`}>
        <div style={{marginBottom: '2rem'}}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div style={{position: 'relative'}}>
              <Mail style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                type="email" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div style={{position: 'relative'}}>
              <Lock style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                type="password" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
