import { Link } from 'react-router-dom';
import { Trophy, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--primary)', color: 'rgba(255,255,255,0.7)', padding: '48px 0 24px' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Trophy size={20} color="var(--accent)" />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>GolfGives</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              Golf performance tracking meets charity. Play, win, and give back.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['How It Works', '/'], ['Pricing', '/pricing'], ['Monthly Draws', '/draws'], ['Winners', '/winners']].map(([label, to]) => (
                <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                >{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Giving</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Charities', '/charities'], ['How We Give', '/charities'], ['Impact', '/charities']].map(([label, to]) => (
                <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                >{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Sign Up', '/register'], ['Login', '/login'], ['Dashboard', '/dashboard']].map(([label, to]) => (
                <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8rem' }}>© {new Date().getFullYear()} GolfGives. All rights reserved.</p>
          <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <Heart size={12} color="var(--accent)" /> for golfers who give
          </p>
        </div>
      </div>
    </footer>
  );
}