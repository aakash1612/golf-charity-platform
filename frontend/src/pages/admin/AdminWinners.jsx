import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, DollarSign, ExternalLink, Trophy } from 'lucide-react';
import api from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = { pending: 'warning', verified: 'info', paid: 'success', rejected: 'danger' };

function WinnerRow({ item, onAction }) {
  const { draw, winner } = item;
  const [acting, setActing] = useState('');

  const act = async (action) => {
    setActing(action);
    try { await onAction(draw._id, winner._id, action); }
    finally { setActing(''); }
  };

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{winner.user?.name || 'N/A'}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{winner.user?.email}</div>
      </td>
      <td style={{ fontSize: '0.875rem' }}>{MONTHS[draw.month - 1]} {draw.year}</td>
      <td><span className="badge badge-info">{winner.matchType}</span></td>
      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>£{winner.prizeAmount?.toFixed(2)}</td>
      <td>
        <span className={`badge badge-${STATUS_COLORS[winner.paymentStatus]}`}>
          {winner.paymentStatus}
        </span>
      </td>
      <td>
        {winner.proofUrl
          ? <a href={winner.proofUrl} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ExternalLink size={13} /> View Proof
            </a>
          : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No proof uploaded</span>
        }
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {winner.paymentStatus === 'pending' && winner.proofUrl && (
            <>
              <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff' }}
                disabled={!!acting} onClick={() => act('approve')}>
                {acting === 'approve' ? '...' : <><CheckCircle size={13} /> Approve</>}
              </button>
              <button className="btn btn-danger btn-sm" disabled={!!acting} onClick={() => act('reject')}>
                {acting === 'reject' ? '...' : <><XCircle size={13} /> Reject</>}
              </button>
            </>
          )}
          {winner.paymentStatus === 'verified' && (
            <button className="btn btn-sm" style={{ background: 'var(--accent)', color: '#fff' }}
              disabled={!!acting} onClick={() => act('mark-paid')}>
              {acting === 'mark-paid' ? '...' : <><DollarSign size={13} /> Mark Paid</>}
            </button>
          )}
          {(winner.paymentStatus === 'paid' || winner.paymentStatus === 'rejected') && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {winner.paymentStatus === 'paid' ? '✓ Paid' : '✗ Rejected'}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminWinners() {
  const [allDraws, setAllDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/draws/admin/all');
      setAllDraws(data.draws);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (drawId, winnerId, action) => {
    try {
      if (action === 'mark-paid') {
        await api.put(`/winners/${drawId}/${winnerId}/mark-paid`);
      } else {
        await api.put(`/winners/${drawId}/${winnerId}/verify`, { action });
      }
      load();
    } catch (err) { alert(err.response?.data?.message || 'Action failed'); }
  };

  // Flatten all winners across all draws
  const allWinners = allDraws.flatMap(d =>
    (d.winners || []).map(w => ({ draw: { _id: d._id, month: d.month, year: d.year }, winner: w }))
  );

  const filtered = filter === 'all' ? allWinners : allWinners.filter(i => i.winner.paymentStatus === filter);

  const counts = {
    all: allWinners.length,
    pending: allWinners.filter(i => i.winner.paymentStatus === 'pending').length,
    verified: allWinners.filter(i => i.winner.paymentStatus === 'verified').length,
    paid: allWinners.filter(i => i.winner.paymentStatus === 'paid').length,
    rejected: allWinners.filter(i => i.winner.paymentStatus === 'rejected').length,
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Winner Verification</h1>
        <p>Review proof submissions and manage prize payouts</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Winners', value: counts.all, color: 'var(--primary)' },
          { label: 'Awaiting Proof/Review', value: counts.pending, color: 'var(--warning)' },
          { label: 'Verified — To Pay', value: counts.verified, color: '#3b82f6' },
          { label: 'Paid Out', value: counts.paid, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', 'pending', 'verified', 'paid', 'rejected'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f] || 0})
          </button>
        ))}
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        : filtered.length === 0
          ? (
            <div className="empty-state">
              <Trophy size={40} />
              <h3>No winners in this category</h3>
              <p>Winners will appear here after draws are published.</p>
            </div>
          )
          : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Winner</th>
                    <th>Draw</th>
                    <th>Match</th>
                    <th>Prize</th>
                    <th>Status</th>
                    <th>Proof</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <WinnerRow key={`${item.draw._id}-${i}`} item={item} onAction={handleAction} />
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  );
}