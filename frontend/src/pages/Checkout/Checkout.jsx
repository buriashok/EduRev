import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import styles from './Checkout.module.css';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className={styles.checkoutPage}>
        <div className={`glass-panel ${styles.checkoutCard} animate-fade-in`} style={{textAlign: 'center'}}>
          <ShieldCheck size={64} style={{color: '#10b981', margin: '0 auto'}} />
          <h1 className={styles.title}>Payment Successful!</h1>
          <p style={{color: 'var(--color-text-muted)'}}>Your enrollment is now active. You can start the course immediately.</p>
          <button className="btn-primary" onClick={() => window.history.back()}>Back to Courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={`glass-panel ${styles.checkoutCard} animate-fade-in`}>
        <h1 className={styles.title}>Secure Checkout</h1>
        
        <div className={styles.orderSummary}>
          <div className={styles.item}>
            <span>Full Stack Java Development</span>
            <span>$49.99</span>
          </div>
          <div className={styles.item}>
            <span>Tax</span>
            <span>$0.00</span>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <span>$49.99</span>
          </div>
        </div>

        <form onSubmit={handlePayment} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)'}}>
              <CreditCard size={20} />
              <span>Card Details (Mock Input)</span>
            </div>
            <input 
              type="text" 
              placeholder="4242 4242 4242 4242" 
              style={{background: 'none', border: 'none', color: 'white', width: '100%', marginTop: '0.5rem', outline: 'none', fontSize: '1rem'}} 
              disabled
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isProcessing} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem'}}>
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Complete Purchase'}
          </button>
          
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>
            <ShieldCheck size={14} /> Payments secured by Stripe
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
