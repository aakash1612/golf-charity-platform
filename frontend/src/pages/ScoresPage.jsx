import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, X, Target, AlertCircle, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

const today = () => new Date().toISOString().split('T')[0];

function ScoreRow({ score, index, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(score.value);
  const [date, setDate] = useState(score.date?.split('T')[0] || today());
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (val < 1 || val > 45) return alert('Score must be 1–45');
    setSaving(true);
    await onEdit(index, val, date);
    setEditing(false); setSaving(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: index === 0 ? 'var(--accent)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: index === 0 ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
        {index + 1}
      </div>

      {editing ? (
        <>
          <input type="number" min="1" max="45" value={val} onChange={e => setVal(Number(e.target.value))}
            className="form-input" style={{ width: 80 }} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="form-input" style={{ flex: 1 }} max={today()} />
          <button className="btn btn-primary btn-sm btn-icon" onClick={save} disabled={saving}>
            <Check size={15} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditing(false)}>
            <X size={15} />
          </button>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{score.value}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 6 }}>pts Stableford</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {new Date(score.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          {index === 0 && <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>Latest</span>}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditing(true)} title="Edit">
            <Pencil size={14} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onDelete(index)} title="Delete"
            style={{ color: 'var(--danger)' }}>
            <Trash2 size={14} />
          </button>
        </>
      )}
    </div>
  );
}

export default function ScoresPage() {
  const { user } = useAuth();
  const isSubscribed = user?.subscription?.status === 'active';
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newVal, setNewVal] = useState('');
  const [newDate, setNewDate] = useState(today());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/scores/mine');
      setScores(data.scores);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (isSubscribed) load(); else setLoading(false); }, [isSubscribed]);

  const addScore = async () => {
    setError('');
    const v = Number(newVal);
    if (!v || v < 1 || v > 45) { setError('Score must be between 1 and 45'); return; }
    if (!newDate) { setError('Please select a date'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/scores', { value: v, date: newDate });
      setScores(data.scores);
      setAdding(false); setNewVal(''); setNewDate(today());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add score');
    } finally { setSaving(false); }
  };

  const editScore = async (index, value, date) => {
    try {
      const { data } = await api.put(`/scores/${index}`, { value: Number(value), date });
      setScores(data.scores);
    } catch (err) { alert(err.response?.data?.message || 'Failed to update'); }
  };

  const deleteScore = async (index) => {
    if (!confirm('Delete this score?')) return;
    try {
      const { data } = await api.delete(`/scores/${index}`);
      setScores(data.scores);
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - var(--nav-height))', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Scores</h1>
              {isSubscribed && scores.length < 5 && !adding && (
                <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                  <Plus size={16} /> Add Score
                </button>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
              Your last 5 Stableford scores — newest first. A new score automatically replaces the oldest.
            </p>

            {!isSubscribed ? (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ marginBottom: 8 }}>Subscription Required</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>You need an active subscription to track scores and enter draws.</p>
                <Link to="/pricing" className="btn btn-primary">View Plans</Link>
              </div>
            ) : (
              <>
                {/* Info banner */}
                <div className="alert alert-info" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.875rem' }}>
                    Your 5 most recent scores are used as your draw entries each month.
                    Score range: <strong>1–45 pts</strong> (Stableford format).
                  </span>
                </div>

                <div className="card">
                  {/* Add form */}
                  {adding && (
                    <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 10, marginBottom: 20, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Add New Score</h3>
                      {error && <div className="alert alert-error">{error}</div>}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: '0 0 100px' }}>
                          <label className="form-label">Score (1–45)</label>
                          <input className="form-input" type="number" min="1" max="45"
                            placeholder="e.g. 32" value={newVal} onChange={e => setNewVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addScore()} autoFocus />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Date played</label>
                          <input className="form-input" type="date" value={newDate}
                            onChange={e => setNewDate(e.target.value)} max={today()} />
                        </div>
                        <button className="btn btn-primary" onClick={addScore} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Score'}
                        </button>
                        <button className="btn btn-ghost" onClick={() => { setAdding(false); setError(''); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Score list */}
                  {loading
                    ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    : scores.length === 0
                      ? (
                        <div className="empty-state">
                          <Target size={40} />
                          <h3>No scores recorded yet</h3>
                          <p>Add your first score to start entering the monthly draw.</p>
                          {!adding && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setAdding(true)}>
                            <Plus size={15} /> Add First Score
                          </button>}
                        </div>
                      )
                      : scores.map((s, i) => (
                          <ScoreRow key={i} score={s} index={i} onEdit={editScore} onDelete={deleteScore} />
                        ))
                  }

                  {/* Footer info */}
                  {scores.length > 0 && (
                    <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {scores.length}/5 scores stored
                      </span>
                      {scores.length < 5 && !adding && (
                        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                          <Plus size={14} /> Add Score
                        </button>
                      )}
                      {scores.length === 5 && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Full — next score replaces the oldest
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}