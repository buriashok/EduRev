import { useEffect, useMemo, useState } from 'react';
import { FileUp, LogIn, LogOut, ShieldAlert, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { adminApi, analyticsApi, getErrorMessage } from '../../services/api';
import styles from './AdminDashboard.module.css';

const roleOptions = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

const AdminDashboard = () => {
  const { assumeSession } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    frozenAccounts: 0,
  });
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState(null);

  const refreshAdminData = async () => {
    const [usersResponse, logsResponse, statsResponse] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getAuditLogs(),
      analyticsApi.getAdmin(),
    ]);

    setUsers(usersResponse.data);
    setLogs(logsResponse.data);
    setStats(statsResponse.data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshAdminData();
      } catch (error) {
        setMessage(getErrorMessage(error, 'Failed to load admin data.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: 'Total Users', value: stats.totalUsers ?? users.length },
      { label: 'Active Sessions', value: stats.activeSessions ?? 0 },
      { label: 'Frozen Accounts', value: stats.frozenAccounts ?? users.filter((user) => !user.isActive).length },
    ],
    [stats, users],
  );

  const handleRoleChange = async (userId, role) => {
    setBusyUserId(userId);
    setMessage('');
    try {
      const response = await adminApi.updateUser(userId, { role });
      setUsers((current) => current.map((user) => (user.id === userId ? response.data : user)));
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update role.'));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleFreezeToggle = async (user) => {
    setBusyUserId(user.id);
    setMessage('');
    try {
      const response = await adminApi.updateUser(user.id, { active: !user.isActive });
      setUsers((current) => current.map((item) => (item.id === user.id ? response.data : item)));
      await refreshAdminData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update account status.'));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleForceLogout = async (userId) => {
    setBusyUserId(userId);
    setMessage('');
    try {
      await adminApi.forceLogout(userId);
      setMessage('All sessions revoked for the selected user.');
      await refreshAdminData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to revoke sessions.'));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleImpersonate = async (userId) => {
    setBusyUserId(userId);
    setMessage('');
    try {
      const response = await adminApi.impersonate(userId);
      await assumeSession(response.data);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to impersonate user.'));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    setBusyUserId(userId);
    setMessage('');
    try {
      await adminApi.deleteUser(userId);
      setUsers((current) => current.filter((user) => user.id !== userId));
      setMessage('User permanently deleted.');
      await refreshAdminData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete user.'));
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCsvFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setCsvContent(text);
  };

  const handleImport = async () => {
    if (!csvContent.trim()) {
      setMessage('Select a CSV file or paste CSV content first.');
      return;
    }

    setMessage('');
    try {
      const response = await adminApi.importUsers(csvContent);
      setImportResult(response.data);
      await refreshAdminData();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to import users.'));
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Admin Management Panel</h1>
            <p className={styles.subtitle}>Manage users, security activity, and bulk onboarding from one place.</p>
          </div>
          <label className={styles.importButton}>
            <FileUp size={16} />
            Upload CSV
            <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} hidden />
          </label>
        </div>

        {message && <div className={styles.notice}>{message}</div>}

        <div className={styles.stats}>
          {summaryCards.map((card) => (
            <div key={card.label} className="glass-card">
              <h3>{card.label}</h3>
              <p>{card.value}</p>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>User Management</h2>
            <button className="btn-primary" onClick={handleImport}>Import Users</button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{`${user.firstName} ${user.lastName}`.trim()}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={styles.roleSelect}
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        disabled={busyUserId === user.id}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={user.isActive ? styles.statusActive : styles.statusFrozen}>
                        {user.isActive ? 'ACTIVE' : 'FROZEN'}
                      </span>
                    </td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                    <td className={styles.actions}>
                      <button onClick={() => handleImpersonate(user.id)} title="Impersonate" disabled={busyUserId === user.id}>
                        <LogIn size={16} />
                      </button>
                      <button onClick={() => handleForceLogout(user.id)} title="Force logout" disabled={busyUserId === user.id}>
                        <LogOut size={16} />
                      </button>
                      <button onClick={() => handleFreezeToggle(user)} title={user.isActive ? 'Freeze' : 'Unfreeze'} disabled={busyUserId === user.id}>
                        <ShieldAlert size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} title="Delete user" disabled={busyUserId === user.id} className={styles.deleteBtn}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.importPanel}>
            <textarea
              value={csvContent}
              onChange={(event) => setCsvContent(event.target.value)}
              placeholder="Paste CSV here: firstName,lastName,email,role"
              rows={5}
            />
            {importResult && (
              <div className={styles.importResult}>
                <strong>{importResult.createdCount} users imported.</strong>
                {!!importResult.skippedRows?.length && <p>Skipped: {importResult.skippedRows.join(' | ')}</p>}
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>System Audit Logs</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.userId ?? '-'}</td>
                    <td>{log.action}</td>
                    <td>{log.targetId || '-'}</td>
                    <td>{log.ipAddress || '-'}</td>
                    <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <p className={styles.subtitle}>Loading admin data...</p>}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
