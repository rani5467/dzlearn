import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const LEVEL_COLORS = ['#6b7299', '#4da6ff', '#00d97e', '#f5c842', '#fb923c', '#a78bfa'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const levelInfo = user?.levelInfo || { level: 1, title: 'مبتدئ' };
  const levelColor = LEVEL_COLORS[levelInfo.level - 1] || LEVEL_COLORS[0];

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-dz">Dz</span>
          <span className="logo-learn">Learn</span>
          <span className="logo-flag">🇩🇿</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <Link to="/courses" className={`nav-link ${isActive('/courses')}`}>الدورات</Link>
          <Link to="/quizzes" className={`nav-link ${isActive('/quizzes')}`}>الاختبارات</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>المتصدرون</Link>
        </div>

        {/* Right side */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar" style={{ borderColor: levelColor }}>
                  {user.name.charAt(0)}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className="user-xp" style={{ color: levelColor }}>
                    {levelInfo.title} • {user.xp} XP
                  </span>
                </div>
                <span className="streak-pill">🔥{user.streak}</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown animate-fade">
                  <div className="dropdown-header">
                    <div className="user-avatar-lg" style={{ borderColor: levelColor }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{user.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📊 لوحة التحكم
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 ملفي الشخصي
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ⚙️ الإدارة
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 تسجيل الخروج
                  </button>
                </div>
              )}
              {dropdownOpen && <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">دخول</Link>
              <Link to="/register" className="btn btn-primary btn-sm">سجّل مجاناً</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade">
          <Link to="/courses" className="mobile-link" onClick={() => setMenuOpen(false)}>📚 الدورات</Link>
          <Link to="/quizzes" className="mobile-link" onClick={() => setMenuOpen(false)}>🎯 الاختبارات</Link>
          <Link to="/leaderboard" className="mobile-link" onClick={() => setMenuOpen(false)}>🏆 المتصدرون</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>📊 لوحتي</Link>
              <button className="mobile-link danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>🚪 خروج</button>
            </>
          ) : (
            <Link to="/register" className="mobile-link primary" onClick={() => setMenuOpen(false)}>✨ سجّل مجاناً</Link>
          )}
        </div>
      )}
    </nav>
  );
}
