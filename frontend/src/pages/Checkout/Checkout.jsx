import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { paymentApi, getErrorMessage } from '../../services/api';
import styles from './Checkout.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ course }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!course) return;

    const createIntent = async () => {
      try {
        const response = await paymentApi.createIntent(course.id);
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'Failed to initialize payment.'));
      }
    };

    createIntent();
  }, [course]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);

    if (clientSecret.startsWith('mock_secret')) {
      // Mock success for testing without Stripe
      console.log('MOCK MODE: Simulating payment success...');
      try {
        await paymentApi.confirm(course.id, 'mock_pi_' + Date.now());
        navigate('/dashboard', { state: { message: 'Enrollment successful (MOCK)!' } });
      } catch (confirmError) {
        setErrorMessage(getErrorMessage(confirmError, 'Enrollment failed.'));
        setIsProcessing(false);
      }
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        // We still call confirm to provide immediate feedback, but the webhook is the source of truth
        await paymentApi.confirm(course.id, paymentIntent.id);
        navigate('/dashboard', { 
          state: { 
            message: 'Payment successful! Your enrollment is being finalized and will appear in your dashboard shortly.' 
          } 
        });
      } catch (confirmError) {
        // Even if this fails, the webhook might still succeed
        navigate('/dashboard', { 
          state: { 
            message: 'Payment received. We are processing your enrollment. Please check back in a few minutes.' 
          } 
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.cardInputWrapper}>
        <div className={styles.inputLabel}>
          <CreditCard size={18} />
          <span>Card Details</span>
        </div>
        <div className={styles.stripeElement}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#fa755a' },
            },
          }} />
        </div>
      </div>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <button type="submit" className="btn-primary" disabled={!stripe || isProcessing || !clientSecret}>
        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${course.price.toLocaleString('en-IN')}`}
      </button>

      <div className={styles.secureBadge}>
        <ShieldCheck size={14} /> 
        Payments secured by Stripe
      </div>
    </form>
  );
};

const Checkout = () => {
  const location = useLocation();
  const course = location.state?.course;

  if (!course) {
    return (
      <div className={styles.checkoutPage}>
        <div className={`glass-panel ${styles.checkoutCard}`}>
          <h2>No course selected</h2>
          <p>Please select a course to enroll.</p>
          <button className="btn-primary" onClick={() => window.history.back()}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={`glass-panel ${styles.checkoutCard} animate-fade-in`}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Secure Checkout</h1>
        </header>
        
        <div className={styles.courseSummary}>
          <div className={styles.badge}>{course.difficulty}</div>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>

        <div className={styles.orderSummary}>
          <div className={styles.item}>
            <span>Course Price</span>
            <span>₹{course.price.toLocaleString('en-IN')}</span>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <span>₹{course.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm course={course} />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
