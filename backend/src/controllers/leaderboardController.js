const User = require('../models/User');

// @GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', wilaya } = req.query;
    const query = { role: 'student', isActive: true };
    if (wilaya) query.wilaya = wilaya;

    const users = await User.find(query)
      .select('name avatar wilaya xp streak coursesCompleted quizzesCompleted correctAnswers totalAnswers')
      .sort({ xp: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      name: u.name,
      avatar: u.avatar,
      wilaya: u.wilaya,
      xp: u.xp,
      streak: u.streak,
      coursesCompleted: u.coursesCompleted,
      accuracy: u.totalAnswers > 0 ? Math.round((u.correctAnswers / u.totalAnswers) * 100) : 0,
      level: u.getLevel()
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الترتيب' });
  }
};

// @GET /api/leaderboard/wilayas
exports.getWilayaLeaderboard = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: 'student', wilaya: { $ne: null } } },
      { $group: {
        _id: '$wilaya',
        totalXP: { $sum: '$xp' },
        students: { $sum: 1 },
        avgXP: { $avg: '$xp' }
      }},
      { $sort: { totalXP: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, leaderboard: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب ترتيب الولايات' });
  }
};
