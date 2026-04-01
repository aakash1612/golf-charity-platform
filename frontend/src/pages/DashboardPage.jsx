import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Heart, Target, TrendingUp, Calendar, CreditCard, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

function SubStatusCard({ user, onManage }) {
  const sub = user.subscription;
  const isActive = sub?.status === 'active';
  const endDate = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <div className="card" style={{ borderLeft: `4px solid ${isActive ? 'var(--accent)' : 'var(--danger)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CreditCard size={18} color={isActive ? 'var(--accent)' : 'var(--danger)'} />
            <span style={{ fontWeight: 700 }}>Subscription</span>
          </div>
          <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: 10 }}>
            {sub?.status?.toUpperCase() || 'INACTIVE'}
          </span>
          {sub?.plan && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)} plan
            {endDate && ` · Renews ${endDate}`}
          </p>}
          {sub?.cancelAtPeriodEnd && <p style={{ fontSize: '0.82rem', color: 'var(--warning)', marginTop: 4 }}>
            Cancels at period end
          </p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isActive
            ? <button className="btn btn-outline btn-sm" onClick={onManage}>Manage</button>
            : <Link to="/pricing" className="btn btn-primary btn-sm">Subscribe Now</Link>
          }
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [scoresRes, drawsRes, poolRes] = await Promise.allSettled([
          api.get('/scores/mine'),
          api.get('/draws/my-entries'),
          api.get('/draws/pool-estimate'),
        ]);
        if (scoresRes.status === 'fulfilled') setScores(scoresRes.value.data.scores);
        if (drawsRes.status === 'fulfilled') setDraws(drawsRes.value.data.draws);
        if (poolRes.status === 'fulfilled') setPool(poolRes.value.data.pool);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleManageBilling = async () => {
    try {
      const { data } = await api.get('/subscriptions/portal');
      window.location.href = data.url;
    } catch (err) { alert('Failed to open billing portal'); }
  };

  const isSubscribed = user?.subscription?.status === 'active';

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - var(--nav-height))', background: 'var(--bg)' }}>

        {/* Header */}
        <div style={{ background: 'var(--primary)', padding: '40px 0 32px' }}>
          <div className="container">
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
              Here's your platform overview
            </p>
          </div>
        </div>

        <div className="container section-sm">
          {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Subscription status */}
              <SubStatusCard user={user} onManage={handleManageBilling} />

              {!isSubscribed && (
                <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={18} />
                  Subscribe to enter draws, track scores, and support charities.
                  <Link to="/pricing" style={{ marginLeft: 'auto', fontWeight: 600, color: 'inherit', textDecoration: 'underline' }}>
                    View plans →
                  </Link>
                </div>
              )}

              {/* Stats row */}
              <div className="grid-4">
                <div className="stat-box">
                  <div className="stat-value stat-accent">£{user?.totalWon?.toFixed(2) || '0.00'}</div>
                  <div className="stat-label">Total winnings</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{scores.length}</div>
                  <div className="stat-label">Scores on record</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{draws.length}</div>
                  <div className="stat-label">Draws entered</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value stat-accent">£{pool?.total?.toFixed(2) || '—'}</div>
                  <div className="stat-label">Current prize pool</div>
                </div>
              </div>

              <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Scores */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target size={18} color="var(--accent)" />
                      <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Scores</h2>
                    </div>
                    <Link to="/scores" className="btn btn-outline btn-sm">Manage</Link>
                  </div>
                  {scores.length === 0
                    ? <div className="empty-state"><Target size={32} /><h3>No scores yet</h3><p>Add your first Stableford score to enter draws.</p></div>
                    : scores.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < scores.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{s.value}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>pts</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <Calendar size={13} />
                          {new Date(s.date).toLocaleDateString('en-GB')}
                        </div>
                        {i === 0 && <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Latest</span>}
                      </div>
                    ))
                  }
                </div>

                {/* Charity + winnings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Heart size={18} color="#e74c3c" />
                      <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Charity</h2>
                    </div>
                    {user?.selectedCharity
                      ? <>
                          <p style={{ fontWeight: 600 }}>{user.selectedCharity.name}</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '6px 0 12px' }}>
                            Contributing {user.charityContributionPercent}% of your subscription
                          </p>
                          <Link to="/charities" className="btn btn-outline btn-sm">Change Charity</Link>
                        </>
                      : <>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 14 }}>You haven't selected a charity yet.</p>
                          <Link to="/charities" className="btn btn-primary btn-sm">
                            <Heart size={14} /> Choose a Charity
                          </Link>
                        </>
                    }
                  </div>

                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Trophy size={18} color="var(--accent)" />
                      <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Draw Wins</h2>
                    </div>
                    {draws.length === 0
                      ? <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No wins yet — keep playing!</p>
                      : draws.slice(0, 3).map((d) => {
                          const myWin = d.winners.find(w => w.user === user._id || w.user?._id === user._id);
                          return myWin ? (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{myWin.matchType}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.month}/{d.year}</div>
                              </div>
                              <div>
                                <strong style={{ color: 'var(--accent)' }}>£{myWin.prizeAmount?.toFixed(2)}</strong>
                                <span className={`badge badge-${myWin.paymentStatus === 'paid' ? 'success' : 'warning'}`} style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                                  {myWin.paymentStatus}
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })
                    }
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="card">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/scores" className="btn btn-primary btn-sm"><Target size={15} /> Add Score</Link>
                  <Link to="/draws" className="btn btn-outline btn-sm"><Trophy size={15} /> View Draws</Link>
                  <Link to="/charities" className="btn btn-outline btn-sm"><Heart size={15} /> Browse Charities</Link>
                  <button className="btn btn-outline btn-sm" onClick={handleManageBilling}><CreditCard size={15} /> Billing</button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}