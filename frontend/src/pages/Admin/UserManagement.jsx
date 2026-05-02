import { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  ShieldAlert, 
  Trash2, 
  FileUp, 
  Search, 
  UserPlus, 
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';
import { adminApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

const roleOptions = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

const UserManagement = () => {
  const { assumeSession } = useAuth();
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setBusyUserId(userId);
    try {
      await adminApi.updateUser(userId, { role });
      setUsers(curr => curr.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update role.' });
    } finally {
      setBusyUserId(null);
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      const response = await adminApi.impersonate(userId);
      await assumeSession(response.data);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Impersonation failed.') });
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
            <button className={styles.bulkBtn}><ShieldAlert size={16} /> Freeze</button>
            <button className={styles.bulkBtn}><LogOut size={16} /> Logout</button>
            <button className={`${styles.bulkBtn} ${styles.danger}`}><Trash2 size={16} /> Delete</button>
          </div>
        )}
      </div>

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
                      {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.status} ${user.isActive ? styles.active : styles.frozen}`}>
                      {user.isActive ? 'Active' : 'Frozen'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.securityIcons}>
                      <button onClick={() => handleImpersonate(user.id)} title="Impersonate"><LogIn size={16} /></button>
                      <button title="Force Logout"><LogOut size={16} /></button>
                      <button title="Toggle Lock"><ShieldAlert size={16} /></button>
                    </div>
                  </td>
                  <td>
                    <button className={styles.moreBtn}><MoreVertical size={16} /></button>
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
