import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide">
        <div className="auth-logo">
          <span style={{ color: 'var(--primary)' }}>Dz</span>Learn 🇩🇿
        </div>
        <h1 className="auth-title">مرحباً بعودتك!</h1>
        <p className="auth-sub">سجّل دخولك للمتابعة من حيث توقفت</p>

        {error && <div className="alert alert-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input type="email" className="form-input" placeholder="example@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" style={{width:20,height:20,borderWidth:2}} /> : 'تسجيل الدخول →'}
          </button>
        </form>

        <p className="auth-switch">
          ليس لديك حساب؟ <Link to="/register">سجّل مجاناً</Link>
        </p>
        <div className="demo-hint">
          <strong>حسابات تجريبية:</strong><br/>
          مدير: admin@dzlearn.dz / admin123<br/>
          طالب: yassin@test.dz / test123
        </div>
      </div>
    </div>
  );
}
