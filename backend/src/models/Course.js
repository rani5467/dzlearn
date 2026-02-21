const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleAr: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  descriptionAr: { type: String, required: true },
  thumbnail: { type: String, default: null },
  category: {
    type: String,
    required: true,
    enum: ['math', 'physics', 'chemistry', 'arabic', 'french', 'english', 'history', 'biology', 'philosophy', 'islamic', 'informatics']
  },
  level: {
    type: String,
    required: true,
    enum: ['bem', 'bac_science', 'bac_literature', 'bac_math', 'university', 'all']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalStudents: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // minutes
  rating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  xpReward: { type: Number, default: 50 }
}, {
  timestamps: true
});

courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isPublished: 1, isFeatured: 1 });

module.exports = mongoose.model('Course', courseSchema);
