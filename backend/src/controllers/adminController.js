const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const Reward = require('../models/Reward');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalLessons, totalQuizzes, totalRewards, newUsersToday, activeUsers] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Quiz.countDocuments(),
      Reward.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
      User.countDocuments({ lastActiveDate: { $gte: new Date(Date.now() - 7 * 86400000) } })
    ]);
    const topCourses = await Course.find().select('titleAr totalStudents category rating').sort({ totalStudents: -1 }).limit(5);
    const recentUsers = await User.find().select('name email role wilaya createdAt xp').sort({ createdAt: -1 }).limit(8);
    const quizStats = await Quiz.aggregate([{ $group: { _id: '$subject', count: { $sum: 1 }, totalAttempts: { $sum: '$attempts' } } }, { $sort: { count: -1 } }]);
    res.json({ success: true, stats: { totalUsers, totalCourses, totalLessons, totalQuizzes, totalRewards, newUsersToday, activeUsers }, topCourses, recentUsers, quizStats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, wilaya } = req.query;
    const query = {};
    if (role) query.role = role;
    if (wilaya) query.wilaya = wilaya;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, total, page: +page, pages: Math.ceil(total / limit), users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, wilaya, xp, streak } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;
    if (wilaya !== undefined) update.wilaya = wilaya;
    if (xp !== undefined) update.xp = xp;
    if (streak !== undefined) update.streak = streak;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) return res.status(400).json({ success: false, message: 'لا يمكنك حذف حسابك الخاص' });
    await User.findByIdAndDelete(req.params.id);
    await Progress.deleteMany({ user: req.params.id });
    res.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [{ titleAr: { $regex: search, $options: 'i' } }, { descriptionAr: { $regex: search, $options: 'i' } }];
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query).populate('instructor', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, total, pages: Math.ceil(total / limit), courses });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user.id });
    res.status(201).json({ success: true, course });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('instructor', 'name');
    if (!course) return res.status(404).json({ success: false, message: 'الكورس غير موجود' });
    res.json({ success: true, course });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    await Lesson.deleteMany({ course: req.params.id });
    await Progress.deleteMany({ course: req.params.id });
    res.json({ success: true, message: 'تم حذف الكورس وجميع دروسه' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { course: courseId } : {};
    const lessons = await Lesson.find(query).populate('course', 'titleAr').sort({ course: 1, order: 1 });
    res.json({ success: true, lessons });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    await Course.findByIdAndUpdate(req.body.course, { $inc: { totalLessons: 1 } });
    res.status(201).json({ success: true, lesson });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'الدرس غير موجود' });
    res.json({ success: true, lesson });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (lesson) await Course.findByIdAndUpdate(lesson.course, { $inc: { totalLessons: -1 } });
    res.json({ success: true, message: 'تم حذف الدرس' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, subject } = req.query;
    const query = {};
    if (subject && subject !== 'all') query.subject = subject;
    if (search) query.titleAr = { $regex: search, $options: 'i' };
    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, total, pages: Math.ceil(total / limit), quizzes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, quiz });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'الاختبار غير موجود' });
    res.json({ success: true, quiz });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الاختبار' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, rewards });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createReward = async (req, res) => {
  try {
    const reward = await Reward.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, reward });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) return res.status(404).json({ success: false, message: 'المكافأة غير موجودة' });
    res.json({ success: true, reward });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteReward = async (req, res) => {
  try {
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف المكافأة' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.grantRewardToUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'المكافأة غير موجودة' });
    if (reward.claimedBy.includes(userId)) return res.status(400).json({ success: false, message: 'المستخدم حصل على هذه المكافأة مسبقاً' });
    reward.claimedBy.push(userId);
    reward.totalClaimed += 1;
    await reward.save();
    await User.findByIdAndUpdate(userId, { $addToSet: { badges: reward.icon + ' ' + reward.title } });
    res.json({ success: true, message: 'تم منح المكافأة للمستخدم' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
