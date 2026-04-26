import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock3, CalendarDays, ExternalLink, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { getErrorMessage, liveClassApi } from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import styles from './LiveClassDetail.module.css';

const LiveClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liveClass, setLiveClass] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, regRes] = await Promise.all([
          liveClassApi.join(id), // Join also returns metadata
          liveClassApi.getRegistrations(id)
        ]);
        setLiveClass(classRes.data);
        setRegistrations(regRes.data);
        if (classRes.data.recordingUrl) setRecordingUrl(classRes.data.recordingUrl);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load class details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleComplete = async () => {
    if (!recordingUrl) {
      if (!window.confirm('Mark as completed without a recording URL?')) return;
    }
    try {
      await liveClassApi.complete(id, recordingUrl);
      setLiveClass(curr => ({ ...curr, isCompleted: true, recordingUrl }));
      setMessage('Class finalized successfully.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to complete class.'));
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '80vh' }}><div className="spinner" /></div>;

  return (
    <DashboardLayout title="Live Class Management">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1>{liveClass?.title}</h1>
            <p className={styles.subtitle}>Manage your session, view registered students, and finalize recordings.</p>
          </div>
          <div className={styles.headerActions}>
             <button className="btn-secondary" onClick={() => navigate('/live-classes')}>Back to List</button>
          </div>
        </div>

        {message && <div className={styles.messagePanel}>{message}</div>}

        <div className={styles.grid}>
          <div className={styles.main}>
            <div className={`glass-panel ${styles.infoCard}`}>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <CalendarDays size={18} />
                  <span>{new Date(liveClass?.startsAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock3 size={18} />
                  <span>{new Date(liveClass?.startsAt).toLocaleTimeString()}</span>
                </div>
                <div className={styles.infoItem}>
                  <Users size={18} />
                  <span>{registrations.length} Students Registered</span>
                </div>
              </div>

              <div className={styles.linkBox}>
                <strong>Session Link:</strong>
                <a href={liveClass?.meetingLink} target="_blank" rel="noopener noreferrer">
                  {liveClass?.meetingLink} <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className={`glass-panel ${styles.managementCard}`}>
              <h2>Finalize Session</h2>
              <p>Once the live session is over, mark it as completed and provide a recording link for students.</p>
              
              <div className={styles.formGroup}>
                <label htmlFor="recording">Recording URL (YouTube/Vimeo/etc.)</label>
                <div className={styles.inputWithIcon}>
                  <PlayCircle size={18} />
                  <input 
                    id="recording"
                    type="url" 
                    placeholder="https://..." 
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                  />
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={handleComplete}
                disabled={liveClass?.isCompleted}
              >
                {liveClass?.isCompleted ? <><CheckCircle2 size={16} /> Session Finalized</> : 'Finalize & Send Notifications'}
              </button>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={`glass-panel ${styles.registrationCard}`}>
              <h3>Registered Students</h3>
              <div className={styles.studentList}>
                {registrations.length === 0 ? (
                  <div className={styles.empty}>No students registered yet.</div>
                ) : (
                  registrations.map(user => (
                    <div key={user.id} className={styles.studentItem}>
                      <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`} alt="" />
                      <div>
                        <strong>{user.firstName} {user.lastName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveClassDetail;
