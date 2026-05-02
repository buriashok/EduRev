import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CalendarDays, CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { certificateApi, getErrorMessage } from '../../../services/api';
import styles from './VerifyCertificate.module.css';

const VerifyCertificate = () => {
  const { uniqueId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await certificateApi.verify(uniqueId);
        setCertificate(response.data);
      } catch (error) {
        setMessage(getErrorMessage(error, 'Certificate could not be verified.'));
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [uniqueId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Loader2 className="animate-spin" size={44} />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className={styles.page}>
        <section className={styles.panel}>
          <XCircle size={52} className={styles.invalidIcon} />
          <h1>Certificate not found</h1>
          <p>{message}</p>
          <Link className="btn-primary" to="/">Return Home</Link>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.status}>
          <CheckCircle2 size={24} />
          Verified certificate
        </div>

        <div className={styles.hero}>
          <Award size={56} />
          <div>
            <h1>{certificate.studentName}</h1>
            <p>successfully completed</p>
            <h2>{certificate.courseTitle}</h2>
          </div>
        </div>

        <div className={styles.details}>
          <div>
            <CalendarDays size={18} />
            <span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Instructor: {certificate.instructorName}</span>
          </div>
        </div>

        <div className={styles.verifyBox}>
          {certificate.qrCodePath && <img src={certificate.qrCodePath} alt="Certificate verification QR code" />}
          <div>
            <span>Certificate ID</span>
            <strong>{certificate.uniqueId}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerifyCertificate;
