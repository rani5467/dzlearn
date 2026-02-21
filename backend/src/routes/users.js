const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const levelInfo = user.getLevel();
    const accuracy = user.totalAnswers > 0
      ? Math.round((user.correctAnswers / user.totalAnswers) * 100) : 0;

    res.json({
      success: true,
      stats: {
        xp: user.xp,
        streak: user.streak,
        coursesCompleted: user.coursesCompleted,
        quizzesCompleted: user.quizzesCompleted,
        accuracy,
        totalTimeSpent: user.totalTimeSpent,
        badges: user.badges,
        levelInfo
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الإحصائيات' });
  }
});

module.exports = router;
