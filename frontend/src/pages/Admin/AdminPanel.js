import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Admin.css';

const SECTIONS = [
  { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
  { id: 'users',    icon: '👥', label: 'المستخدمون' },
  { id: 'courses',  icon: '📚', label: 'الكورسات' },
  { id: 'lessons',  icon: '📖', label: 'الدروس' },
  { id: 'quizzes',  icon: '🎯', label: 'الاختبارات' },
  { id: 'rewards',  icon: '🏆', label: 'المكافآت' },
];

const CATEGORIES = ['math','physics','arabic','french','english','history','science','philosophy','islamic','civil','other'];
const LEVELS     = ['bac_science','bac_literature','bac_math','bem','university','all'];
const SUBJECTS   = ['math','physics','arabic','french','english','history','science','philosophy','islamic','civil','other'];

// ── Tiny helpers ─────────────────────────────────────────────────
const Modal = ({ title, onClose, wide, children }) => (
  <div className="adm-overlay" onClick={onClose}>
    <div className={`adm-modal ${wide ? 'adm-modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="adm-modal-head">
        <h3>{title}</h3>
        <button className="adm-close" onClick={onClose}>✕</button>
      </div>
      <div className="adm-modal-body">{children}</div>
    </div>
  </div>
);

const Confirm = ({ msg, onYes, onNo }) => (
  <div className="adm-overlay" onClick={onNo}>
    <div className="adm-confirm" onClick={e => e.stopPropagation()}>
      <p>⚠️ {msg}</p>
      <div className="adm-confirm-btns">
        <button className="btn-danger" onClick={onYes}>تأكيد الحذف</button>
        <button className="btn-ghost" onClick={onNo}>إلغاء</button>
      </div>
    </div>
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div className={`adm-toast adm-toast-${type}`} onClick={onClose}>{msg} ✕</div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div className="adm-stat" style={{ borderRightColor: color }}>
    <span className="adm-stat-icon">{icon}</span>
    <div>
      <div className="adm-stat-val" style={{ color }}>{value ?? '—'}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [toast, setToast]     = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <div className="adm-root" dir="rtl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <aside className={`adm-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="adm-brand">
          <span>⚙️</span>
          {!collapsed && <span>لوحة الإدارة</span>}
        </div>
        <nav className="adm-nav">
          {SECTIONS.map(s => (
            <button key={s.id} title={s.label}
              className={`adm-nav-btn ${section === s.id ? 'active' : ''}`}
              onClick={() => setSection(s.id)}>
              <span className="adm-nav-icon">{s.icon}</span>
              {!collapsed && <span>{s.label}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-nav-btn" onClick={() => navigate('/dashboard')}>
            <span className="adm-nav-icon">🏠</span>
            {!collapsed && <span>العودة للموقع</span>}
          </button>
          <button className="adm-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {section === 'dashboard' && <DashSection />}
        {section === 'users'     && <UsersSection notify={notify} />}
        {section === 'courses'   && <CoursesSection notify={notify} />}
        {section === 'lessons'   && <LessonsSection notify={notify} />}
        {section === 'quizzes'   && <QuizzesSection notify={notify} />}
        {section === 'rewards'   && <RewardsSection notify={notify} />}
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
function DashSection() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setD(r.data)).catch(() => {});
  }, []);

  if (!d) return <div className="adm-loading">⏳ جاري التحميل...</div>;

  return (
    <div className="adm-section">
      <h2 className="adm-title">📊 نظرة عامة على المنصة</h2>
      <div className="adm-stats-grid">
        <StatCard icon="👥" label="الطلاب"        value={d.stats.totalUsers}    color="#00d97e" />
        <StatCard icon="📚" label="الكورسات"       value={d.stats.totalCourses}  color="#4da6ff" />
        <StatCard icon="📖" label="الدروس"         value={d.stats.totalLessons}  color="#a78bfa" />
        <StatCard icon="🎯" label="الاختبارات"     value={d.stats.totalQuizzes}  color="#f5c842" />
        <StatCard icon="🏆" label="المكافآت"       value={d.stats.totalRewards}  color="#ff4d6d" />
        <StatCard icon="🆕" label="مسجلون اليوم"  value={d.stats.newUsersToday} color="#fb923c" />
        <StatCard icon="🔥" label="نشطون (7 أيام)" value={d.stats.activeUsers}  color="#34d399" />
      </div>

      <div className="adm-two-col">
        <div className="adm-card">
          <h3>🏅 أفضل الكورسات</h3>
          <table className="adm-table">
            <thead><tr><th>الكورس</th><th>الطلاب</th><th>التقييم</th></tr></thead>
            <tbody>
              {(d.topCourses || []).map(c => (
                <tr key={c._id}>
                  <td>{c.titleAr}</td>
                  <td>{c.totalStudents || 0}</td>
                  <td>⭐ {c.rating?.toFixed(1) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-card">
          <h3>🆕 آخر المستخدمين</h3>
          <table className="adm-table">
            <thead><tr><th>الاسم</th><th>الدور</th><th>XP</th></tr></thead>
            <tbody>
              {(d.recentUsers || []).map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td><span className={`adm-badge adm-badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// USERS — with real-time delete & update
// ════════════════════════════════════════════════════════════════
function UsersSection({ notify }) {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [roleF, setRoleF]   = useState('');
  const [edit, setEdit]     = useState(null);
  const [del, setDel]       = useState(null);
  const [form, setForm]     = useState({});
  const [busy, setBusy]     = useState(false);

  const load = useCallback(() => {
    api.get('/admin/users', { params: { page, limit: 15, search, role: roleF } })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(() => {});
  }, [page, search, roleF]);

  useEffect(() => { load(); }, [load]);

  const openEdit = u => { setEdit(u); setForm({ role: u.role, isActive: u.isActive !== false, xp: u.xp, streak: u.streak }); };

  const saveEdit = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/admin/users/${edit._id}`, form);
      // Update in-place without reload
      setUsers(prev => prev.map(u => u._id === edit._id ? { ...u, ...data.user } : u));
      setEdit(null);
      notify('تم تحديث المستخدم ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/users/${del._id}`);
      // Remove from list immediately
      setUsers(prev => prev.filter(u => u._id !== del.id));
      setTotal(prev => prev - 1);
      setDel(null);
      notify('تم حذف المستخدم ✓');
      load(); // refresh to fix pagination
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const pages = Math.ceil(total / 15) || 1;

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-title">👥 المستخدمون <span className="adm-count">{total}</span></h2>
      </div>

      <div className="adm-toolbar">
        <input className="adm-input adm-search" placeholder="🔍 بحث بالاسم أو البريد..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="adm-select" value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1); }}>
          <option value="">كل الأدوار</option>
          <option value="student">طالب</option>
          <option value="instructor">محاضر</option>
          <option value="admin">مدير</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>الاسم</th><th>البريد</th><th>الدور</th><th>الولاية</th><th>XP</th><th>🔥</th><th>الحالة</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={9} style={{textAlign:'center',padding:32,color:'#94a3b8'}}>لا توجد نتائج</td></tr>}
            {users.map((u, i) => (
              <tr key={u._id}>
                <td className="adm-td-muted">{(page - 1) * 15 + i + 1}</td>
                <td><strong>{u.name}</strong></td>
                <td className="adm-td-muted">{u.email}</td>
                <td><span className={`adm-badge adm-badge-${u.role}`}>{u.role}</span></td>
                <td>{u.wilaya || '—'}</td>
                <td style={{color:'#f5c842',fontWeight:700}}>{u.xp}</td>
                <td>{u.streak || 0}</td>
                <td><span className={`adm-dot ${u.isActive !== false ? 'green' : 'red'}`}>{u.isActive !== false ? 'نشط' : 'موقوف'}</span></td>
                <td>
                  <button className="adm-btn-icon edit" onClick={() => openEdit(u)}>✏️</button>
                  <button className="adm-btn-icon del"  onClick={() => setDel(u)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {edit && (
        <Modal title={`تعديل: ${edit.name}`} onClose={() => setEdit(null)}>
          <div className="adm-form">
            <label>الدور</label>
            <select className="adm-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">طالب</option>
              <option value="instructor">محاضر</option>
              <option value="admin">مدير</option>
            </select>
            <label>XP</label>
            <input className="adm-input" type="number" min="0" value={form.xp}
              onChange={e => setForm({...form, xp: +e.target.value})} />
            <label>Streak (أيام)</label>
            <input className="adm-input" type="number" min="0" value={form.streak}
              onChange={e => setForm({...form, streak: +e.target.value})} />
            <label>الحالة</label>
            <select className="adm-select" value={String(form.isActive)}
              onChange={e => setForm({...form, isActive: e.target.value === 'true'})}>
              <option value="true">نشط ✓</option>
              <option value="false">موقوف ✗</option>
            </select>
            <div className="adm-form-actions">
              <button className="btn-primary" onClick={saveEdit} disabled={busy}>💾 حفظ</button>
              <button className="btn-ghost" onClick={() => setEdit(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {del && (
        <Confirm msg={`هل تريد حذف "${del.name}"؟ لا يمكن التراجع.`}
          onYes={doDelete} onNo={() => setDel(null)} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COURSES
// ════════════════════════════════════════════════════════════════
const EMPTY_COURSE = { titleAr:'', descriptionAr:'', category:'math', level:'bac_science', xpReward:100, isFeatured:false, isPublished:true, thumbnail:'' };

function CoursesSection({ notify }) {
  const [courses, setCourses] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_COURSE);
  const [del, setDel]         = useState(null);
  const [busy, setBusy]       = useState(false);

  const load = useCallback(() => {
    api.get('/admin/courses', { params: { page, limit: 12, search } })
      .then(r => { setCourses(r.data.courses || []); setTotal(r.data.total || 0); })
      .catch(() => {});
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({...EMPTY_COURSE}); setModal('add'); };
  const openEdit = c  => { setForm({ titleAr: c.titleAr, descriptionAr: c.descriptionAr, category: c.category, level: c.level, xpReward: c.xpReward, isFeatured: c.isFeatured, isPublished: c.isPublished, thumbnail: c.thumbnail || '' }); setModal(c); };

  const save = async () => {
    if (!form.titleAr.trim()) return notify('العنوان مطلوب', 'error');
    setBusy(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/admin/courses', form);
        setCourses(prev => [data.course, ...prev]);
        setTotal(prev => prev + 1);
      } else {
        const { data } = await api.put(`/admin/courses/${modal._id}`, form);
        setCourses(prev => prev.map(c => c._id === modal._id ? { ...c, ...data.course } : c));
      }
      setModal(null);
      notify(`تم ${modal === 'add' ? 'إضافة' : 'تحديث'} الكورس ✓`);
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/courses/${del._id}`);
      setCourses(prev => prev.filter(c => c._id !== del._id));
      setTotal(prev => prev - 1);
      setDel(null);
      notify('تم حذف الكورس ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));
  const pages = Math.ceil(total / 12) || 1;

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-title">📚 الكورسات <span className="adm-count">{total}</span></h2>
        <button className="btn-primary" onClick={openAdd}>＋ كورس جديد</button>
      </div>

      <div className="adm-toolbar">
        <input className="adm-input adm-search" placeholder="🔍 بحث..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>الكورس</th><th>التخصص</th><th>المستوى</th><th>الطلاب</th><th>الدروس</th><th>الحالة</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {courses.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'#94a3b8'}}>لا توجد كورسات</td></tr>}
            {courses.map(c => (
              <tr key={c._id}>
                <td>
                  <strong>{c.titleAr}</strong>
                  {c.isFeatured && <span className="adm-featured">⭐ مميز</span>}
                </td>
                <td><span className="adm-type">{c.category}</span></td>
                <td>{c.level}</td>
                <td>{c.totalStudents || 0}</td>
                <td>{c.totalLessons || 0}</td>
                <td><span className={`adm-dot ${c.isPublished ? 'green' : 'red'}`}>{c.isPublished ? 'منشور' : 'مسودة'}</span></td>
                <td>
                  <button className="adm-btn-icon edit" onClick={() => openEdit(c)}>✏️</button>
                  <button className="adm-btn-icon del"  onClick={() => setDel(c)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {modal !== null && (
        <Modal title={modal === 'add' ? '➕ كورس جديد' : `✏️ تعديل كورس`} onClose={() => setModal(null)} wide>
          <div className="adm-form">
            <label>عنوان الكورس *</label>
            <input className="adm-input" value={form.titleAr} onChange={e => f('titleAr', e.target.value)} placeholder="مثال: رياضيات الباكالوريا" />
            <label>الوصف</label>
            <textarea className="adm-textarea" rows={3} value={form.descriptionAr} onChange={e => f('descriptionAr', e.target.value)} placeholder="وصف مختصر..." />
            <div className="adm-two-inputs">
              <div>
                <label>التخصص</label>
                <select className="adm-select" value={form.category} onChange={e => f('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>المستوى</label>
                <select className="adm-select" value={form.level} onChange={e => f('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-two-inputs">
              <div>
                <label>مكافأة XP</label>
                <input className="adm-input" type="number" value={form.xpReward} onChange={e => f('xpReward', +e.target.value)} />
              </div>
              <div>
                <label>رابط الصورة</label>
                <input className="adm-input" value={form.thumbnail} onChange={e => f('thumbnail', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="adm-checks">
              <label className="adm-check"><input type="checkbox" checked={form.isPublished} onChange={e => f('isPublished', e.target.checked)} /> منشور</label>
              <label className="adm-check"><input type="checkbox" checked={form.isFeatured} onChange={e => f('isFeatured', e.target.checked)} /> مميز (featured)</label>
            </div>
            <div className="adm-form-actions">
              <button className="btn-primary" onClick={save} disabled={busy}>💾 حفظ</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <Confirm msg={`هل تريد حذف كورس "${del.titleAr}"؟ سيُحذف مع كل دروسه.`} onYes={doDelete} onNo={() => setDel(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// LESSONS
// ════════════════════════════════════════════════════════════════
const EMPTY_LESSON = { titleAr:'', content:'', course:'', order:1, type:'article', videoUrl:'', xpReward:10, duration:10, isPublished:true };

function LessonsSection({ notify }) {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter]   = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_LESSON);
  const [del, setDel]         = useState(null);
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    api.get('/admin/courses', { params: { limit: 100 } }).then(r => setCourses(r.data.courses || []));
  }, []);

  const load = useCallback(() => {
    api.get('/admin/lessons', { params: filter ? { courseId: filter } : {} })
      .then(r => setLessons(r.data.lessons || [])).catch(() => {});
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({...EMPTY_LESSON, course: filter || ''}); setModal('add'); };
  const openEdit = l  => { setForm({ titleAr: l.titleAr, content: l.content || '', course: l.course?._id || l.course, order: l.order, type: l.type, videoUrl: l.videoUrl || '', xpReward: l.xpReward, duration: l.duration, isPublished: l.isPublished }); setModal(l); };

  const save = async () => {
    if (!form.titleAr.trim()) return notify('العنوان مطلوب', 'error');
    if (!form.course) return notify('اختر الكورس', 'error');
    setBusy(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/admin/lessons', form);
        setLessons(prev => [...prev, data.lesson]);
      } else {
        const { data } = await api.put(`/admin/lessons/${modal._id}`, form);
        setLessons(prev => prev.map(l => l._id === modal._id ? { ...l, ...data.lesson } : l));
      }
      setModal(null);
      notify('تم حفظ الدرس ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/lessons/${del._id}`);
      setLessons(prev => prev.filter(l => l._id !== del._id));
      setDel(null);
      notify('تم حذف الدرس ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-title">📖 الدروس <span className="adm-count">{lessons.length}</span></h2>
        <button className="btn-primary" onClick={openAdd}>＋ درس جديد</button>
      </div>

      <div className="adm-toolbar">
        <select className="adm-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">كل الكورسات</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.titleAr}</option>)}
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>عنوان الدرس</th><th>الكورس</th><th>النوع</th><th>المدة</th><th>XP</th><th>الحالة</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {lessons.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'#94a3b8'}}>لا توجد دروس</td></tr>}
            {lessons.map(l => (
              <tr key={l._id}>
                <td className="adm-td-muted">{l.order}</td>
                <td><strong>{l.titleAr}</strong></td>
                <td className="adm-td-muted">{l.course?.titleAr || '—'}</td>
                <td><span className="adm-type">{l.type}</span></td>
                <td>{l.duration} د</td>
                <td style={{color:'#f5c842'}}>+{l.xpReward}</td>
                <td><span className={`adm-dot ${l.isPublished ? 'green' : 'red'}`}>{l.isPublished ? 'منشور' : 'مسودة'}</span></td>
                <td>
                  <button className="adm-btn-icon edit" onClick={() => openEdit(l)}>✏️</button>
                  <button className="adm-btn-icon del"  onClick={() => setDel(l)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal title={modal === 'add' ? '➕ درس جديد' : '✏️ تعديل درس'} onClose={() => setModal(null)} wide>
          <div className="adm-form">
            <label>الكورس *</label>
            <select className="adm-select" value={form.course} onChange={e => f('course', e.target.value)}>
              <option value="">اختر الكورس</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.titleAr}</option>)}
            </select>
            <label>عنوان الدرس *</label>
            <input className="adm-input" value={form.titleAr} onChange={e => f('titleAr', e.target.value)} placeholder="عنوان الدرس" />
            <div className="adm-two-inputs">
              <div>
                <label>النوع</label>
                <select className="adm-select" value={form.type} onChange={e => f('type', e.target.value)}>
                  <option value="article">مقال 📄</option>
                  <option value="video">فيديو 🎬</option>
                  <option value="pdf">PDF 📑</option>
                  <option value="exercise">تمرين ✍️</option>
                </select>
              </div>
              <div>
                <label>الترتيب</label>
                <input className="adm-input" type="number" min="1" value={form.order} onChange={e => f('order', +e.target.value)} />
              </div>
            </div>
            {form.type === 'video' && (
              <>
                <label>رابط الفيديو (YouTube)</label>
                <input className="adm-input" value={form.videoUrl} onChange={e => f('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </>
            )}
            <label>المحتوى</label>
            <textarea className="adm-textarea" rows={8} value={form.content} onChange={e => f('content', e.target.value)} placeholder="محتوى الدرس... يمكن استخدام HTML" />
            <div className="adm-two-inputs">
              <div>
                <label>المدة (دقائق)</label>
                <input className="adm-input" type="number" min="1" value={form.duration} onChange={e => f('duration', +e.target.value)} />
              </div>
              <div>
                <label>مكافأة XP</label>
                <input className="adm-input" type="number" min="0" value={form.xpReward} onChange={e => f('xpReward', +e.target.value)} />
              </div>
            </div>
            <label className="adm-check"><input type="checkbox" checked={form.isPublished} onChange={e => f('isPublished', e.target.checked)} /> منشور</label>
            <div className="adm-form-actions">
              <button className="btn-primary" onClick={save} disabled={busy}>💾 حفظ</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <Confirm msg={`هل تريد حذف درس "${del.titleAr}"؟`} onYes={doDelete} onNo={() => setDel(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QUIZZES
// ════════════════════════════════════════════════════════════════
const EMPTY_Q    = { text:'', options:[{text:'',isCorrect:true},{text:'',isCorrect:false},{text:'',isCorrect:false},{text:'',isCorrect:false}], explanation:'', difficulty:'medium', points:10 };
const EMPTY_QUIZ = { titleAr:'', description:'', subject:'math', level:'bac_science', type:'practice', timeLimit:30, passingScore:60, xpReward:50, isPublished:true, questions:[{...EMPTY_Q}] };

function QuizzesSection({ notify }) {
  const [quizzes, setQuizzes] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(null);
  const [del, setDel]         = useState(null);
  const [busy, setBusy]       = useState(false);

  const load = useCallback(() => {
    api.get('/admin/quizzes', { params: { page, limit: 12, search } })
      .then(r => { setQuizzes(r.data.quizzes || []); setTotal(r.data.total || 0); })
      .catch(() => {});
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(JSON.parse(JSON.stringify(EMPTY_QUIZ))); setModal('add'); };
  const openEdit = q  => { setForm(JSON.parse(JSON.stringify(q))); setModal(q); };

  const save = async () => {
    if (!form.titleAr.trim()) return notify('العنوان مطلوب', 'error');
    if (!form.questions?.length) return notify('أضف سؤالاً واحداً على الأقل', 'error');
    setBusy(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/admin/quizzes', form);
        setQuizzes(prev => [data.quiz, ...prev]);
        setTotal(prev => prev + 1);
      } else {
        const { data } = await api.put(`/admin/quizzes/${modal._id}`, form);
        setQuizzes(prev => prev.map(q => q._id === modal._id ? { ...q, ...data.quiz } : q));
      }
      setModal(null);
      notify('تم حفظ الاختبار ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/quizzes/${del._id}`);
      setQuizzes(prev => prev.filter(q => q._id !== del._id));
      setTotal(prev => prev - 1);
      setDel(null);
      notify('تم حذف الاختبار ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const fq = (k, v) => setForm(p => ({...p, [k]: v}));
  const addQ = () => setForm(p => ({...p, questions: [...p.questions, JSON.parse(JSON.stringify(EMPTY_Q))]}));
  const removeQ = i => setForm(p => ({...p, questions: p.questions.filter((_, idx) => idx !== i)}));
  const setQ = (i, k, v) => setForm(p => { const qs = [...p.questions]; qs[i] = {...qs[i], [k]: v}; return {...p, questions: qs}; });
  const setOpt = (qi, oi, k, v) => setForm(p => {
    const qs = [...p.questions];
    const opts = [...qs[qi].options];
    if (k === 'isCorrect') opts.forEach((o, idx) => { o.isCorrect = idx === oi; });
    else opts[oi] = {...opts[oi], [k]: v};
    qs[qi] = {...qs[qi], options: opts};
    return {...p, questions: qs};
  });

  const pages = Math.ceil(total / 12) || 1;

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-title">🎯 الاختبارات <span className="adm-count">{total}</span></h2>
        <button className="btn-primary" onClick={openAdd}>＋ اختبار جديد</button>
      </div>

      <div className="adm-toolbar">
        <input className="adm-input adm-search" placeholder="🔍 بحث..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>عنوان الاختبار</th><th>المادة</th><th>النوع</th><th>الأسئلة</th><th>الوقت</th><th>XP</th><th>المحاولات</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {quizzes.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'#94a3b8'}}>لا توجد اختبارات</td></tr>}
            {quizzes.map(q => (
              <tr key={q._id}>
                <td><strong>{q.titleAr}</strong></td>
                <td><span className="adm-type">{q.subject}</span></td>
                <td>{q.type}</td>
                <td>{q.questions?.length || 0} سؤال</td>
                <td>{q.timeLimit} ث</td>
                <td style={{color:'#f5c842'}}>+{q.xpReward}</td>
                <td>{q.attempts || 0}</td>
                <td>
                  <button className="adm-btn-icon edit" onClick={() => openEdit(q)}>✏️</button>
                  <button className="adm-btn-icon del"  onClick={() => setDel(q)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />

      {modal !== null && form && (
        <Modal title={modal === 'add' ? '➕ اختبار جديد' : '✏️ تعديل اختبار'} onClose={() => setModal(null)} wide>
          <div className="adm-form">
            <h4 className="adm-sub-head">📋 معلومات الاختبار</h4>
            <label>العنوان *</label>
            <input className="adm-input" value={form.titleAr} onChange={e => fq('titleAr', e.target.value)} placeholder="عنوان الاختبار" />
            <div className="adm-two-inputs">
              <div>
                <label>المادة</label>
                <select className="adm-select" value={form.subject} onChange={e => fq('subject', e.target.value)}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>النوع</label>
                <select className="adm-select" value={form.type} onChange={e => fq('type', e.target.value)}>
                  <option value="practice">تدريب</option>
                  <option value="exam">اختبار رسمي</option>
                  <option value="challenge">تحدي</option>
                  <option value="lesson_quiz">اختبار درس</option>
                </select>
              </div>
            </div>
            <div className="adm-two-inputs">
              <div>
                <label>وقت كل سؤال (ثانية)</label>
                <input className="adm-input" type="number" min="5" value={form.timeLimit} onChange={e => fq('timeLimit', +e.target.value)} />
              </div>
              <div>
                <label>نسبة النجاح %</label>
                <input className="adm-input" type="number" min="0" max="100" value={form.passingScore} onChange={e => fq('passingScore', +e.target.value)} />
              </div>
            </div>
            <div className="adm-two-inputs">
              <div>
                <label>مكافأة XP</label>
                <input className="adm-input" type="number" min="0" value={form.xpReward} onChange={e => fq('xpReward', +e.target.value)} />
              </div>
              <div>
                <label>المستوى</label>
                <select className="adm-select" value={form.level} onChange={e => fq('level', e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <label className="adm-check"><input type="checkbox" checked={form.isPublished} onChange={e => fq('isPublished', e.target.checked)} /> منشور</label>

            <h4 className="adm-sub-head">❓ الأسئلة ({form.questions?.length})</h4>

            {form.questions?.map((q, qi) => (
              <div className="adm-question" key={qi}>
                <div className="adm-q-head">
                  <span className="adm-q-num">س{qi + 1}</span>
                  <select className="adm-select adm-select-sm" value={q.difficulty} onChange={e => setQ(qi, 'difficulty', e.target.value)}>
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                  <input className="adm-input" style={{width:80}} type="number" min="1" value={q.points} onChange={e => setQ(qi, 'points', +e.target.value)} placeholder="نقاط" />
                  {form.questions.length > 1 && (
                    <button className="adm-btn-icon del" onClick={() => removeQ(qi)}>🗑️</button>
                  )}
                </div>
                <textarea className="adm-textarea" rows={2} value={q.text}
                  onChange={e => setQ(qi, 'text', e.target.value)} placeholder="نص السؤال..." />
                <div className="adm-options">
                  {q.options.map((opt, oi) => (
                    <div className={`adm-option ${opt.isCorrect ? 'correct' : ''}`} key={oi}>
                      <input type="radio" name={`q${qi}-correct`} checked={opt.isCorrect}
                        onChange={() => setOpt(qi, oi, 'isCorrect', true)} />
                      <input className="adm-input" value={opt.text}
                        onChange={e => setOpt(qi, oi, 'text', e.target.value)}
                        placeholder={['أ','ب','ج','د'][oi] + ' — الخيار'} />
                    </div>
                  ))}
                </div>
                <input className="adm-input" value={q.explanation || ''}
                  onChange={e => setQ(qi, 'explanation', e.target.value)}
                  placeholder="💡 شرح الإجابة الصحيحة (اختياري)" />
              </div>
            ))}

            <button className="adm-add-q" onClick={addQ}>＋ إضافة سؤال</button>

            <div className="adm-form-actions">
              <button className="btn-primary" onClick={save} disabled={busy}>💾 حفظ الاختبار</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <Confirm msg={`هل تريد حذف اختبار "${del.titleAr}"؟`} onYes={doDelete} onNo={() => setDel(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// REWARDS
// ════════════════════════════════════════════════════════════════
const EMPTY_REWARD = { title:'', description:'', type:'badge', icon:'🏆', xpRequired:0, streakRequired:0, coursesRequired:0, quizzesRequired:0, maxClaims:0, isActive:true };
const ICONS = ['🏆','🥇','🥈','🥉','⭐','🌟','💎','🎖️','🔥','💪','🧠','📚','🎯','🚀','👑','💡','🎓','⚡','🌙','✨'];
const RTYPES = [['badge','شارة'],['certificate','شهادة'],['prize','جائزة'],['discount','خصم'],['other','أخرى']];

function RewardsSection({ notify }) {
  const [rewards, setRewards] = useState([]);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_REWARD);
  const [del, setDel]         = useState(null);
  const [grant, setGrant]     = useState(null);
  const [userId, setUserId]   = useState('');
  const [busy, setBusy]       = useState(false);

  const load = () => api.get('/admin/rewards').then(r => setRewards(r.data.rewards || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm({...EMPTY_REWARD}); setModal('add'); };
  const openEdit = r  => { setForm({ title: r.title, description: r.description, type: r.type, icon: r.icon, xpRequired: r.xpRequired, streakRequired: r.streakRequired, coursesRequired: r.coursesRequired, quizzesRequired: r.quizzesRequired, maxClaims: r.maxClaims, isActive: r.isActive }); setModal(r); };

  const save = async () => {
    if (!form.title.trim()) return notify('العنوان مطلوب', 'error');
    setBusy(true);
    try {
      if (modal === 'add') {
        const { data } = await api.post('/admin/rewards', form);
        setRewards(prev => [data.reward, ...prev]);
      } else {
        const { data } = await api.put(`/admin/rewards/${modal._id}`, form);
        setRewards(prev => prev.map(r => r._id === modal._id ? { ...r, ...data.reward } : r));
      }
      setModal(null);
      notify('تم حفظ المكافأة ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/rewards/${del._id}`);
      setRewards(prev => prev.filter(r => r._id !== del._id));
      setDel(null);
      notify('تم حذف المكافأة ✓');
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const doGrant = async () => {
    if (!userId.trim()) return notify('أدخل ID المستخدم', 'error');
    setBusy(true);
    try {
      await api.post(`/admin/rewards/${grant._id}/grant`, { userId });
      setGrant(null); setUserId('');
      notify('تم منح المكافأة ✓');
      load();
    } catch (e) { notify(e.response?.data?.message || 'خطأ', 'error'); }
    finally { setBusy(false); }
  };

  const f = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div className="adm-section">
      <div className="adm-section-head">
        <h2 className="adm-title">🏆 المكافآت <span className="adm-count">{rewards.length}</span></h2>
        <button className="btn-primary" onClick={openAdd}>＋ مكافأة جديدة</button>
      </div>

      {rewards.length === 0 && <div className="adm-empty">لا توجد مكافآت — أضف أول مكافأة!</div>}

      <div className="adm-rewards-grid">
        {rewards.map(r => (
          <div className="adm-reward-card" key={r._id}>
            <div className="adm-reward-icon">{r.icon}</div>
            <div className="adm-reward-body">
              <h4>{r.title}</h4>
              <p>{r.description}</p>
              <div className="adm-reward-meta">
                <span className={`adm-badge adm-badge-${r.type}`}>{r.type}</span>
                {r.xpRequired    > 0 && <span>⚡ {r.xpRequired} XP</span>}
                {r.streakRequired > 0 && <span>🔥 {r.streakRequired} يوم</span>}
                {r.coursesRequired > 0 && <span>📚 {r.coursesRequired} كورس</span>}
                <span className={`adm-dot ${r.isActive ? 'green' : 'red'}`}>{r.isActive ? 'نشطة' : 'موقوفة'}</span>
              </div>
              <div className="adm-reward-claimed">تم الاستلام: <strong>{r.totalClaimed}</strong>{r.maxClaims > 0 && ` / ${r.maxClaims}`} مرة</div>
            </div>
            <div className="adm-card-col-actions">
              <button className="adm-btn-icon edit"  onClick={() => openEdit(r)}>✏️</button>
              <button className="adm-btn-icon grant" onClick={() => { setGrant(r); setUserId(''); }} title="منح لمستخدم">🎁</button>
              <button className="adm-btn-icon del"   onClick={() => setDel(r)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <Modal title={modal === 'add' ? '➕ مكافأة جديدة' : '✏️ تعديل مكافأة'} onClose={() => setModal(null)} wide>
          <div className="adm-form">
            <label>العنوان *</label>
            <input className="adm-input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="مثال: بطل الرياضيات" />
            <label>الوصف *</label>
            <textarea className="adm-textarea" rows={2} value={form.description} onChange={e => f('description', e.target.value)} placeholder="وصف المكافأة..." />
            <div className="adm-two-inputs">
              <div>
                <label>النوع</label>
                <select className="adm-select" value={form.type} onChange={e => f('type', e.target.value)}>
                  {RTYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label>الأيقونة</label>
                <div className="adm-icon-picker">
                  {ICONS.map(ic => (
                    <button type="button" key={ic} className={`adm-icon-btn ${form.icon === ic ? 'selected' : ''}`}
                      onClick={() => f('icon', ic)}>{ic}</button>
                  ))}
                </div>
              </div>
            </div>
            <h4 className="adm-sub-head">شروط الحصول على المكافأة (0 = بدون شرط)</h4>
            <div className="adm-two-inputs">
              <div><label>⚡ XP مطلوب</label><input className="adm-input" type="number" min="0" value={form.xpRequired} onChange={e => f('xpRequired', +e.target.value)} /></div>
              <div><label>🔥 Streak (أيام)</label><input className="adm-input" type="number" min="0" value={form.streakRequired} onChange={e => f('streakRequired', +e.target.value)} /></div>
            </div>
            <div className="adm-two-inputs">
              <div><label>📚 كورسات مكتملة</label><input className="adm-input" type="number" min="0" value={form.coursesRequired} onChange={e => f('coursesRequired', +e.target.value)} /></div>
              <div><label>🎯 اختبارات مكتملة</label><input className="adm-input" type="number" min="0" value={form.quizzesRequired} onChange={e => f('quizzesRequired', +e.target.value)} /></div>
            </div>
            <label>الحد الأقصى للاستلام (0 = بلا حد)</label>
            <input className="adm-input" type="number" min="0" value={form.maxClaims} onChange={e => f('maxClaims', +e.target.value)} />
            <label className="adm-check"><input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} /> نشطة</label>
            <div className="adm-form-actions">
              <button className="btn-primary" onClick={save} disabled={busy}>💾 حفظ</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {grant && (
        <Modal title={`🎁 منح: ${grant.title}`} onClose={() => setGrant(null)}>
          <div className="adm-form">
            <p style={{color:'#94a3b8',fontSize:'0.9rem'}}>انسخ ID المستخدم من جدول المستخدمين ثم الصقه هنا:</p>
            <label>ID المستخدم</label>
            <input className="adm-input" value={userId} onChange={e => setUserId(e.target.value)} placeholder="مثال: 64abc123..." />
            <div className="adm-form-actions">
              <button className="btn-primary" onClick={doGrant} disabled={busy || !userId.trim()}>🎁 منح المكافأة</button>
              <button className="btn-ghost" onClick={() => setGrant(null)}>إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {del && <Confirm msg={`هل تريد حذف مكافأة "${del.title}"؟`} onYes={doDelete} onNo={() => setDel(null)} />}
    </div>
  );
}

// ── Shared Pagination ────────────────────────────────────────────
function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="adm-pagination">
      <button disabled={page === 1} onClick={() => onChange(p => p - 1)}>◀ السابق</button>
      <span>صفحة {page} من {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(p => p + 1)}>التالي ▶</button>
    </div>
  );
}
