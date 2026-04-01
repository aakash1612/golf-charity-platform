import { useEffect, useState } from 'react';
import { Users, Trophy, Heart, DollarSign, TrendingUp, Activity } from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={22} />, color: '#3b82f6' },
    { label: 'Active Subscribers', value: stats?.activeSubscribers || 0, icon: <Activity size={22} />, color: 'var(--accent)' },
    { label: 'Total Draws Run', value: stats?.totalDraws || 0, icon: <Trophy size={22} />, color: '#f39c12' },
    { label: 'Charity Contributions', value: `£${stats?.totalCharityContributions || 0}`, icon: <Heart size={22} />, color: '#e74c3c' },
    { label: 'Current Prize Pool', value: `£${stats?.totalPrizePool || 0}`, icon: <Trophy size={22} />, color: '#9b59b6' },
    { label: 'Est. Monthly Revenue', value: `£${stats?.estimatedMonthlyRevenue || 0}`, icon: <DollarSign size={22} />, color: '#27ae60' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <p>Platform statistics and key metrics</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{c.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charity breakdown */}
      {stats?.charities?.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Charity Contributions Breakdown</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Charity</th><th>Total Received</th></tr></thead>
              <tbody>
                {stats.charities.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>£{c.totalReceived?.toFixed(2)}</td>
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