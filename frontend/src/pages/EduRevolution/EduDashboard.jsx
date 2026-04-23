import React, { useState, useEffect } from 'react';
import { FileText, Award, Users, Plus, QrCode } from 'lucide-react';
import { eduApi } from '../../services/api';
import styles from './EduDashboard.module.css';

const EduDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, certRes] = await Promise.all([
          eduApi.getRequests(),
          eduApi.getCertificates()
        ]);
        setRequests(reqRes.data);
        setCertificates(certRes.data);
      } catch (error) {
        console.error('Failed to fetch Edu data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className={`container ${styles.eduPage}`}>
      <h1 className={styles.title}>EDU-Revolution Dashboard</h1>
      
      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <FileText style={{color: 'var(--color-primary)'}} /> My Requests
            </h2>
            <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Plus size={16} /> New Request
            </button>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {requests.length === 0 ? (
              <p style={{color: 'var(--color-text-muted)', textAlign: 'center'}}>No requests found.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className={styles.requestItem}>
                  <div>
                    <div style={{fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)'}}>{req.requestType}</div>
                    <div style={{fontSize: '0.95rem'}}>{req.description}</div>
                  </div>
                  <span className={`${styles.status} ${req.status === 'APPROVED' ? styles.approved : styles.pending}`}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem'}}>
            <Award style={{color: 'var(--color-secondary)'}} /> Digital Certificates
          </h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {certificates.length === 0 ? (
              <p style={{color: 'var(--color-text-muted)', textAlign: 'center'}}>No certificates earned yet.</p>
            ) : (
              certificates.map(cert => (
                <div key={cert.id} className={styles.certCard}>
                  <div className={styles.qrPlaceholder}>
                    {cert.qrCodeBase64 ? (
                      <img src={`data:image/png;base64,${cert.qrCodeBase64}`} alt="QR" style={{width: '100%'}} />
                    ) : (
                      <QrCode size={40} color="#000" />
                    )}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '700'}}>{cert.courseName}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Verified ID: {cert.certificateId}</div>
                  </div>
                  <button className="btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>View</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`glass-panel ${styles.card}`} style={{gridColumn: 'span 2'}}>
           <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
              <Users style={{color: 'var(--color-accent)'}} /> Referral Program
            </h2>
            <p style={{color: 'var(--color-text-muted)', marginBottom: '1.5rem'}}>
              Invite your friends to join EDU-Revolution and earn credits for every successful referral.
            </p>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)'}}>
              <input 
                type="text" 
                value="https://edurev.com/join/REF-9921" 
                readOnly 
                style={{background: 'none', border: 'none', color: 'white', flex: 1, outline: 'none'}}
              />
              <button className="btn-secondary" style={{padding: '0.4rem 1rem'}}>Copy Link</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EduDashboard;
