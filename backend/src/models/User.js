const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    minlength: [2, 'الاسم يجب أن يكون على الأقل حرفين'],
    maxlength: [50, 'الاسم لا يمكن أن يتجاوز 50 حرف']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'بريد إلكتروني غير صالح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  wilaya: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: ['bem', 'bac', 'university', 'professional'],
    default: 'bac'
  },
  // Gamification
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  badges: [{ type: String }],
  // Stats
  coursesCompleted: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // minutes
  quizzesCompleted: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalAnswers: { type: Number, default: 0 },
  // Settings
  notifications: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get XP level
userSchema.methods.getLevel = function() {
  if (this.xp < 100) return { level: 1, title: 'مبتدئ' };
  if (this.xp < 300) return { level: 2, title: 'متعلم' };
  if (this.xp < 600) return { level: 3, title: 'متقدم' };
  if (this.xp < 1000) return { level: 4, title: 'محترف' };
  if (this.xp < 2000) return { level: 5, title: 'خبير' };
  return { level: 6, title: 'أسطورة' };
};

module.exports = mongoose.model('User', userSchema);
