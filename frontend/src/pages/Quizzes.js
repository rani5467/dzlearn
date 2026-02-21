import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Quizzes.css';

const SUBJECTS = [
  { id: 'all', label: 'الكل', icon: '🌟' },
  { id: 'math', label: 'الرياضيات', icon: '📐' },
  { id: 'physics', label: 'الفيزياء', icon: '⚡' },
  { id: 'arabic', label: 'العربية', icon: '📜' },
  { id: 'french', label: 'الفرنسية', icon: '🗼' },
  { id: 'english', label: 'الإنجليزية', icon: '🌍' },
  { id: 'history', label: 'التاريخ', icon: '🏛️' },
  { id: 'chemistry', label: 'الكيمياء', icon: '🧪' },
];

// Quiz listing view
function QuizList({ onStart }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('all');

  useEffect(() => {
    API.get(`/quizzes?subject=${subject}`)
      .then(r => setQuizzes(r.data.quizzes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎯 الاختبارات التدريبية</h1>
        <p className="page-sub">اختبر معرفتك وتدرب على أسئلة الباكالوريا الحقيقية</p>
      </div>

      {/* Subject filter */}
      <div className="scroll-x mb-6">
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            className={`cat-filter-btn ${subject === s.id ? 'active' : ''}`}
            onClick={() => setSubject(s.id)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="ad-zone ad-banner mb-6">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag</span>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" /></div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card card card-hover">
              <div className="quiz-card-header">
                <span className="badge badge-green">{SUBJECTS.find(s => s.id === quiz.subject)?.icon} {SUBJECTS.find(s => s.id === quiz.subject)?.label}</span>
                <span className="badge badge-blue">{quiz.questions?.length} سؤال</span>
              </div>
              <h3 className="quiz-card-title">{quiz.titleAr}</h3>
              <div className="quiz-card-meta">
                <span>⏱ {quiz.timeLimit} دقيقة</span>
                <span>✅ النجاح: {quiz.passingScore}%</span>
                <span>⚡ +{quiz.xpReward} XP</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => onStart(quiz._id)}>
                ابدأ الاختبار ←
              </button>
            </div>
          ))}
          {quizzes.length === 0 && (
            <div className="empty-courses" style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: '3rem' }}>📭</div>
              <p>لا توجد اختبارات في هذه المادة حالياً</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Active quiz view
function ActiveQuiz({ quizId, onFinish }) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStartTime] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    API.get(`/quizzes/${quizId}`)
      .then(r => { setQuiz(r.data.quiz); setLoading(false); })
      .catch(console.error);
  }, [quizId]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!answered) handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [answered]);

  useEffect(() => {
    if (quiz) startTimer();
    return () => clearInterval(timerRef.current);
  }, [quiz, currentQ]);

  const handleAnswer = (optIndex) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(optIndex);
    setAnswered(true);
    const q = quiz.questions[currentQ];
    setAnswers(prev => [...prev, { questionId: q._id, selectedOption: optIndex }]);
  };

  const handleNext = async () => {
    if (currentQ + 1 >= quiz.questions.length) {
      // Submit
      try {
        const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
        const res = await API.post(`/quizzes/${quizId}/submit`, {
          answers,
          timeSpent
        });
        onFinish(res.data, quiz);
      } catch (e) {
        console.error(e);
      }
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>;
  if (!quiz) return <div>خطأ في تحميل الاختبار</div>;

  const q = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const isUrgent = timeLeft <= 5;

  // Find correct answer index for display after answering
  const correctIdx = answered ? q.options.findIndex(o => o.isCorrect) : -1;

  return (
    <div className="active-quiz animate-fade">
      {/* Quiz header */}
      <div className="quiz-progress-header">
        <div className="quiz-info">
          <span className="badge badge-green">{quiz.titleAr}</span>
          <span className="quiz-q-counter">{currentQ + 1} / {quiz.questions.length}</span>
        </div>
        <div className="quiz-progress-bar-wrap">
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={`quiz-timer ${isUrgent ? 'urgent' : ''}`}>
          {timeLeft}ث
        </div>
      </div>

      {/* Show mid-quiz ad at halfway */}
      {currentQ === Math.floor(quiz.questions.length / 2) && (
        <div className="ad-zone ad-banner mb-4">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag</span>
        </div>
      )}

      {/* Question */}
      <div className="question-card card animate-slide">
        <div className="question-num">السؤال {currentQ + 1}</div>
        <p className="question-text">{q.text}</p>
      </div>

      {/* Options */}
      <div className="options-grid">
        {q.options.map((opt, i) => {
          let cls = 'option-btn';
          if (answered) {
            if (i === correctIdx) cls += ' correct';
            else if (i === selected && selected !== correctIdx) cls += ' wrong';
            else cls += ' disabled';
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(i)}
              disabled={answered}
            >
              <span className="option-letter">{'أبجد'[i] || i + 1}</span>
              <span className="option-text">{opt.text}</span>
              {answered && i === correctIdx && <span className="option-check">✓</span>}
              {answered && i === selected && selected !== correctIdx && <span className="option-x">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && q.explanation && (
        <div className="explanation-box animate-fade">
          <strong>💡 الشرح:</strong> {q.explanation}
        </div>
      )}

      {/* Next button */}
      {answered && (
        <button className="btn btn-primary btn-full mt-4 animate-fade" onClick={handleNext}>
          {currentQ + 1 >= quiz.questions.length ? '📊 رؤية النتائج' : 'السؤال التالي →'}
        </button>
      )}
    </div>
  );
}

// Results view
function QuizResults({ results, quiz, onRetry, onBack }) {
  const { percentage, score, total, passed, xpEarned, results: questionResults } = results;

  const shareText = `🎯 حصلت على ${score}/${total} (${percentage}%) في اختبار ${quiz?.titleAr}!\n⚡ +${xpEarned} XP\nجرّب معي: https://dzlearn.dz`;

  return (
    <div className="quiz-results animate-slide">
      {/* Score circle */}
      <div className="results-header">
        <div
          className="score-donut"
          style={{ '--pct': `${percentage}%`, '--color': passed ? 'var(--primary)' : 'var(--red)' }}
        >
          <div className="score-inner">
            <div className="score-big" style={{ color: passed ? 'var(--primary)' : 'var(--red)' }}>
              {percentage}%
            </div>
            <div className="score-sub">{score} / {total}</div>
          </div>
        </div>
        <div className="results-verdict">
          <h2>{passed ? '🎉 ممتاز! اجتزت الاختبار' : '💪 تحتاج مزيداً من التدريب'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {passed ? 'أداء رائع! استمر في هذا المستوى.' : 'لا تستسلم! التكرار هو مفتاح النجاح.'}
          </p>
          <div className="xp-earned-badge">
            ⚡ +{xpEarned} XP مكتسبة
          </div>
        </div>
      </div>

      {/* Ad — high viewability moment */}
      <div className="ad-zone ad-rectangle mb-6">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>إعلان — Monetag 300×250 (لحظة مشاهدة عالية)</span>
      </div>

      {/* Question review */}
      <h3 className="mb-4">📋 مراجعة الأسئلة</h3>
      <div className="review-list">
        {questionResults?.map((r, i) => (
          <div key={i} className={`review-item ${r.isCorrect ? 'correct' : 'wrong'}`}>
            <div className="review-q">{r.isCorrect ? '✅' : '❌'} {r.text}</div>
            {!r.isCorrect && r.explanation && (
              <div className="review-exp">💡 {r.explanation}</div>
            )}
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="share-section card mt-6">
        <h3 className="mb-3">📤 شارك نتيجتك</h3>
        <div className="share-text-box">{shareText}</div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-full"
          style={{ background: '#25D366', color: '#fff', marginTop: 12 }}
        >
          📱 مشاركة على واتساب
        </a>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-ghost" onClick={onRetry}>🔁 إعادة الاختبار</button>
        <button className="btn btn-ghost" onClick={onBack}>📚 اختبار آخر</button>
        <Link to="/leaderboard" className="btn btn-outline">🏆 الترتيب</Link>
      </div>
    </div>
  );
}

// Main page component
export default function Quizzes() {
  const [view, setView] = useState('list'); // list | quiz | results
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [activeQuizData, setActiveQuizData] = useState(null);

  const handleStart = (quizId) => {
    setActiveQuizId(quizId);
    setView('quiz');
    window.scrollTo(0, 0);
  };

  const handleFinish = (results, quiz) => {
    setQuizResults(results);
    setActiveQuizData(quiz);
    setView('results');
    window.scrollTo(0, 0);
  };

  return (
    <main className="quizzes-page">
      <div className="container">
        {view === 'list' && <QuizList onStart={handleStart} />}
        {view === 'quiz' && (
          <ActiveQuiz
            quizId={activeQuizId}
            onFinish={handleFinish}
          />
        )}
        {view === 'results' && (
          <QuizResults
            results={quizResults}
            quiz={activeQuizData}
            onRetry={() => handleStart(activeQuizId)}
            onBack={() => { setView('list'); setQuizResults(null); }}
          />
        )}
      </div>
      <div style={{ height: 80 }} />
    </main>
  );
}
