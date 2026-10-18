import React, { useContext } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // On the landing page (/), show an editorial header aligned with the landing page design
  if (isLandingPage) {
    return (
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: 'rgba(36, 26, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid rgba(231, 226, 216, 0.16)',
        padding: '14px clamp(20px, 4vw, 60px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'Anton, sans-serif',
          fontSize: '24px',
          color: '#fff',
          textDecoration: 'none',
          letterSpacing: '-0.02em'
        }}>
          <span>⚡</span>
          <span>EXAMIFY</span>
          <span style={{
            background: '#ef493c',
            color: '#fff',
            fontFamily: 'Martian Mono, monospace',
            fontSize: '10px',
            padding: '2px 8px',
            letterSpacing: '0.14em'
          }}>PRO</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  fontFamily: 'Martian Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  background: '#ef493c',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  border: '1.5px solid #171717',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(239, 73, 60, 0.35)'
                }}
              >
                Go to Dashboard →
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: 'Martian Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  background: 'transparent',
                  color: '#e7e2d8',
                  padding: '9px 16px',
                  border: '1px solid rgba(231, 226, 216, 0.3)',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontFamily: 'Martian Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  color: '#e7e2d8',
                  textDecoration: 'none',
                  padding: '10px 18px',
                  border: '1px solid rgba(231, 226, 216, 0.3)',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  fontFamily: 'Martian Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '0.14em',
                  background: '#ef493c',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '10px 22px',
                  border: '1.5px solid #171717',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(239, 73, 60, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                Register Free →
              </Link>
            </>
          )}
        </div>
      </nav>
    );
  }

  // Inside app navigation (Dashboard, Quizzes, Results, etc.)
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span>⚡</span>
          <span>Examify</span>
          <span className="nav-logo-badge">Pro</span>
        </Link>
        <ul className="nav-menu">
          {user ? (
            <>
              <li className="nav-item">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Quizzes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Leaderboard
                </NavLink>
              </li>
              {(user.role === 'teacher' || user.role === 'admin') && (
                <>
                  <li className="nav-item">
                    <NavLink to="/create-quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      + Create Quiz
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/admin-analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      Analytics & CSV
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-item">
                <div className="nav-user-pill">
                  <div className="nav-avatar">{getInitials(user.name)}</div>
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role">{user.role}</span>
                </div>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="btn btn-secondary nav-btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Sign In
                </NavLink>
              </li>
              <li className="nav-item">
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                  Register / Get Started
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
