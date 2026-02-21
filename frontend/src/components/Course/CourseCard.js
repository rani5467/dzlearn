import { Link } from 'react-router-dom';
import './CourseCard.css';

const CATEGORY_LABELS = {
  math: 'الرياضيات', physics: 'الفيزياء', chemistry: 'الكيمياء',
  arabic: 'العربية', french: 'الفرنسية', english: 'الإنجليزية',
  history: 'التاريخ', biology: 'العلوم الطبيعية', philosophy: 'الفلسفة',
  islamic: 'التربية الإسلامية', informatics: 'الإعلام الآلي'
};

const LEVEL_LABELS = {
  bem: 'البيام', bac_science: 'باك علوم', bac_literature: 'باك آداب',
  bac_math: 'باك رياضيات', university: 'جامعي', all: 'جميع المستويات'
};

const CATEGORY_ICONS = {
  math: '📐', physics: '⚡', chemistry: '🧪', arabic: '📜',
  french: '🗼', english: '🌍', history: '🏛️', biology: '🌿',
  philosophy: '🧠', islamic: '☪️', informatics: '💻'
};

export default function CourseCard({ course }) {
  const catClass = `cat-${course.category}`;

  return (
    <Link to={`/courses/${course._id}`} className={`course-card card-hover ${catClass}`}>
      {/* Thumbnail or gradient */}
      <div className="course-thumb">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.titleAr} />
        ) : (
          <div className="course-thumb-gradient">
            <span className="course-icon">{CATEGORY_ICONS[course.category] || '📚'}</span>
          </div>
        )}
        {course.isFeatured && <div className="featured-badge">⭐ مميز</div>}
      </div>

      {/* Content */}
      <div className="course-body">
        <div className="course-meta-top">
          <span className={`badge badge-green`}>{CATEGORY_LABELS[course.category]}</span>
          <span className={`badge badge-blue`}>{LEVEL_LABELS[course.level]}</span>
        </div>

        <h3 className="course-title">{course.titleAr}</h3>
        <p className="course-desc">{course.descriptionAr}</p>

        <div className="course-instructor">
          <div className="inst-avatar">أ</div>
          <span>{course.instructor?.name || 'أستاذ المنصة'}</span>
        </div>

        <div className="course-footer">
          <div className="course-stats">
            <span>👥 {course.totalStudents?.toLocaleString('ar-DZ')}</span>
            <span>📖 {course.totalLessons} درس</span>
          </div>
          <div className="course-rating">
            <span className="stars">{'★'.repeat(Math.round(course.rating || 0))}</span>
            <span className="rating-num">{course.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
