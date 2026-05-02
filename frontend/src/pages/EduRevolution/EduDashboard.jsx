import { useState, useEffect } from 'react';
import { FileText, Award, Users, Plus, QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eduApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './EduDashboard.module.css';

const EduDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [newRequest, setNewRequest] = useState({ type: 'DUTY_LEAVE', description: '' });

  const fetchData = async () => {
    try {
      const requestCall = user?.role === 'ADMIN' ? eduApi.getAllRequests() : eduApi.getRequests();
      const [reqRes, certRes] = await Promise.all([
        requestCall,
        eduApi.getCertificates()
      ]);
      setRequests(reqRes.data);
      setCertificates(certRes.data);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to load EDU-Revolution data.'));
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await eduApi.submitRequest(newRequest);
      setNewRequest({ type: 'DUTY_LEAVE', description: '' });
      setShowForm(false);
      setMessage('Request submitted successfully.');
      fetchData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to submit request.'));
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await eduApi.updateRequestStatus(id, status);
      fetchData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update request.'));
    }
  };

  return (
    <div className={`container ${styles.eduPage}`}>
      <h1 className={styles.title}>EDU-Revolution Dashboard</h1>
      {message && <div className={styles.message}>{message}</div>}
      
      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <FileText style={{color: 'var(--color-primary)'}} /> {user?.role === 'ADMIN' ? 'All Requests' : 'My Requests'}
            </h2>
            {user?.role !== 'ADMIN' && (
            <button className="btn-secondary" onClick={() => setShowForm((open) => !open)} style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Plus size={16} /> New Request
            </button>
            )}
          </div>

          {showForm && (
            <form className={styles.requestForm} onSubmit={handleSubmit}>
              <select value={newRequest.type} onChange={(event) => setNewRequest({...newRequest, type: event.target.value})}>
                <option value="DUTY_LEAVE">Duty Leave</option>
                <option value="CREDIT_EARNING">Credit Earning</option>
                <option value="REFERRAL">Referral</option>
              </select>
              <textarea
                value={newRequest.description}
                onChange={(event) => setNewRequest({...newRequest, description: event.target.value})}
                placeholder="Describe your request"
                required
                rows={3}
              />
              <button className="btn-primary" type="submit">Submit Request</button>
            </form>
          )}
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {requests.length === 0 ? (
              <p style={{color: 'var(--color-text-muted)', textAlign: 'center'}}>No requests found.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className={styles.requestItem}>
                  <div>
                    <div style={{fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)'}}>{req.type}</div>
                    <div style={{fontSize: '0.95rem'}}>{req.description}</div>
                    {user?.role === 'ADMIN' && req.user && (
                      <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>{req.user.firstName} {req.user.lastName} · {req.user.email}</div>
                    )}
                  </div>
                  <div className={styles.requestActions}>
                    <span className={`${styles.status} ${req.status === 'APPROVED' ? styles.approved : req.status === 'REJECTED' ? styles.rejected : styles.pending}`}>
                      {req.status}
                    </span>
                    {user?.role === 'ADMIN' && req.status === 'PENDING' && (
                      <>
                        <button title="Approve" onClick={() => handleStatus(req.id, 'APPROVED')}><CheckCircle2 size={16} /></button>
                        <button title="Reject" onClick={() => handleStatus(req.id, 'REJECTED')}><XCircle size={16} /></button>
                      </>
                    )}
                  </div>
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
                    {cert.qrCodePath ? (
                      <img src={cert.qrCodePath} alt="QR" style={{width: '100%'}} />
                    ) : (
                      <QrCode size={40} color="#000" />
                    )}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '700'}}>{cert.course?.title}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Verified ID: {cert.uniqueId}</div>
                  </div>
                  <button className="btn-primary" onClick={() => navigate(`/certificate/${cert.id}`)} style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>View</button>
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
