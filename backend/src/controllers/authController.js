const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const userPayload = (user) => {
  const levelInfo = user.getLevel();
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    wilaya: user.wilaya,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    badges: user.badges,
    levelInfo,
    coursesCompleted: user.coursesCompleted,
    quizzesCompleted: user.quizzesCompleted,
    correctAnswers: user.correctAnswers,
    totalAnswers: user.totalAnswers,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({ success: true, token, user: userPayload(user) });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, email, password, wilaya, level } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });

    const user = await User.create({ name, email, password, wilaya, level, isVerified: true });
    sendTokenResponse(user, 201, res);
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الحساب: ' + e.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'يرجى إدخال البريد وكلمة المرور' });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    if (user.isActive === false)
      return res.status(403).json({ success: false, message: 'الحساب موقوف، تواصل مع الإدارة' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    // Update streak
    const today     = new Date().toDateString();
    const lastActive = user.lastActiveDate ? user.lastActiveDate.toDateString() : null;
    const yesterday  = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) user.streak += 1;
    else if (lastActive !== today) user.streak = 1;
    user.lastActiveDate = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: 'خطأ في تسجيل الدخول' });
  }
};

// GET /api/auth/me  — always fresh from DB
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    res.json({ success: true, user: userPayload(user) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { name, wilaya, level, notifications, avatar } = req.body;
  const update = {};
  if (name)  update.name  = name;
  if (wilaya) update.wilaya = wilaya;
  if (level)  update.level  = level;
  if (avatar) update.avatar = avatar;
  if (notifications !== undefined) update.notifications = notifications;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    res.json({ success: true, user: userPayload(user) });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث البيانات' });
  }
};
