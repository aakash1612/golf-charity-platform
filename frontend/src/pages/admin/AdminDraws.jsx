import { useEffect, useState } from 'react';
import { Trophy, Play, Send, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DrawRow({ draw }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <Trophy size={16} color="var(--accent)" />
            <strong>{MONTHS[draw.month - 1]} {draw.year}</strong>
            <span className={`badge badge-${draw.status === 'published' ? 'success' : draw.status === 'simulated' ? 'warning' : 'gray'}`}>
              {draw.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{draw.drawType} draw</span>
          </div>
          {draw.drawnNumbers?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {draw.drawnNumbers.map((n, i) => (
                <span key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>{n}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Pool: <strong style={{ color: 'var(--text)' }}>£{draw.prizePool?.total?.toFixed(2) || '0.00'}</strong></span>
            <span>Subscribers: <strong style={{ color: 'var(--text)' }}>{draw.subscriberCount}</strong></span>
            <span>Winners: <strong style={{ color: 'var(--text)' }}>{draw.winners?.length || 0}</strong></span>
            {draw.jackpotCarryOver > 0 && <span style={{ color: 'var(--warning)' }}>Jackpot carry-over: £{draw.jackpotCarryOver.toFixed(2)}</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {open ? 'Hide' : 'Details'}
        </button>
      </div>

      {open && draw.winners?.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Winners</h4>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>User</th><th>Match</th><th>Prize</th><th>Status</th></tr></thead>
              <tbody>
                {draw.winners.map((w, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{w.user?.name || 'N/A'}<br />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{w.user?.email}</span>
                    </td>
                    <td><span className="badge badge-info">{w.matchType}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>£{w.prizeAmount?.toFixed(2)}</td>
                    <td><span className={`badge badge-${w.paymentStatus === 'paid' ? 'success' : w.paymentStatus === 'verified' ? 'info' : w.paymentStatus === 'rejected' ? 'danger' : 'warning'}`}>{w.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState('');
  const [pool, setPool] = useState(null);

  const now = new Date();
  const [config, setConfig] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    drawType: 'random',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [dr, pr] = await Promise.allSettled([
        api.get('/draws/admin/all'),
        api.get('/draws/pool-estimate'),
      ]);
      if (dr.status === 'fulfilled') setDraws(dr.value.data.draws);
      if (pr.status === 'fulfilled') setPool(pr.value.data.pool);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const runSimulate = async () => {
    if (!confirm(`Simulate ${MONTHS[config.month - 1]} ${config.year} draw? This won't publish results.`)) return;
    setRunning('simulate');
    try {
      await api.post('/draws/admin/simulate', config);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Simulation failed'); }
    finally { setRunning(''); }
  };

  const runPublish = async () => {
    if (!confirm(`PUBLISH the ${MONTHS[config.month - 1]} ${config.year} draw? This will update winner balances and is IRREVERSIBLE.`)) return;
    setRunning('publish');
    try {
      await api.post('/draws/admin/publish', config);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Publish failed'); }
    finally { setRunning(''); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Draw Management</h1>
        <p>Configure, simulate, and publish monthly prize draws</p>
      </div>

      {/* Draw config panel */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Run a Draw</h2>

        {pool && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Active Subscribers', value: pool.subscriberCount },
              { label: 'Total Prize Pool', value: `£${pool.total?.toFixed(2)}` },
              { label: 'Jackpot (40%)', value: `£${pool.fiveMatch?.toFixed(2)}` },
              { label: '4-match Pool (35%)', value: `£${pool.fourMatch?.toFixed(2)}` },
              { label: '3-match Pool (25%)', value: `£${pool.threeMatch?.toFixed(2)}` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">Month</label>
            <select className="form-input form-select" style={{ width: 130 }}
              value={config.month} onChange={e => setConfig(p => ({ ...p, month: Number(e.target.value) }))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input type="number" className="form-input" style={{ width: 100 }}
              value={config.year} onChange={e => setConfig(p => ({ ...p, year: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Draw Type</label>
            <select className="form-input form-select" style={{ width: 160 }}
              value={config.drawType} onChange={e => setConfig(p => ({ ...p, drawType: e.target.value }))}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (weighted)</option>
            </select>
          </div>
          <button className="btn btn-outline" onClick={runSimulate} disabled={!!running}>
            {running === 'simulate' ? <><RefreshCw size={15} className="spin" /> Running...</> : <><Play size={15} /> Simulate</>}
          </button>
          <button className="btn btn-primary" onClick={runPublish} disabled={!!running}>
            {running === 'publish' ? <><RefreshCw size={15} /> Publishing...</> : <><Send size={15} /> Publish Draw</>}
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
          Simulate first to preview results without committing. Publish is permanent and updates winner prize balances.
        </p>
      </div>

      {/* Draw history */}
      <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Draw History</h2>
      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : draws.length === 0
          ? <div className="empty-state"><Trophy size={36} /><h3>No draws yet</h3></div>
          : draws.map(d => <DrawRow key={d._id} draw={d} />)
      }
    </div>
  );
}