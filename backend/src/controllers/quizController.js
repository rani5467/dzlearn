const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const { subject, level, type } = req.query;
    const query = { isPublished: true };
    if (subject && subject !== 'all') query.subject = subject;
    if (level && level !== 'all') query.level = { $in: [level, 'all'] };
    if (type) query.type = type;

    const quizzes = await Quiz.find(query)
      .select('-questions.options.isCorrect')
      .sort({ createdAt: -1 });

    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الاختبارات' });
  }
};

// @GET /api/quizzes/:id
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.options.isCorrect');

    if (!quiz) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });

    quiz.attempts += 1;
    await quiz.save({ validateBeforeSave: false });

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الاختبار' });
  }
};

// @POST /api/quizzes/:id/submit
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });

    const { answers, timeSpent } = req.body; // answers: [{questionId, selectedOption}]

    let correct = 0;
    const results = quiz.questions.map((question) => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      const selectedIndex = userAnswer ? userAnswer.selectedOption : -1;
      const isCorrect = selectedIndex >= 0 && question.options[selectedIndex]?.isCorrect;
      if (isCorrect) correct++;

      return {
        questionId: question._id,
        text: question.text,
        selectedOption: selectedIndex,
        correctOption: question.options.findIndex(o => o.isCorrect),
        isCorrect,
        explanation: question.explanation,
        points: question.points
      };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = results.filter(r => r.isCorrect).reduce((sum, r, i) => sum + quiz.questions[i]?.points || 10, 0);
    const percentage = Math.round((correct / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    // Award XP if logged in
    if (req.user) {
      const xpEarned = passed ? quiz.xpReward : Math.floor(quiz.xpReward * 0.3);
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          xp: xpEarned,
          quizzesCompleted: 1,
          correctAnswers: correct,
          totalAnswers: quiz.questions.length
        }
      });
    }

    res.json({
      success: true,
      results,
      score: correct,
      total: quiz.questions.length,
      percentage,
      passed,
      xpEarned: passed ? quiz.xpReward : Math.floor(quiz.xpReward * 0.3)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطأ في إرسال الإجابات' });
  }
};

// @POST /api/quizzes (admin)
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الاختبار' });
  }
};
