import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Dashboard.css';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000];
const LEVEL_COLORS = ['#6b7299','#4da6ff','#00d97e','#f5c842','#fb923c','#a78bfa'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        API.get('/users/stats'),
        API.get('/progress/my')
      ]);
      setStats(statsRes.data.stats);
      setProgress(progressRes.data.progress.slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>;
  }

  const levelInfo = stats?.levelInfo || { level: 1, title: 'مبتدئ' };
  const levelColor = LEVEL_COLORS[levelInfo.level - 1] || LEVEL_COLORS[0];
  const currentThreshold = LEVEL_THRESHOLDS[levelInfo.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[levelInfo.level] || 5000;
  const xpInLevel = (stats?.xp || 0) - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const xpPct = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <main className="dashboard-page">
      <div className="container">

        {/* Welcome header */}
        <div className="dashboard-header animate-fade">
          <div className="user-profile-card card">
            <div className="profile-avatar" style={{ borderColor: levelColor }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">مرحباً، {user?.name?.split(' ')[0]}! 👋</h1>
              <div className="profile-meta">
                <span style={{ color: levelColor }}>⚡ {levelInfo.title}</span>
                {user?.wilaya && <span>📍 {user.wilaya}</span>}
                <span className="streak-badge-big">🔥 {stats?.streak} يوم متواصل</span>
              </div>
              {/* XP bar */}
              <div className="xp-section">
                <div className="xp-info">
                  <span style={{ fontSize: '0.82rem', color: levelColor, fontWeight: 700 }}>
                    المستوى {levelInfo.level}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {stats?.xp} / {nextThreshold} XP
                  </span>
                </div>
                <div className="xp-bar-wrap">
                  <div className="xp-bar-fill" style={{ width: `${xpPct}%`, background: levelColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row animate-slide">
          {[
            { icon: '⚡', num: stats?.xp || 0, label: 'نقاط XP', color: 'var(--gold)' },
            { icon: '📚', num: stats?.coursesCompleted || 0, label: 'دورة مكتملة', color: 'var(--primary)' },
            { icon: '🎯', num: stats?.quizzesCompleted || 0, label: 'اختبار أُنجز', color: 'var(--blue)' },
            { icon: '✅', num: `${stats?.accuracy || 0}%`, label: 'نسبة الصحة', color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} className="dash-stat card">
              <div className="dash-stat-icon">{s.icon}</div>
              <div className="dash-stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">

          {/* My Courses Progress */}
          <div>
            <div className="flex-between mb-4">
              <h2 className="section-title">دوراتي</h2>
              <Link to="/courses" className="btn btn-ghost btn-sm">+ التسجيل في دورة</Link>
            </div>

            {progress.length === 0 ? (
              <div className="empty-card card">
                <div style={{ fontSize: '3rem' }}>📚</div>
                <h3>لم تبدأ أي دورة بعد</h3>
                <p>اختر دورة وابدأ رحلتك التعليمية اليوم!</p>
                <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>استكشف الدورات</Link>
              </div>
            ) : progress.map(p => (
              <div key={p._id} className="progress-card card" style={{ marginBottom: 12 }}>
                <div className="progress-course-info">
                  <div className="progress-icon">
                    {p.course?.thumbnail
                      ? <img src={p.course.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '📚'}
                  </div>
                  <div className="progress-details">
                    <div className="progress-title">{p.course?.titleAr || 'دورة'}</div>
                    <div className="progress-stats">
                      <span>{p.completedLessons?.length || 0} / {p.course?.totalLessons || 0} درس</span>
                      <span>{p.isCompleted ? '✅ مكتملة' : `${p.percentage || 0}%`}</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ marginTop: 6 }}>
                      <div className="progress-bar-fill" style={{ width: `${p.percentage || 0}%` }} />
                    </div>
                  </div>
                </div>
                <Link to={`/courses/${p.course?._id}`} className="btn btn-ghost btn-sm">
                  {p.isCompleted ? 'مراجعة' : 'متابعة'}
                </Link>
              </div>
            ))}

            {/* Quick Quiz section */}
            <div className="quick-quiz-card card mt-6">
              <h3>🎯 اختبار سريع</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '8px 0 16px' }}>
                اختبر معلوماتك في أي مادة الآن
              </p>
              <Link to="/quizzes" className="btn btn-primary">ابدأ الاختبار</Link>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Daily challenge */}
            <div className="challenge-card card mb-4">
              <div className="challenge-header">
                <span className="badge badge-gold">🔥 تحدي اليوم</span>
              </div>
              <h3 style={{ margin: '12px 0 4px' }}>أكمل 5 اختبارات اليوم</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                احصل على +50 XP إضافية عند إنجاز التحدي
              </p>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: '40%', background: 'var(--gold)' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                2 / 5 اختبارات مكتملة
              </div>
            </div>

            {/* Badges */}
            <div className="card mb-4">
              <h3 className="mb-4">🏅 شاراتي</h3>
              {stats?.badges?.length > 0 ? (
                <div className="badges-grid">
                  {stats.badges.map(b => <div key={b} className="badge-item">{b}</div>)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px 0' }}>
                  <div style={{ fontSize: '2rem' }}>🎖️</div>
                  <p style={{ fontSize: '0.82rem', marginTop: 8 }}>أكمل دوراتك لكسب الشارات</p>
                </div>
              )}
            </div>

            {/* Ad sidebar */}
            <div className="ad-zone" style={{ height: 250 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag 300×250</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </main>
  );
}
