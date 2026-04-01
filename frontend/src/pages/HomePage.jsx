import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Trophy, Target, TrendingUp, ArrowRight, Star, Users, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import './HomePage.css';

function AnimatedNumber({ target, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const [charities, setCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    api.get('/charities?featured=true').then(r => setCharities(r.data.charities.slice(0, 3))).catch(() => {});
    api.get('/draws/current').then(r => setLatestDraw(r.data.draw)).catch(() => {});
  }, []);

  return (
    <div className="home">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Heart size={14} /> Play Golf. Change Lives.
          </div>
          <h1>
            Every Score<br />
            <span className="hero-accent">Funds a Cause</span>
          </h1>
          <p className="hero-sub">
            Track your Stableford scores, enter monthly prize draws, and automatically
            donate to a charity you love — all in one platform built for golfers who care.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              <Heart size={18} /> Start Giving Today
            </Link>
            <Link to="/how-it-works" className="btn btn-outline btn-lg">
              See How It Works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-stats">
            {[
              { icon: <Users size={18} />, label: 'Active Golfers', value: 1240, suffix: '+' },
              { icon: <Heart size={18} />, label: 'Raised for Charity', prefix: '£', value: 48300 },
              { icon: <Trophy size={18} />, label: 'Prize Pool This Month', prefix: '£', value: 6200 },
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-icon">{s.icon}</div>
                <div className="hero-stat-value">
                  <AnimatedNumber target={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} />
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Simple. Meaningful. Rewarding.</h2>
            <p>Three things happen every time you play a round.</p>
          </div>
          <div className="steps">
            {[
              {
                num: '01', icon: <Target size={28} />, color: '#00d4aa',
                title: 'Enter Your Score',
                desc: 'Log your latest Stableford score after every round. We keep your 5 most recent scores — always up to date.',
              },
              {
                num: '02', icon: <Trophy size={28} />, color: '#f39c12',
                title: 'Enter the Monthly Draw',
                desc: 'Your scores automatically enter you into our monthly prize draw. Match 3, 4, or all 5 drawn numbers to win.',
              },
              {
                num: '03', icon: <Heart size={28} />, color: '#e74c3c',
                title: 'Support a Charity',
                desc: 'A portion of every subscription goes directly to your chosen charity. You choose how much — minimum 10%.',
              },
            ].map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <div className="step-icon" style={{ color: step.color, background: `${step.color}18` }}>
                  {step.icon}
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE POOL */}
      <section className="section prize-section">
        <div className="container">
          <div className="prize-inner">
            <div className="prize-text">
              <h2>Monthly Prize Draw</h2>
              <p>Every active subscriber is automatically entered. The more you play, the better your chances.</p>
              <div className="prize-tiers">
                {[
                  { match: '5 Numbers', share: '40%', color: '#f39c12', label: 'Jackpot — rolls over if unclaimed' },
                  { match: '4 Numbers', share: '35%', color: '#00d4aa', label: 'Split equally among winners' },
                  { match: '3 Numbers', share: '25%', color: '#9b59b6', label: 'Split equally among winners' },
                ].map((t) => (
                  <div key={t.match} className="prize-tier">
                    <div className="tier-bar" style={{ background: t.color, width: t.share }} />
                    <div>
                      <strong>{t.match} matched</strong> — <span style={{ color: t.color, fontWeight: 700 }}>{t.share} of pool</span>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/draws" className="btn btn-primary" style={{ marginTop: 8 }}>
                View Past Draws <ArrowRight size={16} />
              </Link>
            </div>
            <div className="prize-pool-card">
              <div className="pool-label">This Month's Prize Pool</div>
              <div className="pool-amount">
                £{latestDraw ? latestDraw.prizePool?.total?.toFixed(2) : '—'}
              </div>
              <div className="pool-sub">Grows with every new subscriber</div>
              <div className="pool-breakdown">
                <div><span>Jackpot (5-match)</span><strong>£{latestDraw ? (latestDraw.prizePool?.fiveMatch?.toFixed(2)) : '—'}</strong></div>
                <div><span>4-match pool</span><strong>£{latestDraw ? (latestDraw.prizePool?.fourMatch?.toFixed(2)) : '—'}</strong></div>
                <div><span>3-match pool</span><strong>£{latestDraw ? (latestDraw.prizePool?.threeMatch?.toFixed(2)) : '—'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CHARITIES */}
      {charities.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Causes You're Supporting</h2>
              <p>Every subscription contributes. You decide where your share goes.</p>
            </div>
            <div className="grid-3">
              {charities.map((c) => (
                <Link to={`/charities/${c._id}`} key={c._id} className="card card-hover charity-card">
                  {c.logo && <img src={c.logo} alt={c.name} className="charity-logo" />}
                  <h3>{c.name}</h3>
                  <p>{c.description.substring(0, 100)}...</p>
                  <div className="charity-raised">
                    <DollarSign size={14} />
                    £{c.totalReceived?.toFixed(2)} raised
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/charities" className="btn btn-outline">
                See All Charities <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2>Ready to play with purpose?</h2>
              <p>Join thousands of golfers who are tracking scores, winning prizes, and changing lives.</p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                <Heart size={18} /> Join Today — From £9.99/mo
              </Link>
              <Link to="/pricing" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}