import { useState, useEffect } from 'react';
import API from '../utils/api';
import CourseCard from '../components/Course/CourseCard';
import './Courses.css';

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
  { id: 'philosophy', label: 'الفلسفة', icon: '🧠' },
  { id: 'informatics', label: 'الإعلام الآلي', icon: '💻' },
];

const LEVELS = [
  { id: 'all', label: 'كل المستويات' },
  { id: 'bem', label: 'البيام' },
  { id: 'bac_science', label: 'باك علوم' },
  { id: 'bac_literature', label: 'باك آداب' },
  { id: 'bac_math', label: 'باك رياضيات' },
  { id: 'university', label: 'جامعي' },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [category, level, page]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, level, page, limit: 9 });
      if (search) params.set('search', search);
      const { data } = await API.get(`/courses?${params}`);
      setCourses(data.courses);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <main className="courses-page">
      <div className="container">
        <div className="page-header animate-fade">
          <h1 className="page-title">📚 الدورات التعليمية</h1>
          <p className="page-sub">اختر دورتك وابدأ رحلتك نحو النجاح في البكالوريا</p>
        </div>

        {/* Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="form-input search-input"
            placeholder="🔍 ابحث عن دورة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">بحث</button>
        </form>

        {/* Filters */}
        <div className="filters-row">
          <div className="scroll-x">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-filter-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => { setCategory(cat.id); setPage(1); }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <select
            className="form-input form-select level-select"
            value={level}
            onChange={e => { setLevel(e.target.value); setPage(1); }}
          >
            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        {/* Ad Banner */}
        <div className="ad-zone ad-banner mb-6">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag</span>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="results-count">{total} دورة متاحة</p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="courses-grid-page">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="course-skeleton" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="courses-grid-page">
              {courses.map(c => <CourseCard key={c._id} course={c} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  ← السابق
                </button>
                <span className="page-info">{page} / {pages}</span>
                <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  التالي →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-courses">
            <div style={{ fontSize: '4rem' }}>📭</div>
            <h3>لا توجد دورات بهذه المعايير</h3>
            <p>جرّب تغيير الفلتر أو البحث بكلمة مختلفة</p>
          </div>
        )}
      </div>
      <div style={{ height: 80 }} />
    </main>
  );
}
