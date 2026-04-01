import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, X, Heart } from 'lucide-react';
import api from '../../utils/api';

const CATEGORIES = ['health', 'education', 'environment', 'sport', 'community', 'other'];

const EMPTY_FORM = { name: '', description: '', logo: '', website: '', category: 'other', isFeatured: false };

function CharityModal({ charity, onClose, onSave }) {
  const isEdit = !!charity?._id;
  const [form, setForm] = useState(charity || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async () => {
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.description.trim()) return setError('Description is required');
    setSaving(true);
    try {
      if (isEdit) await api.put(`/charities/${charity._id}`, form);
      else await api.post('/charities', form);
      onSave();
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Charity' : 'Add Charity'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Charity Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Cancer Research UK" />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={set('description')}
              placeholder="What does this charity do?" style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input form-select" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Logo URL</label>
              <input className="form-input" value={form.logo} onChange={set('logo')} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input className="form-input" value={form.website} onChange={set('website')} placeholder="https://..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} style={{ width: 16, height: 16 }} />
            Feature this charity on the homepage
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Charity'}
            </button>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | charity object

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/charities');
      setCharities(data.charities);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deactivate = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from users.`)) return;
    try {
      await api.delete(`/charities/${id}`);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const toggleFeatured = async (charity) => {
    try {
      await api.put(`/charities/${charity._id}`, { isFeatured: !charity.isFeatured });
      load();
    } catch (err) { alert('Failed to update'); }
  };

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Charity Management</h1>
          <p>{charities.length} active charities</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Charity
        </button>
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : charities.length === 0
          ? (
            <div className="empty-state">
              <Heart size={40} />
              <h3>No charities yet</h3>
              <p>Add your first charity to get started.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal('add')}>
                <Plus size={15} /> Add First Charity
              </button>
            </div>
          )
          : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Total Raised</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {c.logo && <img src={c.logo} alt={c.name} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />}
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{c.website}</a>}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{c.category}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>£{c.totalReceived?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: c.isFeatured ? '#f39c12' : 'var(--text-muted)' }}
                          onClick={() => toggleFeatured(c)} title={c.isFeatured ? 'Remove from featured' : 'Set as featured'}>
                          <Star size={16} fill={c.isFeatured ? '#f39c12' : 'none'} />
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(c)}>
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                            onClick={() => deactivate(c._id, c.name)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }

      {modal && (
        <CharityModal
          charity={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  );
}