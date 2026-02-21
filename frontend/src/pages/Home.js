import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import CourseCard from '../components/Course/CourseCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '🌟' },
  { id: 'math', label: 'الرياضيات', icon: '📐' },
  { id: 'physics', label: 'الفيزياء', icon: '⚡' },
  { id: 'arabic', label: 'العربية', icon: '📜' },
  { id: 'french', label: 'الفرنسية', icon: '🗼' },
  { id: 'english', label: 'الإنجليزية', icon: '🌍' },
  { id: 'history', label: 'التاريخ', icon: '🏛️' },
  { id: 'chemistry', label: 'الكيمياء', icon: '🧪' },
  { id: 'biology', label: 'العلوم', icon: '🌿' },
];

const STATS = [
  { num: '15,000+', label: 'طالب نشط', icon: '👨‍🎓' },
  { num: '120+', label: 'دورة تعليمية', icon: '📚' },
  { num: '2,500+', label: 'سؤال اختبار', icon: '🎯' },
  { num: '48', label: 'ولاية جزائرية', icon: '🗺️' },
];

const WILAYAS = [
  'الجزائر','وهران','قسنطينة','عنابة','سطيف','باتنة','تلمسان','بجاية','مستغانم','سكيكدة',
  'تيزي وزو','البليدة','تيارت','الشلف','بسكرة','الأغواط','ورقلة','أدرار','تمنراست','غرداية'
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedWilaya, setSelectedWilaya] = useState('الجزائر');

  useEffect(() => {
    fetchData();
    startCountdown();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, lbRes] = await Promise.all([
        API.get('/courses/featured'),
        API.get('/leaderboard?limit=5')
      ]);
      setFeatured(coursesRes.data.courses);
      setLeaderboard(lbRes.data.leaderboard.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const bacDate = new Date('2025-06-08T08:00:00');
    const update = () => {
      const diff = bacDate - new Date();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  };

  const filteredCourses = activeCategory === 'all'
    ? featured
    : featured.filter(c => c.category === activeCategory);

  return (
    <main className="home-page">

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="container hero-inner">
          <div className="hero-content animate-slide">
            <div className="hero-badge">
              <span className="badge badge-green">🇩🇿 منصة جزائرية 100%</span>
            </div>
            <h1 className="hero-title">
              تعلّم، تدرّب،<br />
              <span className="title-accent">وتفوّق في بكالوريا 2025</span>
            </h1>
            <p className="hero-sub">
              منصة DzLearn — دورات تعليمية، اختبارات تدريبية، وتتبع تقدمك. مجاناً تماماً.
              صُمِّمت خصيصاً للطالب الجزائري.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">📊 لوحتي</Link>
              ) : (
                <Link to="/register" className="btn btn-primary btn-lg">ابدأ مجاناً الآن ←</Link>
              )}
              <Link to="/courses" className="btn btn-ghost btn-lg">استكشف الدورات</Link>
            </div>
            <div className="hero-trust">
              <span>✅ بدون تسجيل بطاقة بنكية</span>
              <span>✅ يعمل على الهاتف</span>
              <span>✅ مجاني للأبد</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="hero-countdown animate-fade">
            <div className="countdown-label">⏳ العد التنازلي لبكالوريا 2025</div>
            <div className="countdown-digits">
              {[
                { val: countdown.days, label: 'يوم' },
                { val: countdown.hours, label: 'ساعة' },
                { val: countdown.mins, label: 'دقيقة' },
                { val: countdown.secs, label: 'ثانية' },
              ].map(({ val, label }) => (
                <div key={label} className="cd-unit">
                  <div className="cd-num">{String(val ?? '--').padStart(2, '0')}</div>
                  <div className="cd-label">{label}</div>
                </div>
              ))}
            </div>
            <Link to="/quizzes" className="btn btn-gold btn-sm" style={{ marginTop: 16, width: '100%' }}>
              🎯 ابدأ الاختبار الآن
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM STATS ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-num text-primary">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AD BANNER ===== */}
      <div className="container">
        <div className="ad-zone ad-banner">
          {/* MONETAG: Replace with actual zone script */}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag</span>
        </div>
      </div>

      {/* ===== FEATURED COURSES ===== */}
      <section className="courses-section">
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <div className="section-label">الدورات التعليمية</div>
              <h2 className="section-title">تعلّم من أفضل المحتوى</h2>
            </div>
            <Link to="/courses" className="btn btn-ghost btn-sm">كل الدورات ←</Link>
          </div>

          {/* Category filter */}
          <div className="scroll-x category-filter">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="courses-grid">
              {[1,2,3].map(i => (
                <div key={i} className="course-skeleton">
                  <div className="skeleton" style={{ height: 180 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p>لا توجد دورات في هذه الفئة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== LEADERBOARD + FEATURES SECTION ===== */}
      <section className="bottom-section">
        <div className="container bottom-grid">

          {/* Leaderboard */}
          <div>
            <div className="section-label">🏆 المتصدرون</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>قادة هذا الأسبوع</h2>

            {/* Wilaya selector */}
            <select
              className="form-input form-select"
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <option value="">كل الولايات</option>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <div className="leaderboard-card card">
              {leaderboard.length === 0 ? (
                <div className="text-center text-muted p-4">لا توجد بيانات بعد</div>
              ) : leaderboard.map((u, i) => (
                <div key={u._id} className="lb-row">
                  <span className={`lb-rank rank-${i + 1}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <div className="lb-avatar">{u.name.charAt(0)}</div>
                  <div className="lb-info">
                    <span className="lb-name">{u.name}</span>
                    <span className="lb-wilaya">{u.wilaya || 'غير محدد'}</span>
                  </div>
                  <div className="lb-right">
                    <span className="lb-xp">{u.xp.toLocaleString('ar-DZ')} XP</span>
                    <span className="lb-streak">🔥{u.streak}</span>
                  </div>
                </div>
              ))}
              <Link to="/leaderboard" className="lb-view-all">عرض الترتيب الكامل ←</Link>
            </div>

            {/* AD Rectangle */}
            <div className="ad-zone ad-rectangle" style={{ marginTop: 16 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان 300×250 — Monetag</span>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="section-label">لماذا DzLearn؟</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>ميزات المنصة</h2>
            <div className="features-list">
              {[
                { icon: '🎯', title: 'اختبارات حقيقية من الباكالوريا', desc: 'أسئلة مستخرجة من امتحانات الوزارة من 2010 إلى 2024' },
                { icon: '🔥', title: 'نظام التحفيز والسلاسل', desc: 'اكسب نقاط XP وحافظ على سلسلتك اليومية. تنافس مع زملائك!' },
                { icon: '📊', title: 'تتبع تقدمك', desc: 'راقب تطورك في كل مادة واعرف نقاط قوتك وضعفك' },
                { icon: '🏆', title: 'ترتيب الولايات', desc: 'تنافس مع طلاب ولايتك واثبت تفوق منطقتك' },
                { icon: '📱', title: 'يعمل بدون إنترنت قوي', desc: 'محسّن للشبكات البطيئة 3G/4G، مثالي للهاتف المحمول' },
                { icon: '🆓', title: 'مجاني 100%', desc: 'لا رسوم، لا اشتراكات، لا بطاقة بنكية. مجاني للأبد.' },
              ].map(f => (
                <div key={f.title} className="feature-item">
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <Link to="/register" className="btn btn-primary btn-full" style={{ marginTop: 24 }}>
                ابدأ رحلتك التعليمية الآن 🚀
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!user && (
        <section className="cta-section">
          <div className="container-sm text-center">
            <div className="cta-card">
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎓</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>جاهز للتفوق في بكالوريا 2025؟</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                انضم إلى 15,000 طالب جزائري يتدربون يومياً على DzLearn
              </p>
              <Link to="/register" className="btn btn-primary btn-lg">
                أنشئ حسابك مجاناً الآن ←
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STICKY BOTTOM AD */}
      <div className="ad-sticky-bottom">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>إعلان — Monetag Mobile Sticky</span>
      </div>

      {/* Spacer for sticky ad */}
      <div style={{ height: 60 }} />

    </main>
  );
}
