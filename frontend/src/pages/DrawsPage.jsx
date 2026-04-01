import { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, DollarSign, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function DrawCard({ draw }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Trophy size={18} color="var(--accent)" />
            <h3 style={{ fontWeight: 700 }}>{MONTHS[draw.month - 1]} {draw.year} Draw</h3>
            <span className="badge badge-success">Published</span>
          </div>
          {/* Drawn numbers */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {draw.drawnNumbers?.map((n, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                {n}
              </div>
            ))}
          </div>
          {/* Prize pool */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--text)' }}>£{draw.prizePool?.total?.toFixed(2)}</strong> total pool</span>
            <span><strong style={{ color: 'var(--text)' }}>{draw.subscriberCount}</strong> subscribers</span>
            <span><strong style={{ color: 'var(--text)' }}>{draw.winners?.length}</strong> winners</span>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setOpen(!open)}>
          {open ? 'Hide' : 'Show'} Winners
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {draw.winners?.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No winners this draw.</p>
            : draw.winners.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <div>
                    <strong>{w.user?.name || 'Anonymous'}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{w.matchType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent)' }}>£{w.prizeAmount?.toFixed(2)}</strong>
                    <span className={`badge badge-${w.paymentStatus === 'paid' ? 'success' : w.paymentStatus === 'verified' ? 'info' : 'warning'}`}>
                      {w.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

export function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/draws'),
      api.get('/draws/current'),
    ]).then(([dr, cr]) => {
      if (dr.status === 'fulfilled') setDraws(dr.value.data.draws);
      if (cr.status === 'fulfilled') setCurrent(cr.value.data.draw);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ background: 'var(--primary)', padding: '60px 0 48px', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>Monthly Prize Draws</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>5 numbers drawn each month — match 3, 4, or 5 to win.</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Current draw */}
        {current && current.status !== 'published' && (
          <div className="card" style={{ marginBottom: 32, border: '2px solid var(--accent)', textAlign: 'center', padding: 40 }}>
            <span className="badge badge-info" style={{ marginBottom: 12 }}>Current Draw</span>
            <h2 style={{ fontWeight: 800, marginBottom: 8 }}>
              {MONTHS[(new Date().getMonth())]} {new Date().getFullYear()}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Draw results published on the 1st of next month.</p>
            {current.prizePool?.total > 0 && (
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>
                £{current.prizePool.total.toFixed(2)} prize pool
              </div>
            )}
          </div>
        )}

        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : draws.length === 0
            ? <div className="empty-state"><Trophy size={40} /><h3>No draws yet</h3><p>The first draw will run on the 1st of next month.</p></div>
            : draws.map(d => <DrawCard key={d._id} draw={d} />)
        }
      </div>
      <Footer />
    </div>
  );
}

export function WinnersPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draws').then(r => setDraws(r.data.draws)).finally(() => setLoading(false));
  }, []);

  const allWinners = draws.flatMap(d =>
    d.winners.map(w => ({ ...w, draw: { month: d.month, year: d.year } }))
  ).filter(w => w.paymentStatus === 'paid' || w.paymentStatus === 'verified');

  return (
    <div>
      <Navbar />
      <div style={{ background: 'var(--primary)', padding: '60px 0 48px', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>Hall of Winners</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>Our verified prize winners — could you be next?</p>
        </div>
      </div>

      <div className="container section-sm">
        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : allWinners.length === 0
            ? <div className="empty-state"><Trophy size={40} /><h3>No verified winners yet</h3><p>Winners will appear here once verified.</p></div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {allWinners.map((w, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{w.user?.name || 'Anonymous'}</td>
                        <td>{MONTHS[w.draw.month - 1]} {w.draw.year}</td>
                        <td><span className="badge badge-info">{w.matchType}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>£{w.prizeAmount?.toFixed(2)}</td>
                        <td><span className={`badge badge-${w.paymentStatus === 'paid' ? 'success' : 'info'}`}>{w.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
      <Footer />
    </div>
  );
}

export default DrawsPage;