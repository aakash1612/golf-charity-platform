import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Trophy, Heart, CheckSquare, LogOut, Trophy as Logo } from 'lucide-react';
import './Admin.css';

const NAV = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/draws', label: 'Draws', icon: <Trophy size={18} /> },
  { to: '/admin/charities', label: 'Charities', icon: <Heart size={18} /> },
  { to: '/admin/winners', label: 'Winners', icon: <CheckSquare size={18} /> },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Logo size={20} color="var(--accent)" />
          <span>GolfGives Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-nav-item admin-logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}