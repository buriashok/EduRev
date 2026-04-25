import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, Download, Share2, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { certificateApi } from '../../services/api';
import styles from './Certificate.module.css';

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await certificateApi.getById(id);
        setCertificate(res.data);
      } catch (error) {
        console.error('Failed to load certificate', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex-center" style={{ minHeight: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
    </div>
  );

  if (!certificate) return (
    <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>Certificate not found</h1>
      <button className="btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className={styles.actions}>
          <button className="btn-secondary" onClick={handlePrint}>
            <Download size={18} /> Download PDF
          </button>
          <button className="btn-primary">
            <Share2 size={18} /> Share
          </button>
        </div>
      </header>

      <div className={styles.certificateWrapper} id="certificate-print">
        <div className={styles.certificate}>
          <div className={styles.borderOuter} />
          <div className={styles.borderInner} />
          
          <div className={styles.content}>
            <div className={styles.headerLogo}>
              <div className={styles.logoMark}>
                 <Award size={40} />
              </div>
              <div className={styles.brand}>
                <strong>EduRev</strong>
                <span>Skill-first Learning</span>
              </div>
            </div>

            <div className={styles.title}>
              <h1>Certificate of Completion</h1>
              <p>This is to certify that</p>
            </div>

            <div className={styles.studentName}>
              {certificate.user.firstName} {certificate.user.lastName}
            </div>

            <div className={styles.description}>
              <p>has successfully completed the course</p>
              <h3>{certificate.course.title}</h3>
              <p>with exceptional performance and dedication to mastering the subject matter.</p>
            </div>

            <div className={styles.footer}>
              <div className={styles.signature}>
                <div className={styles.sigLine} />
                <p>Course Instructor</p>
                <strong>{certificate.course.instructor.firstName} {certificate.course.instructor.lastName}</strong>
              </div>

              <div className={styles.seal}>
                <ShieldCheck size={64} color="#d97706" />
                <span>Verified</span>
              </div>

              <div className={styles.date}>
                <p>Issued on</p>
                <strong>{new Date(certificate.issuedAt).toLocaleDateString()}</strong>
              </div>
            </div>

            <div className={styles.verify}>
              <span>Certificate ID: {certificate.uniqueId}</span>
              <span>Verify at edurev.local/verify</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
