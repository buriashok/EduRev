import { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  ShieldAlert, 
  Trash2, 
  FileUp, 
  Search, 
  UserPlus, 
  CheckSquare,
  Square
} from 'lucide-react';
import { adminApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ROLE_OPTIONS } from '../../utils/roles';
import styles from './Admin.module.css';

const UserManagement = () => {
  const { assumeSession, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [busyUserId, setBusyUserId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setBusyUserId(userId);
    setMessage({ type: '', text: '' });
    try {
      const response = await adminApi.updateUser(userId, { role });
      setUsers(curr => curr.map(u => u.id === userId ? response.data : u));
      setMessage({ type: 'success', text: 'Role updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update role.') });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleImpersonate = async (userId) => {
    setBusyUserId(userId);
    setMessage({ type: '', text: '' });
    try {
      const response = await adminApi.impersonate(userId);
      await assumeSession(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Impersonation failed.') });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleActiveToggle = async (targetUser) => {
    setBusyUserId(targetUser.id);
    setMessage({ type: '', text: '' });
    try {
      const response = await adminApi.updateUser(targetUser.id, { active: !targetUser.isActive });
      setUsers(curr => curr.map(u => u.id === targetUser.id ? response.data : u));
      setMessage({ type: 'success', text: response.data.isActive ? 'User unfrozen.' : 'User frozen.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update account status.') });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleForceLogout = async (userId) => {
    setBusyUserId(userId);
    setMessage({ type: '', text: '' });
    try {
      await adminApi.forceLogout(userId);
      setMessage({ type: 'success', text: 'All sessions revoked.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to force logout.') });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDelete = async (targetUser) => {
    if (!window.confirm(`Permanently delete ${targetUser.email}?`)) return;

    setBusyUserId(targetUser.id);
    setMessage({ type: '', text: '' });
    try {
      await adminApi.deleteUser(targetUser.id);
      setUsers(curr => curr.filter(u => u.id !== targetUser.id));
      setSelectedUsers(curr => curr.filter(id => id !== targetUser.id));
      setMessage({ type: 'success', text: 'User deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to delete user.') });
    } finally {
      setBusyUserId(null);
    }
  };

  const runBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    setMessage({ type: '', text: '' });
    const selected = users.filter(u => selectedUsers.includes(u.id));

    try {
      for (const targetUser of selected) {
        setBusyUserId(targetUser.id);
        if (action === 'freeze') {
          await adminApi.updateUser(targetUser.id, { active: false });
        } else if (action === 'logout') {
          await adminApi.forceLogout(targetUser.id);
        } else if (action === 'delete') {
          await adminApi.deleteUser(targetUser.id);
        }
      }
      await fetchUsers();
      setSelectedUsers([]);
      setMessage({ type: 'success', text: 'Bulk action completed.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Bulk action failed.') });
      await fetchUsers();
    } finally {
      setBusyUserId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedUsers(curr => 
      curr.includes(id) ? curr.filter(u => u !== id) : [...curr, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <div>
          <h1>User Management</h1>
          <p>Control platform access, roles, and security for all users.</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn-secondary"><FileUp size={18} /> Import</button>
          <button className="btn-primary"><UserPlus size={18} /> Add User</button>
        </div>
      </header>

      {/* Toolbar */}
      <div className={`glass-panel ${styles.toolbar}`}>
        <div className={styles.search}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className={`${styles.bulkActions} animate-fade-in`}>
            <span>{selectedUsers.length} selected</span>
            <button className={styles.bulkBtn} onClick={() => runBulkAction('freeze')}><ShieldAlert size={16} /> Freeze</button>
            <button className={styles.bulkBtn} onClick={() => runBulkAction('logout')}><LogOut size={16} /> Logout</button>
            <button className={`${styles.bulkBtn} ${styles.danger}`} onClick={() => runBulkAction('delete')}><Trash2 size={16} /> Delete</button>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`${styles.notice} ${message.type === 'error' ? styles.error : styles.success}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className={`glass-panel ${styles.tableWrapper}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th width="40">
                  <button onClick={toggleSelectAll} className={styles.checkBtn}>
                    {selectedUsers.length === filteredUsers.length ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Security</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? styles.selectedRow : ''}>
                  <td>
                    <button onClick={() => toggleSelect(user.id)} className={styles.checkBtn}>
                      {selectedUsers.includes(user.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>
                  </td>
                  <td>
                    <div className={styles.userInfo}>
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <select 
                      className={styles.roleSelect}
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      disabled={busyUserId === user.id}
                    >
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.status} ${user.isActive ? styles.active : styles.frozen}`}>
                      {user.isActive ? 'Active' : 'Frozen'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.securityIcons}>
                      <button onClick={() => handleImpersonate(user.id)} title="Impersonate" disabled={busyUserId === user.id || user.id === currentUser?.id}><LogIn size={16} /></button>
                      <button onClick={() => handleForceLogout(user.id)} title="Force Logout" disabled={busyUserId === user.id}><LogOut size={16} /></button>
                      <button onClick={() => handleActiveToggle(user)} title={user.isActive ? 'Freeze' : 'Unfreeze'} disabled={busyUserId === user.id}><ShieldAlert size={16} /></button>
                    </div>
                  </td>
                  <td>
                    <button className={styles.moreBtn} onClick={() => handleDelete(user)} title="Delete user" disabled={busyUserId === user.id || user.id === currentUser?.id}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
