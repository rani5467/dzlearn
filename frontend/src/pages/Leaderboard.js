import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const WILAYAS = ['الكل','الجزائر','وهران','قسنطينة','عنابة','سطيف','باتنة','تلمسان','بجاية','مستغانم','سكيكدة','تيزي وزو','البليدة'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [wilayaLb, setWilayaLb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wilaya, setWilaya] = useState('الكل');
  const [tab, setTab] = useState('students');

  useEffect(() => {
    fetchLeaderboard();
  }, [wilaya]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = wilaya !== 'الكل' ? `?wilaya=${wilaya}` : '';
      const [lbRes, wlbRes] = await Promise.all([
        API.get(`/leaderboard${params}`),
        API.get('/leaderboard/wilayas')
      ]);
      setLeaderboard(lbRes.data.leaderboard);
      setWilayaLb(wlbRes.data.leaderboard);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <main className="lb-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏆 لوحة المتصدرين</h1>
          <p className="page-sub">تنافس مع طلاب جزائر من ولايتك وكل الولايات</p>
        </div>

        {/* Tabs */}
        <div className="lb-tabs">
          <button className={`lb-tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
            👨‍🎓 الطلاب
          </button>
          <button className={`lb-tab ${tab === 'wilayas' ? 'active' : ''}`} onClick={() => setTab('wilayas')}>
            🗺️ الولايات
          </button>
        </div>

        {tab === 'students' && (
          <>
            {/* Wilaya filter */}
            <div className="scroll-x mb-6">
              {WILAYAS.map(w => (
                <button
                  key={w}
                  className={`cat-filter-btn ${wilaya === w ? 'active' : ''}`}
                  onClick={() => setWilaya(w)}
                >
                  {w}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
            ) : (
              <div className="lb-table card">
                <div className="lb-table-header">
                  <span>الترتيب</span>
                  <span>الطالب</span>
                  <span>الولاية</span>
                  <span>نقاط XP</span>
                  <span>السلسلة</span>
                  <span>الدقة</span>
                </div>
                {leaderboard.map((u) => {
                  const isMe = user && u._id === user._id;
                  return (
                    <div key={u._id} className={`lb-table-row ${isMe ? 'is-me' : ''}`}>
                      <span className="lb-rank-cell">{getIcon(u.rank)}</span>
                      <div className="lb-user-cell">
                        <div className="lb-av">{u.name.charAt(0)}</div>
                        <div>
                          <div className="lb-uname">{u.name} {isMe && <span className="you-badge">أنت</span>}</div>
                          <div style={{ fontSize: '0.72rem', color: u.level?.level === 6 ? 'var(--purple)' : 'var(--text-muted)' }}>
                            {u.level?.title}
                          </div>
                        </div>
                      </div>
                      <span className="lb-wilaya-cell">{u.wilaya || '—'}</span>
                      <span className="lb-xp-cell">{u.xp?.toLocaleString('ar-DZ')}</span>
                      <span className="lb-streak-cell">🔥{u.streak}</span>
                      <span className="lb-acc-cell">{u.accuracy}%</span>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && (
                  <div className="text-center p-4 text-muted">لا توجد بيانات بعد</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'wilayas' && (
          <div className="lb-table card">
            <div className="lb-table-header">
              <span>الترتيب</span>
              <span>الولاية</span>
              <span>إجمالي XP</span>
              <span>عدد الطلاب</span>
              <span>متوسط XP</span>
            </div>
            {wilayaLb.map((w, i) => (
              <div key={w._id} className="lb-table-row">
                <span className="lb-rank-cell">{getIcon(i + 1)}</span>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{w._id}</span>
                <span className="lb-xp-cell">{w.totalXP?.toLocaleString('ar-DZ')}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{w.students} طالب</span>
                <span style={{ color: 'var(--blue)', fontSize: '0.85rem' }}>{Math.round(w.avgXP)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ad */}
        <div className="ad-zone ad-banner mt-6">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag</span>
        </div>
      </div>
      <div style={{ height: 80 }} />
    </main>
  );
}
