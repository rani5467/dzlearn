import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const WILAYAS = ['الجزائر','وهران','قسنطينة','عنابة','بجاية','سطيف','باتنة','تلمسان','تيزي وزو','البليدة','بسكرة','ورقلة','تيارت','الشلف','أدرار','الأغواط','أم البواقي','بشار','البويرة','تمنراست','تبسة','جيجل','سعيدة','سكيكدة','سيدي بلعباس','عنابة','غليزان','معسكر','المدية','مستغانم','المسيلة','ميلة','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة','سوق أهراس','تيبازة','عين الدفلى','النعامة','عين تيموشنت','غرداية','رليزان'];
const LEVELS  = [['bem','البيام (BEM)'],['bac','الباكالوريا'],['university','الجامعة'],['professional','محترف']];

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirmPass:'', wilaya:'الجزائر', level:'bac' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nextStep = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('الاسم مطلوب');
    if (!form.email.includes('@')) return setError('بريد إلكتروني غير صالح');
    if (form.password.length < 6) return setError('كلمة المرور 6 أحرف على الأقل');
    if (form.password !== form.confirmPass) return setError('كلمتا المرور غير متطابقتين');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { name, email, password, wilaya, level } = form;
      await register({ name, email, password, wilaya, level });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في إنشاء الحساب');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide">
        <div className="auth-logo"><span style={{color:'var(--primary)'}}>Dz</span>Learn 🇩🇿</div>
        <h1 className="auth-title">{step === 1 ? 'أنشئ حسابك مجاناً' : 'أكمل ملفك الشخصي'}</h1>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}

        {step === 1 ? (
          <form onSubmit={nextStep}>
            <div className="form-group">
              <label className="form-label">الاسم الكامل</label>
              <input className="form-input" placeholder="أحمد بن محمد"
                value={form.name} onChange={e => f('name', e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input type="email" className="form-input" placeholder="example@gmail.com"
                value={form.email} onChange={e => f('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <div style={{position:'relative'}}>
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="6 أحرف على الأقل"
                  value={form.password} onChange={e => f('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem'}}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">تأكيد كلمة المرور</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={form.confirmPass} onChange={e => f('confirmPass', e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">التالي ←</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">المستوى الدراسي</label>
              <div className="level-picker">
                {LEVELS.map(([v, l]) => (
                  <button type="button" key={v}
                    className={`level-btn ${form.level === v ? 'selected' : ''}`}
                    onClick={() => f('level', v)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">الولاية</label>
              <select className="form-input" value={form.wilaya} onChange={e => f('wilaya', e.target.value)}>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="auth-terms">
              بالتسجيل أنت توافق على <Link to="/terms">شروط الاستخدام</Link>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>→ رجوع</button>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="spinner" style={{width:20,height:20,borderWidth:2}} /> : '✨ إنشاء الحساب'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">لديك حساب؟ <Link to="/login">سجّل الدخول</Link></p>
      </div>
    </div>
  );
}
