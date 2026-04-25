import Sidebar from '../Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
