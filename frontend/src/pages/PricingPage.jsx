import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Heart, Trophy, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

const FEATURES = [
  'Enter monthly prize draws automatically',
  'Track up to 5 Stableford scores',
  'Choose your charity & set contribution %',
  'View full draw history & results',
  'Winner verification & payout system',
  'Mobile-friendly score entry',
];

export default function PricingPage() {
  const { user, isSubscribed } = useAuth();
  const [loading, setLoading] = useState('');

  const handleSubscribe = async (plan) => {
    if (!user) { window.location.href = '/register'; return; }
    setLoading(plan);
    try {
      const { data } = await api.post('/subscriptions/create-checkout', { plan });
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start checkout');
    } finally { setLoading(''); }
  };

  return (
    <div>
      <Navbar />
      <div style={{ background: 'var(--primary)', padding: '72px 0 52px', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, color: '#fff' }}>Simple, transparent pricing</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem' }}>One plan, two billing options. Cancel anytime.</p>
        </div>
      </div>

      <div className="container section">
        {isSubscribed && (
          <div className="alert alert-success" style={{ maxWidth: 600, margin: '0 auto 40px' }}>
            You have an active subscription. Manage it from your dashboard.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, maxWidth: 800, margin: '0 auto' }}>
          {/* Monthly */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--accent-soft)', padding: 10, borderRadius: 10 }}>
                <Zap size={20} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Monthly</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay month to month</div>
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>£9.99</span>
              <span style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem' }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-full"
              disabled={!!loading || isSubscribed}
              onClick={() => handleSubscribe('monthly')}>
              {loading === 'monthly' ? 'Redirecting...' : isSubscribed ? 'Already subscribed' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly */}
          <div className="card" style={{ padding: 36, border: '2px solid var(--accent)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
              <span className="badge badge-success" style={{ fontSize: '0.78rem', padding: '5px 14px', background: 'var(--accent)', color: '#fff' }}>
                <Trophy size={12} /> BEST VALUE — Save 17%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--accent-soft)', padding: 10, borderRadius: 10 }}>
                <Heart size={20} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Yearly</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best for regular golfers</div>
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>£99.99</span>
              <span style={{ color: 'var(--text-muted)' }}>/year</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 28, fontWeight: 600 }}>
              ~£8.33/month · Save £19.89 vs monthly
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem' }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full"
              disabled={!!loading || isSubscribed}
              onClick={() => handleSubscribe('yearly')}>
              {loading === 'yearly' ? 'Redirecting...' : isSubscribed ? 'Already subscribed' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '60px auto 0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 28, textAlign: 'center' }}>Common questions</h2>
          {[
            ['How does the prize draw work?', 'Every month we draw 5 numbers from the Stableford range (1–45). Your last 5 submitted scores are your entries. Match 3, 4, or all 5 to win a share of the prize pool.'],
            ['Can I cancel anytime?', 'Yes. Cancel from your dashboard and your access continues until the end of your billing period. No questions asked.'],
            ['How much goes to charity?', 'A minimum of 10% of your subscription is donated to your chosen charity. You can increase this percentage anytime in your settings.'],
            ['When are draws run?', 'Draws are run automatically on the 1st of each month. Results are published the same day.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{q}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}