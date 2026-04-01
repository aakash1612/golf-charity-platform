import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Search, Filter, ArrowLeft, Calendar, Globe, DollarSign, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

const CATEGORIES = ['all', 'health', 'education', 'environment', 'sport', 'community', 'other'];

export function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { user, updateUser } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await api.get('/charities', { params });
      setCharities(data.charities);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, category]);

  const selectCharity = async (charityId) => {
    if (!user) return alert('Please log in to select a charity');
    try {
      const { data } = await api.put('/auth/profile', { selectedCharity: charityId });
      updateUser({ selectedCharity: data.user.selectedCharity });
      alert('Charity selected!');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <Navbar />
      <div style={{ background: 'var(--primary)', padding: '60px 0 48px', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: 10 }}>Choose Your Cause</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>Every subscription contributes. You decide where your share goes.</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search charities..." style={{ paddingLeft: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input form-select" style={{ width: 'auto' }}
            value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          : charities.length === 0
            ? <div className="empty-state"><Heart size={40} /><h3>No charities found</h3><p>Try adjusting your search.</p></div>
            : (
              <div className="grid-3">
                {charities.map(c => {
                  const isSelected = user?.selectedCharity?._id === c._id || user?.selectedCharity === c._id;
                  return (
                    <div key={c._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', border: isSelected ? '2px solid var(--accent)' : undefined }}>
                      {c.isFeatured && <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>Featured</span>}
                      {c.logo && <img src={c.logo} alt={c.name} style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 14, borderRadius: 8 }} />}
                      <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{c.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1, marginBottom: 16, lineHeight: 1.65 }}>
                        {c.description.substring(0, 120)}{c.description.length > 120 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 16 }}>
                        <DollarSign size={14} /> £{c.totalReceived?.toFixed(2)} raised
                      </div>
                      <span className={`badge badge-gray`} style={{ alignSelf: 'flex-start', marginBottom: 14 }}>{c.category}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/charities/${c._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>View</Link>
                        {isSelected
                          ? <button className="btn btn-sm" style={{ flex: 1, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', border: 'none', cursor: 'default' }}>
                              <CheckCircle size={14} /> Selected
                            </button>
                          : <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => selectCharity(c._id)}>
                              <Heart size={14} /> Select
                            </button>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
      </div>
      <Footer />
    </div>
  );
}

export function CharityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/charities/${id}`).then(r => setCharity(r.data.charity)).catch(() => navigate('/charities')).finally(() => setLoading(false));
  }, [id]);

  const selectCharity = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.put('/auth/profile', { selectedCharity: id });
      updateUser({ selectedCharity: data.user.selectedCharity });
      alert('Charity selected!');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!charity) return null;

  const isSelected = user?.selectedCharity?._id === id || user?.selectedCharity === id;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card" style={{ padding: 40, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {charity.logo && <img src={charity.logo} alt={charity.name} style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 12 }} />}
            <div style={{ flex: 1 }}>
              {charity.isFeatured && <span className="badge badge-info" style={{ marginBottom: 10 }}>Featured</span>}
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>{charity.name}</h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="badge badge-gray">{charity.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600 }}>
                  <DollarSign size={14} /> £{charity.totalReceived?.toFixed(2)} raised through GolfGives
                </span>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>{charity.description}</p>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            {isSelected
              ? <button className="btn" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> Currently Selected
                </button>
              : <button className="btn btn-primary" onClick={selectCharity}>
                  <Heart size={16} /> Support This Charity
                </button>
            }
          </div>
        </div>

        {/* Events */}
        {charity.events?.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Upcoming Events</h2>
            {charity.events.map((ev, i) => (
              <div key={i} style={{ padding: '16px 0', borderBottom: i < charity.events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{ev.title}</h3>
                    {ev.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{ev.description}</p>}
                    {ev.location && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>📍 {ev.location}</p>}
                  </div>
                  {ev.date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <Calendar size={13} />
                      {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CharitiesPage;