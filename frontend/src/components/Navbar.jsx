import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Trophy, Heart, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <Trophy size={22} />
          <span>GolfGives</span>
        </Link>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          <NavLink to="/charities" onClick={() => setOpen(false)}>Charities</NavLink>
          <NavLink to="/draws" onClick={() => setOpen(false)}>Draws</NavLink>
          <NavLink to="/winners" onClick={() => setOpen(false)}>Winners</NavLink>
          <NavLink to="/pricing" onClick={() => setOpen(false)}>Pricing</NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                <LayoutDashboard size={15} /> Dashboard
              </NavLink>
              <NavLink to="/scores" onClick={() => setOpen(false)}>My Scores</NavLink>
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setOpen(false)} className="nav-admin">
                  <Shield size={15} /> Admin
                </NavLink>
              )}
              <button className="btn btn-ghost btn-sm nav-logout" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                <Heart size={14} /> Join Now
              </Link>
            </>
          )}
        </div>

        <button className="navbar-burger btn-icon btn-ghost" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}