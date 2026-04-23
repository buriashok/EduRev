import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };
      await authApi.register(payload);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={`glass-panel ${styles.registerCard} animate-fade-in`}>
        <div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join the EDU-Revolution today</p>
        </div>

        <form className={styles.grid} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <div style={{position: 'relative'}}>
              <User style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                name="firstName"
                type="text" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <div style={{position: 'relative'}}>
              <User style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                name="lastName"
                type="text" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Email Address</label>
            <div style={{position: 'relative'}}>
              <Mail style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                name="email"
                type="email" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Password</label>
            <div style={{position: 'relative'}}>
              <Lock style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <input 
                name="password"
                type="password" 
                className={styles.input} 
                style={{paddingLeft: '40px', width: '100%'}}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Account Type</label>
            <div style={{position: 'relative'}}>
              <UserCircle style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} size={18} />
              <select 
                name="role"
                className={styles.select}
                style={{paddingLeft: '40px', width: '100%'}}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
              </select>
            </div>
          </div>

          <button type="submit" className={`btn-primary ${styles.fullWidth}`} disabled={isLoading} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: 'var(--space-md)'}}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
