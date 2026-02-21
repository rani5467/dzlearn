const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');

// @GET /api/progress/my
exports.getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
      .populate('course', 'titleAr thumbnail category totalLessons')
      .sort({ lastAccessedAt: -1 });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب تقدمك' });
  }
};

// @POST /api/progress/lesson-complete
exports.completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent } = req.body;

    let progress = await Progress.findOne({ user: req.user.id, course: courseId });
    if (!progress) {
      progress = await Progress.create({ user: req.user.id, course: courseId });
    }

    // Add lesson if not already completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    progress.timeSpent += (timeSpent || 0);
    progress.lastAccessedAt = new Date();

    // Calculate percentage
    const course = await Course.findById(courseId);
    if (course) {
      progress.percentage = Math.round((progress.completedLessons.length / course.totalLessons) * 100);
      if (progress.percentage >= 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { coursesCompleted: 1, xp: course.xpReward || 50 }
        });
      }
    }

    await progress.save();

    // Add XP for lesson
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { xp: 10, totalTimeSpent: timeSpent || 0 }
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تسجيل التقدم' });
  }
};
