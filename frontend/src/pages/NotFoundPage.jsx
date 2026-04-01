import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <Trophy size={56} color="var(--accent)" style={{ marginBottom: 20 }} />
      <h1 style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--border)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '12px 0 8px' }}>Page not found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}