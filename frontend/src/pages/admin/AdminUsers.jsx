import { useEffect, useState } from 'react';
import { Search, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS = { active: 'success', inactive: 'gray', cancelled: 'danger', lapsed: 'warning' };

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscription?.status || 'inactive',
  });
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    api.get(`/admin/users/${user._id}`)
      .then(r => setScores(r.data.scores || []))
      .finally(() => setLoadingScores(false));
  }, [user._id]);

  const saveUser = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${user._id}`, form);
      onSave();
      onClose();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const saveScores = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${user._id}/scores`, { scores });
      alert('Scores updated');
    } catch (err) { alert(err.response?.data?.message || 'Failed to save scores'); }
    finally { setSaving(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>Profile</button>
          <button className={`tab ${tab === 'scores' ? 'active' : ''}`} onClick={() => setTab('scores')}>Scores</button>
        </div>

        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={form.role} onChange={set('role')}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subscription Status</label>
                <select className="form-input form-select" value={form.subscriptionStatus} onChange={set('subscriptionStatus')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="lapsed">Lapsed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={saveUser} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {tab === 'scores' && (
          <div>
            {loadingScores ? <div className="spinner" style={{ margin: '20px auto' }} /> : (
              <>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Edit user's Stableford scores (1–45). Max 5 scores.
                </p>
                {scores.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                    <input type="number" min="1" max="45" className="form-input" style={{ width: 80 }}
                      value={s.value}
                      onChange={e => setScores(prev => prev.map((sc, idx) => idx === i ? { ...sc, value: Number(e.target.value) } : sc))} />
                    <input type="date" className="form-input"
                      value={s.date?.split('T')[0] || ''}
                      onChange={e => setScores(prev => prev.map((sc, idx) => idx === i ? { ...sc, date: e.target.value } : sc))} />
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                      onClick={() => setScores(prev => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {scores.length < 5 && (
                  <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }}
                    onClick={() => setScores(prev => [...prev, { value: 20, date: new Date().toISOString().split('T')[0] }])}>
                    + Add Score
                  </button>
                )}
                <button className="btn btn-primary" onClick={saveScores} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Scores'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: 15, search, status: statusFilter } });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search, statusFilter]);

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>User Management</h1>
        <p>{total} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search name or email..." style={{ paddingLeft: 34 }}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-input form-select" style={{ width: 'auto' }}
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <>
          <div className="table-wrapper" style={{ marginBottom: 20 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Charity %</th>
                  <th>Total Won</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{u.subscription?.plan || '—'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[u.subscription?.status] || 'gray'}`}>
                        {u.subscription?.status || 'inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{u.charityContributionPercent}%</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>£{u.totalWon?.toFixed(2) || '0.00'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => setEditUser(u)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Delete"
                          style={{ color: 'var(--danger)' }} onClick={() => deleteUser(u._id, u.name)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={load} />}
    </div>
  );
}