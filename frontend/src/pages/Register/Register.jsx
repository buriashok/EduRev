import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    goals: '',
    agreedToTerms: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = () => {
    if (step === 1 && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setStep((value) => value + 1);
  };

  const previousStep = () => {
    setError('');
    setStep((value) => value - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (step < 3) {
      nextStep();
      return;
    }

    if (!formData.agreedToTerms) {
      setError('Please accept the terms to continue.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (!result.success) {
      setError(result.message);
    } else {
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.panelContent}>
          <div className={styles.badge}>Focused onboarding</div>
          <h1>Start learning with a cleaner workflow</h1>
          <p>We keep setup short so learners can move into courses, live classes, and progress tracking faster.</p>

          <div className={styles.benefits}>
            <div><CheckCircle2 size={18} /> Guided role-based dashboard</div>
            <div><CheckCircle2 size={18} /> Compact course discovery</div>
            <div><CheckCircle2 size={18} /> Live session and community access</div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon} />
            <span>EduRev</span>
          </div>
          <Link to="/" className={styles.backLink}><ArrowLeft size={16} /> Back home</Link>
        </div>

        <div className={styles.formContainer}>
          <p className={styles.stepIndicator}>Step {step} of 3</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          <h2 className={styles.formTitle}>Create your account</h2>

          <div className={styles.roleSelector}>
            {['STUDENT', 'INSTRUCTOR'].map((role) => (
              <label key={role} className={`${styles.roleOption} ${formData.role === role ? styles.roleActive : ''}`}>
                <input type="radio" name="role" value={role} checked={formData.role === role} onChange={handleChange} />
                <span>{role === 'STUDENT' ? 'Student' : 'Instructor'}</span>
                <div className={styles.radioCircle} />
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {step === 1 && (
              <>
                <div className={styles.doubleGrid}>
                  <div className={styles.inputGroup}>
                    <label>First name</label>
                    <div className={styles.inputWrapper}>
                      <input type="text" name="firstName" placeholder="Ava" value={formData.firstName} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Last name</label>
                    <div className={styles.inputWrapper}>
                      <input type="text" name="lastName" placeholder="Stone" value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <div className={styles.inputWrapper}>
                    <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className={styles.doubleGrid}>
                  <div className={styles.inputGroup}>
                    <label>Password</label>
                    <div className={styles.inputWrapper}>
                      <input type="password" name="password" placeholder="At least 8 characters" value={formData.password} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm password</label>
                    <div className={styles.inputWrapper}>
                      <input type="password" name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className={styles.step2Content}>
                <p>What would you like to achieve first?</p>
                <textarea
                  name="goals"
                  placeholder="Tell us the skills, outcomes, or projects you want to focus on."
                  className={styles.textarea}
                  value={formData.goals}
                  onChange={handleChange}
                />
              </div>
            )}

            {step === 3 && (
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} required />
                  <span>I agree to the terms, privacy policy, and responsible use guidelines.</span>
                </label>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
            {notice && <p className={styles.success}>{notice}</p>}

            <div className={styles.actionRow}>
              {step > 1 && (
                <button type="button" className={styles.secondaryBtn} onClick={previousStep}>
                  Back
                </button>
              )}
              <button type="submit" className={styles.continueBtn} disabled={loading}>
                {loading ? 'Processing...' : step === 3 ? 'Create account' : 'Continue'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>

          <p className={styles.signinFooter}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
